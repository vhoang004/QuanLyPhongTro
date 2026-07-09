import { useState, useEffect, useMemo } from 'react';
import { MdSearch, MdAdd, MdSave, MdRefresh } from 'react-icons/md';
import { useToast, ToastContainer } from '../../components/common/Toast';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import { meterReadingService } from '../../services/otherServices';
import { formatMonth } from '../../utils/format';
import { usePagination } from '../../hooks/usePagination';

export default function MeterReadings() {
  const [readings, setReadings] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const { page, limit, goToPage, changeLimit } = usePagination(1, 20);
  const { toasts, addToast } = useToast();

  const [servicePrices, setServicePrices] = useState({ electricity: 3500, water: 15000 });
  const [batchMonth, setBatchMonth] = useState('');
  const [roomsData, setRoomsData] = useState([]);
  const [roomReadings, setRoomReadings] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchReadings = async () => {
    setLoading(true);
    try {
      const params = { page, limit, search };
      if (monthFilter) params.billing_month = monthFilter;
      const res = await meterReadingService.getAll(params);
      const data = res.data.data || res.data.rows || [];
      setReadings(data);
      setTotal(res.data.count || res.data.total || 0);

      if (data.length > 0 && data[0].electricity_cost !== undefined) {
        setServicePrices({
          electricity: data[0].electricity_cost / Math.max(data[0].electricity_used, 1) || 3500,
          water: data[0].water_cost / Math.max(data[0].water_used, 1) || 15000,
        });
      }
    } catch (err) {
      addToast('Không thể tải danh sách chỉ số', 'error');
    } finally { setLoading(false); }
  };

  const fetchServicePrices = async () => {
    try {
      const res = await meterReadingService.getServices();
      if (res.data.prices) {
        setServicePrices(res.data.prices);
      }
    } catch {}
  };

  const fetchRoomsForBatch = async (month) => {
    setLoading(true);
    try {
      const res = await meterReadingService.getRoomsForReading({ billing_month: month });
      const rooms = res.data.rooms || [];
      setRoomsData(rooms);

      const readingsInit = {};
      rooms.forEach((r) => {
        if (r.current_reading) {
          readingsInit[r.id] = {
            current_electricity: r.current_reading.current_electricity,
            current_water: r.current_reading.current_water,
          };
        } else {
          readingsInit[r.id] = {
            current_electricity: '',
            current_water: '',
          };
        }
      });
      setRoomReadings(readingsInit);
    } catch (err) {
      addToast('Không thể tải danh sách phòng', 'error');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchReadings(); }, [page, limit, search, monthFilter]);
  useEffect(() => { fetchServicePrices(); }, []);

  const openBatchRecord = () => {
    const today = new Date();
    const defaultMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    setBatchMonth(defaultMonth);
    setShowBatchModal(true);
    fetchRoomsForBatch(defaultMonth);
  };

  const handleBatchMonthChange = (month) => {
    setBatchMonth(month);
    fetchRoomsForBatch(month);
  };

  const handleRoomReadingChange = (roomId, field, value) => {
    setRoomReadings((prev) => ({
      ...prev,
      [roomId]: {
        ...prev[roomId],
        [field]: value,
      },
    }));
  };

  const calculateCost = (roomId) => {
    const room = roomsData.find((r) => r.id === roomId);
    if (!room) return { elecUsed: 0, waterUsed: 0, elecCost: 0, waterCost: 0 };

    const current = roomReadings[roomId] || {};
    const prev = room.prev_reading || { current_electricity: 0, current_water: 0 };

    const elecUsed = Math.max(0, parseInt(current.current_electricity || 0) - parseInt(prev.current_electricity || 0));
    const waterUsed = Math.max(0, parseInt(current.current_water || 0) - parseInt(prev.current_water || 0));

    return {
      elecUsed,
      waterUsed,
      elecCost: elecUsed * servicePrices.electricity,
      waterCost: waterUsed * servicePrices.water,
    };
  };

  const handleSaveBatch = async () => {
    const readingsToSave = roomsData
      .filter((r) => roomReadings[r.id]?.current_electricity !== '' && roomReadings[r.id]?.current_water !== '')
      .map((r) => ({
        room_id: r.id,
        current_electricity: parseInt(roomReadings[r.id].current_electricity),
        current_water: parseInt(roomReadings[r.id].current_water),
      }));

    if (readingsToSave.length === 0) {
      addToast('Vui lòng nhập ít nhất một chỉ số', 'warning');
      return;
    }

    setSaving(true);
    try {
      // #region agent log
      fetch('http://127.0.0.1:7691/ingest/b7170261-fdc1-4338-8711-7e3024e1f6c4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'695c29'},body:JSON.stringify({sessionId:'695c29',location:'MeterReadings.jsx:143',message:'handleSaveBatch sending',data:{readingsCount:readingsToSave.length,readings:readingsToSave},hypothesisId:'H2',runId:'initial',timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      const res = await meterReadingService.createBatch({
        readings: readingsToSave,
        billing_month: batchMonth,
      });
      // #region agent log
      fetch('http://127.0.0.1:7691/ingest/b7170261-fdc1-4338-8711-7e3024e1f6c4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'695c29'},body:JSON.stringify({sessionId:'695c29',location:'MeterReadings.jsx:148',message:'handleSaveBatch response',data:{status:res.status,message:res.data?.message,resultsCount:res.data?.results?.length,errorsCount:res.data?.errors?.length,errors:res.data?.errors},hypothesisId:'H2',runId:'initial',timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      addToast(res.data.message || 'Ghi chỉ số thành công', 'success');
      setShowBatchModal(false);
      fetchReadings();
    } catch (err) {
      // #region agent log
      fetch('http://127.0.0.1:7691/ingest/b7170261-fdc1-4338-8711-7e3024e1f6c4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'695c29'},body:JSON.stringify({sessionId:'695c29',location:'MeterReadings.jsx:152',message:'handleSaveBatch error caught',data:{errMessage:err.message,errResponse:err.response?.data},hypothesisId:'H2',runId:'initial',timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      addToast(err.response?.data?.message || 'Lỗi khi lưu chỉ số', 'error');
    } finally { setSaving(false); }
  };

  const summaryStats = useMemo(() => {
    let totalElecUsed = 0;
    let totalWaterUsed = 0;
    let totalElecCost = 0;
    let totalWaterCost = 0;

    readings.forEach((r) => {
      totalElecUsed += r.electricity_used || 0;
      totalWaterUsed += r.water_used || 0;
      totalElecCost += r.electricity_cost || 0;
      totalWaterCost += r.water_cost || 0;
    });

    return { totalElecUsed, totalWaterUsed, totalElecCost, totalWaterCost };
  }, [readings]);

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
                placeholder="Tìm theo phòng..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); goToPage(1); }}
              />
            </div>
            <input
              type="month"
              className="form-control"
              style={{ width: 160 }}
              value={monthFilter}
              onChange={(e) => { setMonthFilter(e.target.value); goToPage(1); }}
            />
          </div>
          <div className="toolbar-right">
            <button className="btn btn-secondary" onClick={() => fetchReadings()} style={{ marginRight: 8 }}>
              <MdRefresh /> Làm mới
            </button>
            <button className="btn btn-primary" onClick={openBatchRecord}>
              <MdAdd /> Ghi chỉ số hàng loạt
            </button>
          </div>
        </div>

        {readings.length > 0 && (
          <div style={{ display: 'flex', gap: 16, padding: '12px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ flex: 1, background: '#fffbeb', padding: '10px 16px', borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: '#d97706' }}>Tổng điện tiêu thụ</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#d97706' }}>{summaryStats.totalElecUsed.toLocaleString()} kWh</div>
              <div style={{ fontSize: 12, color: '#92400e' }}>{summaryStats.totalElecCost.toLocaleString()} đ</div>
            </div>
            <div style={{ flex: 1, background: '#eff6ff', padding: '10px 16px', borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: '#2563eb' }}>Tổng nước tiêu thụ</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#2563eb' }}>{summaryStats.totalWaterUsed.toLocaleString()} m³</div>
              <div style={{ fontSize: 12, color: '#1e40af' }}>{summaryStats.totalWaterCost.toLocaleString()} đ</div>
            </div>
            <div style={{ flex: 1, background: '#f0fdf4', padding: '10px 16px', borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: '#16a34a' }}>Tổng chi phí</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#16a34a' }}>{(summaryStats.totalElecCost + summaryStats.totalWaterCost).toLocaleString()} đ</div>
              <div style={{ fontSize: 12, color: '#166534' }}>
                Đơn giá: Điện {servicePrices.electricity.toLocaleString()}/kWh | Nước {servicePrices.water.toLocaleString()}/m³
              </div>
            </div>
          </div>
        )}

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Phòng</th>
                <th>Tháng</th>
                <th>Điện cũ</th>
                <th>Điện mới</th>
                <th>Tiêu thụ</th>
                <th>Tiền điện</th>
                <th>Nước cũ</th>
                <th>Nước mới</th>
                <th>Tiêu thụ</th>
                <th>Tiền nước</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={11} className="text-muted" style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }}></div></td></tr>
              ) : readings.length === 0 ? (
                <tr><td colSpan={11} className="text-muted" style={{ textAlign: 'center', padding: 40 }}>
                  Không có dữ liệu
                  <div style={{ marginTop: 8 }}>
                    <button className="btn btn-sm btn-primary" onClick={openBatchRecord}>Ghi chỉ số hàng loạt</button>
                  </div>
                </td></tr>
              ) : readings.map((r, i) => (
                <tr key={r.id}>
                  <td>{(page - 1) * limit + i + 1}</td>
                  <td className="fw-600">{r.room?.room_number || r.room_id}</td>
                  <td>{formatMonth(r.billing_month)}</td>
                  <td>{r.prev_electricity}</td>
                  <td>{r.current_electricity}</td>
                  <td className="fw-600 text-success">{r.electricity_used?.toLocaleString() || 0} kWh</td>
                  <td className="fw-600">{r.electricity_cost?.toLocaleString() || 0} đ</td>
                  <td>{r.prev_water}</td>
                  <td>{r.current_water}</td>
                  <td className="fw-600 text-primary">{r.water_used?.toLocaleString() || 0} m³</td>
                  <td className="fw-600">{r.water_cost?.toLocaleString() || 0} đ</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination page={page} limit={limit} total={total} onPageChange={goToPage} onLimitChange={changeLimit} />
      </div>

      {showBatchModal && (
        <Modal
          title={`Ghi chỉ số hàng loạt - ${batchMonth ? formatMonth(batchMonth + '-01') : ''}`}
          onClose={() => setShowBatchModal(false)}
          size="xl"
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setShowBatchModal(false)}>Hủy</button>
              <button className="btn btn-primary" onClick={handleSaveBatch} disabled={saving}>
                {saving ? 'Đang lưu...' : <><MdSave /> Lưu tất cả</>}
              </button>
            </>
          }
        >
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label>Kỳ tháng ghi <span style={{ color: 'red' }}>*</span></label>
            <input
              type="month"
              className="form-control"
              style={{ maxWidth: 200 }}
              value={batchMonth}
              onChange={(e) => handleBatchMonthChange(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: 16, marginBottom: 16, fontSize: 13 }}>
            <span style={{ color: '#d97706' }}>💡 Đơn giá điện: <strong>{servicePrices.electricity.toLocaleString()} đ/kWh</strong></span>
            <span style={{ color: '#2563eb' }}>💧 Đơn giá nước: <strong>{servicePrices.water.toLocaleString()} đ/m³</strong></span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner"></div></div>
          ) : roomsData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
              Không có phòng nào đang thuê trong kỳ này
            </div>
          ) : (
            <div style={{ maxHeight: 500, overflowY: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Phòng</th>
                    <th>Điện cũ</th>
                    <th>Điện mới</th>
                    <th>Tiêu thụ</th>
                    <th>Tiền điện</th>
                    <th>Nước cũ</th>
                    <th>Nước mới</th>
                    <th>Tiêu thụ</th>
                    <th>Tiền nước</th>
                    <th>Tổng</th>
                  </tr>
                </thead>
                <tbody>
                  {roomsData.map((room) => {
                    const cost = calculateCost(room.id);
                    const prev = room.prev_reading || { current_electricity: 0, current_water: 0 };
                    const hasPrevReading = room.prev_reading !== null;

                    return (
                      <tr key={room.id} style={{ background: room.has_reading ? '#f0fdf4' : 'white' }}>
                        <td className="fw-600">
                          {room.room_number}
                          {room.has_reading && <span style={{ marginLeft: 8, fontSize: 11, color: '#16a34a' }}>✓ Đã ghi</span>}
                        </td>
                        <td>{hasPrevReading ? prev.current_electricity : <span className="text-muted">—</span>}</td>
                        <td>
                          <input
                            type="number"
                            className="form-control"
                            style={{ width: 100, padding: '6px 8px' }}
                            value={roomReadings[room.id]?.current_electricity || ''}
                            onChange={(e) => handleRoomReadingChange(room.id, 'current_electricity', e.target.value)}
                            placeholder="..."
                          />
                        </td>
                        <td className="fw-600 text-success">{cost.elecUsed} kWh</td>
                        <td className="fw-600">{cost.elecCost.toLocaleString()} đ</td>
                        <td>{hasPrevReading ? prev.current_water : <span className="text-muted">—</span>}</td>
                        <td>
                          <input
                            type="number"
                            className="form-control"
                            style={{ width: 100, padding: '6px 8px' }}
                            value={roomReadings[room.id]?.current_water || ''}
                            onChange={(e) => handleRoomReadingChange(room.id, 'current_water', e.target.value)}
                            placeholder="..."
                          />
                        </td>
                        <td className="fw-600 text-primary">{cost.waterUsed} m³</td>
                        <td className="fw-600">{cost.waterCost.toLocaleString()} đ</td>
                        <td className="fw-700" style={{ color: '#16a34a' }}>
                          {(cost.elecCost + cost.waterCost).toLocaleString()} đ
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
