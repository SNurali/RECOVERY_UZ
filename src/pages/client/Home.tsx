import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Package, ChevronRight, Wrench, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useI18n } from '../../i18n/provider';
import { motion } from 'framer-motion';

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

const statusColors: Record<string, { bg: string; color: string; border: string }> = {
  new: { bg: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: 'rgba(99,102,241,0.3)' },
  diagnosing: { bg: 'rgba(6,182,212,0.15)', color: '#67e8f9', border: 'rgba(6,182,212,0.3)' },
  awaiting_approval: { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: 'rgba(245,158,11,0.3)' },
  approved: { bg: 'rgba(16,185,129,0.15)', color: '#6ee7b7', border: 'rgba(16,185,129,0.3)' },
  in_repair: { bg: 'rgba(234,179,8,0.15)', color: '#fde047', border: 'rgba(234,179,8,0.3)' },
  completed: { bg: 'rgba(16,185,129,0.15)', color: '#6ee7b7', border: 'rgba(16,185,129,0.3)' },
  issued: { bg: 'rgba(16,185,129,0.2)', color: '#34d399', border: 'rgba(16,185,129,0.4)' },
};

export default function ClientHome() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useI18n();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders/list');
        setOrders(data.data || data || []);
      } catch (err) {
        console.error(err);
        toast.error(t('errors.networkError'));
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [t]);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.25rem' }}>Мои заказы</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>История ваших обращений в сервис</p>
        </div>
        <button
          onClick={() => navigate('/client/new-order')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', color: 'white', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', boxShadow: '0 8px 20px rgba(14,165,233,0.25)', transition: 'transform 0.15s' }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <Plus size={18} />
          Новый заказ
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>Загрузка...</div>
      ) : orders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ background: 'rgba(30,41,59,0.5)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '4rem 2rem', textAlign: 'center' }}
        >
          <Package size={48} style={{ color: '#475569', margin: '0 auto 1rem' }} />
          <p style={{ color: '#94a3b8', marginBottom: '1.5rem', fontSize: '1rem' }}>У вас пока нет заказов</p>
          <button
            onClick={() => navigate('/client/new-order')}
            style={{ padding: '0.75rem 2rem', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', color: 'white', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}
          >
            Создать первый заказ
          </button>
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {orders.map((order, idx) => {
            const currentPrice = Number(order.total_price_uzs) || 0;
            const isAwaitingApproval = !order.price_approved_at && !order.price_rejected_at && currentPrice > 0;
            const sc = statusColors[order.status] || { bg: 'rgba(100,116,139,0.15)', color: '#94a3b8', border: 'rgba(100,116,139,0.3)' };

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => navigate(`/client/orders/${order.id}`)}
                style={{ background: 'rgba(30,41,59,0.5)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.25rem 1.5rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', transition: 'all 0.2s' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(14,165,233,0.3)'; (e.currentTarget as HTMLElement).style.background = 'rgba(30,41,59,0.7)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLElement).style.background = 'rgba(30,41,59,0.5)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Package size={20} style={{ color: '#0ea5e9' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: '#f1f5f9' }}>#{order.id.slice(0, 8).toUpperCase()}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {order.details?.[0]?.equipment?.name_rus || 'Оборудование'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ display: 'inline-block', padding: '0.3rem 0.7rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 600, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                      {statusLabels[order.status] || order.status}
                    </span>
                    {isAwaitingApproval && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.35rem', justifyContent: 'flex-end' }}>
                        <Wrench size={11} style={{ color: '#fbbf24' }} />
                        <span style={{ fontSize: '0.7rem', color: '#fbbf24', fontWeight: 600 }}>Ждёт одобрения</span>
                      </div>
                    )}
                  </div>
                  <ChevronRight size={18} style={{ color: '#475569' }} />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
