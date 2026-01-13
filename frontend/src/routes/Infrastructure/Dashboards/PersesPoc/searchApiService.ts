/* Copyright Contributors to the Open Cluster Management project */

/**
 * ACM Search API Service for Perses Dashboard POC
 * This service provides methods to query the ACM Search API for dashboard data
 */

import { getBackendUrl, postRequest, IRequestResult } from '../../../../resources/utils'
import {
  SearchQuery,
  ISearchResult,
  SearchInput,
  SearchFilter,
  ClusterSummary,
  ResourceSummary,
  PodStatusSummary,
  SearchResultItem,
} from './types'

const SEARCH_API_URL = '/proxy/search'

// GraphQL Queries
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

const SEARCH_RESULT_RELATED_QUERY = `
  query searchResult($input: [SearchInput]) {
    searchResult: search(input: $input) {
      items
      related {
        kind
        count
      }
    }
  }
`

/**
 * Execute a search query against the ACM Search API
 */
export function executeSearchQuery(query: SearchQuery): IRequestResult<ISearchResult> {
  return postRequest<SearchQuery, ISearchResult>(getBackendUrl() + SEARCH_API_URL, query)
}

/**
 * Get all clusters with their status
 */
export function getClusters(): IRequestResult<ISearchResult> {
  const query: SearchQuery = {
    operationName: 'searchResult',
    variables: {
      input: [
        {
          filters: [{ property: 'kind', values: ['Cluster'] }],
          limit: -1,
        },
      ],
    },
    query: SEARCH_RESULT_ITEMS_QUERY,
  }
  return executeSearchQuery(query)
}

/**
 * Get cluster count summary (available, unavailable, unknown)
 */
