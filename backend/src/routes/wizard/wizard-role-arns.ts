import { Http2ServerRequest, Http2ServerResponse } from "http2"
import { jsonPost, jsonRequest } from "../../lib/json-request"
import { logger } from "../../lib/logger"
import { getOcmServiceToken } from "../../lib/ocmServiceToken"
import { API_URL } from "./constants"

export async function getRoleARNs(req: Http2ServerRequest, res: Http2ServerResponse): Promise<void> {
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
        `${API_URL}/api/clusters_mgmt/v1/aws_inquiries/sts_account_roles`

        const requestBody = {
            account_id: body.aws_account_id
        }
      const accReq = await jsonPost(accountPath,requestBody, accessTokenSSO).catch((err: Error) => {
        logger.error({ msg: 'Error gettting account info', error: err.message })
      })

      console.log('ARNS ERROR IN PROXY', accReq)

      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(accReq))
    })
  } 

  export async function getOCMRoleARN(req: Http2ServerRequest, res: Http2ServerResponse): Promise<void> {
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
        `${API_URL}/api/clusters_mgmt/v1/aws_inquiries/sts_ocm_role`

        const requestBody = {
            account_id: body.aws_account_id
        }
      const accReq = await jsonPost(accountPath,requestBody, accessTokenSSO).catch((err: Error) => {
        logger.error({ msg: 'Error gettting account info', error: err.message })
      })

      console.log('ARNS ERROR IN PROXY', accReq)

      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(accReq))
    })
  } 

export async function getUserRole(req: Http2ServerRequest, res: Http2ServerResponse): Promise<void> {
     let data: string = undefined
    const chucks: string[] = []
    req.on('data', (chuck: any) => {
      chucks.push(chuck)
    })

    req.on('end', async () => {
      data = chucks.join()
      const body = JSON.parse(data)

      const accessTokenSSO = await getOcmServiceToken(body.service_account_id, body.service_account_secret);

      // get current account and ID
      const accountPath = `${API_URL}/api/accounts_mgmt/v1/current_account`
      const request: any = await jsonRequest(accountPath, accessTokenSSO).catch((err: Error) => {
              logger.error({ msg: 'Failed to fetch account', error: err.message })
              return { error: err.message }
            })
    console.log("requestDATO", request)
      const userRolesPath =
        `${API_URL}/api/accounts_mgmt/v1/accounts/${request.id}/labels/sts_user_role
`

      const accReq = await jsonRequest(userRolesPath, accessTokenSSO).catch((err: Error) => {
        logger.error({ msg: 'Error gettting account info', error: err.message })
      })

      console.log("request.id", request.id)
      console.log("USERROLESPATH", userRolesPath)

      console.log('ARNS ERROR IN PROXY', accReq)

      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(accReq))
    })
}
