import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdVisibility, MdVisibilityOff, MdHome } from 'react-icons/md';
import { useAuth } from '../../contexts/AuthContext';
import Modal from '../../components/common/Modal';
import api from '../../services/api';

export default function Login() {
  const { user, login, loading } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot password state
  const [showForgot, setShowForgot] = useState(false);
  const [step, setStep] = useState(1); // 1: enter email, 2: enter OTP + new password
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');

  useEffect(() => {
    if (!loading && user) {
      navigate(user.role === 'admin' ? '/accounts' : '/dashboard', { replace: true });
    }
  }, [loading, user, navigate]);

  if (loading) return null;
  if (user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Vui lòng nhập tên đăng nhập và mật khẩu');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      const userData = await login(username, password);
      navigate(userData?.role === 'admin' ? '/accounts' : '/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Đăng nhập thất bại';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotLoading(true);
    setForgotMsg('');
    setForgotError('');
    try {
      await api.post('/auth/forgot-password', { email: forgotEmail });
      setForgotMsg('Mã xác minh đã được gửi đến email của bạn.');
      setStep(2);
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Không thể gửi mã. Vui lòng thử lại.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotError('');
    if (!forgotOtp.trim()) { setForgotError('Vui lòng nhập mã xác minh.'); return; }
    if (!newPassword || newPassword.length < 6) { setForgotError('Mật khẩu mới phải ít nhất 6 ký tự.'); return; }
    if (newPassword !== confirmPassword) { setForgotError('Mật khẩu xác nhận không khớp.'); return; }
    setForgotLoading(true);
    try {
      await api.post('/auth/reset-password', { email: forgotEmail, otp: forgotOtp, newPassword });
      setForgotMsg('Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay.');
      setStep(3);
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Mã xác minh không đúng hoặc đã hết hạn.');
    } finally {
      setForgotLoading(false);
    }
  };

  const resetForgotModal = () => {
    setShowForgot(false);
    setStep(1);
    setForgotEmail('');
    setForgotOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setForgotMsg('');
    setForgotError('');
    setForgotLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div style={{
            width: 72,
            height: 72,
            borderRadius: 16,
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 24px rgba(79, 70, 229, 0.3)',
          }}>
            <MdHome size={40} color="#fff" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b' }}>
            Hệ thống quản lý phòng trọ
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên đăng nhập</label>
            <input
              type="text"
              className="form-control"
              placeholder="Nhập tên đăng nhập"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Mật khẩu</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingRight: 40 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#64748b', padding: 4,
                }}
              >
                {showPassword ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'right', marginBottom: 12 }}>
            <button
              type="button"
              className="btn-link"
              onClick={() => { resetForgotModal(); setShowForgot(true); }}
              style={{ background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', fontSize: 13, padding: 0 }}
            >
              Quên mật khẩu?
            </button>
          </div>

          {error && <div className="form-error" style={{ marginBottom: 12 }}>{error}</div>}

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>

      {showForgot && (
        <Modal
          title={
            step === 1 ? 'Quên mật khẩu'
              : step === 2 ? 'Nhập mã xác minh'
              : 'Đặt lại mật khẩu thành công'
          }
          onClose={resetForgotModal}
          footer={
            step < 3 ? (
              <button className="btn btn-secondary" onClick={resetForgotModal}>Đóng</button>
            ) : (
              <button className="btn btn-primary" onClick={resetForgotModal}>Đóng</button>
            )
          }
        >
          {step === 1 && (
            <>
              <p style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
                Nhập email đã đăng ký. Chúng tôi sẽ gửi mã xác minh 6 chữ số.
              </p>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="VD: admin@qlpt.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  autoFocus
                />
              </div>
              {forgotMsg && <div className="form-success" style={{ marginTop: 8 }}>{forgotMsg}</div>}
              {forgotError && <div className="form-error" style={{ marginTop: 8 }}>{forgotError}</div>}
              <button
                className="btn btn-primary"
                style={{ marginTop: 12, width: '100%' }}
                disabled={!forgotEmail.trim() || forgotLoading}
                onClick={handleSendOtp}
              >
                {forgotLoading ? 'Đang gửi...' : 'Gửi mã xác minh'}
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <p style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
                Mã xác minh đã được gửi đến <strong>{forgotEmail}</strong>.<br />
                Vui lòng nhập mã và đặt mật khẩu mới.
              </p>
              <div className="form-group">
                <label>Mã xác minh (6 chữ số)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="VD: 123456"
                  value={forgotOtp}
                  onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Mật khẩu mới</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Ít nhất 6 ký tự"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              {forgotError && <div className="form-error" style={{ marginTop: 8 }}>{forgotError}</div>}
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => { setStep(1); setForgotMsg(''); setForgotError(''); }}
                >
                  Quay lại
                </button>
                <button
                  className="btn btn-primary"
                  style={{ flex: 2 }}
                  disabled={!forgotOtp || !newPassword || !confirmPassword || forgotLoading}
                  onClick={handleResetPassword}
                >
                  {forgotLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>✓</div>
              <p style={{ fontSize: 15, color: '#065f46', fontWeight: 600 }}>{forgotMsg}</p>
              <p style={{ fontSize: 13, color: '#666', marginTop: 8 }}>
                Bây giờ bạn có thể đăng nhập với mật khẩu mới.
              </p>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
