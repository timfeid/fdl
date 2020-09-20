import dotenv from 'dotenv'
import path from 'path'

type Config = {
  tempPath: string,
  contentPath: string,
  downloadPath: string,
  unrarBin: string,
  env: Record<string, string>,
  database: string,
}

function processPath (p: string) {
  if (p.startsWith('.')) {
    return path.join(__dirname, '../../../', p)
  }

  return p
}

const setupConfig = (): Config => {
  let env = dotenv.config({path: processPath('./.env')}).parsed || {}
  if (process.env.NODE_ENV === 'test') {
    env = {...env, ...dotenv.config({path: processPath('./.test.env')}).parsed || {}}
  }

  return {
    tempPath: processPath(env.TEMP_PATH || '/tmp'),
    contentPath: processPath(env.CONTENT_PATH || '~/'),
    downloadPath: processPath(env.DOWNLOAD_PATH || env.TEMP_PATH || '/tmp'),
    unrarBin: processPath(env.UNRAR_BIN || '/usr/local/bin/unrar'),
    env,
    database: processPath(env.DATABASE_LOCATION || './database.sqlite'),
  }
}

export const config = setupConfig()
