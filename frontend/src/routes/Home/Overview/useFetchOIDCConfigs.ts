import { useQuery } from "@tanstack/react-query";
import { getWizardOIDCConfigs } from "../../../lib/wizard-test";
import { useState, useRef, useCallback } from "react";



export const useFetchOIDCConfigs = (selectedSecret: any) => {
  console.log("SELECTEDSECRET", selectedSecret)
  const [awsAccountId, setAwsAccountId] = useState<string | undefined>()
  const secretRef = useRef(selectedSecret)
  secretRef.current = selectedSecret
 const { data, isLoading, isError, error } = useQuery({
    queryKey: [
      'wizard',
      'oidc-configs',
      awsAccountId
    ],
    queryFn: async () => {
      const secret = secretRef.current
          if (!secret || !awsAccountId) return []
          const response = await getWizardOIDCConfigs(
            selectedSecret,
            awsAccountId
          );
console.log("valueLabelPairs response", response)
          const valueLabelPairs = response.items?.map((item: any) => {
            return {
                value: item.id,
                label: item.id
            }
          })

          console.log("valueLabelPairs", valueLabelPairs)
          return valueLabelPairs;
    },
    enabled: !!selectedSecret,
  });

    const fetch = useCallback(async (accountId: string): Promise<void> => {
    setAwsAccountId(accountId)
  }, []);

console.log("valueLabelPairs data", data)
  return {
    data,
    isLoading,
    isError,
    error,
    fetch
  }
}