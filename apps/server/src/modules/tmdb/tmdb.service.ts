import axios from 'axios'
import { Service } from 'typedi'
import { ConfigService } from '../config/config.service'
import { MediaInfo } from './types/media-info.type'
import { MoviedbResult } from './types/moviedb-result.type'
import { MediaType } from '@fdl/data'

@Service()
export class TmdbService {
  constructor(private readonly configService: ConfigService) {}

  async byImdb(imdbId: string): Promise<null | MediaInfo> {
    const url = `https://api.themoviedb.org/3/find/${imdbId}?api_key=${this.configService.movieDbApiKey}&language=en-US&page=1&external_source=imdb_id`
    let data
    try {
      const response = await axios.get(url)
      data = response.data
    } catch (e) {
      console.log(e.response.data)
    }

    if (!data) {
      return
    }

    if (data.movie_results.length > 0) {
      return await this.getMovieById(data.movie_results[0].id)
    }

    if (data.tv_results.length > 0) {
      const season = undefined
      const episode = undefined
      // if (name) {
      //   const parsed = await parseTitle(name)
      //   if (parsed.season) {
      //     season = parsed.season
      //   }
      //   if (parsed.episode) {
      //     episode = parsed.episode
      //   }
      // }

      return await this.getSeriesById(data.tv_results[0].id)
      // if (episode) {
      //   series.episode = episode
      // }
      // if (season) {
      //   series.season = season
      // }
      // return series
    }
  }

  async getMovieById(moviedbId: number) {
    const url = `https://api.themoviedb.org/3/movie/${moviedbId}?api_key=${this.configService.movieDbApiKey}&language=en-US&append_to_response=videos`
    const { data } = await axios.get(url)

    return this.convertResponse(data, MediaType.MOVIE)
  }

  async getSeriesById(id: number, season?: number) {
    let url = `https://api.themoviedb.org/3/tv/${id}`
    if (season !== undefined) {
      url += `/season/${season}`
    }
    url += `?api_key=${this.configService.movieDbApiKey}&language=en-US&append_to_response=videos`
    const { data } = await axios.get(url)
    return this.convertResponse(data, MediaType.SERIES)
  }

  async search(query: string, type: 'tv' | 'movie' | 'multi' = 'tv') {
    query = encodeURI(query)
    const url = `https://api.themoviedb.org/3/search/${type}?api_key=${this.configService.movieDbApiKey}&language=en-US&query=${query}&page=1`
    const response = await axios.get(url)
    const results = response.data.results
      .filter((result: any) => type !== 'multi' || ['tv', 'movie'].includes(result.media_type))
      .slice(0, 5)

    return await Promise.all(
      results.map(async (result: any) => {
        return result.media_type === 'tv' || type === 'tv'
          ? await this.getSeriesById(result.id)
          : await this.getMovieById(result.id)
      }),
    )
  }

  async getEpisode(
    seriesId: number,
    seasonNumber: string | number,
    episodeNumber: string | number,
  ) {
    seasonNumber = typeof seasonNumber !== 'number' ? parseInt(seasonNumber, 10) : seasonNumber
    episodeNumber = typeof episodeNumber !== 'number' ? parseInt(episodeNumber, 10) : episodeNumber
    const url = `https://api.themoviedb.org/3/tv/${seriesId}/season/${seasonNumber}/episode/${episodeNumber}?api_key=${this.configService.movieDbApiKey}&language=en-US`

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

  getTrailer(result: MoviedbResult): string | null {
    const videos = (result.videos?.results || [])
      .filter(video => video.type === 'Trailer' && video.site === 'YouTube')
      .sort((a, b) => (a.size < b.size ? 1 : -1))

    return videos.length > 0 ? `https://youtu.be/${videos[0].key}` : null
  }

  getYear(result: MoviedbResult) {
    if (result.first_air_date) {
      const year = result.first_air_date.substring(0, 4)
      // year += '-'
      // if (result.last_air_date) {
      //   year += result.last_air_date.substring(0, 4)
      // }

      return year
    }

    if (!result.release_date) {
      return 'Unknown'
    }

    return result.release_date.substring(0, 4)
  }

  convertResponse(result: MoviedbResult, type: MediaType): MediaInfo {
    return {
      tmdbId: result.id,
      imdbId: result.imdb_id,
      title: result.title || result.name || result.original_title || '',
      date: this.getYear(result),
      poster: result.poster_path,
      backdrop: result.backdrop_path,
      blurb: result.overview,
      tagline: result.tagline,
      type,
      rating: {
        average: result.vote_average,
        votes: result.vote_count,
      },
      originalLanguage: result.original_language,
      genres: result.genres.map(genre => genre.name),
      trailer: this.getTrailer(result),
    }
  }
}
