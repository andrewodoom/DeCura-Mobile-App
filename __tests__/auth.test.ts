import { AuthApiError, AuthRetryableFetchError } from '@supabase/supabase-js';

import { requestCode, verifyCode } from '../src/data/auth';

const mockSignInWithOtp = jest.fn();
const mockVerifyOtp = jest.fn();

jest.mock('../src/data/client', () => ({
  supabase: () => ({ auth: { signInWithOtp: mockSignInWithOtp, verifyOtp: mockVerifyOtp } }),
}));

const notInvited = new AuthApiError('Signups not allowed for otp', 422, 'otp_disabled');
const rateLimited = new AuthApiError('Too many requests', 429, 'over_email_send_rate_limit');
const offline = new AuthRetryableFetchError('Failed to fetch', 0);

beforeEach(() => {
  mockSignInWithOtp.mockReset();
  mockVerifyOtp.mockReset();
});

describe('REQ-ACC-01b-T02 the app never creates an account', () => {
  it('asks for a code without account creation', async () => {
    mockSignInWithOtp.mockResolvedValue({ error: null });

    await requestCode('  owner@example.com ');

    expect(mockSignInWithOtp).toHaveBeenCalledWith({
      email: 'owner@example.com',
      options: { shouldCreateUser: false },
    });
  });
});

describe('REQ-ACC-01c-T02 the same result whether or not an account exists', () => {
  it('reports an address without an account exactly as one with an account', async () => {
    mockSignInWithOtp.mockResolvedValueOnce({ error: null });
    const invited = await requestCode('owner@example.com');
    mockSignInWithOtp.mockResolvedValueOnce({ error: notInvited });
    const uninvited = await requestCode('stranger@example.com');

    expect(uninvited).toEqual(invited);
    expect(invited).toEqual({ ok: true });
  });

  it('reports rate limits and lost connections, which say nothing about the account', async () => {
    mockSignInWithOtp.mockResolvedValueOnce({ error: rateLimited });
    expect(await requestCode('owner@example.com')).toEqual({ ok: false, reason: 'rate_limited' });

    mockSignInWithOtp.mockResolvedValueOnce({ error: offline });
    expect(await requestCode('owner@example.com')).toEqual({ ok: false, reason: 'network' });
  });
});

describe('REQ-ACC-01a-T02 verifying a six-digit code', () => {
  it('verifies the code as an email one-time code', async () => {
    mockVerifyOtp.mockResolvedValue({ error: null });

    expect(await verifyCode('owner@example.com', '123456')).toEqual({ ok: true });
    expect(mockVerifyOtp).toHaveBeenCalledWith({ email: 'owner@example.com', token: '123456', type: 'email' });
  });

  it.each([
    [new AuthApiError('Token has expired or is invalid', 403, 'otp_expired'), 'invalid_code'],
    [rateLimited, 'rate_limited'],
    [offline, 'network'],
  ])('maps %p to %s', async (error, reason) => {
    mockVerifyOtp.mockResolvedValue({ error });

    expect(await verifyCode('owner@example.com', '123456')).toEqual({ ok: false, reason });
  });
});
