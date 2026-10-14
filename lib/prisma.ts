import { PrismaClient } from './generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const globalForPrisma = globalThis as unknown as {
  prisma: InstanceType<typeof PrismaClient> | undefined;
};

const getDatabaseUrl = () => {
  const urlStr = process.env.DATABASE_URL;
  if (!urlStr) return '';
  try {
    const url = new URL(urlStr);
    if (!url.searchParams.has('allowPublicKeyRetrieval')) {
      url.searchParams.set('allowPublicKeyRetrieval', 'true');
    }
    return url.toString();
  } catch {
    return urlStr;
  }
};

const createPrismaClient = () => {
  const connectionUrl = getDatabaseUrl();
  const adapter = new PrismaMariaDb(connectionUrl);
  return new PrismaClient({ adapter });
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
