import { useMemo } from 'react';
import { aggregateServices } from '../utils/aggregations';

export function useProviderServicesData(costsData, selectedMonth, provider) {
  return useMemo(() => {
    if (!costsData) return [];
    const baseData =
      selectedMonth === 'all'
        ? costsData[`${provider.toLowerCase()}Services`]
        : aggregateServices(costsData.detailedCosts, provider, selectedMonth);

    return baseData.map(service => ({
      name: service.service,
      value: service.cost
    }));
  }, [costsData, selectedMonth, provider]);
}
