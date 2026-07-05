// Ensures required env vars exist during tests, without needing a real .env file
process.env.JWT_SECRET = process.env.JWT_SECRET || "test_jwt_secret_key_for_ci";
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
process.env.CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
