/* Copyright Contributors to the Open Cluster Management project */

/**
 * Hook for fetching filtered dashboard data from ACM Search API
 */

import { useCallback, useEffect, useState } from 'react'
import {
  ClusterSummary,
  PodStatusSummary,
  ResourceSummary,
  SearchResultItem,
  DashboardFilterState,
  DashboardFilterOptions,
  DEFAULT_WORKLOAD_KINDS,
} from './types'
import {
  getFilteredClusterSummary,
  getFilteredPodStatusSummary,
  getFilteredResourceSummary,
  getFilteredNodes,
  getFilteredDeployments,
  getFilteredDaemonSets,
  getFilteredJobs,
  getFilteredReplicaSets,
  getFilteredStatefulSets,
  getFilterOptions,
  getClusters,
} from './searchApiService'

export interface FilteredDashboardData {
  clusterSummary: ClusterSummary | null
  podStatusSummary: PodStatusSummary | null
  resourceSummary: ResourceSummary[] | null
  clusters: SearchResultItem[] | null
  nodes: SearchResultItem[] | null
  deployments: SearchResultItem[] | null
  daemonSets: SearchResultItem[] | null
  jobs: SearchResultItem[] | null
  replicaSets: SearchResultItem[] | null
  statefulSets: SearchResultItem[] | null
}

export interface UseFilteredDashboardDataResult {
  data: FilteredDashboardData
  filterOptions: DashboardFilterOptions
  loading: boolean
  error: Error | null
  refetch: () => void
}

const RESOURCE_KINDS = [
  'Deployment',
  'DaemonSet',
  'StatefulSet',
  'ReplicaSet',
  'Job',
  'Service',
  'ConfigMap',
  'Secret',
  'VirtualMachine',
]

// Helper to parse "Kind: DaemonSet, Job" syntax from search text
function parseKindQuery(searchText: string): { kinds: string[]; remainingText: string } {
  if (!searchText) return { kinds: [], remainingText: '' }
  
  // Match "Kind:" or "kind:" followed by comma-separated values
  const kindMatch = searchText.match(/kind\s*:\s*([^|]+?)(?:\s*\||$)/i)
  
  if (kindMatch) {
    const kindsPart = kindMatch[1]
    // Split by comma and match against valid kinds
    const parsedKinds = kindsPart
      .split(',')
      .map((k) => k.trim())
      .filter((k) => DEFAULT_WORKLOAD_KINDS.some((valid) => valid.toLowerCase() === k.toLowerCase()))
      .map((k) => DEFAULT_WORKLOAD_KINDS.find((valid) => valid.toLowerCase() === k.toLowerCase()) || k)
    
    // Remove the Kind: part from the search text
    const remainingText = searchText.replace(/kind\s*:\s*[^|]+/i, '').replace(/^\s*\|\s*/, '').trim()
    
    return { kinds: parsedKinds, remainingText }
  }
  
  // Fallback: detect kind names anywhere in text (original behavior)
  const detectedKinds = DEFAULT_WORKLOAD_KINDS.filter((kind) => 
    searchText.toLowerCase().includes(kind.toLowerCase())
  )
  
  if (detectedKinds.length > 0) {
    let remaining = searchText
    detectedKinds.forEach((kind) => {
      const regex = new RegExp(kind, 'gi')
      remaining = remaining.replace(regex, '')
    })
    return { kinds: detectedKinds, remainingText: remaining.replace(/\s+/g, ' ').trim() }
  }
  
  return { kinds: [], remainingText: searchText }
}

/**
 * Hook to fetch dashboard data with filters applied
 */
export function useFilteredDashboardData(
  filters: DashboardFilterState,
  refreshInterval?: number
): UseFilteredDashboardDataResult {
  const [data, setData] = useState<FilteredDashboardData>({
    clusterSummary: null,
    podStatusSummary: null,
    resourceSummary: null,
    clusters: null,
    nodes: null,
    deployments: null,
    daemonSets: null,
    jobs: null,
    replicaSets: null,
    statefulSets: null,
  })
  const [filterOptions, setFilterOptions] = useState<DashboardFilterOptions>({
    availableClusters: [],
    availableNamespaces: [],
    availableKinds: DEFAULT_WORKLOAD_KINDS,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Fetch filter options on mount
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const options = await getFilterOptions()
        setFilterOptions({
          availableClusters: options.clusters,
          availableNamespaces: options.namespaces,
          availableKinds: DEFAULT_WORKLOAD_KINDS,
        })
      } catch (err) {
        console.error('Failed to fetch filter options:', err)
      }
    }
    fetchFilterOptions()
  }, [])

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Parse "Kind: DaemonSet, Job" syntax from search text
      const { kinds: kindsFromSearch, remainingText } = parseKindQuery(filters.searchText)

      const dashboardFilters = {
        clusters: filters.clusters.length > 0 ? filters.clusters : undefined,
        namespaces: filters.namespaces.length > 0 ? filters.namespaces : undefined,
        // Use remaining text (without Kind: part) for API filtering
        searchText: remainingText || undefined,
      }

      // Determine which kinds to fetch based on dropdown OR search text
      const kindsToFetch = filters.kinds.length > 0 
        ? filters.kinds 
        : kindsFromSearch.length > 0 
          ? kindsFromSearch 
          : RESOURCE_KINDS

      const [
        clusterSummary,
        podStatusSummary,
        resourceSummary,
        clustersResult,
        nodes,
        deployments,
        daemonSets,
        jobs,
        replicaSets,
        statefulSets,
      ] = await Promise.all([
        getFilteredClusterSummary({ clusters: dashboardFilters.clusters }),
        getFilteredPodStatusSummary({
          clusters: dashboardFilters.clusters,
          namespaces: dashboardFilters.namespaces,
        }),
        getFilteredResourceSummary(kindsToFetch, {
          clusters: dashboardFilters.clusters,
          namespaces: dashboardFilters.namespaces,
        }),
        getClusters().promise,
        getFilteredNodes({ clusters: dashboardFilters.clusters }),
        getFilteredDeployments(dashboardFilters, 50),
        getFilteredDaemonSets(dashboardFilters, 50),
        getFilteredJobs(dashboardFilters, 50),
        getFilteredReplicaSets(dashboardFilters, 50),
        getFilteredStatefulSets(dashboardFilters, 50),
      ])

      setData({
        clusterSummary,
        podStatusSummary,
        resourceSummary,
        clusters: clustersResult?.data?.searchResult?.[0]?.items || [],
        nodes,
        deployments,
        daemonSets,
        jobs,
        replicaSets,
        statefulSets,
      })
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch dashboard data'))
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Fetch data when filters change
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Set up auto-refresh if interval is provided
  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      const intervalId = setInterval(fetchData, refreshInterval)
      return () => clearInterval(intervalId)
    }
  }, [fetchData, refreshInterval])

  return { data, filterOptions, loading, error, refetch: fetchData }
}

export default useFilteredDashboardData
