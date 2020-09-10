import fs from 'fs'
import path from 'path'
import winston, { format, transports } from 'winston'

const level = process.env.LOG_LEVEL || 'debug'

const options = {
  debug: {
    level: 'debug',
    handleExceptions: true,
    json: true,
    colorize: true,
    prettyPrint: true,
    format: format.colorize({ all: true })
  },
  verbose: {
    level: 'verbose',
    handleExceptions: true,
    json: true,
    colorize: true,
    prettyPrint: true,
    format: format.colorize({ all: true })
  },
  error: {
    level: 'error',
    filename: path.resolve(process.cwd(), 'koa-app-errors.log'),
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5
  }
}

const tps = process.env.NODE_ENV === 'test' ? [
  new transports.Stream({
    stream: fs.createWriteStream('/dev/null')
  }),
  new transports.Console({
    ...options.debug,
    level: 'error',
  }),
] : [
  new transports.Console(options.debug),
  // new transports.Console(options.verbose),
  new transports.File(options.error),
]

const winstonConfiguration = {
  level,
  exitOnError: false,
  format: format.combine(
    format.timestamp({
      format: 'Do MMM YYYY - h:mm:ss A'
    }),
    format.errors({ stack: true }),
    format.json(),
    format.printf(({ timestamp, level, message, ...rest }) => {
      const restString = JSON.stringify(rest, undefined, 4)
      return `[${timestamp}] ${level} - ${message} ${restString}`
    })
  ),
  transports: tps,
  exceptionHandlers: [
    new transports.File({
      filename: path.resolve(process.cwd(), 'koa-app-errors.log'),
    })
  ]
}

export const logger = winston.createLogger(winstonConfiguration)
