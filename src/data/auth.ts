// Sign-in by email and a six-digit one-time code (REQ-ACC-01a). Accounts are
// never created from the app: only invited addresses have one (REQ-ACC-01b).

import { isAuthApiError, isAuthRetryableFetchError } from '@supabase/supabase-js';

import { supabase } from './client';

export const CODE_LENGTH = 6;

export type AuthFailure = 'rate_limited' | 'network' | 'rejected';

export type RequestCodeResult = { ok: true } | { ok: false; reason: 'rate_limited' | 'network' };

export type VerifyCodeResult = { ok: true } | { ok: false; reason: 'invalid_code' | 'rate_limited' | 'network' };

export type SignedInUser = { email: string | null };

const RATE_LIMIT_CODES = new Set(['over_request_rate_limit', 'over_email_send_rate_limit']);

export function classifyAuthError(error: unknown): AuthFailure {
  if (isAuthRetryableFetchError(error)) {
    return 'network';
  }
  if (isAuthApiError(error) && (error.status === 429 || RATE_LIMIT_CODES.has(error.code ?? ''))) {
    return 'rate_limited';
  }
  return 'rejected';
}

export function isWellFormedEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isWellFormedCode(code: string): boolean {
  return new RegExp(`^\\d{${CODE_LENGTH}}$`).test(code);
}

// REQ-ACC-01c: the result is the same whether or not the address has an
// account. A refusal (for example "Signups not allowed") is reported as sent.
export async function requestCode(email: string): Promise<RequestCodeResult> {
  const { error } = await supabase().auth.signInWithOtp({
    email: email.trim(),
    options: { shouldCreateUser: false },
  });
  if (!error) {
    return { ok: true };
  }
  const failure = classifyAuthError(error);
  return failure === 'rejected' ? { ok: true } : { ok: false, reason: failure };
}

export async function verifyCode(email: string, code: string): Promise<VerifyCodeResult> {
  const { error } = await supabase().auth.verifyOtp({ email: email.trim(), token: code, type: 'email' });
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
