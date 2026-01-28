/**
 * Perses Dashboard View Component
 * Renders a Perses-inspired dashboard fed by the ACM Search GraphQL API.
 * This uses Perses plugins (StatChart, BarChart, PieChart) via @perses-dev/components.
 */

import { useMemo, useState } from 'react'
import {
  Page,
  PageSection,
  Title,
  Text,
  TextContent,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  Button,
  Alert,
  AlertActionCloseButton,
  Flex,
  FlexItem,
  Spinner,
  Grid,
  GridItem,
  Divider,
  Badge,
} from '@patternfly/react-core'
import { SyncAltIcon } from '@patternfly/react-icons'
import { DashboardResource, Definition, DurationString, TimeRangeValue } from '@perses-dev/core'
import { PluginRegistry } from '@perses-dev/plugin-system'
import { TimeRangeProvider } from '@perses-dev/plugin-system'
import { Panel } from '@perses-dev/dashboards'
import { DashboardProvider, DatasourceStoreProvider } from '@perses-dev/dashboards'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { pluginLoader } from './pluginLoader'
import { DashboardFilters } from '../components/DashboardFilters'
import { DashboardFilterState, DEFAULT_FILTER_STATE } from '../types'
import { ACM_SEARCH_DATASOURCE_KIND, ACM_SEARCH_QUERY_KIND } from './acmSearchPluginModule'
import { acmDatasourceApi } from './datasourceApi'

// Create a QueryClient for Perses plugins - they require this for internal caching
const persesQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

/**
 * Main Perses Dashboard View Component with Search API Filtering
 */
