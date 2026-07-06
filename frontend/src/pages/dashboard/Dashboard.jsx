import { useState, useEffect } from 'react';
import { MdApartment, MdPeople, MdReceipt, MdTrendingUp, MdWarning, MdCheckCircle } from 'react-icons/md';
import api from '../../services/api';
import { formatCurrency, formatMonth } from '../../utils/format';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, revenueRes, debtRes, invoicesRes, contractsRes] = await Promise.all([
          api.get('/dashboard'),
          api.get('/dashboard/revenue'),
          api.get('/dashboard/debt'),
          api.get('/invoices', { params: { limit: 5, status: '' } }),
          api.get('/contracts/expiring', { params: { days: 15 } }),
        ]);
        setStats({
          rooms: dashRes.data.rooms || {},
          tenants: dashRes.data.tenants || {},
          contracts: dashRes.data.contracts || {},
          revenue: dashRes.data.revenue || {},
          invoices: dashRes.data.invoices || {},
          revenueStats: revenueRes.data,
          debt: debtRes.data,
          recentInvoices: invoicesRes.data.data || invoicesRes.data.rows || [],
          expiringContracts: contractsRes.data.contracts || [],
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  const s = stats || {};
  const rooms = s.rooms || {};
  const revenue = s.revenue || {};
  const debt = s.debt || {};
  const revenueStats = s.revenueStats || {};
  const revenueData = revenueStats.stats || [];

  const months = revenueData.slice(-6);
  const maxRevenue = Math.max(...months.map(m => m.total), 1);

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue"><MdApartment /></div>
          <div className="stat-info">
            <h3>{rooms.total || 0}</h3>
            <p>Tổng phòng</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><MdCheckCircle /></div>
          <div className="stat-info">
            <h3>{rooms.available || 0}</h3>
            <p>Phòng trống</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><MdPeople /></div>
          <div className="stat-info">
            <h3>{rooms.rented || 0}</h3>
            <p>Đang thuê</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple"><MdWarning /></div>
          <div className="stat-info">
            <h3>{rooms.maintenance || 0}</h3>
            <p>Bảo trì</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple"><MdReceipt /></div>
          <div className="stat-info">
            <h3>{s.tenants?.total || 0}</h3>
            <p>Người thuê</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><MdTrendingUp /></div>
          <div className="stat-info">
            <h3>{formatCurrency(revenue.month)}</h3>
            <p>Doanh thu tháng này</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red"><MdWarning /></div>
          <div className="stat-info">
            <h3>{formatCurrency(debt.total_debt)}</h3>
            <p>Công nợ ({debt.count || 0} hóa đơn)</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <div className="card">
          <div className="card-header">
            <h4>Doanh thu theo tháng</h4>
          </div>
          <div style={{ padding: '16px 20px' }}>
            {months.length === 0 ? (
              <p className="text-muted" style={{ textAlign: 'center', padding: 20 }}>Chưa có dữ liệu doanh thu</p>
            ) : (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 140 }}>
                {months.map((m) => {
                  const pct = (m.total / maxRevenue) * 100;
                  return (
                    <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <div style={{
                        width: '100%',
                        background: '#4f46e5',
                        borderRadius: '4px 4px 0 0',
                        minHeight: 4,
                        height: `${Math.max(pct, 5)}%`,
                        transition: 'height 0.3s',
                      }} />
                      <span style={{ fontSize: 11, color: '#6b7280' }}>{m.month?.slice(5)}</span>
                    </div>
                  );
                })}
              </div>
            )}
            {revenueData.length > 0 && (
              <div style={{ marginTop: 12, padding: '10px 14px', background: '#f0fdf4', borderRadius: 8, fontSize: 13 }}>
                Tổng doanh thu: <strong>{formatCurrency(revenueStats.total || 0)}</strong>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h4>Tỷ lệ lấp đầy</h4>
          </div>
          <div style={{ padding: '16px 20px', textAlign: 'center' }}>
            <div style={{
              width: 120, height: 120, borderRadius: '50%',
              background: 'conic-gradient(#4f46e5 0% ' + (rooms.occupancy_rate || 0) + '%, #e5e7eb ' + (rooms.occupancy_rate || 0) + '% 100%)',
              margin: '0 auto 12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ width: 90, height: 90, borderRadius: '50%', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 20, fontWeight: 700, color: '#4f46e5' }}>{rooms.occupancy_rate || 0}%</span>
              </div>
            </div>
            <div style={{ fontSize: 13, color: '#6b7280' }}>
              {rooms.rented || 0} / {rooms.total || 0} phòng đang thuê
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
        <div className="card">
          <div className="card-header">
            <h4>Hóa đơn gần đây</h4>
          </div>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Phòng</th>
                  <th>Tháng</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {s.recentInvoices?.length > 0 ? s.recentInvoices.map((inv) => (
                  <tr key={inv.id}>
                    <td>{inv.contract?.room?.room_number || '—'}</td>
                    <td>{formatMonth(inv.billing_month)}</td>
                    <td className="fw-600">{formatCurrency(inv.total_amount)}</td>
                    <td>
                      <span className={`badge badge-${inv.status === 'paid' ? 'success' : inv.status === 'partial' ? 'warning' : 'danger'}`}>
                        {inv.status === 'paid' ? 'Đã TT' : inv.status === 'partial' ? 'Một phần' : 'Chưa TT'}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className="text-muted" style={{ textAlign: 'center', padding: 20 }}>Không có dữ liệu</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h4>Hợp đồng sắp hết hạn (&lt;15 ngày)</h4>
          </div>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Phòng</th>
                  <th>Người thuê</th>
                  <th>Ngày hết hạn</th>
                  <th>Số ngày</th>
                </tr>
              </thead>
              <tbody>
                {s.expiringContracts?.length > 0 ? s.expiringContracts.map((c) => {
                  const daysLeft = Math.ceil((new Date(c.end_date) - new Date()) / (1000 * 60 * 60 * 24));
                  return (
                    <tr key={c.id}>
                      <td>{c.room?.room_number || '—'}</td>
                      <td>{c.tenant?.full_name || '—'}</td>
                      <td>{new Date(c.end_date).toLocaleDateString('vi-VN')}</td>
                      <td className={daysLeft <= 7 ? 'text-danger fw-600' : 'text-warning'}>
                        {daysLeft} ngày
                      </td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan={4} className="text-muted" style={{ textAlign: 'center', padding: 20 }}>Không có hợp đồng sắp hết hạn</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
