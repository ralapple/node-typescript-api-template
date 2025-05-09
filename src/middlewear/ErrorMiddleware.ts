import { ExpressErrorMiddlewareInterface } from 'routing-controllers';
import { Request, Response, NextFunction } from 'express';
import { Service } from 'typedi';
import { ILogger, LoggerToken } from '../util/ILogger';
import { Inject } from 'typedi';

/**
 * Global middleware for handling uncaught errors and formatting the response.
 */
@Service()
export class ErrorMiddleware implements ExpressErrorMiddlewareInterface {
    constructor(@Inject(LoggerToken) private logger: ILogger) { }

    /**
     * Handles unhandled exceptions and formats the error response.
     * @param error The caught error.
     * @param request The incoming request.
     * @param response The outgoing response.
     * @param next The next handler (ignored in this middleware).
     */
    async error(error: any, request: Request, response: Response, next: NextFunction): Promise<void> {
        const requestId = (request as any).requestId || 'unknown';
        const statusCode = error.httpCode || 500;
        const message = error.message || 'Internal Server Error';

        this.logger.error(`Error [${requestId}] ${request.method} ${request.originalUrl} | Status: ${statusCode} | Message: ${message} | Stack: ${error.stack || 'n/a'}`);

        response.status(statusCode).json({
            success: false,
            status: statusCode,
            message,
        });
    }
}
