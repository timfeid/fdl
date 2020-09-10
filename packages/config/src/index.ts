import dotenv from 'dotenv'
import path from 'path'

type Config = {
  tempPath: string,
  contentPath: string,
  downloadPath: string,
  unrarBin: string,
  env: Record<string, string>,
}

let config: Config

function processPath (p: string) {
  if (p.startsWith('.')) {
    return path.join(__dirname, '../../../', p)
  }

  return p
}

const setupConfig = (): Config => {
  const env = dotenv.config({
    path: path.join(__dirname, '../../..', process.env.NODE_ENV === 'test' ? '.test.env' : '.env')
  }).parsed || {}

  return {
    tempPath: processPath(env.TEMP_PATH || '/tmp'),
    contentPath: processPath(env.CONTENT_PATH || '~/'),
    downloadPath: processPath(env.DOWNLOAD_PATH || env.TEMP_PATH || '/tmp'),
    unrarBin: processPath(env.UNRAR_BIN || '/usr/local/bin/unrar'),
    env,
  }
}

if (!config) {
  config = setupConfig()
}

export {config}
