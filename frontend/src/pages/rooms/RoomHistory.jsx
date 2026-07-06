import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import api from '../../services/api';
import { roomTypeLabels } from '../../utils/format';

export default function RoomHistory() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [roomRes, contractsRes] = await Promise.all([
          api.get(`/rooms/${roomId}`),
          api.get(`/contracts/by-room/${roomId}`),
        ]);
        setRoom(roomRes.data.room || roomRes.data);
        const contractsData = contractsRes.data.data || contractsRes.data || [];
        setContracts(contractsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (roomId) fetchData();
  }, [roomId]);

  const getStatusBadge = (status) => {
    const map = { active: 'success', expired: 'warning', terminated: 'secondary' };
    const labels = { active: 'Hiệu lực', expired: 'Hết hạn', terminated: 'Đã thanh lý' };
    return (
      <span className={`badge badge-${map[status] || 'secondary'}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/rooms')}
          style={{ padding: '6px 12px' }}
        >
          <MdArrowBack />
        </button>
        <h1 className="page-title" style={{ margin: 0 }}></h1>
      </div>

      {room && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ padding: '12px 16px' }}>
            <strong>Loại phòng:</strong> {roomTypeLabels[room.room_type] || room.room_type} &nbsp;|&nbsp;
            <strong>Giá thuê:</strong> {parseFloat(room.base_price).toLocaleString('vi-VN')} đ/tháng &nbsp;|&nbsp;
            <strong>Diện tích:</strong> {room.area} m²
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h4>Danh sách người từng thuê</h4>
        </div>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Người thuê</th>
                <th>Ngày bắt đầu</th>
                <th>Ngày kết thúc</th>
                <th>Giá thuê</th>
                <th>Cọc</th>
                <th>Trạng thái HĐ</th>
                <th>Nghiệm thu</th>
              </tr>
            </thead>
            <tbody>
              {contracts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-muted" style={{ textAlign: 'center', padding: 40 }}>
                    Chưa có lịch sử thuê
                  </td>
                </tr>
              ) : contracts.map((c, i) => (
                <tr key={c.id}>
                  <td>{i + 1}</td>
                  <td className="fw-600">{c.tenant?.full_name || '—'}</td>
                  <td>{c.start_date ? new Date(c.start_date).toLocaleDateString('vi-VN') : '—'}</td>
                  <td>{c.end_date ? new Date(c.end_date).toLocaleDateString('vi-VN') : '—'}</td>
                  <td>{parseFloat(c.price_per_month).toLocaleString('vi-VN')} đ</td>
                  <td>{parseFloat(c.deposit || 0).toLocaleString('vi-VN')} đ</td>
                  <td>{getStatusBadge(c.status)}</td>
                  <td>
                    {c.status === 'active' ? (
                      <span className="badge badge-info">Đang ở</span>
                    ) : (
                      <span className={`badge badge-${c.handover_status === 'good' ? 'success' : c.handover_status === 'damaged' ? 'danger' : 'secondary'}`}>
                        {c.handover_status === 'good' ? 'Tốt' : c.handover_status === 'damaged' ? 'Hư hỏng' : '—'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
