import { useQuery } from '@tanstack/react-query';
import { fetchSheetsData } from '../services/sheetsService';
import { parseSheetsData } from '../adapters/sheetsParser';
import { transformSheetsData } from '../adapters/sheetsTransform';

export function useSheetsData() {
  return useQuery({
    queryKey: ['sheetsData'],
    queryFn: async () => {
      const rawData = await fetchSheetsData();
      const parsed = parseSheetsData(rawData.data);
      return transformSheetsData(parsed);
    },
    staleTime: 1000 * 60 * 60 * 24,
    cacheTime: 1000 * 60 * 60 * 24,
    refetchOnWindowFocus: false,
  });
}
