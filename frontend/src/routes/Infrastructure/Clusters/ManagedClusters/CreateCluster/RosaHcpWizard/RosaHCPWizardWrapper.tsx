import { useCallback, useMemo } from "react"
import { useRhocmSecrets } from "../../../../../../hooks/useServiceAccount";
import { RosaHCPWizard } from "@redhat-cloud-services/nxtcm-rosa-hcp-wizard/dist";
import { useFetchAwsAccountIDs } from "../../../../../Home/Overview/useFetchAwsAccountIDs";
import { AcmPage, AcmPageHeader } from "../../../../../../ui-components";
import { useTranslation } from "../../../../../../lib/acm-i18next";
import { NavigationPath } from "../../../../../../NavigationPath";
import { useLocation } from "react-router-dom-v5-compat";
import { useFetchHCPVersions } from "../../../../../Home/Overview/useFetchOpenshiftVersions";
import { useFetchRegions } from "../../../../../Home/Overview/useFetchCloudProviders";
import { useFetchRoleARNs } from "../../../../../Home/Overview/useFetchRoleARNs";
import { useFetchOrganizationQuota } from "../../../../../Home/Overview/useFetchOrganizationAndQuota";
import { getWizardClusterNameUniquiness } from "../../../../../../lib/wizard-test";
import { useFetchOIDCConfigs } from "../../../../../Home/Overview/useFetchOIDCConfigs";
import { useFetchVPCs } from "../../../../../Home/Overview/useFetchVPCs";
import { useFetchHCPMachineTypesByRegion } from "../../../../../Home/Overview/useFetchMachineTypes";


const getAwsBillingAccountsFromQuota = (items?: any[]) => {
  const foundAwsBillingAccounts = items
    ?.find((quota) => quota.quota_id === 'cluster|byoc|moa|marketplace')
    ?.cloud_accounts?.filter((account: any) => account.cloud_provider_id === 'aws') || [];

    const billingAccountDropdown = foundAwsBillingAccounts.map((billingAccount: any) => ({
  value: billingAccount.cloud_account_id,
  label: billingAccount.cloud_account_id
}));

    return billingAccountDropdown
};
  


