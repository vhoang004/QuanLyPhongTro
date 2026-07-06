import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Modal from './Modal';
import api from '../../services/api';

export default function AccountInfoModal({ onClose }) {
  const { user } = useAuth();

  const [editForm, setEditForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
  });
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setEditError('');
    if (!editForm.username.trim()) { setEditError('Tên đăng nhập không được trống'); return; }
    setEditLoading(true);
    try {
      await api.put('/auth/profile', editForm);
      setEditSuccess(true);
      localStorage.setItem('user', JSON.stringify({ ...user, ...editForm }));
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      setEditError(err.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <Modal title="Thông tin tài khoản" onClose={onClose} size={420}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <div style={{
          width: 60, height: 60, borderRadius: '50%',
          background: '#4f46e5', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, fontWeight: 700,
        }}>
          {user?.username?.charAt(0).toUpperCase() || 'A'}
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#1e293b' }}>
            {user?.username || 'Admin'}
          </div>
          <div style={{ fontSize: 13, color: '#64748b' }}>
            {user?.role === 'admin' ? 'Quản trị viên' : 'Chủ trọ'}
          </div>
        </div>
      </div>

      {editSuccess ? (
        <div style={{ padding: '16px', background: '#d1fae5', color: '#065f46', borderRadius: 8, textAlign: 'center', fontWeight: 500 }}>
          Cập nhật thành công!
        </div>
      ) : (
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>Tên đăng nhập</label>
            <input
              type="text"
              className="form-control"
              value={editForm.username}
              onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              className="form-control"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
            />
          </div>
          {editError && (
            <div style={{ padding: '8px 12px', background: '#fee2e2', color: '#991b1b', borderRadius: 6, fontSize: 13, marginBottom: 8 }}>
              {editError}
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn btn-primary" disabled={editLoading}>
              {editLoading ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
