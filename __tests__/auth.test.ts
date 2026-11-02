import { AuthApiError, AuthRetryableFetchError } from '@supabase/supabase-js';

import { requestCode, verifyCode } from '../src/data/auth';

const mockSignInWithOtp = jest.fn();
const mockVerifyOtp = jest.fn();

jest.mock('../src/data/client', () => ({
  supabase: () => ({ auth: { signInWithOtp: mockSignInWithOtp, verifyOtp: mockVerifyOtp } }),
}));

const notInvited = new AuthApiError('Signups not allowed for otp', 422, 'otp_disabled');
const emailSendLimit = new AuthApiError('For security purposes, you can only request this after 60 seconds.', 429, 'over_email_send_rate_limit');
const requestLimit = new AuthApiError('Request rate limit reached', 429, 'over_request_rate_limit');
const serverError = new AuthApiError('Internal server error', 500, 'unexpected_failure');
const offline = new AuthRetryableFetchError('Failed to fetch', 0);

beforeEach(() => {
  mockSignInWithOtp.mockReset();
  mockVerifyOtp.mockReset();
});

describe('REQ-ACC-01b-T02 the app never creates an account (app side)', () => {
  it('asks for a code without account creation', async () => {
    mockSignInWithOtp.mockResolvedValue({ error: null });

    await requestCode('  owner@example.com ');

    expect(mockSignInWithOtp).toHaveBeenCalledWith({
      email: 'owner@example.com',
      options: { shouldCreateUser: false },
    });
  });
});

describe('REQ-ACC-01c-T02 the app shows the same result whether or not an account exists (app side)', () => {
  it('reports an address without an account exactly as one with an account', async () => {
    mockSignInWithOtp.mockResolvedValueOnce({ error: null });
    const invited = await requestCode('owner@example.com');
    mockSignInWithOtp.mockResolvedValueOnce({ error: notInvited });
    const uninvited = await requestCode('stranger@example.com');

    expect(uninvited).toEqual(invited);
    expect(invited).toEqual({ ok: true });
  });

  it('gives the same results for two requests in a row, invited or not', async () => {
    // Supabase limits repeat sends only for addresses with an account.
    mockSignInWithOtp.mockResolvedValueOnce({ error: null }).mockResolvedValueOnce({ error: emailSendLimit });
    const invited = [await requestCode('owner@example.com'), await requestCode('owner@example.com')];
    mockSignInWithOtp.mockResolvedValueOnce({ error: notInvited }).mockResolvedValueOnce({ error: notInvited });
    const uninvited = [await requestCode('stranger@example.com'), await requestCode('stranger@example.com')];

    expect(invited).toEqual(uninvited);
  });

  it.each([
    ['a request-rate limit', requestLimit, 'rate_limited'],
    ['a lost connection', offline, 'network'],
    ['a server error', serverError, 'unavailable'],
  ])('reports %s, which says nothing about the account', async (_case, error, reason) => {
    mockSignInWithOtp.mockResolvedValueOnce({ error });

    expect(await requestCode('owner@example.com')).toEqual({ ok: false, reason });
  });

  it('reports a failure that is not from Supabase Auth as unavailable', async () => {
    mockSignInWithOtp.mockRejectedValueOnce(new Error('Storage failed'));

    expect(await requestCode('owner@example.com')).toEqual({ ok: false, reason: 'unavailable' });
  });
});

describe('REQ-ACC-01a-T02 verifying a six-digit code', () => {
  it('verifies the code as an email one-time code', async () => {
    mockVerifyOtp.mockResolvedValue({ error: null });

    expect(await verifyCode('owner@example.com', '123456')).toEqual({ ok: true });
    expect(mockVerifyOtp).toHaveBeenCalledWith({ email: 'owner@example.com', token: '123456', type: 'email' });
  });

  it.each([
    ['an expired or wrong code', new AuthApiError('Token has expired or is invalid', 403, 'otp_expired'), 'invalid_code'],
    ['a rate limit', requestLimit, 'rate_limited'],
    ['a lost connection', offline, 'network'],
    ['a server error', serverError, 'unavailable'],
  ])('maps %s to %s', async (_case, error, reason) => {
    mockVerifyOtp.mockResolvedValue({ error });

    expect(await verifyCode('owner@example.com', '123456')).toEqual({ ok: false, reason });
  });

  it('reports a failure to store the session as unavailable, not as a wrong code', async () => {
    mockVerifyOtp.mockRejectedValue(new Error('Keychain locked'));

    expect(await verifyCode('owner@example.com', '123456')).toEqual({ ok: false, reason: 'unavailable' });
  });
});
