// Dummy configuration so the app can be imported in tests (no real services are contacted).
process.env.NODE_ENV = "test";
process.env.MONGO_URI = "mongodb://127.0.0.1:1/lms-test";
process.env.JWT_SECRET = "test-secret-test-secret-test-secret-123";
process.env.STRIPE_SECRET_KEY = "sk_test_dummy";
process.env.FRONTEND_URL = "http://localhost:5173";
