import { describe, it, expect, beforeEach, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../../../app";
import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL,
    },
  },
});

// Example test user data with unique email for each test
const createTestUser = () => ({
  name: "Test Applicant",
  email: `testapplicant${Date.now()}@example.com`,
  password: "TestPassword123",
  phone: "+1234567890",
});

// Helper function to complete OTP verification for testing
const completeOTPVerification = async (email: string) => {
  // For testing, we'll create a verified OTP record directly
  await prisma.otp.create({
    data: {
      email,
      otp: "123456",
      verified: true,
      createdAt: new Date(Date.now() + 10 * 60 * 1000), // Valid for 10 minutes
    },
  });
};

describe("Auth API", () => {
  beforeAll(async () => {
    try {
      // Push schema to test database
      execSync("npx prisma db push", {
        env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL },
      });

      // Create a new database connection
      await prisma.$connect();
    } catch (error) {
      console.error("Database setup failed:", error);
      throw error;
    }
  });

  // Clean up before each test using Prisma's built-in methods
  beforeEach(async () => {
    try {
      await prisma.otp.deleteMany();
      await prisma.user.deleteMany();
    } catch (error) {
      console.error("Test cleanup failed:", error);
    }
  });

  afterAll(async () => {
    try {
      await prisma.otp.deleteMany();
      await prisma.user.deleteMany();
      await prisma.$disconnect();
    } catch (error) {
      console.error("Test cleanup failed:", error);
    }
  });

  it("should register a new applicant with OTP verification", async () => {
    const testUser = createTestUser();

    // Complete OTP verification (simulating verified email)
    await completeOTPVerification(testUser.email);

    const res = await request(app).post("/api/auth/register").send(testUser);

    if (res.status !== 201) {
      console.error("Registration failed:", res.body);
    }

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty("user");
    expect(res.body.data).toHaveProperty("token");
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.body.data.user.role).toBe("APPLICANT");
  });

  it("should not register without OTP verification", async () => {
    const testUser = createTestUser();

    const res = await request(app).post("/api/auth/register").send(testUser);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe(
      "Email not verified. Please verify your email with OTP first."
    );
  });

  it("should login with correct credentials", async () => {
    const testUser = createTestUser();

    // Complete OTP verification and register user
    await completeOTPVerification(testUser.email);
    await request(app).post("/api/auth/register").send(testUser);

    // Then try to login
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: testUser.email, password: testUser.password });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("user");
    expect(res.body.data).toHaveProperty("token");
    expect(res.body.data.user.email).toBe(testUser.email);
  });

  it("should not login with wrong password", async () => {
    const testUser = createTestUser();

    // Complete OTP verification and register user
    await completeOTPVerification(testUser.email);
    await request(app).post("/api/auth/register").send(testUser);

    // Then try to login with wrong password
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: testUser.email, password: "WrongPassword" });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Incorrect email or password");
  });

  it("should not login with non-existent user", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nonexistent@example.com", password: "password123" });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Incorrect email or password");
  });

  it("should send OTP for email verification", async () => {
    const testEmail = `test${Date.now()}@example.com`;

    const res = await request(app)
      .post("/api/auth/send-otp")
      .send({ email: testEmail });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("message");
    expect(res.body.data.message).toBe("OTP sent to your email.");
  });

  it("should not send OTP for existing user", async () => {
    const testUser = createTestUser();

    // Complete OTP verification and register user
    await completeOTPVerification(testUser.email);
    await request(app).post("/api/auth/register").send(testUser);

    // Try to send OTP for existing user
    const res = await request(app)
      .post("/api/auth/send-otp")
      .send({ email: testUser.email });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("User with this email already exists");
  });
});
