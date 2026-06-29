import { useCallback, useRef, useState } from 'react'
import { useQueries, useQuery } from '@tanstack/react-query'
import { getWizardOCMRoleARN, getWizardRoleARNs, getWizardUserRoleARN } from '../../../lib/wizard-test'
import { Role } from '@redhat-cloud-services/nxtcm-rosa-hcp-wizard/src'

const QUERY_KEY = ['sts-role-arns']

const toWizardRoles = (normalizedRoles: any[]): Role[] => {
  return normalizedRoles.map((role) => ({
    installerRole: {
      label: role.Installer ?? '',
      value: role.Installer ?? '',
      roleVersion: role.version ?? '',
    },
    supportRole: role.Support
      ? [{ label: role.Support, value: role.Support }]
      : [],
    workerRole: role.Worker
      ? [{ label: role.Worker, value: role.Worker }]
      : [],
  }))
}

const normalizedAWSAccountRole = (arrayOfRoleItems: any, prefix: any) =>
  arrayOfRoleItems.reduce(
    (roleObj: any, { type, arn, roleVersion, ...otherRoleAttributes }: any) => ({
      ...roleObj,
      ...otherRoleAttributes,
      version: roleVersion,
      [type]: arn,
    }),
    {
      prefix,
    },
  );

export const normalizeAWSAccountRoles = (accountRoles: any) => {
  const normalizedRoles: any = [];

  (accountRoles?.items || []).forEach((accountRole: any) => {
    // Only use accountRoles that have more than 1 arn attached
    // This is to prevent managed policy roles created with an unsupported CLI version
    if (accountRole.items && accountRole.items.length > 1) {
      const managedPolicyArns: any = [];
      const unManagedPolicyArns: any = [];

      // Split into managed and unmanaged policy
      accountRole.items.forEach((item: any) => {
        if (item.hcpManagedPolicies || item.managedPolicies) {
          managedPolicyArns.push(item);
        } else {
          unManagedPolicyArns.push(item);
        }
      });
      if (managedPolicyArns.length) {
        normalizedRoles.push(normalizedAWSAccountRole(managedPolicyArns, accountRole.prefix));
      }
      if (unManagedPolicyArns.length) {
        normalizedRoles.push(normalizedAWSAccountRole(unManagedPolicyArns, accountRole.prefix));
      }
    }
  });
  return normalizedRoles;
};

// Probably wont be needed
// export const useFetchGetOCMRole = (selectedSecret: any) => {
//   const [awsAccountId, setAwsAccountId] = useState<string | undefined>()
//   const secretRef = useRef(selectedSecret)
//   secretRef.current = selectedSecret

//   const { data, isLoading, error, refetch } = useQuery({
//     queryKey: ['feetch-ocm-role'],
//     queryFn: async () => {
//       const secret = secretRef.current
//       if (!secret || !awsAccountId) return []
//       const response = await getWizardOCMRoleARN(
//         secret.client_id,
//         secret.client_secret,
//         awsAccountId
//       )
//       console.log("RESPONSE IN THE HOOK", response)
      
//       return response
//     },
//     enabled: !!selectedSecret && !!awsAccountId,

//   })

//   const fetch = useCallback(async (accountId: string): Promise<void> => {
//     console.log("useFetchGetOCMRole ACCOUNT ID IN THE HOOK", accountId)
//     setAwsAccountId(accountId)
//   }, [])
//   console.log("useFetchGetOCMRole ERROR in a hook", error)
//   console.log("useFetchGetOCMRole data in the hook 2", data)
//   return {
//     data: data ?? [],
//     isLoading,
//     error: error ? String(error) : null,
//     refetch,
//     fetch,
//   }
// };

export const useFetchRoleARNs = (selectedSecret: any) => {
  const [awsAccountId, setAwsAccountId] = useState<string | undefined>()
  const secretRef = useRef(selectedSecret)
  secretRef.current = selectedSecret
  const [rolesQuery, ocmRoleQuery, userRoleQuery] = useQueries({
    queries: [
      {
        queryKey: [...QUERY_KEY, awsAccountId],
        queryFn: async () => {
          const secret = secretRef.current
          if (!secret || !awsAccountId) return { roles: [], error: null }
          const response = await getWizardRoleARNs(
            secret.client_id,
            secret.client_secret,
            awsAccountId
          )
          console.log("DAVIDKA response",response)
          if (response.statusCode !== 200) {
            return { roles: [], error: response.body.reason ?? 'Failed to fetch role ARNs' }
          }
          const normalized = normalizeAWSAccountRoles(response.body)
          const filtered = normalized.filter((arn: any) =>
            arn.hcpManagedPolicies && arn.managedPolicies
          )
          return { roles: toWizardRoles(filtered), error: null }
        },
        enabled: !!selectedSecret && !!awsAccountId,
        retry: false,
      },
      {
        queryKey: ['ocm-role', awsAccountId],
        queryFn: async () => {
          const secret = secretRef.current
          if (!secret || !awsAccountId) return null
          const response = await getWizardOCMRoleARN(
            secret.client_id,
            secret.client_secret,
            awsAccountId
          )
          return response
        },
        enabled: !!selectedSecret && !!awsAccountId,
        retry: false,
      },
      {
        queryKey: ['sts-user-role'],
        queryFn: async () => {
          const secret = secretRef.current
          if (!secret || !awsAccountId) return null
          const response = await getWizardUserRoleARN(
            secret.client_id,
            secret.client_secret,
          )
          return response
        },
        enabled: !!selectedSecret && !!awsAccountId,
        retry: false,
      }
    ],
  })
  const fetch = useCallback(async (accountId: string): Promise<void> => {
    setAwsAccountId(accountId)
  }, []);

  const refetchAll = useCallback(async (accountId: string) => {
    await Promise.all([
      fetch(accountId),
      rolesQuery.refetch(),
      ocmRoleQuery.refetch(),
      userRoleQuery.refetch(),
    ])
  }, [rolesQuery.refetch, ocmRoleQuery.refetch, userRoleQuery.refetch]);

  console.log("QUERY RESULT ocmRoleQuery",ocmRoleQuery)
   console.log("QUERY RESULT userRoleQuery",userRoleQuery)
    console.log("QUERY RESULT rolesQuery",rolesQuery)

  const ocmRoleError = (ocmRoleQuery.error instanceof Error ? ocmRoleQuery.error.message : null);
  const userRoleError = (userRoleQuery.error instanceof Error ? userRoleQuery.error.message === "AccountLabel with key='sts_user_role' not found" ? "User role was not found" : null : null)
  const rolesError = rolesQuery.data?.error ?? (rolesQuery.error instanceof Error ? rolesQuery.error.message : null)

  return {
    data: Array.isArray(rolesQuery.data?.roles) ? rolesQuery.data.roles : [],
    ocmRole: ocmRoleQuery.data ?? null,
    userRole: userRoleQuery.data ?? null,
    isLoading: rolesQuery.isLoading || ocmRoleQuery.isLoading,
    error: rolesError,
    ocmRoleError: ocmRoleError,
    userRoleError: userRoleError,
    refetch: refetchAll,
    fetch,
  }
}