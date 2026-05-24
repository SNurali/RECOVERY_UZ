import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { Package, Activity, CheckCircle, ChevronRight, X } from 'lucide-react';
import { toast } from 'sonner';
import { useI18n } from '../../i18n/provider';

interface OrderDetail {
  id: string;
  order_date: string;
  status: string;
  client?: { full_name: string; phone: string };
  details?: Array<{ equipment?: { name_rus: string }; issue?: { name_rus: string }; master?: { full_name: string } }>;
  total_price_uzs?: number;
}

export default function StaffDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<OrderDetail[]>([]);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const { t } = useI18n();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          api.get('/orders/stats'),
          api.get('/orders/list')
        ]);
        setStats(statsRes.data.data || statsRes.data);
        setOrders(ordersRes.data.data || ordersRes.data || []);
      } catch (err) {
        console.error(err);
        toast.error(t('errors.networkError'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [t]);

  const getFilteredOrders = (filter: string): OrderDetail[] => {
    switch (filter) {
      case 'total':
        return orders;
      case 'in_repair':
        return orders.filter(o => o.status === 'in_repair' || o.status === 'diagnosing' || o.status === 'awaiting_approval' || o.status === 'approved');
      case 'completed':
        return orders.filter(o => o.status === 'completed' || o.status === 'issued');
      default:
        return [];
    }
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      new: 'Новый',
      diagnosing: 'Диагностика',
      awaiting_approval: 'Ждёт одобрения',
      approved: 'Одобрен',
      in_repair: 'В ремонте',
      completed: 'Завершён',
      issued: 'Выдан',
    };
    return map[status] || status;
  };

  const handleCardClick = (filter: string) => {
    setExpandedCard(expandedCard === filter ? null : filter);
  };

  if (loading) return <div>{t('common.loading')}</div>;

  const filteredOrders = expandedCard ? getFilteredOrders(expandedCard) : [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t('staff.welcome')}</h1>
        <p className="text-secondary text-sm">{t('staff.statistics')}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        <div
          className="card"
          onClick={() => handleCardClick('total')}
          style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s', border: expandedCard === 'total' ? '2px solid var(--brand)' : undefined }}
        >
          <div className="w-12 h-12 rounded-full bg-brand-light flex items-center justify-center text-brand">
            <Package size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="text-secondary text-sm">{t('common.orders')}</div>
            <div className="text-3xl font-extrabold">{stats?.total || 0}</div>
          </div>
          <ChevronRight size={20} style={{ color: 'var(--text-secondary)', transform: expandedCard === 'total' ? 'rotate(90deg)' : undefined, transition: 'transform 0.2s' }} />
        </div>

        <div
          className="card"
          onClick={() => handleCardClick('in_repair')}
          style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s', border: expandedCard === 'in_repair' ? '2px solid var(--warning)' : undefined }}
        >
          <div className="w-12 h-12 rounded-full bg-warning-light flex items-center justify-center text-warning">
            <Activity size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="text-secondary text-sm">{t('staff.activeOrders')}</div>
            <div className="text-3xl font-extrabold">{stats?.in_repair || 0}</div>
          </div>
          <ChevronRight size={20} style={{ color: 'var(--text-secondary)', transform: expandedCard === 'in_repair' ? 'rotate(90deg)' : undefined, transition: 'transform 0.2s' }} />
        </div>

        <div
          className="card"
          onClick={() => handleCardClick('completed')}
          style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s', border: expandedCard === 'completed' ? '2px solid var(--success)' : undefined }}
        >
          <div className="w-12 h-12 rounded-full bg-success-light flex items-center justify-center text-success">
            <CheckCircle size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="text-secondary text-sm">{t('staff.completedOrders')}</div>
            <div className="text-3xl font-extrabold">{stats?.completed_today || 0}</div>
          </div>
          <ChevronRight size={20} style={{ color: 'var(--text-secondary)', transform: expandedCard === 'completed' ? 'rotate(90deg)' : undefined, transition: 'transform 0.2s' }} />
        </div>
      </div>

      {/* Expanded detail panel */}
      {expandedCard && (
        <div className="card" style={{ marginTop: '1.5rem', animation: 'fadeIn 0.2s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 className="font-bold" style={{ margin: 0 }}>
              {expandedCard === 'total' && `Все заказы (${filteredOrders.length})`}
              {expandedCard === 'in_repair' && `Активные заказы (${filteredOrders.length})`}
              {expandedCard === 'completed' && `Завершённые заказы (${filteredOrders.length})`}
            </h3>
            <button onClick={() => setExpandedCard(null)} className="btn-icon" style={{ padding: '0.25rem' }}>
              <X size={18} />
            </button>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="text-secondary" style={{ textAlign: 'center', padding: '2rem' }}>
              Нет заказов в этой категории
            </div>
          ) : (
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Дата</th>
                    <th>Клиент</th>
                    <th>Оборудование</th>
                    <th>Неисправность</th>
                    <th>Мастер</th>
                    <th>Статус</th>
                    <th>Цена</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => (
                    <tr
                      key={order.id}
                      onClick={() => navigate(`/staff/orders/${order.id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td><span className="font-bold">#{order.id.slice(0, 6).toUpperCase()}</span></td>
                      <td>{new Date(order.order_date).toLocaleDateString()}</td>
                      <td>
                        <div className="font-bold">{order.client?.full_name || '—'}</div>
                        <div className="text-secondary" style={{ fontSize: '0.8rem' }}>{order.client?.phone || ''}</div>
                      </td>
                      <td>{order.details?.[0]?.equipment?.name_rus || '—'}</td>
                      <td>{order.details?.[0]?.issue?.name_rus || '—'}</td>
                      <td>{order.details?.[0]?.master?.full_name || <span className="text-tertiary">Не назначен</span>}</td>
                      <td><span className={`badge badge-${order.status}`}>{getStatusLabel(order.status)}</span></td>
                      <td>{Number(order.total_price_uzs) > 0 ? <span className="font-bold text-brand">{Number(order.total_price_uzs).toLocaleString()}</span> : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
