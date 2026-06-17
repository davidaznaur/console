/* Copyright Contributors to the Open Cluster Management project */

import { fetchRetry, getBackendUrl } from '../resources/utils'

export function getWizardRegions(client_id: string, client_secret: string) {
  const backendURLPath = getBackendUrl() + '/multiregion-regions'
  const abortController = new AbortController()
  return fetchRetry<any>({
    method: 'POST',
    url: backendURLPath,
    data: {
        service_account_id: client_id,
        service_account_secret: client_secret
    },
    signal: abortController.signal,
    retries: process.env.NODE_ENV === 'production' ? 2 : 0,
    disableRedirectUnauthorizedLogin: true,
  })
    .then((res) => res.data)
    .catch((error) => {
      console.error(error)
      return []
    })
}

export function getWizardAWSAccountIds(client_id: string, client_secret: string) {
  const backendURLPath = getBackendUrl() + '/aws-account-ids'
  const abortController = new AbortController()
  return fetchRetry<any>({
    method: 'POST',
    url: backendURLPath,
    data: {
        service_account_id: client_id,
        service_account_secret: client_secret
    },
    signal: abortController.signal,
    retries: process.env.NODE_ENV === 'production' ? 2 : 0,
    disableRedirectUnauthorizedLogin: true,
  })
    .then((res) => res.data)
    .catch((error) => {
      console.error(error)
      return []
    })
}

export function getOpenshiftVersions(client_id: string, client_secret: string) {
    const backendURLPath = getBackendUrl() + '/openshift-versions'
  const abortController = new AbortController()
  return fetchRetry<any>({
    method: 'POST',
    url: backendURLPath,
    data: {
        service_account_id: client_id,
        service_account_secret: client_secret
    },
    signal: abortController.signal,
    retries: process.env.NODE_ENV === 'production' ? 2 : 0,
    disableRedirectUnauthorizedLogin: true,
  })
    .then((res) => {
      console.log("RESPONSE IN QUERY", res)
      return(res.data)})
    .catch((error) => {
      console.error(error)
      return []
    })
}

export function getWizardCloudProviders(client_id: string, client_secret: string) {
    const backendURLPath = getBackendUrl() + '/cloud-providers'
  const abortController = new AbortController()
  return fetchRetry<any>({
    method: 'POST',
    url: backendURLPath,
    data: {
        service_account_id: client_id,
        service_account_secret: client_secret
    },
    signal: abortController.signal,
    retries: process.env.NODE_ENV === 'production' ? 2 : 0,
    disableRedirectUnauthorizedLogin: true,
  })
    .then((res) => {
      console.log("RESPONSE IN QUERY CLOUDPROVIDERS", res)
      return(res.data)})
    .catch((error) => {
      console.error(error)
      return []
    })
}

export function getWizardRoleARNs(client_id: string, client_secret: string, aws_account_id: string) {
  const backendURLPath = getBackendUrl() + '/sts-role-arns'
  const abortController = new AbortController()
  return fetchRetry<any>({
    method: 'POST',
    url: backendURLPath,
    data: {
      service_account_id: client_id,
      service_account_secret: client_secret,
      aws_account_id
    },
    signal: abortController.signal,
    //retries: process.env.NODE_ENV === 'production' ? 2 : 0,
    disableRedirectUnauthorizedLogin: true,
  }).then((res) => {
    console.log("ERROR IN QUERY ROLE ARNS", res)
    if (res.data?.kind === 'Error' || res.data?.body?.kind === 'Error') {
      console.log("ERROR IN QUERY ROLE ARNS", res.data)
      const errorBody = res.data?.body ?? res.data
      return res.data
      //throw new Error(errorBody.reason ?? 'Unknown OCM error')
    }
    return res.data
  })
}

export function getWizardOCMRoleARN(client_id: string, client_secret: string, aws_account_id: string) {
  const backendURLPath = getBackendUrl() + '/sts-ocm-role'
  const abortController = new AbortController()
  return fetchRetry<any>({
    method: 'POST',
    url: backendURLPath,
    data: {
      service_account_id: client_id,
      service_account_secret: client_secret,
      aws_account_id
    },
    signal: abortController.signal,
    //retries: process.env.NODE_ENV === 'production' ? 2 : 0,
    disableRedirectUnauthorizedLogin: true,
  }).then((res) => {
    console.log("ERROR IN QUERY ROLE ARNS", res)
    if (res.data?.kind === 'Error' || res.data?.body?.kind === 'Error') {
      console.log("ERROR IN QUERY ROLE ARNS", res.data)
      const errorBody = res.data?.body ?? res.data
      throw new Error(errorBody.reason ?? 'Unknown OCM error')
    }
    return res.data
  })
}

export function getWizardUserRoleARN(client_id: string, client_secret: string) {
  const backendURLPath = getBackendUrl() + '/sts-user-role'
  const abortController = new AbortController()
  return fetchRetry<any>({
    method: 'POST',
    url: backendURLPath,
    data: {
      service_account_id: client_id,
      service_account_secret: client_secret,
    },
    signal: abortController.signal,
    //retries: process.env.NODE_ENV === 'production' ? 2 : 0,
    disableRedirectUnauthorizedLogin: true,
  }).then((res) => {
    console.log("ERROR IN QUERY ROLE ARNS", res)
    if (res.data?.kind === 'Error' || res.data?.body?.kind === 'Error') {
      console.log("ERROR IN QUERY ROLE ARNS", res.data)
      const errorBody = res.data?.body ?? res.data
      throw new Error(errorBody.reason ?? 'Unknown OCM error')
    }
    return res.data
  })
}

