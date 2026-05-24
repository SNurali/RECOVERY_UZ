import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import { DataTable } from '../../components/DataTable';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useI18n } from '../../i18n/provider';

export default function Clients() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const { t } = useI18n();
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    telegram_chat_id: ''
  });

  const fetchClients = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/clients');
      setClients(data.data || data || []);
    } catch (err) {
      console.error(err);
      toast.error(t('clients.failedToLoad'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/clients', form);
      toast.success(t('clients.clientAdded'));
      setForm({ full_name: '', phone: '', email: '', telegram_chat_id: '' });
      setShowAdd(false);
      await fetchClients();
    } catch (err) {
      console.error(err);
    }
  };

  const columns = [
    { key: 'full_name', title: t('clients.fullName'), sortable: true },
    { key: 'phone', title: t('clients.phone') },
    { key: 'email', title: t('clients.email') },
    { 
      key: 'telegram_chat_id', 
      title: t('clients.telegram'), 
      render: (item: any) => item.telegram_chat_id ? <span style={{ color: 'var(--success-text)' }}>{t('clients.connected')} ({item.telegram_chat_id})</span> : <span className="text-tertiary">{t('clients.notConnected')}</span> 
    }
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('clients.title')}</h1>
          <p className="page-description">{t('clients.description')}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)}>
          <Plus size={18} />
          {showAdd ? t('clients.hideForm') : t('clients.addClient')}
        </button>
      </div>

      {showAdd && (
        <div className="card mb-6" style={{ maxWidth: '600px' }}>
          <h3 className="font-bold mb-4">{t('clients.newClient')}</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group" style={{ gridColumn: 'span 2' }}>
              <label className="input-label">{t('clients.fullName')}</label>
              <input 
                type="text" 
                className="input-field" 
                value={form.full_name} 
                onChange={e => setForm({ ...form, full_name: e.target.value })} 
                required
              />
            </div>
            <div className="input-group">
              <label className="input-label">{t('clients.phone')}</label>
              <input 
                type="text" 
                className="input-field" 
                value={form.phone} 
                onChange={e => setForm({ ...form, phone: e.target.value })} 
                required
              />
            </div>
            <div className="input-group">
              <label className="input-label">{t('clients.emailOptional')}</label>
              <input 
                type="email" 
                className="input-field" 
                value={form.email} 
                onChange={e => setForm({ ...form, email: e.target.value })} 
              />
            </div>
            <div className="input-group" style={{ gridColumn: 'span 2' }}>
              <label className="input-label">{t('clients.telegramChatId')}</label>
              <input 
                type="text" 
                className="input-field" 
                value={form.telegram_chat_id} 
                onChange={e => setForm({ ...form, telegram_chat_id: e.target.value })} 
              />
            </div>
            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <button type="submit" className="btn btn-primary">{t('common.save')}</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowAdd(false)}>{t('common.cancel')}</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div>{t('clients.loadingClients')}</div>
      ) : (
        <DataTable data={clients} columns={columns} />
      )}
    </div>
  );
}
