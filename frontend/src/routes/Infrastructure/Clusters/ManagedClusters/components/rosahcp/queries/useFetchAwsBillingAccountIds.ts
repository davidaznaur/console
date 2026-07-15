/* Copyright Contributors to the Open Cluster Management project */
import type { CloudAccount, OrganizationQuota } from '~/lib/rosa-hcp-api'
import { getWizardAwsBillingAccounts } from '~/lib/rosa-hcp-api'
import { SelectedSecret } from '../constants/types'
import { useSharedReactQuery } from '~/hooks/shared-react-query'
import { rosaWizardKeys } from './queryKeyFactory'

const getAwsBillingAccountsFromQuota = (items?: OrganizationQuota[]): { value: string; label: string }[] => {
  const foundAwsBillingAccounts =
    items
      ?.find((quota) => quota.quota_id === 'cluster|byoc|moa|marketplace')
      ?.cloud_accounts?.filter((account: CloudAccount) => account.cloud_provider_id === 'aws') || []

  return foundAwsBillingAccounts.map((billingAccount: CloudAccount) => ({
    value: billingAccount.cloud_account_id,
    label: billingAccount.cloud_account_id,
  }))
}

export const useFetchOrganizationQuota = (secret: SelectedSecret) => {
  const { useQuery } = useSharedReactQuery()
  const { isLoading, data, isError, error, isFetching, refetch } = useQuery({
    queryKey: rosaWizardKeys.awsBillingAccounts(),
    queryFn: async ({ signal }) => {
      const organizationQuota = await getWizardAwsBillingAccounts(secret.client_id, secret.client_secret, signal)
      return organizationQuota
    },
    enabled: !!secret,
    retry: false,
  })

  const billingAccounts = getAwsBillingAccountsFromQuota(data?.items)

  return { isLoading, data: billingAccounts, isError, error, isFetching, refetch }
}
