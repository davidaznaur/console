/* Copyright Contributors to the Open Cluster Management project */

/**
 * Perses Dashboard View Component
 * This component renders a Perses dashboard using the actual Perses library
 * with Search API filtering capabilities
 */

import { useCallback, useMemo, useState } from 'react'
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
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Grid,
  GridItem,
  Divider,
  Badge,
} from '@patternfly/react-core'
import { SyncAltIcon } from '@patternfly/react-icons'
import { DashboardResource } from '@perses-dev/core'
import { ChartsProvider, testChartsTheme } from '@perses-dev/components'

// Import dashboard definition
import { createACMOverviewDashboard } from './ACMDashboardDefinition'

// Import filter components and hooks
import { DashboardFilters } from '../components/DashboardFilters'
import { useFilteredDashboardData } from '../useFilteredDashboardData'
import { DashboardFilterState, DEFAULT_FILTER_STATE } from '../types'

// Import Perses chart components
import {
  PersesBarChart,
  PersesPieChart,
  PersesStatChart,
  PersesHorizontalBarChart,
} from '../components/PersesCharts'

/**
 * Table Panel Component (kept as custom since tables work well with PatternFly)
 */
function TablePanel({
  title,
  columns,
  rows,
  loading,
  maxRows = 8,
}: {
  title: string
  columns: { key: string; header: string }[]
  rows: Record<string, unknown>[]
  loading?: boolean
  maxRows?: number
}) {
  const displayRows = rows.slice(0, maxRows)

  return (
    <Card isCompact style={{ height: '100%' }}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardBody style={{ overflow: 'auto' }}>
        {loading ? (
          <Spinner size="lg" />
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #d2d2d2' }}>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    style={{
                      textAlign: 'left',
                      padding: '8px',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                    }}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayRows.map((row, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #d2d2d2' }}>
                  {columns.map((col) => (
                    <td key={col.key} style={{ padding: '8px', fontSize: '0.875rem' }}>
                      {String(row[col.key] ?? '-')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {rows.length > maxRows && (
          <Text style={{ padding: '8px', color: '#6a6e73' }}>
            Showing {maxRows} of {rows.length} items
          </Text>
        )}
      </CardBody>
    </Card>
  )
}

/**
 * Main Perses Dashboard View Component with Search API Filtering
 */
export function PersesDashboardView() {
  const [showInfo, setShowInfo] = useState(true)
  const [filters, setFilters] = useState<DashboardFilterState>(DEFAULT_FILTER_STATE)

  // Use the filtered dashboard data hook
  const { data, filterOptions, loading, error, refetch } = useFilteredDashboardData(filters, 30000)

  // Get the dashboard definition
  const dashboardResource: DashboardResource = useMemo(() => createACMOverviewDashboard(), [])

  // Calculate active filter count for display
  const activeFilterCount = useMemo(() => {
    return (
      filters.clusters.length +
      filters.namespaces.length +
      filters.kinds.length +
      (filters.searchText ? 1 : 0)
    )
  }, [filters])

  // Parse "Kind: DaemonSet, Job" syntax from search text
  const WORKLOAD_KINDS = ['Deployment', 'DaemonSet', 'StatefulSet', 'ReplicaSet', 'Job']
  
  const { searchTextKinds, cleanedSearchText } = useMemo(() => {
    if (!filters.searchText) return { searchTextKinds: [], cleanedSearchText: '' }
    
    // Match "Kind:" or "kind:" followed by comma-separated values
    const kindMatch = filters.searchText.match(/kind\s*:\s*([^|]+?)(?:\s*\||$)/i)
    
    if (kindMatch) {
      const kindsPart = kindMatch[1]
      // Split by comma and match against valid kinds
      const parsedKinds = kindsPart
        .split(',')
        .map((k) => k.trim())
        .filter((k) => WORKLOAD_KINDS.some((valid) => valid.toLowerCase() === k.toLowerCase()))
        .map((k) => WORKLOAD_KINDS.find((valid) => valid.toLowerCase() === k.toLowerCase()) || k)
      
      // Remove the Kind: part from the search text
      const remaining = filters.searchText.replace(/kind\s*:\s*[^|]+/i, '').replace(/^\s*\|\s*/, '').trim()
      
      return { searchTextKinds: parsedKinds, cleanedSearchText: remaining }
    }
    
    // Fallback: detect kind names anywhere in text (original behavior)
    const detectedKinds = WORKLOAD_KINDS.filter((kind) => 
      filters.searchText.toLowerCase().includes(kind.toLowerCase())
    )
    
    if (detectedKinds.length > 0) {
      let remaining = filters.searchText
      detectedKinds.forEach((kind) => {
        const regex = new RegExp(kind, 'gi')
        remaining = remaining.replace(regex, '')
      })
      return { searchTextKinds: detectedKinds, cleanedSearchText: remaining.replace(/\s+/g, ' ').trim() }
    }
    
    return { searchTextKinds: [], cleanedSearchText: filters.searchText }
  }, [filters.searchText])

  // Combined kinds: from dropdown OR from search text
  const effectiveKinds = useMemo(() => {
    // If kinds are selected in dropdown, use those
    if (filters.kinds.length > 0) return filters.kinds
    // If kinds are mentioned in search text, use those
    if (searchTextKinds.length > 0) return searchTextKinds
    // Otherwise, no kinds filter (show nothing in workloads section)
    return []
  }, [filters.kinds, searchTextKinds])

  // Check if a specific kind should be shown
  const shouldShowKind = useCallback(
    (kind: string) => effectiveKinds.includes(kind),
    [effectiveKinds]
  )

  // Filter clusters by search text for all cluster-related visualizations
  const filteredClusters = useMemo(() => {
    let clusters = data.clusters || []
    if (cleanedSearchText) {
      const searchLower = cleanedSearchText.toLowerCase()
      clusters = clusters.filter((cluster) =>
        cluster.name.toLowerCase().includes(searchLower) ||
        (cluster.kubernetesVersion && String(cluster.kubernetesVersion).toLowerCase().includes(searchLower)) ||
        (cluster.cpu && String(cluster.cpu).toLowerCase().includes(searchLower)) ||
        (cluster.memory && String(cluster.memory).toLowerCase().includes(searchLower))
      )
    }
    return clusters
  }, [data.clusters, cleanedSearchText])

  // Filter nodes by search text for node-related visualizations
  const filteredNodes = useMemo(() => {
    let nodes = data.nodes || []
    if (cleanedSearchText) {
      const searchLower = cleanedSearchText.toLowerCase()
      nodes = nodes.filter((node) =>
        node.name.toLowerCase().includes(searchLower) ||
        node.cluster.toLowerCase().includes(searchLower) ||
        (node.role && String(node.role).toLowerCase().includes(searchLower)) ||
        (node.status && String(node.status).toLowerCase().includes(searchLower))
      )
    }
    return nodes
  }, [data.nodes, cleanedSearchText])

  // Prepare data for visualizations
  const clusterStatusData = useMemo(() => {
    // Recalculate cluster status from filtered clusters
    const available = filteredClusters.filter((c) => c.ManagedClusterConditionAvailable === 'True').length
    const unavailable = filteredClusters.filter((c) => c.ManagedClusterConditionAvailable === 'False').length
    const unknown = filteredClusters.filter(
      (c) => c.ManagedClusterConditionAvailable !== 'True' && c.ManagedClusterConditionAvailable !== 'False'
    ).length

    return [
      { label: 'Available', value: available, color: '#3E8635' },
      { label: 'Unavailable', value: unavailable, color: '#C9190B' },
      { label: 'Unknown', value: unknown, color: '#F0AB00' },
    ]
  }, [filteredClusters])

  const podStatusData = useMemo(
    () =>
      data.podStatusSummary
        ? [
            { label: 'Running', value: data.podStatusSummary.running, color: '#3E8635' },
            { label: 'Pending', value: data.podStatusSummary.pending, color: '#F0AB00' },
            { label: 'Failed', value: data.podStatusSummary.failed, color: '#C9190B' },
            { label: 'Succeeded', value: data.podStatusSummary.succeeded, color: '#0066CC' },
            { label: 'Unknown', value: data.podStatusSummary.unknown, color: '#6a6e73' },
          ]
        : [],
    [data.podStatusSummary]
  )

  const resourceCountsData = useMemo(
    () =>
      (data.resourceSummary || []).map((resource) => ({
        label: resource.kind,
        value: resource.count,
      })),
    [data.resourceSummary]
  )

  const nodesPerCluster = useMemo(() => {
    const counts: Record<string, number> = {}
    filteredNodes.forEach((node) => {
      counts[node.cluster] = (counts[node.cluster] || 0) + 1
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([cluster, count]) => ({ label: cluster, value: count }))
  }, [filteredNodes])

  const clusterTableRows = useMemo(
    () => {
      // Start with already search-filtered clusters, then apply cluster dropdown filter
      let clusters = filteredClusters
      
      // Filter clusters based on selected cluster filter
      if (filters.clusters.length > 0) {
        clusters = clusters.filter((cluster) => filters.clusters.includes(cluster.name))
      }
      
      return clusters.map((cluster) => ({
        name: cluster.name,
        status: (cluster.ManagedClusterConditionAvailable as string) === 'True' ? '✅ Available' : '❌ Unavailable',
        nodes: cluster.nodes || '-',
        kubernetesVersion: cluster.kubernetesVersion || '-',
        cpu: cluster.cpu || '-',
        memory: cluster.memory || '-',
      }))
    },
    [filteredClusters, filters.clusters]
  )

  const nodeTableRows = useMemo(
    () => {
      // Use already-filtered nodes
      return filteredNodes.slice(0, 20).map((node) => ({
        name: node.name,
        cluster: node.cluster,
        role: node.role || '-',
        status: node.status || '-',
      }))
    },
    [filteredNodes]
  )

  const deploymentTableRows = useMemo(
    () => {
      let deployments = data.deployments || []
      
      // Filter by search text (with kind names removed)
      if (cleanedSearchText) {
        const searchLower = cleanedSearchText.toLowerCase()
        deployments = deployments.filter((dep) => 
          dep.name.toLowerCase().includes(searchLower) ||
          (dep.namespace && dep.namespace.toLowerCase().includes(searchLower)) ||
          dep.cluster.toLowerCase().includes(searchLower)
        )
      }
      
      return deployments.map((dep) => ({
        name: dep.name,
        namespace: dep.namespace || '-',
        cluster: dep.cluster,
        replicas: dep.desired || '-',
        available: dep.available || '-',
      }))
    },
    [data.deployments, cleanedSearchText]
  )

  const daemonSetTableRows = useMemo(
    () => {
      let daemonSets = data.daemonSets || []
      
      // Filter by search text (with kind names removed)
      if (cleanedSearchText) {
        const searchLower = cleanedSearchText.toLowerCase()
        daemonSets = daemonSets.filter((ds) => 
          ds.name.toLowerCase().includes(searchLower) ||
          (ds.namespace && ds.namespace.toLowerCase().includes(searchLower)) ||
          ds.cluster.toLowerCase().includes(searchLower)
        )
      }
      
      return daemonSets.map((ds) => ({
        name: ds.name,
        namespace: ds.namespace || '-',
        cluster: ds.cluster,
        desired: ds.desired || '-',
        current: ds.current || '-',
        ready: ds.ready || '-',
        available: ds.available || '-',
      }))
    },
    [data.daemonSets, cleanedSearchText]
  )

  const jobTableRows = useMemo(
    () => {
      let jobs = data.jobs || []
      
      // Filter by search text (with kind names removed)
      if (cleanedSearchText) {
        const searchLower = cleanedSearchText.toLowerCase()
        jobs = jobs.filter((job) => 
          job.name.toLowerCase().includes(searchLower) ||
          (job.namespace && job.namespace.toLowerCase().includes(searchLower)) ||
          job.cluster.toLowerCase().includes(searchLower)
        )
      }
      
      return jobs.map((job) => ({
        name: job.name,
        namespace: job.namespace || '-',
        cluster: job.cluster,
        completions: job.completions || '-',
        successful: job.successful || '-',
        status: job.status || '-',
      }))
    },
    [data.jobs, cleanedSearchText]
  )

  const replicaSetTableRows = useMemo(
    () => {
      let replicaSets = data.replicaSets || []
      
      // Filter by search text (with kind names removed)
      if (cleanedSearchText) {
        const searchLower = cleanedSearchText.toLowerCase()
        replicaSets = replicaSets.filter((rs) => 
          rs.name.toLowerCase().includes(searchLower) ||
          (rs.namespace && rs.namespace.toLowerCase().includes(searchLower)) ||
          rs.cluster.toLowerCase().includes(searchLower)
        )
      }
      
      return replicaSets.map((rs) => ({
        name: rs.name,
        namespace: rs.namespace || '-',
        cluster: rs.cluster,
        desired: rs.desired || '-',
        current: rs.current || '-',
        ready: rs.ready || '-',
      }))
    },
    [data.replicaSets, cleanedSearchText]
  )

  const statefulSetTableRows = useMemo(
    () => {
      let statefulSets = data.statefulSets || []
      
      // Filter by search text (with kind names removed)
      if (cleanedSearchText) {
        const searchLower = cleanedSearchText.toLowerCase()
        statefulSets = statefulSets.filter((ss) => 
          ss.name.toLowerCase().includes(searchLower) ||
          (ss.namespace && ss.namespace.toLowerCase().includes(searchLower)) ||
          ss.cluster.toLowerCase().includes(searchLower)
        )
      }
      
      return statefulSets.map((ss) => ({
        name: ss.name,
        namespace: ss.namespace || '-',
        cluster: ss.cluster,
        desired: ss.desired || '-',
        current: ss.current || '-',
        ready: ss.ready || '-',
      }))
    },
    [data.statefulSets, cleanedSearchText]
  )

  return (
    <ChartsProvider chartsTheme={testChartsTheme}>
      <Page>
        <PageSection variant="light">
          <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
            <FlexItem>
              <TextContent>
                <Title headingLevel="h1" size="xl">
                  🎯 {dashboardResource.spec.display?.name || 'Perses Dashboard'}
                  {activeFilterCount > 0 && (
                    <Badge style={{ marginLeft: '12px' }} isRead>
                      {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
                    </Badge>
                  )}
                </Title>
                <Text>{dashboardResource.spec.display?.description}</Text>
                <Text component="small" style={{ color: '#6a6e73' }}>
                  Powered by <strong>@perses-dev/components</strong> (ECharts) • Dashboard: {dashboardResource.metadata.name} •
                  Duration: {dashboardResource.spec.duration} • Refresh: {dashboardResource.spec.refreshInterval}
              </Text>
            </TextContent>
          </FlexItem>
          <FlexItem>{loading && <Spinner size="md" />}</FlexItem>
        </Flex>
      </PageSection>

      {showInfo && (
        <PageSection variant="light" padding={{ default: 'noPadding' }}>
          <Alert
            variant="info"
            isInline
            title="Perses Dashboard POC with Search API Filtering"
            actionClose={<AlertActionCloseButton onClose={() => setShowInfo(false)} />}
            style={{ margin: '0 16px' }}
          >
            This POC uses the <strong>@perses-dev</strong> npm packages ({dashboardResource.metadata.project}). 
            Data is fetched from <strong>ACM Search API</strong> with filtering support. Use the filters below to 
            narrow down the dashboard data by cluster, namespace, resource kind, or search text.
          </Alert>
        </PageSection>
      )}

      {error && (
        <PageSection variant="light" padding={{ default: 'noPadding' }}>
          <Alert variant="danger" isInline title="Error loading data" style={{ margin: '0 16px' }}>
            {error.message}
          </Alert>
        </PageSection>
      )}

      {/* Dashboard Filters */}
      <DashboardFilters
        filters={filters}
        options={filterOptions}
        onFiltersChange={setFilters}
        loading={loading}
      />

      <PageSection variant="light" padding={{ default: 'noPadding' }}>
        <Toolbar>
          <ToolbarContent>
            <ToolbarItem>
              <Button variant="secondary" icon={<SyncAltIcon />} onClick={refetch} isLoading={loading}>
                Refresh
              </Button>
            </ToolbarItem>
            <ToolbarItem>
              <Text component="small" style={{ color: '#6a6e73' }}>
                Datasource: ACM Search API • Panels: {Object.keys(dashboardResource.spec.panels).length} • Layouts:{' '}
                {dashboardResource.spec.layouts.length}
              </Text>
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>
      </PageSection>

      <Divider />

      <PageSection>
        {/* Cluster Overview Section - Using Perses StatChart */}
        <div style={{ marginBottom: '24px' }}>
          <Title headingLevel="h3" size="lg" style={{ marginBottom: '16px' }}>
            Cluster Overview
          </Title>
          <Grid hasGutter>
            <GridItem span={3}>
              <PersesStatChart title="Total Clusters" value={filteredClusters.length || '-'} loading={loading} />
            </GridItem>
            <GridItem span={3}>
              <PersesStatChart
                title="Available Clusters"
                value={filteredClusters.filter((c) => c.ManagedClusterConditionAvailable === 'True').length || '-'}
                color="#3E8635"
                loading={loading}
              />
            </GridItem>
            <GridItem span={3}>
              <PersesStatChart
                title="Unavailable Clusters"
                value={filteredClusters.filter((c) => c.ManagedClusterConditionAvailable === 'False').length || '-'}
                color="#C9190B"
                loading={loading}
              />
            </GridItem>
            <GridItem span={3}>
              <PersesStatChart title="Total Nodes" value={filteredNodes.length || '-'} loading={loading} />
            </GridItem>
          </Grid>
        </div>

        {/* Status Overview Section - Using Perses Charts (ECharts) */}
        <div style={{ marginBottom: '24px' }}>
          <Title headingLevel="h3" size="lg" style={{ marginBottom: '16px' }}>
            Status Overview
          </Title>
          <Grid hasGutter>
            <GridItem span={4}>
              <div style={{ height: '300px' }}>
                <PersesPieChart title="Cluster Status" data={clusterStatusData} loading={loading} height={300} />
              </div>
            </GridItem>
            <GridItem span={4}>
              <div style={{ height: '300px' }}>
                <PersesBarChart title="Pod Status" data={podStatusData} loading={loading} height={300} />
              </div>
            </GridItem>
            <GridItem span={4}>
              <div style={{ height: '300px' }}>
                <PersesBarChart title="Resources by Kind" data={resourceCountsData} loading={loading} height={300} />
              </div>
            </GridItem>
          </Grid>
        </div>

        {/* Node Distribution Section - Using Perses Horizontal Bar Chart */}
        <div style={{ marginBottom: '24px' }}>
          <Title headingLevel="h3" size="lg" style={{ marginBottom: '16px' }}>
            Node Distribution
          </Title>
          <Grid hasGutter>
            <GridItem span={6}>
              <div style={{ height: '350px' }}>
                <PersesHorizontalBarChart title="Nodes per Cluster" data={nodesPerCluster} loading={loading} height={350} />
              </div>
            </GridItem>
            <GridItem span={6}>
              <div style={{ height: '350px' }}>
                <TablePanel
                  title="Nodes Overview"
                  columns={[
                    { key: 'name', header: 'Node Name' },
                    { key: 'cluster', header: 'Cluster' },
                    { key: 'role', header: 'Role' },
                    { key: 'status', header: 'Status' },
                  ]}
                  rows={nodeTableRows}
                  loading={loading}
                  maxRows={6}
                />
              </div>
            </GridItem>
          </Grid>
        </div>

        {/* Cluster Details Section */}
        <div style={{ marginBottom: '24px' }}>
          <Title headingLevel="h3" size="lg" style={{ marginBottom: '16px' }}>
            Cluster Details
          </Title>
          <div style={{ height: '400px' }}>
            <TablePanel
              title="Managed Clusters"
              columns={[
                { key: 'name', header: 'Cluster Name' },
                { key: 'status', header: 'Status' },
                { key: 'nodes', header: 'Nodes' },
                { key: 'kubernetesVersion', header: 'K8s Version' },
                { key: 'cpu', header: 'CPU' },
                { key: 'memory', header: 'Memory' },
              ]}
              rows={clusterTableRows}
              loading={loading}
            />
          </div>
        </div>

        {/* Workloads Section - Tables shown based on kind filter selection or search text */}
        {effectiveKinds.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <Title headingLevel="h3" size="lg" style={{ marginBottom: '16px' }}>
              Workloads
              {searchTextKinds.length > 0 && filters.kinds.length === 0 && (
                <Text component="small" style={{ marginLeft: '12px', color: '#6a6e73', fontWeight: 'normal' }}>
                  (filtered by search: {searchTextKinds.join(', ')})
                </Text>
              )}
            </Title>
            
            {/* Deployments Table - shown when Deployment is selected or searched */}
            {shouldShowKind('Deployment') && (
              <div style={{ height: '350px', marginBottom: '24px' }}>
                <TablePanel
                  title="Deployments"
                  columns={[
                    { key: 'name', header: 'Name' },
                    { key: 'namespace', header: 'Namespace' },
                    { key: 'cluster', header: 'Cluster' },
                    { key: 'replicas', header: 'Replicas' },
                    { key: 'available', header: 'Available' },
                  ]}
                  rows={deploymentTableRows}
                  loading={loading}
                  maxRows={10}
                />
              </div>
            )}

            {/* DaemonSets Table - shown when DaemonSet is selected or searched */}
            {shouldShowKind('DaemonSet') && (
              <div style={{ height: '350px', marginBottom: '24px' }}>
                <TablePanel
                  title="DaemonSets"
                  columns={[
                    { key: 'name', header: 'Name' },
                    { key: 'namespace', header: 'Namespace' },
                    { key: 'cluster', header: 'Cluster' },
                    { key: 'desired', header: 'Desired' },
                    { key: 'current', header: 'Current' },
                    { key: 'ready', header: 'Ready' },
                    { key: 'available', header: 'Available' },
                  ]}
                  rows={daemonSetTableRows}
                  loading={loading}
                  maxRows={10}
                />
              </div>
            )}

            {/* StatefulSets Table - shown when StatefulSet is selected or searched */}
            {shouldShowKind('StatefulSet') && (
              <div style={{ height: '350px', marginBottom: '24px' }}>
                <TablePanel
                  title="StatefulSets"
                  columns={[
                    { key: 'name', header: 'Name' },
                    { key: 'namespace', header: 'Namespace' },
                    { key: 'cluster', header: 'Cluster' },
                    { key: 'desired', header: 'Desired' },
                    { key: 'current', header: 'Current' },
                    { key: 'ready', header: 'Ready' },
                  ]}
                  rows={statefulSetTableRows}
                  loading={loading}
                  maxRows={10}
                />
              </div>
            )}

            {/* ReplicaSets Table - shown when ReplicaSet is selected or searched */}
            {shouldShowKind('ReplicaSet') && (
              <div style={{ height: '350px', marginBottom: '24px' }}>
                <TablePanel
                  title="ReplicaSets"
                  columns={[
                    { key: 'name', header: 'Name' },
                    { key: 'namespace', header: 'Namespace' },
                    { key: 'cluster', header: 'Cluster' },
                    { key: 'desired', header: 'Desired' },
                    { key: 'current', header: 'Current' },
                    { key: 'ready', header: 'Ready' },
                  ]}
                  rows={replicaSetTableRows}
                  loading={loading}
                  maxRows={10}
                />
              </div>
            )}

            {/* Jobs Table - shown when Job is selected or searched */}
            {shouldShowKind('Job') && (
              <div style={{ height: '350px', marginBottom: '24px' }}>
                <TablePanel
                  title="Jobs"
                  columns={[
                    { key: 'name', header: 'Name' },
                    { key: 'namespace', header: 'Namespace' },
                    { key: 'cluster', header: 'Cluster' },
                    { key: 'completions', header: 'Completions' },
                    { key: 'successful', header: 'Successful' },
                    { key: 'status', header: 'Status' },
                  ]}
                  rows={jobTableRows}
                  loading={loading}
                  maxRows={10}
                />
              </div>
            )}
          </div>
        )}
        </PageSection>
      </Page>
    </ChartsProvider>
  )
}

export default PersesDashboardView
