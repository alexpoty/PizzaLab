import { useRef } from 'react'

export function useLatestRequestGate() {
  const activeRequestIdRef = useRef(0)

  const startRequest = () => {
    activeRequestIdRef.current += 1
    return activeRequestIdRef.current
  }

  const invalidateRequests = () => {
    activeRequestIdRef.current += 1
  }

  const isLatestRequest = (requestId: number) => activeRequestIdRef.current === requestId

  return {
    startRequest,
    invalidateRequests,
    isLatestRequest,
  }
}
