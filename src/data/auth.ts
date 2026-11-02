// Sign-in by email and a six-digit one-time code (REQ-ACC-01a). Accounts are
// never created from the app: only invited addresses have one (REQ-ACC-01b).

import { isAuthApiError, isAuthRetryableFetchError } from '@supabase/supabase-js';

import { supabase } from './client';

export const CODE_LENGTH = 6;

// Must match "Email OTP expiration" (600 seconds) on each hosted project
// (docs/environments.md, REQ-ACC-01c).
export const CODE_EXPIRY_MINUTES = 10;

export type AuthFailure = 'rate_limited' | 'network' | 'unavailable' | 'rejected';

export type RequestCodeResult = { ok: true } | { ok: false; reason: 'rate_limited' | 'network' | 'unavailable' };

export type VerifyCodeResult =
  | { ok: true }
  | { ok: false; reason: 'invalid_code' | 'rate_limited' | 'network' | 'unavailable' };

export type SignedInUser = { email: string | null };

// Supabase applies this limit only when it actually sends an email, so only to
// addresses with an account. Reporting it would reveal who is invited.
const EMAIL_SEND_LIMIT = 'over_email_send_rate_limit';

export function classifyAuthError(error: unknown): AuthFailure {
  if (isAuthRetryableFetchError(error)) {
    return 'network';
  }
  if (isAuthApiError(error)) {
    if (error.status === 429 || error.code === 'over_request_rate_limit' || error.code === EMAIL_SEND_LIMIT) {
      return 'rate_limited';
    }
    if (error.status >= 500) {
      return 'unavailable';
    }
    return 'rejected';
  }
  // Not an error from Supabase Auth, for example a failure to store the session.
  return 'unavailable';
}

export function isWellFormedEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isWellFormedCode(code: string): boolean {
  return new RegExp(`^\\d{${CODE_LENGTH}}$`).test(code);
}

async function authError(call: () => Promise<{ error: unknown }>): Promise<unknown> {
  try {
    return (await call()).error;
  } catch (error) {
    return error;
  }
}

// REQ-ACC-01c, app side: the result is the same whether or not the address has
// an account. A refusal ("Signups not allowed") and the email-send limit are
// both reported as sent. Network, server and request-rate failures say nothing
// about the account. The server side, where a direct call to Supabase still
// differs, is closed by the invite-list change.
export async function requestCode(email: string): Promise<RequestCodeResult> {
  const error = await authError(() =>
    supabase().auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: false } }),
  );
  if (!error || (isAuthApiError(error) && error.code === EMAIL_SEND_LIMIT)) {
    return { ok: true };
  }
  const failure = classifyAuthError(error);
  return failure === 'rejected' ? { ok: true } : { ok: false, reason: failure };
}

export async function verifyCode(email: string, code: string): Promise<VerifyCodeResult> {
  const error = await authError(() => supabase().auth.verifyOtp({ email: email.trim(), token: code, type: 'email' }));
  if (!error) {
    return { ok: true };
  }
  const failure = classifyAuthError(error);
  return { ok: false, reason: failure === 'rejected' ? 'invalid_code' : failure };
}

// Calls the listener with the current user straight away, then on every change.
export function subscribeToUser(listener: (user: SignedInUser | null) => void): () => void {
  const { data } = supabase().auth.onAuthStateChange((_event, session) => {
    listener(session ? { email: session.user.email ?? null } : null);
  });
  return () => data.subscription.unsubscribe();
}
