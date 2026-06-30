import useSWR from 'swr'
import type { ActivityLog } from '@/types'

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error('Failed to fetch logs')
    return res.json()
  })

interface UseLogsParams {
  search?:   string
  category?: string
  from?:     string | null
  to?:       string | null
}

interface UseLogsReturn {
  logs:      ActivityLog[]
  total:     number
  isLoading: boolean
  error:     Error | undefined
  mutate:    () => void
}

export function useLogs(params?: UseLogsParams): UseLogsReturn {
  const query = new URLSearchParams()
  if (params?.search)   query.set('search',   params.search)
  if (params?.category && params.category !== 'All') query.set('category', params.category)
  if (params?.from)     query.set('from', params.from)
  if (params?.to)       query.set('to',   params.to)

  const key = `/api/logs?${query.toString()}`
  const { data, error, isLoading, mutate } = useSWR(key, fetcher)

  return {
    logs:      data?.data?.logs ?? [],
    total:     data?.data?.total ?? 0,
    isLoading,
    error,
    mutate,
  }
}
