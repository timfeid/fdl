import axios from 'axios'
import {config} from '@fdl/config'
import { InfoResponse } from '@fdl/types'

const OMDB_KEY = config.env.OMDB_KEY

export async function getInfo (imdb: string): Promise<InfoResponse> {
  const url = `http://www.omdbapi.com/?i=${imdb}&apikey=${OMDB_KEY}`
  const response = await axios.get(url)

  return {
    type: {name: 'movie'},
    title: response.data.Title,
    year: response.data.Year,
    blurb: response.data.Plot,
    poster: response.data.Poster,
  }
}
