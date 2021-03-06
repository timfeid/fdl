import { Site } from './site'
import { config } from '@fdl/config'
import axios, { AxiosResponse } from 'axios'
import qs from 'querystring'
import {logger} from '@fdl/logger'

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
  authenticatingRequest?: Promise<AxiosResponse>

  constructor () {
    super()
    this.username = config.env.RAPIDGATOR_USERNAME || ''
    this.password = config.env.RAPIDGATOR_PASSWORD || ''
  }

  match (url: string) {
    return /rapidgator\.net/.test(url)
  }

  async authenticate () {
    if (!!this.username && !!this.password && await this.needsAuthentication()) {
      await this.getSid()
    }
  }

  async needsAuthentication () {
    return !this.sid
  }

  async getSid() {
    try {
      if (this.authenticatingRequest) {
        return new Promise(resolve => this.authenticatingRequest.then(resolve))
      }

      const query = qs.stringify({
        username: this.username,
        password: this.password,
      })

      logger.verbose('Requesting rapidgator session')
      this.authenticatingRequest = axios({
        url: `https://rapidgator.net/api/user/login?${query}`,
      })

      const response = await this.authenticatingRequest
      this.authenticatingRequest = undefined
      this.sid = response.data.response
      setTimeout(() => this.sid = undefined, 3600000)
    } catch (e) {
      logger.error(e)
      if (e.response) {
        logger.debug(`Status code: ${e.response.status}`)
        console.log(e.response.data)
      }
    }

    return this.sid
  }

  async transformUrl (url: string, retryCount = 0): Promise<string> {
    if (this.needsAuthentication()) {
      await this.authenticate()
    }

    try {
      const query = qs.stringify({
        sid: this.sid?.session_id,
        url,
      })
      logger.verbose(`Transforming url for ${url}`)
      const response = await axios(`https://rapidgator.net/api/file/download?${query}`)

      return response.data.response.url
    } catch (e) {
      logger.error(`Unable to transform URL: ${e.response.status}`)
      console.log(e.response.data)
      if (e.response.status === 401 && retryCount++ !== this.MAX_RETRIES) {
        this.sid = undefined
        logger.debug(`Retry #${retryCount}`)
        await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY * 1000))
        return await this.transformUrl(url, retryCount)
      }
      logger.error('Retry failed!')
      return url
    }
  }
}
