const winston = require("winston");
const path    = require("path");
const fs      = require("fs-extra");
const config  = require("../config/config");

fs.ensureDirSync(config.REPORTS.logs);

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(({ level, message, timestamp }) =>
      `[${timestamp}] [${level.toUpperCase().padEnd(5)}] ${message}`)
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: path.join(config.REPORTS.logs, "execution.log"),
      maxsize: 5 * 1024 * 1024,
    }),
    new winston.transports.File({
      filename: path.join(config.REPORTS.logs, "errors.log"),
      level: "error",
    }),
  ],
});

module.exports = logger;
