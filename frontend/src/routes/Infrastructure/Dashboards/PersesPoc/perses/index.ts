/* Copyright Contributors to the Open Cluster Management project */

/**
 * Perses Integration Module
 * Exports all Perses-related components and utilities
 */

// Dashboard View
export { PersesDashboardView, default as PersesDashboard } from './PersesDashboardView'

// Dashboard Definition
export {
  createACMOverviewDashboard,
  createMinimalTestDashboard,
  createStatChartPanel,
  createTablePanel,
  createBarChartPanel,
  createPieChartPanel,
  createGaugeChartPanel,
  createGridLayout,
} from './ACMDashboardDefinition'

// ACM Datasource
export {
  executeSearchQuery,
  getItemsByKind,
  getCountByKind,
  getClusters,
  getClusterSummary,
  getPods,
  getPodStatusSummary,
  getNodes,
  getDeployments,
  getResourceCounts,
  searchWithFilters,
  createACMDatasourceSpec,
} from './ACMDatasource'

export type {
  SearchFilter,
  SearchInput,
  SearchQuery,
  SearchResultItem,
  ISearchResult,
  ACMSearchDatasourceSpec,
} from './ACMDatasource'

