const winston = require('winston');
const { combine, colorize, printf } = winston.format;

const logger = winston.createLogger({
  level: 'debug',
  format: combine(
    colorize(),
    printf(info => `${info.level}: ${info.message}`)
  ),
  transports: [ new winston.transports.Console() ],
  exceptionHandlers: [ new winston.transports.Console() ],
  exitOnError: false
});

module.exports = logger;
