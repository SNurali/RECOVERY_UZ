import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Send } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';

export default function ClientNewOrder() {
  const navigate = useNavigate();
  const [equipments, setEquipments] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    equipment_id: '',
    issue_id: '',
    serial_number: '',
    notes: ''
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [eqRes, isRes] = await Promise.all([
          api.get('/equipments'),
          api.get('/issues')
        ]);
        setEquipments(eqRes.data?.data || eqRes.data || []);
        setIssues(isRes.data?.data || isRes.data || []);
      } catch (err) {
        console.error(err);
        toast.error('Не удалось загрузить данные');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/orders', {
        details: [{
          equipment_id: form.equipment_id,
          issue_id: form.issue_id,
          serial_number: form.serial_number || undefined,
          notes: form.notes || undefined
        }]
      });
      toast.success('Заявка успешно отправлена!');
      navigate('/client');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>Загрузка...</div>;

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.85rem 1rem', borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15,23,42,0.8)',
    color: '#f1f5f9', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s'
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem'
  };

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto' }}>
      {/* Back */}
      <button
        onClick={() => navigate('/client')}
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '1.5rem', fontSize: '0.9rem' }}
      >
        <ArrowLeft size={18} />
        Назад к заказам
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ background: 'rgba(30,41,59,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }}
      >
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem', textAlign: 'center' }}>
          Сдать прибор в ремонт
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center', marginBottom: '2rem' }}>
          Заполните форму и мы свяжемся с вами
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={labelStyle}>Тип оборудования *</label>
            <select
              value={form.equipment_id}
              onChange={e => setForm({ ...form, equipment_id: e.target.value })}
              required
              style={{ ...inputStyle, appearance: 'none' }}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(14,165,233,0.5)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            >
              <option value="" style={{ background: '#1e293b' }}>Выберите тип прибора</option>
              {equipments.map(eq => (
                <option key={eq.id} value={eq.id} style={{ background: '#1e293b' }}>{eq.name_rus}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Тип неисправности *</label>
            <select
              value={form.issue_id}
              onChange={e => setForm({ ...form, issue_id: e.target.value })}
              required
              style={{ ...inputStyle, appearance: 'none' }}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(14,165,233,0.5)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            >
              <option value="" style={{ background: '#1e293b' }}>Что произошло?</option>
              {issues.map(iss => (
                <option key={iss.id} value={iss.id} style={{ background: '#1e293b' }}>{iss.name_rus}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Серийный номер (необязательно)</label>
            <input
              type="text"
              value={form.serial_number}
              onChange={e => setForm({ ...form, serial_number: e.target.value })}
              placeholder="S/N: WD-WCC7K4PZ9"
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(14,165,233,0.5)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            />
          </div>

          <div>
            <label style={labelStyle}>Дополнительные примечания</label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              placeholder="Опишите проблему подробнее..."
              style={{ ...inputStyle, resize: 'vertical' }}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(14,165,233,0.5)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{ width: '100%', padding: '0.9rem', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', color: 'white', fontSize: '1rem', fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem', boxShadow: '0 10px 25px rgba(14,165,233,0.25)', transition: 'transform 0.15s' }}
            onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <Send size={18} />
            {submitting ? 'Отправка...' : 'Отправить заявку'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
