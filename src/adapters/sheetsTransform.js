import { monthOrder } from '../utils/monthOrder';
import { aggregateServices } from '../utils/aggregations';

export function transformSheetsData(parsedData) {
  const uniqueMonths = [...new Set(parsedData.map(item => item.month))].sort(
    (a, b) => monthOrder[a] - monthOrder[b]
  );

  const uniqueProviders = [...new Set(parsedData.map(item => item.provider))];

  const monthlyTotals = uniqueMonths.map(month => ({
    month,
    total: parsedData
      .filter(item => item.month === month && item.service === 'Total')
      .reduce((sum, item) => sum + item.cost, 0)
  }));

  const detailedCosts = parsedData.filter(item => item.service !== 'Total');

  const totalServiceProviders = parsedData.filter(item => item.service === 'Total');

  const awsServices = aggregateServices(detailedCosts, 'AWS', 'all');
  const herokuServices = aggregateServices(detailedCosts, 'Heroku', 'all');

  return {
    uniqueMonths,
    uniqueProviders,
    monthlyTotals,
    detailedCosts,
    totalServiceProviders,
    awsServices,
    herokuServices
  };
}
