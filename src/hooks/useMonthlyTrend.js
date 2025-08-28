import { useMemo } from 'react';
import { formatCurrency } from '../utils/formatCurrency';

export function useMonthlyTrend(costsData) {
  return useMemo(() => {
    if (!costsData) return [];
    return costsData.monthlyTotals.map(item => ({
      month: item.month,
      total: item.total,
      formatted: formatCurrency(item.total)
    }));
  }, [costsData]);
}
