import { useQuery } from "@tanstack/react-query";
import { getWizardRegions } from "../../../lib/wizard-test";



export const useFetchRegions = (selectedSecret: any) => {
  console.log("SELECTEDSECRET", selectedSecret)
 const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [
      'wizard',
      'regions'
    ],
    queryFn: async () => {
      const response = await getWizardRegions(selectedSecret.client_id, selectedSecret.client_secret);

      console.log("******** SAVA regions", response)
      const filterRegions = response.items.map((region: any) => region.id);

      return filterRegions;
    },
    enabled: !!selectedSecret,
  });

  

  return {
    data,
    isLoading,
    isError,
    error,
    refetch
  }
}