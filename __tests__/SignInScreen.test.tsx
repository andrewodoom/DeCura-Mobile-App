import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';

import { SignInScreen } from '../src/auth/SignInScreen';
import { requestCode, verifyCode } from '../src/data/auth';

jest.mock('../src/data/auth', () => ({
  ...jest.requireActual('../src/data/auth'),
  requestCode: jest.fn(),
  verifyCode: jest.fn(),
}));

jest.mock('../src/data/client', () => ({ supabase: jest.fn() }));

const mockedRequestCode = jest.mocked(requestCode);
const mockedVerifyCode = jest.mocked(verifyCode);

const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});

beforeEach(() => {
  mockedRequestCode.mockReset();
  mockedVerifyCode.mockReset();
  announce.mockClear();
});

async function reachCodeStep() {
  mockedRequestCode.mockResolvedValue({ ok: true });
  await render(<SignInScreen />);
  await fireEvent.changeText(screen.getByLabelText('Email address'), 'owner@example.com');
  await fireEvent.press(screen.getByRole('button', { name: 'Send code' }));
  await screen.findByText('Check your email');
}

describe('REQ-ACC-01a-T03 sign-in screen: email, then a six-digit code', () => {
  it('asks for a well-formed email address before sending', async () => {
    await render(<SignInScreen />);
    await fireEvent.changeText(screen.getByLabelText('Email address'), 'not-an-address');
    await fireEvent.press(screen.getByRole('button', { name: 'Send code' }));

    expect(await screen.findByText('Enter a valid email address.')).toBeOnTheScreen();
    expect(mockedRequestCode).not.toHaveBeenCalled();
  });

  it('moves to the code step with wording that does not reveal whether the address is invited', async () => {
    await reachCodeStep();

    expect(screen.getByText(/If owner@example.com has been invited/)).toBeOnTheScreen();
    expect(screen.queryByText(/password/i)).toBeNull();
  });

  it('accepts digits only, up to six', async () => {
    await reachCodeStep();
    const field = screen.getByLabelText('6-digit code');

    await fireEvent.changeText(field, '12a34 5678');

    expect(field.props.value).toBe('123456');
  });

  it('sends the typed code for verification', async () => {
    mockedVerifyCode.mockResolvedValue({ ok: true });
    await reachCodeStep();

    await fireEvent.changeText(screen.getByLabelText('6-digit code'), '123456');
    await fireEvent.press(screen.getByRole('button', { name: 'Sign in' }));

    await screen.findByRole('button', { name: 'Sign in' });
    expect(mockedVerifyCode).toHaveBeenCalledWith('owner@example.com', '123456');
  });

  it('does not send an incomplete code', async () => {
    await reachCodeStep();

    await fireEvent.changeText(screen.getByLabelText('6-digit code'), '123');
    await fireEvent.press(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Enter the 6-digit code from the email.')).toBeOnTheScreen();
    expect(mockedVerifyCode).not.toHaveBeenCalled();
  });

  it('explains a wrong or expired code', async () => {
    mockedVerifyCode.mockResolvedValue({ ok: false, reason: 'invalid_code' });
    await reachCodeStep();

    await fireEvent.changeText(screen.getByLabelText('6-digit code'), '000000');
    await fireEvent.press(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/not right or has expired/);
  });

  it('explains a lost connection on the email step', async () => {
    mockedRequestCode.mockResolvedValue({ ok: false, reason: 'network' });
    await render(<SignInScreen />);

    await fireEvent.changeText(screen.getByLabelText('Email address'), 'owner@example.com');
    await fireEvent.press(screen.getByRole('button', { name: 'Send code' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/Could not connect/);
  });

  it('goes back to change the email address', async () => {
    await reachCodeStep();

    await fireEvent.press(screen.getByRole('button', { name: 'Use a different email address' }));

    expect(await screen.findByRole('header', { name: 'Sign in' })).toBeOnTheScreen();
    expect(screen.getByLabelText('Email address')).toBeOnTheScreen();
    expect(screen.queryByLabelText('6-digit code')).toBeNull();
  });

  it('announces errors to screen readers, even when the same error repeats', async () => {
    await reachCodeStep();

    await fireEvent.press(screen.getByRole('button', { name: 'Sign in' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Sign in' }));

    expect(announce).toHaveBeenCalledTimes(2);
    expect(announce).toHaveBeenLastCalledWith('Enter the 6-digit code from the email.');
  });

  it('confirms a new code with the same wording whether or not the address is invited', async () => {
    await reachCodeStep();

    await fireEvent.press(screen.getByRole('button', { name: 'Send a new code' }));

    const message =
      'If owner@example.com has been invited, we have sent a new 6-digit code to that address. The code expires in 10 minutes.';
    expect(await screen.findByText(message)).toBeOnTheScreen();
    expect(announce).toHaveBeenCalledWith(message);
    expect(mockedRequestCode).toHaveBeenCalledTimes(2);
  });

  it('sends one request when the return key is pressed twice', async () => {
    let finish: (value: { ok: true }) => void = () => {};
    mockedRequestCode.mockReturnValue(new Promise((resolve) => (finish = resolve)));
    await render(<SignInScreen />);
    const field = screen.getByLabelText('Email address');
    await fireEvent.changeText(field, 'owner@example.com');

    await fireEvent(field, 'submitEditing');
    await fireEvent(field, 'submitEditing');
    expect(screen.getByRole('button', { name: 'Sending code…' })).toBeDisabled();

    await act(async () => finish({ ok: true }));
    expect(mockedRequestCode).toHaveBeenCalledTimes(1);
    expect(await screen.findByText('Check your email')).toBeOnTheScreen();
  });

  it('recovers from an unexpected failure instead of staying busy', async () => {
    mockedVerifyCode.mockRejectedValue(new Error('Keychain locked'));
    await reachCodeStep();

    await fireEvent.changeText(screen.getByLabelText('6-digit code'), '123456');
    await fireEvent.press(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Something went wrong. Try again.');
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeEnabled();
  });
});
