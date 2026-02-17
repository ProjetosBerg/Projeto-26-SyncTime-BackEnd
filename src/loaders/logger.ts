import * as winston from 'winston'

const { transports } = winston

interface CustomLogger extends winston.Logger {
  dev: (msg: string) => void
  gupshup: (msg: string) => void
}

const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
    dev: 6,
    gupshup: 7,
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    verbose: 'cyan',
    debug: 'blue',
    dev: 'whiteBG',
    gupshup: 'blueBG',
  },
}

winston.addColors(customLevels.colors)

const myFormat = winston.format.printf(({ level, message, timestamp }) => {
  const newMessage = JSON.stringify(message || '')
  let formattedMessage
  if (message) {
    newMessage?.replace(/\[(.*?)\]/g, (match) => {
      return `\x1b[34m${match}\x1b[0m`
    })
  } else {
    formattedMessage = newMessage
  }

  return `${timestamp} ${level}: ${formattedMessage || message}`
})

const logger = winston.createLogger({
  levels: customLevels.levels,
  transports: [
    new transports.Console({
      level: 'error',
      format: winston.format.json(),
    }),
    new transports.Console({
      level: 'info',
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        myFormat
      ),
    }),
  ],
  defaultMeta: true,
  exitOnError: false,
}) as CustomLogger

logger.dev = (msg: string) => logger.log('dev', `[DEVELOPMENT] ${msg}`)
logger.gupshup = (msg: string) => logger.log('gupshup', `[GUPSHUP] ${msg}`)
export default logger
