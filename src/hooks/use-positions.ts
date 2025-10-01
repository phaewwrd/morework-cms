import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { positionsApi } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { toast } from "@/hooks/use-toast";

// Position queries
export function usePositions(filters?: any) {
  return useQuery({
    queryKey: queryKeys.positions.list(filters || {}),
    queryFn: () => positionsApi.getAll(filters),
    staleTime: 0,
  });
}

export function usePosition(id: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.positions.detail(id),
    queryFn: () => positionsApi.getById(id),
    enabled: enabled && !!id,
    staleTime: 0,
  });
}

// Position mutations
export function useCreatePosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: positionsApi.create,
    onSuccess: (data) => {
      // Invalidate positions list
      queryClient.invalidateQueries({ queryKey: queryKeys.positions.lists() });

      // Optimistically add to cache
      if (data.data) {
        queryClient.setQueryData(
          queryKeys.positions.detail(data.data.id),
          data
        );
      }

      toast({
        title: "Success",
        description: "Job position created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create position",
        variant: "destructive",
      });
    },
  });
}

export function useUpdatePosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      positionsApi.update(id, data),
    onSuccess: (data, variables) => {
      // Update the specific position in cache
      queryClient.setQueryData(queryKeys.positions.detail(variables.id), data);

      // Invalidate positions list to reflect changes
      queryClient.invalidateQueries({ queryKey: queryKeys.positions.lists() });

      toast({
        title: "Success",
        description: "Position updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update position",
        variant: "destructive",
      });
    },
  });
}

export function useUpdatePositionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      positionsApi.update(id, { status }),

    onSuccess: (data, variables) => {
      // ✅ อัปเดต cache ของ position เดี่ยว
      queryClient.setQueryData(queryKeys.positions.detail(variables.id), data);

      // ✅ รีเฟรชรายการ positions
      queryClient.invalidateQueries({
        queryKey: queryKeys.positions.lists(),
      });

      // ✅ รีเฟรช companies (เพราะหน้า Pending ใช้ useCompanies)
      queryClient.invalidateQueries({
        queryKey: queryKeys.companies.lists(),
      });

      toast({
        title: "Success",
        description: "Position status updated successfully",
      });
    },

    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update position status",
        variant: "destructive",
      });
    },
  });
}

export function useDeletePosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: positionsApi.delete,
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: queryKeys.positions.detail(id) });

      // Invalidate positions list
      queryClient.invalidateQueries({ queryKey: queryKeys.positions.lists() });

      // Also invalidate related queries (applicants, applications)
      queryClient.invalidateQueries({
        queryKey: queryKeys.applications.byPosition(id),
      });

      toast({
        title: "Success",
        description: "Position deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete position",
        variant: "destructive",
      });
    },
  });
}
