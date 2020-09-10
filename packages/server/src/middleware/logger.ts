import { logger } from '@fdl/logger'
import {Middleware} from 'koa'

export function loggerMiddleware(): Middleware {
  return async (ctx, next) => {
    const time = new Date().getUTCMilliseconds()
    logger.verbose(`--> ${ctx.request.method} ${ctx.request.URL} from ${ctx.ip}`)
    await next()
    let method: 'verbose' | 'warn' = 'verbose'
    if (ctx.status > 299) {
      method = 'warn'
    }
    logger[method](`<-- ${ctx.status} ${ctx.request.URL} in ${new Date().getUTCMilliseconds() - time}ms to ${ctx.ip}`)
  }
}

