const { app } = require('electron');
const fs = require('fs');
const path = require('path');

class Logger {
    constructor() {
        const localDir = path.join(app.getPath('userData'), './Local');
        const logDir = path.join(localDir, 'logs');
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
        this.logDir = logDir;
        this.logFile = path.join(logDir, 'app.log');

        this.rotateLogs();

        this.enforceLogLimit(10);
    }

    rotateLogs() {
        if (fs.existsSync(this.logFile)) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const archiveFile = path.join(this.logDir, `app-${timestamp}.log`);
            fs.renameSync(this.logFile, archiveFile);
            console.log(`[Logger] Archived log file to: ${archiveFile}`);
        }
    }

    enforceLogLimit(maxFiles) {
        const files = fs.readdirSync(this.logDir)
            .filter(file => file.startsWith('app-') && file.endsWith('.log'))
            .sort((a, b) => {
                const timeA = fs.statSync(path.join(this.logDir, a)).mtimeMs;
                const timeB = fs.statSync(path.join(this.logDir, b)).mtimeMs;
                return timeA - timeB;
            });

        while (files.length > maxFiles) {
            const oldestFile = files.shift();
            fs.unlinkSync(path.join(this.logDir, oldestFile));
            console.log(`[Logger] Deleted old log file: ${oldestFile}`);
        }
    }

    log(level, message) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${level}] ${message}\n`;
        fs.appendFileSync(this.logFile, logMessage, 'utf8');
        console.log(logMessage);
    }

    info(message) {
        this.log('INFO', message);
    }

    error(message) {
        this.log('ERROR', message);
    }

    warn(message) {
        this.log('WARN', message);
    }

    debug(message) {
        this.log('DEBUG', message);
    }
}

module.exports = new Logger();
