import { useQuery } from "@tanstack/react-query";
import { getWizardAwsBillingAccounts } from "../../../lib/wizard-test";


export const useFetchOrganizationQuota = (secret: any) => {
  const { isLoading, data, isError, error, isFetching, refetch } = useQuery({
    queryKey: [
      "fetch-aws-billing"
    ],
    queryFn: async () => {
      const organizationQuota = await getWizardAwsBillingAccounts(secret.client_id, secret.client_secret);
      return organizationQuota
    },
    enabled: !!secret,
  })

    return { isLoading, data, isError, error, isFetching, refetch};
};