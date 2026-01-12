/* Copyright Contributors to the Open Cluster Management project */

/**
 * Perses Dashboard POC Types
 * This file defines types for integrating Perses-style dashboards with ACM Search API
 */

// ACM Search API Types
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

export interface SearchResultRelated {
  kind: string
  count: number
  items?: SearchResultItem[]
}

export interface SearchResult {
  items?: SearchResultItem[]
  count?: number
  related?: SearchResultRelated[]
}

export interface ISearchResult {
  data: {
    searchResult: SearchResult[]
  }
}

// Perses Dashboard Types
export interface DashboardMetadata {
  name: string
  project: string
  version?: number
  createdAt?: string
  updatedAt?: string
}

export interface DashboardDisplay {
  name: string
  description?: string
}

export interface DashboardVariable {
  kind: string
  spec: {
    name: string
    display?: {
      name: string
      description?: string
    }
    allowAllValue?: boolean
    allowMultiple?: boolean
    defaultValue?: string | string[]
    plugin?: {
      kind: string
      spec: Record<string, unknown>
    }
  }
}

export interface PanelQuery {
  kind: string
  spec: {
    plugin: {
      kind: string
      spec: {
        query: string
        datasource?: {
          kind: string
          name: string
        }
      }
    }
  }
}

export interface PanelSpec {
  display: {
    name: string
    description?: string
  }
  plugin: {
    kind: string
    spec: Record<string, unknown>
  }
  queries?: PanelQuery[]
}

export interface Panel {
  kind: string
  spec: PanelSpec
}

export interface LayoutItem {
  x: number
  y: number
  width: number
  height: number
  content: {
    $ref: string
  }
}

export interface Layout {
  kind: string
  spec: {
    display?: {
      title: string
      collapse?: {
        open: boolean
      }
    }
    items: LayoutItem[]
  }
}

export interface DashboardSpec {
  display: DashboardDisplay
  datasources?: Record<string, unknown>
  variables?: DashboardVariable[]
  panels: Record<string, Panel>
  layouts: Layout[]
  duration?: string
  refreshInterval?: string
}

export interface Dashboard {
  kind: 'Dashboard'
  metadata: DashboardMetadata
  spec: DashboardSpec
}

// Chart Data Types for visualizations
export interface ChartDataPoint {
  label: string
  value: number
  color?: string
}

export interface TimeSeriesDataPoint {
  timestamp: Date
  value: number
  series?: string
}

export interface ClusterSummary {
  total: number
  available: number
  unavailable: number
  unknown: number
}

export interface ResourceSummary {
  kind: string
  count: number
  clusters: string[]
}

export interface PodStatusSummary {
  running: number
  pending: number
  failed: number
  succeeded: number
  unknown: number
}

// Dashboard Panel Props
export interface DashboardPanelProps {
  title: string
  description?: string
  loading?: boolean
  error?: Error | null
  height?: number
  children?: React.ReactNode
}

export interface StatPanelProps extends DashboardPanelProps {
  value: number | string
  suffix?: string
  trend?: 'up' | 'down' | 'stable'
  trendValue?: string
  color?: 'success' | 'warning' | 'danger' | 'info' | 'default'
}

export interface PieChartPanelProps extends DashboardPanelProps {
  data: ChartDataPoint[]
  showLegend?: boolean
}

export interface BarChartPanelProps extends DashboardPanelProps {
  data: ChartDataPoint[]
  orientation?: 'horizontal' | 'vertical'
}

export interface TablePanelProps extends DashboardPanelProps {
  columns: { key: string; header: string; sortable?: boolean }[]
  rows: Record<string, unknown>[]
}

