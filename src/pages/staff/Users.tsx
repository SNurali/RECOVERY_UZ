import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import { DataTable } from '../../components/DataTable';
import { Plus, Edit2, Check, X, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';

const roleLabels: Record<string, string> = {
  admin: 'Администратор',
  operator: 'Оператор',
  master: 'Мастер',
  client: 'Клиент',
};

const roleBadgeClass: Record<string, string> = {
  admin: 'badge-admin',
  operator: 'badge-assigned',
  master: 'badge-in_repair',
  client: 'badge-new',
};

export default function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState('');
  const { user: currentUser } = useAuth();
  const [form, setForm] = useState({
    full_name: '',
    login: '',
    password: '',
    role: 'master',
    phone: '',
    email: ''
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users');
      setUsers(data.data || data || []);
    } catch (err) {
      console.error(err);
      toast.error('Не удалось загрузить список пользователей');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/users', form);
      toast.success('Пользователь успешно создан');
      setForm({ full_name: '', login: '', password: '', role: 'master', phone: '', email: '' });
      setShowAdd(false);
      await fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditRole = (userId: string, currentRole: string) => {
    setEditingId(userId);
    setEditRole(currentRole);
  };

  const handleSaveRole = async (userId: string) => {
    try {
      await api.patch(`/users/${userId}`, { role: editRole });
      toast.success('Роль успешно изменена');
      setEditingId(null);
      await fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error('Не удалось изменить роль');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditRole('');
  };

  const handleDelete = async (userId: string, userName: string) => {
    if (!confirm(`Удалить пользователя "${userName}"? Это действие необратимо.`)) return;
    try {
      await api.delete(`/users/${userId}`);
      toast.success('Пользователь удалён');
      await fetchUsers();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Не удалось удалить пользователя');
    }
  };

  const columns = [
    { key: 'full_name', title: 'ФИО', sortable: true },
    { 
      key: 'role', 
      title: 'Роль', 
      render: (item: any) => {
        const role = item.role?.name_eng || item.role;
        
        if (editingId === item.id) {
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <select
                className="input-field"
                value={editRole}
                onChange={e => setEditRole(e.target.value)}
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem', width: 'auto' }}
              >
                <option value="admin">Администратор</option>
                <option value="operator">Оператор</option>
                <option value="master">Мастер</option>
                <option value="client">Клиент</option>
              </select>
              <button 
                onClick={() => handleSaveRole(item.id)} 
                className="btn-icon" 
                style={{ color: 'var(--success)', padding: '0.25rem' }}
                title="Сохранить"
              >
                <Check size={16} />
              </button>
              <button 
                onClick={handleCancelEdit} 
                className="btn-icon" 
                style={{ color: 'var(--danger)', padding: '0.25rem' }}
                title="Отмена"
              >
                <X size={16} />
              </button>
            </div>
          );
        }

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className={`badge ${roleBadgeClass[role] || 'badge-assigned'}`}>
              {roleLabels[role] || role}
            </span>
            <button 
              onClick={() => handleEditRole(item.id, role)} 
              className="btn-icon" 
              style={{ padding: '0.25rem', opacity: 0.6 }}
              title="Изменить роль"
            >
              <Edit2 size={14} />
            </button>
          </div>
        );
      }
    },
    { key: 'phone', title: 'Телефон' },
    { key: 'email', title: 'Email', render: (item: any) => item.email || '—' },
    { 
      key: 'login', 
      title: 'Логин', 
      render: (item: any) => <span className="text-secondary">{item.login}</span>
    },
    {
      key: 'actions',
      title: '',
      render: (item: any) => {
        const role = item.role?.name_eng || item.role;
        const isSelf = item.id === currentUser?.id;
        if (isSelf) return null;
        return (
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(item.id, item.full_name); }}
            className="btn-icon"
            style={{ color: '#f87171', padding: '0.3rem', opacity: 0.7 }}
            title="Удалить пользователя"
          >
            <Trash2 size={16} />
          </button>
        );
      }
    }
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Все пользователи</h1>
          <p className="page-description">Управление всеми учётными записями системы (Админы, Операторы, Мастера, Клиенты)</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)}>
          <Plus size={18} />
          {showAdd ? 'Скрыть форму' : 'Создать пользователя'}
        </button>
      </div>

      {showAdd && (
        <div className="card mb-6" style={{ maxWidth: '600px' }}>
          <h3 className="font-bold mb-4">Новый пользователь</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label className="input-label">ФИО</label>
              <input 
                type="text" 
                className="input-field" 
                value={form.full_name} 
                onChange={e => setForm({ ...form, full_name: e.target.value })} 
                required
              />
            </div>
            <div className="input-group">
              <label className="input-label">Логин</label>
              <input 
                type="text" 
                className="input-field" 
                value={form.login} 
                onChange={e => setForm({ ...form, login: e.target.value })} 
                required
              />
            </div>
            <div className="input-group">
              <label className="input-label">Пароль</label>
              <input 
                type="password" 
                className="input-field" 
                value={form.password} 
                onChange={e => setForm({ ...form, password: e.target.value })} 
                required
              />
            </div>
            <div className="input-group">
              <label className="input-label">Роль</label>
              <select 
                className="input-field" 
                value={form.role} 
                onChange={e => setForm({ ...form, role: e.target.value })}
                required
              >
                <option value="admin">Администратор</option>
                <option value="operator">Оператор</option>
                <option value="master">Мастер</option>
                <option value="client">Клиент</option>
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Телефон</label>
              <input 
                type="text" 
                className="input-field" 
                value={form.phone} 
                onChange={e => setForm({ ...form, phone: e.target.value })} 
              />
            </div>
            <div className="input-group">
              <label className="input-label">Email</label>
              <input 
                type="email" 
                className="input-field" 
                value={form.email} 
                onChange={e => setForm({ ...form, email: e.target.value })} 
              />
            </div>
            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <button type="submit" className="btn btn-primary">Создать</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowAdd(false)}>Отмена</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div>Загрузка списка пользователей...</div>
      ) : (
        <>
          <div className="text-secondary text-sm mb-4">
            Всего: {users.length} | 
            Админы: {users.filter(u => (u.role?.name_eng || u.role) === 'admin').length} | 
            Операторы: {users.filter(u => (u.role?.name_eng || u.role) === 'operator').length} | 
            Мастера: {users.filter(u => (u.role?.name_eng || u.role) === 'master').length} | 
            Клиенты: {users.filter(u => (u.role?.name_eng || u.role) === 'client').length}
          </div>
          <DataTable data={users} columns={columns} />
        </>
      )}
    </div>
  );
}
