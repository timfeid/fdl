import { MediaType } from "@prisma/client"

export interface Rating {
  average: number
  votes: number
}

export interface MediaInfo {
  imdbId: string
  tmdbId: number
  date: string
  title: string
  blurb: string
  poster: string | null
  backdrop: string | null
  tagline: string | null
  originalLanguage: string
  genres: string[]
  rating?: Rating
  type: MediaType
  trailer?: string | null
}
