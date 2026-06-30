import useSWR from 'swr'
import type { Item } from '@/types'

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error('Failed to fetch items')
    return res.json()
  })

interface UseItemsParams {
  search?: string
  category?: string
  sort?: string
}

interface UseItemsReturn {
  items: Item[]
  total: number
  isLoading: boolean
  error: Error | undefined
  mutate: () => void
}

export function useItems(params?: UseItemsParams): UseItemsReturn {
  const query = new URLSearchParams()
  if (params?.search)   query.set('search',   params.search)
  if (params?.category && params.category !== 'All') query.set('category', params.category)
  if (params?.sort)     query.set('sort',     params.sort)

  const key = `/api/items?${query.toString()}`
  const { data, error, isLoading, mutate } = useSWR(key, fetcher)

  return {
    items:     data?.data?.items ?? [],
    total:     data?.data?.total ?? 0,
    isLoading,
    error,
    mutate,
  }
}
