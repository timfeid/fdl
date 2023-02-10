import { User } from '@prisma/client'
import axios from 'axios'
import jwt from 'jsonwebtoken'
import { Context } from 'koa'
import { jwk2pem } from 'pem-jwk'
import { Service } from 'typedi'
import { ConfigService } from '../config/config.service'
import { AccessTokenData, TOKEN_AUDIENCE } from './jwt.types'

@Service()
export class JWTService {
  constructor(private readonly configService: ConfigService) {}

  async getTokenData(user: User): Promise<AccessTokenData> {
    return {
      sub: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      name: `${user.firstName} ${user.lastName}`,
      aud: TOKEN_AUDIENCE.ACCESS_TOKEN,
      providerId: user.providerId,
    }
  }

  getRefreshTokenData(user: User) {
    return {
      sub: user.id,
      aud: TOKEN_AUDIENCE.REFRESH_TOKEN,
    }
  }

  async createAccessToken(user: User) {
    const expiresAt = new Date()
    expiresAt.setFullYear(expiresAt.getFullYear() + 1)

    return jwt.sign(await this.getTokenData(user), this.configService.jwtPrivateKey, {
      expiresIn: '1h',
      notBefore: 0,
      algorithm: 'RS256',
    })
  }

  createRefreshToken(user: User) {
    return jwt.sign(this.getRefreshTokenData(user), this.configService.jwtPrivateKey, {
      expiresIn: '30d',
      algorithm: 'RS256',
    })
  }

  validate(token: string, type: TOKEN_AUDIENCE | null = TOKEN_AUDIENCE.ACCESS_TOKEN) {
    if (!token) {
      return
    }

    try {
      const verified = jwt.verify(token, this.configService.jwtPublicKey) as AccessTokenData
      if (!type || verified.aud === type) {
        return verified
      }
    } catch (e) {
      return
    }
  }

  async validateGoogleToken(token: string) {
    const response = await axios.get('https://www.googleapis.com/oauth2/v3/certs')

    for (const key of response.data.keys) {
      const pem = jwk2pem(key)
      try {
        const payload = jwt.verify(token, pem) as AccessTokenData
        if (payload.aud === this.configService.googleClientId) {
          return payload
        }
      } catch (e) {
        // invalid, try next key
      }
    }
  }

  fromContext(ctx: Context, type: TOKEN_AUDIENCE | null = TOKEN_AUDIENCE.ACCESS_TOKEN) {
    if (ctx.session.accessToken) {
      return this.validate(ctx.session.accessToken, type)
    }
    return this.fromHeader(ctx.headers.authorization, type)
  }

  fromHeader(
    authorizationHeader: string,
    type: TOKEN_AUDIENCE | null = TOKEN_AUDIENCE.ACCESS_TOKEN,
  ) {
    const bearer = authorizationHeader || ''

    return this.validate(bearer.split('Bearer ').pop(), type)
  }
}
