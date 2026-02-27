import { useQuery } from "@tanstack/react-query";
import { getLocations, type SearchParams } from "@/lib/api";

export function useLocations(params: SearchParams = {}, bypassCache = false) {
  return useQuery({
    queryKey: ["locations", params, bypassCache],
    queryFn: () => getLocations(params, bypassCache),
    placeholderData: (prev) => prev,
  });
}
