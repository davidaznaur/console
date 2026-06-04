import { useMemo } from 'react'
import { useRecoilValue, useSharedAtoms } from '../shared-recoil'
import { Secret } from '../resources'

export function useRhocmSecrets(): Secret[] {
  const { secretsState } = useSharedAtoms()
  const secrets = useRecoilValue(secretsState)
  return useMemo(
    () =>
      secrets.filter(
        (secret: any) =>
          secret?.metadata?.labels?.['cluster.open-cluster-management.io/credentials'] !== undefined &&
          secret.metadata.labels?.['cluster.open-cluster-management.io/type'] === 'rhocm'
      ),
    [secrets]
  )
}