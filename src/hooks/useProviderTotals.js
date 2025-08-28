import { useMemo } from 'react';
import { formatCurrency } from '../utils/formatCurrency';

export function useProviderTotals(costsData, selectedMonth) {
  return useMemo(() => {
    if (!costsData) return [];
    const totals = {};

    costsData.totalServiceProviders?.forEach(totalItem => {
      if (!totals[totalItem.provider]) {
        totals[totalItem.provider] = 0;
      }
      if (selectedMonth === 'all' || totalItem.month === selectedMonth) {
        totals[totalItem.provider] += totalItem.cost;
      }
    });

    return Object.entries(totals)
      .map(([provider, total]) => ({
        provider,
        total,
        formatted: formatCurrency(total)
      }))
      .sort((a, b) => b.total - a.total);
  }, [costsData, selectedMonth]);
}
