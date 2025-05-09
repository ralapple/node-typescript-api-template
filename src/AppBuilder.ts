// AppBuilder.ts
import express, { Express } from 'express';
import rateLimit from 'express-rate-limit';
import { App } from './app';
import 'reflect-metadata';
import { Container } from 'typedi';
import { useExpressServer, useContainer as rcUseContainer } from 'routing-controllers';

import { IDatabaseConnection } from './db/IDatabaseConnection';
import { DatabaseConnection } from './db/DatabaseConnection';
import { ILogger, LoggerToken } from './util/ILogger';

import { UserController } from './controller/UserController';
import { AuthMiddleware } from './middlewear/AuthMiddleware';
import { AuthService } from './service/AuthService';
import { LoggingMiddleware } from './middlewear/LoggingMiddleware';
import { ErrorMiddleware } from './middlewear/ErrorMiddleware';



export class AppBuilder {
    private server: Express;
    private logger?: ILogger;

    constructor() {
        this.server = express();
    }

    /**
     * Inject your own logger implementation.
     */
    public withLogger(logger: ILogger): AppBuilder {
        this.logger = logger;
        Container.set(LoggerToken, logger);
        return this;
    }

    /**
     * Adds database to the application.
     * @returns this
     */
    public withDatabase(): AppBuilder {
        this.logger.info("Generating database connection.");
        Container.set(DatabaseConnection, new DatabaseConnection(this.logger));
        return this;
    }

    public withAuth(): AppBuilder {
        this.logger.info("Attaching auth to application.");
        var auth = new AuthService(this.logger);
        Container.set(AuthService, auth);
        return this;
    }

    /**
     * Adds middlewear to the app.
     * @returns this
     */
    public withMiddleware(): AppBuilder {
        if (!this.logger){
            throw new Error("Trying to generate middlewear without logging functionality.");
        }

        this.logger.info("Attaching middlewear.");
        this.server.use(express.json({ limit: '1mb' }));
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000,
            max: 100,
            standardHeaders: true,
            legacyHeaders: false,
            message: 'Too many requests, try again later',
        });
        this.server.use(limiter);

        // hide Express header
        this.server.disable('x-powered-by');
        return this;
    }

    /**
     * Maps the controllers to the server.
     * @returns this.
     */
    public withController(): AppBuilder {
        this.logger.info("Attaching controllers.")
        rcUseContainer(Container);
        useExpressServer(this.server, {
            controllers: [UserController],
            middlewares: [LoggingMiddleware, AuthMiddleware, ErrorMiddleware],
        });
        return this;
    }

    /**
     * Getter for builder logger.
     * @returns the logger
     */
    public getLogger(): ILogger {
        return this.logger;
    }

    /**
     * Getter for the database.
     * @returns builder database.
     */
    public getDatabase(): IDatabaseConnection {
        return Container.get(DatabaseConnection);
    }

    /**
     * Getter for the server.
     * @returns builder server.
     */
    public getServer(): Express {
        return this.server;
    }

    /**
     * Build function to finally create the App.
     * @returns App
     */
    public build(): App {
        this.logger.info("Building App.");
        this.getDatabase().testConnection();
        return new App(this)
    }
}
