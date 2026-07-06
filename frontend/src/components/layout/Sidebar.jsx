import { NavLink, useLocation } from 'react-router-dom';
import {
  MdApartment, MdPeople, MdArticle,
  MdElectricMeter, MdReceipt, MdPayment,
  MdLogout, MdHome, MdAccountCircle, MdWarning, MdDashboard,
  MdMiscellaneousServices
} from 'react-icons/md';
import { useAuth } from '../../contexts/AuthContext';

const managerNavItems = [
  { path: '/dashboard', label: 'Tổng quan', icon: MdDashboard },
  { path: '/rooms', label: 'Phòng trọ', icon: MdApartment },
  { path: '/tenants', label: 'Người thuê', icon: MdPeople },
  { path: '/contracts', label: 'Hợp đồng', icon: MdArticle },
  { path: '/meter-readings', label: 'Đồng hồ', icon: MdElectricMeter },
  { path: '/invoices', label: 'Hóa đơn', icon: MdReceipt },
  { path: '/payments', label: 'Thanh toán', icon: MdPayment },
  { path: '/debts', label: 'Công nợ', icon: MdWarning },
  { path: '/services', label: 'Dịch vụ', icon: MdMiscellaneousServices },
];

const adminNavItems = [
  { path: '/accounts', label: 'Tài khoản', icon: MdAccountCircle },
];

const allNavItems = managerNavItems;


export default function Sidebar({ collapsed = false }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');
  
  const isAdmin = user?.role === 'admin';
  const navItems = isAdmin ? adminNavItems : allNavItems;

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!collapsed && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <MdHome size={28} color="#fff" />
              <div>
                <h2 style={{ margin: 0, fontSize: 18 }}>Quản lý phòng trọ</h2>
              </div>
            </div>
          </>
        )}
        {collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <MdHome size={24} color="#fff" />
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={`nav-item ${isActive(path) ? 'active' : ''}`}
              title={collapsed ? label : undefined}
            >
              <Icon />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="sidebar-footer">
        <div
          className="nav-item"
          onClick={() => { logout(); window.location.href = '/login'; }}
          style={{ cursor: 'pointer' }}
          title={collapsed ? 'Đăng xuất' : undefined}
        >
          <MdLogout />
          {!collapsed && <span>Đăng xuất</span>}
        </div>
      </div>
    </aside>
  );
}
