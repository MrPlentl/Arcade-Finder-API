import { Request } from 'express';
import { EXTERNAL_LINKS } from './constants.js';

/**
 * Determines whether a given date or timestamp has already passed.
 *
 * Accepts date strings like "2025-09-13 06:37:00" or valid Date objects.
 * Automatically converts space-separated timestamps to ISO-compatible format.
 *
 * @param {string | Date} date - The date or timestamp to evaluate.
 * @returns {boolean} True if the date is in the past or invalid; otherwise, false.
 */
export function hasExpiredDate(date: string | Date): boolean {
  if (!date) return true;

  // Normalize common SQL-style timestamps ("YYYY-MM-DD HH:mm:ss") to ISO ("YYYY-MM-DDTHH:mm:ss")
  const dateStr = typeof date === 'string' ? date.replace(' ', 'T') : date;

  const givenDate = new Date(dateStr);
  if (isNaN(givenDate.getTime())) return true; // invalid date string

  return givenDate < new Date();
}

/**
 * Retrieves the client's IP address from an HTTP request object.
 *
 * This function first checks the `x-forwarded-for` header (used by proxies or load balancers),
 * then falls back to the direct socket's remote address.
 *
 * @param {import('http').IncomingMessage} req - The HTTP request object.
 * @returns {string | undefined} The client’s IP address, or `undefined` if unavailable.
 */
export const getClientIP = (req: Request): string | undefined => {
  if (!req) return undefined;

  // Check for proxy or load balancer forwarded IPs (comma-separated list)
  const forwardedFor = req.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string') {
    const ip = forwardedFor.split(',')[0].trim();
    if (ip) return ip;
  }

  // Fallback: use the direct socket connection address
  return req.socket?.remoteAddress;
};

/**
 * Returns the "length" of a given value in a type-appropriate way.
 *
 * - Strings and arrays: their `.length`
 * - Objects: number of enumerable keys
 * - Maps and Sets: their `.size`
 * - Numbers: number of digits (excluding minus sign and decimal point)
 * - Null, undefined, boolean, function, symbol, etc.: 0
 *
 * @param {string | number | any[] | object | Map<any, any> | Set<any> | null | undefined} value
 * @returns {number} The computed length or size of the value.
 */
export const getLength = (value: any): number => {
  if (value == null) return 0; // null or undefined

  if (typeof value === 'string' || Array.isArray(value)) {
    return value.length;
  }

  if (value instanceof Map || value instanceof Set) {
    return value.size;
  }

  if (typeof value === 'object') {
    return Object.keys(value).length;
  }

  if (typeof value === 'number' && !isNaN(value)) {
    // Count digits only (ignore negative sign and decimal point)
    return value.toString().replace(/[-.]/g, '').length;
  }

  return 0;
};

/**
 * Returns a standardized API response as a JSON string.
 *
 * Returns an object with an optional `count` (length of `resp`) and `data`.
 *
 * @param {unknown} resp - The response data
 * @param {boolean} [includeCount=true] - Whether to include a `count` property.
 * @returns {string} The standardized API response as a JSON string.
 */
export const standardResponse = (resp: unknown, includeCount: boolean = true): string => {
  const responseObj = {
    ...(includeCount && resp != null && { count: getLength(resp) }),
    data: resp ?? null, // ensure data is never undefined
  };

  return JSON.stringify(responseObj);
};

// Builds an external link for a given source and ID
export const buildExternalLink = (source: string, id: string | number | null): string | null => {
  if (!id) return null;

  const baseUrl = EXTERNAL_LINKS[source as keyof typeof EXTERNAL_LINKS];
  if (!baseUrl) return null;

  return `${baseUrl}${id}`;
};
