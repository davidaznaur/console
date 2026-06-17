import { Http2ServerRequest, Http2ServerResponse } from "http2"
import { jsonPost, jsonRequest } from "../../lib/json-request"
import { logger } from "../../lib/logger"
import { getOcmServiceToken } from "../../lib/ocmServiceToken"
import { respondInternalServerError } from "../../lib/respond"
import { API_URL } from "./constants"



export async function getWizardMachineTypes(req: Http2ServerRequest, res: Http2ServerResponse): Promise<void> {
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

      // const accountPath = 'https://api.openshift.com/api/accounts_mgmt/v1/organizations/1wuANBLgbvRSXRXN10OuSFE2gzB/labels'

      const accountPath = `${API_URL}/api/clusters_mgmt/v1/aws_inquiries/machine_types?size=-1`
      const request = await jsonPost(accountPath, body.associated_data, accessTokenSSO).catch((err: Error) => {
        logger.error({ msg: 'Failed to fetch account', error: err.message })
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