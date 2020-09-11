import Koa from 'koa'
import { loggerMiddleware } from './middleware/logger'
import {router} from './routes'
import bodyparser from 'koa-bodyparser'
import { setupListeners } from './listeners'



const app = new Koa()

app.use(bodyparser())
app.use(loggerMiddleware())
app.use(router.routes())

setupListeners(app)

export {app}

