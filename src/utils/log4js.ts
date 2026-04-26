import pkgLog4js from 'log4js';
import { log4jsConfig } from '../config/log4js-config.js';

export const log4js = pkgLog4js.configure(log4jsConfig);

// # Documentation
// const logger = log4js.getLogger("[index]");
// logger.trace("Entering cheese testing");
// logger.debug("Got cheese.");
// logger.info("Cheese is Comté.");
// logger.warn("Cheese is quite smelly.");
// logger.error("Cheese is too ripe!");
// logger.fatal("Cheese was breeding ground for listeria.");
