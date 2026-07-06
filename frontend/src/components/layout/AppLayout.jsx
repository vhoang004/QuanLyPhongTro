import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useState } from 'react';
import { MdMenu } from 'react-icons/md';

export default function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className={`app-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <button
        className="sidebar-toggle-btn"
        onClick={() => setSidebarCollapsed(v => !v)}
        title={sidebarCollapsed ? 'Mở menu' : 'Đóng menu'}
      >
        <MdMenu size={20} />
      </button>
      <Sidebar collapsed={sidebarCollapsed} />
      <div className="main-content">
        <Header />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
