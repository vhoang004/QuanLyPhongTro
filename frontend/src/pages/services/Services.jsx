import { useState, useEffect } from 'react';
import { MdSearch, MdAdd, MdEdit, MdDelete } from 'react-icons/md';
import { useToast, ToastContainer } from '../../components/common/Toast';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import api from '../../services/api';
import { usePagination } from '../../hooks/usePagination';

const UNIT_OPTIONS = [
  { value: 'kWh', label: 'kWh (Điện)' },
  { value: 'm³', label: 'm³ (Nước)' },
  { value: 'tháng', label: 'Tháng (Internet, Wifi...)' },
  { value: 'lần', label: 'Lần' },
  { value: 'người/tháng', label: 'Người/Tháng' },
  { value: 'phòng/tháng', label: 'Phòng/Tháng' },
  { value: 'xe/tháng', label: 'Xe/Tháng' },
  { value: 'đơn vị', label: 'Đơn vị khác' },
];

export default function Services() {
  const [services, setServices] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editService, setEditService] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const { page, limit, goToPage, changeLimit } = usePagination(1, 20);
  const { toasts, addToast } = useToast();

  const [form, setForm] = useState({
    service_name: '',
    unit_price: '',
    unit: 'kWh',
  });
  const [saving, setSaving] = useState(false);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/services', { params: { page, limit, search } });
      setServices(res.data.data || res.data.rows || res.data || []);
      setTotal(res.data.count || res.data.total || 0);
    } catch {
      addToast('Không thể tải danh sách dịch vụ', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchServices(); }, [page, limit, search]);

  const openCreate = () => {
    setEditService(null);
    setForm({ service_name: '', unit_price: '', unit: 'kWh' });
    setShowModal(true);
  };

  const openEdit = (s) => {
    setEditService(s);
    setForm({
      service_name: s.service_name || '',
      unit_price: s.unit_price || '',
      unit: s.unit || 'kWh',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.service_name.trim()) {
      addToast('Vui lòng nhập tên dịch vụ', 'warning');
      return;
    }
    if (!form.unit_price) {
      addToast('Vui lòng nhập đơn giá', 'warning');
      return;
    }

    setSaving(true);
    try {
      if (editService) {
        await api.put(`/services/${editService.id}`, form);
        addToast('Cập nhật dịch vụ thành công', 'success');
      } else {
        await api.post('/services', form);
        addToast('Thêm dịch vụ thành công', 'success');
      }
      setShowModal(false);
      fetchServices();
    } catch (err) {
      addToast(err.response?.data?.message || 'Lỗi khi lưu dịch vụ', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/services/${deleteId}`);
      addToast('Xóa dịch vụ thành công', 'success');
      setShowDeleteModal(false);
      fetchServices();
    } catch (err) {
      addToast(err.response?.data?.message || 'Xóa dịch vụ thất bại', 'error');
    }
  };

  const formatPrice = (val) => {
    const num = parseFloat(val);
    if (isNaN(num)) return '—';
    return num.toLocaleString('vi-VN') + ' đ';
  };

  return (
    <div>
      <ToastContainer toasts={toasts} removeToast={() => {}} />

      <div className="card">
        <div className="toolbar" style={{ padding: '16px 20px', marginBottom: 0 }}>
          <div className="toolbar-left">
            <div className="search-box">
              <MdSearch />
              <input
                type="text"
                placeholder="Tìm kiếm dịch vụ..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); goToPage(1); }}
              />
            </div>
          </div>
          <div className="toolbar-right">
            <button className="btn btn-primary" onClick={openCreate}>
              <MdAdd /> Thêm dịch vụ
            </button>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên dịch vụ</th>
                <th>Đơn giá</th>
                <th>Đơn vị</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-muted" style={{ textAlign: 'center', padding: 40 }}>
                    <div className="spinner" style={{ margin: '0 auto' }}></div>
                  </td>
                </tr>
              ) : services.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-muted" style={{ textAlign: 'center', padding: 40 }}>
                    Không có dữ liệu
                  </td>
                </tr>
              ) : services.map((s, i) => (
                <tr key={s.id}>
                  <td>{(page - 1) * limit + i + 1}</td>
                  <td className="fw-600">{s.service_name}</td>
                  <td>{formatPrice(s.unit_price)}</td>
                  <td>{s.unit}</td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-sm btn-secondary" onClick={() => openEdit(s)} title="Sửa">
                        <MdEdit />
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => { setDeleteId(s.id); setShowDeleteModal(true); }} title="Xóa">
                        <MdDelete />
                      </button>
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
          title={editService ? 'Sửa dịch vụ' : 'Thêm dịch vụ mới'}
          onClose={() => setShowModal(false)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Đang lưu...' : editService ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </>
          }
        >
          <div className="form-group">
            <label>Tên dịch vụ <span style={{ color: 'red' }}>*</span></label>
            <input
              type="text"
              className="form-control"
              placeholder="VD: Điện, Nước, Wifi..."
              value={form.service_name}
              onChange={(e) => setForm({ ...form, service_name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Đơn giá (VNĐ) <span style={{ color: 'red' }}>*</span></label>
            <input
              type="number"
              className="form-control"
              placeholder="VD: 3500"
              min="0"
              value={form.unit_price}
              onChange={(e) => setForm({ ...form, unit_price: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Đơn vị tính <span style={{ color: 'red' }}>*</span></label>
            <select
              className="form-control"
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
            >
              {UNIT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          {form.unit_price && (
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
              Giá: <strong>{formatPrice(form.unit_price)}</strong> / {form.unit}
            </div>
          )}
        </Modal>
      )}

      {showDeleteModal && (
        <Modal
          title="Xác nhận xóa"
          onClose={() => setShowDeleteModal(false)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Hủy</button>
              <button className="btn btn-danger" onClick={handleDelete}>Xóa</button>
            </>
          }
        >
          <p>Bạn có chắc muốn xóa dịch vụ này? Hành động này không thể hoàn tác.</p>
        </Modal>
      )}
    </div>
  );
}
