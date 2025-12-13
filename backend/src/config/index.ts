import dotenv from "dotenv";
dotenv.config();

export default {
  port: process.env.PORT || 4000,
  databaseUrl: process.env.DATABASE_URL!,
  redisUrl: process.env.REDIS_URL || "redis://127.0.0.1:6379",
  bullPrefix: process.env.BULL_PREFIX || "flow",
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
};
