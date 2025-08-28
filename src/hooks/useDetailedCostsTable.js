import { useMemo } from 'react';

export function useDetailedCostsTable(costsData) {
  return useMemo(() => {
    if (!costsData) return [];
    const tableData = {};
    const allCosts = [...costsData.totalServiceProviders];

    allCosts.forEach(item => {
      if (!tableData[item.provider]) tableData[item.provider] = {};
      if (!tableData[item.provider][item.month]) tableData[item.provider][item.month] = 0;
      tableData[item.provider][item.month] += item.cost;
    });

    return Object.entries(tableData)
      .map(([provider, months]) => ({
        provider,
        ...costsData.uniqueMonths.reduce(
          (acc, month) => ({ ...acc, [month.toLowerCase()]: months[month] || 0 }),
          {}
        ),
        total: costsData.uniqueMonths.reduce((sum, month) => sum + (months[month] || 0), 0)
      }))
      .sort((a, b) => b.total - a.total);
  }, [costsData]);
}
