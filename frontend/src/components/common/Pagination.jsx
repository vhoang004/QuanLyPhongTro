export default function Pagination({ page, limit, total, onPageChange, onLimitChange }) {
  const totalPages = Math.ceil(total / limit);

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="pagination-wrapper">
      <div className="pagination-info">
        Hiển thị {total > 0 ? `${start}–${end}` : '0'} / {total} bản ghi
        <select
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          style={{ marginLeft: 12, padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)', fontSize: 13 }}
        >
          {[10, 20, 50, 100].map((l) => <option key={l} value={l}>{l} / trang</option>)}
        </select>
      </div>
      {totalPages > 1 && (
        <div className="pagination-controls">
          <button className="pagination-btn" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
            ‹
          </button>
          {getPageNumbers().map((p) => (
            <button
              key={p}
              className={`pagination-btn ${p === page ? 'active' : ''}`}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          ))}
          <button className="pagination-btn" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
            ›
          </button>
        </div>
      )}
    </div>
  );
}
