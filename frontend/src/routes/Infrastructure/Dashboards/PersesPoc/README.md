# Perses Dashboard POC

This Proof of Concept demonstrates the integration of the **Perses library** (`@perses-dev/*` npm packages) with the **ACM Search API** for multi-cluster observability.

## Overview

Perses is an open-source observability visualization platform that provides:
- Dashboard-as-Code (DaC) using CUE language
- Kubernetes-native design
- Flexible data source integration
- Rich visualization panels

This POC uses the official Perses npm packages:
- `@perses-dev/core` - Core types and utilities (DashboardResource, PanelDefinition, etc.)
- `@perses-dev/components` - Chart components (ECharts-based)

## Features

### Dashboard Visualizations (via @perses-dev/components)
- **PersesStatChart**: Display single metric values with optional sparkline
- **PersesBarChart**: Vertical bar chart visualization
- **PersesPieChart**: Donut/pie chart for proportional data
- **PersesHorizontalBarChart**: Horizontal bar chart for comparisons
- **TablePanel**: Tabular data display (PatternFly-based)

### Data Sources
All data is fetched from the ACM Search API GraphQL endpoint:
- Cluster status and availability
- Pod status distribution
- Resource counts by kind (Deployments, DaemonSets, StatefulSets, etc.)
- Node distribution across clusters
- Workload details (Deployments, DaemonSets, Jobs, ReplicaSets, StatefulSets)

### Filtering
- **Cluster filter**: Filter by managed clusters
- **Namespace filter**: Filter by namespaces
- **Kind filter**: Filter workloads by resource kind
- **Search text**: Free-text search with "Kind:" syntax support

### Features
- **Auto-refresh**: Configurable refresh intervals (default 30s)
- **Responsive grid layout**: Adapts to different screen sizes
- **Loading states**: Spinner loading for better UX
- **Error handling**: Graceful error display

## File Structure

```
PersesPoc/
├── index.ts                    # Main entry point and exports
├── types.ts                    # TypeScript type definitions
├── searchApiService.ts         # ACM Search API service functions
├── useFilteredDashboardData.ts # React hook for filtered data fetching
├── PersesDashboard.tsx         # Main dashboard page component
├── README.md                   # This file
├── components/                 # UI components
│   ├── index.ts                # Component exports
│   ├── DashboardFilters.tsx    # Filter UI components
│   └── PersesCharts.tsx        # Perses/ECharts chart components
└── perses/                     # Perses library integration
    ├── index.ts                # Perses module exports
    ├── ACMDashboardDefinition.ts # Dashboard definitions using Perses types
    └── PersesDashboardView.tsx # Main Perses dashboard component
```

## Usage

### Accessing the Dashboard

Navigate to: `/multicloud/infrastructure/dashboards/perses`

### Using the Filters

The dashboard supports several filter types:

1. **Cluster dropdown**: Select specific clusters to filter data
2. **Namespace dropdown**: Select namespaces to filter workloads
3. **Kind dropdown**: Select workload types (Deployment, DaemonSet, etc.)
4. **Search text**: Free-text search with support for "Kind: DaemonSet, Job" syntax

## ACM Search API Queries

The POC uses GraphQL queries against the Search API:

### Search Result Items
```graphql
query searchResult($input: [SearchInput]) {
  searchResult: search(input: $input) {
    items
  }
}
```

### Search Input Structure
```typescript
{
  filters: [
    { property: 'kind', values: ['Cluster'] },
    { property: 'cluster', values: ['my-cluster'] },
    { property: 'namespace', values: ['default'] },
  ],
  limit: 100,
}
```

## References

- [Perses Documentation](https://perses.dev/)
- [Perses GitHub](https://github.com/perses/perses)
- [PatternFly](https://www.patternfly.org/)
