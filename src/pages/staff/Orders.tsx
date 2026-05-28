import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { DataTable } from '../../components/DataTable';

export default function StaffOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders/list');
        setOrders(data.data || data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, []);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'new': return <span className="badge badge-new">Новый</span>;
      case 'diagnosing': return <span className="badge badge-diagnosing">Диагностика</span>;
      case 'awaiting_approval': return <span className="badge badge-awaiting_approval">Ждет одобрения</span>;
      case 'approved': return <span className="badge badge-approved">Одобрен</span>;
      case 'in_repair': return <span className="badge badge-in_repair">В ремонте</span>;
      case 'completed': return <span className="badge badge-completed">Завершен</span>;
      case 'issued': return <span className="badge badge-issued">Выдан</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  const columns = [
    { 
      key: 'order_number', 
      title: 'ID', 
      render: (item: any) => <span className="font-bold" style={{ fontFamily: 'monospace' }}>{item.order_number ? String(item.order_number).padStart(7, '0') : '#' + item.id.slice(0, 6).toUpperCase()}</span> 
    },
    { 
      key: 'order_date', 
      title: 'Дата', 
      render: (item: any) => new Date(item.order_date).toLocaleDateString() 
    },
    { 
      key: 'client', 
      title: 'Клиент', 
      render: (item: any) => (
        <div>
          <div className="font-bold">{item.client?.full_name}</div>
          <div className="text-secondary" style={{ fontSize: '0.8rem' }}>{item.client?.phone}</div>
        </div>
      )
    },
    {
      key: 'equipment',
      title: 'Оборудование',
      render: (item: any) => item.details?.[0]?.equipment?.name_rus || 'Не указано'
    },
    {
      key: 'issue',
      title: 'Неисправность',
      render: (item: any) => item.details?.[0]?.issue?.name_rus || 'Не указано'
    },
    {
      key: 'master',
      title: 'Мастер',
      render: (item: any) => item.details?.[0]?.master?.full_name || <span className="text-tertiary">Не назначен</span>
    },
    {
      key: 'status',
      title: 'Статус',
      render: (item: any) => getStatusBadge(item.status)
    },
    {
      key: 'price',
      title: 'Цена (UZS)',
      render: (item: any) => Number(item.total_price_uzs) > 0 ? <span className="font-bold text-brand">{Number(item.total_price_uzs).toLocaleString()}</span> : '-'
    }
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Заказы</h1>
          <p className="page-description">Управление заказами (Excel-вид)</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/staff/orders/new')}>
          Создать заказ
        </button>
      </div>

      {loading ? (
        <div>Загрузка данных...</div>
      ) : (
        <DataTable 
          data={orders} 
          columns={columns} 
          onRowClick={(item) => navigate(`/staff/orders/${item.id}`)}
        />
      )}
    </div>
  );
}
