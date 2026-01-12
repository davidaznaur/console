/* Copyright Contributors to the Open Cluster Management project */

/**
 * Perses Dashboard View Component
 * This component renders a Perses dashboard using the actual Perses library
 */

import React, { useMemo, useState, useEffect, useCallback } from 'react'
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
} from '@patternfly/react-core'
import { SyncAltIcon } from '@patternfly/react-icons'
import { DashboardResource } from '@perses-dev/core'

// Import dashboard definition
import { createACMOverviewDashboard } from './ACMDashboardDefinition'

// Import ACM datasource functions
import {
  getClusterSummary,
  getPodStatusSummary,
  getNodes,
  getClusters,
  getDeployments,
  getResourceCounts,
  SearchResultItem,
} from './ACMDatasource'

// Types for dashboard data
interface DashboardData {
  clusterSummary: {
    total: number
    available: number
    unavailable: number
    unknown: number
  } | null
  podSummary: {
    running: number
    pending: number
    failed: number
    succeeded: number
    error: number
    unknown: number
  } | null
  clusters: SearchResultItem[]
  nodes: SearchResultItem[]
  deployments: SearchResultItem[]
  resourceCounts: Record<string, number>
}

/**
 * Simple Stat Panel Component using Perses styling
 */
function StatPanel({
  title,
  value,
  color,
  loading,
}: {
  title: string
  value: number | string
  color?: string
  loading?: boolean
}) {
  return (
    <Card isCompact style={{ height: '120px' }}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardBody>
        {loading ? (
          <Spinner size="lg" />
        ) : (
          <div
            style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: color || 'var(--pf-v5-global--primary-color--100)',
              textAlign: 'center',
            }}
          >
            {value}
          </div>
        )}
      </CardBody>
    </Card>
  )
}

/**
 * Bar Chart Panel using Perses-style visualization
 */
