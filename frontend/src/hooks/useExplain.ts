import { useMutation } from "@tanstack/react-query";
import { postExplain } from "@/lib/api";
import type { ScoringRequest, ExplainResponse } from "@/lib/schemas";

export function useExplain() {
  return useMutation<
    ExplainResponse,
    Error,
    { locationId: string; body: ScoringRequest; bypassCache?: boolean }
  >({
    mutationFn: ({ locationId, body, bypassCache = false }) =>
      postExplain(locationId, body, bypassCache),
  });
}
