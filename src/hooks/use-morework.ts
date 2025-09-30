import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { moreworkApi, positionsApi } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { toast } from "@/hooks/use-toast";

// Position queries
export function useMoreWorkPositions(filters?: any) {
  return useQuery({
    queryKey: queryKeys.moreworks.list(filters || {}),
    queryFn: () => moreworkApi.getPositions(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
