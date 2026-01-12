import { ACMNotReadyWarning } from '../../../../components/ACMNotReadyWarning'
import { LoadPluginData } from '../../../../components/LoadPluginData'
import { PluginContextProvider } from '../../../../components/PluginContextProvider'

import PersesDashboard from './PersesDashboard'

export default function DashboardsPlugin() {
  return (
    <PluginContextProvider>
      <LoadPluginData>
        <ACMNotReadyWarning>
          <PersesDashboard />
        </ACMNotReadyWarning>
      </LoadPluginData>
    </PluginContextProvider>
  )
}