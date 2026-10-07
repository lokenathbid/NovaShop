import { PrismaClient } from './generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const globalForPrisma = globalThis as unknown as {
  prisma: InstanceType<typeof PrismaClient> | undefined;
};

const createPrismaClient = () => {
  const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);
  return new PrismaClient({ adapter });
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
