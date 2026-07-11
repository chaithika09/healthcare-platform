const fs = require("fs");
const path = require("path");

const logsDir = path.join(__dirname, "../../logs");
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

const logFile = path.join(logsDir, "app.log");

const timestamp = () => new Date().toISOString();

const writeToFile = (level, message) => {
  const line = `[${timestamp()}] [${level}] ${message}\n`;
  fs.appendFile(logFile, line, (err) => { if (err) console.error("Log write error:", err); });
};

const logger = {
  info:  (msg, ...args) => { const m = `${msg} ${args.map(a => JSON.stringify(a)).join(" ")}`.trim(); console.log(`\x1b[36m[INFO]\x1b[0m  ${m}`); writeToFile("INFO",  m); },
  warn:  (msg, ...args) => { const m = `${msg} ${args.map(a => JSON.stringify(a)).join(" ")}`.trim(); console.warn(`\x1b[33m[WARN]\x1b[0m  ${m}`); writeToFile("WARN",  m); },
  error: (msg, ...args) => { const m = `${msg} ${args.map(a => JSON.stringify(a)).join(" ")}`.trim(); console.error(`\x1b[31m[ERROR]\x1b[0m ${m}`); writeToFile("ERROR", m); },
  debug: (msg, ...args) => {
    if (process.env.LOG_LEVEL === "debug") {
      const m = `${msg} ${args.map(a => JSON.stringify(a)).join(" ")}`.trim();
      console.log(`\x1b[35m[DEBUG]\x1b[0m ${m}`);
      writeToFile("DEBUG", m);
    }
  },
};

module.exports = logger;
