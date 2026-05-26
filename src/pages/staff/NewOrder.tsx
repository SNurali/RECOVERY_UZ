import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Plus, Trash2, UserPlus } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';

interface OrderItemDraft {
  equipment_id: string;
  issue_id: string;
  serial_number: string;
  notes: string;
}

const EMPTY_DRAFT: OrderItemDraft = { equipment_id: '', issue_id: '', serial_number: '', notes: '' };

export default function StaffNewOrder() {
  const navigate = useNavigate();

  const [clients, setClients] = useState<any[]>([]);
  const [equipments, setEquipments] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [clientId, setClientId] = useState('');
  const [showNewClient, setShowNewClient] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');

  const [items, setItems] = useState<OrderItemDraft[]>([]);
  const [draft, setDraft] = useState<OrderItemDraft>({ ...EMPTY_DRAFT });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [clRes, eqRes, isRes] = await Promise.all([
          api.get('/clients'),
          api.get('/equipments'),
          api.get('/issues'),
        ]);
        setClients(clRes.data?.data || clRes.data || []);
        setEquipments(eqRes.data?.data || eqRes.data || []);
        setIssues(isRes.data?.data || isRes.data || []);
      } catch (err) {
        console.error(err);
        toast.error('Ошибка загрузки данных');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const addDraftToCart = () => {
    if (!draft.equipment_id || !draft.issue_id) {
      toast.error('Выберите оборудование и неисправность');
      return;
    }
    setItems(prev => [...prev, { ...draft }]);
    setDraft({ ...EMPTY_DRAFT });
    toast.success('Устройство добавлено');
  };

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateClient = async () => {
    if (!newClientName || !newClientPhone) {
      toast.error('Введите имя и телефон клиента');
      return;
    }
    try {
      const { data } = await api.post('/clients', {
        full_name: newClientName,
        phone: newClientPhone,
      });
      const newClient = data.data || data;
      setClients(prev => [...prev, newClient]);
      setClientId(newClient.id);
      setShowNewClient(false);
      setNewClientName('');
      setNewClientPhone('');
      toast.success('Клиент создан');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const allItems = [...items];
    if (draft.equipment_id && draft.issue_id) {
      allItems.push({ ...draft });
    }
    if (!allItems.length) {
      toast.error('Добавьте хотя бы одно устройство');
      return;
    }
    if (!clientId) {
      toast.error('Выберите клиента');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/orders', {
        client_id: clientId,
        details: allItems.map(it => ({
          equipment_id: it.equipment_id,
          issue_id: it.issue_id,
          serial_number: it.serial_number || undefined,
          notes: it.notes || undefined,
        })),
      });
      toast.success('Заказ создан');
      navigate('/staff/orders');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem', color: '#94a3b8' }}>Загрузка...</div>;

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => navigate('/staff/orders')}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <ArrowLeft size={18} />
            Назад
          </button>
          <div>
            <h1 className="page-title">Новый заказ</h1>
            <p className="page-description">Создание заказа от имени клиента</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Client selection */}
        <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 600 }}>Клиент</h3>

          {!showNewClient ? (
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                  Выберите клиента *
                </label>
                <select
                  value={clientId}
                  onChange={e => setClientId(e.target.value)}
                  className="input"
                  style={{ width: '100%' }}
                >
                  <option value="">— Выберите —</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.full_name} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => setShowNewClient(true)}
                className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}
              >
                <UserPlus size={16} />
                Новый клиент
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                    ФИО *
                  </label>
                  <input
                    type="text"
                    value={newClientName}
                    onChange={e => setNewClientName(e.target.value)}
                    placeholder="Иванов Иван"
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                    Телефон *
                  </label>
                  <input
                    type="text"
                    value={newClientPhone}
                    onChange={e => setNewClientPhone(e.target.value)}
                    placeholder="+998901234567"
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="button" onClick={handleCreateClient} className="btn btn-primary">
                  Создать клиента
                </button>
                <button type="button" onClick={() => setShowNewClient(false)} className="btn btn-secondary">
                  Отмена
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Cart */}
        {items.length > 0 && (
          <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 600 }}>
              Добавленные устройства ({items.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {items.map((it, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>
                      {equipments.find(e => e.id === it.equipment_id)?.name_rus || 'Оборудование'}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                      {issues.find(i => i.id === it.issue_id)?.name_rus || 'Неисправность'}
                      {it.serial_number ? ` • S/N: ${it.serial_number}` : ''}
                    </div>
                  </div>
                  <button type="button" onClick={() => removeItem(idx)} style={{ color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', padding: '0.3rem' }}>
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Draft form */}
        <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 600 }}>
            {items.length > 0 ? `Устройство #${items.length + 1}` : 'Устройство'}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                Оборудование *
              </label>
              <select
                value={draft.equipment_id}
                onChange={e => setDraft({ ...draft, equipment_id: e.target.value })}
                className="input"
                style={{ width: '100%' }}
              >
                <option value="">— Выберите —</option>
                {equipments.map(eq => (
                  <option key={eq.id} value={eq.id}>{eq.name_rus}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                Неисправность *
              </label>
              <select
                value={draft.issue_id}
                onChange={e => setDraft({ ...draft, issue_id: e.target.value })}
                className="input"
                style={{ width: '100%' }}
              >
                <option value="">— Выберите —</option>
                {issues.map(iss => (
                  <option key={iss.id} value={iss.id}>{iss.name_rus}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                Серийный номер
              </label>
              <input
                type="text"
                value={draft.serial_number}
                onChange={e => setDraft({ ...draft, serial_number: e.target.value })}
                placeholder="S/N"
                className="input"
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                Примечание
              </label>
              <input
                type="text"
                value={draft.notes}
                onChange={e => setDraft({ ...draft, notes: e.target.value })}
                placeholder="Доп. информация"
                className="input"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={addDraftToCart}
            className="btn btn-secondary"
            style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Plus size={16} />
            Добавить ещё устройство
          </button>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', padding: '0.85rem 2rem' }}
        >
          <Send size={18} />
          {submitting ? 'Создание...' : 'Создать заказ'}
        </button>
      </form>
    </div>
  );
}
