/* Copyright Contributors to the Open Cluster Management project */
import Router from 'find-my-way'
import { Http2Server, Http2ServerRequest, Http2ServerResponse } from 'http2'
import { authenticated } from './lib/authenticated'
import { loadSettings } from './lib/config'
import { stopFileWatches } from './lib/fileWatch'
import { cors } from './lib/cors'
import { delay } from './lib/delay'
import { logger, stopLogger } from './lib/logger'
import { startLoggingMemory } from './lib/memory'
import { notFound, respondInternalServerError, respondOK } from './lib/respond'
import { startServer, stopServer } from './lib/server'
import { ServerSideEvents } from './lib/server-side-events'
import { aggregate, startAggregating, stopAggregating } from './routes/aggregator'
import { ansibleTower } from './routes/ansibletower'
import { apiPaths } from './routes/apiPaths'
import { configure } from './routes/configure'
import { events, startWatching, stopWatching } from './routes/events'
import { hub } from './routes/hub'
import { liveness } from './routes/liveness'
import { observabilityProxy, prometheusProxy } from './routes/metricsProxy'
import { multiClusterEngineComponents } from './routes/multiClusterEngineComponents'
import { multiClusterHubComponents } from './routes/multiClusterHubComponents'
import { login, loginCallback, logout } from './routes/oauth'
import { operatorCheck } from './routes/operatorCheck'
import { proxy } from './routes/proxy'
import { readiness } from './routes/readiness'
import { search } from './routes/search'
import { serveHandler } from './routes/serve'
import { upgradeRiskPredictions } from './routes/upgrade-risks-prediction'
import { username } from './routes/username'
import { userpreference } from './routes/userpreference'
import { virtualMachineGETProxy, virtualMachineProxy, vmResourceUsageProxy } from './routes/virtualMachineProxy'
import { managedClusterProxy } from './routes/managedClusterProxy'
import { hypershiftStatus } from './routes/hypershift-status'
import { clusterVersion } from './routes/clusterVersion'
import { getWizardVersions } from './routes/wizard/wizard-versions'
import { getWizardRegions } from './routes/wizard/wizard-regions'
import { getWizardCloudProviders } from './routes/wizard/wizard-cloud-providers'
import { getAwsAccountIds, getAwsBillingAccountIds } from './routes/wizard/wizard-aws-accounts'
import { getOCMRoleARN, getRoleARNs, getUserRole } from './routes/wizard/wizard-role-arns'
import { getClusterNameCheck } from './routes/wizard/wizard-cluster-name'
import { getWizardOIDCConfigs } from './routes/wizard/wizard-oidc-configs'
import { getWizardVPCs } from './routes/wizard/wizard-vpc'
import { getWizardMachineTypes } from './routes/wizard/wizard-machine-types'

const isProduction = process.env.NODE_ENV === 'production'
const isDevelopment = process.env.NODE_ENV === 'development'
const eventsEnabled = process.env.DISABLE_EVENTS !== 'true'

// Router defaults to max param length of 100 - We need to override to 500 to handle resources with very long names
// If the route exceeds 500 chars the route will not be found from this fn: router.find()
export const router = Router<Router.HTTPVersion.V2>({ maxParamLength: 500 })
router.get('/readinessProbe', readiness)
router.get('/livenessProbe', liveness)
router.get('/ping', respondOK)
router.all('/api', proxy)
router.all('/api/*', proxy)
router.all('/apis', proxy)
router.all('/apis/*', proxy)
router.get('/apiPaths', apiPaths)
router.get('/version', proxy)
router.get('/version/', proxy)
router.post('/operatorCheck', operatorCheck)
router.get('/observability/*', observabilityProxy)
router.get('/prometheus/*', prometheusProxy)
if (!isProduction) {
  router.get('/configure', configure)
  router.get('/login', login)
  router.get('/login/callback', loginCallback)
  router.get('/logout', logout)
  router.get('/logout/', logout)
}
if (eventsEnabled) {
  router.get('/events', events)
}
router.post('/proxy/search', search)
router.get('/authenticated', authenticated)
router.post('/ansibletower', ansibleTower)
router.get('/username', username)
router.all('/userpreference', userpreference)
router.get('/hub', hub)
router.get('/hypershift-status', hypershiftStatus)
router.get('/cluster-version', clusterVersion)
router.post('/upgrade-risks-prediction', upgradeRiskPredictions)
router.post('/multiregion-regions', getWizardRegions)
router.post('/openshift-versions', getWizardVersions)
router.post('/aws-account-ids', getAwsAccountIds)
router.post('/cloud-providers', getWizardCloudProviders)
router.post('/sts-role-arns',getRoleARNs)
router.post('/sts-ocm-role', getOCMRoleARN)
router.post('/machine-types', getWizardMachineTypes)
router.post('/sts-user-role', getUserRole)
router.post('/aws-billing-accounts', getAwsBillingAccountIds)
router.post('/cluster-name-check', getClusterNameCheck)
router.post('/oidc-configs', getWizardOIDCConfigs)
router.post('/vpcs', getWizardVPCs)
router.post('/aggregate/*', aggregate)
router.get('/virtualmachines/get/*', virtualMachineGETProxy)
router.all('/virtualmachines/*', virtualMachineProxy)
router.all('/virtualmachineinstances/*', virtualMachineProxy)
router.get('/virtualmachinesnapshots/get/*', virtualMachineGETProxy)
router.all('/virtualmachinesnapshots/*', virtualMachineProxy)
router.all('/virtualmachinerestores', virtualMachineProxy)
router.get('/vmResourceUsage/cluster/:cluster/namespace/:namespace', vmResourceUsageProxy)
router.get('/multiclusterhub/components', multiClusterHubComponents)
router.get('/multiclusterengine/components', multiClusterEngineComponents)
router.all('/managedclusterproxy/*', managedClusterProxy)
router.get('/*', serveHandler)

export async function requestHandler(req: Http2ServerRequest, res: Http2ServerResponse): Promise<void> {
  if (!isProduction) {
    if (cors(req, res)) return
    await delay(req, res)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
  if (req.url === '/multicloud') (req as any).url = '/'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
  else if (req.url.startsWith('/multicloud')) (req as any).url = req.url.substring(11)

  const route = router.find(req.method as Router.HTTPMethod, req.url)
  if (!route) {
    logger.warn({ msg: 'route not found', url: req.url })
    return notFound(req, res)
  }

  try {
    const result: unknown = route.handler(req, res, route.params, route.store, route.searchParams)
    if (result instanceof Promise) await result
  } catch (err) {
    logger.error(err)
    if (!res.headersSent) return respondInternalServerError(req, res)
  }
}

export async function start(): Promise<Http2Server | undefined> {
  await loadSettings()
  if (eventsEnabled) {
    startWatching()
    startAggregating()
  }
  return startServer({ requestHandler })
}

export async function stop(): Promise<void> {
  if (isDevelopment) {
    setTimeout(() => {
      logger.warn('process stop timeout. exiting...')
      process.exit(1)
    }, 0.5 * 1000).unref()
  }
  stopFileWatches()
  await ServerSideEvents.dispose()
  stopWatching()
  stopAggregating()
  await stopServer()
  stopLogger()
}

if (process.env.LOG_MEMORY === 'true') {
  startLoggingMemory()
}
