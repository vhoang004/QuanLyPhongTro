import { useState, useEffect } from 'react';
import { MdSearch, MdRefresh, MdReceipt, MdAdd, MdRemove } from 'react-icons/md';
import { useToast, ToastContainer } from '../../components/common/Toast';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import Pagination from '../../components/common/Pagination';
import { debtService } from '../../services/debtService';
import { formatCurrency, formatMonth, invoiceStatusLabels } from '../../utils/format';
import { usePagination } from '../../hooks/usePagination';

export default function Debts() {
  const [debts, setDebts] = useState([]);
  const [summary, setSummary] = useState({ total_must_pay: 0, total_paid: 0, total_debt: 0, unpaid_count: 0 });
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [billingMonth, setBillingMonth] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [availableMonths, setAvailableMonths] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [debtDetails, setDebtDetails] = useState(null);
  const [adjustments, setAdjustments] = useState([]);
  const { page, limit, goToPage, changeLimit } = usePagination(1, 10);
  const { toasts, addToast } = useToast();

  const [adjustmentForm, setAdjustmentForm] = useState({ type: 'surcharge', description: '', amount: '' });
  const [saving, setSaving] = useState(false);
  const [deleteAdjId, setDeleteAdjId] = useState(null);

  const fetchDebts = async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (search) params.search = search;
      if (billingMonth) params.billing_month = billingMonth;
      if (statusFilter) params.status = statusFilter;
      const res = await debtService.getAll(params);
      setDebts(res.data.data || res.data.rows || []);
      setTotal(res.data.count || res.data.total || 0);
    } catch (err) {
      addToast('Không thể tải danh sách công nợ', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const params = {};
      if (billingMonth) params.billing_month = billingMonth;
      const res = await debtService.getSummary(params);
      setSummary(res.data);
    } catch {}
  };

  const fetchAvailableMonths = async () => {
    try {
      const res = await debtService.getAll({ limit: 1000 });
      const debts = res.data.data || res.data.rows || res.data || [];
      const months = [...new Set(debts.map(d => d.billing_month))].sort().reverse();
      setAvailableMonths(months);
    } catch {}
  };

  useEffect(() => {
    fetchDebts();
    fetchSummary();
  }, [page, limit, search, billingMonth, statusFilter]);
  useEffect(() => { fetchAvailableMonths(); }, []);

  const openDetail = async (debt) => {
    setSelectedDebt(debt);
    try {
      const res = await debtService.getDetails(debt.id);
      setDebtDetails(res.data.invoice);
      setAdjustments(res.data.adjustments || []);
    } catch {
      addToast('Không thể tải chi tiết', 'error');
    }
    setShowDetailModal(true);
  };

  const openAdjustment = (debt) => {
    setSelectedDebt(debt);
    setAdjustmentForm({ type: 'surcharge', description: '', amount: '' });
    setShowAdjustmentModal(true);
  };

  const handleAdjustment = async (e) => {
    e.preventDefault();
    if (!adjustmentForm.amount || parseFloat(adjustmentForm.amount) <= 0) {
      addToast('Số tiền phải lớn hơn 0', 'error');
      return;
    }
    setSaving(true);
    try {
      await debtService.createAdjustment({
        contract_id: selectedDebt.contract_id,
        billing_month: selectedDebt.billing_month,
        type: adjustmentForm.type,
        description: adjustmentForm.description,
        amount: parseFloat(adjustmentForm.amount),
      });
      addToast('Thêm điều chỉnh thành công', 'success');
      setShowAdjustmentModal(false);
      fetchDebts();
      fetchSummary();
    } catch (err) {
      addToast(err.response?.data?.message || 'Lỗi khi thêm điều chỉnh', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAdjustment = async (adjId) => {
    setDeleteAdjId(adjId);
  };

  const confirmDeleteAdjustment = async () => {
    if (!deleteAdjId) return;
    try {
      await debtService.deleteAdjustment(deleteAdjId);
      addToast('Xóa điều chỉnh thành công', 'success');
      if (selectedDebt) {
        const res = await debtService.getDetails(selectedDebt.id);
        setAdjustments(res.data.adjustments || []);
      }
      fetchDebts();
      fetchSummary();
    } catch {
      addToast('Lỗi khi xóa điều chỉnh', 'error');
    } finally {
      setDeleteAdjId(null);
    }
  };

  const getStatusBadge = (status, remainingDebt) => {
    if (status === 'paid' || remainingDebt <= 0) {
      return <span className="badge badge-success">Đã thanh toán</span>;
    }
    if (status === 'partial' || remainingDebt > 0) {
      return <span className="badge badge-warning">Còn nợ</span>;
    }
    return <span className="badge badge-danger">Chưa thanh toán</span>;
  };

  const getRowClass = (status, remainingDebt) => {
    if (status === 'paid' || remainingDebt <= 0) return 'row-paid';
    if (status === 'partial') return 'row-partial';
    return 'row-unpaid';
  };

  return (
    <div className="page-container">
      <ToastContainer toasts={toasts} removeToast={() => {}} />

      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: '#1a1a2e' }}>
          Tổng hợp tình hình tài chính
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          <div style={{
            background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
            borderRadius: 12,
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            boxShadow: '0 2px 8px rgba(30, 136, 229, 0.15)'
          }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: '#1976d2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <MdReceipt size={24} color="#fff" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 13, color: '#1565c0', fontWeight: 500 }}>Tổng phải thanh toán</p>
              <p style={{ margin: '4px 0 0', fontSize: 20, fontWeight: 700, color: '#0d47a1' }}>{formatCurrency(summary.total_must_pay)}</p>
              <p style={{ margin: '2px 0 0', fontSize: 11, color: '#1565c0' }}>(Nợ cũ + Phát sinh mới)</p>
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
            borderRadius: 12,
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            boxShadow: '0 2px 8px rgba(56, 142, 60, 0.15)'
          }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: '#388e3c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <MdReceipt size={24} color="#fff" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 13, color: '#2e7d32', fontWeight: 500 }}>Số tiền đã thanh toán</p>
              <p style={{ margin: '4px 0 0', fontSize: 20, fontWeight: 700, color: '#1b5e20' }}>{formatCurrency(summary.total_paid)}</p>
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #fbe9e7 0%, #ffccbc 100%)',
            borderRadius: 12,
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            boxShadow: '0 2px 8px rgba(244, 67, 54, 0.15)'
          }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: '#d32f2f', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <MdReceipt size={24} color="#fff" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 13, color: '#c62828', fontWeight: 500 }}>Số tiền còn nợ</p>
              <p style={{ margin: '4px 0 0', fontSize: 20, fontWeight: 700, color: '#b71c1c' }}>{formatCurrency(summary.total_debt)}</p>
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
            borderRadius: 12,
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            boxShadow: '0 2px 8px rgba(245, 124, 0, 0.15)'
          }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: '#f57c00', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <MdReceipt size={24} color="#fff" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 13, color: '#e65100', fontWeight: 500 }}>Hóa đơn nợ</p>
              <p style={{ margin: '4px 0 0', fontSize: 20, fontWeight: 700, color: '#bf360c' }}>{summary.unpaid_count || 0}</p>
              <p style={{ margin: '2px 0 0', fontSize: 11, color: '#e65100' }}>chưa thanh toán đủ</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <MdSearch size={18} style={{ position: 'absolute', left: 10, color: '#999' }} />
              <input
                type="text"
                placeholder="Tìm kiếm phòng, người thuê..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); goToPage(1); }}
                style={{ paddingLeft: 34, height: 36, border: '1px solid #e0e0e0', borderRadius: 8, outline: 'none', fontSize: 14, width: 240 }}
              />
            </div>
            <select
              value={billingMonth}
              onChange={(e) => { setBillingMonth(e.target.value); goToPage(1); }}
              style={{ height: 36, border: '1px solid #e0e0e0', borderRadius: 8, outline: 'none', fontSize: 14, padding: '0 10px', color: '#333', background: '#fff', cursor: 'pointer' }}
            >
              <option value="">Tất cả kỳ</option>
              {availableMonths.map(m => (
                <option key={m} value={m}>{formatMonth(m)}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); goToPage(1); }}
              style={{ height: 36, border: '1px solid #e0e0e0', borderRadius: 8, outline: 'none', fontSize: 14, padding: '0 10px', color: '#333', background: '#fff', cursor: 'pointer' }}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="unpaid">Chưa thanh toán</option>
              <option value="paid">Đã thanh toán</option>
              <option value="partial">Còn nợ</option>
            </select>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 70 }}>STT</th>
                <th>Phòng</th>
                <th>Người thuê</th>
                <th>Kỳ thanh toán</th>
                <th style={{ textAlign: 'right' }}>Tổng phải thanh toán</th>
                <th style={{ textAlign: 'right' }}>Đã thanh toán</th>
                <th style={{ textAlign: 'right' }}>Còn nợ</th>
                <th style={{ width: 130, textAlign: 'center' }}>Trạng thái</th>
                <th style={{ width: 110, textAlign: 'center' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: 32, color: '#999' }}>Đang tải...</td></tr>
              ) : debts.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: 32, color: '#999' }}>Không có dữ liệu công nợ</td></tr>
              ) : debts.map((debt, i) => {
                const rd = Math.max(0, debt.remaining_debt || 0);
                const rowClass = getRowClass(debt.status, rd);
                return (
                  <tr key={debt.id} className={rowClass}>
                    <td style={{ color: '#999', fontSize: 13 }}>{(page - 1) * limit + i + 1}</td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#1976d2' }}>
                        {debt.contract?.room?.room_number || '-'}
                      </span>
                    </td>
                    <td>{debt.contract?.tenant?.full_name || '-'}</td>
                    <td style={{ color: '#555' }}>{formatMonth(debt.billing_month)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: '#333' }}>
                      {formatCurrency(debt.total_amount)}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: '#388e3c' }}>
                      {formatCurrency(debt.paid_amount)}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: rd > 0 ? '#d32f2f' : '#388e3c' }}>
                      {formatCurrency(rd)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {getStatusBadge(debt.status, rd)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => openDetail(debt)}
                          title="Xem chi tiết"
                          style={{ minWidth: 32, padding: '4px 8px' }}
                        >
                          <MdReceipt size={14} />
                        </button>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => openAdjustment(debt)}
                          title="Điều chỉnh"
                          style={{ minWidth: 32, padding: '4px 8px' }}
                        >
                          <MdAdd size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '16px 20px', borderTop: '1px solid #f0f0f0' }}>
          <Pagination
            page={page}
            limit={limit}
            total={total}
            onPageChange={goToPage}
            onLimitChange={changeLimit}
          />
        </div>
      </div>

      {showDetailModal && debtDetails && (
        <Modal title="Chi tiết công nợ" size={700} onClose={() => setShowDetailModal(false)}>
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20, padding: 16, background: '#f8f9fa', borderRadius: 10 }}>
              <div>
                <p style={{ margin: 0, fontSize: 12, color: '#999' }}>Phòng</p>
                <p style={{ margin: '2px 0 0', fontWeight: 600, color: '#1976d2', fontSize: 15 }}>{debtDetails.contract?.room?.room_number}</p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 12, color: '#999' }}>Người thuê</p>
                <p style={{ margin: '2px 0 0', fontWeight: 600, fontSize: 15 }}>{debtDetails.contract?.tenant?.full_name}</p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 12, color: '#999' }}>Kỳ thanh toán</p>
                <p style={{ margin: '2px 0 0', fontWeight: 600, fontSize: 15 }}>{formatMonth(debtDetails.billing_month)}</p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 12, color: '#999' }}>Trạng thái</p>
                <p style={{ margin: '2px 0 0', fontWeight: 600, fontSize: 15 }}>{getStatusBadge(debtDetails.status, Math.max(0, debtDetails.remaining_debt || 0))}</p>
              </div>
            </div>

            <table className="table" style={{ marginBottom: 16, fontSize: 14 }}>
              <thead>
                <tr>
                  <th>Khoản mục</th>
                  <th style={{ textAlign: 'right' }}>Số tiền (VNĐ)</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Tiền phòng</td><td style={{ textAlign: 'right' }}>{formatCurrency(debtDetails.room_price)}</td></tr>
                <tr><td>Tiền điện</td><td style={{ textAlign: 'right' }}>{formatCurrency(debtDetails.electricity_amount)}</td></tr>
                <tr><td>Tiền nước</td><td style={{ textAlign: 'right' }}>{formatCurrency(debtDetails.water_amount)}</td></tr>
                <tr><td>Dịch vụ khác</td><td style={{ textAlign: 'right' }}>{formatCurrency(debtDetails.total_service_price)}</td></tr>
                {Number(debtDetails.adjustment_amount) !== 0 && (
                  <tr><td>Điều chỉnh</td><td style={{ textAlign: 'right', color: Number(debtDetails.adjustment_amount) > 0 ? '#d32f2f' : '#388e3c' }}>
                    {Number(debtDetails.adjustment_amount) > 0 ? '+' : ''}{formatCurrency(debtDetails.adjustment_amount)}
                  </td></tr>
                )}
                <tr style={{ fontWeight: 'bold', background: '#e3f2fd' }}>
                  <td>TỔNG PHẢI THANH TOÁN</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: '#0d47a1' }}>{formatCurrency(debtDetails.total_amount)}</td>
                </tr>
                <tr>
                  <td>Đã thanh toán</td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: '#388e3c' }}>{formatCurrency(debtDetails.paid_amount)}</td>
                </tr>
                <tr style={{ fontWeight: 'bold', background: '#fbe9e7' }}>
                  <td>CÒN NỢ</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: '#d32f2f' }}>{formatCurrency(Math.max(0, debtDetails.remaining_debt || 0))}</td>
                </tr>
              </tbody>
            </table>

            {adjustments.length > 0 && (
              <div>
                <h4 style={{ marginBottom: 10, fontSize: 14, color: '#555' }}>Lịch sử điều chỉnh</h4>
                <table className="table" style={{ fontSize: 13 }}>
                  <thead>
                    <tr>
                      <th>Loại</th>
                      <th>Mô tả</th>
                      <th style={{ textAlign: 'right' }}>Số tiền</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {adjustments.map((adj) => (
                      <tr key={adj.id}>
                        <td>
                          {adj.type === 'surcharge' ? (
                            <span className="badge badge-danger"><MdAdd size={11} /> Phụ phí</span>
                          ) : (
                            <span className="badge badge-warning"><MdRemove size={11} /> Giảm trừ</span>
                          )}
                        </td>
                        <td>{adj.description || '-'}</td>
                        <td style={{ textAlign: 'right' }}>{formatCurrency(adj.amount)}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDeleteAdjustment(adj.id)}
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Modal>
      )}

      {showAdjustmentModal && (
        <Modal
          title="Thêm điều chỉnh"
          size={460}
          footer={
            <>
              <button type="button" className="btn btn-secondary" onClick={() => setShowAdjustmentModal(false)}>Hủy</button>
              <button type="submit" className="btn btn-primary" form="adj-form-inner" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</button>
            </>
          }
          onClose={() => setShowAdjustmentModal(false)}
        >
          <form id="adj-form-inner" onSubmit={handleAdjustment}>
            <div className="form-group">
              <label>Loại điều chỉnh</label>
              <div className="adj-type-pills">
                <button
                  type="button"
                  className={`adj-pill ${adjustmentForm.type === 'surcharge' ? 'active surcharge' : ''}`}
                  onClick={() => setAdjustmentForm({ ...adjustmentForm, type: 'surcharge' })}
                >
                  <MdAdd size={14} /> Phụ phí
                </button>
                <button
                  type="button"
                  className={`adj-pill ${adjustmentForm.type === 'discount' ? 'active discount' : ''}`}
                  onClick={() => setAdjustmentForm({ ...adjustmentForm, type: 'discount' })}
                >
                  <MdRemove size={14} /> Giảm trừ
                </button>
              </div>
            </div>
            <div className="form-group">
              <label>Mô tả</label>
              <input
                type="text"
                className="form-control"
                placeholder="VD: Phí sửa chữa, Giảm giá miễn dịch..."
                value={adjustmentForm.description}
                onChange={(e) => setAdjustmentForm({ ...adjustmentForm, description: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Số tiền (đ)</label>
              <input
                type="number"
                className="form-control"
                placeholder="0"
                min="0"
                step="1000"
                value={adjustmentForm.amount}
                onChange={(e) => setAdjustmentForm({ ...adjustmentForm, amount: e.target.value })}
                required
                style={{ fontSize: 15, fontWeight: 600 }}
              />
            </div>
          </form>
        </Modal>
      )}

      {deleteAdjId && (
        <ConfirmModal
          title="Xác nhận xóa"
          message="Bạn có chắc muốn xóa điều chỉnh này?"
          onConfirm={confirmDeleteAdjustment}
          onCancel={() => setDeleteAdjId(null)}
          danger
        />
      )}

      <style>{`
        .row-paid { background-color: #fafff8; }
        .row-partial { background-color: #fffbf0; }
        .row-unpaid { background-color: #fff8f8; }
        .row-paid:hover { background-color: #f0fff0; }
        .row-partial:hover { background-color: #fff8e0; }
        .row-unpaid:hover { background-color: #fff0f0; }
        .table tbody tr { transition: background-color 0.15s; }
      `}</style>
    </div>
  );
}
