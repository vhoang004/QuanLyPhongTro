const getStartOfMonth = (date) => {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), 1);
};

const getEndOfMonth = (date) => {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
};

const formatDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  return d.toISOString().split("T")[0];
};

const formatMonth = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}-01`;
};

const parseMonth = (monthStr) => {
  const [year, month] = monthStr.split("-");
  return new Date(parseInt(year), parseInt(month) - 1, 1);
};

const addMonths = (date, months) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
};

const daysUntil = (date) => {
  const now = new Date();
  const target = new Date(date);
  const diff = target - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const isExpiringWithinDays = (endDate, days = 15) => {
  return daysUntil(endDate) <= days && daysUntil(endDate) >= 0;
};

const paginate = (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return { limit: parseInt(limit), offset: parseInt(offset) };
};

const buildPaginationResponse = (data, count, page = 1, limit = 10) => {
  const totalPages = Math.ceil(count / limit);
  return {
    data,
    rows: data,
    count,
    total: count,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages,
    hasNext: parseInt(page) < totalPages,
    hasPrev: parseInt(page) > 1,
  };
};

const paginateQuery = ({ page = 1, limit = 10 }) => {
  const offset = (parseInt(page) - 1) * parseInt(limit);
  return { limit: parseInt(limit), offset };
};

module.exports = {
  getStartOfMonth,
  getEndOfMonth,
  formatDate,
  formatMonth,
  parseMonth,
  addMonths,
  daysUntil,
  isExpiringWithinDays,
  paginate,
  buildPaginationResponse,
  paginateQuery,
};
