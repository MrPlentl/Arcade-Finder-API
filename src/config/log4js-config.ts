import 'dotenv/config';
import { Configuration } from 'log4js';

const logLevel: string = process.env.APP_LOG_LEVEL ?? 'info';

export const log4jsConfig: Configuration = {
  appenders: {
    everything: {
      type: 'dateFile',
      filename: './logs/daily.log',
      keepFileExt: true,
      fileNameSep: '_',
      numBackups: 30,
    },
    out: {
      type: 'stdout',
    },
  },
  categories: {
    default: {
      appenders: ['everything', 'out'],
      level: logLevel,
    },
  },
};
