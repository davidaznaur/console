
/* Copyright Contributors to the Open Cluster Management project */
import { Http2ServerRequest, Http2ServerResponse } from 'http2'
import { jsonRequest } from '../../lib/json-request'
import { logger } from '../../lib/logger'
import { respondInternalServerError } from '../../lib/respond'
import { getOcmServiceToken } from '../../lib/ocmServiceToken'
import { API_URL } from './constants'

export function getWizardVersions(req: Http2ServerRequest, res: Http2ServerResponse) {
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
console.log('****************** accessTokenSSO accessTokenSSO **************', accessTokenSSO)
      // const accountPath = 'https://api.openshift.com/api/accounts_mgmt/v1/organizations/1wuANBLgbvRSXRXN10OuSFE2gzB/labels'

      const versionsPath = `${API_URL}/api/clusters_mgmt/v1/versions/?order=end_of_life_timestamp desc&product=hcp&search=enabled='t' AND (channel_group='stable' OR channel_group='eus' OR channel_group='candidate' OR channel_group='fast' OR channel_group='nightly') AND rosa_enabled='t'&size=-1`
      const request = await jsonRequest(versionsPath, accessTokenSSO).catch((err: Error) => {
        logger.error({ msg: 'Failed to fetch regions', error: err.message })
        return { error: err.message }
      })

      

      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(request))

      // const accReq = await jsonRequest(accountPath, accessTokenSSO).catch((err: Error) => {
      //     logger.error({ msg: "Error gettting account info", error: err.message })
      // })
    })
  } catch (err) {
    logger.error(err)
    respondInternalServerError(req, res)
  }
}
