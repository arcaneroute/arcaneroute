import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';

const prettyOptions = {
  colorize: true,
  translateTime: 'HH:MM:ss',
};
export const logger = isDev
  ? pino({ transport: { target: "pino-pretty", options: prettyOptions }}).child({ level: 'debug' })
  : pino({ level: isDev ? 'debug' : 'info' });
logger.info(`[Logger] Initializing logger in ${isDev ? 'development' : 'production'} mode`);

export default logger;
