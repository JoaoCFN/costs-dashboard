import { useMemo } from 'react';

export function useTopProviders(providerTotals) {
  const topProviders = useMemo(() => providerTotals.slice(0, 3), [providerTotals]);
  const topProvidersTotal = useMemo(
    () => topProviders.reduce((sum, provider) => sum + provider.total, 0),
    [topProviders]
  );

  return { topProviders, topProvidersTotal };
}
