// REQ-ACC-01a: sign in with an email address and a six-digit code typed into
// the app. No passwords and no email links.

import { useRef, useState } from 'react';

import {
  CODE_EXPIRY_MINUTES,
  CODE_LENGTH,
  isWellFormedCode,
  isWellFormedEmail,
  requestCode,
  verifyCode,
} from '../data/auth';
import { announce, Body, Button, ErrorText, Field, Screen, StatusText, Title, useAccessibilityFocus } from '../ui/components';

const messages = {
  invalidEmail: 'Enter a valid email address.',
  invalidCodeFormat: `Enter the ${CODE_LENGTH}-digit code from the email.`,
  invalid_code: 'That code is not right or has expired. Check it, or send a new code.',
  rate_limited: 'Too many attempts. Wait a few minutes and try again.',
  network: 'Could not connect. Check your internet connection and try again.',
  unavailable: 'Something went wrong. Try again.',
} as const;

// REQ-ACC-01c: the same words whether or not the address has an account.
function codeSentMessage(email: string, again: boolean): string {
  return `If ${email} has been invited, we have sent a ${again ? 'new ' : ''}${CODE_LENGTH}-digit code to that address. The code expires in ${CODE_EXPIRY_MINUTES} minutes.`;
}

type Step = { name: 'email' } | { name: 'code'; email: string };

type Action = 'send' | 'resend' | 'verify';

export function SignInScreen() {
  const [step, setStep] = useState<Step>({ name: 'email' });
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState<Action | null>(null);
  // Read synchronously, so a second press of the return key before the next
  // render cannot start a second request.
  const inFlight = useRef(false);
  const titleRef = useAccessibilityFocus(step.name);

  function showError(message: string) {
    setStatus(null);
    setError(message);
    announce(message);
  }

  async function run(action: Action, work: () => Promise<void>) {
    if (inFlight.current) {
      return;
    }
    inFlight.current = true;
    setBusy(action);
    setError(null);
    setStatus(null);
    try {
      await work();
    } catch {
      showError(messages.unavailable);
    } finally {
      inFlight.current = false;
      setBusy(null);
    }
  }

  async function sendCode(address: string, again: boolean) {
    if (inFlight.current) {
      return;
    }
    if (!isWellFormedEmail(address)) {
      showError(messages.invalidEmail);
      return;
    }
    await run(again ? 'resend' : 'send', async () => {
      const result = await requestCode(address);
      if (!result.ok) {
        showError(messages[result.reason]);
        return;
      }
      setCode('');
      if (again) {
        const message = codeSentMessage(address.trim(), true);
        setStatus(message);
        announce(message);
      } else {
        setStep({ name: 'code', email: address.trim() });
      }
    });
  }

  async function submitCode(address: string) {
    if (inFlight.current) {
      return;
    }
    if (!isWellFormedCode(code)) {
      showError(messages.invalidCodeFormat);
      return;
    }
    await run('verify', async () => {
      const result = await verifyCode(address, code);
      // On success the session listener in App replaces this screen.
      if (!result.ok) {
        showError(messages[result.reason]);
      }
    });
  }

  if (step.name === 'email') {
    return (
      <Screen>
        <Title ref={titleRef}>Sign in</Title>
        <Body>Enter your email address. We will send you a {CODE_LENGTH}-digit code.</Body>
        <Field
          label="Email address"
          error={error}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          keyboardType="email-address"
          textContentType="emailAddress"
          returnKeyType="send"
          onSubmitEditing={() => void sendCode(email, false)}
        />
        {error ? <ErrorText>{error}</ErrorText> : null}
        <Button
          label={busy === 'send' ? 'Sending code…' : 'Send code'}
          onPress={() => void sendCode(email, false)}
          disabled={busy !== null}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <Title ref={titleRef}>Check your email</Title>
      <Body>{codeSentMessage(step.email, false)}</Body>
      <Field
        label={`${CODE_LENGTH}-digit code`}
        error={error}
        value={code}
        onChangeText={(text) => setCode(text.replace(/\D/g, '').slice(0, CODE_LENGTH))}
        autoFocus
        autoComplete="one-time-code"
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        maxLength={CODE_LENGTH}
        returnKeyType="done"
        onSubmitEditing={() => void submitCode(step.email)}
      />
      {error ? <ErrorText>{error}</ErrorText> : null}
      {status ? <StatusText>{status}</StatusText> : null}
      <Button
        label={busy === 'verify' ? 'Signing in…' : 'Sign in'}
        onPress={() => void submitCode(step.email)}
        disabled={busy !== null}
      />
      <Button
        label={busy === 'resend' ? 'Sending a new code…' : 'Send a new code'}
        variant="secondary"
        onPress={() => void sendCode(step.email, true)}
        disabled={busy !== null}
      />
      <Button
        label="Use a different email address"
        variant="secondary"
        onPress={() => {
          setError(null);
          setStatus(null);
          setStep({ name: 'email' });
        }}
        disabled={busy !== null}
      />
    </Screen>
  );
}
