import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    // Look up user without revealing existence
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, email: true },
    });

    if (user) {
      // Clean up previous tokens for this email
      await prisma.passwordResetToken.deleteMany({
        where: { email: normalizedEmail },
      });

      // Generate secure random token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiration

      // Store token in database
      await prisma.passwordResetToken.create({
        data: {
          email: normalizedEmail,
          token: resetToken,
          expiresAt,
        },
      });

      // Note: In production with email provider configured (e.g., Resend, SendGrid),
      // we would dispatch the email here with a link like:
      // `${process.env.AUTH_URL}/reset-password?token=${resetToken}`
    }

    // Always return generic success to prevent email enumeration
    return NextResponse.json(
      {
        success: true,
        message: 'If an account exists with that email address, password reset instructions have been sent.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}
