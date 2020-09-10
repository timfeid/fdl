export type Episode = {
  airDate?: string
  number: number
}
export type InfoResponse = {
  type: 'movie' | 'series'
  title: string
  year: string
  season?: number
  episode?: Episode
}
