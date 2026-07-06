import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MdSearch, MdAdd, MdCheck } from 'react-icons/md';
import { useToast, ToastContainer } from '../../components/common/Toast';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import { paymentService, invoiceService } from '../../services/otherServices';
import { paymentMethodLabels, formatCurrency, formatDate, formatMonth } from '../../utils/format';
import { usePagination } from '../../hooks/usePagination';

export default function Payments() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const invoiceParamId = searchParams.get('invoice_id');
  const [payments, setPayments] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const { page, limit, goToPage, changeLimit } = usePagination(1, 10);
  const { toasts, addToast } = useToast();

  const [form, setForm] = useState({ invoice_id: '', amount: '', payment_method: 'cash', note: '' });
  const [saving, setSaving] = useState(false);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (search) params.search = search;
      const res = await paymentService.getAll(params);
      setPayments(res.data.data || res.data.rows || []);
      setTotal(res.data.count || res.data.total || 0);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchPayments(); }, [page, limit, search]);

  const openCreate = async (invoiceId) => {
    try {
      const res = await invoiceService.getAll({ limit: 1000, status: ['unpaid', 'partial'] });
      setInvoices(res.data.data || res.data.rows || []);
    } catch {}
    setForm({ invoice_id: invoiceId ? String(invoiceId) : '', amount: '', payment_method: 'cash', note: '' });
    setShowCreateModal(true);
  };

  useEffect(() => {
    if (invoiceParamId) {
      openCreate(invoiceParamId);
      navigate('/payments', { replace: true });
    }
  }, [invoiceParamId]);

  const handleSave = async () => {
    if (!form.invoice_id || !form.amount) {
      addToast('Vui lòng chọn hóa đơn và nhập số tiền', 'warning');
      return;
    }
    setSaving(true);
    try {
      await paymentService.create(form);
      addToast('Ghi nhận thanh toán thành công', 'success');
      setShowCreateModal(false);
      fetchPayments();
    } catch (err) {
      addToast(err.response?.data?.message || 'Lỗi khi ghi nhận thanh toán', 'error');
    } finally { setSaving(false); }
  };

  const handleConfirm = async (id) => {
    try {
      await paymentService.confirm(id);
      addToast('Xác nhận thanh toán thành công', 'success');
      fetchPayments();
    } catch (err) {
      addToast(err.response?.data?.message || 'Xác nhận thất bại', 'error');
    }
  };

  return (
    <div>
      <ToastContainer toasts={toasts} removeToast={() => {}} />

      <div className="card">
        <div className="toolbar" style={{ padding: '16px 20px', marginBottom: 0 }}>
          <div className="toolbar-left">
            <div className="search-box">
              <MdSearch />
              <input type="text" placeholder="Tìm kiếm..." value={search} onChange={(e) => { setSearch(e.target.value); goToPage(1); }} />
            </div>
          </div>
          <div className="toolbar-right">
            <button className="btn btn-primary" onClick={openCreate}><MdAdd /> Ghi nhận thanh toán</button>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr><th>STT</th><th>Mã hóa đơn</th><th>Phòng</th><th>Số tiền</th><th>Ngày thanh toán</th><th>Phương thức</th><th>Ghi chú</th><th>Hành động</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-muted" style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }}></div></td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan={8} className="text-muted" style={{ textAlign: 'center', padding: 40 }}>Không có dữ liệu</td></tr>
              ) : payments.map((p, i) => (
                <tr key={p.id}>
                  <td>{(page - 1) * limit + i + 1}</td>
                  <td className="fw-600">#{p.invoice_id}</td>
                  <td>{p.invoice?.contract?.room?.room_number || '—'}</td>
                  <td className="fw-600 text-success">{formatCurrency(p.amount)}</td>
                  <td>{formatDate(p.payment_date)}</td>
                  <td>{paymentMethodLabels[p.payment_method] || p.payment_method}</td>
                  <td>{p.note || '—'}</td>
                  <td>
                    {!p.confirmed && (
                      <button className="btn btn-sm btn-success" onClick={() => handleConfirm(p.id)} title="Xác nhận">
                        <MdCheck />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination page={page} limit={limit} total={total} onPageChange={goToPage} onLimitChange={changeLimit} />
      </div>

      {showCreateModal && (
        <Modal
          title="Ghi nhận thanh toán"
          onClose={() => setShowCreateModal(false)}
          footer={<><button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Hủy</button><button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</button></>}
        >
          <div className="form-group">
            <label>Hóa đơn <span style={{ color: 'red' }}>*</span></label>
            <select className="form-control" value={form.invoice_id} onChange={(e) => {
              const inv = invoices.find(i => i.id == e.target.value);
              const paid = (inv?.payments || []).reduce((s, p) => s + Number(p.amount), 0);
              const remaining = inv ? Math.max(0, Number(inv.total_amount) - paid) : '';
              setForm({ ...form, invoice_id: e.target.value, amount: remaining });
            }}>
              <option value="">— Chọn hóa đơn —</option>
              {invoices.map((inv) => {
                const paid = (inv.payments || []).reduce((s, p) => s + Number(p.amount), 0);
                const remaining = Math.max(0, Number(inv.total_amount) - paid);
                return (
                  <option key={inv.id} value={inv.id}>
                    #{inv.id} — {inv.contract?.room?.room_number || ''} — {formatMonth(inv.billing_month)} — {formatCurrency(remaining)} con no / {formatCurrency(inv.total_amount)}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Số tiền (VNĐ) <span style={{ color: 'red' }}>*</span></label>
              <input type="number" className="form-control" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="VD: 3000000" />
            </div>
            <div className="form-group">
              <label>Phương thức</label>
              <select className="form-control" value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })}>
                <option value="cash">Tiền mặt</option>
                <option value="bank_transfer">Chuyển khoản</option>
                <option value="qr">Quét QR</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Ghi chú</label>
            <input className="form-control" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="VD: Thanh toán đủ tháng 6/2026" />
          </div>
        </Modal>
      )}
    </div>
  );
}
