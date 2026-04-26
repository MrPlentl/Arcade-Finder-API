/**
 * The Arcade Finder API can be used to find nearby Arcades, return information about individual arcades as well as updating that information
 * @module app (Arcade Finder API)
 * @version 0.2.1
 * @author R. Brandon Plentl <bplentl@gmail.com>
 */
import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import serverRequestLog from 'morgan';
import * as eov from 'express-openapi-validator';
import rateLimit from 'express-rate-limit';
import { readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { log4js } from './utils/log4js.js';
import { getAccessLogStream } from './utils/index.js';
import { formatErrorResponse } from './lib/api/utils/error.js';

// API Specs
import apiV1 from './lib/api/v1/index.js';
import apiAdmin from './lib/api/admin/index.js';

// Initialize Logger for App context
const logger = log4js.getLogger('[app]');

const app = express();

// Resolve __dirname for ESM
const __dirname = dirname(fileURLToPath(import.meta.url));
// Step out one level (from src/ or dist/) to the project root
const ROOT_DIR = join(__dirname, '..');
const SPECS_DIR = join(ROOT_DIR, 'src/lib/api/v1/specifications');
const PUBLIC_DIR = join(ROOT_DIR, 'public');

////////////////
// Rate Limiters
////////////////

// Global Rate Limit
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100,
  message: 'Rate Limit Reached, too many requests. Please try again later.',
  standardHeaders: 'draft-8',
});

// Authentication Rate Limit
const authLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  limit: 5,
  message: 'Rate Limit Reached. Do not continuously authenticate your Api Key.',
  standardHeaders: 'draft-8',
});

// Apply Rate Limiters
app.use('/', globalLimiter);
app.use('/identity/token', authLimiter);

////////////////
// Middleware
////////////////

// Body Parsers
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.text());
app.use(bodyParser.json());

// Logging Middleware
app.use(
  serverRequestLog('combined', {
    stream: getAccessLogStream(import.meta.url),
  }),
);
app.use(serverRequestLog('dev'));

////////////////
// Serve Spec Files (for the Spec Reader UI)
////////////////

// List all spec files
app.get('/api/specs', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const files = await readdir(SPECS_DIR);
    const specFiles = files.filter((f) => /\.(json|yaml|yml)$/.test(f));
    res.json(specFiles);
  } catch (err) {
    logger.error('Failed to read specifications directory:', err);
    next(err);
  }
});

// Serve individual spec files as static assets
app.use('/api/specs', express.static(SPECS_DIR));

// Serve the public directory so specs.html can be accessed directly
app.use(express.static(PUBLIC_DIR));

////////////////
// OpenAPI Validator
////////////////
app.use(eov.middleware(apiV1));
app.use(eov.middleware(apiAdmin));

////////////////
// Error Handling
////////////////

// 404 Catcher
app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: 'Not Found' });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const errorDetails = {
    httpStatusCode: err.httpStatusCode || err.status || 500,
    type: err.type || (err.status === 400 ? 'Validation Error' : 'Server Error'),
    code: err.code || err.status || 500,
    message: err.message,
    details: err.details || err.errors || null,
  };

  const [statusCode, response] = formatErrorResponse(errorDetails as any);
  res.status(statusCode).json(response);
});

export default app;
