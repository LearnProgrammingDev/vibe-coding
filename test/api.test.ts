import { describe, it, expect, afterAll } from "bun:test";
import { app } from "../src/index";
import { db } from "../src/db";
import { users, session } from "../src/db/schema";
import { eq, or } from "drizzle-orm";

const rnd = Math.floor(Math.random() * 100000);
const testUser = {
  name: "John Doe UnitTester",
  email: `unittest_${rnd}@example.com`,
  password: "password123"
};

let userToken: string;

describe("Unit Testing Backend API - Bun Test", () => {
  afterAll(async () => {
    // Cleanup DB: remove test user and sessions
    const [user] = await db.select().from(users).where(eq(users.email, testUser.email));
    if (user) {
      await db.delete(users).where(eq(users.id, user.id));
    }
    // Just in case the long name user was created (should fail, but safe cleanup)
    const longEmail = `longname_${rnd}@example.com`;
    const [u2] = await db.select().from(users).where(eq(users.email, longEmail));
    if(u2) {
      await db.delete(users).where(eq(users.id, u2.id));
    }
  });

  describe("1. POST /api/v1/auth/register", () => {
    it("should fail when body is missing parameters", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/v1/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: "invalid@example.com" })
        })
      );
      expect(response.status).toBe(422);
    });

    it("should successfully register a new user", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/v1/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(testUser)
        })
      );
      
      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.status).toBe("success");
      expect(data.data.email).toBe(testUser.email);
    });

    it("should fail when registering with an existing email", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/v1/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(testUser)
        })
      );
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.message).toBe("User already exists");
    });

    it("should fail when name exceeds maximum length", async () => {
      const longNameUser = {
        name: "A".repeat(300),
        email: `longname_${rnd}@example.com`,
        password: "pass"
      };
      const response = await app.handle(
        new Request("http://localhost/api/v1/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(longNameUser)
        })
      );
      expect(response.status).toBe(422); // Elysia validation error
      const text = await response.text();
      expect(text).toContain("Nama tidak boleh melebihi 255 karakter");
    });
  });

  describe("2. POST /api/v1/auth/login", () => {
    it("should fail with non-existent email", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/v1/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: "noexist@example.com", password: "p12" })
        })
      );
      expect(response.status).toBe(400);
    });

    it("should fail with wrong password", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/v1/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: testUser.email, password: "wrongpassword" })
        })
      );
      expect(response.status).toBe(400);
    });

    it("should successfully log in and return token", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/v1/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: testUser.email, password: testUser.password })
        })
      );
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.status).toBe("success");
      expect(data.data.token).toBeDefined();
      userToken = data.data.token;
    });
  });

  describe("3. GET /api/v1/users/me", () => {
    it("should fail without authorization header", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/v1/users/me", { method: "GET" })
      );
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.message).toBe("an authorization header is missing or invalid");
    });

    it("should fail with a false token", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/v1/users/me", {
          method: "GET",
          headers: { "Authorization": "Bearer invalid-fake-token" }
        })
      );
      expect(response.status).toBe(401);
    });

    it("should return correct user details with valid token", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/v1/users/me", {
          method: "GET",
          headers: { "Authorization": `Bearer ${userToken}` }
        })
      );
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.status).toBe("success");
      expect(data.data.email).toBe(testUser.email);
    });
  });

  describe("4. DELETE /api/v1/users/logout", () => {
    it("should successfully log out using token", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/v1/users/logout", {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${userToken}` }
        })
      );
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data).toBe("ok");
    });

    it("should explicitly reject profile access after logout", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/v1/users/me", {
          method: "GET",
          headers: { "Authorization": `Bearer ${userToken}` }
        })
      );
      expect(response.status).toBe(401);
    });
  });
});
