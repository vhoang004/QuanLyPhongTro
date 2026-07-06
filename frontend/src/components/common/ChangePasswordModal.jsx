import { useState } from 'react';
import { MdLock } from 'react-icons/md';
import api from '../../services/api';
import Modal from './Modal';

export default function ChangePasswordModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    if (form.newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('Mật khẩu mới không khớp');
      return;
    }
    if (form.currentPassword === form.newPassword) {
      setError('Mật khẩu mới phải khác mật khẩu hiện tại');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setSuccess(true);
      if (onSuccess) onSuccess();
      setTimeout(onClose, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Đổi mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Đổi mật khẩu"
      onClose={onClose}
      footer={
        success ? (
          <button className="btn btn-secondary" onClick={onClose}>Đóng</button>
        ) : (
          <>
            <button className="btn btn-secondary" onClick={onClose}>Hủy</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
            </button>
          </>
        )
      }
    >
      {success ? (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
          <p style={{ color: '#065f46', fontWeight: 600 }}>Đổi mật khẩu thành công!</p>
          <p style={{ fontSize: 13, color: '#6b7280' }}>Cửa sổ sẽ đóng sau giây lát...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Mật khẩu hiện tại <span style={{ color: 'red' }}>*</span></label>
            <input
              type="password"
              className="form-control"
              value={form.currentPassword}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
              placeholder="Nhập mật khẩu hiện tại"
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Mật khẩu mới <span style={{ color: 'red' }}>*</span></label>
            <input
              type="password"
              className="form-control"
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              placeholder="Ít nhất 6 ký tự"
            />
          </div>
          <div className="form-group">
            <label>Xác nhận mật khẩu mới <span style={{ color: 'red' }}>*</span></label>
            <input
              type="password"
              className="form-control"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              placeholder="Nhập lại mật khẩu mới"
            />
          </div>
          {error && (
            <div style={{ padding: '10px 14px', background: '#fee2e2', color: '#991b1b', borderRadius: 6, fontSize: 13 }}>
              {error}
            </div>
          )}
        </form>
      )}
    </Modal>
  );
}
