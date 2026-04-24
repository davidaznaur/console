import { useMemo } from "react";
import { useRecoilValue, useSharedAtoms } from "../shared-recoil";


export function getServiceAccount(serviceAccountName: string) {
    const { secretsState } = useSharedAtoms();
    const secrets = useRecoilValue(secretsState);
    const credentialsSecrets = useMemo(
        () =>
            secrets.filter(
                (secret) => secret?.metadata?.labels?.['cluster.open-cluster-management.io/credentials'] !== undefined && secret?.metadata.name === serviceAccountName
            ),
        [secrets]
    )

    const ocmSecrets = credentialsSecrets.filter((secret) => secret.metadata.labels?.['cluster.open-cluster-management.io/type'] === "rhocm")
    console.log("DAVID SECRETS", ocmSecrets)

    return ocmSecrets
}