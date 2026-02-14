import dotenv from "dotenv";

dotenv.config();

/**
 * Application Configuration
 * Centralized config management
 */

export const config = {
  // Server
  port: parseInt(process.env.PORT || "5000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  isDev: process.env.NODE_ENV === "development",
  isProd: process.env.NODE_ENV === "production",

  // Database
  database: {
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432", 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
  },

  // JWT
  jwt: {
    secret: (process.env.JWT_SECRET || "your_super_secret_jwt_key") as string,
    expiry: (process.env.JWT_EXPIRY || "7d") as string,
    refreshExpiry: "30d" as string,
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  },

  // Redis (for caching and real-time)
  redis: {
    url: process.env.REDIS_URL,
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
  },

  // Socket.io
  socketIo: {
    cors: {
      origin: process.env.SOCKET_IO_CORS_ORIGIN || "http://localhost:3000",
    },
  },

  // Typing test
  typing: {
    minWPM: 0,
    maxWPM: 300,
    minAccuracy: 0,
    maxAccuracy: 100,
  },

  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
  },
};

export default config;
