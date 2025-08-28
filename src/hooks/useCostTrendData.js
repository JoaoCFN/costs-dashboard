import { useMemo } from 'react';

export function useCostTrendData(costsData) {
  return useMemo(() => {
    if (!costsData) return [];
    const trendData = {};

    costsData.totalServiceProviders?.forEach(totalItem => {
      if (!trendData[totalItem.month]) trendData[totalItem.month] = {};
      if (!trendData[totalItem.month][totalItem.provider]) {
        trendData[totalItem.month][totalItem.provider] = 0;
      }
      trendData[totalItem.month][totalItem.provider] += totalItem.cost;
    });

    return costsData.uniqueMonths.map(month => ({
      month,
      ...trendData[month]
    }));
  }, [costsData]);
}
