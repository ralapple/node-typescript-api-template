import { PrismaClient } from '../../generated/prisma';
import { IDatabaseConnection } from './IDatabaseConnection';
import { ILogger } from '../util/ILogger';

/**
 * Database connection object for accessing data.
 */
export class DatabaseConnection implements IDatabaseConnection {
    private prisma: PrismaClient;
    private logger: ILogger;

    constructor(logger: ILogger) {
        this.logger = logger;
        this.prisma = new PrismaClient();
    }

    /**
     * Tests the connection to the database.
     * @returns True or false depending on if connection was success.
     */
    async testConnection(): Promise<boolean> {
        try {
            await this.prisma.$queryRaw`SELECT 1`;
            return true;
        } catch (e) {
            console.error('Failed to connect:', e);
            return false;
        }
    }

    /**
     * Returns the database connection client.
     * @returns The prisma client.
     */
    getConnection(): PrismaClient {
        return this.prisma;
    }
}