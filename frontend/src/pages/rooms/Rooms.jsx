import { useState, useEffect } from 'react';
import { MdSearch, MdAdd, MdEdit, MdDelete, MdImage, MdHistory, MdCheck } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useToast, ToastContainer } from '../../components/common/Toast';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import { roomService } from '../../services/roomService';
import { roomTypeLabels, roomStatusLabels, amenityLabels, formatCurrency } from '../../utils/format';
import { usePagination } from '../../hooks/usePagination';

const AMENITY_OPTIONS = [
  { key: 'wifi', label: 'Wifi' },
  { key: 'wc', label: 'WC riêng' },
  { key: 'aircon', label: 'Điều hòa' },
  { key: 'water_heater', label: 'Bình nước nóng' },
  { key: 'balcony', label: 'Ban công' },
  { key: 'parking', label: 'Chỗ để xe' },
  { key: 'camera', label: 'Camera an ninh' },
  { key: 'fingerprint_lock', label: 'Khóa vân tay' },
  { key: 'tv', label: 'TV' },
  { key: 'refrigerator', label: 'Tủ lạnh' },
  { key: 'washing_machine', label: 'Máy giặt' },
  { key: 'bed', label: 'Giường ngủ' },
  { key: 'wardrobe', label: 'Tủ quần áo' },
  { key: 'kitchen', label: 'Khu bếp' },
];

