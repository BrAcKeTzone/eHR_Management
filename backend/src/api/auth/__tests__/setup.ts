import { PrismaClient } from "@prisma/client";
import { beforeAll, afterAll } from "vitest";

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
if (!testDatabaseUrl) {
  throw new Error("TEST_DATABASE_URL environment variable is not set");
}

// Create a new PrismaClient instance with the test database URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: testDatabaseUrl,
    },
  },
});

export const setupTestDb = () => {
  beforeAll(async () => {
    try {
      // Clean up database before tests
      await prisma.$executeRaw`DROP TABLE IF EXISTS User CASCADE`;

      // Run migrations using prisma migrate
      const { execSync } = require("child_process");
      execSync("npx prisma migrate deploy", {
        stdio: "inherit",
        env: { ...process.env, DATABASE_URL: testDatabaseUrl },
      });
    } catch (error) {
      console.error("Test database setup failed:", error);
      throw error;
    }
  });

  afterAll(async () => {
    // Clean up after tests
    await prisma.$executeRaw`DROP TABLE IF EXISTS User CASCADE`;
    await prisma.$disconnect();
  });
};

export { prisma };
