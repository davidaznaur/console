# Perses Dashboard POC

This Proof of Concept demonstrates the integration of the **actual Perses library** (`@perses-dev/*` npm packages) with the **ACM Search API** for multi-cluster observability.

## Overview

Perses is an open-source observability visualization platform that provides:
- Dashboard-as-Code (DaC) using CUE language
- Kubernetes-native design
- Flexible data source integration
- Rich visualization panels

This POC uses the official Perses npm packages:
- `@perses-dev/core` - Core types and utilities (DashboardResource, PanelDefinition, etc.)
- `@perses-dev/dashboards` - Dashboard components and providers
- `@perses-dev/plugin-system` - Plugin system for loading panel plugins
- `@perses-dev/stat-chart-plugin` - Stat chart visualization
- `@perses-dev/table-plugin` - Table visualization
- `@perses-dev/bar-chart-plugin` - Bar chart visualization
- `@perses-dev/pie-chart-plugin` - Pie chart visualization
- `@perses-dev/gauge-chart-plugin` - Gauge chart visualization
- `@perses-dev/timeseries-chart-plugin` - Time series chart visualization

## Features

### Dashboard Panels
- **StatPanel**: Display single metric values with optional trends
- **StatusBreakdownPanel**: Show status distributions with color coding
- **HorizontalBarChartPanel**: Visualize data as horizontal bar charts
- **DonutChartPanel**: Circular charts for proportional data
- **TablePanel**: Tabular data display with sorting
- **LabelListPanel**: Display lists of labels/tags

### Data Sources
All data is fetched from the ACM Search API GraphQL endpoint:
- Cluster status and availability
- Pod status distribution
- Resource counts by kind (Deployments, Services, ConfigMaps, etc.)
- Node distribution across clusters
- Workload details

### Features
- **Auto-refresh**: Configurable refresh intervals (30s, 1m, 5m, 15m)
- **Responsive grid layout**: Adapts to different screen sizes
- **Loading states**: Skeleton loading for better UX
- **Error handling**: Graceful error display in panels

## File Structure

```
PersesPoc/
├── index.ts                    # Main entry point and exports
├── types.ts                    # TypeScript type definitions
├── searchApiService.ts         # ACM Search API service functions
├── useDashboardData.ts         # React hooks for data fetching
├── PersesDashboard.tsx         # Main dashboard page component
├── README.md                   # This file
├── components/                 # Custom UI components
│   ├── index.ts                # Component exports
│   ├── DashboardPanel.tsx      # Panel visualization components
│   └── DashboardGrid.tsx       # Grid layout components
└── perses/                     # Perses library integration
    ├── index.ts                # Perses module exports
    ├── ACMDatasource.ts        # ACM Search API datasource
    ├── ACMDashboardDefinition.ts # Dashboard definitions using Perses types
    └── PersesDashboardView.tsx # Main Perses dashboard component
```

## Perses Types Used

The POC uses the following Perses types from `@perses-dev/core`:

```typescript
import {
  DashboardResource,    // Main dashboard resource type
  DashboardSpec,        // Dashboard specification
  PanelDefinition,      // Panel definition type
  LayoutDefinition,     // Layout definition (Grid)
  DatasourceSpec,       // Datasource specification
  VariableDefinition,   // Variable definitions
} from '@perses-dev/core'
```

### Dashboard Resource Structure

```typescript
const dashboard: DashboardResource = {
  kind: 'Dashboard',
  metadata: {
    name: 'acm-overview',
    project: 'acm',
    version: 1,
  },
  spec: {
    display: { name: 'ACM Overview', description: '...' },
    duration: '1h',
    refreshInterval: '30s',
    variables: [],
    panels: { /* panel definitions */ },
    layouts: [ /* Grid layouts */ ],
    datasources: { /* datasource configs */ },
  },
}
```

## Usage

### Accessing the Dashboard

Navigate to: `/multicloud/infrastructure/dashboards/perses`

Or use the Navigation sidebar: **Infrastructure > Perses Dashboard**

### Creating Dashboards with Perses Types

