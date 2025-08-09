import { useQuery } from "@tanstack/react-query";
import type { DashboardData } from "@shared/schema";
import { format } from "date-fns";

export function useWorklogData(selectedGroup?: string | null, selectedDate?: Date | null) {
  return useQuery<DashboardData>({
    queryKey: ['/api/dashboard', selectedGroup, selectedDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedGroup) {
        params.append('group', selectedGroup);
      }
      if (selectedDate) {
        params.append('date', format(selectedDate, 'yyyy-MM-dd'));
      }
      const url = `/api/dashboard${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      return response.json();
    },
    refetchOnMount: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
