import { Http2ServerRequest, Http2ServerResponse } from "http2"
import { jsonPost, jsonRequest } from "../../lib/json-request"
import { logger } from "../../lib/logger"
import { getOcmServiceToken } from "../../lib/ocmServiceToken"
import { respondInternalServerError } from "../../lib/respond"
import { API_URL } from "./constants"



export async function getClusterNameCheck(req: Http2ServerRequest, res: Http2ServerResponse): Promise<void> {
  try {
    let data: string = undefined
    const chucks: string[] = []
    req.on('data', (chuck: any) => {
      chucks.push(chuck)
    })

    req.on('end', async () => {
      data = chucks.join()
      const body = JSON.parse(data)

      const accessTokenSSO = await getOcmServiceToken(body.service_account_id, body.service_account_secret);
      
      const accountPath =
        `${API_URL}/api/clusters_mgmt/v1/clusters?method=get`


      const accReq = await jsonPost(accountPath,  {
        size: 1,
        search: `name = '${body.cluster_name}'`,
      }, accessTokenSSO).catch((err: Error) => {
        logger.error({ msg: 'Error gettting account info', error: err.message })
      })

      console.log('DATOSHKA AWS IDS', accReq)

      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(accReq))
    })
  } catch (err) {
    logger.error(err)
    respondInternalServerError(req, res)
  }
}