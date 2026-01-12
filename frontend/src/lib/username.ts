/* Copyright Contributors to the Open Cluster Management project */

import { getBackendUrl, getRequest } from '../resources/utils'

export const usernameUrl = '/username'

export type IUsernameResult = {
  body: {
    username: string
  }
  statusCode: number
}

export function getUsername() {
  const url = getBackendUrl() + usernameUrl
  console.log("DAZA URL", url)
  return getRequest<IUsernameResult>(url)
}