export async function getClusterSummary(): Promise<ClusterSummary> {
  const result = await getClusters().promise
  const items = result?.data?.searchResult?.[0]?.items || []

  return items.reduce(
    (summary: ClusterSummary, cluster: SearchResultItem) => {
      summary.total++
      const status = cluster.ManagedClusterConditionAvailable?.toString().toLowerCase()
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
 * Get resource count by kind
 */
export function getResourcesByKind(kinds: string[]): IRequestResult<ISearchResult> {
  const query: SearchQuery = {
    operationName: 'searchResult',
    variables: {
      input: kinds.map((kind) => ({
        filters: [{ property: 'kind', values: [kind] }],
        limit: -1,
      })),
    },
    query: SEARCH_RESULT_COUNT_QUERY,
  }
  return executeSearchQuery(query)
}

/**
 * Get pods by status
 */
export function getPodsByStatus(): IRequestResult<ISearchResult> {
  const query: SearchQuery = {
    operationName: 'searchResult',
    variables: {
      input: [
        {
          filters: [{ property: 'kind', values: ['Pod'] }],
          limit: -1,
        },
      ],
    },
    query: SEARCH_RESULT_ITEMS_QUERY,
  }
  return executeSearchQuery(query)
}

/**
 * Get pod status summary
 */
export async function getPodStatusSummary(): Promise<PodStatusSummary> {
  const result = await getPodsByStatus().promise
  const items = result?.data?.searchResult?.[0]?.items || []

  return items.reduce(
    (summary: PodStatusSummary, pod: SearchResultItem) => {
      const status = pod.status?.toString().toLowerCase()
      if (status === 'running') {
        summary.running++
      } else if (status === 'pending') {
        summary.pending++
      } else if (status === 'failed') {
        summary.failed++
      } else if (status === 'succeeded') {
        summary.succeeded++
      } else {
        summary.unknown++
      }
      return summary
    },
    { running: 0, pending: 0, failed: 0, succeeded: 0, unknown: 0 }
  )
}

/**
 * Get nodes across all clusters
 */
export function getNodes(): IRequestResult<ISearchResult> {
  const query: SearchQuery = {
    operationName: 'searchResult',
    variables: {
      input: [
        {
          filters: [{ property: 'kind', values: ['Node'] }],
          limit: -1,
        },
      ],
    },
    query: SEARCH_RESULT_ITEMS_QUERY,
  }
  return executeSearchQuery(query)
}

/**
 * Get deployments with their status
 */
export function getDeployments(): IRequestResult<ISearchResult> {
  const query: SearchQuery = {
    operationName: 'searchResult',
    variables: {
      input: [
        {
          filters: [{ property: 'kind', values: ['Deployment'] }],
          limit: 100,
        },
      ],
    },
    query: SEARCH_RESULT_ITEMS_QUERY,
  }
  return executeSearchQuery(query)
}

/**
 * Get namespaces across clusters
 */
export function getNamespaces(): IRequestResult<ISearchResult> {
  const query: SearchQuery = {
    operationName: 'searchResult',
    variables: {
      input: [
        {
          filters: [{ property: 'kind', values: ['Namespace'] }],
          limit: -1,
        },
      ],
    },
    query: SEARCH_RESULT_ITEMS_QUERY,
  }
  return executeSearchQuery(query)
}

/**
 * Get resources with related resources count
 */
export function getResourcesWithRelated(
  kind: string,
  relatedKinds: string[]
): IRequestResult<ISearchResult> {
  const query: SearchQuery = {
    operationName: 'searchResult',
    variables: {
      input: [
        {
          filters: [{ property: 'kind', values: [kind] }],
          relatedKinds,
          limit: 50,
        },
      ],
    },
    query: SEARCH_RESULT_RELATED_QUERY,
  }
  return executeSearchQuery(query)
}

/**
 * Get resource summary for multiple kinds
 */
export async function getResourceSummary(kinds: string[]): Promise<ResourceSummary[]> {
  const queries = kinds.map((kind) => ({
    filters: [{ property: 'kind', values: [kind] }],
    limit: -1,
  }))

  const query: SearchQuery = {
    operationName: 'searchResult',
    variables: {
      input: queries,
    },
    query: SEARCH_RESULT_ITEMS_QUERY,
  }

  const result = await executeSearchQuery(query).promise
  const searchResults = result?.data?.searchResult || []

  return kinds.map((kind, index) => {
    const items = searchResults[index]?.items || []
    const clusters = [...new Set(items.map((item: SearchResultItem) => item.cluster))]
    return {
      kind,
      count: items.length,
      clusters,
    }
  })
}

/**
 * Search with custom filters
 */
export function searchWithFilters(searchInput: SearchInput): IRequestResult<ISearchResult> {
  const query: SearchQuery = {
    operationName: 'searchResult',
    variables: {
      input: [searchInput],
    },
    query: SEARCH_RESULT_ITEMS_QUERY,
  }
  return executeSearchQuery(query)
}

/**
 * Get applications
 */
export function getApplications(): IRequestResult<ISearchResult> {
  const query: SearchQuery = {
    operationName: 'searchResult',
    variables: {
      input: [
        {
          filters: [{ property: 'kind', values: ['Application'] }],
          limit: -1,
        },
      ],
    },
    query: SEARCH_RESULT_ITEMS_QUERY,
  }
  return executeSearchQuery(query)
}

/**
 * Get policies
 */
export function getPolicies(): IRequestResult<ISearchResult> {
  const query: SearchQuery = {
    operationName: 'searchResult',
    variables: {
      input: [
        {
          filters: [{ property: 'kind', values: ['Policy'] }],
          limit: -1,
        },
      ],
    },
    query: SEARCH_RESULT_ITEMS_QUERY,
  }
  return executeSearchQuery(query)
}

/**
 * Get resources by cluster
 */
export function getResourcesByCluster(clusterName: string, kinds?: string[]): IRequestResult<ISearchResult> {
  const filters = [{ property: 'cluster', values: [clusterName] }]
  if (kinds && kinds.length > 0) {
    filters.push({ property: 'kind', values: kinds })
  }

  const query: SearchQuery = {
    operationName: 'searchResult',
    variables: {
      input: [
        {
          filters,
          limit: 100,
        },
      ],
    },
    query: SEARCH_RESULT_ITEMS_QUERY,
  }
  return executeSearchQuery(query)
}


/**
 * Build filters array from dashboard filter state
 */
export function buildSearchFilters(options: {
  clusters?: string[]
  namespaces?: string[]
  kinds?: string[]
  labels?: string[]
  searchText?: string
}): SearchFilter[] {
  const filters: SearchFilter[] = []

  if (options.clusters && options.clusters.length > 0) {
    filters.push({ property: 'cluster', values: options.clusters })
  }
  if (options.namespaces && options.namespaces.length > 0) {
    filters.push({ property: 'namespace', values: options.namespaces })
  }
  if (options.kinds && options.kinds.length > 0) {
    filters.push({ property: 'kind', values: options.kinds })
  }
  if (options.labels && options.labels.length > 0) {
    filters.push({ property: 'label', values: options.labels })
  }
  if (options.searchText && options.searchText.trim() !== '') {
    filters.push({ property: 'name', values: [`*${options.searchText}*`] })
  }

  return filters
}

/**
 * Get cluster summary with filters applied
 */
export async function getFilteredClusterSummary(dashboardFilters?: {
  clusters?: string[]
}): Promise<ClusterSummary> {
  const filters: SearchFilter[] = [{ property: 'kind', values: ['Cluster'] }]
  
  if (dashboardFilters?.clusters && dashboardFilters.clusters.length > 0) {
    filters.push({ property: 'name', values: dashboardFilters.clusters })
  }

  const query: SearchQuery = {
    operationName: 'searchResult',
    variables: {
      input: [{ filters, limit: -1 }],
    },
    query: SEARCH_RESULT_ITEMS_QUERY,
  }

  const result = await executeSearchQuery(query).promise
  const items = result?.data?.searchResult?.[0]?.items || []

  return items.reduce(
    (summary: ClusterSummary, cluster: SearchResultItem) => {
      summary.total++
      const status = cluster.ManagedClusterConditionAvailable?.toString().toLowerCase()
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
 * Get pod status summary with filters applied
 */
export async function getFilteredPodStatusSummary(dashboardFilters?: {
  clusters?: string[]
  namespaces?: string[]
}): Promise<PodStatusSummary> {
  const filters: SearchFilter[] = [{ property: 'kind', values: ['Pod'] }]
  
  if (dashboardFilters?.clusters && dashboardFilters.clusters.length > 0) {
    filters.push({ property: 'cluster', values: dashboardFilters.clusters })
  }
  if (dashboardFilters?.namespaces && dashboardFilters.namespaces.length > 0) {
    filters.push({ property: 'namespace', values: dashboardFilters.namespaces })
  }

  const query: SearchQuery = {
    operationName: 'searchResult',
    variables: {
      input: [{ filters, limit: -1 }],
    },
    query: SEARCH_RESULT_ITEMS_QUERY,
  }

  const result = await executeSearchQuery(query).promise
  const items = result?.data?.searchResult?.[0]?.items || []

  return items.reduce(
    (summary: PodStatusSummary, pod: SearchResultItem) => {
      const status = pod.status?.toString().toLowerCase()
      if (status === 'running') {
        summary.running++
      } else if (status === 'pending') {
        summary.pending++
      } else if (status === 'failed') {
        summary.failed++
      } else if (status === 'succeeded') {
        summary.succeeded++
      } else {
        summary.unknown++
      }
      return summary
    },
    { running: 0, pending: 0, failed: 0, succeeded: 0, unknown: 0 }
  )
}

/**
 * Get resource summary with filters applied
 */
export async function getFilteredResourceSummary(
  kinds: string[],
  dashboardFilters?: {
    clusters?: string[]
    namespaces?: string[]
  }
): Promise<ResourceSummary[]> {
  const queries = kinds.map((kind) => {
    const filters: SearchFilter[] = [{ property: 'kind', values: [kind] }]
    
    if (dashboardFilters?.clusters && dashboardFilters.clusters.length > 0) {
      filters.push({ property: 'cluster', values: dashboardFilters.clusters })
    }
    if (dashboardFilters?.namespaces && dashboardFilters.namespaces.length > 0) {
      filters.push({ property: 'namespace', values: dashboardFilters.namespaces })
    }

    return { filters, limit: -1 }
  })

  const query: SearchQuery = {
    operationName: 'searchResult',
    variables: {
      input: queries,
    },
    query: SEARCH_RESULT_ITEMS_QUERY,
  }

  const result = await executeSearchQuery(query).promise
  const searchResults = result?.data?.searchResult || []

  return kinds.map((kind, index) => {
    const items = searchResults[index]?.items || []
    const clusters = [...new Set(items.map((item: SearchResultItem) => item.cluster))]
    return {
      kind,
      count: items.length,
      clusters,
    }
  })
}

/**
 * Get nodes with filters applied
 */
export async function getFilteredNodes(dashboardFilters?: {
  clusters?: string[]
}): Promise<SearchResultItem[]> {
  const filters: SearchFilter[] = [{ property: 'kind', values: ['Node'] }]
  
  if (dashboardFilters?.clusters && dashboardFilters.clusters.length > 0) {
    filters.push({ property: 'cluster', values: dashboardFilters.clusters })
  }

  const query: SearchQuery = {
    operationName: 'searchResult',
    variables: {
      input: [{ filters, limit: -1 }],
    },
    query: SEARCH_RESULT_ITEMS_QUERY,
  }

  const result = await executeSearchQuery(query).promise
  return result?.data?.searchResult?.[0]?.items || []
}

/**
 * Get deployments with filters applied
 */
export async function getFilteredDeployments(
  dashboardFilters?: {
    clusters?: string[]
    namespaces?: string[]
    searchText?: string
  },
  limit = 100
): Promise<SearchResultItem[]> {
  const filters: SearchFilter[] = [{ property: 'kind', values: ['Deployment'] }]
  
  if (dashboardFilters?.clusters && dashboardFilters.clusters.length > 0) {
    filters.push({ property: 'cluster', values: dashboardFilters.clusters })
  }
  if (dashboardFilters?.namespaces && dashboardFilters.namespaces.length > 0) {
    filters.push({ property: 'namespace', values: dashboardFilters.namespaces })
  }
  if (dashboardFilters?.searchText && dashboardFilters.searchText.trim() !== '') {
    filters.push({ property: 'name', values: [`*${dashboardFilters.searchText}*`] })
  }

  const query: SearchQuery = {
    operationName: 'searchResult',
    variables: {
      input: [{ filters, limit }],
    },
    query: SEARCH_RESULT_ITEMS_QUERY,
  }

  const result = await executeSearchQuery(query).promise
  return result?.data?.searchResult?.[0]?.items || []
}

/**
 * Get available filter options (clusters, namespaces)
 */
export async function getFilterOptions(): Promise<{
  clusters: string[]
  namespaces: string[]
}> {
  const [clustersResult, namespacesResult] = await Promise.all([
    getClusters().promise,
    getNamespaces().promise,
  ])

  const clusters = (clustersResult?.data?.searchResult?.[0]?.items || [])
    .map((item: SearchResultItem) => item.name)
    .filter(Boolean)
    .sort()

  const namespaces = [...new Set(
    (namespacesResult?.data?.searchResult?.[0]?.items || [])
      .map((item: SearchResultItem) => item.name)
      .filter(Boolean)
  )].sort()

  return { clusters, namespaces }
}

/**
 * Get DaemonSets with filters applied
 */
export async function getFilteredDaemonSets(
  dashboardFilters?: {
    clusters?: string[]
    namespaces?: string[]
    searchText?: string
  },
  limit = 100
): Promise<SearchResultItem[]> {
  const filters: SearchFilter[] = [{ property: 'kind', values: ['DaemonSet'] }]
  
  if (dashboardFilters?.clusters && dashboardFilters.clusters.length > 0) {
    filters.push({ property: 'cluster', values: dashboardFilters.clusters })
  }
  if (dashboardFilters?.namespaces && dashboardFilters.namespaces.length > 0) {
    filters.push({ property: 'namespace', values: dashboardFilters.namespaces })
  }
  if (dashboardFilters?.searchText && dashboardFilters.searchText.trim() !== '') {
    filters.push({ property: 'name', values: [`*${dashboardFilters.searchText}*`] })
  }

  const query: SearchQuery = {
    operationName: 'searchResult',
    variables: {
      input: [{ filters, limit }],
    },
    query: SEARCH_RESULT_ITEMS_QUERY,
  }

  const result = await executeSearchQuery(query).promise
  return result?.data?.searchResult?.[0]?.items || []
}

/**
 * Get Jobs with filters applied
 */
export async function getFilteredJobs(
  dashboardFilters?: {
    clusters?: string[]
    namespaces?: string[]
    searchText?: string
  },
  limit = 100
): Promise<SearchResultItem[]> {
  const filters: SearchFilter[] = [{ property: 'kind', values: ['Job'] }]
  
  if (dashboardFilters?.clusters && dashboardFilters.clusters.length > 0) {
    filters.push({ property: 'cluster', values: dashboardFilters.clusters })
  }
  if (dashboardFilters?.namespaces && dashboardFilters.namespaces.length > 0) {
    filters.push({ property: 'namespace', values: dashboardFilters.namespaces })
  }
  if (dashboardFilters?.searchText && dashboardFilters.searchText.trim() !== '') {
    filters.push({ property: 'name', values: [`*${dashboardFilters.searchText}*`] })
  }

  const query: SearchQuery = {
    operationName: 'searchResult',
    variables: {
      input: [{ filters, limit }],
    },
    query: SEARCH_RESULT_ITEMS_QUERY,
  }

  const result = await executeSearchQuery(query).promise
  return result?.data?.searchResult?.[0]?.items || []
}

/**
 * Get ReplicaSets with filters applied
 */
export async function getFilteredReplicaSets(
  dashboardFilters?: {
    clusters?: string[]
    namespaces?: string[]
    searchText?: string
  },
  limit = 100
): Promise<SearchResultItem[]> {
  const filters: SearchFilter[] = [{ property: 'kind', values: ['ReplicaSet'] }]
  
  if (dashboardFilters?.clusters && dashboardFilters.clusters.length > 0) {
    filters.push({ property: 'cluster', values: dashboardFilters.clusters })
  }
  if (dashboardFilters?.namespaces && dashboardFilters.namespaces.length > 0) {
    filters.push({ property: 'namespace', values: dashboardFilters.namespaces })
  }
  if (dashboardFilters?.searchText && dashboardFilters.searchText.trim() !== '') {
    filters.push({ property: 'name', values: [`*${dashboardFilters.searchText}*`] })
  }

  const query: SearchQuery = {
    operationName: 'searchResult',
    variables: {
      input: [{ filters, limit }],
    },
    query: SEARCH_RESULT_ITEMS_QUERY,
  }

  const result = await executeSearchQuery(query).promise
  return result?.data?.searchResult?.[0]?.items || []
}

/**
 * Get StatefulSets with filters applied
 */
export async function getFilteredStatefulSets(
  dashboardFilters?: {
    clusters?: string[]
    namespaces?: string[]
    searchText?: string
  },
  limit = 100
): Promise<SearchResultItem[]> {
  const filters: SearchFilter[] = [{ property: 'kind', values: ['StatefulSet'] }]
  
  if (dashboardFilters?.clusters && dashboardFilters.clusters.length > 0) {
    filters.push({ property: 'cluster', values: dashboardFilters.clusters })
  }
  if (dashboardFilters?.namespaces && dashboardFilters.namespaces.length > 0) {
    filters.push({ property: 'namespace', values: dashboardFilters.namespaces })
  }
  if (dashboardFilters?.searchText && dashboardFilters.searchText.trim() !== '') {
    filters.push({ property: 'name', values: [`*${dashboardFilters.searchText}*`] })
  }

  const query: SearchQuery = {
    operationName: 'searchResult',
    variables: {
      input: [{ filters, limit }],
    },
    query: SEARCH_RESULT_ITEMS_QUERY,
  }

  const result = await executeSearchQuery(query).promise
  return result?.data?.searchResult?.[0]?.items || []
}
