export type AccessTokenData = {
  sub: string
  firstName: string
  lastName: string
  name: string
  aud: string
  providerId: string
}

export enum TOKEN_AUDIENCE {
  REFRESH_TOKEN = 'REFRESH_TOKEN',
  ACCESS_TOKEN = 'ACCESS_TOKEN',
}
