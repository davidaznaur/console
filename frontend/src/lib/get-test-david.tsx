/* Copyright Contributors to the Open Cluster Management project */

import { fetchRetry, getBackendUrl } from '../resources/utils'

export function getWizardRegions(client_id: string, client_secret: string) {
  const backendURLPath = getBackendUrl() + '/testdavid'
  const abortController = new AbortController()
  return fetchRetry<any>({
    method: 'POST',
    url: backendURLPath,
    data: {
        service_account_id: client_id,
        service_account_secret: client_secret
    },
    signal: abortController.signal,
    retries: process.env.NODE_ENV === 'production' ? 2 : 0,
    disableRedirectUnauthorizedLogin: true,
  })
    .then((res) => res.data)
    .catch((error) => {
      console.error(error)
      return []
    })
}
