import { useState, useCallback } from 'react';

export const usePagination = (initialPage = 1, initialLimit = 10) => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const nextPage = useCallback(() => setPage((p) => p + 1), []);
  const prevPage = useCallback(() => setPage((p) => Math.max(1, p - 1)), []);
  const goToPage = useCallback((p) => setPage(Math.max(1, p)), []);
  const changeLimit = useCallback((l) => { setLimit(l); setPage(1); }, []);

  const reset = useCallback(() => { setPage(1); }, []);

  return { page, limit, nextPage, prevPage, goToPage, changeLimit, reset };
};