export const RosaHCPWizardWrapper = () => {
  const [t] = useTranslation();

  const location = useLocation()
  const selectedSecretName = (location.state as { selectedSecretName?: string })?.selectedSecretName
  const ocmSecrets = useRhocmSecrets()
  const selectedSecret = useMemo(
    () => ocmSecrets.find((s) => s.metadata.name === selectedSecretName) ?? ocmSecrets[0],
    [ocmSecrets, selectedSecretName]
  )
  console.log("DAVID MAIN WRAPPER selectedSecret", selectedSecret)
  const { data } = selectedSecret

  // const ocmSecret = useRhocmSecrets();
  //console.log("OCMSECRET", ocmSecret)
  // const { data } = ocmSecret[0];
  console.log("DAVID MAIN WRAPPER DATA", data)
  const { data: awsAccountsIDs, isLoading: isAwsAccountsDataLoading, refetch: refetchAwsAccounts } = useFetchAwsAccountIDs(data)
  const { data: versions, isLoading: isVersionsLoading, refetch: refetchVersions } = useFetchHCPVersions(data)
  const { data: cloudProviders, isLoading: isCloudProvidersLoading, error: cloudProvidersError, refetch: refetchCloudProviders } = useFetchRegions(data)
  const { data: accountRoleARNs,ocmRoleError: ocmRoleError, userRoleError: userRoleQueryError, ocmRole: ocmRoleARN, userRole: userRoleARN, refetch: refetchUserRoleARNs, error: rolesError } = useFetchRoleARNs(data)
  const {data: oidcConfigs, isLoading: isOIDCConfigsLoading, error: oidcConfigsError, fetch: fetchOIDCConfigs} = useFetchOIDCConfigs(data)
  const { data: vpcData, isLoading: isVpcListLoading, error: vpcListError,
  fetch: fetchVpcList } = useFetchVPCs(data);
  // const {data: ocmRoleARN, error: ocmRoleError, fetch: ocmRoleRefetch} = useFetchGetOCMRole(data)
  // console.log("DAVIDKA ocmRoleARN",ocmRoleARN?.body)
  // console.log("DAVIDKA userRoleARN",userRoleARN)
  // console.log("DAVIDKA accountRoleARN",accountRoleARNs)
const {data: machineTypesData, fetch: fetchMachineTypesData} = useFetchHCPMachineTypesByRegion(data)
  console.log("****************** machineTypesData", machineTypesData)

  const { isLoading, data: orgAndQuota } = useFetchOrganizationQuota(data);
  const billingAccounts = getAwsBillingAccountsFromQuota(orgAndQuota?.items);
  console.log("DAVIDKA orgAndQuota", orgAndQuota)
  console.log("DAVIDKA billingAccounts", billingAccounts)

  const handleFetchAwsAccountIDs = useCallback(async (): Promise<void> => {
    await refetchAwsAccounts()
  }, [refetchAwsAccounts])

  const handleFetchVersions = useCallback(async (): Promise<void> => {
    await refetchVersions();
  }, [refetchVersions]);

const handleRolesFetch = useCallback(
  async (accountId: string): Promise<void> => {
    await refetchUserRoleARNs(accountId);
  },
  [refetchUserRoleARNs]
);
// When the wizard calls regions.fetch(accountId), also update VPC deps
const handleFetchRegions = useCallback(
  async (accountId: string): Promise<void> => {
    await refetchCloudProviders();
  },
  [refetchCloudProviders]
);

  console.log("DAVID DAVID isAwsAccountsDataLoading", isAwsAccountsDataLoading)

const checkClusterNameUniqueness = useCallback(
  async (name: string, _region?: string): Promise<string | null> => {
    const response = await getWizardClusterNameUniquiness(
        data,
        name
      )
      // response.body.total > 0 means name already exists
      if (response?.body?.total > 0) {
        return `Cluster name '${name}' is already in use`
      }
      return null
  },
  [data]
)

  const breadcrumbs = useMemo(() => {
    const newBreadcrumbs = [
      { text: t('Clusters'), to: NavigationPath.clusters },
      { text: t('Infrastructure'), to: NavigationPath.createCluster },
      { text: t('Control plane type - {{hcType}}', { hcType: 'AWS' }), to: NavigationPath.createAWSControlPlane },
      { text: t('ROSA HCP') }
    ]
    return newBreadcrumbs
  }, [t])
  return (
    <AcmPage
      header={
        <AcmPageHeader
          title={t('Control plane type - {{hcType}}', { hcType: 'AWS' })}
          description={t('Choose a control plane type for your cluster.')}
          breadcrumb={breadcrumbs}
        />
      }
    >
      <div style={{ height: '100%' }}>
        <RosaHCPWizard title="ROSA HCP WIZARD" onSubmit={async () => console.log("SUBMIT")} onCancel={() => console.log("CANCEL")}
          wizardData={{
            checkClusterNameUniqueness,
            awsInfrastructureAccounts: {
              data: awsAccountsIDs,
              error: null,
              isFetching: isAwsAccountsDataLoading,
              fetch: handleFetchAwsAccountIDs
            },
            awsBillingAccounts: {
              data: billingAccounts,
              error: null,
              isFetching: isLoading,

            },
            regions: {
              data: cloudProviders ?? [],
              error: cloudProvidersError,
              isFetching: isCloudProvidersLoading,
              fetch: handleFetchRegions,
            },
            versions: {
              data: versions,
              error: null,
              isFetching: isVersionsLoading,
              fetch: handleFetchVersions,
            },
            machineTypes: {
              data: [
                { id: 'm5.xlarge', label: 'm5.xlarge - 4 vCPU, 16 GiB RAM', description: 'General purpose', value: 'm5.xlarge' },
              ],
              error: null,
              isFetching: false,
              fetch: fetchMachineTypesData,
            },
            roles: {
              data: accountRoleARNs,
              error: rolesError,
              isFetching: false,
              fetch: handleRolesFetch,
            },
            oidcConfig: {
              data: oidcConfigs,
              error: oidcConfigsError as string,
              isFetching: isOIDCConfigsLoading,
              fetch: fetchOIDCConfigs
            },
            vpcList: {
              data: vpcData,
              error: vpcListError,
              isFetching: isVpcListLoading,
              fetch: fetchVpcList
            },
            subnets: {
              data: [
                { subnet_id: 'subnet-private-1', name: 'private-subnet-1', availability_zone: 'us-east-1a', public: false },
                { subnet_id: 'subnet-private-2', name: 'private-subnet-2', availability_zone: 'us-east-1b', public: false },
              ],
              error: null,
              isFetching: false,
            },
            securityGroups: {
              data: [{ id: 'sg-12345', name: 'default-sg' }],
              error: null,
              isFetching: false,
            },
            clusterNameValidation: {
              error: null,
              isFetching: false,
            },
          }}


        /></div>
    </AcmPage>
  )
}