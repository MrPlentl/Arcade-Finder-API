// import env from "../../../utils/environment.js";

// @TODO Remove
export function sampleMiddleware(req: any, res: any, next: any) {
  console.log('Sample middleware called');
  res.setHeader('Content-Type', 'application/json');
  next(); // Ensure next() is called
}

/**
 *
 *
 */
export function setStdRespHeaders(req: any, res: any, next: any) {
  console.log('setStdRespHeaders');
  res.setHeader('Content-Type', 'application/json');
  next();
}
