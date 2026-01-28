import { dynamicImportPluginLoader, PluginLoader } from '@perses-dev/plugin-system'
import { getPluginModule as getStatChartModule } from '@perses-dev/stat-chart-plugin'
import { getPluginModule as getBarChartModule } from '@perses-dev/bar-chart-plugin'
import { getPluginModule as getPieChartModule } from '@perses-dev/pie-chart-plugin'
import { getPluginModule as getTableModule } from '@perses-dev/table-plugin'
import { getPluginModule as getTimeSeriesChartModule } from '@perses-dev/timeseries-chart-plugin'
import { getPluginModule as getGaugeChartModule } from '@perses-dev/gauge-chart-plugin'
import { getPluginModule as getPrometheusModule } from '@perses-dev/prometheus-plugin'
import { getPluginModule as getAcmSearchModule } from './acmSearchPluginModule'

// Build a dynamic import plugin loader that can provide built-in Perses plugins
// plus our custom ACM Search plugin module.
export function createPersesPluginLoader(): PluginLoader {
  return dynamicImportPluginLoader([
    { resource: getStatChartModule(), importPlugin: () => import('@perses-dev/stat-chart-plugin') },
    { resource: getBarChartModule(), importPlugin: () => import('@perses-dev/bar-chart-plugin') },
    { resource: getPieChartModule(), importPlugin: () => import('@perses-dev/pie-chart-plugin') },
    { resource: getTableModule(), importPlugin: () => import('@perses-dev/table-plugin') },
    { resource: getTimeSeriesChartModule(), importPlugin: () => import('@perses-dev/timeseries-chart-plugin') },
    { resource: getGaugeChartModule(), importPlugin: () => import('@perses-dev/gauge-chart-plugin') },
    // Prometheus is included to satisfy default plugin kinds, though we won’t use it directly here.
    { resource: getPrometheusModule(), importPlugin: () => import('@perses-dev/prometheus-plugin') },
    // Custom ACM Search plugin module providing the datasource and query plugin.
    { resource: getAcmSearchModule(), importPlugin: () => import('./acmSearchPluginModule') },
  ])
}

export const pluginLoader = createPersesPluginLoader()
