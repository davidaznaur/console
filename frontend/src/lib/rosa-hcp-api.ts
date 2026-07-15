/* Copyright Contributors to the Open Cluster Management project */

import { fetchRetry, getBackendUrl } from '~/resources/utils'

export interface CloudRegion {
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

export interface CloudProvider {
  kind?: string
  id?: string
  href?: string
  display_name?: string
  name?: string
  regions?: CloudRegion[]
}

export interface CloudProviderResponse {
  items?: CloudProvider[]
  page?: number
  size?: number
  total?: number
}

export interface OrganizationLabel {
  id: string
  internal: boolean
  key: string
  organization_id: string
  type: string
  value: string
}

export interface AwsAccountIdsResponse {
  items?: OrganizationLabel[]
}

export interface CloudAccount {
  cloud_account_id: string
  cloud_provider_id: string
}

export interface OrganizationQuota {
  quota_id: string
  cloud_accounts: CloudAccount[]
}

export interface OrganizationQuotaResponse {
  items?: OrganizationQuota[]
}

interface WizardBasePayload {
  service_account_id: string
  service_account_secret: string
}

interface WizardErrorResponse {
  kind?: string
  reason?: string
  body?: { kind?: string; reason?: string }
}

function isWizardError(data: unknown): data is WizardErrorResponse {
  const d = data as WizardErrorResponse
  return d?.kind === 'Error' || d?.body?.kind === 'Error'
}

export function getWizardData<TResponse, TPayload extends Record<string, unknown> = Record<string, never>>(
  client_id: string,
  client_secret: string,
  url: string,
  signal?: AbortSignal,
  additionalData?: TPayload
): Promise<TResponse> {
  const backendURLPath = getBackendUrl() + url
  return fetchRetry<TResponse>({
    method: 'POST',
    url: backendURLPath,
    data: {
      service_account_id: client_id,
      service_account_secret: client_secret,
      ...additionalData,
    } as WizardBasePayload & TPayload,
    signal,
    retries: process.env.NODE_ENV === 'production' ? 2 : 0,
    disableRedirectUnauthorizedLogin: true,
  }).then((res) => {
    if (isWizardError(res.data)) {
      const errorBody = res.data?.body ?? res.data
      throw new Error(errorBody.reason ?? 'Unknown error')
    }
    return res.data
  })
}

export const getWizardAWSAccountIds = (
  client_id: string,
  client_secret: string,
  signal?: AbortSignal,
  additionalData?: Record<string, unknown>
): Promise<AwsAccountIdsResponse> =>
  getWizardData<AwsAccountIdsResponse, Record<string, unknown>>(
    client_id,
    client_secret,
    '/aws-account-ids',
    signal,
    additionalData
  )

export const getWizardAwsBillingAccounts = (
  client_id: string,
  client_secret: string,
  signal?: AbortSignal,
  additionalData?: Record<string, unknown>
): Promise<OrganizationQuotaResponse> =>
  getWizardData<OrganizationQuotaResponse, Record<string, unknown>>(
    client_id,
    client_secret,
    '/aws-billing-accounts',
    signal,
    additionalData
  )

export const getWizardRegions = (
  client_id: string,
  client_secret: string,
  signal?: AbortSignal,
  additionalData?: Record<string, unknown>
): Promise<CloudProviderResponse> =>
  getWizardData<CloudProviderResponse, Record<string, unknown>>(
    client_id,
    client_secret,
    '/regions',
    signal,
    additionalData
  )
