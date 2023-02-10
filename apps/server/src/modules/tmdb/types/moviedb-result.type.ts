export type MoviedbResult = {
  original_name?: string
  imdb_id: string
  original_title?: string
  genre_ids: number[]
  name?: string
  title?: string
  tagline?: string
  genres: {
    name: string
  }[]
  popularity: number
  origin_country: string[]
  vote_count: number
  first_air_date?: string
  last_air_date?: string
  backdrop_path: string | null
  original_language: string
  id: number
  vote_average: number
  overview: string
  poster_path: string | null
  release_date?: string
  media_type: string
  air_date?: string
  videos?: {
    results: any[]
  }
}
