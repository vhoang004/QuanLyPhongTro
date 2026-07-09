import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { MdLock, MdLogout, MdPerson, MdAccountBalanceWallet } from 'react-icons/md';
import { useAuth } from '../../contexts/AuthContext';
import AccountInfoModal from '../common/AccountInfoModal';
import BankInfoModal from '../common/BankInfoModal';
import ChangePasswordModal from '../common/ChangePasswordModal';

const pageTitles = {
  '/dashboard': 'Tổng quan',
  '/rooms': 'Phòng trọ',
  '/tenants': 'Người thuê',
  '/contracts': 'Hợp đồng',
  '/services': 'Dịch vụ',
  '/meter-readings': 'Đồng hồ điện/nước',
  '/invoices': 'Hóa đơn',
  '/payments': 'Thanh toán',
  '/debts': 'Công nợ',
  '/owner-config': 'Cấu hình',
  '/accounts': 'Tài khoản',
};

export default function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAccountInfo, setShowAccountInfo] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showBankInfo, setShowBankInfo] = useState(false);
  const menuRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = async () => {
    // #region agent log
    fetch('http://127.0.0.1:7691/ingest/b7170261-fdc1-4338-8711-7e3024e1f6c4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'c12ae2'},body:JSON.stringify({sessionId:'c12ae2',location:'Header.jsx:logout',message:'Header logout start',runId:'post-fix',hypothesisId:'H6',timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    setShowUserMenu(false);
    try {
      await logout();
    } finally {
      // #region agent log
      fetch('http://127.0.0.1:7691/ingest/b7170261-fdc1-4338-8711-7e3024e1f6c4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'c12ae2'},body:JSON.stringify({sessionId:'c12ae2',location:'Header.jsx:logout',message:'Header logout completed, navigating',runId:'post-fix',hypothesisId:'H6',timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      navigate('/login', { replace: true });
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const title = Object.entries(pageTitles).find(([path]) => pathname.startsWith(path))?.[1] || 'Dịch vụ';
  const isAdmin = user.role === 'admin';

  return (
    <header className="header">
      <div className="header-left">
        <h3>{title}</h3>
      </div>

      <div className="header-right">
        <div className="header-user" ref={menuRef} style={{ position: 'relative' }}>
          <div
            className="header-user-avatar"
            onClick={() => setShowUserMenu(v => !v)}
            style={{ cursor: 'pointer' }}
          >
            {user.username?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div onClick={() => setShowUserMenu(v => !v)} style={{ cursor: 'pointer' }}>
            <div className="header-user-name">{user.username || 'Admin'}</div>
            <div className="header-user-role">{user.role === 'admin' ? 'Quản trị viên' : 'Chủ trọ'}</div>
          </div>
          {showUserMenu && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, marginTop: 8,
              background: '#fff', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              minWidth: 200, zIndex: 1000, overflow: 'hidden',
            }}>
              <button
                onClick={() => { setShowAccountInfo(true); setShowUserMenu(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                  padding: '10px 16px', border: 'none', background: 'none',
                  cursor: 'pointer', fontSize: 14, textAlign: 'left', color: '#333',
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#f3f4f6'}
                onMouseOut={(e) => e.currentTarget.style.background = 'none'}
              >
                <MdPerson size={16} /> Thông tin tài khoản
              </button>
              {!isAdmin && (
              <button
                onClick={() => { setShowBankInfo(true); setShowUserMenu(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                  padding: '10px 16px', border: 'none', background: 'none',
                  cursor: 'pointer', fontSize: 14, textAlign: 'left', color: '#333',
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#f3f4f6'}
                onMouseOut={(e) => e.currentTarget.style.background = 'none'}
              >
                <MdAccountBalanceWallet size={16} /> Tài khoản ngân hàng
              </button>
              )}
              <button
                onClick={() => { setShowChangePassword(true); setShowUserMenu(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                  padding: '10px 16px', border: 'none', background: 'none',
                  cursor: 'pointer', fontSize: 14, textAlign: 'left', color: '#333',
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#f3f4f6'}
                onMouseOut={(e) => e.currentTarget.style.background = 'none'}
              >
                <MdLock size={16} /> Đổi mật khẩu
              </button>
              <button
                onClick={handleLogout}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                  padding: '10px 16px', border: 'none', background: 'none',
                  cursor: 'pointer', fontSize: 14, textAlign: 'left', color: '#dc2626',
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#f3f4f6'}
                onMouseOut={(e) => e.currentTarget.style.background = 'none'}
              >
                <MdLogout size={16} /> Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>

      {showAccountInfo && (
        <AccountInfoModal
          onClose={() => setShowAccountInfo(false)}
        />
      )}

      {showBankInfo && (
        <BankInfoModal
          onClose={() => setShowBankInfo(false)}
        />
      )}

      {showChangePassword && (
        <ChangePasswordModal
          onClose={() => setShowChangePassword(false)}
        />
      )}
    </header>
  );
}