export function PersesDashboardView() {
  const [showInfo, setShowInfo] = useState(true)
  const [filters, setFilters] = useState<DashboardFilterState>(DEFAULT_FILTER_STATE)
  const [refreshCounter, setRefreshCounter] = useState(0)


  const dashboardResource: DashboardResource = useMemo(() => {
    // Build dynamic queries that include current filters.
  const baseQuery = (target: string): Definition<any> => ({
      kind: 'TimeSeriesQuery',
      spec: {
        plugin: {
          kind: ACM_SEARCH_QUERY_KIND,
          spec: {
            target,
            clusters: filters.clusters,
            namespaces: filters.namespaces,
            kinds: filters.kinds,
            searchText: filters.searchText,
          },
        },
      },
    })

    return {
      kind: 'Dashboard',
      metadata: {
        name: 'acm-search-perses',
        project: 'acm',
        version: 1,
      },
      spec: {
        display: {
          name: 'ACM Search Overview (Perses Panels)',
          description: 'Rendered with Perses plugin loader and built-in panels.',
        },
        duration: '1h',
        refreshInterval: '30s',
        variables: [],
        datasources: {
          acmSearch: {
            default: true,
            plugin: {
              kind: ACM_SEARCH_DATASOURCE_KIND,
              spec: {},
            },
          },
        },
        panels: {
          clusterStatus: {
            kind: 'Panel',
            spec: {
              display: { name: 'Cluster Status' },
              plugin: {
                kind: 'PieChart',
                spec: {},
              },
              queries: [baseQuery('clusterStatus')],
            },
          },
          podStatus: {
            kind: 'Panel',
            spec: {
              display: { name: 'Pod Status' },
              plugin: {
                kind: 'BarChart',
                spec: {},
              },
              queries: [baseQuery('podStatus')],
            },
          },
          resourceCounts: {
            kind: 'Panel',
            spec: {
              display: { name: 'Resources by Kind' },
              plugin: {
                kind: 'BarChart',
                spec: {},
              },
              queries: [baseQuery('resourceCounts')],
            },
          },
          totalClusters: {
            kind: 'Panel',
            spec: {
              display: { name: 'Total Clusters' },
              plugin: { kind: 'StatChart', spec: { calculation: 'last' } },
              queries: [baseQuery('clusterCount')],
            },
          },
          totalNodes: {
            kind: 'Panel',
            spec: {
              display: { name: 'Total Nodes' },
              plugin: { kind: 'StatChart', spec: { calculation: 'last' } },
              queries: [baseQuery('nodeCount')],
            },
          },
        },
        layouts: [],
      },
    }
  }, [filters, refreshCounter])

  const activeFilterCount = useMemo(
    () =>
      filters.clusters.length + filters.namespaces.length + filters.kinds.length + (filters.searchText ? 1 : 0),
    [filters]
  )

  return (
    <QueryClientProvider client={persesQueryClient}>
      <PluginRegistry pluginLoader={pluginLoader}>
        <DatasourceStoreProvider dashboardResource={dashboardResource} datasourceApi={acmDatasourceApi}>
          <TimeRangeProvider timeRange={{ start: new Date(Date.now() - 60 * 60 * 1000), end: new Date() }} setTimeRange={function (value: TimeRangeValue): void {
          throw new Error('Function not implemented.')
        } } setRefreshInterval={function (value: DurationString): void {
          throw new Error('Function not implemented.')
        } }>
            <DashboardProvider initialState={{ dashboardResource, isEditMode: false }}>
              <Page>
                <PageSection variant="light">
                  <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
                    <FlexItem>
                      <TextContent>
                        <Title headingLevel="h1" size="xl">
                          Perses Dashboard — {dashboardResource.spec.display?.name || 'ACM Search'}
                          {activeFilterCount > 0 && (
                            <Badge style={{ marginLeft: '12px' }} isRead>
                              {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
                            </Badge>
                          )}
                        </Title>
                        <Text>{dashboardResource.spec.display?.description}</Text>
                        <Text component="small" style={{ color: '#6a6e73' }}>
                          Datasource: ACM Search API • Dashboard: {dashboardResource.metadata.name} • Duration:{' '}
                          {dashboardResource.spec.duration} • Refresh: {dashboardResource.spec.refreshInterval}
                        </Text>
                      </TextContent>
                    </FlexItem>
                    <FlexItem>
                      <Spinner size="md" />
                    </FlexItem>
                  </Flex>
                </PageSection>

                {showInfo && (
                  <PageSection variant="light" padding={{ default: 'noPadding' }}>
                    <Alert
                      variant="info"
                      isInline
                      title="Perses dashboard backed by ACM Search"
                      actionClose={<AlertActionCloseButton onClose={() => setShowInfo(false)} />}
                      style={{ margin: '0 16px' }}
                    >
                      This view uses <strong>@perses-dev</strong> panels with the ACM Search GraphQL API datasource. Use the
                      filters below to narrow down data by cluster, namespace, resource kind, or search text.
                    </Alert>
                  </PageSection>
                )}

                {/* Dashboard Filters */}
                <DashboardFilters
                  filters={filters}
                  options={{
                    availableClusters: [],
                    availableNamespaces: [],
                    availableKinds: ['Deployment', 'DaemonSet', 'StatefulSet', 'ReplicaSet', 'Job'],
                  }}
                  onFiltersChange={setFilters}
                />

                <PageSection variant="light" padding={{ default: 'noPadding' }}>
                  <Toolbar>
                    <ToolbarContent>
                      <ToolbarItem>
                        <Button
                          variant="secondary"
                          icon={<SyncAltIcon />}
                          onClick={() => setRefreshCounter((c) => c + 1)}
                        >
                          Refresh
                        </Button>
                      </ToolbarItem>
                      <ToolbarItem>
                        <Text component="small" style={{ color: '#6a6e73' }}>
                          Panels: {Object.keys(dashboardResource.spec.panels).length}
                        </Text>
                      </ToolbarItem>
                    </ToolbarContent>
                  </Toolbar>
                </PageSection>

                <Divider />

                <PageSection>
                  <div style={{ marginBottom: '24px' }}>
                    <Title headingLevel="h3" size="lg" style={{ marginBottom: '16px' }}>
                      Cluster Overview
                    </Title>
                    <Grid hasGutter>
                      <GridItem span={3}>
                        <Panel definition={dashboardResource.spec.panels.totalClusters as any} />
                      </GridItem>
                      <GridItem span={3}>
                        <Panel definition={dashboardResource.spec.panels.clusterStatus as any} />
                      </GridItem>
                      <GridItem span={3}>
                        <Panel definition={dashboardResource.spec.panels.totalNodes as any} />
                      </GridItem>
                    </Grid>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <Title headingLevel="h3" size="lg" style={{ marginBottom: '16px' }}>
                      Status Overview
                    </Title>
                    <Grid hasGutter>
                      <GridItem span={4}>
                        <div style={{ height: '320px' }}>
                          <Panel definition={dashboardResource.spec.panels.clusterStatus as any} />
                        </div>
                      </GridItem>
                      <GridItem span={4}>
                        <div style={{ height: '320px' }}>
                          <Panel definition={dashboardResource.spec.panels.podStatus as any} />
                        </div>
                      </GridItem>
                      <GridItem span={4}>
                        <div style={{ height: '320px' }}>
                          <Panel definition={dashboardResource.spec.panels.resourceCounts as any} />
                        </div>
                      </GridItem>
                    </Grid>
                  </div>
                </PageSection>
              </Page>
            </DashboardProvider>
          </TimeRangeProvider>
        </DatasourceStoreProvider>
      </PluginRegistry>
    </QueryClientProvider>
  )
}

export default PersesDashboardView
