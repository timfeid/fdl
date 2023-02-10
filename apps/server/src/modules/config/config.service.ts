import { readFileSync } from 'fs'
import path from 'path'
import { Service } from 'typedi'

@Service()
export class ConfigService {
  constructor(protected readonly env: Record<string, string> = process.env) {}

  get port() {
    return parseInt(this.env.PORT || '8787', 10)
  }

  get stripeKey() {
    return this.env.STRIPE_KEY || ''
  }

  get jwtPublicKey() {
    return readFileSync(path.join('jwt.public.key'), 'utf8')
  }

  get jwtPrivateKey() {
    return readFileSync(path.join('jwt.private.key'), 'utf8')
  }

  get redisUrl() {
    return this.env.REDIS_URL || 'redis://localhost/'
  }

  get skipCaching() {
    return this.env.SKIP_CACHING === 'true'
  }

  get googleClientId() {
    return this.env.GOOGLE_CLIENT_ID || ''
  }

  get googleSecret() {
    return this.env.GOOGLE_SECRET || ''
  }

  get movieDbApiKey() {
    return this.env.MOVIE_DB_KEY || ''
  }

  get rootSeriesDir() {
    return this.env.DIR_SERIES || '/storage/content/TV Shows'
  }

  get rootMoviesDir() {
    return this.env.DIR_MOVIES || '/storage/content/Movies'
  }

  get rootDownloadsDir() {
    return this.env.DIR_TEMP || '/tmp'
  }

  get unrarBin() {
    return this.env.UNRAR_BIN || '/usr/bin/unrar'
  }
}
