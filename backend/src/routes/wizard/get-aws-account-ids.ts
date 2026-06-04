import type { Http2ServerRequest, Http2ServerResponse } from 'http2'
import { respondInternalServerError } from '../../lib/respond'
import { logger } from '../../lib/logger'
import { jsonRequest } from '../../lib/json-request'
import { getOcmServiceToken } from '../../lib/ocmServiceToken'

export async function getAWSAccountIDs(req: Http2ServerRequest, res: Http2ServerResponse): Promise<void> {
  try {
    let data: string = undefined
    const chunks: string[] = []
    req.on('data', (chunk: any) => {
      chunks.push(chunk)
    })

    req.on('end', async () => {
      data = chunks.join()
      const body = JSON.parse(data)
      const accessTokenSSO = await getOcmServiceToken(body.service_token_id, body.service_account_secret)
      const accountPath = 'https://api.openshift.com/api/accounts_mgmt/v1/organizations/1wuANBLgbvRSXRXN10OuSFE2gzB/'
      const currentAccountPath = 'https://api.openshift.com/api/accounts_mgmt/v1/current_account'

      const accReq = await jsonRequest(accountPath, accessTokenSSO).catch((err: Error) => {
        logger.error({ msg: 'Error getting account infor', error: err.message })
      })

      console.log('AWS IDS', accReq)

      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(accReq))
    })
  } catch (error) {
    logger.error(error)
    respondInternalServerError(req, res)
  }
}
