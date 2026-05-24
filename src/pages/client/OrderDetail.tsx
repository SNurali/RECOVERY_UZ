import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, X, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import api from '../../lib/api';
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

const timelineSteps = [
  { key: 'new', label: 'Приём' },
  { key: 'diagnosing', label: 'Диагностика' },
  { key: 'awaiting_approval', label: 'Цена' },
  { key: 'in_repair', label: 'Ремонт' },
  { key: 'completed', label: 'Готов' },
];

const statusOrder = ['new', 'accepted', 'diagnosing', 'awaiting_approval', 'approved', 'in_repair', 'completed', 'issued'];

export default function ClientOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchOrder = async () => {
    try {
      const { data } = await api.get(`/orders/${id}`);
      setOrder(data.data || data);
    } catch (err) {
      console.error(err);
      toast.error('Не удалось загрузить данные заказа');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrder(); }, [id]);

  const handleApprovePrice = async () => {
    if (!confirm('Вы одобряете указанную стоимость ремонта?')) return;
    setUpdating(true);
    try {
      await api.post(`/orders/${id}/approve-price`);
      toast.success('Цена успешно одобрена. Мастер приступает к ремонту.');
      await fetchOrder();
    } catch (err) { console.error(err); }
    finally { setUpdating(false); }
  };

  const handleRejectPrice = async () => {
    const reason = prompt('Укажите причину отказа:');
    if (reason === null) return;
    setUpdating(true);
    try {
      await api.post(`/orders/${id}/reject-price`, { reason });
      toast.success('Отказ зафиксирован.');
      await fetchOrder();
    } catch (err) { console.error(err); }
    finally { setUpdating(false); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>Загрузка...</div>;
  if (!order) return <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>Заказ не найден</div>;

  const currentPrice = Number(order.total_price_uzs) || 0;
  const isAwaitingApproval = !order.price_approved_at && !order.price_rejected_at && currentPrice > 0;
  const currentIdx = statusOrder.indexOf(order.status);

  const getStepState = (stepKey: string) => {
    const stepIdx = statusOrder.indexOf(stepKey);
    if (stepIdx < 0) return 'pending';
    if (currentIdx > stepIdx) return 'completed';
    if (currentIdx === stepIdx) return 'active';
    // special: approved counts as awaiting_approval completed
    if (stepKey === 'awaiting_approval' && statusOrder.indexOf(order.status) > statusOrder.indexOf('awaiting_approval')) return 'completed';
    return 'pending';
  };

  return (
    <div>
      {/* Back */}
      <button
        onClick={() => navigate('/client')}
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '1.5rem', fontSize: '0.9rem' }}
      >
        <ArrowLeft size={18} />
        Назад к заказам
      </button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '1.5rem' }}
      >
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.25rem' }}>
          Заказ #{order.id.slice(0, 8).toUpperCase()}
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
          от {new Date(order.order_date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </motion.div>

      {/* Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ background: 'rgba(30,41,59,0.5)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '2rem', marginBottom: '1.5rem' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          {timelineSteps.map((step, idx) => {
            const state = getStepState(step.key);
            const dotColor = state === 'completed' ? '#10b981' : state === 'active' ? '#0ea5e9' : '#334155';
            const dotBorder = state === 'active' ? '3px solid rgba(14,165,233,0.3)' : 'none';

            return (
              <div key={step.key} style={{ display: 'flex', alignItems: 'center', flex: idx < timelineSteps.length - 1 ? 1 : 'none' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: dotColor, display: 'flex', alignItems: 'center', justifyContent: 'center', border: dotBorder, transition: 'all 0.3s' }}>
                    {state === 'completed' && <Check size={14} color="white" />}
                    {state === 'active' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white' }} />}
                  </div>
                  <span style={{ fontSize: '0.7rem', color: state === 'pending' ? '#475569' : '#cbd5e1', fontWeight: state === 'active' ? 700 : 500, whiteSpace: 'nowrap' }}>
                    {step.label}
                  </span>
                </div>
                {idx < timelineSteps.length - 1 && (
                  <div style={{ flex: 1, height: '2px', margin: '0 0.5rem', marginBottom: '1.2rem', background: state === 'completed' ? '#10b981' : '#334155', borderRadius: '1px' }} />
                )}
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
          <Clock size={14} style={{ color: '#64748b' }} />
          <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
            Текущий статус: <strong style={{ color: '#f1f5f9' }}>{statusLabels[order.status] || order.status}</strong>
          </span>
        </div>
      </motion.div>

      {/* Price Approval */}
      {isAwaitingApproval && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '20px', padding: '2rem', marginBottom: '1.5rem' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <AlertTriangle size={24} style={{ color: '#fbbf24' }} />
            <div>
              <h4 style={{ fontWeight: 700, color: '#f8fafc', fontSize: '1rem' }}>Требуется согласование</h4>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Подтвердите стоимость ремонта</p>
            </div>
          </div>

          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', textAlign: 'center', margin: '1.5rem 0' }}>
            {currentPrice.toLocaleString()} UZS
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={handleApprovePrice}
              disabled={updating}
              style={{ flex: 1, padding: '0.85rem', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: updating ? 0.6 : 1 }}
            >
              <Check size={18} />
              Подтвердить
            </button>
            <button
              onClick={handleRejectPrice}
              disabled={updating}
              style={{ flex: 1, padding: '0.85rem', borderRadius: '12px', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', color: '#f87171', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: updating ? 0.6 : 1 }}
            >
              <X size={18} />
              Отказаться
            </button>
          </div>
        </motion.div>
      )}

      {/* Price Approved */}
      {order.price_approved_at && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '20px', padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}
        >
          <CheckCircle size={28} style={{ color: '#10b981' }} />
          <div>
            <h4 style={{ fontWeight: 700, color: '#6ee7b7', fontSize: '1rem' }}>Цена согласована</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Стоимость: {currentPrice.toLocaleString()} UZS</p>
          </div>
        </motion.div>
      )}

      {/* Device Details */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{ background: 'rgba(30,41,59,0.5)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '2rem' }}
      >
        <h3 style={{ fontWeight: 700, color: '#f8fafc', marginBottom: '1.25rem', fontSize: '1.1rem' }}>Детали устройства</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {order.details?.map((detail: any) => (
            <div key={detail.id} style={{ paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Оборудование</span>
                <span style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.9rem' }}>{detail.equipment?.name_rus}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Неисправность</span>
                <span style={{ color: '#f1f5f9', fontWeight: 500, fontSize: '0.9rem' }}>{detail.issue?.name_rus}</span>
              </div>
              {detail.serial_number && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Серийный номер</span>
                  <span style={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: '0.85rem' }}>{detail.serial_number}</span>
                </div>
              )}
              {detail.master && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                  <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Мастер</span>
                  <span style={{ color: '#0ea5e9', fontWeight: 500, fontSize: '0.9rem' }}>{detail.master.full_name}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