function BarChartPanel({
  title,
  data,
  loading,
}: {
  title: string
  data: { label: string; value: number; color?: string }[]
  loading?: boolean
}) {
  const maxValue = Math.max(...data.map((d) => d.value), 1)
  const colors = [
    '#0066CC', '#4CB140', '#F0AB00', '#C9190B', '#6753AC', '#009596',
  ]

  return (
    <Card isCompact style={{ height: '100%' }}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardBody>
        {loading ? (
          <Spinner size="lg" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {data.map((item, index) => (
              <div key={item.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.875rem' }}>{item.label}</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>{item.value}</span>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: '12px',
                    backgroundColor: '#f0f0f0',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${(item.value / maxValue) * 100}%`,
                      height: '100%',
                      backgroundColor: item.color || colors[index % colors.length],
                      borderRadius: '4px',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  )
}

/**
 * Pie Chart Panel using SVG
 */
function PieChartPanel({
  title,
  data,
  loading,
}: {
  title: string
  data: { label: string; value: number; color: string }[]
  loading?: boolean
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const size = 140
  const radius = 60
  const strokeWidth = 20

  let cumulativePercent = 0
  const segments = data.map((item) => {
    const percent = total > 0 ? item.value / total : 0
    const startAngle = cumulativePercent * 360
    cumulativePercent += percent
    const endAngle = cumulativePercent * 360
    return { ...item, percent, startAngle, endAngle }
  })

  return (
    <Card isCompact style={{ height: '100%' }}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardBody>
        {loading ? (
          <Spinner size="lg" />
        ) : (
          <Flex alignItems={{ default: 'alignItemsCenter' }} justifyContent={{ default: 'justifyContentCenter' }}>
            <FlexItem>
              <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {segments.map((segment, index) => {
                  const circumference = 2 * Math.PI * radius
                  const dashLength = segment.percent * circumference
                  const dashOffset = -segments.slice(0, index).reduce((sum, s) => sum + s.percent, 0) * circumference

                  return (
                    <circle
                      key={segment.label}
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      fill="none"
                      stroke={segment.color}
                      strokeWidth={strokeWidth}
                      strokeDasharray={`${dashLength} ${circumference}`}
                      strokeDashoffset={dashOffset}
                      transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    />
                  )
                })}
                <text
                  x={size / 2}
                  y={size / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{ fontSize: '1.5rem', fontWeight: 'bold' }}
                >
                  {total}
                </text>
              </svg>
            </FlexItem>
            <FlexItem>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginLeft: '16px' }}>
                {data.map((item) => (
                  <Flex key={item.label} alignItems={{ default: 'alignItemsCenter' }}>
                    <FlexItem>
                      <div
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: item.color,
                          marginRight: '8px',
                        }}
                      />
                    </FlexItem>
                    <FlexItem>
                      <span style={{ fontSize: '0.875rem' }}>
                        {item.label}: <strong>{item.value}</strong>
                      </span>
                    </FlexItem>
                  </Flex>
                ))}
              </div>
            </FlexItem>
          </Flex>
        )}
      </CardBody>
    </Card>
  )
}

/**
 * Table Panel Component
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
 * Main Perses Dashboard View Component
 */
export function PersesDashboardView() {
  const [showInfo, setShowInfo] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [data, setData] = useState<DashboardData>({
    clusterSummary: null,
    podSummary: null,
    clusters: [],
    nodes: [],
    deployments: [],
    resourceCounts: {},
  })

  // Get the dashboard definition
  const dashboardResource: DashboardResource = useMemo(() => createACMOverviewDashboard(), [])

  // Fetch data function
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const [clusterSummary, podSummary, clusters, nodes, deployments, resourceCounts] = await Promise.all([
        getClusterSummary(),
        getPodStatusSummary(),
        getClusters(),
        getNodes(),
        getDeployments(50),
        getResourceCounts(['Deployment', 'Service', 'ConfigMap', 'Secret', 'StatefulSet', 'DaemonSet']),
      ])

      setData({
        clusterSummary,
        podSummary,
        clusters,
        nodes,
        deployments,
        resourceCounts,
      })
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch data'))
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Prepare data for visualizations
  const clusterStatusData = useMemo(
    () =>
      data.clusterSummary
        ? [
            { label: 'Available', value: data.clusterSummary.available, color: '#3E8635' },
            { label: 'Unavailable', value: data.clusterSummary.unavailable, color: '#C9190B' },
            { label: 'Unknown', value: data.clusterSummary.unknown, color: '#F0AB00' },
          ]
        : [],
    [data.clusterSummary]
  )

  const podStatusData = useMemo(
    () =>
      data.podSummary
        ? [
            { label: 'Running', value: data.podSummary.running, color: '#3E8635' },
            { label: 'Pending', value: data.podSummary.pending, color: '#F0AB00' },
            { label: 'Failed', value: data.podSummary.failed, color: '#C9190B' },
            { label: 'Error', value: data.podSummary.error, color: '#0066CC' },
            { label: 'Unknown', value: data.podSummary.unknown, color: '#6a6e73' },
          ]
        : [],
    [data.podSummary]
  )

  const resourceCountsData = useMemo(
    () =>
      Object.entries(data.resourceCounts).map(([kind, count]) => ({
        label: kind,
        value: count,
      })),
    [data.resourceCounts]
  )

  const nodesPerCluster = useMemo(() => {
    const counts: Record<string, number> = {}
    data.nodes.forEach((node) => {
      counts[node.cluster] = (counts[node.cluster] || 0) + 1
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([cluster, count]) => ({ label: cluster, value: count }))
  }, [data.nodes])

  const clusterTableRows = useMemo(
    () =>
      data.clusters.map((cluster) => ({
        name: cluster.name,
        status: (cluster.ManagedClusterConditionAvailable as string) === 'True' ? '✅ Available' : '❌ Unavailable',
        nodes: cluster.nodes || '-',
        kubernetesVersion: cluster.kubernetesVersion || '-',
        cpu: cluster.cpu || '-',
        memory: cluster.memory || '-',
      })),
    [data.clusters]
  )

  const nodeTableRows = useMemo(
    () =>
      data.nodes.slice(0, 20).map((node) => ({
        name: node.name,
        cluster: node.cluster,
        role: node.role || '-',
        status: node.status || '-',
      })),
    [data.nodes]
  )

  const deploymentTableRows = useMemo(
    () =>
      data.deployments.map((dep) => ({
        name: dep.name,
        namespace: dep.namespace || '-',
        cluster: dep.cluster,
        replicas: dep.desired || '-',
        available: dep.available || '-',
      })),
    [data.deployments]
  )

  return (
    <Page>
      <PageSection variant="light">
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
          <FlexItem>
            <TextContent>
              <Title headingLevel="h1" size="xl">
                🎯 {dashboardResource.spec.display?.name || 'Perses Dashboard'}
              </Title>
              <Text>{dashboardResource.spec.display?.description}</Text>
              <Text component="small" style={{ color: '#6a6e73' }}>
                Powered by <strong>@perses-dev</strong> library • Dashboard: {dashboardResource.metadata.name} •
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
            title="Perses Dashboard POC"
            actionClose={<AlertActionCloseButton onClose={() => setShowInfo(false)} />}
            style={{ margin: '0 16px' }}
          >
            This POC uses the <strong>@perses-dev</strong> npm packages ({dashboardResource.metadata.project}). The
            dashboard definition is created using Perses types (DashboardResource, PanelDefinition, LayoutDefinition).
            Data is fetched from ACM Search API and rendered using custom panel components inspired by Perses
            visualizations.
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

      <PageSection variant="light" padding={{ default: 'noPadding' }}>
        <Toolbar>
          <ToolbarContent>
            <ToolbarItem>
              <Button variant="secondary" icon={<SyncAltIcon />} onClick={fetchData} isLoading={loading}>
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
        {/* Cluster Overview Section */}
        <div style={{ marginBottom: '24px' }}>
          <Title headingLevel="h3" size="lg" style={{ marginBottom: '16px' }}>
            Cluster Overview
          </Title>
          <Grid hasGutter>
            <GridItem span={3}>
              <StatPanel title="Total Clusters" value={data.clusterSummary?.total ?? '-'} loading={loading} />
            </GridItem>
            <GridItem span={3}>
              <StatPanel
                title="Available Clusters"
                value={data.clusterSummary?.available ?? '-'}
                color="#3E8635"
                loading={loading}
              />
            </GridItem>
            <GridItem span={3}>
              <StatPanel
                title="Unavailable Clusters"
                value={data.clusterSummary?.unavailable ?? '-'}
                color="#C9190B"
                loading={loading}
              />
            </GridItem>
            <GridItem span={3}>
              <StatPanel title="Total Nodes" value={data.nodes.length || '-'} loading={loading} />
            </GridItem>
          </Grid>
        </div>

        {/* Status Overview Section */}
        <div style={{ marginBottom: '24px' }}>
          <Title headingLevel="h3" size="lg" style={{ marginBottom: '16px' }}>
            Status Overview
          </Title>
          <Grid hasGutter>
            <GridItem span={4}>
              <div style={{ height: '300px' }}>
                <PieChartPanel title="Cluster Status" data={clusterStatusData} loading={loading} />
              </div>
            </GridItem>
            <GridItem span={4}>
              <div style={{ height: '300px' }}>
                <BarChartPanel title="Pod Status" data={podStatusData} loading={loading} />
              </div>
            </GridItem>
            <GridItem span={4}>
              <div style={{ height: '300px' }}>
                <BarChartPanel title="Resources by Kind" data={resourceCountsData} loading={loading} />
              </div>
            </GridItem>
          </Grid>
        </div>

        {/* Node Distribution Section */}
        <div style={{ marginBottom: '24px' }}>
          <Title headingLevel="h3" size="lg" style={{ marginBottom: '16px' }}>
            Node Distribution
          </Title>
          <Grid hasGutter>
            <GridItem span={6}>
              <div style={{ height: '350px' }}>
                <BarChartPanel title="Nodes per Cluster" data={nodesPerCluster} loading={loading} />
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

        {/* Workloads Section */}
        <div style={{ marginBottom: '24px' }}>
          <Title headingLevel="h3" size="lg" style={{ marginBottom: '16px' }}>
            Workloads
          </Title>
          <div style={{ height: '400px' }}>
            <TablePanel
              title="Recent Deployments"
              columns={[
                { key: 'name', header: 'Deployment' },
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
        </div>
      </PageSection>
    </Page>
  )
}

export default PersesDashboardView

