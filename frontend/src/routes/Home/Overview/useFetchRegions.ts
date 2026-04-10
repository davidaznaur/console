import { useQuery } from "@tanstack/react-query";
import { getWizardRegions } from "../../../lib/get-test-david";


export const useFetchRegions = (client_id: string, client_secret: string) => {
 const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [
      'wizard',
      'regions'
    ],
    queryFn: async () => {
      const response = await getWizardRegions(client_id, client_secret);
      const filterRegions = response.items.map((region: any) => region.id);

      return filterRegions;
    },
    enabled: true,
  });

  return {
    data,
    isLoading,
    isError,
    error,
    refetch
  }
}