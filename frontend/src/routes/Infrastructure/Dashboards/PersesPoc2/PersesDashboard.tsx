/**
 * Perses Dashboard with ACM Search API Datasource
 * Uses ONLY Perses panels and plugin system with Material UI styling.
 * Panel headers are enabled to show built-in Perses options (expand, etc.)
 */
import { useState } from "react";
import {
  ThemeProvider,
  CssBaseline,
  Box,
  Typography,
  Grid,
  Divider,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  ChartsProvider,
  generateChartsTheme,
  getTheme,
  SnackbarProvider,
} from "@perses-dev/components";
import {
  DataQueriesProvider,
  PluginRegistry,
  TimeRangeProvider,
  dynamicImportPluginLoader,
} from "@perses-dev/plugin-system";
import {
  DatasourceStoreProvider,
  Panel,
  VariableProvider,
} from "@perses-dev/dashboards";
import {
  DashboardResource,
  DurationString,
  GlobalDatasourceResource,
  DatasourceResource,
  TimeRangeValue,
} from "@perses-dev/core";
import { DatasourceApi } from "@perses-dev/dashboards";

// Import Perses chart plugins
import * as statChartPlugin from "@perses-dev/stat-chart-plugin";
import * as barChartPlugin from "@perses-dev/bar-chart-plugin";
import * as pieChartPlugin from "@perses-dev/pie-chart-plugin";
import * as timeseriesChartPlugin from "@perses-dev/timeseries-chart-plugin";
import * as gaugeChartPlugin from "@perses-dev/gauge-chart-plugin";
import * as tablePlugin from "@perses-dev/table-plugin";

// Import ACM Search plugin
import * as acmSearchPlugin from "./perses/acmSearchPluginModule";
import {
  ACM_SEARCH_DATASOURCE_KIND,
  ACM_SEARCH_QUERY_KIND,
} from "./perses/acmSearchPluginModule";

// Create a QueryClient for Perses plugins
const persesQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

// ACM Search Datasource definition
const acmSearchDatasource: GlobalDatasourceResource = {
  kind: "GlobalDatasource",
  metadata: { name: "acm-search" },
  spec: {
    default: true,
    plugin: {
      kind: ACM_SEARCH_DATASOURCE_KIND,
      spec: {
        basePath: "/proxy/search",
      },
    },
  },
};

// DatasourceApi implementation for ACM Search
class AcmDatasourceApiImpl implements DatasourceApi {
  getDatasource(): Promise<DatasourceResource | undefined> {
    return Promise.resolve(undefined);
  }

  getGlobalDatasource(): Promise<GlobalDatasourceResource | undefined> {
    return Promise.resolve(acmSearchDatasource);
  }

  listDatasources(): Promise<DatasourceResource[]> {
    return Promise.resolve([]);
  }

  listGlobalDatasources(): Promise<GlobalDatasourceResource[]> {
    return Promise.resolve([acmSearchDatasource]);
  }

  buildProxyUrl(): string {
    return "/proxy/search";
  }
}

const acmDatasourceApi = new AcmDatasourceApiImpl();

// Dashboard resource definition
const dashboardResource: DashboardResource = {
  kind: "Dashboard",
  metadata: {
    name: "acm-search-dashboard",
    project: "acm",
    version: 1,
  },
  spec: {
    display: {
      name: "ACM Search Dashboard",
    },
    duration: "1h",
    refreshInterval: "30s",
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
    panels: {},
    layouts: [],
  },
};

// Plugin loader with ACM Search and chart plugins
const pluginLoader = dynamicImportPluginLoader([
  {
    resource: statChartPlugin.getPluginModule(),
    importPlugin: () => Promise.resolve(statChartPlugin),
  },
  {
    resource: barChartPlugin.getPluginModule(),
    importPlugin: () => Promise.resolve(barChartPlugin),
  },
  {
    resource: pieChartPlugin.getPluginModule(),
    importPlugin: () => Promise.resolve(pieChartPlugin),
  },
  {
    resource: timeseriesChartPlugin.getPluginModule(),
    importPlugin: () => Promise.resolve(timeseriesChartPlugin),
  },
  {
    resource: gaugeChartPlugin.getPluginModule(),
    importPlugin: () => Promise.resolve(gaugeChartPlugin),
  },
  {
    resource: tablePlugin.getPluginModule(),
    importPlugin: () => Promise.resolve(tablePlugin),
  },
  {
    resource: acmSearchPlugin.getPluginModule(),
    importPlugin: () => Promise.resolve(acmSearchPlugin),
  },
]);

