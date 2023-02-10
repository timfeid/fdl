import type { PageLoad } from './$types'

export const load: PageLoad = (ctx) => {
  return {
    refreshToken: ctx.locals.refreshToken,
    accessToken: ctx.locals.accessToken,
  };
}
