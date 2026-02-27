import { useMutation } from "@tanstack/react-query";
import { postRecommend } from "@/lib/api";
import type { ScoringRequest, RecommendResponse } from "@/lib/schemas";

export function useRecommend() {
  return useMutation<RecommendResponse, Error, { body: ScoringRequest; bypassCache?: boolean }>({
    mutationFn: ({ body, bypassCache = false }) => postRecommend(body, bypassCache),
  });
}
