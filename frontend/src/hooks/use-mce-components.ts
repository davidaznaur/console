/* Copyright Contributors to the Open Cluster Management project */

import { useState, useEffect } from 'react'
import { MultiClusterEngineComponent } from '../resources/multi-cluster-engine-component'
import { fetchGet, getBackendUrl } from '../resources/utils'

/**
 * Fetches all components from the MultiClusterEngine CR.
 * @returns A tuple of [components, loaded, error].
 */
export const useMCEComponents = (): [MultiClusterEngineComponent[], boolean, Error | undefined] => {
  const [components, setComponents] = useState<MultiClusterEngineComponent[]>([])
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<Error | undefined>(undefined)

  useEffect(() => {
    const abortController = new AbortController()

    const fetchComponents = async () => {
      try {
        const url = `${getBackendUrl()}/multiclusterengine/components`
        const response = await fetchGet<MultiClusterEngineComponent[]>(url, abortController.signal)
        setComponents(response.data ?? [])
        setLoaded(true)
      } catch (err) {
        if (!abortController.signal.aborted) {
          console.warn('Failed to fetch MCE components:', err)
          setError(err instanceof Error ? err : new Error(String(err)))
          setLoaded(true)
        }
      }
    }

    fetchComponents()

    return () => {
      abortController.abort()
    }
  }, [])

  return [components, loaded, error]
}
