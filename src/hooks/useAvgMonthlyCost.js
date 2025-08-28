import { useMemo } from 'react';

export function useAvgMonthlyCost(costsData) {
  return useMemo(() => {
    if (!costsData) return 0;
    return (
      costsData.monthlyTotals.reduce((sum, m) => sum + m.total, 0) /
      costsData.monthlyTotals.length
    );
  }, [costsData]);
}