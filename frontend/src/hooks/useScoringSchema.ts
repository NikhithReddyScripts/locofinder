import { useQuery } from "@tanstack/react-query";
import { getScoringSchema } from "@/lib/api";

export function useScoringSchema() {
  return useQuery({
    queryKey: ["scoring-schema"],
    queryFn: getScoringSchema,
    staleTime: Infinity, // schema doesn't change at runtime
  });
}
