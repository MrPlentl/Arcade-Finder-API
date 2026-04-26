import { readFileSync } from 'fs';

import { log4js } from '../../../utils/log4js.js';
const logger = log4js.getLogger('[utils|error]'); // Sets up the logger with the [app] string prefix

const errors = JSON.parse(readFileSync('./src/lib/api/utils/errors/errors.json', 'utf-8'));

export interface CustomError extends Error {
  httpStatusCode?: number;
  code?: number | string;
  type?: string;
  details?: any;
}
export interface SqlErrorPayload extends Error {
  type: string;
  code: string | number;
  message: string;
  details?: string | object;
}

export function predefinedError(errorName: string): CustomError {
  const err: CustomError = new Error();
  if (errors[errorName]) {
    Object.entries(errors[errorName]).forEach(([key, value]) => {
      (err as any)[key] = value;
    });
  } else {
    err.message = `Unknown Error: ${errorName}`;
  }

  return err;
}

export function handleError(message: string, error = 400) {
  console.log(message, error);
}

// Standard Way
// const newError = new Error("Testing New Error");
//     newError.details = {missing_field:"apikey"};
//     newError.httpStatusCode = 400;
//     newError.code = 77701;
//     newError.type = "Bad Request";
// throw newError;

// Shortcut
// const newError = new Error("Testing New Error");
//      Object.assign(newError, { type: "Bad Request", message: "New Message", code: 77702, httpStatusCode: 401 });
// throw newError;

export function formatErrorResponse(error: CustomError | string | undefined): [number, any] {
  if (typeof error === 'string') {
    error = new Error(error) as CustomError;
  }

  if (!error) {
    error = new Error('Unknown Error') as CustomError;
  }

  const statusCode = error?.httpStatusCode ?? 500;
  const errorResp = {
    error: {
      type: error?.type ?? 'Error',
      code: error?.code ?? 500,
      message: error?.message ? error?.message : 'Unknown Error',
      details: error?.details ?? 'No additional information available',
    },
  };

  logger.error(`[${statusCode}] ${errorResp.error.type}: ${errorResp.error.message}`);
  return [statusCode, errorResp];
}

/**
 * Formats a SQL error into a standardized error response
 *
 * @param error
 * @param msg
 * @returns
 */
export function sqlError(error: SqlErrorPayload, msg = 'Undefined'): CustomError {
  // Log the full, sensitive SQL error and stack trace internally
  logger.error(`[SQL Error: ${error.code}]: ${error.message}`);
  if (error.stack) {
    logger.trace(error.stack);
  }

  // Return a sanitized, generic error object for the user response
  const safeError = new Error(msg) as CustomError;
  safeError.type = 'Server Error';
  safeError.httpStatusCode = 500;
  safeError.code = error.code || 500;
  safeError.details =
    "There's nothing you can do here. The API just flashed 'INSERT DB ENGINEER' and ate the last credit.";

  return safeError;
}
