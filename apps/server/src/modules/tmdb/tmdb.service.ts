import axios from "axios";
import { Service } from "typedi";
import { ConfigService } from "../config/config.service";
import { MediaInfo } from "./types/media-info.type";
import { MoviedbResult } from "./types/moviedb-result.type";
import { MediaType } from '@prisma/client'

@Service()
export class TmdbService {
  constructor(private readonly configService: ConfigService) {}

  async byImdb(imdbId: string): Promise<null | MediaInfo> {
    const url = `https://api.themoviedb.org/3/find/${imdbId}?api_key=${this.configService.movieDbApiKey}&language=en-US&page=1&external_source=imdb_id`
    const {data} = await axios.get(url)

    if (data.movie_results.length > 0) {
      return await this.getMovieById(data.movie_results[0].id)
    }

    if (data.tv_results.length > 0) {
      let season = undefined
      let episode = undefined
      // if (name) {
      //   const parsed = await parseTitle(name)
      //   if (parsed.season) {
      //     season = parsed.season
      //   }
      //   if (parsed.episode) {
      //     episode = parsed.episode
      //   }
      // }

      return await this.getSeriesById(data.tv_results[0].id, imdbId)
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
    const {data} = await axios.get(url)

    return this.convertResponse(data, MediaType.MOVIE)
  }

  async getSeriesById(id: number, imdb_id: string, season?: number) {
    let url = `https://api.themoviedb.org/3/tv/${id}`
    if (season !== undefined) {
      url += `/season/${season}`
    }
    url += `?api_key=${this.configService.movieDbApiKey}&language=en-US&append_to_response=videos`
    const {data} = await axios.get(url)
    return this.convertResponse({...data, imdb_id}, MediaType.SERIES)
  }

  getTrailer(result: MoviedbResult): string | null {
    const videos = (result.videos?.results || [])
      .filter(video => video.type === 'Trailer' && video.site === 'YouTube')
      .sort((a, b) => a.size < b.size ? 1 : -1)

    return videos.length > 0 ? `https://youtu.be/${videos[0].key}` : null
  }

  getYear(result: MoviedbResult) {
    if (result.first_air_date) {
      let year = result.first_air_date.substring(0, 4)
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
