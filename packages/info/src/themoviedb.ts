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

export type EpisodeResponse = {
  blurb: string
  airDate: string
  number: number
}

export async function getByImdb(imdbId: string, name?: string): Promise<InfoResponse> {
  const url = `https://api.themoviedb.org/3/find/${imdbId}?api_key=${MOVIE_DB_KEY}&language=en-US&page=1&external_source=imdb_id`
  try {
    const {data} = await axios.get(url)
    if (data.movie_results.length > 0) {
      return await this.getMovie(data.movie_results[0].id)
    }

    if (data.tv_results.length > 0) {
      let season = undefined
      let episode = undefined
      if (name) {
        const parsed = await parseTitle(name)
        if (parsed.season) {
          season = parsed.season
        }
        if (parsed.episode) {
          episode = parsed.episode
        }

      }
      const series = await this.getSeries(data.tv_results[0].id)
      if (episode) {
        series.episode = episode
      }
      if (season) {
        series.season = season
      }
      return series
    }
  } catch (e) {
    return null
  }
}

export async function getMovie(id: number): Promise<InfoResponse> {
  const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${MOVIE_DB_KEY}&language=en-US&append_to_response=videos`
  const {data} = await axios.get(url)

  return convertResponse(data, 'movie')
}

export async function getSeries(series: number, season?: number): Promise<any> {
  const response = await getRawSeries(series, season)
  return season !== undefined ? response : convertResponse(response, 'series')
}

export async function getRawSeries(series: number, season?: number) {
  let url = `https://api.themoviedb.org/3/tv/${series}`
  if (season !== undefined) {
    url += `/season/${season}`
  }
  url += `?api_key=${MOVIE_DB_KEY}&language=en-US&append_to_response=videos`
  const {data} = await axios.get(url)
  return data
}

function getYear(result: ApiResponseResult) {
  if (result.first_air_date) {
    let year = result.first_air_date.substr(0, 4)
    year += '–'
    if (result.last_air_date) {
      year += result.last_air_date.substr(0, 4)
    }

    return year
  }

  if (!result.release_date) {
    return 'Unknown'
  }

  return result.release_date.substr(0, 4)
}

function getTrailer(result: ApiResponseResult): string | null {
  const videos = (result.videos?.results || [])
    .filter(video => video.type === 'Trailer' && video.site === 'YouTube')
    .sort((a, b) => a.size < b.size ? 1 : -1)

  return videos.length > 0 ? `https://youtu.be/${videos[0].key}` : null
}

function convertResponse(result: ApiResponseResult, type: 'series' | 'movie'): InfoResponse {
  return {
    id: result.id,
    title: result.original_name || result.original_title,
    // name: result.name || result.title,
    // popularity: result.popularity,
    year: getYear(result),
    poster: result.poster_path ? `https://image.tmdb.org/t/p/original${result.poster_path}` : null,
    backdrop: result.backdrop_path ? `https://image.tmdb.org/t/p/original${result.backdrop_path}` : null,
    blurb: result.overview,
    type: {name: type},
    airDate: result.first_air_date || result.air_date,
    rating: {
      average: result.vote_average,
      votes: result.vote_count,
    },
    trailer: getTrailer(result),
  }
}

export async function search (query: string, type: 'tv' | 'movie' | 'multi' = 'tv'): Promise<InfoResponse[]> {
  query = encodeURI(query)
  const url = `https://api.themoviedb.org/3/search/${type}?api_key=${MOVIE_DB_KEY}&language=en-US&query=${query}&page=1`
  const response = await axios.get(url)
  const results = response.data.results.filter((result: ApiResponseResult) => type !== 'multi' || ['tv', 'movie'].includes(result.media_type)).slice(0,5)

  return await Promise.all(results.map(async (result: ApiResponseResult): Promise<InfoResponse> => {
    return (result.media_type === 'tv' || type === 'tv') ? await getSeries(result.id) : await getMovie(result.id)
    // return convertResponse(result, result.media_type === 'tv' ? 'series' : 'movie')
  }))
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
  let episode: number | undefined = undefined

  const match = name.match(/^(.*?)s?(\d+)\D(\d+)/i)
  if (match) {
    season = parseInt(match[2].trim(), 10)
    episode = match[3].trim() ? parseInt(match[3].trim(), 10) : undefined
    name = match[1].replace(/\./g, ' ').trim().replace(/\d{4}/g, '').trim()
  }

  return {
    season, name, episode
  }
}

export async function parseTitle (query: string, name?: string): Promise<InfoResponse | null> {
  const info = extractSeasonAndEpisode(query)
  const {season} = info
  let {episode} = info
  if (!name) {
    name = info.name
  }

  const shows = await search(name)

  if (shows.length > 0) {
    const year = shows[0].year
    const title = shows[0].title
    const poster = shows[0].poster
    const backdrop = shows[0].backdrop
    let blurb = shows[0].blurb

    if (episode) {
      const e = await findEpisode(shows[0].id, season, episode)
      if (e) {
        blurb = e.blurb
        episode = e.number
      } else {
        episode = undefined
      }
    }

    return {
      id: shows[0].id,
      type: {name: 'series'},
      title,
      year,
      episode,
      backdrop,
      season,
      blurb,
      poster,
    }
  }

  return null
}
