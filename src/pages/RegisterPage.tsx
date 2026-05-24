import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, ArrowRight, ArrowLeft, CheckCircle, Loader2, Phone } from 'lucide-react';
import { useI18n } from '../i18n/provider';
import api from '../lib/api';
import { toast } from 'sonner';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { t } = useI18n();

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    if (formData.password.length < 6) {
      setError('Пароль должен быть не менее 6 символов');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', {
        full_name: formData.full_name.trim(),
        phone: formData.phone,
        email: formData.email?.trim() || undefined,
        password: formData.password,
      });
      setSuccess(true);
      toast.success('Регистрация успешна!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.85rem 1rem 0.85rem 2.75rem', borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15,23,42,0.8)',
    color: '#f1f5f9', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s'
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem'
  };

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)', padding: '2rem' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ background: 'rgba(30,41,59,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '3rem', textAlign: 'center', maxWidth: '420px', width: '100%' }}
        >
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <CheckCircle size={32} style={{ color: '#10b981' }} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.75rem' }}>Регистрация успешна!</h2>
          <p style={{ color: '#64748b', marginBottom: '2rem' }}>Теперь вы можете войти в систему</p>
          <button
            onClick={() => navigate('/login')}
            style={{ width: '100%', padding: '0.9rem', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', color: 'white', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}
          >
            Войти
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)', position: 'relative' }}>
      {/* Language */}
      <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 20 }}>
        <LanguageSwitcher />
      </div>

      {/* Back */}
      <div style={{ padding: '2rem 2rem 0', maxWidth: '480px', margin: '0 auto', width: '100%' }}>
        <button
          onClick={() => navigate('/login')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
        >
          <ArrowLeft size={18} />
          Назад
        </button>
      </div>

      {/* Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ width: '100%', maxWidth: '480px' }}
        >
          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <User size={28} color="white" />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>Регистрация</h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Создайте аккаунт для отслеживания заказов</p>
          </div>

          {/* Card */}
          <div style={{ background: 'rgba(30,41,59,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '2rem' }}>
            {error && (
              <div style={{ padding: '0.75rem 1rem', marginBottom: '1.5rem', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <p style={{ fontSize: '0.85rem', color: '#f87171', textAlign: 'center', fontWeight: 500 }}>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>ФИО *</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                  <input
                    type="text" required value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Иван Иванов" disabled={loading} style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = 'rgba(14,165,233,0.5)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Телефон *</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                  <input
                    type="tel" required value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+998901234567" disabled={loading} style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = 'rgba(14,165,233,0.5)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Email (необязательно)</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                  <input
                    type="email" value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="example@mail.ru" disabled={loading} style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = 'rgba(14,165,233,0.5)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Пароль *</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                  <input
                    type="password" required value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Минимум 6 символов" disabled={loading} style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = 'rgba(14,165,233,0.5)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Подтверждение пароля *</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                  <input
                    type="password" required value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Повторите пароль" disabled={loading} style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = 'rgba(14,165,233,0.5)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                  />
                </div>
              </div>

              <button
                type="submit" disabled={loading}
                style={{ width: '100%', padding: '0.9rem', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', color: 'white', fontSize: '1rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem', boxShadow: '0 10px 25px rgba(14,165,233,0.25)' }}
              >
                {loading ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : <><span>Зарегистрироваться</span><ArrowRight size={18} /></>}
              </button>
            </form>

            {/* Login link */}
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <span style={{ color: '#64748b' }}>Уже есть аккаунт? </span>
              <button onClick={() => navigate('/login')} style={{ color: '#0ea5e9', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                Войти
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