```typescript
import {
  createACMOverviewDashboard,
  createStatChartPanel,
  createTablePanel,
  createBarChartPanel,
  createGridLayout,
} from './routes/Infrastructure/Dashboards/PersesPoc/perses'

// Create a custom dashboard
const myDashboard: DashboardResource = {
  kind: 'Dashboard',
  metadata: { name: 'my-dashboard', project: 'acm', version: 1 },
  spec: {
    display: { name: 'My Custom Dashboard' },
    duration: '1h',
    refreshInterval: '30s',
    variables: [],
    panels: {
      statPanel: createStatChartPanel('Total Items', 'Count of items'),
      tablePanel: createTablePanel('Items List', 'All items'),
    },
    layouts: [
      createGridLayout('Overview', [
        { panelKey: 'statPanel', x: 0, y: 0, width: 6, height: 4 },
        { panelKey: 'tablePanel', x: 6, y: 0, width: 18, height: 8 },
      ]),
    ],
  },
}
```

### Using Components in Other Pages

```tsx
import {
  StatPanel,
  DonutChartPanel,
  TablePanel,
  DashboardGrid,
  DashboardCell,
} from './routes/Infrastructure/Dashboards/PersesPoc'

function MyPage() {
  return (
    <DashboardGrid>
      <DashboardCell span={6}>
        <StatPanel
          title="Total Clusters"
          value={42}
          color="success"
        />
      </DashboardCell>
      <DashboardCell span={6}>
        <DonutChartPanel
          title="Status"
          segments={[
            { label: 'Active', value: 35, color: 'green' },
            { label: 'Inactive', value: 7, color: 'red' },
          ]}
        />
      </DashboardCell>
    </DashboardGrid>
  )
}
```

### Using Data Hooks

```tsx
import {
  useClusterSummary,
  usePodStatusSummary,
  useResourceSummary,
} from './routes/Infrastructure/Dashboards/PersesPoc'

function MyComponent() {
  const { data, loading, error, refetch } = useClusterSummary()
  
  if (loading) return <Spinner />
  if (error) return <Alert variant="danger">{error.message}</Alert>
  
  return (
    <div>
      Total Clusters: {data?.total}
      Available: {data?.available}
    </div>
  )
}
```

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

### Search Result Count
```graphql
query searchResult($input: [SearchInput]) {
  searchResult: search(input: $input) {
    count
  }
}
```

### Search Input Structure
```typescript
{
  filters: [
    { property: 'kind', values: ['Cluster'] },
    { property: 'cluster', values: ['my-cluster'] },
  ],
  relatedKinds: ['Pod', 'Deployment'],
  limit: 100,
}
```

## Integration with Perses Server

For full Perses integration, you can:

1. **Deploy Perses Server**: Run Perses as a container alongside ACM
2. **Create Data Sources**: Configure ACM Search API as a custom data source
3. **Define Dashboards**: Use CUE language for Dashboard-as-Code
4. **Embed Dashboards**: Use Perses embed capabilities or iframe

### Example CUE Dashboard

```cue
package acmDashboard

import (
    "github.com/perses/perses/cue/dac-utils/dashboard"
)

dashboard.#Dashboard & {
    metadata: {
        name: "acm-overview"
        project: "default"
    }
    spec: {
        display: {
            name: "ACM Multi-Cluster Overview"
        }
        // ... panel definitions
    }
}
```

## Future Enhancements

1. **Time Range Selection**: Add time range picker for historical data
2. **Drill-down Navigation**: Click on charts to navigate to detailed views
3. **Custom Queries**: Allow users to create custom search queries
4. **Dashboard Persistence**: Save dashboard configurations
5. **Alert Integration**: Display alerts from Policy violations
6. **Export to Perses**: Generate Perses-compatible JSON/CUE definitions

## References

- [Perses Documentation](https://perses.dev/)
- [Perses GitHub](https://github.com/perses/perses)
- [ACM Search API](../../../routes/Search/search-sdk/)
- [PatternFly Charts](https://www.patternfly.org/charts/)

