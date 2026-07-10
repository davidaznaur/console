import { useSharedReactQuery } from '~/hooks/shared-react-query'
import { getWizardRegions } from '~/lib/rosa-hcp-api'
import { DropdownType, SelectedSecret } from '../constants/types'

type CloudRegion = {
  kind?: string
  id?: string
  href?: string
  ccs_only?: boolean
  kms_location_id?: string
  kms_location_name?: string
  cloud_provider?: CloudProvider
  display_name?: string
  enabled?: boolean
  govcloud?: boolean
  name?: string
  supports_hypershift?: boolean
  supports_multi_az?: boolean
}
type CloudProvider = {
  kind?: string
  id?: string
  href?: string
  display_name?: string
  name?: string
  regions?: CloudRegion[]
}

type CloudProviderResponse = {
  items?: Array<CloudProvider>
  page?: number
  size?: number
  total?: number
}

const hcpCloudProvidersAndRegions = (cloudProvidersResponse: CloudProviderResponse): DropdownType[] => {
  const awsProvider = cloudProvidersResponse.items?.find((provider) => provider.id === 'aws')
  if (!awsProvider?.regions) return []
  return awsProvider.regions
    .filter((region) => region.supports_hypershift === true)
    .map((region) => ({
      value: region.id ?? '',
      label: `${region.id}, ${region.display_name}`,
    }))
}

export const useFetchRegions = (selectedSecret: SelectedSecret) => {
  console.log('SELECTEDSECRET', selectedSecret)
  const { useQuery } = useSharedReactQuery()
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['cloud-providers'],
    queryFn: async () => {
      const response = await getWizardRegions(selectedSecret.client_id, selectedSecret.client_secret)

      console.log('******** SAVA regions', response)

      return response ?? []
    },
    enabled: !!selectedSecret,
    select: hcpCloudProvidersAndRegions,
  })

  return {
    data,
    isLoading,
    isError,
    error: isError ? JSON.stringify(error) : null,
    refetch,
  }
}