export function getWizardAwsBillingAccounts(client_id: string, client_secret: string) {
  const backendURLPath = getBackendUrl() + '/aws-billing-accounts'
  const abortController = new AbortController()
  return fetchRetry<any>({
    method: 'POST',
    url: backendURLPath,
    data: {
      service_account_id: client_id,
      service_account_secret: client_secret,
    },
    signal: abortController.signal,
    //retries: process.env.NODE_ENV === 'production' ? 2 : 0,
    disableRedirectUnauthorizedLogin: true,
  }).then((res) => {
    console.log("ERROR IN QUERY ROLE ARNS", res)
    if (res.data?.kind === 'Error' || res.data?.body?.kind === 'Error') {
      console.log("ERROR IN QUERY ROLE ARNS", res.data)
      const errorBody = res.data?.body ?? res.data
      throw new Error(errorBody.reason ?? 'Unknown OCM error')
    }
    return res.data
  })
}

export function getWizardClusterNameUniquiness(secrets: any, cluster_name: string) {
  const backendURLPath = getBackendUrl() + '/cluster-name-check'
  const abortController = new AbortController()
  return fetchRetry<any>({
    method: 'POST',
    url: backendURLPath,
    data: {
      service_account_id: secrets.client_id,
      service_account_secret: secrets.client_secret,
      cluster_name,
    },
    signal: abortController.signal,
    //retries: process.env.NODE_ENV === 'production' ? 2 : 0,
    disableRedirectUnauthorizedLogin: true,
  }).then((res) => {
    console.log("ERROR IN QUERY ROLE ARNS", res)
    if (res.data?.kind === 'Error' || res.data?.body?.kind === 'Error') {
      console.log("ERROR IN QUERY ROLE ARNS", res.data)
      const errorBody = res.data?.body ?? res.data
      throw new Error(errorBody.reason ?? 'Unknown OCM error')
    }
    return res.data
  })
}

export function getWizardOIDCConfigs(secrets: any, aws_account_id: string) {
  const backendURLPath = getBackendUrl() + '/oidc-configs'
  const abortController = new AbortController()
  return fetchRetry<any>({
    method: 'POST',
    url: backendURLPath,
    data: {
      service_account_id: secrets.client_id,
      service_account_secret: secrets.client_secret,
      aws_account_id,
    },
    signal: abortController.signal,
    //retries: process.env.NODE_ENV === 'production' ? 2 : 0,
    disableRedirectUnauthorizedLogin: true,
  }).then((res) => {
    console.log("ERROR IN QUERY ROLE ARNS", res)
    if (res.data?.kind === 'Error' || res.data?.body?.kind === 'Error') {
      console.log("ERROR IN QUERY ROLE ARNS", res.data)
      const errorBody = res.data?.body ?? res.data
      throw new Error(errorBody.reason ?? 'Unknown OCM error')
    }
    return res.data
  })
}

export function getWizardVPCs(secrets: any, associated_data: any) {
  const backendURLPath = getBackendUrl() + '/vpcs'
  const abortController = new AbortController()
  return fetchRetry<any>({
    method: 'POST',
    url: backendURLPath,
    data: {
      service_account_id: secrets.client_id,
      service_account_secret: secrets.client_secret,
      associated_data
    },
    signal: abortController.signal,
    //retries: process.env.NODE_ENV === 'production' ? 2 : 0,
    disableRedirectUnauthorizedLogin: true,
  }).then((res) => {
    console.log("ERROR IN QUERY ROLE ARNS", res)
    if (res.data?.kind === 'Error' || res.data?.body?.kind === 'Error') {
      console.log("ERROR IN QUERY ROLE ARNS", res.data)
      const errorBody = res.data?.body ?? res.data
      throw new Error(errorBody.reason ?? 'Unknown OCM error')
    }
    return res.data
  })
}

export function getWizardMachineTypes(secrets: any, associated_data: any) {
  const backendURLPath = getBackendUrl() + '/machine-types'
  const abortController = new AbortController()
  return fetchRetry<any>({
    method: 'POST',
    url: backendURLPath,
    data: {
      service_account_id: secrets.client_id,
      service_account_secret: secrets.client_secret,
      associated_data
    },
    signal: abortController.signal,
    //retries: process.env.NODE_ENV === 'production' ? 2 : 0,
    disableRedirectUnauthorizedLogin: true,
  }).then((res) => {
    console.log("ERROR IN QUERY ROLE ARNS", res)
    if (res.data?.kind === 'Error' || res.data?.body?.kind === 'Error') {
      console.log("ERROR IN QUERY ROLE ARNS", res.data)
      const errorBody = res.data?.body ?? res.data
      throw new Error(errorBody.reason ?? 'Unknown OCM error')
    }
    return res.data
  })
}
