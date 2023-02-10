import axios, { AxiosResponse } from 'axios'
import qs from 'querystring'
import { Site } from './site'
import {isPast} from 'date-fns'

type SID = {
  session_id: string
  expire_date: number
  traffic_left: string
}

export default class Rapidgator extends Site {
  readonly MAX_RETRIES = 3
  readonly RETRY_DELAY = 45

  sid?: SID
  username: string
  password: string

  constructor () {
    super()
    this.username = process.env.RAPIDGATOR_USERNAME || ''
    this.password = process.env.RAPIDGATOR_PASSWORD || ''
  }

  match (url: string) {
    return /rapidgator\.net/.test(url)
  }

  async authenticate () {
    if (!this.username || !this.password || !this.needsAuthentication()) {
      console.log('No need to authenticate.')
      return
    }

    await this.refreshSid()
  }

  async refreshSid() {
    try {
      const query = qs.stringify({
        username: this.username,
        password: this.password,
      })

      console.log('Requesting rapidgator session')
      const response = await axios({
        url: `https://rapidgator.net/api/user/login?${query}`,
      })

      this.sid = response.data.response
      setTimeout(() => this.sid = undefined, 3600000)
    } catch (e) {
      console.error(e)
      if (e.response) {
        console.debug(`Status code: ${e.response.status}`)
        console.log(e.response.data)
      }
    }
  }

  needsAuthentication () {
    return !this.sid || isPast(new Date(this.sid.expire_date * 1000))
  }

  async transformUrl (url: string, retryCount = 0): Promise<string> {
    await this.authenticate()

    try {
      const query = qs.stringify({
        sid: this.sid.session_id,
        url,
      })
      console.log(`Transforming url for ${url}`)
      const response = await axios(`https://rapidgator.net/api/file/download?${query}`)

      return response.data.response.url
    } catch (e) {
      console.error(`Unable to transform URL`)
      console.log(e.response.data)
      if (e.response.status !== 404 && retryCount++ !== this.MAX_RETRIES) {
        console.debug(`Retry #${retryCount}`)
        this.sid = undefined
        await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY * 1000))
        return await this.transformUrl(url, retryCount)
      }
      console.error('Retries failed!')
      return url
    }
  }
}
