import { DatasourceApi } from '@perses-dev/dashboards'
import { DatasourceResource, DatasourceSelector, GlobalDatasourceResource } from '@perses-dev/core'

/**
 * Minimal Datasource API implementation for local dashboard-defined datasources.
 * We only use locally defined datasources on the DashboardResource, so the API
 * returns undefined for remote lookups.
 */
export const acmDatasourceApi: DatasourceApi = {
  buildProxyUrl: () => '/proxy/search',
  async getDatasource(_project: string, _selector: DatasourceSelector): Promise<DatasourceResource | undefined> {
    return undefined
  },
  async getGlobalDatasource(_selector: DatasourceSelector): Promise<GlobalDatasourceResource | undefined> {
    return undefined
  },
  async listDatasources(_project: string): Promise<DatasourceResource[]> {
    return []
  },
  async listGlobalDatasources(): Promise<GlobalDatasourceResource[]> {
    return []
  },
}
