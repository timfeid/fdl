import { Site } from './site'

export default class DefaultSite extends Site {
  match () {
    return true
  }
}
