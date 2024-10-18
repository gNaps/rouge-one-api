import { PrismaClient } from "@prisma/client";

if (!(global as any).prisma) {
  (global as any).prisma = new PrismaClient();
}
export default (global as any).prisma as PrismaClient;
