import pino, { levels } from 'pino'
import anylogger from 'anylogger'

const pinoLogger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      destination: 2,
    },
  },
})

anylogger.ext = (logger) => {
  for (const level in anylogger.levels) {
    logger[level] = (...args) => {
      if (level in pinoLogger) {
        pinoLogger[level](...args)
      } else {
        pinoLogger.debug(...args)
      }
    }
  }

  logger.enabledFor = function (level) {
    return pinoLogger.isLevelEnabled(level)
  }

  Object.defineProperty(logger, 'level', {
    get() {
      return pinoLogger.level
    },
    set(level) {
      pinoLogger.level = level
    },
  })

  Object.defineProperty(logger, 'levelVal', {
    get() {
      return pinoLogger.levelVal
    },
    set(levelVal) {
      pinoLogger.level = levels.labels[levelVal]
    },
  })

  return logger
}
