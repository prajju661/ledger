import useSWR from 'swr'
import type { Routine } from '@/types'

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error('Failed to fetch routines')
    return res.json()
  })

interface UseRoutinesParams {
  filter?: 'all' | 'today' | 'week' | 'overdue'
}

interface UseRoutinesReturn {
  routines: Routine[]
  total: number
  isLoading: boolean
  error: Error | undefined
  mutate: () => void
}

export function useRoutines(params?: UseRoutinesParams): UseRoutinesReturn {
  const query = new URLSearchParams()
  if (params?.filter && params.filter !== 'all') {
    query.set('filter', params.filter)
  }

  const key = `/api/routines?${query.toString()}`
  const { data, error, isLoading, mutate } = useSWR(key, fetcher)

  return {
    routines:  data?.data?.routines ?? [],
    total:     data?.data?.total ?? 0,
    isLoading,
    error,
    mutate,
  }
}
