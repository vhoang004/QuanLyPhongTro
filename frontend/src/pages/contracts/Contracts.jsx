import { useState, useEffect } from 'react';
import { MdSearch, MdAdd, MdEdit, MdDelete, MdRefresh, MdBlock } from 'react-icons/md';
import { useToast, ToastContainer } from '../../components/common/Toast';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import { contractService } from '../../services/contractService';
import { roomService } from '../../services/roomService';
import { contractStatusLabels, roomTypeLabels } from '../../utils/format';
import { usePagination } from '../../hooks/usePagination';

export default function Contracts() {
  const [contracts, setContracts] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editContract, setEditContract] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [renewId, setRenewId] = useState(null);
  const [renewEndDate, setRenewEndDate] = useState('');
  const [rooms, setRooms] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [showTerminateModal, setShowTerminateModal] = useState(false);
  const [terminateId, setTerminateId] = useState(null);
  const [handoverStatus, setHandoverStatus] = useState('good');
  const { page, limit, goToPage, changeLimit } = usePagination(1, 10);
  const { toasts, addToast } = useToast();

  const [form, setForm] = useState({
    room_id: '',
    tenant_id: '',
    tenant_ids: [],
    start_date: '',
    end_date: '',
    deposit: '',
    price_per_month: '',
    terms: '',
  });
  const [saving, setSaving] = useState(false);

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const params = { page, limit, search };
      if (statusFilter) params.status = statusFilter;
      const res = await contractService.getAll(params);
      const contractsData = res.data.data || res.data.rows || [];
      const contractsWithStatus = contractsData.map(c => {
        if (c.status === 'terminated') return c;
        const endDate = new Date(c.end_date);
        const today = new Date();
        const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
        if (daysLeft <= 0) return { ...c, status: 'expired' };
        if (daysLeft <= 30) return { ...c, status: 'expiring_soon' };
        return { ...c, status: 'active' };
      });
      setContracts(contractsWithStatus);
      setTotal(res.data.count || res.data.total || 0);
    } catch {} finally { setLoading(false); }
  };

  const fetchLookups = async () => {
    try {
      const roomRes = await roomService.getAll({ limit: 1000 });
      setRooms(roomRes.data.data || roomRes.data.rows || []);
      setTenants([]);
    } catch {}
  };

  const fetchContractTenants = async (contractId) => {
    try {
      const res = await contractService.getContractTenants(contractId);
      setTenants(res.data.tenants || []);
    } catch {
      setTenants([]);
    }
  };

  useEffect(() => { fetchContracts(); }, [page, limit, search, statusFilter]);
  useEffect(() => { fetchLookups(); }, []);

  const fetchAvailableTenants = async () => {
    try {
      const res = await contractService.getAvailableTenants();
      fetch('http://127.0.0.1:7426/ingest/43f99949-78c1-4df3-8637-2586643ef79c',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'526d4b'},body:JSON.stringify({sessionId:'526d4b',location:'Contracts.jsx:fetchAvailableTenants',message:'available tenants loaded',data:{count:res.data.tenants?.length,tenants:res.data.tenants?.map(t=>t.id+' '+t.full_name)},timestamp:Date.now(),runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      setTenants(res.data.tenants || []);
    } catch {
      setTenants([]);
    }
  };

  const openCreate = () => {
    setEditContract(null);
    setIsEditMode(false);
    setForm({ room_id: '', tenant_id: '', tenant_ids: [], start_date: '', end_date: '', deposit: '', price_per_month: '', terms: '' });
    fetchLookups();
    fetchAvailableTenants();
    setShowModal(true);
  };

  const openEdit = (c) => {
    setEditContract(c);
    setIsEditMode(true);
    const tIds = c.tenant_ids ? (Array.isArray(c.tenant_ids) ? c.tenant_ids : JSON.parse(c.tenant_ids)) : [];
    setForm({
      room_id: c.room_id || '',
      tenant_id: c.tenant_id || '',
      tenant_ids: tIds,
      start_date: c.start_date || '',
      end_date: c.end_date || '',
      deposit: c.deposit || '',
      price_per_month: c.price_per_month || '',
      terms: c.terms || '',
    });
    setShowModal(true);
    // Lấy người trong hợp đồng + người chưa có phòng (luôn fetch mới)
    fetch('http://127.0.0.1:7426/ingest/43f99949-78c1-4df3-8637-2586643ef79c',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'526d4b'},body:JSON.stringify({sessionId:'526d4b',location:'Contracts.jsx:openEdit',message:'openEdit start',data:{contractId:c.id,contractStatus:c.status,formTenantIds:tIds,contractTenantId:c.tenant_id},timestamp:Date.now(),runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    Promise.all([
      contractService.getContractTenants(c.id),
      contractService.getAvailableTenants(),
    ]).then(([res1, res2]) => {
      const contractT = res1.data.tenants || [];
      const availableT = res2.data.tenants || [];
      fetch('http://127.0.0.1:7426/ingest/43f99949-78c1-4df3-8637-2586643ef79c',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'526d4b'},body:JSON.stringify({sessionId:'526d4b',location:'Contracts.jsx:openEdit',message:'tenants loaded',data:{contractTenants:contractT.map(t=>t.id+' '+t.full_name),availableTenants:availableT.map(t=>t.id+' '+t.full_name),formTenantIds:tIds},timestamp:Date.now(),runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      const combined = [...contractT, ...availableT.filter(at => !contractT.find(ct => ct.id === at.id))];
      setTenants(combined);
    }).catch(() => {
      fetchAvailableTenants();
    });
  };

  const openRenew = (c) => {
    setRenewId(c.id);
    const currentEnd = new Date(c.end_date);
    const newEnd = new Date(currentEnd);
    newEnd.setFullYear(newEnd.getFullYear() + 1);
    setRenewEndDate(newEnd.toISOString().split('T')[0]);
    setShowRenewModal(true);
  };

  const handleSave = async () => {
    // Khi sửa: chỉ cần tenant_ids (có thể giữ nguyên đại diện cũ)
    if (!form.room_id || !form.start_date || !form.end_date || !form.price_per_month) {
      addToast('Vui lòng nhập đầy đủ thông tin bắt buộc', 'warning');
      return;
    }
    if (!editContract && !form.tenant_id) {
      addToast('Vui lòng nhập đầy đủ thông tin bắt buộc', 'warning');
      return;
    }
    if (editContract && form.tenant_ids.length === 0) {
      addToast('Hợp đồng phải có ít nhất một người thuê', 'warning');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        tenant_ids: form.tenant_ids.length > 0 ? form.tenant_ids : [form.tenant_id],
      };
      if (editContract) {
        await contractService.update(editContract.id, payload);
        addToast('Cập nhật hợp đồng thành công', 'success');
      } else {
        await contractService.create(payload);
        addToast('Tạo hợp đồng thành công', 'success');
      }
      setShowModal(false);
      fetchContracts();
    } catch (err) {
      addToast(err.response?.data?.message || (editContract ? 'Lỗi khi cập nhật hợp đồng' : 'Lỗi khi tạo hợp đồng'), 'error');
    } finally { setSaving(false); }
  };

  const handleRenew = async () => {
    if (!renewEndDate) {
      addToast('Vui lòng chọn ngày kết thúc mới', 'warning');
      return;
    }
    setSaving(true);
    try {
      await contractService.renew(renewId, { new_end_date: renewEndDate });
      addToast('Gia hạn hợp đồng thành công', 'success');
      setShowRenewModal(false);
      fetchContracts();
    } catch (err) {
      addToast(err.response?.data?.message || 'Gia hạn thất bại', 'error');
    } finally { setSaving(false); }
  };

  const handleTerminate = async () => {
    try {
      await contractService.terminate(terminateId, { handover_status: handoverStatus });
      addToast('Thanh lý hợp đồng thành công', 'success');
      setShowTerminateModal(false);
      fetchContracts();
    } catch (err) {
      addToast(err.response?.data?.message || 'Thanh lý thất bại', 'error');
    }
  };

  const handleRoomChange = (roomId) => {
    const selectedRoom = rooms.find(r => r.id === parseInt(roomId));
    setForm({ 
      ...form, 
      room_id: roomId,
      price_per_month: selectedRoom ? selectedRoom.base_price : form.price_per_month 
    });
  };

  const selectedRoom = rooms.find(r => r.id === parseInt(form.room_id));

  return (
    <div>
      <ToastContainer toasts={toasts} removeToast={() => {}} />

      <div className="card">
        <div className="toolbar" style={{ padding: '16px 20px', marginBottom: 0 }}>
          <div className="toolbar-left">
            <div className="search-box">
              <MdSearch />
              <input type="text" placeholder="Tìm kiếm hợp đồng..." value={search} onChange={(e) => { setSearch(e.target.value); goToPage(1); }} />
            </div>
            <select className="form-control" style={{ width: 160 }} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); goToPage(1); }}>
              <option value="">Tất cả trạng thái</option>
              <option value="active">Đang hiệu lực</option>
              <option value="expiring_soon">Sắp hết hạn</option>
              <option value="expired">Hết hạn</option>
              <option value="terminated">Đã thanh lý</option>
            </select>
          </div>
          <div className="toolbar-right">
            <button className="btn btn-primary" onClick={openCreate}><MdAdd /> Thêm hợp đồng</button>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Phòng</th>
                <th>Người thuê</th>
                <th>Ngày bắt đầu</th>
                <th>Ngày kết thúc</th>
                <th>Giá tháng</th>
                <th>Cọc</th>
                <th>Trạng thái</th>
                <th>Nghiệm thu</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} className="text-muted" style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }}></div></td></tr>
              ) : contracts.length === 0 ? (
                <tr><td colSpan={10} className="text-muted" style={{ textAlign: 'center', padding: 40 }}>Không có dữ liệu</td></tr>
              ) : contracts.map((c, i) => (
                <tr key={c.id}>
                  <td>{(page - 1) * limit + i + 1}</td>
                  <td className="fw-600">{c.room?.room_number || c.room_id}</td>
                  <td>{c.tenant?.full_name || c.tenant_id || '—'}{c.tenant_ids && c.tenant_ids.length > 1 && <span style={{ color: '#6b7280', fontSize: 11 }}> (+{c.tenant_ids.length - 1})</span>}</td>
                  <td>{c.start_date ? new Date(c.start_date).toLocaleDateString('vi-VN') : '—'}</td>
                  <td>{c.end_date ? new Date(c.end_date).toLocaleDateString('vi-VN') : '—'}</td>
                  <td>{c.price_per_month ? parseFloat(c.price_per_month).toLocaleString('vi-VN') + ' đ' : '—'}</td>
                  <td>{c.deposit ? parseFloat(c.deposit).toLocaleString('vi-VN') + ' đ' : '—'}</td>
                  <td>
                    <span className={`badge badge-${c.status === 'active' ? 'success' : c.status === 'expiring_soon' ? 'warning' : c.status === 'expired' ? 'danger' : 'secondary'}`}>
                      {contractStatusLabels[c.status] || c.status}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${c.handover_status === 'good' ? 'success' : c.handover_status === 'damaged' ? 'danger' : 'secondary'}`}>
                      {c.handover_status === 'good' ? 'Tốt' : c.handover_status === 'damaged' ? 'Hư hỏng' : '—'}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      {(c.status === 'active') && (
                        <>
                          <button className="btn btn-sm btn-secondary" onClick={() => openEdit(c)} title="Sửa"><MdEdit /></button>
                          <button className="btn btn-sm btn-danger" onClick={() => { setTerminateId(c.id); setShowTerminateModal(true); }} title="Thanh lý"><MdBlock /></button>
                        </>
                      )}
                      {(c.status === 'expiring_soon' || c.status === 'expired') && (
                        <>
                          <button className="btn btn-sm btn-secondary" onClick={() => openEdit(c)} title="Sửa"><MdEdit /></button>
                          <button className="btn btn-sm btn-primary" onClick={() => openRenew(c)} title="Gia hạn"><MdAdd /></button>
                          <button className="btn btn-sm btn-danger" onClick={() => { setTerminateId(c.id); setShowTerminateModal(true); }} title="Thanh lý"><MdBlock /></button>
                        </>
                      )}
                      {c.status === 'terminated' && (
                        <button className="btn btn-sm btn-secondary" onClick={() => openEdit(c)} title="Xem"><MdEdit /></button>
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

      {showModal && (
        <Modal
          title={editContract ? 'Sửa hợp đồng' : 'Thêm hợp đồng mới'}
          onClose={() => setShowModal(false)}
          footer={<><button className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button><button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Đang lưu...' : editContract ? 'Cập nhật' : 'Tạo hợp đồng'}</button></>}
        >
          <div className="form-group">
            <label>Phòng <span style={{ color: 'red' }}>*</span></label>
            <select className="form-control" value={form.room_id} disabled={!!editContract} onChange={(e) => handleRoomChange(e.target.value)} style={editContract ? { background: '#e9ecef', cursor: 'not-allowed' } : {}}>
              <option value="">— Chọn phòng —</option>
              {rooms.map((r) => <option key={r.id} value={r.id}>{r.room_number} {r.room_name ? `(${r.room_name})` : ''} - {parseFloat(r.base_price).toLocaleString('vi-VN')}đ/tháng</option>)}
            </select>
            {selectedRoom && (
              <div className="room-info-box" style={{ marginTop: 8, padding: 10, background: '#e8f5e9', borderRadius: 6, fontSize: 13 }}>
                <strong>Giá thuê:</strong> {parseFloat(selectedRoom.base_price).toLocaleString('vi-VN')} VNĐ/tháng | 
                <strong> Diện tích:</strong> {selectedRoom.area} m² | 
                <strong> Loại:</strong> {roomTypeLabels[selectedRoom.room_type] || selectedRoom.room_type}
              </div>
            )}
          </div>
          <div className="form-group">
            <label>Người thuê <span style={{ color: 'red' }}>*</span></label>
            <div style={{ border: '1px solid #d1d5db', borderRadius: 6, padding: 8, maxHeight: 180, overflowY: 'auto', background: '#fff' }}>
              {tenants.length === 0 ? (
                <div style={{ color: '#9ca3af', fontSize: 13 }}>Không có người thuê nào</div>
              ) : tenants.map((t) => {
                const isSelected = form.tenant_ids.includes(t.id);
                const isPrimary = form.tenant_id === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => {
                      const ids = form.tenant_ids.includes(t.id)
                        ? form.tenant_ids.filter(id => id !== t.id)
                        : [...form.tenant_ids, t.id];
                      const primaryId = ids.includes(t.id)
                        ? (isPrimary ? t.id : (ids[0] || ''))
                        : (ids[0] || '');
                      setForm({ ...form, tenant_ids: ids, tenant_id: primaryId });
                    }}
                    style={{ padding: '6px 8px', cursor: 'pointer', borderRadius: 4, background: isSelected ? '#eef2ff' : 'transparent', borderBottom: '1px solid #f3f4f6' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: 4, border: '2px solid #d1d5db',
                        background: isSelected ? '#4f46e5' : '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        {isSelected && <span style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>&#10003;</span>}
                      </div>
                      <span style={{ fontWeight: isPrimary ? 600 : 400, fontSize: 13 }}>
                        {t.full_name}
                        {isPrimary && <span style={{ color: '#4f46e5', fontSize: 11, marginLeft: 4 }}>(đại diện)</span>}
                      </span>
                      <span style={{ color: '#9ca3af', fontSize: 12 }}>{t.phone_number}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            {form.tenant_ids.length > 0 && (
              <div style={{ marginTop: 6, fontSize: 12, color: '#6b7280' }}>
                Đã chọn: <strong>{form.tenant_ids.length}</strong> người | Đại diện: <strong>{tenants.find(t => t.id === form.tenant_id)?.full_name || '—'}</strong>
              </div>
            )}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Ngày bắt đầu <span style={{ color: 'red' }}>*</span></label>
              <input type="date" className="form-control" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Ngày kết thúc <span style={{ color: 'red' }}>*</span></label>
              <input type="date" className="form-control" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Giá thuê/tháng (VNĐ) <span style={{ color: 'red' }}>*</span></label>
              <input type="number" className="form-control" value={form.price_per_month} disabled style={{ background: '#e9ecef' }} />
            </div>
            <div className="form-group">
              <label>Tiền cọc (VNĐ)</label>
              <input type="number" className="form-control" value={form.deposit} onChange={(e) => setForm({ ...form, deposit: e.target.value })} placeholder="VD: 6000000" />
            </div>
          </div>
          <div className="form-group">
            <label>Điều khoản</label>
            <textarea className="form-control" value={form.terms} onChange={(e) => setForm({ ...form, terms: e.target.value })} placeholder="Các điều khoản hợp đồng..." />
          </div>
        </Modal>
      )}

      {showRenewModal && (
        <Modal
          title="Gia hạn hợp đồng"
          onClose={() => setShowRenewModal(false)}
          footer={<><button className="btn btn-secondary" onClick={() => setShowRenewModal(false)}>Hủy</button><button className="btn btn-primary" onClick={handleRenew} disabled={saving}>{saving ? 'Đang gia hạn...' : 'Gia hạn'}</button></>}
        >
          <div className="form-group">
            <label>Ngày kết thúc mới</label>
            <input type="date" className="form-control" value={renewEndDate} onChange={(e) => setRenewEndDate(e.target.value)} />
          </div>
        </Modal>
      )}

      {showTerminateModal && (
        <Modal title="Thanh lý hợp đồng" onClose={() => setShowTerminateModal(false)}
          footer={<><button className="btn btn-secondary" onClick={() => setShowTerminateModal(false)}>Hủy</button><button className="btn btn-danger" onClick={handleTerminate}>Xác nhận thanh lý</button></>}
        >
          <p>Phòng sẽ được chuyển về trạng thái <strong>Trống</strong> sau khi thanh lý.</p>
          <div className="form-group" style={{ marginTop: 12 }}>
            <label>Tình trạng bàn giao</label>
            <select className="form-control" value={handoverStatus} onChange={(e) => setHandoverStatus(e.target.value)}>
              <option value="good">Tốt</option>
              <option value="damaged">Có hư hỏng</option>
              <option value="none">Chưa kiểm tra</option>
            </select>
          </div>
        </Modal>
      )}
    </div>
  );
}
