/* Copyright Contributors to the Open Cluster Management project */

/**
 * Custom hooks for fetching dashboard data from ACM Search API
 */

import { useCallback, useEffect, useState } from 'react'
import {
  ClusterSummary,
  PodStatusSummary,
  ResourceSummary,
  SearchResultItem,
  ISearchResult,
} from './types'
import {
  getClusters,
  getClusterSummary,
  getPodStatusSummary,
  getResourceSummary,
  getNodes,
  getDeployments,
  getApplications,
  getPolicies,
  getNamespaces,
  getResourcesByCluster,
} from './searchApiService'

export interface UseDashboardDataResult<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => void
}

/**
 * Generic hook for fetching data with loading and error states
 */
function useFetchData<T>(
  fetchFn: () => Promise<T>,
  dependencies: unknown[] = []
): UseDashboardDataResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetch = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await fetchFn()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)

  useEffect(() => {
    fetch()
  }, [fetch])

  return { data, loading, error, refetch: fetch }
}

/**
 * Hook to get cluster summary data
 */
export function useClusterSummary(): UseDashboardDataResult<ClusterSummary> {
  return useFetchData(() => getClusterSummary(), [])
}

/**
 * Hook to get all clusters
 */
export function useClusters(): UseDashboardDataResult<SearchResultItem[]> {
  return useFetchData(async () => {
    const result = await getClusters().promise
    return result?.data?.searchResult?.[0]?.items || []
  }, [])
}

/**
 * Hook to get pod status summary
 */
export function usePodStatusSummary(): UseDashboardDataResult<PodStatusSummary> {
  return useFetchData(() => getPodStatusSummary(), [])
}

/**
 * Hook to get resource summary for multiple kinds
 */
export function useResourceSummary(kinds: string[]): UseDashboardDataResult<ResourceSummary[]> {
  return useFetchData(() => getResourceSummary(kinds), [kinds.join(',')])
}

/**
 * Hook to get nodes
 */
export function useNodes(): UseDashboardDataResult<SearchResultItem[]> {
  return useFetchData(async () => {
    const result = await getNodes().promise
    return result?.data?.searchResult?.[0]?.items || []
  }, [])
}

/**
 * Hook to get deployments
 */
export function useDeployments(): UseDashboardDataResult<SearchResultItem[]> {
  return useFetchData(async () => {
    const result = await getDeployments().promise
    return result?.data?.searchResult?.[0]?.items || []
  }, [])
}

/**
 * Hook to get applications
 */
export function useApplications(): UseDashboardDataResult<SearchResultItem[]> {
  return useFetchData(async () => {
    const result = await getApplications().promise
    return result?.data?.searchResult?.[0]?.items || []
  }, [])
}

/**
 * Hook to get policies
 */
export function usePolicies(): UseDashboardDataResult<SearchResultItem[]> {
  return useFetchData(async () => {
    const result = await getPolicies().promise
    return result?.data?.searchResult?.[0]?.items || []
  }, [])
}

/**
 * Hook to get namespaces
 */
export function useNamespaces(): UseDashboardDataResult<SearchResultItem[]> {
  return useFetchData(async () => {
    const result = await getNamespaces().promise
    return result?.data?.searchResult?.[0]?.items || []
  }, [])
}

/**
 * Hook to get resources by cluster
 */
export function useResourcesByCluster(
  clusterName: string,
  kinds?: string[]
): UseDashboardDataResult<SearchResultItem[]> {
  return useFetchData(async () => {
    if (!clusterName) return []
    const result = await getResourcesByCluster(clusterName, kinds).promise
    return result?.data?.searchResult?.[0]?.items || []
  }, [clusterName, kinds?.join(',')])
}

/**
 * Hook for combined dashboard data with auto-refresh
 */
export interface DashboardData {
  clusterSummary: ClusterSummary | null
  podStatusSummary: PodStatusSummary | null
  resourceSummary: ResourceSummary[] | null
  clusters: SearchResultItem[] | null
  nodes: SearchResultItem[] | null
  deployments: SearchResultItem[] | null
}

export function useDashboardData(refreshInterval?: number): {
  data: DashboardData
  loading: boolean
  error: Error | null
  refetch: () => void
} {
  const [data, setData] = useState<DashboardData>({
    clusterSummary: null,
    podStatusSummary: null,
    resourceSummary: null,
    clusters: null,
    nodes: null,
    deployments: null,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const [
        clusterSummary,
        podStatusSummary,
        resourceSummary,
        clustersResult,
        nodesResult,
        deploymentsResult,
      ] = await Promise.all([
        getClusterSummary(),
        getPodStatusSummary(),
        getResourceSummary(['Deployment', 'Service', 'ConfigMap', 'Secret', 'StatefulSet', 'DaemonSet']),
        getClusters().promise,
        getNodes().promise,
        getDeployments().promise,
      ])

      setData({
        clusterSummary,
        podStatusSummary,
        resourceSummary,
        clusters: clustersResult?.data?.searchResult?.[0]?.items || [],
        nodes: nodesResult?.data?.searchResult?.[0]?.items || [],
        deployments: deploymentsResult?.data?.searchResult?.[0]?.items || [],
      })
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch dashboard data'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()

    if (refreshInterval && refreshInterval > 0) {
      const intervalId = setInterval(fetchData, refreshInterval)
      return () => clearInterval(intervalId)
    }
  }, [fetchData, refreshInterval])

  return { data, loading, error, refetch: fetchData }
}

