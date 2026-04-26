'use strict';

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));

// Loads main specification file
const apiSpec = join(__dirname, 'specifications/openapi.yaml');

export default {
  apiSpec,
  validateResponses: true, // default false
  // The base path to the operation handlers directory
  operationHandlers: join(__dirname, 'routes'), // default false
};
