export type Episode = {
  airDate?: string
  number: number
  blurb?: string
}
export type InfoResponse = {
  type: 'movie' | 'series'
  title: string
  year: string
  season?: number
  episode?: Episode
  blurb: string
  poster: string
}
