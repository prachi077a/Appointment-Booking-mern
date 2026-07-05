const request = require("supertest");
const app = require("../app");
const { connect, closeDatabase, clearDatabase } = require("./testDb");

beforeAll(async () => await connect());
afterEach(async () => await clearDatabase());
afterAll(async () => await closeDatabase());

describe("POST /api/auth/register", () => {
  it("creates a new patient account and returns a token", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test Patient",
      email: "patient@test.com",
      password: "password123",
    });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe("patient@test.com");
    expect(res.body.user.role).toBe("patient"); // default role
    expect(res.body.user.password).toBeUndefined(); // never leak the hash
  });

  it("rejects duplicate emails", async () => {
    await request(app).post("/api/auth/register").send({
      name: "First",
      email: "duplicate@test.com",
      password: "password123",
    });

    const res = await request(app).post("/api/auth/register").send({
      name: "Second",
      email: "duplicate@test.com",
      password: "password123",
    });

    expect(res.status).toBe(409);
  });

  it("does not allow self-registering as admin", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Sneaky",
      email: "sneaky@test.com",
      password: "password123",
      role: "admin",
    });

    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe("patient"); // silently downgraded
  });
});

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    await request(app).post("/api/auth/register").send({
      name: "Login Test",
      email: "login@test.com",
      password: "correctpassword",
    });
  });

  it("logs in with correct credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "login@test.com",
      password: "correctpassword",
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it("rejects incorrect password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "login@test.com",
      password: "wrongpassword",
    });

    expect(res.status).toBe(401);
  });
});

describe("GET /api/auth/me", () => {
  it("rejects requests with no token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("returns the logged-in user's info with a valid token", async () => {
    const registerRes = await request(app).post("/api/auth/register").send({
      name: "Me Test",
      email: "me@test.com",
      password: "password123",
    });

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${registerRes.body.token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("me@test.com");
  });
});
