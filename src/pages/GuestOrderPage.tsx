import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Send, CheckCircle, HardDrive, AlertTriangle, MessageCircle } from 'lucide-react';
import { useI18n } from '../i18n/provider';
import LanguageSwitcher from '../components/LanguageSwitcher';
import api from '../lib/api';
import { toast } from 'sonner';

const STEPS = ['equipment', 'issue', 'contact', 'review'];

export default function GuestOrderPage() {
  const navigate = useNavigate();
  const { t, language } = useI18n();

  const [step, setStep] = useState(0);
  const [equipments, setEquipments] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);

  const [form, setForm] = useState({
    equipment_id: '',
    issue_id: '',
    client_name: '',
    phone: '',
    telegram: '',
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

  const getName = (obj: any) => {
    if (!obj) return '';
    if (language === 'uz-lat') return obj.name_lat || obj.name_rus;
    if (language === 'uz-cyr') return obj.name_cyr || obj.name_rus;
    if (language === 'en') return obj.name_eng || obj.name_rus;
    return obj.name_rus;
  };

  const selectedEquipment = equipments.find(e => e.id === form.equipment_id);
  const selectedIssue = issues.find(i => i.id === form.issue_id);

  const canGoNext = () => {
    if (step === 0) return !!form.equipment_id;
    if (step === 1) return !!form.issue_id;
    if (step === 2) return !!form.client_name.trim() && !!form.phone.trim();
    return true;
  };

  const handleSubmit = async () => {
    if (!form.client_name.trim() || !form.phone.trim()) {
      toast.error('Укажите имя и телефон');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/guest/orders', {
        client_name: form.client_name.trim(),
        phone: form.phone.trim(),
        telegram: form.telegram.trim() || undefined,
        equipment_id: form.equipment_id,
        issue_id: form.issue_id,
        notes: form.notes || undefined
      });
      setCreatedOrder(res.data?.data || res.data);
      setSuccess(true);
      toast.success('Заявка успешно отправлена!');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Ошибка при отправке заявки');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.85rem 1rem', borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15,23,42,0.8)',
    color: '#f1f5f9', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s'
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem'
  };

  const cardStyle: React.CSSProperties = {
    background: 'rgba(30,41,59,0.6)', backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px',
    padding: '2rem', boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#64748b', fontSize: '1rem' }}>Загрузка...</div>
      </div>
    );
  }

  // Success screen
  if (success && createdOrder) {
    const botName = 'recoveryhdd_bot';
    const telegramLink = `https://t.me/${botName}?start=${createdOrder.id}`;

    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ ...cardStyle, maxWidth: '480px', width: '100%', textAlign: 'center' }}
        >
          <div style={{ width: '80px', height: '80px', background: 'rgba(16,185,129,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <CheckCircle size={40} style={{ color: '#10b981' }} />
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>
            Заявка отправлена!
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Ваш заказ зарегистрирован. Мы свяжемся с вами в ближайшее время.
          </p>

          {/* Order ID */}
          <div style={{ background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem' }}>
            <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Номер заказа</p>
            <p style={{ color: '#0ea5e9', fontSize: '1.25rem', fontWeight: 700, fontFamily: 'monospace' }}>
              #{createdOrder.id?.toUpperCase()}
            </p>
          </div>

          {/* Telegram bot link */}
          <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.5rem', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <MessageCircle size={18} style={{ color: '#3b82f6' }} />
              <span style={{ color: '#e2e8f0', fontSize: '0.9rem', fontWeight: 600 }}>Получайте уведомления в Telegram!</span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.75rem', lineHeight: 1.5 }}>
              Подключите бота, чтобы мгновенно узнавать об изменениях статуса вашего заказа.
            </p>
            <a
              href={telegramLink}
              target="_blank"
              rel="noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', borderRadius: '10px', background: 'linear-gradient(135deg, #2563eb, #3b82f6)', color: 'white', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', transition: 'transform 0.15s' }}
            >
              <Send size={16} />
              Подключить бота
            </a>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => navigate(`/track?token=${createdOrder.id}`)}
              style={{ flex: 1, padding: '0.8rem', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', color: 'white', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Отследить заказ
            </button>
            <button
              onClick={() => navigate('/')}
              style={{ flex: 1, padding: '0.8rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}
            >
              На главную
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1.5rem', position: 'relative', overflow: 'hidden' }}>
      {/* Background */}
      <div style={{ position: 'absolute', top: '-15%', right: '-5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(14,165,233,0.06) 0%, transparent 70%)', borderRadius: '50%' }} />

      {/* Top bar */}
      <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 20 }}>
        <LanguageSwitcher />
      </div>

      <div style={{ width: '100%', maxWidth: '560px', position: 'relative', zIndex: 10 }}>
        {/* Back button */}
        <button
          onClick={() => step > 0 ? setStep(step - 1) : navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 500 }}
        >
          <ArrowLeft size={18} />
          {step > 0 ? 'Назад' : 'На главную'}
        </button>

        {/* Progress bar */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '2rem' }}>
          {STEPS.map((_, idx) => (
            <div
              key={idx}
              style={{
                flex: 1, height: '4px', borderRadius: '2px',
                background: idx <= step ? 'linear-gradient(90deg, #0ea5e9, #6366f1)' : 'rgba(255,255,255,0.08)',
                transition: 'background 0.3s'
              }}
            />
          ))}
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: '1.5rem' }}
        >
          <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 12px 25px rgba(14,165,233,0.2)' }}>
            <HardDrive size={28} color="white" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.4rem' }}>
            {step === 0 && 'Выберите оборудование'}
            {step === 1 && 'Что произошло?'}
            {step === 2 && 'Контактные данные'}
            {step === 3 && 'Подтвердите заявку'}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            {step === 0 && 'Укажите тип носителя данных'}
            {step === 1 && 'Выберите тип неисправности'}
            {step === 2 && 'Как с вами связаться?'}
            {step === 3 && 'Проверьте данные перед отправкой'}
          </p>
        </motion.div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={cardStyle}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {equipments.map(eq => (
                  <button
                    key={eq.id}
                    onClick={() => { setForm({ ...form, equipment_id: eq.id }); setStep(1); }}
                    style={{
                      width: '100%', padding: '1rem 1.25rem', borderRadius: '14px', textAlign: 'left',
                      border: form.equipment_id === eq.id ? '2px solid rgba(14,165,233,0.5)' : '1px solid rgba(255,255,255,0.08)',
                      background: form.equipment_id === eq.id ? 'rgba(14,165,233,0.1)' : 'rgba(15,23,42,0.6)',
                      color: '#f1f5f9', fontSize: '0.95rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  >
                    {getName(eq)}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={cardStyle}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                {issues.map(iss => (
                  <button
                    key={iss.id}
                    onClick={() => setForm({ ...form, issue_id: iss.id })}
                    style={{
                      width: '100%', padding: '1rem 1.25rem', borderRadius: '14px', textAlign: 'left',
                      border: form.issue_id === iss.id ? '2px solid rgba(14,165,233,0.5)' : '1px solid rgba(255,255,255,0.08)',
                      background: form.issue_id === iss.id ? 'rgba(14,165,233,0.1)' : 'rgba(15,23,42,0.6)',
                      color: '#f1f5f9', fontSize: '0.95rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  >
                    {getName(iss)}
                  </button>
                ))}
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
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={cardStyle}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={labelStyle}>Ваше имя *</label>
                  <input
                    type="text"
                    value={form.client_name}
                    onChange={e => setForm({ ...form, client_name: e.target.value })}
                    placeholder="Фамилия Имя"
                    required
                    style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = 'rgba(14,165,233,0.5)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Телефон *</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="+998 90 123-45-67"
                    required
                    style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = 'rgba(14,165,233,0.5)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Telegram (необязательно)</label>
                  <input
                    type="text"
                    value={form.telegram}
                    onChange={e => setForm({ ...form, telegram: e.target.value })}
                    placeholder="@username"
                    style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = 'rgba(14,165,233,0.5)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                  />
                  <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.4rem' }}>
                    Для получения уведомлений о статусе заказа
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={cardStyle}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Оборудование</span>
                  <span style={{ color: '#f1f5f9', fontWeight: 500, fontSize: '0.9rem' }}>{getName(selectedEquipment)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Неисправность</span>
                  <span style={{ color: '#f1f5f9', fontWeight: 500, fontSize: '0.9rem' }}>{getName(selectedIssue)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Имя</span>
                  <span style={{ color: '#f1f5f9', fontWeight: 500, fontSize: '0.9rem' }}>{form.client_name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Телефон</span>
                  <span style={{ color: '#f1f5f9', fontWeight: 500, fontSize: '0.9rem' }}>{form.phone}</span>
                </div>
                {form.telegram && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Telegram</span>
                    <span style={{ color: '#f1f5f9', fontWeight: 500, fontSize: '0.9rem' }}>{form.telegram}</span>
                  </div>
                )}
                {form.notes && (
                  <div style={{ padding: '0.75rem 0' }}>
                    <span style={{ color: '#64748b', fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem' }}>Примечания</span>
                    <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{form.notes}</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
          {step > 0 && step < 3 && (
            <button
              onClick={() => setStep(step - 1)}
              style={{ flex: 1, padding: '0.85rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <ArrowLeft size={18} />
              Назад
            </button>
          )}

          {step < 3 && step > 0 && (
            <button
              onClick={() => canGoNext() && setStep(step + 1)}
              disabled={!canGoNext()}
              style={{ flex: 1, padding: '0.85rem', borderRadius: '12px', border: 'none', background: canGoNext() ? 'linear-gradient(135deg, #0ea5e9, #6366f1)' : 'rgba(100,116,139,0.3)', color: 'white', fontSize: '0.9rem', fontWeight: 600, cursor: canGoNext() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: canGoNext() ? '0 10px 25px rgba(14,165,233,0.2)' : 'none' }}
            >
              Далее
              <ArrowRight size={18} />
            </button>
          )}

          {step === 3 && (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{ flex: 1, padding: '0.9rem', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', color: 'white', fontSize: '1rem', fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 10px 25px rgba(14,165,233,0.25)' }}
            >
              <Send size={18} />
              {submitting ? 'Отправка...' : 'Отправить заявку'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
