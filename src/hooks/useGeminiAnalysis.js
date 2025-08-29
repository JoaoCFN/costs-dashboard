import { useQuery } from "@tanstack/react-query";
import { fetchGeminiAnalysis } from "../services/geminiService";

export function useGeminiAnalysis(detailedCosts) {
  return useQuery({
    queryKey: ["geminiAnalysis", detailedCosts],
    queryFn: () => fetchGeminiAnalysis(detailedCosts),
    enabled: !!detailedCosts,
    staleTime: 1000 * 60 * 60 * 24,
    cacheTime: 1000 * 60 * 60 * 24,
    refetchOnWindowFocus: false,
  });
}
