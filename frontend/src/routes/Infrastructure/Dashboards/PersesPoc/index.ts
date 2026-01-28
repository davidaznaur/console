/* Copyright Contributors to the Open Cluster Management project */

/**
 * Perses Dashboard POC - Entry Point
 * 
 * This POC demonstrates integration of the actual Perses library (@perses-dev)
 * with ACM Search API for multi-cluster observability.
 * 
 * Features:
 * - Uses @perses-dev/core, @perses-dev/dashboards, @perses-dev/plugin-system
 * - Dashboard definitions using Perses DashboardResource types
 * - ACM Search API as custom datasource
 * - Perses-style visualizations (StatChart, BarChart, PieChart, Table)
 * - Auto-refresh capability
 * - Responsive grid layout
 * 
 * Usage:
 *   import PersesDashboard from './routes/Infrastructure/Dashboards/PersesPoc'
 *   <Route path="/dashboards/perses" component={PersesDashboard} />
 */

export { default as PersesDashboard } from './PersesDashboard'
export { default } from './PersesDashboard'

// Re-export Perses integration
export * from './perses'

// Re-export components
export * from './components'

// Re-export hooks
export * from './useFilteredDashboardData'

// Re-export types
export * from './types'

// Re-export services
export * from './searchApiService'

