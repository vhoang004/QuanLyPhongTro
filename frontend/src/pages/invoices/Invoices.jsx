import { useState, useEffect } from 'react';
import { MdSearch, MdAdd, MdRefresh, MdReceipt, MdDownload, MdEmail } from 'react-icons/md';
import { useToast, ToastContainer } from '../../components/common/Toast';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import { invoiceService, dashboardService } from '../../services/otherServices';
import { contractService } from '../../services/contractService';
import { invoiceStatusLabels, formatCurrency, formatMonth } from '../../utils/format';
import { usePagination } from '../../hooks/usePagination';

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [billingMonth, setBillingMonth] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [qrData, setQrData] = useState(null);
  const [loadingQR, setLoadingQR] = useState(false);
  const { page, limit, goToPage, changeLimit } = usePagination(1, 10);
  const { toasts, addToast } = useToast();

  const [createForm, setCreateForm] = useState({ contract_id: '', billing_month: '' });
  const [batchForm, setBatchForm] = useState({ billing_month: '' });
  const [saving, setSaving] = useState(false);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (search) params.search = search;
      if (billingMonth) params.billing_month = billingMonth;
      if (statusFilter) params.status = statusFilter;
      const res = await invoiceService.getAll(params);
      setInvoices(res.data.data || res.data.rows || []);
      setTotal(res.data.count || res.data.total || 0);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchInvoices(); }, [page, limit, search, billingMonth, statusFilter]);

  const openCreate = async () => {
    try {
      const res = await contractService.getAll({ limit: 1000, status: 'active' });
      setContracts(res.data.data || res.data.rows || []);
    } catch {}
    setCreateForm({ contract_id: '', billing_month: '' });
    setShowCreateModal(true);
  };

  const handleCreate = async () => {
    if (!createForm.contract_id || !createForm.billing_month) {
      addToast('Vui lòng chọn hợp đồng và kỳ tháng', 'warning');
      return;
    }
    setSaving(true);
    try {
      await invoiceService.generate(createForm);
      addToast('Tạo hóa đơn thành công', 'success');
      setShowCreateModal(false);
      fetchInvoices();
    } catch (err) {
      addToast(err.response?.data?.message || 'Lỗi khi tạo hóa đơn', 'error');
    } finally { setSaving(false); }
  };

  const handleBatchGenerate = async () => {
    if (!batchForm.billing_month) {
      addToast('Vui lòng chọn kỳ tháng', 'warning');
      return;
    }
    setSaving(true);
    try {
      await invoiceService.generateBatch(batchForm);
      addToast('Tạo hóa đơn hàng loạt thành công', 'success');
      setShowBatchModal(false);
      fetchInvoices();
    } catch (err) {
      addToast(err.response?.data?.message || 'Lỗi khi tạo hóa đơn', 'error');
    } finally { setSaving(false); }
  };

  const handleViewDetail = async (inv) => {
    try {
      const res = await invoiceService.getById(inv.id);
      setSelectedInvoice(res.data.invoice);
      setShowDetailModal(true);
      setQrData(null);
      if (inv.status !== 'paid') {
        setLoadingQR(true);
        try {
          const qrRes = await invoiceService.generateQR(inv.id);
          setQrData(qrRes.data.qr_data);
        } catch {}
        setLoadingQR(false);
      }
    } catch (err) {
      addToast('Không tải được chi tiết hóa đơn', 'error');
    }
  };

  const handleShowQR = async () => {
    if (!selectedInvoice) return;
    setLoadingQR(true);
    try {
      const res = await invoiceService.generateQR(selectedInvoice.id);
      setQrData(res.data.qr_data);
    } catch (err) {
      addToast(err.response?.data?.message || 'Không tạo được mã QR', 'error');
    } finally {
      setLoadingQR(false);
    }
  };

  const handleExportPDF = async (inv) => {
    try {
      const res = await dashboardService.exportPDF(inv.id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `HoaDon-${inv.id}-${inv.billing_month}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      addToast(err.response?.data?.message || 'Xuất PDF thất bại', 'error');
    }
  };

  const handleSendEmail = async (inv) => {
    try {
      await dashboardService.sendEmail(inv.id);
      addToast('Đã gửi email thành công!', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Gửi email thất bại', 'error');
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
              <input type="text" placeholder="Tìm theo phòng..." value={search} onChange={(e) => { setSearch(e.target.value); goToPage(1); }} />
            </div>
            <input type="month" className="form-control" style={{ width: 150 }} value={billingMonth} onChange={(e) => { setBillingMonth(e.target.value); goToPage(1); }} placeholder="Kỳ tháng" />
            <select className="form-control" style={{ width: 160 }} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); goToPage(1); }}>
              <option value="">Tất cả trạng thái</option>
              <option value="unpaid">Chưa thanh toán</option>
              <option value="partial">Thanh toán một phần</option>
              <option value="paid">Đã thanh toán</option>
            </select>
          </div>
          <div className="toolbar-right">
            <button className="btn btn-secondary" onClick={() => setShowBatchModal(true)}><MdRefresh /> Tạo hàng loạt</button>
            <button className="btn btn-primary" onClick={openCreate}><MdAdd /> Tạo hóa đơn</button>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr><th>STT</th><th>Phòng</th><th>Người thuê</th><th>Tháng</th><th>Giá phòng</th><th>Tiền điện</th><th>Tiền nước</th><th>Dịch vụ</th><th>Điều chỉnh</th><th>Tổng cộng</th><th>Trạng thái</th><th>Hành động</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={11} className="text-muted" style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }}></div></td></tr>
              ) : invoices.length === 0 ? (
                <tr><td colSpan={11} className="text-muted" style={{ textAlign: 'center', padding: 40 }}>Không có dữ liệu</td></tr>
              ) : invoices.map((inv, i) => (
                <tr key={inv.id} style={{ cursor: 'pointer' }} onClick={() => handleViewDetail(inv)}>
                  <td>{(page - 1) * limit + i + 1}</td>
                  <td className="fw-600">{inv.contract?.room?.room_number || inv.contract_id}</td>
                  <td>{inv.contract?.tenant?.full_name || '—'}</td>
                  <td>{formatMonth(inv.billing_month)}</td>
                  <td>{formatCurrency(inv.room_price)}</td>
                  <td className="text-success">{formatCurrency(inv.electricity_amount)}</td>
                  <td className="text-info">{formatCurrency(inv.water_amount)}</td>
                  <td className="text-info">{formatCurrency(inv.total_service_price)}</td>
                  <td className={parseFloat(inv.adjustment_amount || 0) >= 0 ? 'text-warning' : 'text-success'}>
                    {parseFloat(inv.adjustment_amount || 0) >= 0 ? '+' : ''}{formatCurrency(inv.adjustment_amount)}
                  </td>
                  <td className="fw-600">{formatCurrency(inv.total_amount)}</td>
                  <td>
                    <span className={`badge badge-${inv.status === 'paid' ? 'success' : inv.status === 'partial' ? 'warning' : 'danger'}`}>
                      {invoiceStatusLabels[inv.status]}
                    </span>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="table-actions">
                      <button className="btn btn-sm btn-secondary" onClick={() => handleViewDetail(inv)} title="Chi tiết"><MdReceipt /></button>
                      <button className="btn btn-sm btn-info" onClick={() => handleExportPDF(inv)} title="Xuất PDF"><MdDownload /></button>
                      {inv.contract?.tenant?.email && (
                        <button className="btn btn-sm btn-success" onClick={() => handleSendEmail(inv)} title="Gửi Email"><MdEmail /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination page={page} limit={limit} total={total} onPageChange={goToPage} onLimitChange={changeLimit} />
      </div>

      {/* Tạo hóa đơn đơn */}
      {showCreateModal && (
        <Modal
          title="Tạo hóa đơn"
          onClose={() => setShowCreateModal(false)}
          footer={<><button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Hủy</button><button className="btn btn-primary" onClick={handleCreate} disabled={saving}>{saving ? 'Đang tạo...' : 'Tạo hóa đơn'}</button></>}
        >
          <div className="form-group">
            <label>Phòng / Hợp đồng <span style={{ color: 'red' }}>*</span></label>
            <select className="form-control" value={createForm.contract_id} onChange={(e) => setCreateForm({ ...createForm, contract_id: e.target.value })}>
              <option value="">— Chọn hợp đồng —</option>
              {contracts.map((c) => <option key={c.id} value={c.id}>{c.room?.room_number} — {c.tenant?.full_name || 'Chưa có người thuê'}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Kỳ tháng <span style={{ color: 'red' }}>*</span></label>
            <input type="month" className="form-control" value={createForm.billing_month} onChange={(e) => setCreateForm({ ...createForm, billing_month: e.target.value })} />
          </div>
          <div style={{ padding: 12, background: '#f0fdf4', borderRadius: 8, fontSize: 13, color: '#166534' }}>
            Hệ thống sẽ tự động tính tiền điện, tiền nước dựa trên chỉ số đồng hồ đã nhập cho kỳ này.
          </div>
        </Modal>
      )}

      {/* Tạo hàng loạt */}
      {showBatchModal && (
        <Modal
          title="Tạo hóa đơn hàng loạt"
          onClose={() => setShowBatchModal(false)}
          footer={<><button className="btn btn-secondary" onClick={() => setShowBatchModal(false)}>Hủy</button><button className="btn btn-primary" onClick={handleBatchGenerate} disabled={saving}>{saving ? 'Đang tạo...' : 'Tạo tất cả'}</button></>}
        >
          <div className="form-group">
            <label>Kỳ tháng <span style={{ color: 'red' }}>*</span></label>
            <input type="month" className="form-control" value={batchForm.billing_month} onChange={(e) => setBatchForm({ ...batchForm, billing_month: e.target.value })} />
          </div>
          <div style={{ padding: 12, background: '#fef3c7', borderRadius: 8, fontSize: 13, color: '#92400e' }}>
            Hệ thống sẽ tạo hóa đơn cho TẤT CẢ hợp đồng đang active có chỉ số đồng hồ trong kỳ này.
          </div>
        </Modal>
      )}

      {/* Chi tiết hóa đơn */}
      {showDetailModal && selectedInvoice && (
        <Modal
          title={`Chi tiết hóa đơn — ${selectedInvoice.contract?.room?.room_number || ''} ${formatMonth(selectedInvoice.billing_month)}`}
          onClose={() => { setShowDetailModal(false); setQrData(null); }}
          size={800}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => { setShowDetailModal(false); setQrData(null); }}>Đóng</button>
            </>
          }
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <div style={{ background: '#f8f9fa', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                <div style={{ fontWeight: 700, color: '#2c3e50', marginBottom: 12, fontSize: 14, textTransform: 'uppercase' }}>Chi Tiết Hóa Đơn</div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr><td style={{ padding: '6px 0', fontWeight: 600, color: '#555' }}>Phòng</td><td style={{ padding: '6px 0', fontWeight: 700 }}>{selectedInvoice.contract?.room?.room_number || '—'}</td></tr>
                    <tr><td style={{ padding: '6px 0', fontWeight: 600, color: '#555' }}>Người thuê</td><td style={{ padding: '6px 0' }}>{selectedInvoice.contract?.tenant?.full_name || '—'}</td></tr>
                    <tr><td style={{ padding: '6px 0', fontWeight: 600, color: '#555' }}>Kỳ tháng</td><td style={{ padding: '6px 0' }}>{formatMonth(selectedInvoice.billing_month)}</td></tr>
                    <tr style={{ background: '#f0f9ff', borderTop: '2px solid #e5e7eb' }}><td style={{ padding: '8px 0', fontWeight: 700, color: '#1e40af' }}>Giá phòng</td><td style={{ padding: '8px 0', fontWeight: 700, textAlign: 'right' }}>{formatCurrency(selectedInvoice.room_price)}</td></tr>
                    <tr style={{ background: '#f0fdf4', borderTop: '2px solid #e5e7eb' }}><td style={{ padding: '8px 0', fontWeight: 700, color: '#166534' }}>Tiền điện</td><td style={{ padding: '8px 0', fontWeight: 700, textAlign: 'right', color: '#16a34a' }}>{formatCurrency(selectedInvoice.electricity_amount)}</td></tr>
                    <tr style={{ background: '#f0f9ff' }}><td style={{ padding: '8px 0', fontWeight: 700, color: '#0369a1' }}>Tiền nước</td><td style={{ padding: '8px 0', fontWeight: 700, textAlign: 'right', color: '#0284c7' }}>{formatCurrency(selectedInvoice.water_amount)}</td></tr>

                    {/* Hien thi chi tiet dich vu tu invoice_details */}
                    {selectedInvoice.details && selectedInvoice.details.length > 0 ? (
                      <>
                        {selectedInvoice.details.map((detail) => (
                          <tr key={detail.id} style={{ background: '#faf5ff' }}>
                            <td style={{ padding: '8px 0 8px 20px', fontWeight: 600, color: '#7c3aed' }}>
                              {detail.service?.service_name || 'Dịch vụ'}
                            </td>
                            <td style={{ padding: '8px 0', fontWeight: 700, textAlign: 'right', color: '#7c3aed' }}>
                              {formatCurrency(detail.subtotal)}
                            </td>
                          </tr>
                        ))}
                      </>
                    ) : (
                      <tr style={{ background: '#faf5ff' }}>
                        <td style={{ padding: '8px 0 8px 20px', fontWeight: 600, color: '#7c3aed' }}>Dịch vụ khác</td>
                        <td style={{ padding: '8px 0', fontWeight: 700, textAlign: 'right', color: '#7c3aed' }}>{formatCurrency(selectedInvoice.total_service_price)}</td>
                      </tr>
                    )}

                    {parseFloat(selectedInvoice.adjustment_amount || 0) !== 0 && (
                      <tr style={{ background: '#fef3c7' }}>
                        <td style={{ padding: '8px 0', fontWeight: 700, color: '#92400e' }}>Điều chỉnh {parseFloat(selectedInvoice.adjustment_amount) > 0 ? '(Phụ phí)' : '(Giảm trừ)'}</td>
                        <td style={{ padding: '8px 0', fontWeight: 700, textAlign: 'right', color: parseFloat(selectedInvoice.adjustment_amount) > 0 ? '#dc2626' : '#16a34a' }}>
                          {parseFloat(selectedInvoice.adjustment_amount) > 0 ? '+' : ''}{formatCurrency(selectedInvoice.adjustment_amount)}
                        </td>
                      </tr>
                    )}
                    <tr style={{ background: '#dcfce7', borderTop: '2px solid #86efac' }}><td style={{ padding: '10px 0', fontWeight: 800, fontSize: 16 }}>TỔNG CỘNG</td><td style={{ padding: '10px 0', fontWeight: 800, fontSize: 18, color: '#166534', textAlign: 'right' }}>{formatCurrency(selectedInvoice.total_amount)}</td></tr>
                    <tr><td style={{ padding: '6px 0', fontWeight: 600, color: '#555' }}>Trạng thái</td><td style={{ padding: '6px 0' }}>
                      <span className={`badge badge-${selectedInvoice.status === 'paid' ? 'success' : selectedInvoice.status === 'partial' ? 'warning' : 'danger'}`}>
                        {invoiceStatusLabels[selectedInvoice.status]}
                      </span>
                    </td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              {selectedInvoice.status !== 'paid' ? (
                <div style={{ border: '2px solid #e5e7eb', borderRadius: 12, padding: 20, textAlign: 'center', background: '#fafafa' }}>
                  {loadingQR ? (
                    <div style={{ padding: '60px 0' }}>
                      <div className="spinner" style={{ margin: '0 auto' }}></div>
                      <p style={{ marginTop: 12, color: '#9ca3af' }}>Đang tạo mã QR...</p>
                    </div>
                  ) : qrData ? (
                    <>
                      <div style={{ background: '#fff3e0', borderRadius: 8, padding: 12, marginBottom: 16 }}>
                        <div style={{ fontWeight: 700, color: '#e65100', fontSize: 13 }}>THÔNG TIN CHUYỂN KHOẢN</div>
                      </div>
                      {qrData.qrImageBase64 ? (
                        <img
                          src={qrData.qrImageBase64}
                          alt="QR Code"
                          style={{ width: '100%', maxWidth: 180, border: '1px solid #e5e7eb', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                          onError={(e) => {
                            const fallbackUrl = `https://img.vietqr.io/image/${qrData.bank_code}-${qrData.account_no}-compact.png?amount=${qrData.amount}&addInfo=${encodeURIComponent(qrData.description || '')}&accountName=${encodeURIComponent(qrData.account_name || '')}`;
                            e.target.src = fallbackUrl;
                            e.target.onError = null;
                          }}
                        />
                      ) : (
                        <img
                          src={`https://img.vietqr.io/image/${qrData.bank_code}-${qrData.account_no}-compact.png?amount=${qrData.amount}&addInfo=${encodeURIComponent(qrData.description || '')}&accountName=${encodeURIComponent(qrData.account_name || '')}`}
                          alt="QR Code"
                          style={{ width: '100%', maxWidth: 180, border: '1px solid #e5e7eb', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      )}
                      <div style={{ background: '#fff', borderRadius: 8, padding: 12, marginTop: 12, textAlign: 'left' }}>
                        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Ngân hàng</div>
                        <div style={{ fontWeight: 700, color: '#1f2937', fontSize: 14 }}>{qrData.bank_name}</div>
                        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 8, marginBottom: 4 }}>Số tài khoản</div>
                        <div style={{ fontWeight: 800, color: '#1565c0', fontSize: 16, letterSpacing: 1 }}>{qrData.account_no}</div>
                        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 8, marginBottom: 4 }}>Tên tài khoản</div>
                        <div style={{ fontWeight: 600, color: '#1f2937' }}>{qrData.account_name}</div>
                        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 8, marginBottom: 4 }}>Số tiền</div>
                        <div style={{ fontWeight: 800, color: '#d32f2f', fontSize: 18 }}>{formatCurrency(qrData.amount)}</div>
                        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 8, marginBottom: 4 }}>Nội dung CK</div>
                        <div style={{ fontWeight: 600, color: '#1f2937', fontStyle: 'italic', background: '#fef3c7', padding: '4px 8px', borderRadius: 4 }}>{qrData.description}</div>
                      </div>
                    </>
                  ) : (
                    <div style={{ padding: '40px 0', color: '#9ca3af' }}>
                      <p>Không thể tạo mã QR</p>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ border: '2px solid #16a34a', borderRadius: 12, padding: 24, textAlign: 'center', background: '#f0fdf4' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>✓</div>
                  <div style={{ fontWeight: 700, color: '#166534', fontSize: 18 }}>Đã thanh toán</div>
                  <div style={{ color: '#6b7280', marginTop: 8, marginBottom: 16 }}>Hóa đơn này đã được thanh toán</div>
                  {selectedInvoice.contract?.tenant?.email && (
                    <button className="btn btn-sm btn-success" onClick={() => handleSendEmail(selectedInvoice)}>
                      Gửi hóa đơn
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
