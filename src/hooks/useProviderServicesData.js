import { aggregateServices } from '../utils/aggregations';

export function useProviderServicesData(costsData, selectedMonth, provider) {
  if (!costsData) return [];

  const costs = costsData.detailedCosts;

  const aggregated = aggregateServices(costs, provider, selectedMonth);

  return aggregated
    .filter(item => item.service !== 'Total')
    .map(item => ({
      name: item.service,
      value: item.cost
    }));
}
