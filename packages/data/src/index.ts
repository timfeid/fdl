import { createConnection as createTypeormConnection } from 'typeorm'
import { config } from '@fdl/config'
import { join } from 'path'

export async function createConnection () {
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
