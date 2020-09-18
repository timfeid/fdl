import Koa from 'koa'
import { loggerMiddleware } from './middleware/logger'
import {router} from './routes'
import bodyparser from 'koa-bodyparser'
import { setupListeners } from './listeners'
import {createConnection} from '@fdl/data'
import cors from '@koa/cors'

const app = new Koa()

app.use(cors())
app.use(bodyparser())
app.use(loggerMiddleware())
app.use(router.routes())

createConnection().then(() => app.emit('ready'))

setupListeners(app)

export {app}

