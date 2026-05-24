import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  ListOrdered, 
  Users, 
  Settings, 
  LogOut,
  FolderOpen
} from 'lucide-react';
import { useI18n } from '../i18n/provider';
import LanguageSwitcher from '../components/LanguageSwitcher';

export const StaffLayout = () => {
  const { user, logout } = useAuth();
  const { t } = useI18n();

  return (
    <div className="staff-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 className="text-2xl font-bold text-brand">RECOVERY.UZ</h1>
          <span className="badge badge-assigned mt-4">{user?.role}</span>
        </div>
        
        <nav className="sidebar-nav">
          <NavLink 
            to="/staff" 
            end
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <LayoutDashboard size={20} />
            {t('common.dashboard')}
          </NavLink>
          
          <NavLink 
            to="/staff/orders" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <ListOrdered size={20} />
            {t('common.orders')}
          </NavLink>

          {(user?.role === 'admin' || user?.role === 'operator') && (
            <NavLink 
              to="/staff/clients" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Users size={20} />
              {t('common.clients')}
            </NavLink>
          )}

          {user?.role === 'admin' && (
            <>
              <NavLink 
                to="/staff/catalog" 
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <FolderOpen size={20} />
                {t('common.services')}
              </NavLink>
              
              <NavLink 
                to="/staff/users" 
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <Settings size={20} />
                {t('common.settings')}
              </NavLink>
            </>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <div className="text-xl font-bold">
            {t('staff.welcome')}
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <div className="text-right">
              <div className="font-bold">{user?.full_name}</div>
              <div className="text-sm text-secondary">
                {user?.email || user?.phone}
              </div>
            </div>
            <button onClick={logout} className="btn-icon" title={t('common.logout')}>
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
