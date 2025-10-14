"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = exports.setupTestDb = void 0;
const client_1 = require("@prisma/client");
const vitest_1 = require("vitest");
const testDatabaseUrl = process.env.TEST_DATABASE_URL;
if (!testDatabaseUrl) {
    throw new Error("TEST_DATABASE_URL environment variable is not set");
}
// Create a new PrismaClient instance with the test database URL
const prisma = new client_1.PrismaClient({
    datasources: {
        db: {
            url: testDatabaseUrl,
        },
    },
});
exports.prisma = prisma;
const setupTestDb = () => {
    (0, vitest_1.beforeAll)(async () => {
        try {
            // Clean up database before tests
            await prisma.$executeRaw `DROP TABLE IF EXISTS User CASCADE`;
            // Run migrations using prisma migrate
            const { execSync } = require("child_process");
            execSync("npx prisma migrate deploy", {
                stdio: "inherit",
                env: { ...process.env, DATABASE_URL: testDatabaseUrl },
            });
        }
        catch (error) {
            console.error("Test database setup failed:", error);
            throw error;
        }
    });
    (0, vitest_1.afterAll)(async () => {
        // Clean up after tests
        await prisma.$executeRaw `DROP TABLE IF EXISTS User CASCADE`;
        await prisma.$disconnect();
    });
};
exports.setupTestDb = setupTestDb;
//# sourceMappingURL=setup.js.map