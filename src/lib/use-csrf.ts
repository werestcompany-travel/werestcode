'use client'
import { useCallback } from 'react'

export function useCsrf() {
  const getToken = useCallback((): string => {
    if (typeof document === 'undefined') return ''
    const match = document.cookie.match(/(?:^|; )csrf_token=([^;]+)/)
    return match ? decodeURIComponent(match[1]) : ''
  }, [])

  // Returns headers object to spread into fetch() calls
  const csrfHeaders = useCallback((): Record<string, string> => {
    return { 'x-csrf-token': getToken() }
  }, [getToken])

  return { getToken, csrfHeaders }
}
