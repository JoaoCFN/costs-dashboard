import { useMemo } from 'react';

export function useFilteredData(costsData, selectedMonth) {
  return useMemo(() => {
    if (!costsData) return [];
    let filtered = costsData.detailedCosts;

    if (selectedMonth !== 'all') {
      filtered = filtered.filter(item => item.month === selectedMonth);
    }

    return filtered;
  }, [costsData, selectedMonth]);
}
