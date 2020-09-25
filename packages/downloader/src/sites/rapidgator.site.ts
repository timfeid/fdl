import { Site } from './site'
import { config } from '@fdl/config'
import axios from 'axios'
import qs from 'querystring'
import {logger} from '@fdl/logger'

type SID = {
  last_retrieved: number
  session_id: string
  expire_date: number
  traffic_left: string
}

export default class Rapidgator extends Site {
  sid?: SID
  username: string
  password: string
  authenticatingRequest?: Promise<SID>

  constructor () {
    super()
    this.username = config.env.RAPIDGATOR_USERNAME || ''
    this.password = config.env.RAPIDGATOR_PASSWORD || ''
  }

  match (url: string) {
    return /rapidgator\.net/.test(url)
  }

  async authenticate () {
    if (!this.authenticatingRequest && !!this.username && !!this.password && await this.needsAuthentication()) {
      this.authenticatingRequest = this.getSid()
    }

    if (this.authenticatingRequest) {
      await this.authenticatingRequest
    }

    this.authenticatingRequest = undefined
  }

  async needsAuthentication () {
    const oneHourAgo = Date.now() - (1000 * 60 * 60)

    return !this.sid || this.sid.last_retrieved < oneHourAgo
  }

  async getSid() {
    try {
      const query = qs.stringify({
        username: this.username,
        password: this.password,
      })

      const response = await axios({
        url: `https://rapidgator.net/api/user/login?${query}`,
      })

      this.sid = {
        ...response.data.response,
        last_retrieved: Date.now(),
      }
    } catch (e) {
      logger.error(e)
      if (e.response) {
        logger.debug(`Status code: ${e.response.status}`)
        logger.debug(e.response.data)
      }
    }

    return this.sid
  }

  async transformUrl (url: string, retrying = false): Promise<string> {
    if (await this.needsAuthentication()) {
      await this.authenticate()
    }

    try {
      const query = qs.stringify({
        sid: this.sid?.session_id,
        url,
      })
      const response = await axios(`https://rapidgator.net/api/file/download?${query}`)

      return response.data.response.url
    } catch (e) {
      logger.error(`Unable to transform URL: ${e.response.status}`)
      logger.error(e.response.data)
      if (e.response.status === 401 && retrying === false) {
        this.sid = undefined
        return await this.transformUrl(url, true)
      }
      logger.error('Retry failed!')
      return url
    }
  }
}
