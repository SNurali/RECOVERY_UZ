import { useEffect, useState, useCallback } from 'react';
import { Package, Activity, CheckCircle, X, Clock, Check, Play, Trash2, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { useI18n } from '../../i18n/provider';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';

interface OrderDetail {
  id: string;
  order_number: number | null;
  order_date: string;
  status: string;
  price_approved_at: string | null;
  price_rejected_at: string | null;
  rejection_reason: string | null;
  total_price_uzs: number;
  total_paid_uzs: number;
  guest_name: string | null;
  guest_phone: string | null;
  client?: { id: string; full_name: string; phone: string; email?: string; telegram_chat_id?: string };
  details?: Array<{
    id: string;
    serial_number?: string;
    price_uzs: number;
    attached_to?: string;
    equipment?: { id: string; name_rus: string };
    issue?: { id: string; name_rus: string };
    service?: { id: string; name_rus: string };
    master?: { id: string; full_name: string; phone?: string };
  }>;
}

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

function formatOrderNumber(num: number | null): string {
  if (!num) return '—';
  return String(num).padStart(7, '0');
}

export default function StaffDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<OrderDetail[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [masters, setMasters] = useState<any[]>([]);
  const [allowedTransitions, setAllowedTransitions] = useState<string[]>([]);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [updating, setUpdating] = useState(false);
  const { t } = useI18n();
  const { user } = useAuth();

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, ordersRes, mastersRes] = await Promise.all([
        api.get('/orders/stats'),
        api.get('/orders/list'),
        api.get('/users/masters'),
      ]);
      setStats(statsRes.data.data || statsRes.data);
      setOrders(ordersRes.data.data || ordersRes.data || []);
      setMasters(mastersRes.data?.data || mastersRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error(t('errors.networkError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openOrderModal = async (order: OrderDetail) => {
    setSelectedOrder(order);
    // Prefill prices
    const initialPrices: Record<string, number> = {};
    order.details?.forEach((d) => {
      initialPrices[d.id] = Number(d.price_uzs || 0);
    });
    setPrices(initialPrices);
    // Fetch allowed transitions
    try {
      const res = await api.get(`/orders/${order.id}/allowed-transitions`);
      setAllowedTransitions(res.data?.transitions || []);
    } catch {
      setAllowedTransitions([]);
    }
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setAllowedTransitions([]);
    setPrices({});
  };

  const refreshOrder = async (orderId: string) => {
    try {
      const [orderRes, transitionsRes] = await Promise.all([
        api.get(`/orders/${orderId}`),
        api.get(`/orders/${orderId}/allowed-transitions`),
      ]);
      const updated = orderRes.data?.data || orderRes.data;
      setSelectedOrder(updated);
      setAllowedTransitions(transitionsRes.data?.transitions || []);
      // Update in list
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      // Refresh prices
      const newPrices: Record<string, number> = {};
      updated.details?.forEach((d: any) => {
        newPrices[d.id] = Number(d.price_uzs || 0);
      });
      setPrices(newPrices);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedOrder) return;
    if (!confirm(`Перевести заказ в статус «${getStatusLabel(newStatus)}»?`)) return;
    setUpdating(true);
    try {
      await api.patch(`/orders/${selectedOrder.id}`, { status: newStatus });
      toast.success('Статус обновлён');
      await refreshOrder(selectedOrder.id);
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleAssignMaster = async (detailId: string, masterId: string) => {
    if (!selectedOrder) return;
    setUpdating(true);
    try {
      await api.post(`/orders/${selectedOrder.id}/details/${detailId}/assign`, { master_id: masterId });
      toast.success('Мастер назначен');
      await refreshOrder(selectedOrder.id);
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleSavePrices = async () => {
    if (!selectedOrder) return;
    setUpdating(true);
    try {
      const detailsPayload = Object.entries(prices).map(([detailId, price]) => ({
        detail_id: detailId,
        price,
      }));
      const statusForUpdate = ['in_repair', 'ready_for_pickup', 'issued'];
      const endpoint = statusForUpdate.includes(selectedOrder.status) ? '/update-price' : '/set-price';
      await api.post(`/orders/${selectedOrder.id}${endpoint}`, { details: detailsPayload });
      toast.success('Цены сохранены');
      await refreshOrder(selectedOrder.id);
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleApprovePrice = async () => {
    if (!selectedOrder) return;
    if (!confirm('Одобрить цену за клиента?')) return;
    setUpdating(true);
    try {
      await api.post(`/orders/${selectedOrder.id}/approve-price`);
      toast.success('Цена одобрена');
      await refreshOrder(selectedOrder.id);
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleCloseOrder = async () => {
    if (!selectedOrder) return;
    if (!confirm('Выдать прибор и закрыть заказ?')) return;
    setUpdating(true);
    try {
      await api.post(`/orders/${selectedOrder.id}/close`);
      toast.success('Заказ выдан');
      await refreshOrder(selectedOrder.id);
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!selectedOrder) return;
    if (!confirm(`Удалить заказ #${formatOrderNumber(selectedOrder.order_number)}? Это нельзя отменить.`)) return;
    setUpdating(true);
    try {
      await api.delete(`/orders/${selectedOrder.id}`);
      toast.success('Заказ удалён');
      closeModal();
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div>{t('common.loading')}</div>;

  const currentPrice = selectedOrder ? Number(selectedOrder.total_price_uzs) || 0 : 0;
  const paidAmount = selectedOrder ? Number(selectedOrder.total_paid_uzs) || 0 : 0;
  const isAwaitingApproval = selectedOrder && (selectedOrder.status === 'awaiting_approval' || (!selectedOrder.price_approved_at && currentPrice > 0));

  return (
    <div>
      {/* Stats cards */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t('staff.welcome')}</h1>
        <p className="text-secondary text-sm">{t('staff.statistics')}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
          <div className="w-12 h-12 rounded-full bg-brand-light flex items-center justify-center text-brand">
            <Package size={22} />
          </div>
          <div>
            <div className="text-secondary text-sm">Всего заказов</div>
            <div className="text-2xl font-extrabold">{stats?.total || 0}</div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
          <div className="w-12 h-12 rounded-full bg-warning-light flex items-center justify-center text-warning">
            <Activity size={22} />
          </div>
          <div>
            <div className="text-secondary text-sm">Активные</div>
            <div className="text-2xl font-extrabold">{stats?.in_repair || 0}</div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
          <div className="w-12 h-12 rounded-full bg-success-light flex items-center justify-center text-success">
            <CheckCircle size={22} />
          </div>
          <div>
            <div className="text-secondary text-sm">Завершённые</div>
            <div className="text-2xl font-extrabold">{stats?.completed_today || 0}</div>
          </div>
        </div>
      </div>

      {/* Excel-like table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>📋 Все заказы</h2>
          <span className="text-secondary" style={{ fontSize: '0.85rem' }}>Всего: {orders.length}</span>
        </div>
        <div className="data-table-container" style={{ border: 'none', borderRadius: 0, maxHeight: '65vh', overflowY: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '90px' }}>ID</th>
                <th style={{ width: '100px' }}>Дата</th>
                <th>Клиент</th>
                <th>Оборудование</th>
                <th>Неисправность</th>
                <th>Мастер</th>
                <th style={{ width: '130px' }}>Статус</th>
                <th style={{ width: '120px', textAlign: 'right' }}>Цена (UZS)</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => openOrderModal(order)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>
                    <span className="font-bold" style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      {formatOrderNumber(order.order_number)}
                    </span>
                  </td>
                  <td>{new Date(order.order_date).toLocaleDateString()}</td>
                  <td>
                    <div className="font-bold">{order.client?.full_name || order.guest_name || '—'}</div>
                    <div className="text-secondary" style={{ fontSize: '0.8rem' }}>{order.client?.phone || order.guest_phone || ''}</div>
                  </td>
                  <td>{order.details?.[0]?.equipment?.name_rus || '—'}</td>
                  <td>{order.details?.[0]?.issue?.name_rus || '—'}</td>
                  <td>{order.details?.[0]?.master?.full_name || <span className="text-tertiary">Не назначен</span>}</td>
                  <td><span className={`badge badge-${order.status}`}>{getStatusLabel(order.status)}</span></td>
                  <td style={{ textAlign: 'right' }}>
                    {Number(order.total_price_uzs) > 0
                      ? <span className="font-bold text-brand">{Number(order.total_price_uzs).toLocaleString()}</span>
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal (popup) */}
      {selectedOrder && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div
            style={{
              background: 'var(--bg-primary)', borderRadius: '16px',
              width: '90vw', maxWidth: '900px', maxHeight: '90vh',
              overflow: 'hidden', display: 'flex', flexDirection: 'column',
              boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
              border: '1px solid var(--border-color)',
            }}
          >
            {/* Modal Header */}
            <div style={{
              padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'var(--bg-secondary)',
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>
                  Заказ #{formatOrderNumber(selectedOrder.order_number)}
                </h2>
                <span className="text-secondary" style={{ fontSize: '0.8rem' }}>
                  Создан: {new Date(selectedOrder.order_date).toLocaleString()}
                </span>
              </div>
              <button onClick={closeModal} className="btn-icon" style={{ padding: '0.5rem' }}>
                <X size={22} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* Left: Status & Client */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Status Card */}
                  <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                    <h3 className="font-bold mb-4 flex items-center gap-2 text-brand" style={{ fontSize: '0.95rem' }}>
                      <Clock size={18} /> Состояние и Управление
                    </h3>
                    <div className="mb-4">
                      <span className="text-secondary">Статус: </span>
                      <span className={`badge badge-${selectedOrder.status}`}>{getStatusLabel(selectedOrder.status)}</span>
                    </div>

                    {selectedOrder.price_approved_at && (
                      <div className="mb-4" style={{ color: 'var(--success-text)', fontSize: '0.85rem' }}>
                        ✓ Цена одобрена клиентом ({new Date(selectedOrder.price_approved_at).toLocaleDateString()})
                      </div>
                    )}

                    {isAwaitingApproval && (user?.role === 'admin' || user?.role === 'operator') && (
                      <button onClick={handleApprovePrice} disabled={updating} className="btn btn-primary" style={{ backgroundColor: 'var(--success)', marginBottom: '0.75rem', fontSize: '0.85rem' }}>
                        <Check size={14} /> Одобрить цену за клиента
                      </button>
                    )}

                    <div className="flex flex-wrap gap-2" style={{ marginTop: '0.5rem' }}>
                      {allowedTransitions.map(st => (
                        <button key={st} onClick={() => handleStatusChange(st)} disabled={updating} className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}>
                          <Play size={14} /> В «{getStatusLabel(st)}»
                        </button>
                      ))}

                      {selectedOrder.status === 'completed' && paidAmount >= currentPrice && (
                        <button onClick={handleCloseOrder} disabled={updating} className="btn btn-primary" style={{ backgroundColor: 'var(--success)', fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}>
                          <Check size={14} /> Выдать и закрыть
                        </button>
                      )}
                    </div>

                    {user?.role === 'admin' && (
                      <button onClick={handleDeleteOrder} disabled={updating} className="btn" style={{ marginTop: '0.75rem', backgroundColor: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}>
                        <Trash2 size={14} /> Удалить заказ
                      </button>
                    )}
                  </div>

                  {/* Client Card */}
                  <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                    <h3 className="font-bold mb-4 text-brand" style={{ fontSize: '0.95rem' }}>👤 Клиент</h3>
                    <div style={{ display: 'grid', gap: '0.4rem', fontSize: '0.9rem' }}>
                      <div><strong>ФИО:</strong> {selectedOrder.client?.full_name || selectedOrder.guest_name || '—'}</div>
                      <div><strong>Телефон:</strong> {selectedOrder.client?.phone || selectedOrder.guest_phone || '—'}</div>
                      {selectedOrder.client?.email && <div><strong>Email:</strong> {selectedOrder.client.email}</div>}
                      {selectedOrder.client?.telegram_chat_id && (
                        <div style={{ color: 'var(--success-text)' }}>✓ Подключен Telegram</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Services & Equipment */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
                    <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 className="font-bold text-brand" style={{ margin: 0, fontSize: '0.95rem' }}>⚙ Услуги и Оборудование</h3>
                      {(user?.role === 'admin' || user?.role === 'operator' || user?.role === 'master') && (
                        <button onClick={handleSavePrices} disabled={updating} className="btn btn-primary" style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem' }}>
                          <DollarSign size={14} /> Сохранить цены
                        </button>
                      )}
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                      <table className="data-table" style={{ fontSize: '0.85rem' }}>
                        <thead>
                          <tr>
                            <th>Оборудование</th>
                            <th>Услуга / Проблема</th>
                            <th>Мастер</th>
                            <th style={{ width: '120px' }}>Цена (UZS)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedOrder.details?.map((detail) => (
                            <tr key={detail.id}>
                              <td>
                                <div className="font-bold">{detail.equipment?.name_rus || '—'}</div>
                                <div className="text-secondary" style={{ fontSize: '0.75rem' }}>S/N: {detail.serial_number || '-'}</div>
                              </td>
                              <td>
                                <div>{detail.service?.name_rus || 'Диагностика'}</div>
                                <div className="text-secondary" style={{ fontSize: '0.75rem' }}>{detail.issue?.name_rus || ''}</div>
                              </td>

                              <td>
                                {(user?.role === 'admin' || user?.role === 'operator') ? (
                                  <select
                                    value={detail.attached_to || ''}
                                    onChange={(e) => handleAssignMaster(detail.id, e.target.value)}
                                    disabled={updating}
                                    className="input-field"
                                    style={{ padding: '0.2rem', fontSize: '0.8rem', width: '100%' }}
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
                                  onChange={(e) => setPrices(prev => ({ ...prev, [detail.id]: Number(e.target.value) || 0 }))}
                                  className="input-field"
                                  style={{ padding: '0.2rem', width: '100%', textAlign: 'right', fontSize: '0.85rem' }}
                                  disabled={updating || user?.role === 'client'}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Totals */}
                    <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '1.5rem' }}>
                      <div className="text-right">
                        <span className="text-secondary" style={{ fontSize: '0.8rem' }}>Итого к оплате:</span>
                        <div className="font-bold text-brand" style={{ fontSize: '1.1rem' }}>
                          {currentPrice.toLocaleString()} UZS
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-secondary" style={{ fontSize: '0.8rem' }}>Оплачено:</span>
                        <div className="font-bold" style={{ fontSize: '1.1rem', color: paidAmount >= currentPrice && currentPrice > 0 ? 'var(--success)' : 'var(--text-primary)' }}>
                          {paidAmount.toLocaleString()} UZS
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
