import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Check, ShieldAlert, DollarSign, Play, Clock, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const statusLabels: Record<string, string> = {
  new: 'Новый',
  accepted: 'Принят',
  diagnosing: 'Диагностика',
  awaiting_approval: 'Ждёт одобрения',
  approved: 'Одобрен',
  in_repair: 'В ремонте',
  completed: 'Завершён',
  issued: 'Выдан',
  cancelled: 'Отменён',
};

const getStatusLabel = (status: string) => statusLabels[status] || status;

export default function StaffOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [masters, setMasters] = useState<any[]>([]);
  const [allowedTransitions, setAllowedTransitions] = useState<string[]>([]);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [updating, setUpdating] = useState(false);

  const fetchOrderDetails = async () => {
    try {
      const [orderRes, transitionsRes, mastersRes] = await Promise.all([
        api.get(`/orders/${id}`),
        api.get(`/orders/${id}/allowed-transitions`),
        api.get('/users/masters')
      ]);
      const o = orderRes.data?.data || orderRes.data;
      setOrder(o);
      setAllowedTransitions(transitionsRes.data?.transitions || []);
      setMasters(mastersRes.data?.data || mastersRes.data || []);
      
      // Prefill prices
      const initialPrices: Record<string, number> = {};
      o.details?.forEach((d: any) => {
        initialPrices[d.id] = Number(d.price_uzs || d.price || 0);
      });
      setPrices(initialPrices);
    } catch (err) {
      console.error(err);
      toast.error('Не удалось загрузить данные заказа');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!confirm(`Вы уверены, что хотите перевести заказ в статус «${getStatusLabel(newStatus)}»?`)) return;
    setUpdating(true);
    try {
      await api.patch(`/orders/${id}`, { status: newStatus });
      toast.success('Статус заказа успешно обновлен');
      await fetchOrderDetails();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleAssignMaster = async (detailId: string, masterId: string) => {
    setUpdating(true);
    try {
      await api.post(`/orders/${id}/details/${detailId}/assign`, { master_id: masterId });
      toast.success('Мастер успешно назначен');
      await fetchOrderDetails();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handlePriceChange = (detailId: string, val: string) => {
    const num = Number(val) || 0;
    setPrices(prev => ({ ...prev, [detailId]: num }));
  };

  const handleSavePrices = async () => {
    setUpdating(true);
    try {
      const detailsPayload = Object.entries(prices).map(([detailId, price]) => ({
        detail_id: detailId,
        price
      }));
      
      const statusForUpdatePrice = ['in_repair', 'ready_for_pickup', 'issued'];
      const endpoint = statusForUpdatePrice.includes(String(order?.status)) ? '/update-price' : '/set-price';

      await api.post(`/orders/${id}${endpoint}`, { details: detailsPayload });
      toast.success('Цены успешно сохранены');
      await fetchOrderDetails();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleCloseOrder = async () => {
    if (!confirm('Вы уверены, что хотите выдать прибор и закрыть заказ?')) return;
    setUpdating(true);
    try {
      await api.post(`/orders/${id}/close`);
      toast.success('Заказ успешно закрыт и выдан');
      await fetchOrderDetails();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Загрузка...</div>;
  if (!order) return <div style={{ padding: '2rem', textAlign: 'center' }}>Заказ не найден</div>;

  const currentPrice = Number(order.total_price_uzs) || 0;
  const paidAmount = Number(order.total_paid_uzs) || 0;
  const isAwaitingApproval = order.status === 'awaiting_approval' || (!order.price_approved_at && currentPrice > 0);
  const isClient = user?.role === 'client';

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/staff/orders')} className="btn-icon">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold" style={{ margin: 0 }}>
            Заказ #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <div className="text-sm text-secondary">
            Создан: {new Date(order.order_date).toLocaleString()}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left Side: Order Info & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Status & Actions Box */}
          <div className="card">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-brand">
              <Clock size={20} />
              Состояние и Управление
            </h3>
            <div className="mb-4">
              <span className="text-secondary">Статус: </span>
              <span className={`badge badge-${order.status}`}>{getStatusLabel(order.status)}</span>
            </div>
            
            {order.price_approved_at && (
              <div className="mb-4 flex items-center gap-2" style={{ color: 'var(--success-text)', fontSize: '0.9rem' }}>
                ✓ Цена одобрена клиентом ({new Date(order.price_approved_at).toLocaleDateString()})
              </div>
            )}

            {isAwaitingApproval && (
              <div className="mb-4 flex items-center gap-2" style={{ color: 'var(--warning-text)', fontSize: '0.9rem' }}>
                <ShieldAlert size={16} />
                Ожидает одобрения цены клиентом
              </div>
            )}

            {/* Admin/operator can approve price on behalf of client */}
            {isAwaitingApproval && !isClient && (user?.role === 'admin' || user?.role === 'operator') && (
              <div style={{ marginBottom: '1rem' }}>
                <button
                  onClick={async () => {
                    if (!confirm('Одобрить цену за клиента? Заказ перейдёт в статус «Одобрен».')) return;
                    setUpdating(true);
                    try {
                      await api.post(`/orders/${id}/approve-price`);
                      toast.success('Цена одобрена за клиента');
                      await fetchOrderDetails();
                    } catch (err) {
                      console.error(err);
                    } finally {
                      setUpdating(false);
                    }
                  }}
                  disabled={updating}
                  className="btn btn-primary"
                  style={{ backgroundColor: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Check size={16} />
                  Одобрить цену за клиента
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-2 mt-4">
              {allowedTransitions.map(st => (
                <button 
                  key={st} 
                  onClick={() => handleStatusChange(st)}
                  disabled={updating}
                  className="btn btn-primary"
                >
                  <Play size={16} />
                  В «{getStatusLabel(st)}»
                </button>
              ))}
              
              {order.status === 'completed' && paidAmount >= currentPrice && (
                <button 
                  onClick={handleCloseOrder}
                  disabled={updating}
                  className="btn btn-primary"
                  style={{ backgroundColor: 'var(--success)' }}
                >
                  <Check size={16} />
                  Выдать и закрыть
                </button>
              )}

              {/* Delete order — admin only */}
              {user?.role === 'admin' && (
                <button
                  onClick={async () => {
                    if (!confirm(`Удалить заказ #${order.id.slice(0, 8).toUpperCase()}? Это действие нельзя отменить.`)) return;
                    setUpdating(true);
                    try {
                      await api.delete(`/orders/${id}`);
                      toast.success('Заказ удалён');
                      navigate('/staff/orders');
                    } catch (err) {
                      console.error(err);
                    } finally {
                      setUpdating(false);
                    }
                  }}
                  disabled={updating}
                  className="btn"
                  style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Trash2 size={16} />
                  Удалить заказ
                </button>
              )}
            </div>
          </div>

          {/* Client Info */}
          <div className="card">
            <h3 className="font-bold mb-4 text-brand">👤 Клиент</h3>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <div><strong>ФИО:</strong> {order.client?.full_name}</div>
              <div><strong>Телефон:</strong> {order.client?.phone}</div>
              {order.client?.email && <div><strong>Email:</strong> {order.client?.email}</div>}
              {order.client?.telegram_chat_id && (
                <div style={{ color: 'var(--success-text)' }}>✓ Подключен Telegram</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Services and Prices Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="font-bold text-brand" style={{ margin: 0 }}>⚙ Услуги и Оборудование</h3>
              {(user?.role === 'admin' || user?.role === 'operator' || user?.role === 'master') && (
                <button 
                  onClick={handleSavePrices}
                  disabled={updating}
                  className="btn btn-primary"
                  style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}
                >
                  <DollarSign size={16} />
                  Сохранить цены
                </button>
              )}
            </div>

            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Оборудование</th>
                    <th>Услуга / Проблема</th>
                    <th>Мастер</th>
                    <th style={{ width: '150px' }}>Цена (UZS)</th>
                  </tr>
                </thead>
                <tbody>
                  {order.details?.map((detail: any) => (
                    <tr key={detail.id}>
                      <td>
                        <div className="font-bold">{detail.equipment?.name_rus}</div>
                        <div className="text-secondary" style={{ fontSize: '0.8rem' }}>S/N: {detail.serial_number || '-'}</div>
                      </td>
                      <td>
                        <div>{detail.service?.name_rus || 'Диагностика'}</div>
                        <div className="text-secondary" style={{ fontSize: '0.8rem' }}>{detail.issue?.name_rus}</div>
                      </td>
                      <td>
                        {user?.role === 'admin' || user?.role === 'operator' ? (
                          <select 
                            value={detail.attached_to || ''}
                            onChange={(e) => handleAssignMaster(detail.id, e.target.value)}
                            disabled={updating}
                            className="input-field"
                            style={{ padding: '0.25rem', fontSize: '0.85rem', width: '100%' }}
                          >
                            <option value="">Не назначен</option>
                            {masters.map(m => (
                              <option key={m.id} value={m.id}>{m.full_name}</option>
                            ))}
                          </select>
                        ) : (
                          detail.master?.full_name || 'Не назначен'
                        )}
                      </td>
                      <td>
                        <input 
                          type="number"
                          value={prices[detail.id] ?? 0}
                          onChange={(e) => handlePriceChange(detail.id, e.target.value)}
                          className="input-field"
                          style={{ padding: '0.25rem', width: '100%', textAlign: 'right' }}
                          disabled={updating || isClient}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '2rem' }}>
              <div className="text-right">
                <span className="text-secondary">Итого к оплате:</span>
                <div className="text-2xl font-bold text-brand">
                  {currentPrice.toLocaleString()} UZS
                </div>
              </div>
              <div className="text-right">
                <span className="text-secondary">Оплачено:</span>
                <div className="text-2xl font-bold" style={{ color: paidAmount >= currentPrice ? 'var(--success)' : 'var(--text-primary)' }}>
                  {paidAmount.toLocaleString()} UZS
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
