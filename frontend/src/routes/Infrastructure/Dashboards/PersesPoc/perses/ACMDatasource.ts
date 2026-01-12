/* Copyright Contributors to the Open Cluster Management project */

/**
 * ACM Search API Datasource for Perses
 * This file defines a custom datasource that fetches data from ACM Search API
 */

import { DatasourceSpec } from '@perses-dev/core'
import { getBackendUrl, postRequest } from '../../../../../resources/utils'

// ACM Search API endpoint
const SEARCH_API_URL = '/proxy/search'

// GraphQL query for search results
const SEARCH_RESULT_ITEMS_QUERY = `
  query searchResult($input: [SearchInput]) {
    searchResult: search(input: $input) {
      items
    }
  }
`

const SEARCH_RESULT_COUNT_QUERY = `
  query searchResult($input: [SearchInput]) {
    searchResult: search(input: $input) {
      count
    }
  }
`

// Types for ACM Search API
export interface SearchFilter {
  property: string
  values: string[]
}

export interface SearchInput {
  filters: SearchFilter[]
  relatedKinds?: string[]
  limit?: number
}

export interface SearchQuery {
  operationName: string
  variables: {
    input: SearchInput[]
  }
  query: string
}

export interface SearchResultItem {
  name: string
  namespace?: string
  kind: string
  cluster: string
  apiversion?: string
  apigroup?: string
  created?: string
  status?: string
  cpu?: string
  memory?: string
  nodes?: string
  labels?: string
  [key: string]: unknown
}

export interface ISearchResult {
  data: {
    searchResult: {
      items?: SearchResultItem[]
      count?: number
    }[]
  }
}

/**
 * ACM Search API Datasource Specification
 */
export interface ACMSearchDatasourceSpec extends DatasourceSpec {
  plugin: {
    kind: 'ACMSearchDatasource'
    spec: {
      endpoint?: string
    }
  }
}

/**
 * Execute a search query against the ACM Search API
 */
export async function executeSearchQuery(query: SearchQuery): Promise<ISearchResult> {
  const result = await postRequest<SearchQuery, ISearchResult>(
    getBackendUrl() + SEARCH_API_URL,
    query
  ).promise
  return result
}

/**
 * Get items by kind
 */
export async function getItemsByKind(kind: string, limit = -1): Promise<SearchResultItem[]> {
  const query: SearchQuery = {
    operationName: 'searchResult',
    variables: {
      input: [
        {
          filters: [{ property: 'kind', values: [kind] }],
          limit,
        },
      ],
    },
    query: SEARCH_RESULT_ITEMS_QUERY,
  }
  const result = await executeSearchQuery(query)
  return result?.data?.searchResult?.[0]?.items || []
}

/**
 * Get count by kind
 */
export async function getCountByKind(kind: string): Promise<number> {
  const query: SearchQuery = {
    operationName: 'searchResult',
    variables: {
      input: [
        {
          filters: [{ property: 'kind', values: [kind] }],
          limit: -1,
        },
      ],
    },
    query: SEARCH_RESULT_COUNT_QUERY,
  }
  const result = await executeSearchQuery(query)
  return result?.data?.searchResult?.[0]?.count || 0
}

/**
 * Get clusters with status
 */
export async function getClusters(): Promise<SearchResultItem[]> {
  return getItemsByKind('Cluster')
}

/**
 * Get cluster summary
 */
export async function getClusterSummary(): Promise<{
  total: number
  available: number
  unavailable: number
  unknown: number
}> {
  const clusters = await getClusters()
  return clusters.reduce(
    (summary, cluster) => {
      summary.total++
      const status = (cluster.ManagedClusterConditionAvailable as string)?.toLowerCase()
      if (status === 'true') {
        summary.available++
      } else if (status === 'false') {
        summary.unavailable++
      } else {
        summary.unknown++
      }
      return summary
    },
    { total: 0, available: 0, unavailable: 0, unknown: 0 }
  )
}

/**
 * Get pods with status
 */
export async function getPods(limit = 100): Promise<SearchResultItem[]> {
  return getItemsByKind('Pod', limit)
}

/**
 * Get pod status summary
 */
export async function getPodStatusSummary(): Promise<{
  running: number
  pending: number
  failed: number
  succeeded: number
  error: number
  unknown: number
}> {
  const pods = await getPods(-1)
  return pods.reduce(
    (summary, pod) => {
      const status = (pod.status as string)?.toLowerCase()
      if (status === 'running') {
        summary.running++
      } else if (status === 'pending') {
        summary.pending++
      } else if (status === 'failed') {
        summary.failed++
      } else if (status === 'succeeded') {
        summary.succeeded++
      } else if(status === 'error'){
        summary.error++
      }else {
        summary.unknown++
      }
      return summary
    },
    { running: 0, pending: 0, failed: 0, succeeded: 0,error: 0, unknown: 0 }
  )
}

/**
 * Get nodes
 */
export async function getNodes(): Promise<SearchResultItem[]> {
  return getItemsByKind('Node')
}

/**
 * Get deployments
 */
export async function getDeployments(limit = 100): Promise<SearchResultItem[]> {
  return getItemsByKind('Deployment', limit)
}

/**
 * Get resource count for multiple kinds
 */
export async function getResourceCounts(kinds: string[]): Promise<Record<string, number>> {
  const counts: Record<string, number> = {}
  await Promise.all(
    kinds.map(async (kind) => {
      counts[kind] = await getCountByKind(kind)
    })
  )
  return counts
}

/**
 * Search with custom filters
 */
export async function searchWithFilters(
  filters: SearchFilter[],
  limit = 100
): Promise<SearchResultItem[]> {
  const query: SearchQuery = {
    operationName: 'searchResult',
    variables: {
      input: [{ filters, limit }],
    },
    query: SEARCH_RESULT_ITEMS_QUERY,
  }
  const result = await executeSearchQuery(query)
  return result?.data?.searchResult?.[0]?.items || []
}

/**
 * Create ACM Search Datasource spec for Perses
 */
export function createACMDatasourceSpec(): ACMSearchDatasourceSpec {
  return {
    default: true,
    plugin: {
      kind: 'ACMSearchDatasource',
      spec: {
        endpoint: getBackendUrl() + SEARCH_API_URL,
      },
    },
  }
}

