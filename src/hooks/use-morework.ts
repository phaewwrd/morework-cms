import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { moreworkApi, positionsApi } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { toast } from "@/hooks/use-toast";
import { Position } from "@/types";

// Position queries
export function useMoreWorkPositions(options?: {
  filters?: Position;
  refetchInterval?: number;
  refetchOnWindowFocus?: boolean;
  refetchIntervalInBackground?: boolean;
}) {
  return useQuery({
    queryKey: queryKeys.moreworks.list(options?.filters || {}),
    queryFn: () => moreworkApi.getPositions(),
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? true,
    refetchOnMount: "always",
    refetchInterval: options?.refetchInterval,
    refetchIntervalInBackground: options?.refetchIntervalInBackground,
    staleTime: 0, // Always fresh data for real-time updates
  });
}
