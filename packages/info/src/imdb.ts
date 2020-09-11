import axios from 'axios'
import { InfoResponse } from './types/InfoResponse'
import {config} from '@fdl/config'

const OMDB_KEY = config.env.OMDB_KEY

export async function getInfo (imdb: string): Promise<InfoResponse> {
  const url = `http://www.omdbapi.com/?i=${imdb}&apikey=${OMDB_KEY}`
  const response = await axios.get(url)

  // console.log(response.data)

  return {
    type: response.data.Type,
    title: response.data.Title,
    year: response.data.Year,
  }
}
