import { useCallback, useMemo } from "react"
import { useFetchRegions } from '../../../../../Home/Overview/useFetchRegions'
import { useRhocmSecrets } from "../../../../../../hooks/useServiceAccount";
import { RosaHCPWizard } from "nxtcm-components";
import { useFetchAwsAccountIDs } from "../../../../../Home/Overview/useFetchAwsAccountIDs";
import { AcmPage, AcmPageHeader } from "../../../../../../ui-components";
import { useTranslation } from "../../../../../../lib/acm-i18next";
import { NavigationPath } from "../../../../../../NavigationPath";
import { useLocation } from "react-router-dom-v5-compat";


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
  const { data: regionsData, isLoading: isRegionsDataLoading, refetch: refetchRegions } = useFetchRegions(data);
  const { data: awsAccountsIDs, isLoading: isAwsAccountsDataLoading, refetch: refetchAwsAccounts } = useFetchAwsAccountIDs(data)

  const handleFetchRegions = useCallback(async (): Promise<void> => {
    await refetchRegions()
  }, [refetchRegions])

  const handleFetchAwsAccountIDs = useCallback(async (): Promise<void> => {
    await refetchAwsAccounts()
  }, [refetchAwsAccounts])
  console.log("DAVID DAVID isAwsAccountsDataLoading", isAwsAccountsDataLoading)
 const breadcrumbs = useMemo(() => {
    const newBreadcrumbs = [
      { text: t('Clusters'), to: NavigationPath.clusters },
      { text: t('Infrastructure'), to: NavigationPath.createCluster },
      { text: t('Control plane type - {{hcType}}', { hcType: 'AWS' }), to: NavigationPath.createAWSControlPlane },
      {text: t('ROSA HCP')}
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
    <div style={{ height: '100%', overflow: 'auto' }}>
      <RosaHCPWizard title="ROSA HCP WIZARD" onSubmit={async () => console.log("SUBMIT")} onCancel={() => console.log("CANCEL")}
        wizardData={{
          awsInfrastructureAccounts: {
            data: awsAccountsIDs,
            error: null,
            isFetching: isAwsAccountsDataLoading,
            fetch: handleFetchAwsAccountIDs
          },
          awsBillingAccounts: {
            data: [{ label: 'Billing Account 1', value: 'billing-123' }],
            error: null,
            isFetching: false,
            
          },
          regions: {
            data: regionsData,
            error: null,
            isFetching: isRegionsDataLoading,
            fetch: handleFetchRegions,
          },
          versions: {
            data: {
              default: { label: '4.14.1', value: '4.14.1' },
              latest: { label: '4.14.2', value: '4.14.2' },
              releases: [
                { label: '4.14.1', value: '4.14.1' },
                { label: '4.14.0', value: '4.14.0' },
              ],
            },
            error: null,
            isFetching: false,
            fetch: async () => { },
          },
          machineTypes: {
            data: [
              { id: 'm5.xlarge', label: 'm5.xlarge - 4 vCPU, 16 GiB RAM', description: 'General purpose', value: 'm5.xlarge' },
            ],
            error: null,
            isFetching: false,
            fetch: async () => { },
          },
          roles: {
            data: [
              {
                installerRole: { label: 'ManagedOpenShift-Installer-Role', value: 'arn:aws:iam::role/ManagedOpenShift-Installer-Role', roleVersion: '4.14.2' },
                supportRole: [{ label: 'ManagedOpenShift-Support-Role', value: 'arn:aws:iam::role/ManagedOpenShift-Support-Role' }],
                workerRole: [{ label: 'ManagedOpenShift-Worker-Role', value: 'arn:aws:iam::role/ManagedOpenShift-Worker-Role' }],
              },
            ],
            error: null,
            isFetching: false,
            fetch: async () => { },
          },
          oidcConfig: {
            data: [{ label: 'OIDC Config 1', value: 'oidc-config-1', issuer_url: 'https://oidc.example.com' }],
            error: null,
            isFetching: false,
            fetch: async () => console.log("OIDCFetch")
          },
          vpcList: {
            data: [
              {
                id: 'vpc-12345',
                name: 'my-vpc',
                aws_subnets: [
                  { subnet_id: 'subnet-private-1', name: 'private-subnet-1', availability_zone: 'us-east-1a' },
                  { subnet_id: 'subnet-private-2', name: 'private-subnet-2', availability_zone: 'us-east-1b' },
                ],
                aws_security_groups: [{ id: 'sg-12345', name: 'default-sg' }],
              },
            ],
            error: null,
            isFetching: false,
          },
          subnets: {
            data: [
              { subnet_id: 'subnet-private-1', name: 'private-subnet-1', availability_zone: 'us-east-1a' },
              { subnet_id: 'subnet-private-2', name: 'private-subnet-2', availability_zone: 'us-east-1b' },
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