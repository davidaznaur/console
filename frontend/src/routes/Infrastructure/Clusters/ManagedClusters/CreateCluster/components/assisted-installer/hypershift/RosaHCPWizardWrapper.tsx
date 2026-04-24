import React, { useMemo } from "react"
import { useRecoilValue, useSharedAtoms } from '../../../../../../../../shared-recoil';
import { useFetchRegions } from '../../../../../../../../routes/Home/Overview/useFetchRegions'
import { selectedServiceAccountState } from "../../../../CreateClusterCatalog/rosaHCPAtom";
import { useGetAWSAccountID } from "../../../../CreateClusterCatalog/useGetAWSAccoountID";


export const RosaHCPWizardWrapper = (props: any) => {
      const selectedServiceAccount = useRecoilValue(selectedServiceAccountState)

    // const [selectedSecret, setSelectedSecret] = React.useState<any>();
const { secretsState } = useSharedAtoms()
      const secrets = useRecoilValue(secretsState)
      const credentialsSecrets = useMemo(
        () =>
          secrets.filter(
            (secret) => secret?.metadata?.labels?.['cluster.open-cluster-management.io/credentials'] !== undefined && secret.metadata.labels?.['cluster.open-cluster-management.io/type'] === 'rhocm'
          ),
        [secrets]
      )
console.log("***********secretsState**************", secretsState)
console.log("***********secrets**************", secrets)
 console.log("***********selectedServiceAccount**************", selectedServiceAccount)

//  const [regions, setRegions] = React.useState();
 
//    const ocmSecret = getServiceAccount(selectedSecret);
//    console.log("OCMSECRET", ocmSecret)
//    const {data} = ocmSecret[0];
//    const {client_id, client_secret} = data as unknown as OcmSecretData;
 
   const {data: regionsData} = useFetchRegions(selectedServiceAccount);

   const {data: awsAccountsIDs} = useGetAWSAccountID(selectedServiceAccount);
   console.log("**********awsAccountsIDs DATA**********", awsAccountsIDs)

    return(
        <>
        <div>
            {/* <WizSelect label="Select service account" path="cluster.service_account" 
            options={credentialsSecrets.filter((secret) => secret.metadata.name !== undefined).map((secret) => ({
                label: secret.metadata.name ?? '',
                value: secret.metadata.name ?? ''
            }))}
            onValueChange={(item) => {
                const filteredServiceAccount = credentialsSecrets.filter((secret) => secret.metadata.name === item)
                //setSelectedSecret(filteredServiceAccount)
            }}
            /> */}
            <p>HELLO! </p>
            </div></>
    )
}