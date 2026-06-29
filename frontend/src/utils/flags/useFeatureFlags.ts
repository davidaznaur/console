/* Copyright Contributors to the Open Cluster Management project */
import { SetFeatureFlag } from '@openshift-console/dynamic-plugin-sdk'
import { REQUIRED_PROVIDER_FLAG } from '@stolostron/multicluster-sdk'
import { useEffect } from 'react'
import { useQuery } from '../../lib/useQuery'
import { MultiClusterEngineComponent } from '../../resources/multi-cluster-engine-component'
import { MultiClusterHubComponent } from '../../resources/multi-cluster-hub-component'
import { getBackendUrl, getRequest } from '../../resources/utils'
import { FEATURE_FLAGS, MCE_FEATURE_FLAGS } from './consts'

const POLLING_INTERVAL_MS = 120 * 1000

const mchFeatureFlagsQueryFn = () => {
  return getRequest<MultiClusterHubComponent[]>(getBackendUrl() + '/multiclusterhub/components')
}

const mceFeatureFlagsQueryFn = () => {
  return getRequest<MultiClusterEngineComponent[]>(getBackendUrl() + '/multiclusterengine/components')
}

const useFeatureFlags = (setFeatureFlag: SetFeatureFlag) => {
  const {
    data: mchComponents,
    loading: mchLoading,
    error: mchError,
    startPolling: startMchPolling,
    stopPolling: stopMchPolling,
  } = useQuery(mchFeatureFlagsQueryFn, [])

  const {
    data: mceComponents,
    loading: mceLoading,
    error: mceError,
    startPolling: startMcePolling,
    stopPolling: stopMcePolling,
  } = useQuery(mceFeatureFlagsQueryFn, [])

  useEffect(() => {
    if (mchComponents && !mchLoading) {
      Object.entries(FEATURE_FLAGS).forEach(([featureFlag, componentName]) =>
        setFeatureFlag(featureFlag, mchComponents.find((e) => e.name === componentName)?.enabled || false)
      )
    }
  }, [mchComponents, mchLoading, setFeatureFlag])

  useEffect(() => {
    if (mceComponents && !mceLoading) {
      Object.entries(MCE_FEATURE_FLAGS).forEach(([featureFlag, componentName]) =>
        setFeatureFlag(featureFlag, mceComponents.find((e) => e.name === componentName)?.enabled || false)
      )
    }
  }, [mceComponents, mceLoading, setFeatureFlag])

  useEffect(() => {
    if (mchError) {
      console.warn('Failed to fetch MCH feature flags:', mchError)
    }
  }, [mchError])

  useEffect(() => {
    if (mceError) {
      console.warn('Failed to fetch MCE feature flags:', mceError)
    }
  }, [mceError])

  useEffect(() => {
    startMchPolling(POLLING_INTERVAL_MS)
    return () => {
      stopMchPolling()
    }
  }, [startMchPolling, stopMchPolling])

  useEffect(() => {
    startMcePolling(POLLING_INTERVAL_MS)
    return () => {
      stopMcePolling()
    }
  }, [startMcePolling, stopMcePolling])

  useEffect(() => {
    setFeatureFlag(REQUIRED_PROVIDER_FLAG, true)
  }, [setFeatureFlag])
}

export default useFeatureFlags
