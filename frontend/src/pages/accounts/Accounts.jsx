import { useState, useEffect } from 'react';
import { MdSearch, MdAdd, MdEdit, MdDelete } from 'react-icons/md';
import { useToast, ToastContainer } from '../../components/common/Toast';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import api from '../../services/api';
import { usePagination } from '../../hooks/usePagination';

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editAccount, setEditAccount] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const { page, limit, goToPage, changeLimit } = usePagination(1, 10);
  const { toasts, addToast } = useToast();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = currentUser.role === 'admin';

  const [form, setForm] = useState({
    username: '',
    password: '',
    email: '',
    role: 'manager',
    status: 'active',
  });
  const [saving, setSaving] = useState(false);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const params = { page, limit, search };
      if (isAdmin) params.role = 'manager';
      const res = await api.get('/auth/accounts', { params });
      let data = res.data.data || res.data.rows || [];
      if (isAdmin) data = data.filter(acc => acc.role === 'manager');
      setAccounts(data);
      setTotal(res.data.count || res.data.total || 0);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchAccounts(); }, [page, limit, search]);

  const openCreate = () => {
    setEditAccount(null);
    setForm({ username: '', password: '', email: '', role: 'manager', status: 'active' });
    setShowModal(true);
  };

  const openEdit = (acc) => {
    setEditAccount(acc);
    setForm({
      username: acc.username || '',
      password: '',
      email: acc.email || '',
      role: acc.role || 'manager',
      status: acc.status || 'active',
    });
    setShowModal(true);
  };

  const canDeleteAccount = (acc) => {
    return !(isAdmin && acc.role === 'admin');
  };

  const canEditAccount = (acc) => {
    return !(isAdmin && acc.role === 'admin');
  };

  const handleSave = async () => {
    if (!form.username.trim()) {
      addToast('Tên đăng nhập là bắt buộc', 'warning');
      return;
    }
    if (!editAccount && !form.password.trim()) {
      addToast('Mật khẩu là bắt buộc khi tạo mới', 'warning');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      if (editAccount) {
        await api.put(`/auth/accounts/${editAccount.id}`, payload);
        addToast('Cập nhật tài khoản thành công', 'success');
      } else {
        await api.post('/auth/accounts', payload);
        addToast('Tạo tài khoản thành công', 'success');
      }
      setShowModal(false);
      fetchAccounts();
    } catch (err) {
      addToast(err.response?.data?.message || 'Lỗi khi lưu tài khoản', 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/auth/accounts/${deleteId}`);
      addToast('Xóa tài khoản thành công', 'success');
      setShowDeleteModal(false);
      fetchAccounts();
    } catch (err) {
      addToast(err.response?.data?.message || 'Xóa tài khoản thất bại', 'error');
    }
  };

  const getRoleBadge = (role) => {
    return role === 'admin'
      ? <span className="badge badge-danger">Quản trị viên</span>
      : <span className="badge badge-info">Chủ trọ</span>;
  };

  const getStatusBadge = (status) => {
    return status === 'active'
      ? <span className="badge badge-success">Hoạt động</span>
      : <span className="badge badge-secondary">Khóa</span>;
  };

  return (
    <div>
      <ToastContainer toasts={toasts} removeToast={() => {}} />

      <div className="card">
        <div className="toolbar" style={{ padding: '16px 20px', marginBottom: 0 }}>
          <div className="toolbar-left">
            <div className="search-box">
              <MdSearch />
              <input type="text" placeholder="Tìm kiếm tài khoản..." value={search} onChange={(e) => { setSearch(e.target.value); goToPage(1); }} />
            </div>
          </div>
          <div className="toolbar-right">
            <button className="btn btn-primary" onClick={openCreate}><MdAdd /> Thêm tài khoản</button>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr><th>STT</th><th>Tên đăng nhập</th><th>Email</th><th>Vai trò</th><th>Trạng thái</th><th>Hành động</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-muted" style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }}></div></td></tr>
              ) : accounts.length === 0 ? (
                <tr><td colSpan={6} className="text-muted" style={{ textAlign: 'center', padding: 40 }}>Không có dữ liệu</td></tr>
              ) : accounts.map((acc, i) => (
                <tr key={acc.id}>
                  <td>{(page - 1) * limit + i + 1}</td>
                  <td className="fw-600">{acc.username}</td>
                  <td>{acc.email || '—'}</td>
                  <td>{getRoleBadge(acc.role)}</td>
                  <td>{getStatusBadge(acc.status)}</td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-sm btn-secondary" onClick={() => openEdit(acc)} disabled={!canEditAccount(acc)}><MdEdit /></button>
                      <button className="btn btn-sm btn-danger" onClick={() => { setDeleteId(acc.id); setShowDeleteModal(true); }} disabled={!canDeleteAccount(acc)}><MdDelete /></button>
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
          title={editAccount ? 'Sửa tài khoản' : 'Thêm tài khoản'}
          onClose={() => setShowModal(false)}
          footer={<><button className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button><button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Đang lưu...' : editAccount ? 'Cập nhật' : 'Thêm mới'}</button></>}
        >
          <div className="form-group">
            <label>Tên đăng nhập <span style={{ color: 'red' }}>*</span></label>
            <input className="form-control" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="VD: admin01" />
          </div>
          <div className="form-group">
            <label>Mật khẩu {editAccount ? '(để trống nếu không đổi)' : <span style={{ color: 'red' }}>*</span>}</label>
            <input type="password" className="form-control" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={editAccount ? 'Nhập mật khẩu mới hoặc để trống' : 'Nhập mật khẩu'} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" className="form-control" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="VD: admin@example.com" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Vai trò</label>
              <select className="form-control" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} disabled={isAdmin}>
                <option value="manager">Chủ trọ</option>
                {!isAdmin && <option value="admin">Quản trị viên</option>}
              </select>
            </div>
            <div className="form-group">
              <label>Trạng thái</label>
              <select className="form-control" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="active">Hoạt động</option>
                <option value="inactive">Khóa</option>
              </select>
            </div>
          </div>
        </Modal>
      )}

      {showDeleteModal && (
        <Modal title="Xác nhận xóa" onClose={() => setShowDeleteModal(false)}
          footer={<><button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Hủy</button><button className="btn btn-danger" onClick={handleDelete}>Xóa</button></>}
        >
          <p>Bạn có chắc muốn xóa tài khoản này?</p>
        </Modal>
      )}
    </div>
  );
}