export default function Rooms() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editRoom, setEditRoom] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const { page, limit, goToPage, changeLimit } = usePagination(1, 12);

  const [form, setForm] = useState({
    room_number: '',
    room_name: '',
    room_type: 'standard',
    base_price: '',
    area: '',
    floor: '1',
    address: '',
    description: '',
    amenities: [],
    deposit_amount: '',
    electricity_price: '3500',
    water_price: '15000',
    internet_price: '',
    parking_price: '',
    other_services_price: '',
    status: 'available',
  });
  const [previewImages, setPreviewImages] = useState([]);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const { toasts, addToast } = useToast();

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const params = { page, limit, search };
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.room_type = typeFilter;
      const res = await roomService.getAll(params);
      setRooms(res.data.data || res.data.rows || []);
      setTotal(res.data.count || res.data.total || 0);
    } catch (err) {
      addToast('Không tải được danh sách phòng', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRooms(); }, [page, limit, search, statusFilter, typeFilter]);

  const openCreate = () => {
    setEditRoom(null);
    setForm({
      room_number: '', room_name: '', room_type: 'standard', base_price: '',
      area: '', floor: '1', address: '', description: '',
      amenities: [], deposit_amount: '', electricity_price: '3500', water_price: '15000',
      internet_price: '', parking_price: '', other_services_price: '', status: 'available',
    });
    setPreviewImages([]);
    setShowModal(true);
  };

  const openEdit = (room) => {
    setEditRoom(room);
    setForm({
      room_number: room.room_number || '',
      room_name: room.room_name || '',
      room_type: room.room_type || 'standard',
      base_price: room.base_price || '',
      area: room.area || '',
      floor: room.floor || '1',
      address: room.address || '',
      description: room.description || '',
      amenities: room.amenities || [],
      deposit_amount: room.deposit_amount || '',
      electricity_price: room.electricity_price || '3500',
      water_price: room.water_price || '15000',
      internet_price: room.internet_price || '',
      parking_price: room.parking_price || '',
      other_services_price: room.other_services_price || '',
      status: room.status || 'available',
    });
    setPreviewImages(room.images || []);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.room_number.trim() || !form.base_price) {
      addToast('Vui lòng nhập số phòng và giá thuê', 'warning');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        base_price: parseFloat(form.base_price),
        area: form.area ? parseFloat(form.area) : null,
        floor: parseInt(form.floor),
        deposit_amount: form.deposit_amount ? parseFloat(form.deposit_amount) : 0,
        electricity_price: parseFloat(form.electricity_price) || 3500,
        water_price: parseFloat(form.water_price) || 15000,
        internet_price: form.internet_price ? parseFloat(form.internet_price) : 0,
        parking_price: form.parking_price ? parseFloat(form.parking_price) : 0,
        other_services_price: form.other_services_price ? parseFloat(form.other_services_price) : 0,
      };

      if (editRoom) {
        await roomService.update(editRoom.id, payload);
        addToast('Cập nhật phòng thành công', 'success');
      } else {
        await roomService.create(payload);
        addToast('Thêm phòng thành công', 'success');
      }
      setShowModal(false);
      fetchRooms();
    } catch (err) {
      addToast(err.response?.data?.message || 'Lỗi khi lưu phòng', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await roomService.delete(deleteId);
      addToast('Xóa phòng thành công', 'success');
      setShowDeleteModal(false);
      fetchRooms();
    } catch (err) {
      addToast(err.response?.data?.message || 'Không thể xóa phòng', 'error');
    }
  };

  const handleUploadImages = async (roomId, files) => {
    if (!files.length) return;
    setUploadingImages(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(f => formData.append('images', f));
      const res = await roomService.uploadImages(roomId, formData);
      addToast('Tải ảnh lên thành công', 'success');
      setPreviewImages(res.data.images || []);
      fetchRooms();
    } catch (err) {
      addToast(err.response?.data?.message || 'Tải ảnh thất bại', 'error');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleAmenityToggle = (key) => {
    const current = form.amenities || [];
    if (current.includes(key)) {
      setForm({ ...form, amenities: current.filter(a => a !== key) });
    } else {
      setForm({ ...form, amenities: [...current, key] });
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      available: { bg: '#dcfce7', text: '#166534' },
      rented: { bg: '#dbeafe', text: '#1e40af' },
      maintenance: { bg: '#fef3c7', text: '#92400e' },
      inactive: { bg: '#f1f5f9', text: '#64748b' },
    };
    return colors[status] || colors.available;
  };

  const getTypeColor = (type) => {
    const colors = {
      standard: { bg: '#f1f5f9', text: '#475569' },
      deluxe: { bg: '#ede9fe', text: '#6d28d9' },
      suite: { bg: '#fce7f3', text: '#9d174d' },
    };
    return colors[type] || colors.standard;
  };

  return (
    <div>
      <ToastContainer toasts={toasts} removeToast={() => {}} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <button className="btn btn-primary" onClick={openCreate}>
          <MdAdd /> Thêm phòng
        </button>
      </div>

      <div className="card">
        <div style={{ padding: '16px 20px', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-box" style={{ flex: 1, minWidth: 240 }}>
            <MdSearch />
            <input
              type="text"
              placeholder="Tìm kiếm số phòng, tên phòng..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); goToPage(1); }}
            />
          </div>
          <select className="form-control" style={{ width: 150 }} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); goToPage(1); }}>
            <option value="">Tất cả trạng thái</option>
            <option value="available">Trống</option>
            <option value="rented">Đã thuê</option>
            <option value="maintenance">Bảo trì</option>
            <option value="inactive">Không hoạt động</option>
          </select>
          <select className="form-control" style={{ width: 150 }} value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); goToPage(1); }}>
            <option value="">Tất cả loại</option>
            <option value="standard">Tiêu chuẩn</option>
            <option value="deluxe">Cao cấp</option>
          </select>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Số phòng</th>
                <th>Tên phòng</th>
                <th>Loại</th>
                <th>Giá thuê</th>
                <th>Diện tích</th>
                <th>Tầng</th>
                <th>Người ở</th>
                <th>Trạng thái</th>
                <th>Tiện ích</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={11} className="text-muted" style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }}></div></td></tr>
              ) : rooms.length === 0 ? (
                <tr><td colSpan={11} className="text-muted" style={{ textAlign: 'center', padding: 40 }}>Không có dữ liệu phòng</td></tr>
              ) : rooms.map((room, i) => (
                <tr key={room.id}>
                  <td>{(page - 1) * limit + i + 1}</td>
                  <td className="fw-600">{room.room_number}</td>
                  <td style={{ maxWidth: 140 }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={room.room_name}>
                      {room.room_name || '—'}
                    </div>
                  </td>
                  <td>
                    <span style={{
                      padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 500,
                      ...getTypeColor(room.room_type),
                    }}>
                      {roomTypeLabels[room.room_type]}
                    </span>
                  </td>
                  <td className="fw-600">{formatCurrency(room.base_price)}</td>
                  <td>{room.area ? `${room.area} m²` : '—'}</td>
                  <td>Tầng {room.floor || 1}</td>
                  <td>{room.current_tenants || 0} người</td>
                  <td>
                    <span style={{
                      padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 500,
                      ...getStatusColor(room.status),
                    }}>
                      {roomStatusLabels[room.status]}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', maxWidth: 160 }}>
                      {(room.amenities || []).slice(0, 3).map(a => (
                        <span key={a} style={{ fontSize: 16 }} title={amenityLabels[a] || a}>
                          {a === 'wifi' ? '📶' : a === 'wc' ? '🚽' : a === 'aircon' ? '❄️' :
                           a === 'parking' ? '🅿️' : a === 'camera' ? '📹' : a === 'tv' ? '📺' : '⚡'}
                        </span>
                      ))}
                      {(room.amenities || []).length > 3 && (
                        <span style={{ fontSize: 11, color: '#64748b' }}>+{room.amenities.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="table-actions">
                      <button className="btn btn-sm btn-secondary" onClick={() => openEdit(room)} title="Sửa">
                        <MdEdit />
                      </button>
                      <button className="btn btn-sm btn-info" onClick={() => navigate(`/rooms/${room.id}/history`)} title="Lịch sử">
                        <MdHistory />
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => { setDeleteId(room.id); setShowDeleteModal(true); }} title="Xóa">
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
          title={editRoom ? 'Sửa phòng' : 'Thêm phòng mới'}
          onClose={() => setShowModal(false)}
          size="lg"
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Đang lưu...' : editRoom ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </>
          }
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Số phòng <span style={{ color: 'red' }}>*</span></label>
              <input className="form-control" value={form.room_number} onChange={(e) => setForm({ ...form, room_number: e.target.value })} placeholder="VD: 101" />
            </div>
            <div className="form-group">
              <label>Tên phòng</label>
              <input className="form-control" value={form.room_name} onChange={(e) => setForm({ ...form, room_name: e.target.value })} placeholder="VD: Phòng 101 tầng 1" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Loại phòng</label>
              <select className="form-control" value={form.room_type} onChange={(e) => setForm({ ...form, room_type: e.target.value })}>
                <option value="standard">Tiêu chuẩn</option>
                <option value="deluxe">Cao cấp</option>
              </select>
            </div>
            <div className="form-group">
              <label>Trạng thái</label>
              <select className="form-control" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="available">Trống</option>
                <option value="rented">Đã thuê</option>
                <option value="maintenance">Bảo trì</option>
                <option value="inactive">Không hoạt động</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Giá thuê (VNĐ) <span style={{ color: 'red' }}>*</span></label>
              <input type="number" className="form-control" value={form.base_price} onChange={(e) => setForm({ ...form, base_price: e.target.value })} placeholder="VD: 3000000" />
            </div>
            <div className="form-group">
              <label>Diện tích (m²)</label>
              <input type="number" className="form-control" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} placeholder="VD: 25" />
            </div>
            <div className="form-group">
              <label>Tầng</label>
              <input type="number" className="form-control" value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} placeholder="1" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Tiền cọc (VNĐ)</label>
              <input type="number" className="form-control" value={form.deposit_amount} onChange={(e) => setForm({ ...form, deposit_amount: e.target.value })} placeholder="0" />
            </div>
          </div>

          <div className="form-group">
            <label>Địa chỉ</label>
            <input className="form-control" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="VD: 123 Nguyễn Trãi, Q.1, TP.HCM" />
          </div>

          <div style={{ marginTop: 8, marginBottom: 8, fontWeight: 600, fontSize: 14, color: '#374151', borderBottom: '1px solid #e5e7eb', paddingBottom: 8 }}>
            Giá dịch vụ (VNĐ)
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>📶 Điện (VNĐ/kWh)</label>
              <input type="number" className="form-control" value={form.electricity_price} onChange={(e) => setForm({ ...form, electricity_price: e.target.value })} />
            </div>
            <div className="form-group">
              <label>🚿 Nước (VNĐ/m³)</label>
              <input type="number" className="form-control" value={form.water_price} onChange={(e) => setForm({ ...form, water_price: e.target.value })} />
            </div>
            <div className="form-group">
              <label>🌐 Internet (VNĐ/tháng)</label>
              <input type="number" className="form-control" value={form.internet_price} onChange={(e) => setForm({ ...form, internet_price: e.target.value })} placeholder="0" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>🅿️ Xe máy (VNĐ/tháng)</label>
              <input type="number" className="form-control" value={form.parking_price} onChange={(e) => setForm({ ...form, parking_price: e.target.value })} placeholder="0" />
            </div>
            <div className="form-group">
              <label>📦 Dịch vụ khác (VNĐ/tháng)</label>
              <input type="number" className="form-control" value={form.other_services_price} onChange={(e) => setForm({ ...form, other_services_price: e.target.value })} placeholder="0" />
            </div>
          </div>

          <div style={{ marginTop: 8, marginBottom: 8, fontWeight: 600, fontSize: 14, color: '#374151', borderBottom: '1px solid #e5e7eb', paddingBottom: 8 }}>
            Tiện ích
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {AMENITY_OPTIONS.map(opt => {
              const isSelected = (form.amenities || []).includes(opt.key);
              return (
                <div
                  key={opt.key}
                  onClick={() => handleAmenityToggle(opt.key)}
                  style={{
                    padding: '8px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 13,
                    border: isSelected ? '2px solid #4f46e5' : '1px solid #e5e7eb',
                    background: isSelected ? '#eef2ff' : '#fff',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: 4,
                    background: isSelected ? '#4f46e5' : '#e5e7eb',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {isSelected && <MdCheck size={12} color="white" />}
                  </div>
                  {opt.label}
                </div>
              );
            })}
          </div>

          <div className="form-group" style={{ marginTop: 16 }}>
            <label>Mô tả</label>
            <textarea className="form-control" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Mô tả thêm về phòng..." />
          </div>

          {editRoom && (
            <div className="form-group">
              <label>Ảnh phòng ({previewImages.length}/10)</label>
              {previewImages.length > 0 && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                  {previewImages.map((img, i) => (
                    <div key={i} style={{ position: 'relative' }}>
                      <img
                        src={img.startsWith('http') ? img : `http://localhost:5000${img}`}
                        alt={`Ảnh ${i + 1}`}
                        style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 6, border: '1px solid #e5e7eb' }}
                        onError={(e) => { e.target.style.opacity = '0.3'; }}
                      />
                    </div>
                  ))}
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                multiple
                id="room-image-upload"
                style={{ display: 'none' }}
                onChange={(e) => handleUploadImages(editRoom.id, e.target.files)}
              />
              <label htmlFor="room-image-upload" className="btn btn-secondary" style={{ cursor: 'pointer' }}>
                {uploadingImages ? 'Đang tải...' : '+ Thêm ảnh'}
              </label>
              <span style={{ fontSize: 12, color: '#6b7280', marginLeft: 8 }}>JPG, PNG (tối đa 10 ảnh)</span>
            </div>
          )}
        </Modal>
      )}

      {showDeleteModal && (
        <Modal title="Xác nhận xóa" onClose={() => setShowDeleteModal(false)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Hủy</button>
              <button className="btn btn-danger" onClick={handleDelete}>Xóa</button>
            </>
          }
        >
          <p>Bạn có chắc muốn xóa phòng này? Hành động này không thể hoàn tác.</p>
        </Modal>
      )}
    </div>
  );
}
