import { useQuery } from "@tanstack/react-query"
import { getWizardAWSAccountIds } from "../../../../../lib/wizard-test"


export const useGetAWSAccountID = (selectedSecret: any) => {
    const {data, isLoading, isError, error} = useQuery({
        queryKey: ['awsAccountIDs'],
        queryFn: async() => {
            const response = await getWizardAWSAccountIds(selectedSecret.data.client_id, selectedSecret.data.client_secret);

            return response;
        },
        enabled: !!selectedSecret,
    })
      return {
    data,
    isLoading,
    isError,
    error,
  }
}