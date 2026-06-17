/* Copyright Contributors to the Open Cluster Management project */
import { Http2ServerRequest, Http2ServerResponse } from 'http2'
import { jsonRequest } from '../../lib/json-request'
import { logger } from '../../lib/logger'
import { respondInternalServerError } from '../../lib/respond'
import { getOcmServiceToken } from '../../lib/ocmServiceToken'
import { API_URL } from './constants'

export function getWizardCloudProviders(req: Http2ServerRequest, res: Http2ServerResponse) {
  try {
    let data: string = undefined
    const chucks: string[] = []
    req.on('data', (chuck: any) => {
      chucks.push(chuck)
    })

    req.on('end', async () => {
      data = chucks.join()
      const body = JSON.parse(data)
      console.log('****************** DAVID BODY **************', body)
      const accessTokenSSO = await getOcmServiceToken(body.service_account_id, body.service_account_secret)

      const cloudProvidersPath = `${API_URL}/api/clusters_mgmt/v1/cloud_providers?size=-1&fetchRegions=true`
      const request = await jsonRequest(cloudProvidersPath, accessTokenSSO).catch((err: Error) => {
        logger.error({ msg: 'Failed to fetch regions', error: err.message })
        return { error: err.message }
      })
 console.log('******************** DAVID *******************', request)
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(request))
    })
  } catch (err) {
    logger.error(err)
    respondInternalServerError(req, res)
  }
}
