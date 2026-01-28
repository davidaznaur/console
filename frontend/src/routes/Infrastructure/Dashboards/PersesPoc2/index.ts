/**
 * Perses Dashboard (ACM Search) - Entry Point
 * Uses the Perses libraries with the ACM Search GraphQL API as datasource.
 */
export { default as PersesDashboard } from './PersesDashboard'
export { default } from './PersesDashboard'

// Re-export Perses integration
export * from './perses'

// Re-export components
export * from './components'

// Re-export hooks
export * from './useAcmSearchDashboardData'

// Re-export types
export * from './types'

// Re-export services
export * from './searchApiService'
