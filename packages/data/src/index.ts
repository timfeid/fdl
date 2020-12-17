import { createConnection as createTypeormConnection, getConnection, getConnectionManager } from 'typeorm'
import { config } from '@fdl/config'
import { join } from 'path'

export async function createConnection () {
  if (getConnectionManager().has('default')) {
    return
  }
  return await createTypeormConnection({
    name: 'default',
    type: 'sqlite',
    database: config.database,
    migrations: ['migrations/*.ts'],
    synchronize: true,
    logging: process.env.DATABASE_LOGGING === 'true',
    entities: [join(__dirname, 'entities/**/*.entity.ts')],
  })
}

export { Download } from './entities/download.entity'
export { Type } from './entities/type.entity'
export { Url } from './entities/url.entity'
export { Option } from './entities/option.entity'
export {Rss} from './entities/rss.entity'
export {Entity} from './entities/entity.entity'
export {Downloadable} from './entities/downloadable.entity'
export {Tag} from './entities/tag.entity'
