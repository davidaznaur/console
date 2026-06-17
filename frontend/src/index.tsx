/* Copyright Contributors to the Open Cluster Management project */
/* istanbul ignore file */

import '@patternfly/patternfly/patternfly-charts.css'
import '@patternfly/react-core/dist/styles/base.css'
import '@patternfly/patternfly/patternfly.css'
import "@redhat-cloud-services/nxtcm-rosa-hcp-wizard/dist/nxtcm-rosa-hcp-wizard.css"
import { Fragment, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import 'regenerator-runtime/runtime'
import App from './App'

const container = document.getElementById('root')
const root = createRoot(container!)

root.render(
  <StrictMode>
    <Suspense fallback={<Fragment />}>
      <App />
    </Suspense>
  </StrictMode>
)
