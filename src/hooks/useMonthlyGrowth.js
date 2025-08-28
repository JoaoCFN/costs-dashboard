import { useMemo } from 'react';

export function useMonthlyGrowth(costsData) {
  return useMemo(() => {
    if (!costsData) return 0;
    if (costsData.monthlyTotals.length < 2) return 0;

    const first = costsData.monthlyTotals[0].total;
    const last = costsData.monthlyTotals[costsData.monthlyTotals.length - 1].total;
    return ((last - first) / first) * 100;
  }, [costsData]);
}