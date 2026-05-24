import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, HardDrive } from 'lucide-react';
import { useI18n } from '../i18n/provider';
import LanguageSwitcher from '../components/LanguageSwitcher';

export const ClientLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)', color: '#f8fafc', position: 'relative' }}>
      {/* Background glow */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '5%', right: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(14,165,233,0.06) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '5%', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>

      {/* Header */}
      <header style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem', maxWidth: '900px', margin: '0 auto' }}>
        <div
          onClick={() => navigate('/client')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
        >
          <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HardDrive size={20} color="white" />
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>RECOVERY.UZ</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <LanguageSwitcher />
          {user && (
            <>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'none' }}>{user.full_name}</span>
              <button
                onClick={logout}
                title={t('common.logout')}
                style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              >
                <LogOut size={16} />
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main style={{ position: 'relative', zIndex: 10, maxWidth: '900px', margin: '0 auto', padding: '0 2rem 3rem' }}>
        <Outlet />
      </main>
    </div>
  );
};
