import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export interface AuthenticatedUser {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
}

/**
 * Returns the current authenticated session, or null if unauthenticated.
 */
export async function getAuthSession() {
  return await auth();
}

/**
 * Returns the current authenticated user from the session, or null if unauthenticated.
 * NEVER trust user ID provided by client; use this helper to get the verified ID.
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  return {
    id: session.user.id,
    name: session.user.name ?? null,
    email: session.user.email ?? null,
    role: session.user.role ?? 'customer',
  };
}

/**
 * Server-side guard: requires the user to be authenticated.
 * If not authenticated, redirects to /login?callbackUrl=... (or custom path).
 */
export async function requireAuth(callbackUrl?: string): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser();
  if (!user) {
    const redirectUrl = callbackUrl
      ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
      : '/login';
    redirect(redirectUrl);
  }
  return user;
}

/**
 * Retrieves the full user record from the database for the authenticated user.
 * Sensitive fields like password hash are strictly excluded.
 */
export async function getAuthenticatedUserProfile() {
  const authUser = await getAuthenticatedUser();
  if (!authUser) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatar: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      addresses: true,
      orders: {
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
        },
      },
    },
  });

  return user;
}
