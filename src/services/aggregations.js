export function aggregateServices(costs, provider, selectedMonth) {
  return costs
    .filter(
      item =>
        item.provider === provider &&
        item.service !== 'Total' &&
        (selectedMonth === 'all' || item.month === selectedMonth)
    )
    .reduce((acc, item) => {
      const existing = acc.find(s => s.service === item.service);
      if (existing) {
        existing.cost += item.cost
      } else {
        acc.push({ service: item.service, cost: item.cost })
      }
      return acc
    }, [])
}
