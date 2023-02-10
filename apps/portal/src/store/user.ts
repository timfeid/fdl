import { get, writable } from "svelte/store";
import type { AccessTokenData } from '../../../server/src/modules/jwt/jwt.types'
import * as jose from 'jose'
import { browser } from "$app/environment";
import { page } from "$app/stores";

let loginUrl = '/latest'

type AccessToken = {accessToken: string, skipRedirect?: boolean}

const invalidPages = [
  '/login',
  '/login/email',
  '/login/magic',
  '/auth/callback/linkedin',
  '/logout',
  '/forgot-password',
  '/reset-password',
  '/signup',
]

export function keepTrackOfLoginUrl() {
  page.subscribe(page => {
    const path = page.url.pathname || '/latest'
    if (!invalidPages.includes(path)) {
      loginUrl = path
    }
  })
}

export const user = writable<AccessTokenData | null>(null)

export const accessToken = writable<AccessToken | string>('')

accessToken.subscribe(accessToken => {
  if (accessToken) {
    const at = typeof accessToken === 'string' ? {accessToken} : accessToken
    at.skipRedirect = typeof at.skipRedirect === 'undefined' ? false : at.skipRedirect
    if (at.accessToken) {
      const u = jose.decodeJwt(at.accessToken)
      if (!at.skipRedirect && browser) {
        window.location.href = (u.plan === null) ? '/pricing' : loginUrl
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      user.set(u)
    }
  }
})

export function getAccessToken(): AccessToken {
  const val = get(accessToken)

  return typeof val === 'string' ? {accessToken: val} : val
}
