const { createLogger, transports, format } = require('winston');
const config = require('./config');

const { combine, timestamp, printf } = format;

const myFormat = printf(info => `${info.timestamp} ${info.level}: ${info.message}`);

module.exports = createLogger({
    level: process.env.LOG_LEVEL || config.logLevel,
    format: combine(timestamp(), myFormat),
    transports: [new transports.Console()],
});
