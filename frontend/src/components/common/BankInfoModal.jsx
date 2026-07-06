import { useState, useEffect } from 'react';
import Modal from './Modal';
import { ownerConfigService } from '../../services/otherServices';

const BANK_OPTIONS = [
  { value: 'vietcombank', label: 'Vietcombank' },
  { value: 'vietinbank', label: 'Vietinbank' },
  { value: 'bidv', label: 'BIDV' },
  { value: 'agribank', label: 'Agribank' },
  { value: 'acb', label: 'ACB' },
  { value: 'mb', label: 'MB Bank' },
  { value: 'tcb', label: 'Techcombank (TCB)' },
  { value: 'techcombank', label: 'Techcombank' },
  { value: 'vietcapitalbank', label: 'VietCapital Bank' },
  { value: 'shinhanbank', label: 'Shinhan Bank' },
  { value: 'vpbank', label: 'VPBank' },
  { value: 'tpbank', label: 'TPBank' },
  { value: 'sacombank', label: 'Sacombank' },
  { value: 'eximbank', label: 'Eximbank' },
  { value: 'default', label: 'Khác' },
];

export default function BankInfoModal({ onClose }) {
  const [form, setForm] = useState({
    owner_name: '',
    bank_account: '',
    bank_name: '',
    bank_branch: '',
  });
  const [customBank, setCustomBank] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await ownerConfigService.get();
        if (res.data?.config) {
          setForm({
            owner_name: res.data.config.owner_name || '',
            bank_account: res.data.config.bank_account || '',
            bank_name: res.data.config.bank_name || '',
            bank_branch: res.data.config.bank_branch || '',
          });
          if (!BANK_OPTIONS.find(b => b.value === res.data.config.bank_name?.toLowerCase())) {
            setCustomBank(res.data.config.bank_name || '');
          }
        }
      } catch {
        setError('Không tải được thông tin tài khoản');
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleBankChange = (e) => {
    const val = e.target.value;
    if (val === 'default') {
      setCustomBank(form.bank_name || '');
      setForm({ ...form, bank_name: customBank || '' });
    } else {
      setCustomBank('');
      setForm({ ...form, bank_name: val });
    }
  };

  const handleCustomBankChange = (e) => {
    setCustomBank(e.target.value);
    setForm({ ...form, bank_name: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.owner_name.trim()) { setError('Tên chủ tài khoản không được trống'); return; }
    if (!form.bank_account.trim()) { setError('Số tài khoản không được trống'); return; }
    if (!form.bank_name.trim()) { setError('Tên ngân hàng không được trống'); return; }

    setSaving(true);
    try {
      await ownerConfigService.update(form);
      setSuccess(true);
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Thông tin tài khoản ngân hàng" onClose={onClose} size={480}>
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto' }}></div>
        </div>
      ) : success ? (
        <div style={{ padding: 24, background: '#d1fae5', color: '#065f46', borderRadius: 8, textAlign: 'center', fontWeight: 500, fontSize: 15 }}>
          Cập nhật thông tin thành công!
        </div>
      ) : (
        <form onSubmit={handleSave}>
          <div style={{ background: '#f8f9fa', borderRadius: 10, padding: 16, marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>
              Thông tin này sẽ được sử dụng để tạo mã QR thanh toán VietQR trên hóa đơn.
            </div>
          </div>

          <div className="form-group">
            <label>Tên chủ tài khoản <span style={{ color: 'red' }}>*</span></label>
            <input
              type="text"
              className="form-control"
              value={form.owner_name}
              onChange={(e) => setForm({ ...form, owner_name: e.target.value })}
              placeholder="VD: Nguyen Van A"
            />
          </div>

          <div className="form-group">
            <label>Số tài khoản <span style={{ color: 'red' }}>*</span></label>
            <input
              type="text"
              className="form-control"
              value={form.bank_account}
              onChange={(e) => setForm({ ...form, bank_account: e.target.value.replace(/\s/g, '') })}
              placeholder="VD: 1234567890"
            />
          </div>

          <div className="form-group">
            <label>Ngân hàng <span style={{ color: 'red' }}>*</span></label>
            <select
              className="form-control"
              value={BANK_OPTIONS.find(b => b.value === form.bank_name?.toLowerCase()) ? form.bank_name?.toLowerCase() : 'default'}
              onChange={handleBankChange}
            >
              {BANK_OPTIONS.map((b) => (
                <option key={b.value} value={b.value}>{b.label}</option>
              ))}
            </select>
          </div>

          {(form.bank_name?.toLowerCase() && !BANK_OPTIONS.find(b => b.value === form.bank_name?.toLowerCase())) || customBank ? (
            <div className="form-group">
              <label>Tên ngân hàng (tùy chỉnh)</label>
              <input
                type="text"
                className="form-control"
                value={customBank || form.bank_name}
                onChange={handleCustomBankChange}
                placeholder="VD: Vietcombank"
              />
            </div>
          ) : null}

          <div className="form-group">
            <label>Chi nhánh</label>
            <input
              type="text"
              className="form-control"
              value={form.bank_branch}
              onChange={(e) => setForm({ ...form, bank_branch: e.target.value })}
              placeholder="VD: Chi nhanh Quan 1"
            />
          </div>

          {error && (
            <div style={{ padding: '8px 12px', background: '#fee2e2', color: '#991b1b', borderRadius: 6, fontSize: 13, marginBottom: 12 }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Đang lưu...' : 'Lưu thông tin'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
