import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Shield, Zap, Headphones, Award, HardDrive } from 'lucide-react';
import { useI18n } from '../i18n/provider';
import LanguageSwitcher from './LanguageSwitcher';
import AnimatedLogo from './AnimatedLogo';

export default function GuestView() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [trackingNumber, setTrackingNumber] = useState('');

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      navigate(`/track?token=${encodeURIComponent(trackingNumber.trim())}`);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 40%, #0f172a 100%)', position: 'relative', overflow: 'hidden' }}>
      {/* Background effects */}
      <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(14,165,233,0.07) 0%, transparent 60%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', height: '300px', background: 'radial-gradient(ellipse at center bottom, rgba(99,102,241,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Navigation */}
      <nav style={{ position: 'relative', zIndex: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            style={{ position: 'relative', width: '36px', height: '36px' }}
          >
            <div style={{ position: 'absolute', inset: '-2px', borderRadius: '12px', background: 'conic-gradient(from 0deg, transparent, rgba(14,165,233,0.5), transparent, rgba(99,102,241,0.5), transparent)', opacity: 0.7 }} />
            <div style={{ position: 'relative', width: '36px', height: '36px', background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HardDrive size={18} color="white" />
            </div>
          </motion.div>
          <span style={{ fontSize: '1.1rem', fontWeight: 700, background: 'linear-gradient(135deg, #f8fafc, #0ea5e9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>RECOVERY.UZ</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <LanguageSwitcher />
          <button
            onClick={() => navigate('/login')}
            style={{ padding: '0.6rem 1.25rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
          >
            {t('auth.loginButton')}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main style={{ position: 'relative', zIndex: 10, maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem 3rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          style={{ textAlign: 'center', marginBottom: '4rem' }}
        >
          {/* Animated Logo */}
          <div style={{ marginBottom: '2rem' }}>
            <AnimatedLogo size={100} showText={false} />
          </div>

          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '1.25rem', background: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {t('guest.subtitle')}
          </h1>

          <p style={{ fontSize: '1.15rem', color: '#64748b', maxWidth: '550px', margin: '0 auto', lineHeight: 1.7 }}>
            Профессиональное восстановление данных с жёстких дисков, SSD и других носителей. Бесплатная диагностика.
          </p>
        </motion.div>

        {/* Action Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', maxWidth: '700px', margin: '0 auto 5rem' }}
        >
          {/* Create Order Card */}
          <div
            onClick={() => navigate('/login?action=create')}
            style={{ background: 'rgba(30,41,59,0.5)', backdropFilter: 'blur(16px)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: '20px', padding: '2rem', cursor: 'pointer', transition: 'all 0.3s', position: 'relative', overflow: 'hidden' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(14,165,233,0.4)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(14,165,233,0.15)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(14,165,233,0.2)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <ArrowRight size={24} style={{ color: '#0ea5e9' }} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>
              {t('guest.createOrder')}
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5 }}>
              {t('guest.createOrderDesc')}
            </p>
          </div>

          {/* Track Order Card */}
          <div style={{ background: 'rgba(30,41,59,0.5)', backdropFilter: 'blur(16px)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '20px', padding: '2rem', transition: 'all 0.3s' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(99,102,241,0.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Search size={24} style={{ color: '#818cf8' }} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.75rem' }}>
              {t('guest.trackOrder')}
            </h3>
            <form onSubmit={handleTrack} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder={t('guest.trackPlaceholder')}
                style={{ flex: 1, padding: '0.7rem 1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15,23,42,0.8)', color: '#f1f5f9', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s' }}
                onFocus={(e) => { e.target.style.borderColor = 'rgba(99,102,241,0.5)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              />
              <button
                type="submit"
                style={{ padding: '0.7rem 1rem', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <ArrowRight size={18} />
              </button>
            </form>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', maxWidth: '600px', margin: '0 auto 5rem' }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.25rem' }}>500+</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Успешных восстановлений</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.25rem' }}>98%</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Успешность</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.25rem' }}>24ч</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Средний срок</div>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', maxWidth: '800px', margin: '0 auto 4rem' }}
        >
          {[
            { icon: <Shield size={22} />, title: t('guest.safe'), desc: 'Конфиденциальность данных', color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.15)' },
            { icon: <Zap size={22} />, title: t('guest.fast'), desc: 'Срочная диагностика', color: '#0ea5e9', bg: 'rgba(14,165,233,0.08)', border: 'rgba(14,165,233,0.15)' },
            { icon: <Headphones size={22} />, title: '24/7', desc: 'Поддержка клиентов', color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.15)' },
            { icon: <Award size={22} />, title: 'Гарантия', desc: 'На все виды работ', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.15)' },
          ].map((feature, idx) => (
            <div key={idx} style={{ background: feature.bg, border: `1px solid ${feature.border}`, borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ color: feature.color, marginBottom: '0.75rem', display: 'flex', justifyContent: 'center' }}>
                {feature.icon}
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '0.25rem' }}>{feature.title}</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{feature.desc}</div>
            </div>
          ))}
        </motion.div>

        {/* Footer */}
        <div style={{ textAlign: 'center', paddingBottom: '2rem' }}>
          <button
            onClick={() => navigate('/login')}
            style={{ color: '#475569', fontSize: '0.85rem', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#94a3b8'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#475569'; }}
          >
            {t('guest.staffLogin')}
          </button>
        </div>
      </main>
    </div>
  );
}
