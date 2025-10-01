import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { moreworkApi, positionsApi } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { toast } from "@/hooks/use-toast";
import { Position } from "@/types";

// Position queries
export function useMoreWorkPositions(filters?: Position) {
  return useQuery({
    queryKey: queryKeys.moreworks.list(filters || {}),
    queryFn: () => moreworkApi.getPositions(),
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    staleTime: 0, // 5 minutes
  });
}
