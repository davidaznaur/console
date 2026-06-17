import { useQuery } from "@tanstack/react-query";
import { getWizardCloudProviders } from "../../../lib/wizard-test";
import { DropdownType } from "@redhat-cloud-services/nxtcm-rosa-hcp-wizard/src";

type CloudRegion = {
         /** @description Indicates the type of this object. Will be 'CloudRegion' if this is a complete object or 'CloudRegionLink' if it is just a link. */
      kind?: string;
      /** @description Unique identifier of the object. */
      id?: string;
      /** @description Self link. */
      href?: string;
      /** @description 'true' if the region is supported only for CCS clusters, 'false' otherwise. */
      ccs_only?: boolean;
      /** @description (GCP only) Comma-separated list of KMS location IDs that can be used with this region.
       *     E.g. "global,nam4,us". Order is not guaranteed. */
      kms_location_id?: string;
      /** @description (GCP only) Comma-separated list of display names corresponding to KMSLocationID.
       *     E.g. "Global,nam4 (Iowa, South Carolina, and Oklahoma),US". Order is not guaranteed but will match KMSLocationID.
       *     Unfortunately, this API doesn't allow robust splitting - Contact ocm-feedback@redhat.com if you want to rely on this. */
      kms_location_name?: string;
      /** @description Link to the cloud provider that the region belongs to. */
      cloud_provider?: CloudProvider;
      /** @description Name of the region for display purposes, for example `N. Virginia`. */
      display_name?: string;
      /** @description Whether the region is enabled for deploying a managed cluster. */
      enabled?: boolean;
      /** @description Whether the region is an AWS GovCloud region. */
      govcloud?: boolean;
      /** @description Human friendly identifier of the region, for example `us-east-1`.
       *
       *     NOTE: Currently for all cloud providers and all regions `id` and `name` have exactly
       *     the same values. */
      name?: string;
      /** @description 'true' if the region is supported for Hypershift deployments, 'false' otherwise. */
      supports_hypershift?: boolean;
      /** @description Whether the region supports multiple availability zones. */
      supports_multi_az?: boolean;
}
 type CloudProvider = {
      /** @description Indicates the type of this object. Will be 'CloudProvider' if this is a complete object or 'CloudProviderLink' if it is just a link. */
      kind?: string;
      /** @description Unique identifier of the object. */
      id?: string;
      /** @description Self link. */
      href?: string;
      /** @description Name of the cloud provider for display purposes. It can contain any characters,
       *     including spaces. */
      display_name?: string;
      /** @description Human friendly identifier of the cloud provider, for example `aws`. */
      name?: string;
      /** @description (optional) Provider's regions - only included when listing providers with `fetchRegions=true`. */
      regions?: CloudRegion[];
    };

    type CloudProviderResponse = {
    items?: Array<CloudProvider>;
    page?: number;
    size?: number;
    total?: number;
    }

const hcpCloudProvidersAndRegions = (cloudProvidersResponse: CloudProviderResponse): DropdownType[] => {
  const awsProvider = cloudProvidersResponse.items?.find((provider) => provider.id === 'aws');
  if (!awsProvider?.regions) return [];
  return awsProvider.regions
    .filter((region) => region.supports_hypershift === true)
    .map((region) => ({
      value: region.id ?? '',
      label: `${region.id}, ${region.display_name}`,
    }));
};


export const useFetchRegions = (selectedSecret: any) => {
  console.log("SELECTEDSECRET", selectedSecret)
 const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [
      'cloud-providers'
    ],
    queryFn: async () => {
      const response = await getWizardCloudProviders(selectedSecret.client_id, selectedSecret.client_secret);

      console.log("******** SAVA regions", response)

      return response ?? [];
    },
    enabled: !!selectedSecret,
    select: hcpCloudProvidersAndRegions
  });

  

  return {
    data,
    isLoading,
    isError,
    error: isError ? JSON.stringify(error) : null,
    refetch
  }
}