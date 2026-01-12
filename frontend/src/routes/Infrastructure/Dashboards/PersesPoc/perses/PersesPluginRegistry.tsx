/* Copyright Contributors to the Open Cluster Management project */

/**
 * Perses Plugin Registry Setup
 * This file sets up the Perses plugin registry with the chart plugins
 */

import React, { createContext, useContext, ReactNode, useMemo } from 'react'
import { PluginRegistryContextType, PluginType, PluginImplementation } from '@perses-dev/plugin-system'

// Import plugin modules
import { getPluginModule as getStatChartPlugin } from '@perses-dev/stat-chart-plugin'
import { getPluginModule as getTablePlugin } from '@perses-dev/table-plugin'
import { getPluginModule as getBarChartPlugin } from '@perses-dev/bar-chart-plugin'
import { getPluginModule as getPieChartPlugin } from '@perses-dev/pie-chart-plugin'
import { getPluginModule as getGaugeChartPlugin } from '@perses-dev/gauge-chart-plugin'
import { getPluginModule as getTimeseriesChartPlugin } from '@perses-dev/timeseries-chart-plugin'

// Plugin metadata type
interface PluginMetadata {
  kind: string
  pluginType: PluginType
  getPlugin: () => PluginImplementation<PluginType>
}

// Register all available plugins
const REGISTERED_PLUGINS: PluginMetadata[] = [
  {
    kind: 'StatChart',
    pluginType: 'Panel',
    getPlugin: () => getStatChartPlugin().PanelComponent as PluginImplementation<PluginType>,
  },
  {
    kind: 'Table',
    pluginType: 'Panel',
    getPlugin: () => getTablePlugin().PanelComponent as PluginImplementation<PluginType>,
  },
  {
    kind: 'BarChart',
    pluginType: 'Panel',
    getPlugin: () => getBarChartPlugin().PanelComponent as PluginImplementation<PluginType>,
  },
  {
    kind: 'PieChart',
    pluginType: 'Panel',
    getPlugin: () => getPieChartPlugin().PanelComponent as PluginImplementation<PluginType>,
  },
  {
    kind: 'GaugeChart',
    pluginType: 'Panel',
    getPlugin: () => getGaugeChartPlugin().PanelComponent as PluginImplementation<PluginType>,
  },
  {
    kind: 'TimeSeriesChart',
    pluginType: 'Panel',
    getPlugin: () => getTimeseriesChartPlugin().PanelComponent as PluginImplementation<PluginType>,
  },
]

/**
 * Custom Plugin Registry for ACM Search API integration
 */
export class ACMPluginRegistry implements PluginRegistryContextType {
  private plugins: Map<string, PluginMetadata> = new Map()

  constructor() {
    // Register all plugins
    REGISTERED_PLUGINS.forEach((plugin) => {
      this.plugins.set(`${plugin.pluginType}:${plugin.kind}`, plugin)
    })
  }

  async getPlugin<T extends PluginType>(pluginType: T, kind: string): Promise<PluginImplementation<T>> {
    const key = `${pluginType}:${kind}`
    const plugin = this.plugins.get(key)
    
    if (!plugin) {
      throw new Error(`Plugin not found: ${pluginType}/${kind}`)
    }

    return plugin.getPlugin() as PluginImplementation<T>
  }

  async listPluginMetadata(pluginTypes: PluginType[]) {
    return REGISTERED_PLUGINS
      .filter((p) => pluginTypes.includes(p.pluginType))
      .map((p) => ({
        kind: p.kind,
        pluginType: p.pluginType,
        display: { name: p.kind },
        // Module info for plugin loading
        module: {
          resource: '',
          version: '0.1.0',
        },
      }))
  }

  defaultPluginKinds = {
    Panel: 'StatChart',
    TimeSeriesQuery: 'PrometheusTimeSeriesQuery',
    TraceQuery: 'TempoTraceQuery',
  }
}

// Create a singleton instance
export const acmPluginRegistry = new ACMPluginRegistry()

// Context for the plugin registry
const ACMPluginRegistryContext = createContext<ACMPluginRegistry | null>(null)

export interface ACMPluginRegistryProviderProps {
  children: ReactNode
}

/**
 * Provider component for the ACM Plugin Registry
 */
export function ACMPluginRegistryProvider({ children }: ACMPluginRegistryProviderProps) {
  const registry = useMemo(() => acmPluginRegistry, [])
  
  return (
    <ACMPluginRegistryContext.Provider value={registry}>
      {children}
    </ACMPluginRegistryContext.Provider>
  )
}

/**
 * Hook to access the ACM Plugin Registry
 */
export function useACMPluginRegistry() {
  const context = useContext(ACMPluginRegistryContext)
  if (!context) {
    throw new Error('useACMPluginRegistry must be used within ACMPluginRegistryProvider')
  }
  return context
}

