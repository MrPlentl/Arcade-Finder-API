import { printAppInfo } from './appInfo.js';

import { log4js } from '../../utils/log4js.js'; // log4js is a simple to use log library
const logger = log4js.getLogger('[validateEnvironment]');

function validateEnvironment(): boolean {
  logger.trace('[validateEnvironment]');

  const requiredEnvVars: string[] = [
    'APP_NAME',
    'APP_ID',
    'APP_ENV',
    'APP_LOG_LEVEL',
    'HTTP_PORT',
    'IGDB_CLIENT_ID',
    'IGDB_CLIENT_SECRET',
    'JWT_SECRET',
    'KEYMASTER_API_KEY',
    'DB_CONNECTION',
    'DB_HOSTNAME',
    'DB_PORT',
    'DB_USERNAME',
    'DB_PASSWORD',
    'DB_NAME',
    'DB_SSL',
  ];

  const missingVars: string[] = requiredEnvVars.filter((key) => !(key in process.env));

  if (missingVars.length > 0) {
    missingVars.forEach((key) => {
      logger.error(`Environment is missing the following key: '${key}'`);
    });
    logger.error('[FAILED] ENVIRONMENT VALIDATION');
    return false;
  }

  return true;
}

function validateDependencies(): boolean {
  logger.trace('[validateDependencies]');
  // Check if Extrenal Endpoints are available
  // Check IO read / write access
  // Check DB access
  return true;
}

export function validateStartup(): boolean {
  printAppInfo();

  logger.trace('[validateStartup]');
  const isEnvValid: boolean = validateEnvironment();
  const areDepsValid: boolean = validateDependencies();

  if (!isEnvValid || !areDepsValid) {
    logger.error('[FAILED] Startup Validation');
    return false;
  }

  logger.info('[PASSED] ENVIRONMENT VALIDATION');
  return true;
}
