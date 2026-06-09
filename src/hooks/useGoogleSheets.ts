import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchSheetsData, SheetsData } from "@/lib/googleSheets";
import { useCallback } from "react";

export function useGoogleSheets() {
  const queryClient = useQueryClient();

  const query = useQuery<SheetsData>({
    queryKey: ["google-sheets"],
    queryFn: fetchSheetsData,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  });

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["google-sheets"] });
  }, [queryClient]);

  return { ...query, refresh };
}
