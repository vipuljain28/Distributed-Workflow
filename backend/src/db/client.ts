import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

if (process.env.NODE_ENV === "test") {
  // Replace at runtime in tests
}