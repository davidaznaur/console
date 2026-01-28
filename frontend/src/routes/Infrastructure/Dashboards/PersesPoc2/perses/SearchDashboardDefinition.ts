import { DashboardResource, DashboardSpec, PanelDefinition, LayoutDefinition } from '@perses-dev/core'

/**
 * Factory helpers to build Perses-style panels.
 */
export function createStatChartPanel(
  name: string,
  description: string,
  unit?: string,
  thresholds?: { value: number; color: string }[]
): PanelDefinition {
  return {
    kind: 'Panel',
    spec: {
      display: {
        name,
        description,
      },
      plugin: {
        kind: 'StatChart',
        spec: {
          calculation: 'last',
          format: {
            unit: unit || 'decimal',
          },
          sparkline: {
            show: false,
          },
          thresholds: thresholds
            ? {
                steps: thresholds.map((t) => ({
                  value: t.value,
                  color: t.color,
                })),
              }
            : undefined,
        },
      },
      queries: [],
    },
  }
}

export function createTablePanel(name: string, description: string, columns?: string[]): PanelDefinition {
  return {
    kind: 'Panel',
    spec: {
      display: {
        name,
        description,
      },
      plugin: {
        kind: 'Table',
        spec: {
          columnSettings: columns?.map((col) => ({
            name: col,
            header: col,
          })),
        },
      },
      queries: [],
    },
  }
}

export function createBarChartPanel(
  name: string,
  description: string,
  orientation: 'horizontal' | 'vertical' = 'horizontal'
): PanelDefinition {
  return {
    kind: 'Panel',
    spec: {
      display: {
        name,
        description,
      },
      plugin: {
        kind: 'BarChart',
        spec: {
          orientation,
        },
      },
      queries: [],
    },
  }
}

export function createPieChartPanel(name: string, description: string, showLegend = true): PanelDefinition {
  return {
    kind: 'Panel',
    spec: {
      display: {
        name,
        description,
      },
      plugin: {
        kind: 'PieChart',
        spec: {
          legend: {
            show: showLegend,
            position: 'right',
          },
        },
      },
      queries: [],
    },
  }
}

export function createGridLayout(
  title: string,
  items: { panelKey: string; x: number; y: number; width: number; height: number }[],
  collapsed = false
): LayoutDefinition {
  return {
    kind: 'Grid',
    spec: {
      display: {
        title,
        collapse: {
          open: !collapsed,
        },
      },
      items: items.map((item) => ({
        x: item.x,
        y: item.y,
        width: item.width,
        height: item.height,
        content: {
          $ref: `#/spec/panels/${item.panelKey}`,
        },
      })),
    },
  }
}

/**
 * Create the ACM Search Dashboard definition (metadata only; data is supplied by React).
 */
export function createAcmSearchDashboard(): DashboardResource {
  const panels: Record<string, PanelDefinition> = {
    totalClusters: createStatChartPanel('Total Clusters', 'Total number of managed clusters'),
    availableClusters: createStatChartPanel('Available Clusters', 'Clusters with healthy status', undefined, [
      { value: 0, color: '#3E8635' },
    ]),
    unavailableClusters: createStatChartPanel('Unavailable Clusters', 'Clusters with issues', undefined, [
      { value: 1, color: '#C9190B' },
    ]),
    totalNodes: createStatChartPanel('Total Nodes', 'Total nodes across all clusters'),
    clusterStatus: createPieChartPanel('Cluster Status', 'Distribution of cluster availability'),
    podStatus: createBarChartPanel('Pod Status', 'Status distribution of pods'),
    resourceCounts: createBarChartPanel('Resources by Kind', 'Count of Kubernetes resources'),
    nodesPerCluster: createBarChartPanel('Nodes per Cluster', 'Distribution of nodes across clusters'),
    clusterTable: createTablePanel('Managed Clusters', 'All managed clusters with details', [
      'name',
      'status',
      'nodes',
      'kubernetesVersion',
      'cpu',
      'memory',
    ]),
    nodeTable: createTablePanel('Nodes Overview', 'Nodes across all clusters', ['name', 'cluster', 'role', 'status']),
    deploymentTable: createTablePanel('Recent Deployments', 'Deployments across all clusters', [
      'name',
      'namespace',
      'cluster',
      'replicas',
      'available',
    ]),
  }

  const layouts: LayoutDefinition[] = [
    createGridLayout('Cluster Overview', [
      { panelKey: 'totalClusters', x: 0, y: 0, width: 6, height: 4 },
      { panelKey: 'availableClusters', x: 6, y: 0, width: 6, height: 4 },
      { panelKey: 'unavailableClusters', x: 12, y: 0, width: 6, height: 4 },
      { panelKey: 'totalNodes', x: 18, y: 0, width: 6, height: 4 },
    ]),
    createGridLayout('Status Overview', [
      { panelKey: 'clusterStatus', x: 0, y: 0, width: 8, height: 8 },
      { panelKey: 'podStatus', x: 8, y: 0, width: 8, height: 8 },
      { panelKey: 'resourceCounts', x: 16, y: 0, width: 8, height: 8 },
    ]),
    createGridLayout('Node Distribution', [
      { panelKey: 'nodesPerCluster', x: 0, y: 0, width: 12, height: 8 },
      { panelKey: 'nodeTable', x: 12, y: 0, width: 12, height: 8 },
    ]),
    createGridLayout('Cluster Details', [{ panelKey: 'clusterTable', x: 0, y: 0, width: 24, height: 10 }]),
    createGridLayout('Workloads', [{ panelKey: 'deploymentTable', x: 0, y: 0, width: 24, height: 10 }]),
  ]

  const spec: DashboardSpec = {
    display: {
      name: 'ACM Search Overview',
      description: 'Dashboard powered by Perses plugins with ACM Search API as datasource',
    },
    duration: '1h',
    refreshInterval: '30s',
    variables: [],
    panels,
    layouts,
    datasources: {
      acmSearch: {
        default: true,
        plugin: {
          kind: 'ACMSearchDatasource',
          spec: {},
        },
      },
    },
  }

  return {
    kind: 'Dashboard',
    metadata: {
      name: 'acm-search-overview',
      project: 'acm',
      version: 1,
    },
    spec,
  }
}
