import axios from 'axios'
import {config} from '@fdl/config'
import { InfoResponse } from '@fdl/types'

const MOVIE_DB_KEY = config.env.MOVIE_DB_KEY

type ApiResponseResult = {
  original_name?: string
  original_title?: string
  genre_ids: number[]
  name?: string
  title?: string
  popularity: number
  origin_country: string[]
  vote_count: number
  first_air_date?: string
  backdrop_path: string | null
  original_language: string
  id: number
  vote_average: number
  overview: string
  poster_path: string | null
  release_date?: string
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

export async function getMovieDbSeries(series: number, season?: number): Promise<any> {
  let url = `https://api.themoviedb.org/3/tv/${series}`
  if (season !== undefined) {
    url += `/season/${season}`
  }
  url += `?api_key=${MOVIE_DB_KEY}&language=en-US`
  const {data} = await axios.get(url)
  return data
}

export async function search (query: string, type: 'tv' | 'movie' = 'tv'): Promise<SearchResult[]> {
  query = encodeURI(query)
  const url = `https://api.themoviedb.org/3/search/${type}?api_key=${MOVIE_DB_KEY}&language=en-US&query=${query}&page=1`
  const response = await axios.get(url)

  return response.data.results.map((result: ApiResponseResult): SearchResult => {
    return {
      id: result.id,
      originalName: result.original_name || result.original_title,
      name: result.name || result.title,
      popularity: result.popularity,
      firstAirDate: result.first_air_date || result.release_date || '',
      posterPath: result.poster_path ? `https://image.tmdb.org/t/p/original${result.poster_path}` : null,
      backdropPath: result.backdrop_path ? `https://image.tmdb.org/t/p/original${result.backdrop_path}` : null,
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

export function extractSeasonAndEpisode (query: string) {
  let season: number
  let name = query.replace(/\./g, ' ').trim()
  let episode: number | null = null

  const match = name.match(/^(.*?)s?(\d+)\D(\d+)/i)
  if (match) {
    season = parseInt(match[2].trim(), 10)
    episode = match[3].trim() ? parseInt(match[3].trim(), 10) : null
    name = match[1].replace(/\./g, ' ').trim().replace(/\d{4}/g, '').trim()
  }

  return {
    season, name, episode
  }
}

export async function parseTitle (query: string, name?: string): Promise<InfoResponse | null> {
  const info = this.extractSeasonAndEpisode(query)
  const {season} = info
  let {episode} = info
  if (!name) {
    name = info.name
  }

  const shows = await search(name)

  if (shows.length > 0) {
    const year = shows[0].firstAirDate
    const title = shows[0].originalName
    const poster = shows[0].posterPath
    let blurb = shows[0].blurb

    if (episode) {
      const e = await findEpisode(shows[0].id, season, episode)
      if (e) {
        blurb = e.blurb
        episode = e.number
      } else {
        episode = null
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
