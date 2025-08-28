import { useMemo } from 'react';

export function useTotalCost(costsData, selectedMonth) {
  return useMemo(() => {
    if (!costsData) return 0;
    if (selectedMonth === 'all') {
      return costsData.monthlyTotals.reduce((sum, m) => sum + m.total, 0);
    }
    return costsData.monthlyTotals.find(m => m.month === selectedMonth)?.total || 0;
  }, [costsData, selectedMonth]);
}