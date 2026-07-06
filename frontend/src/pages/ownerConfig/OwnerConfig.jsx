import { useState, useEffect } from 'react';
import { useToast, ToastContainer } from '../../components/common/Toast';
import { ownerConfigService } from '../../services/otherServices';

export default function OwnerConfig() {
  const [form, setForm] = useState({
    owner_name: '',
    bank_account: '',
    bank_name: '',
    bank_branch: '',
    qr_template: 'vietqr',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toasts, addToast } = useToast();

  useEffect(() => {
    const fetchConfig = async () => {
      setLoading(true);
      try {
        const res = await ownerConfigService.get();
        if (res.data) {
          setForm({
            owner_name: res.data.owner_name || '',
            bank_account: res.data.bank_account || '',
            bank_name: res.data.bank_name || '',
            bank_branch: res.data.bank_branch || '',
            qr_template: res.data.qr_template || 'vietqr',
          });
        }
      } catch {} finally { setLoading(false); }
    };
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await ownerConfigService.update(form);
      addToast('Lưu cấu hình thành công', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Lưu cấu hình thất bại', 'error');
    } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="loading-spinner"><div className="spinner"></div></div>
    );
  }

  return (
    <div>
      <ToastContainer toasts={toasts} removeToast={() => {}} />

      <div className="card">
        <div className="card-header">
          <h4>Thông tin chủ nhà</h4>
        </div>
        <div className="card-body">
          <div className="form-group">
            <label>Tên chủ nhà</label>
            <input className="form-control" value={form.owner_name} onChange={(e) => setForm({ ...form, owner_name: e.target.value })} placeholder="VD: Nguyễn Văn A" />
          </div>

          <div className="card-header" style={{ marginTop: 24 }}>
            <h4>Thông tin tài khoản ngân hàng</h4>
          </div>
          <div className="card-body" style={{ paddingTop: 0 }}>
            <div className="form-row">
              <div className="form-group">
                <label>Số tài khoản</label>
                <input className="form-control" value={form.bank_account} onChange={(e) => setForm({ ...form, bank_account: e.target.value })} placeholder="VD: 1234567890" />
              </div>
              <div className="form-group">
                <label>Tên ngân hàng</label>
                <input className="form-control" value={form.bank_name} onChange={(e) => setForm({ ...form, bank_name: e.target.value })} placeholder="VD: Vietcombank" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Chi nhánh</label>
                <input className="form-control" value={form.bank_branch} onChange={(e) => setForm({ ...form, bank_branch: e.target.value })} placeholder="VD: Chi nhánh HCM" />
              </div>
              <div className="form-group">
                <label>Mẫu QR</label>
                <select className="form-control" value={form.qr_template} onChange={(e) => setForm({ ...form, qr_template: e.target.value })}>
                  <option value="vietqr">VietQR</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
