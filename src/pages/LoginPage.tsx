import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n/provider';
import { motion } from 'framer-motion';
import {
  Lock, Loader2, ArrowRight, Mail, Eye, EyeOff, ArrowLeft, Wrench, Search
} from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';
import AnimatedLogo from '../components/AnimatedLogo';

export default function LoginPage() {
  const [loginForm, setLoginForm] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    setMounted(true);
  }, [searchParams]);

  if (isLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
      <div style={{ width: 48, height: 48, border: '4px solid rgba(14,165,233,0.3)', borderTopColor: '#0ea5e9', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  if (user) {
    if (user.role === 'client') return <Navigate replace to="/client" />;
    return <Navigate replace to="/staff" />;
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(loginForm, password);
    } catch (err: any) {
      setError(err.response?.data?.message || t('auth.invalidCredentials'));
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
        <div style={{ width: 48, height: 48, border: '4px solid rgba(14,165,233,0.3)', borderTopColor: '#0ea5e9', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)', position: 'relative', overflow: 'hidden' }}>
      {/* Background decoration */}
      <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 70%)', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)', borderRadius: '50%' }} />

      {/* Language switcher */}
      <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 20 }}>
        <LanguageSwitcher />
      </div>

      {/* Back to home */}
      <button
        onClick={() => navigate('/')}
        aria-label={t('auth.backToHome')}
        style={{
          position: 'absolute', top: '1.5rem', left: '1.5rem', zIndex: 20,
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.55rem 0.9rem', borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(12px)',
          color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(15,23,42,0.85)'; e.currentTarget.style.borderColor = 'rgba(14,165,233,0.4)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(15,23,42,0.6)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
      >
        <ArrowLeft size={16} />
        {t('auth.backToHome')}
      </button>

      {/* Left side - Branding */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '3rem', position: 'relative' }}>
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          style={{ maxWidth: '480px', textAlign: 'center' }}
        >
          {/* Logo */}
          <div style={{ marginBottom: '2rem' }}>
            <AnimatedLogo size={104} showText={false} />
          </div>

          <h1 style={{ fontSize: '2.7rem', fontWeight: 950, letterSpacing: '-0.055em', marginBottom: '0.75rem', background: 'linear-gradient(135deg, #ffffff 0%, #7dd3fc 52%, #c4b5fd 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            RECOVERY.UZ
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '2.5rem' }}>
            {t('guest.subtitle')}
          </p>

          {/* Features */}
          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem', border: '1px solid rgba(16,185,129,0.2)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('guest.safe')}</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(14,165,233,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem', border: '1px solid rgba(14,165,233,0.2)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('guest.fast')}</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem', border: '1px solid rgba(139,92,246,0.2)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>24/7</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right side - Login Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ width: '100%', maxWidth: '420px' }}
        >
          <div style={{ background: 'rgba(30,41,59,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>
              {t('auth.loginButton')}
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '2rem' }}>
              {t('auth.subtitle')}
            </p>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ padding: '0.75rem 1rem', marginBottom: '1.5rem', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                <p style={{ fontSize: '0.85rem', color: '#f87171', textAlign: 'center', fontWeight: 500 }}>{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleLoginSubmit}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem' }}>
                  {t('auth.email')}
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                  <input
                    type="text"
                    name="login"
                    required
                    value={loginForm}
                    onChange={(e) => setLoginForm(e.target.value)}
                    placeholder="admin@hdd-fixer.uz"
                    disabled={loading}
                    autoComplete="username"
                    style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.75rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15,23,42,0.8)', color: '#f1f5f9', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s' }}
                    onFocus={(e) => { e.target.style.borderColor = 'rgba(14,165,233,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.1)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem' }}>
                  {t('auth.password')}
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={loading}
                    autoComplete="current-password"
                    style={{ width: '100%', padding: '0.85rem 3rem 0.85rem 2.75rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15,23,42,0.8)', color: '#f1f5f9', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s' }}
                    onFocus={(e) => { e.target.style.borderColor = 'rgba(14,165,233,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.1)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#475569', cursor: 'pointer', padding: '4px' }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ width: '100%', padding: '0.9rem', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', color: 'white', fontSize: '1rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'transform 0.15s, box-shadow 0.15s', boxShadow: '0 10px 25px rgba(14,165,233,0.25)' }}
                onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 15px 30px rgba(14,165,233,0.35)'; } }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(14,165,233,0.25)'; }}
              >
                {loading ? (
                  <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <>
                    {t('auth.loginButton')}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
              <span style={{ fontSize: '0.8rem', color: '#475569' }}>{t('auth.or')}</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
            </div>

            {/* Lazy / no-auth CTA — like the old project */}
            <button
              type="button"
              onClick={() => navigate('/guest/new-order')}
              style={{
                width: '100%', padding: '0.95rem 1rem', borderRadius: '14px',
                border: '1px solid rgba(16,185,129,0.35)',
                background: 'linear-gradient(135deg, rgba(16,185,129,0.18), rgba(20,184,166,0.18))',
                color: '#a7f3d0', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                transition: 'transform 0.15s, box-shadow 0.15s, background 0.2s',
                boxShadow: '0 10px 25px rgba(16,185,129,0.12)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(16,185,129,0.28), rgba(20,184,166,0.28))';
                e.currentTarget.style.boxShadow = '0 15px 30px rgba(16,185,129,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(16,185,129,0.18), rgba(20,184,166,0.18))';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(16,185,129,0.12)';
              }}
            >
              <Wrench size={18} />
              {t('auth.guestOrder')}
            </button>
            <p style={{ color: '#64748b', fontSize: '0.78rem', margin: '0.55rem 0 0', textAlign: 'center', lineHeight: 1.45 }}>
              {t('auth.guestOrderHint')}
            </p>

            {/* Secondary actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '1.25rem' }}>
              <button
                onClick={() => navigate('/register')}
                style={{ width: '100%', padding: '0.7rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#cbd5e1', fontSize: '0.88rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              >
                {t('auth.noAccount')} <span style={{ color: '#0ea5e9', fontWeight: 600 }}>{t('auth.register')}</span>
              </button>

              <button
                onClick={() => navigate('/track')}
                style={{ width: '100%', padding: '0.7rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              >
                <Search size={15} />
                {t('auth.trackWithoutLogin')}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Navigate({ to, replace }: { to: string; replace?: boolean }) {
  const navigate = useNavigate();
  useEffect(() => { navigate(to, { replace }); }, [navigate, to, replace]);
  return null;
}
