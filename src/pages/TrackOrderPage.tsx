import { useCallback, useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, HardDrive, XCircle, ArrowLeft, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useI18n } from '../i18n/provider';
import type { Language } from '../i18n/provider';
import api from '../lib/api';
import LanguageSwitcher from '../components/LanguageSwitcher';

const STATUS_ORDER = ['new', 'accepted', 'diagnosing', 'awaiting_approval', 'approved', 'in_repair', 'completed', 'issued'];

const localeMap: Record<Language, string> = {
  'ru': 'ru-RU',
  'en': 'en-US',
  'uz-cyr': 'uz-UZ',
  'uz-lat': 'uz-UZ'
};

export default function TrackOrderPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { language, t } = useI18n();
  
  const [token, setToken] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isPrefilled, setIsPrefilled] = useState(false);

  const getStatusInfo = (status: string) => {
    return {
      label: t(`track.status.${status}.label`),
      description: t(`track.status.${status}.description`)
    };
  };

  const handleTrack = useCallback(async () => {
    if (!token.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const { data } = await api.get(`/orders/track/${token.trim()}`);
      setOrder(data.data || data);
    } catch (err: any) {
      setError(err.response?.data?.message || t('track.orderNotFound'));
    } finally {
      setLoading(false);
    }
  }, [token, t]);

  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken && !isPrefilled) {
      setToken(urlToken);
      setIsPrefilled(true);
    }
  }, [searchParams, isPrefilled]);

  useEffect(() => {
    if (token && isPrefilled) {
      handleTrack();
    }
  }, [handleTrack, isPrefilled, token]);

  const getName = (obj: any) => {
    if (!obj) return '';
    if (language === 'uz-lat') return obj.name_lat || obj.name_rus;
    if (language === 'uz-cyr') return obj.name_cyr || obj.name_rus;
    if (language === 'en') return obj.name_eng || obj.name_rus;
    return obj.name_rus;
  };

  const currentStepIndex = order ? STATUS_ORDER.indexOf(order.status) : -1;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1.5rem', position: 'relative', overflow: 'hidden' }}>
      {/* Background decoration */}
      <div style={{ position: 'absolute', top: '-15%', right: '-5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(14,165,233,0.06) 0%, transparent 70%)', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', bottom: '-15%', left: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)', borderRadius: '50%' }} />

      {/* Top bar */}
      <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 20 }}>
        <LanguageSwitcher />
      </div>

      <div style={{ width: '100%', maxWidth: '520px', position: 'relative', zIndex: 10 }}>
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '2rem', fontSize: '0.9rem', fontWeight: 500 }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#f1f5f9'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; }}
        >
          <ArrowLeft size={18} />
          {t('common.back')}
        </button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: '2rem' }}
        >
          <div style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 15px 30px rgba(14,165,233,0.25)' }}>
            <HardDrive size={32} color="white" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.5rem' }}>
            {t('track.title')}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            {t('track.subtitle')}
          </p>
        </motion.div>

        {/* Search box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ background: 'rgba(30,41,59,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
        >
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
              placeholder={t('track.placeholder')}
              style={{ flex: 1, padding: '0.9rem 1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15,23,42,0.8)', color: '#f1f5f9', fontSize: '1.1rem', fontFamily: 'monospace', letterSpacing: '0.05em', outline: 'none', transition: 'border-color 0.2s' }}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(14,165,233,0.5)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            />
            <button
              onClick={handleTrack}
              disabled={loading || !token.trim()}
              style={{ padding: '0.9rem 1.5rem', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', color: 'white', cursor: loading || !token.trim() ? 'not-allowed' : 'pointer', opacity: loading || !token.trim() ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.15s', boxShadow: '0 8px 20px rgba(14,165,233,0.25)' }}
              onMouseEnter={(e) => { if (!loading && token.trim()) e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {loading ? (
                <div style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              ) : (
                <Search size={20} />
              )}
            </button>
          </div>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ background: 'rgba(127,29,29,0.2)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '16px', padding: '2rem', textAlign: 'center', marginBottom: '1.5rem' }}
          >
            <XCircle size={48} style={{ color: '#ef4444', margin: '0 auto 0.75rem' }} />
            <p style={{ color: '#fca5a5', fontWeight: 500, fontSize: '0.95rem' }}>{error}</p>
          </motion.div>
        )}

        {/* Order result */}
        {order && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ background: 'rgba(30,41,59,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
          >
            {/* Order ID and status */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem' }}>{t('guestOrder.orderNumber')}</p>
                <p style={{ fontSize: '1.25rem', fontFamily: 'monospace', fontWeight: 700, color: '#0ea5e9' }}>
                  #{order.id?.slice(0, 8).toUpperCase()}
                </p>
              </div>
              <div style={{ padding: '0.4rem 0.9rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, background: 'rgba(14,165,233,0.15)', color: '#38bdf8', border: '1px solid rgba(14,165,233,0.3)' }}>
                {getStatusInfo(order.status).label || order.status}
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.75rem' }}>
                {STATUS_ORDER.map((_, idx) => (
                  <div
                    key={idx}
                    style={{
                      flex: 1,
                      height: '4px',
                      borderRadius: '2px',
                      background: idx <= currentStepIndex ? 'linear-gradient(90deg, #0ea5e9, #6366f1)' : 'rgba(255,255,255,0.08)',
                      transition: 'background 0.3s'
                    }}
                  />
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                <CheckCircle size={16} style={{ color: '#10b981' }} />
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center' }}>
                  {getStatusInfo(order.status).description}
                </p>
              </div>
            </div>

            {/* Order details */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>{t('order.createdAt')}</span>
                <span style={{ color: '#f1f5f9', fontWeight: 500, fontSize: '0.9rem' }}>
                  {new Date(order.order_date || order.created_at).toLocaleDateString(localeMap[language] || 'ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>

              {order.details?.[0]?.equipment && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>{t('order.device')}</span>
                  <span style={{ color: '#f1f5f9', fontWeight: 500, fontSize: '0.9rem' }}>{getName(order.details[0].equipment)}</span>
                </div>
              )}

              {order.details?.[0]?.issue && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>{t('order.issue')}</span>
                  <span style={{ color: '#f1f5f9', fontWeight: 500, fontSize: '0.9rem' }}>{getName(order.details[0].issue)}</span>
                </div>
              )}

              {Number(order.total_price_uzs) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>{t('order.price')}</span>
                  <span style={{ color: '#f8fafc', fontWeight: 700, fontSize: '1.1rem' }}>
                    {Number(order.total_price_uzs).toLocaleString()} UZS
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Hint */}
        {!order && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{ textAlign: 'center', marginTop: '2rem' }}
          >
            <p style={{ color: '#475569', fontSize: '0.85rem' }}>
              {t('track.tryHint')} <span style={{ color: '#0ea5e9', fontFamily: 'monospace', cursor: 'pointer' }} onClick={() => { setToken('ord1'); }}>ord1</span> {t('auth.or')} <span style={{ color: '#0ea5e9', fontFamily: 'monospace', cursor: 'pointer' }} onClick={() => { setToken('ord2'); }}>ord2</span>
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
