import { useState, useEffect } from 'react';
import { MdSearch, MdAdd, MdEdit, MdDelete } from 'react-icons/md';
import { useToast, ToastContainer } from '../../components/common/Toast';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import { tenantService } from '../../services/tenantService';
import { usePagination } from '../../hooks/usePagination';

export default function Tenants() {
  const [tenants, setTenants] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editTenant, setEditTenant] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const { page, limit, goToPage, changeLimit } = usePagination(1, 10);
  const { toasts, addToast } = useToast();

  const [form, setForm] = useState({
    full_name: '',
    citizen_id: '',
    phone_number: '',
    email: '',
    address: '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const res = await tenantService.getAll({ page, limit, search });
      setTenants(res.data.data || res.data.rows || []);
      setTotal(res.data.count || res.data.total || 0);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTenants(); }, [page, limit, search]);

  const openCreate = () => {
    setEditTenant(null);
    setForm({ full_name: '', citizen_id: '', phone_number: '', email: '', address: '' });
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (t) => {
    setEditTenant(t);
    setForm({
      full_name: t.full_name || '',
      citizen_id: t.citizen_id || '',
      phone_number: t.phone_number || '',
      email: t.email || '',
      address: t.address || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    const newErrors = {};
    if (!form.full_name.trim()) newErrors.full_name = 'Vui lòng nhập họ tên';
    if (!form.citizen_id.trim()) newErrors.citizen_id = 'Vui lòng nhập CMND/CCCD';
    if (!form.phone_number.trim()) newErrors.phone_number = 'Vui lòng nhập số điện thoại';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      addToast('Vui lòng nhập đầy đủ thông tin bắt buộc', 'warning');
      return;
    }
    setSaving(true);
    try {
      if (editTenant) {
        await tenantService.update(editTenant.id, form);
        addToast('Cập nhật người thuê thành công', 'success');
      } else {
        await tenantService.create(form);
        addToast('Thêm người thuê thành công', 'success');
      }
      setShowModal(false);
      fetchTenants();
    } catch (err) {
      addToast(err.response?.data?.message || 'Lỗi khi lưu người thuê', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await tenantService.delete(deleteId);
      addToast('Xóa người thuê thành công', 'success');
      setShowDeleteModal(false);
      fetchTenants();
    } catch (err) {
      addToast(err.response?.data?.message || 'Xóa người thuê thất bại', 'error');
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
              <input type="text" placeholder="Tìm kiếm người thuê..." value={search} onChange={(e) => { setSearch(e.target.value); goToPage(1); }} />
            </div>
          </div>
          <div className="toolbar-right">
            <button className="btn btn-primary" onClick={openCreate}><MdAdd /> Thêm người thuê</button>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Họ tên</th>
                <th>CMND/CCCD</th>
                <th>Số điện thoại</th>
                <th>Email</th>
                <th>Địa chỉ</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-muted" style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }}></div></td></tr>
              ) : tenants.length === 0 ? (
                <tr><td colSpan={7} className="text-muted" style={{ textAlign: 'center', padding: 40 }}>Không có dữ liệu</td></tr>
              ) : tenants.map((t, i) => (
                <tr key={t.id}>
                  <td>{(page - 1) * limit + i + 1}</td>
                  <td className="fw-600">{t.full_name}</td>
                  <td>{t.citizen_id}</td>
                  <td>{t.phone_number}</td>
                  <td>{t.email || '—'}</td>
                  <td>{t.address || '—'}</td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-sm btn-secondary" onClick={() => openEdit(t)}><MdEdit /></button>
                      <button className="btn btn-sm btn-danger" onClick={() => { setDeleteId(t.id); setShowDeleteModal(true); }}><MdDelete /></button>
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
          title={editTenant ? 'Sửa người thuê' : 'Thêm người thuê'}
          onClose={() => setShowModal(false)}
          footer={<><button className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button><button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Đang lưu...' : editTenant ? 'Cập nhật' : 'Thêm mới'}</button></>}
        >
          <div className="form-group">
            <label>Họ tên <span style={{ color: 'red' }}>*</span></label>
            <input className={`form-control ${errors.full_name ? 'error' : ''}`} value={form.full_name} onChange={(e) => { setForm({ ...form, full_name: e.target.value }); setErrors({ ...errors, full_name: '' }); }} placeholder="Nhập họ tên đầy đủ" />
            {errors.full_name && <span className="error-text">{errors.full_name}</span>}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>CMND/CCCD <span style={{ color: 'red' }}>*</span></label>
              <input className={`form-control ${errors.citizen_id ? 'error' : ''}`} value={form.citizen_id} onChange={(e) => { setForm({ ...form, citizen_id: e.target.value }); setErrors({ ...errors, citizen_id: '' }); }} placeholder="VD: 012345678901" />
              {errors.citizen_id && <span className="error-text">{errors.citizen_id}</span>}
            </div>
            <div className="form-group">
              <label>SĐT <span style={{ color: 'red' }}>*</span></label>
              <input className={`form-control ${errors.phone_number ? 'error' : ''}`} value={form.phone_number} onChange={(e) => { setForm({ ...form, phone_number: e.target.value }); setErrors({ ...errors, phone_number: '' }); }} placeholder="VD: 0909123456" />
              {errors.phone_number && <span className="error-text">{errors.phone_number}</span>}
            </div>
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" className="form-control" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="VD: email@example.com" />
          </div>
          <div className="form-group">
            <label>Địa chỉ</label>
            <input className="form-control" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="VD: 123 Đường ABC, Quận 1" />
          </div>
        </Modal>
      )}

      {showDeleteModal && (
        <Modal title="Xác nhận xóa" onClose={() => setShowDeleteModal(false)}
          footer={<><button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Hủy</button><button className="btn btn-danger" onClick={handleDelete}>Xóa</button></>}
        >
          <p>Bạn có chắc muốn xóa người thuê này?</p>
        </Modal>
      )}
    </div>
  );
}
