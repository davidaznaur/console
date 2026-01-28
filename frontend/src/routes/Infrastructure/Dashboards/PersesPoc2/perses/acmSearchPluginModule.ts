import { AbsoluteTimeRange, TimeSeriesData, TimeSeriesValueTuple } from '@perses-dev/core'
import {
  DatasourceClient,
  DatasourcePlugin,
  PluginModuleResource,
  TimeSeriesQueryContext,
  TimeSeriesQueryPlugin,
} from '@perses-dev/plugin-system'
import { getPluginModule as getStatChartModule } from '@perses-dev/stat-chart-plugin'
import {
  buildSearchFilters,
  getFilteredClusterSummary,
  getFilteredPodStatusSummary,
  getFilteredResourceSummary,
  executeSearchQuery,
  SearchResultItem,
} from '../searchApiService'
import { SearchQuery, ISearchResult } from '../types'

export interface AcmSearchDatasourceSpec {
  basePath?: string
}

// Datasource client is minimal because we call our existing service helpers directly.
export interface AcmSearchDatasourceClient extends DatasourceClient {
  basePath?: string
}

// All available query targets
export type AcmSearchQueryTarget =
  | 'clusterStatus'
  | 'podStatus'
  | 'resourceCounts'
  | 'nodesPerCluster'
  | 'clusterCount'
  | 'nodeCount'
  | 'namespaceCount'
  | 'applicationCount'
  | 'policyCount'
  | 'policyCompliance'
  | 'deploymentStatus'
  | 'storageResources'
  | 'rbacResources'
  | 'customResourceCounts'

export interface AcmSearchQuerySpec {
  target: AcmSearchQueryTarget
  clusters?: string[]
  namespaces?: string[]
  kinds?: string[]
  searchText?: string
}

export const ACM_SEARCH_DATASOURCE_KIND = 'ACMSearchDatasource'
export const ACM_SEARCH_QUERY_KIND = 'ACMSearchQuery'

export const ACMSearchDatasource: DatasourcePlugin<AcmSearchDatasourceSpec, AcmSearchDatasourceClient> = {
  createClient: (spec: AcmSearchDatasourceSpec) => ({
    kind: ACM_SEARCH_DATASOURCE_KIND,
    basePath: spec.basePath,
  }),
}

function nowTuple(value: number): TimeSeriesValueTuple {
  return [Date.now(), value]
}

// Helper to execute a simple count query
async function getResourceCount(kind: string, filters?: { clusters?: string[]; namespaces?: string[] }): Promise<number> {
  const searchFilters = [{ property: 'kind', values: [kind] }]
  if (filters?.clusters?.length) {
    searchFilters.push({ property: 'cluster', values: filters.clusters })
  }
  if (filters?.namespaces?.length) {
    searchFilters.push({ property: 'namespace', values: filters.namespaces })
  }

  const query: SearchQuery = {
    operationName: 'searchResult',
    variables: {
      input: [{ filters: searchFilters, limit: -1 }],
    },
    query: `query searchResult($input: [SearchInput]) { searchResult: search(input: $input) { count } }`,
  }

  const result = await executeSearchQuery(query).promise
  return result?.data?.searchResult?.[0]?.count ?? 0
}

