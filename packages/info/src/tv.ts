import axios from 'axios'
import {config} from '@fdl/config'
import { InfoResponse } from '.'

const MOVIE_DB_KEY = config.env.MOVIE_DB_KEY

type ApiResponseResult = {
  original_name: string
  genre_ids: number[]
  name: string
  popularity: number
  origin_country: string[]
  vote_count: number
  first_air_date: string
  backdrop_path: string
  original_language: string
  id: number
  vote_average: number
  overview: string
  poster_path: string
}

export type EpisodeResponse = {
  blurb: string
  airDate: string
  number: number
}

export type SearchResult = {
  originalName: string
  name: string
  popularity: number
  firstAirDate: string
  id: number
  posterPath: string
  backdropPath: string
  blurb: string
}

export async function search (query: string): Promise<SearchResult[]> {
  query = encodeURI(query)
  const url = `https://api.themoviedb.org/3/search/tv?api_key=${MOVIE_DB_KEY}&language=en-US&query=${query}&page=1`
  const response = await axios.get(url)

  return response.data.results.map((result: ApiResponseResult): SearchResult => {
    return {
      id: result.id,
      originalName: result.original_name,
      name: result.name,
      popularity: result.popularity,
      firstAirDate: result.first_air_date,
      posterPath: `https://image.tmdb.org/t/p/original${result.poster_path}`,
      backdropPath: `https://image.tmdb.org/t/p/original${result.backdrop_path}`,
      blurb: result.overview,
    }
  })
}

export async function findEpisode (seriesId: number, seasonNumber: string | number, episodeNumber: string | number): Promise<null | EpisodeResponse> {
  seasonNumber = typeof seasonNumber !== 'number' ? parseInt(seasonNumber, 10) : seasonNumber
  episodeNumber = typeof episodeNumber !== 'number' ? parseInt(episodeNumber, 10) : episodeNumber

  const url = `https://api.themoviedb.org/3/tv/${seriesId}/season/${seasonNumber}/episode/${episodeNumber}?api_key=${MOVIE_DB_KEY}&language=en-US`

  try {
    const response = await axios.get(url)
    return {
      blurb: response.data.overview,
      airDate: response.data.air_date,
      number: response.data.episode_number,
    }
  } catch {
    return null
  }
}

export async function parseTitle (query: string): Promise<InfoResponse | null> {
  let episodeNumber: number
  let season: number
  let name = query.replace(/\./g, ' ').trim()
  let episode: number | null = null
  const match = name.match(/^(.*?)s?(\d+)\D(\d+)/i)
  if (match) {
    season = parseInt(match[2].trim(), 10)
    episodeNumber = parseInt(match[3].trim(), 10)
    name = match[1].replace(/\./g, ' ').trim().replace(/\d{4}/g, '').trim()
  }

  const shows = await search(name)

  if (shows.length > 0) {
    const year = shows[0].firstAirDate
    const title = shows[0].originalName
    const poster = shows[0].posterPath
    let blurb = shows[0].blurb

    if (episodeNumber) {
      const e = await findEpisode(shows[0].id, season, episodeNumber)
      if (e) {
        blurb = e.blurb
        episode = e.number
      }
    }

    return {
      type: {name: 'series'},
      title,
      year,
      episode,
      season,
      blurb,
      poster,
    }
  }

  return null
}