// Panel container with consistent styling
interface PanelContainerProps {
  height?: number | string;
  children: React.ReactNode;
}

function PanelContainer({ height = 200, children }: PanelContainerProps) {
  return (
    <Box
      sx={{
        height,
        border: 1,
        borderColor: "divider",
        borderRadius: 1,
        overflow: "hidden",
        backgroundColor: "background.paper",
        "& .MuiPaper-root": {
          height: "100%",
        },
      }}
    >
      {children}
    </Box>
  );
}

function PersesDashboard() {
  const [timeRange, setTimeRange] = useState<TimeRangeValue>({
    pastDuration: "30m",
  });
  const [refreshInterval, setRefreshInterval] = useState<DurationString>("0s");
  const [refreshKey, setRefreshKey] = useState(0);

  // Use dark theme
  const muiTheme = getTheme("dark");
  const chartsTheme = generateChartsTheme(muiTheme, {});

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <QueryClientProvider client={persesQueryClient}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        <ChartsProvider chartsTheme={chartsTheme}>
          <SnackbarProvider
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            variant="default"
            content=""
          >
            <PluginRegistry
              pluginLoader={pluginLoader}
              defaultPluginKinds={{
                Panel: "StatChart",
                TimeSeriesQuery: ACM_SEARCH_QUERY_KIND,
              }}
            >
              <TimeRangeProvider
                timeRange={timeRange}
                refreshInterval={refreshInterval}
                setTimeRange={setTimeRange}
                setRefreshInterval={setRefreshInterval}
              >
                <VariableProvider>
                  <DatasourceStoreProvider
                    dashboardResource={dashboardResource}
                    datasourceApi={acmDatasourceApi}
                  >
                    <Box
                      key={refreshKey}
                      sx={{
                        minHeight: "100vh",
                        backgroundColor: "background.default",
                        p: 3,
                      }}
                    >
                      {/* Header */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          mb: 3,
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: 2,
                              backgroundColor: "primary.main",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 20,
                            }}
                          >
                            📊
                          </Box>
                          <Box>
                            <Typography
                              variant="h5"
                              sx={{
                                fontWeight: 700,
                                color: "text.primary",
                                letterSpacing: -0.5,
                              }}
                            >
                              ACM Search Dashboard
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ color: "text.secondary" }}
                            >
                              Multi-cluster resource monitoring powered by Perses
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                          <Chip
                            label="🔍 ACM Search API"
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                          <Chip
                            label="⏱ 30m"
                            size="small"
                            variant="outlined"
                            sx={{ borderColor: "divider" }}
                          />
                          <Tooltip title="Refresh Dashboard">
                            <IconButton
                              onClick={handleRefresh}
                              size="small"
                              sx={{
                                backgroundColor: "action.hover",
                                "&:hover": { backgroundColor: "action.selected" },
                              }}
                            >
                              🔄
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>

                      <Divider sx={{ mb: 3 }} />

                      {/* Section: Overview Stats */}
                      <Typography
                        variant="overline"
                        sx={{ color: "text.secondary", fontWeight: 600, mb: 2, display: "block" }}
                      >
                        Overview
                      </Typography>

                      <Grid container spacing={2} sx={{ mb: 4 }}>
                        {/* Total Clusters */}
                        <Grid item xs={12} sm={6} md={3}>
                          <PanelContainer height={180}>
                            <DataQueriesProvider
                              definitions={[
                                { kind: ACM_SEARCH_QUERY_KIND, spec: { target: "clusterCount" } },
                              ]}
                            >
                              <Panel
                                definition={{
                                  kind: "Panel",
                                  spec: {
                                    display: { name: "Total Clusters" },
                                    plugin: {
                                      kind: "StatChart",
                                      spec: { calculation: "last", format: { unit: "decimal" } },
                                    },
                                  },
                                }}
                              />
                            </DataQueriesProvider>
                          </PanelContainer>
                        </Grid>

                        {/* Total Nodes */}
                        <Grid item xs={12} sm={6} md={3}>
                          <PanelContainer height={180}>
                            <DataQueriesProvider
                              definitions={[
                                { kind: ACM_SEARCH_QUERY_KIND, spec: { target: "nodeCount" } },
                              ]}
                            >
                              <Panel
                                definition={{
                                  kind: "Panel",
                                  spec: {
                                    display: { name: "Total Nodes" },
                                    plugin: {
                                      kind: "StatChart",
                                      spec: { calculation: "last", format: { unit: "decimal" } },
                                    },
                                  },
                                }}
                              />
                            </DataQueriesProvider>
                          </PanelContainer>
                        </Grid>

                        {/* Total Namespaces */}
                        <Grid item xs={12} sm={6} md={3}>
                          <PanelContainer height={180}>
                            <DataQueriesProvider
                              definitions={[
                                { kind: ACM_SEARCH_QUERY_KIND, spec: { target: "namespaceCount" } },
                              ]}
                            >
                              <Panel
                                definition={{
                                  kind: "Panel",
                                  spec: {
                                    display: { name: "Total Namespaces" },
                                    plugin: {
                                      kind: "StatChart",
                                      spec: { calculation: "last", format: { unit: "decimal" } },
                                    },
                                  },
                                }}
                              />
                            </DataQueriesProvider>
                          </PanelContainer>
                        </Grid>

                        {/* Total Applications */}
                        <Grid item xs={12} sm={6} md={3}>
                          <PanelContainer height={180}>
                            <DataQueriesProvider
                              definitions={[
                                { kind: ACM_SEARCH_QUERY_KIND, spec: { target: "applicationCount" } },
                              ]}
                            >
                              <Panel
                                definition={{
                                  kind: "Panel",
                                  spec: {
                                    display: { name: "Total Applications" },
                                    plugin: {
                                      kind: "StatChart",
                                      spec: { calculation: "last", format: { unit: "decimal" } },
                                    },
                                  },
                                }}
                              />
                            </DataQueriesProvider>
                          </PanelContainer>
                        </Grid>
                      </Grid>

                      {/* Section: Cluster & Pod Status */}
                      <Typography
                        variant="overline"
                        sx={{ color: "text.secondary", fontWeight: 600, mb: 2, display: "block" }}
                      >
                        Status Breakdown
                      </Typography>

                      <Grid container spacing={2} sx={{ mb: 4 }}>
                        {/* Cluster Status */}
                        <Grid item xs={12} md={4}>
                          <PanelContainer height={320}>
                            <DataQueriesProvider
                              definitions={[
                                { kind: ACM_SEARCH_QUERY_KIND, spec: { target: "clusterStatus" } },
                              ]}
                            >
                              <Panel
                                definition={{
                                  kind: "Panel",
                                  spec: {
                                    display: { name: "Cluster Availability" },
                                    plugin: { kind: "PieChart", spec: { calculation: "last" } },
                                  },
                                }}
                              />
                            </DataQueriesProvider>
                          </PanelContainer>
                        </Grid>

                        {/* Pod Status */}
                        <Grid item xs={12} md={4}>
                          <PanelContainer height={320}>
                            <DataQueriesProvider
                              definitions={[
                                { kind: ACM_SEARCH_QUERY_KIND, spec: { target: "podStatus" } },
                              ]}
                            >
                              <Panel
                                definition={{
                                  kind: "Panel",
                                  spec: {
                                    display: { name: "Pod Status Distribution" },
                                    plugin: { kind: "BarChart", spec: { calculation: "last" } },
                                  },
                                }}
                              />
                            </DataQueriesProvider>
                          </PanelContainer>
                        </Grid>

                        {/* Policy Compliance */}
                        <Grid item xs={12} md={4}>
                          <PanelContainer height={320}>
                            <DataQueriesProvider
                              definitions={[
                                { kind: ACM_SEARCH_QUERY_KIND, spec: { target: "policyCompliance" } },
                              ]}
                            >
                              <Panel
                                definition={{
                                  kind: "Panel",
                                  spec: {
                                    display: { name: "Policy Compliance" },
                                    plugin: { kind: "PieChart", spec: { calculation: "last" } },
                                  },
                                }}
                              />
                            </DataQueriesProvider>
                          </PanelContainer>
                        </Grid>
                      </Grid>

                      {/* Section: Workload Resources */}
                      <Typography
                        variant="overline"
                        sx={{ color: "text.secondary", fontWeight: 600, mb: 2, display: "block" }}
                      >
                        Workload Resources
                      </Typography>

                      <Grid container spacing={2} sx={{ mb: 4 }}>
                        <Grid item xs={12}>
                          <PanelContainer height={350}>
                            <DataQueriesProvider
                              definitions={[
                                {
                                  kind: ACM_SEARCH_QUERY_KIND,
                                  spec: {
                                    target: "resourceCounts",
                                    kinds: ["Deployment", "DaemonSet", "StatefulSet", "ReplicaSet", "Job", "CronJob", "Pod"],
                                  },
                                },
                              ]}
                            >
                              <Panel
                                definition={{
                                  kind: "Panel",
                                  spec: {
                                    display: { name: "Workload Resources by Kind" },
                                    plugin: { kind: "BarChart", spec: { calculation: "last", mode: "value" } },
                                  },
                                }}
                              />
                            </DataQueriesProvider>
                          </PanelContainer>
                        </Grid>
                      </Grid>

                      {/* Section: Infrastructure & Security */}
                      <Typography
                        variant="overline"
                        sx={{ color: "text.secondary", fontWeight: 600, mb: 2, display: "block" }}
                      >
                        Infrastructure & Security
                      </Typography>

                      <Grid container spacing={2} sx={{ mb: 4 }}>
                        {/* Storage Resources */}
                        <Grid item xs={12} md={4}>
                          <PanelContainer height={300}>
                            <DataQueriesProvider
                              definitions={[
                                { kind: ACM_SEARCH_QUERY_KIND, spec: { target: "storageResources" } },
                              ]}
                            >
                              <Panel
                                definition={{
                                  kind: "Panel",
                                  spec: {
                                    display: { name: "Storage Resources" },
                                    plugin: { kind: "BarChart", spec: { calculation: "last" } },
                                  },
                                }}
                              />
                            </DataQueriesProvider>
                          </PanelContainer>
                        </Grid>

                        {/* RBAC Resources */}
                        <Grid item xs={12} md={4}>
                          <PanelContainer height={300}>
                            <DataQueriesProvider
                              definitions={[
                                { kind: ACM_SEARCH_QUERY_KIND, spec: { target: "rbacResources" } },
                              ]}
                            >
                              <Panel
                                definition={{
                                  kind: "Panel",
                                  spec: {
                                    display: { name: "RBAC Resources" },
                                    plugin: { kind: "PieChart", spec: { calculation: "last" } },
                                  },
                                }}
                              />
                            </DataQueriesProvider>
                          </PanelContainer>
                        </Grid>

                        {/* Network Resources */}
                        <Grid item xs={12} md={4}>
                          <PanelContainer height={300}>
                            <DataQueriesProvider
                              definitions={[
                                {
                                  kind: ACM_SEARCH_QUERY_KIND,
                                  spec: { target: "resourceCounts", kinds: ["Service", "Ingress", "NetworkPolicy", "Endpoint"] },
                                },
                              ]}
                            >
                              <Panel
                                definition={{
                                  kind: "Panel",
                                  spec: {
                                    display: { name: "Network Resources" },
                                    plugin: { kind: "BarChart", spec: { calculation: "last" } },
                                  },
                                }}
                              />
                            </DataQueriesProvider>
                          </PanelContainer>
                        </Grid>
                      </Grid>

                      {/* Section: Configuration */}
                      <Typography
                        variant="overline"
                        sx={{ color: "text.secondary", fontWeight: 600, mb: 2, display: "block" }}
                      >
                        Configuration
                      </Typography>

                      <Grid container spacing={2} sx={{ mb: 4 }}>
                        {/* Config Resources */}
                        <Grid item xs={12} md={6}>
                          <PanelContainer height={300}>
                            <DataQueriesProvider
                              definitions={[
                                {
                                  kind: ACM_SEARCH_QUERY_KIND,
                                  spec: { target: "resourceCounts", kinds: ["ConfigMap", "Secret", "ServiceAccount"] },
                                },
                              ]}
                            >
                              <Panel
                                definition={{
                                  kind: "Panel",
                                  spec: {
                                    display: { name: "Configuration Resources" },
                                    plugin: { kind: "BarChart", spec: { calculation: "last", mode: "value" } },
                                  },
                                }}
                              />
                            </DataQueriesProvider>
                          </PanelContainer>
                        </Grid>

                        {/* Policy Count */}
                        <Grid item xs={12} sm={6} md={3}>
                          <PanelContainer height={300}>
                            <DataQueriesProvider
                              definitions={[
                                { kind: ACM_SEARCH_QUERY_KIND, spec: { target: "policyCount" } },
                              ]}
                            >
                              <Panel
                                definition={{
                                  kind: "Panel",
                                  spec: {
                                    display: { name: "Total Policies" },
                                    plugin: {
                                      kind: "GaugeChart",
                                      spec: { calculation: "last", max: 100 },
                                    },
                                  },
                                }}
                              />
                            </DataQueriesProvider>
                          </PanelContainer>
                        </Grid>

                        {/* Deployments */}
                        <Grid item xs={12} sm={6} md={3}>
                          <PanelContainer height={300}>
                            <DataQueriesProvider
                              definitions={[
                                { kind: ACM_SEARCH_QUERY_KIND, spec: { target: "resourceCounts", kinds: ["Deployment"] } },
                              ]}
                            >
                              <Panel
                                definition={{
                                  kind: "Panel",
                                  spec: {
                                    display: { name: "Deployments" },
                                    plugin: {
                                      kind: "GaugeChart",
                                      spec: { calculation: "last", max: 500 },
                                    },
                                  },
                                }}
                              />
                            </DataQueriesProvider>
                          </PanelContainer>
                        </Grid>
                      </Grid>

                      {/* Section: Advanced / Custom Resources */}
                      <Typography
                        variant="overline"
                        sx={{ color: "text.secondary", fontWeight: 600, mb: 2, display: "block" }}
                      >
                        Custom & Advanced Resources
                      </Typography>

                      <Grid container spacing={2}>
                        {/* Custom Resources */}
                        <Grid item xs={12} md={6}>
                          <PanelContainer height={320}>
                            <DataQueriesProvider
                              definitions={[
                                {
                                  kind: ACM_SEARCH_QUERY_KIND,
                                  spec: {
                                    target: "customResourceCounts",
                                    kinds: ["VirtualMachine", "HelmRelease", "Channel", "Subscription", "PlacementRule"],
                                  },
                                },
                              ]}
                            >
                              <Panel
                                definition={{
                                  kind: "Panel",
                                  spec: {
                                    display: { name: "Custom Resources" },
                                    plugin: { kind: "BarChart", spec: { calculation: "last" } },
                                  },
                                }}
                              />
                            </DataQueriesProvider>
                          </PanelContainer>
                        </Grid>

                        {/* ACM Resources */}
                        <Grid item xs={12} md={6}>
                          <PanelContainer height={320}>
                            <DataQueriesProvider
                              definitions={[
                                {
                                  kind: ACM_SEARCH_QUERY_KIND,
                                  spec: {
                                    target: "resourceCounts",
                                    kinds: ["ManagedCluster", "ClusterDeployment", "ManagedClusterSet", "Placement"],
                                  },
                                },
                              ]}
                            >
                              <Panel
                                definition={{
                                  kind: "Panel",
                                  spec: {
                                    display: { name: "ACM Resources" },
                                    plugin: { kind: "PieChart", spec: { calculation: "last" } },
                                  },
                                }}
                              />
                            </DataQueriesProvider>
                          </PanelContainer>
                        </Grid>
                      </Grid>

                      {/* Footer */}
                      <Box
                        sx={{
                          mt: 4,
                          pt: 2,
                          borderTop: 1,
                          borderColor: "divider",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          Data source: ACM Search GraphQL API • Panels: Perses • Click panel header for options
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          Auto-refresh: {refreshInterval === "0s" ? "Off" : refreshInterval}
                        </Typography>
                      </Box>
                    </Box>
                  </DatasourceStoreProvider>
                </VariableProvider>
              </TimeRangeProvider>
            </PluginRegistry>
          </SnackbarProvider>
        </ChartsProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default PersesDashboard;