// Helper to get items with a specific property for status breakdown
async function getItemsWithStatus(
  kind: string,
  statusField: string,
  filters?: { clusters?: string[]; namespaces?: string[] }
): Promise<Record<string, number>> {
  const searchFilters = [{ property: 'kind', values: [kind] }]
  if (filters?.clusters?.length) {
    searchFilters.push({ property: 'cluster', values: filters.clusters })
  }
  if (filters?.namespaces?.length) {
    searchFilters.push({ property: 'namespace', values: filters.namespaces })
  }

  const query: SearchQuery = {
    operationName: 'searchResult',
    variables: {
      input: [{ filters: searchFilters, limit: -1 }],
    },
    query: `query searchResult($input: [SearchInput]) { searchResult: search(input: $input) { items } }`,
  }

  const result = await executeSearchQuery(query).promise
  const items = result?.data?.searchResult?.[0]?.items || []

  return items.reduce((acc: Record<string, number>, item: SearchResultItem) => {
    const status = String(item[statusField] || 'unknown').toLowerCase()
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {})
}

export const ACMSearchQuery: TimeSeriesQueryPlugin<AcmSearchQuerySpec> = {
  async getTimeSeriesData(spec: AcmSearchQuerySpec, _ctx: TimeSeriesQueryContext): Promise<TimeSeriesData> {
    const timeRange: AbsoluteTimeRange = {
      start: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      end: new Date().toISOString(),
    }

    const filters = { clusters: spec.clusters, namespaces: spec.namespaces }

    switch (spec.target) {
      case 'clusterStatus': {
        const summary = await getFilteredClusterSummary({ clusters: spec.clusters })
        return {
          timeRange,
          series: [
            { name: 'Available', values: [nowTuple(summary.available)] },
            { name: 'Unavailable', values: [nowTuple(summary.unavailable)] },
            { name: 'Unknown', values: [nowTuple(summary.unknown)] },
          ],
        }
      }

      case 'podStatus': {
        const summary = await getFilteredPodStatusSummary(filters)
        return {
          timeRange,
          series: [
            { name: 'Running', values: [nowTuple(summary.running)] },
            { name: 'Pending', values: [nowTuple(summary.pending)] },
            { name: 'Failed', values: [nowTuple(summary.failed)] },
            { name: 'Succeeded', values: [nowTuple(summary.succeeded)] },
            { name: 'Unknown', values: [nowTuple(summary.unknown)] },
          ],
        }
      }

      case 'resourceCounts': {
        const kinds = spec.kinds?.length ? spec.kinds : ['Deployment', 'DaemonSet', 'StatefulSet', 'ReplicaSet', 'Job']
        const counts = await getFilteredResourceSummary(kinds, filters)
        return {
          timeRange,
          series: counts.map((item) => ({
            name: item.kind,
            values: [nowTuple(item.count)],
          })),
        }
      }

      case 'clusterCount': {
        const summary = await getFilteredClusterSummary({ clusters: spec.clusters })
        return {
          timeRange,
          series: [{ name: 'Clusters', values: [nowTuple(summary.total)] }],
        }
      }

      case 'nodeCount': {
        const count = await getResourceCount('Node', filters)
        return {
          timeRange,
          series: [{ name: 'Nodes', values: [nowTuple(count)] }],
        }
      }

      case 'nodesPerCluster': {
        const counts = await getFilteredResourceSummary(['Node'], filters)
        return {
          timeRange,
          series: counts.map((item) => ({
            name: item.clusters[0] || 'unknown',
            values: [nowTuple(item.count)],
          })),
        }
      }

      case 'namespaceCount': {
        const count = await getResourceCount('Namespace', filters)
        return {
          timeRange,
          series: [{ name: 'Namespaces', values: [nowTuple(count)] }],
        }
      }

      case 'applicationCount': {
        const count = await getResourceCount('Application', filters)
        return {
          timeRange,
          series: [{ name: 'Applications', values: [nowTuple(count)] }],
        }
      }

      case 'policyCount': {
        const count = await getResourceCount('Policy', filters)
        return {
          timeRange,
          series: [{ name: 'Policies', values: [nowTuple(count)] }],
        }
      }

      case 'policyCompliance': {
        const statusCounts = await getItemsWithStatus('Policy', 'compliant', filters)
        return {
          timeRange,
          series: [
            { name: 'Compliant', values: [nowTuple(statusCounts['compliant'] || 0)] },
            { name: 'NonCompliant', values: [nowTuple(statusCounts['noncompliant'] || 0)] },
            { name: 'Unknown', values: [nowTuple(statusCounts['unknown'] || 0)] },
          ],
        }
      }

      case 'deploymentStatus': {
        const statusCounts = await getItemsWithStatus('Deployment', 'available', filters)
        return {
          timeRange,
          series: Object.entries(statusCounts).map(([status, count]) => ({
            name: status.charAt(0).toUpperCase() + status.slice(1),
            values: [nowTuple(count)],
          })),
        }
      }

      case 'storageResources': {
        const kinds = ['PersistentVolume', 'PersistentVolumeClaim', 'StorageClass']
        const counts = await getFilteredResourceSummary(kinds, filters)
        return {
          timeRange,
          series: counts.map((item) => ({
            name: item.kind,
            values: [nowTuple(item.count)],
          })),
        }
      }

      case 'rbacResources': {
        const kinds = ['Role', 'RoleBinding', 'ClusterRole', 'ClusterRoleBinding']
        const counts = await getFilteredResourceSummary(kinds, filters)
        return {
          timeRange,
          series: counts.map((item) => ({
            name: item.kind,
            values: [nowTuple(item.count)],
          })),
        }
      }

      case 'customResourceCounts': {
        const kinds = spec.kinds?.length ? spec.kinds : ['VirtualMachine', 'HelmRelease', 'Channel', 'Subscription']
        const counts = await getFilteredResourceSummary(kinds, filters)
        return {
          timeRange,
          series: counts.map((item) => ({
            name: item.kind,
            values: [nowTuple(item.count)],
          })),
        }
      }

      default:
        return { timeRange, series: [] }
    }
  },
}

/**
 * Plugin module metadata for ACM Search plugin.
 */
export function getPluginModule(): PluginModuleResource {
  return {
    kind: 'PluginModule',
    metadata: {
      name: 'acm-search-plugin-module',
      version: '0.0.1',
    },
    spec: {
      plugins: [
        {
          kind: 'Datasource',
          spec: {
            name: ACM_SEARCH_DATASOURCE_KIND,
            display: { name: 'ACM Search Datasource' },
          },
        },
        {
          kind: 'TimeSeriesQuery',
          spec: {
            name: ACM_SEARCH_QUERY_KIND,
            display: { name: 'ACM Search Query' },
          },
        },
      ],
    },
  }
}

// Re-export built-in stat plugin module so consumers can compose loaders if needed.
export const StatChartPluginModule = getStatChartModule
