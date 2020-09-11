import path from 'path'
import glob from 'glob'
import Koa from 'koa'

const listeners = path.join(__dirname, '**', '*.listener.ts')
const matches = glob.sync(listeners)


export function setupListeners (app: Koa): void {
  for (const match of matches) {
    // eslint-disable-next-line
    const contents = require(match)
    const listener = contents.default
    const event = contents.event
    app.on(event, listener.bind(this, app))

  }
}
