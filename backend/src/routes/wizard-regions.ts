/* Copyright Contributors to the Open Cluster Management project */
import { Http2ServerRequest, Http2ServerResponse } from 'http2'
import { jsonRequest } from '../lib/json-request'
import { logger } from '../lib/logger'
import { respondInternalServerError } from '../lib/respond'
import { getOcmServiceToken } from '../lib/ocmServiceToken'

export async function getTestDataOCM(req: Http2ServerRequest, res: Http2ServerResponse): Promise<void> {
  try {
    let data: string = undefined
    const chucks: string[] = []
    req.on('data', (chuck: any) => {
      chucks.push(chuck)
    })

    req.on('end', async () => {
      data = chucks.join()
      const body = JSON.parse(data)

      const accessTokenSSO = await getOcmServiceToken(body.service_account_id, body.service_account_secret)

      const regionsPath = 'https://api.openshift.com/api/accounts_mgmt/v1/regions'
      const request = await jsonRequest(regionsPath, accessTokenSSO).catch((err: Error) => {
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

export async function getAwsAccountIds(req: Http2ServerRequest, res: Http2ServerResponse): Promise<void> {
  try {
    let data: string = undefined
    const chucks: string[] = []
    req.on('data', (chuck: any) => {
      chucks.push(chuck)
    })

    req.on('end', async () => {
      data = chucks.join()
      const body = JSON.parse(data)

      const accessTokenSSO = await getOcmServiceToken(body.service_account_id, body.service_account_secret)

      const accountPath =
        'https://api.openshift.com/api/accounts_mgmt/v1/organizations/1wuANBLgbvRSXRXN10OuSFE2gzB/labels'

      const currentAccountPath = 'https://api.openshift.com/api/accounts_mgmt/v1/current_account'
      //const requestAccount = await jsonRequest(currentAccountPath, accessTokenSSO);
      //console.log("ACCOUNT FETCHED", requestAccount)

      const accReq = await jsonRequest(accountPath, accessTokenSSO).catch((err: Error) => {
        logger.error({ msg: 'Error gettting account info', error: err.message })
      })

      console.log('AWS IDS', accReq)

      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(accReq))
    })
  } catch (err) {
    logger.error(err)
    respondInternalServerError(req, res)
  }
}
