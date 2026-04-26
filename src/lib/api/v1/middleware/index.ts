import { Request, Response, NextFunction } from 'express';

// import env from "../../../utils/environment.js";

// @TODO Remove
export function sampleMiddleware(req: Request, res: Response, next: NextFunction) {
  console.log('Sample middleware called');
  res.setHeader('Content-Type', 'application/json');
  next(); // Ensure next() is called
}

/**
 *
 *
 */
export function setStdRespHeaders(req: Request, res: Response, next: NextFunction) {
  res.setHeader('Content-Type', 'application/json');
  next();
}
