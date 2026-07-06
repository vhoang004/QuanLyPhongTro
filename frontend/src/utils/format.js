export const formatCurrency = (amount) => {
  if (amount == null) return '0';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const formatMonth = (dateString) => {
  if (!dateString) return '';
  const [year, month] = dateString.split('-');
  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
  ];
  return `${monthNames[parseInt(month) - 1]} ${year}`;
};

export const getMonthValue = (date = new Date()) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}-01`;
};

export const parseApiError = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) return error.message;
  return 'Đã xảy ra lỗi không xác định';
};

export const roomTypeLabels = {
  standard: 'Tiêu chuẩn',
  deluxe: 'Cao cấp',
};

export const roomStatusLabels = {
  available: 'Trống',
  rented: 'Đã thuê',
  maintenance: 'Bảo trì',
  inactive: 'Không hoạt động',
};

export const amenityLabels = {
  wifi: 'Wifi',
  wc: 'WC riêng',
  aircon: 'Điều hòa',
  water_heater: 'Bình nước nóng',
  balcony: 'Ban công',
  parking: 'Chỗ để xe',
  camera: 'Camera an ninh',
  fingerprint_lock: 'Khóa vân tay',
  tv: 'TV',
  refrigerator: 'Tủ lạnh',
  washing_machine: 'Máy giặt',
  bed: 'Giường ngủ',
  wardrobe: 'Tủ quần áo',
  kitchen: 'Khu bếp',
};

export const contractStatusLabels = {
  active: 'Đang hiệu lực',
  expiring_soon: 'Sắp hết hạn',
  expired: 'Hết hạn',
  terminated: 'Đã thanh lý',
};

export const invoiceStatusLabels = {
  unpaid: 'Chưa thanh toán',
  partial: 'Thanh toán một phần',
  paid: 'Đã thanh toán',
};

export const paymentMethodLabels = {
  cash: 'Tiền mặt',
  bank_transfer: 'Chuyển khoản',
  qr: 'Quét QR',
};
