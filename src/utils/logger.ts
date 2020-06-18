import { format, createLogger, transports } from 'winston'

const { combine, errors, colorize, printf, splat } = format
const newLineSeparator = process.env.NODE_ENV === 'development' ? '\n' : '\r'

const createLabelForLevel = format((info) => {
  if (!info.level.includes('<')) {
    info.level = `<${info.level}>`
  }

  return info
})

const formatLogMessage = () =>
  printf((info) => {
    const { level, message, stack, ...rest } = info
    const stringifiedMessage = JSON.stringify(message, null, 2)
    const infoAndMessage = `${level} ${stringifiedMessage}`
    const hasRest = Object.keys(rest).length > 0
    const stringifiedRest = JSON.stringify(rest, null, 2)

    const restSuffix = hasRest ? `${newLineSeparator}${stringifiedRest}` : ''

    if (stack) {
      return `${infoAndMessage}: ${newLineSeparator} ${restSuffix} ${newLineSeparator}${stack}`.replace(
        /\n/g,
        newLineSeparator
      )
    }

    return `${infoAndMessage}${restSuffix}`.replace(/\n/g, newLineSeparator)
  })

const formatters = () => {
  const basicFormatters = [
    splat(),
    createLabelForLevel(),
    errors({ stack: true }),
    formatLogMessage(),
  ]

  if (process.env.NODE_ENV === 'development') {
    return [...basicFormatters, colorize({ all: true })]
  }

  return basicFormatters
}

const logger = createLogger({
  level: 'info',
  format: combine(...formatters()),
  transports: [new transports.Console()],
})

export default logger
