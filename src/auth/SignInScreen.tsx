// REQ-ACC-01a: sign in with an email address and a six-digit code typed into
// the app. No passwords and no email links.

import { useState } from 'react';

import { CODE_LENGTH, isWellFormedCode, isWellFormedEmail, requestCode, verifyCode } from '../data/auth';
import { Body, Button, ErrorText, Field, Screen, Title } from '../ui/components';

const messages = {
  invalidEmail: 'Enter a valid email address.',
  invalidCodeFormat: `Enter the ${CODE_LENGTH}-digit code from the email.`,
  invalid_code: 'That code is not right or has expired. Check it, or send a new code.',
  rate_limited: 'Too many attempts. Wait a few minutes and try again.',
  network: 'Could not connect. Check your internet connection and try again.',
} as const;

type Step = { name: 'email' } | { name: 'code'; email: string };

export function SignInScreen() {
  const [step, setStep] = useState<Step>({ name: 'email' });
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function sendCode(address: string) {
    if (!isWellFormedEmail(address)) {
      setError(messages.invalidEmail);
      return;
    }
    setBusy(true);
    setError(null);
    const result = await requestCode(address);
    setBusy(false);
    if (result.ok) {
      setCode('');
      setStep({ name: 'code', email: address.trim() });
    } else {
      setError(messages[result.reason]);
    }
  }

  async function submitCode(address: string) {
    if (!isWellFormedCode(code)) {
      setError(messages.invalidCodeFormat);
      return;
    }
    setBusy(true);
    setError(null);
    const result = await verifyCode(address, code);
    setBusy(false);
    // On success the session listener in App replaces this screen.
    if (!result.ok) {
      setError(messages[result.reason]);
    }
  }

  if (step.name === 'email') {
    return (
      <Screen>
        <Title>Sign in</Title>
        <Body>Enter your email address. We will send you a {CODE_LENGTH}-digit code.</Body>
        <Field
          label="Email address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          keyboardType="email-address"
          textContentType="emailAddress"
          returnKeyType="send"
          onSubmitEditing={() => sendCode(email)}
        />
        {error ? <ErrorText>{error}</ErrorText> : null}
        <Button label="Send code" onPress={() => sendCode(email)} disabled={busy} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Title>Check your email</Title>
      <Body>
        If {step.email} has been invited, we have sent it a {CODE_LENGTH}-digit code. The code expires in 10 minutes.
      </Body>
      <Field
        label={`${CODE_LENGTH}-digit code`}
        value={code}
        onChangeText={(text) => setCode(text.replace(/\D/g, '').slice(0, CODE_LENGTH))}
        autoComplete="one-time-code"
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        maxLength={CODE_LENGTH}
        returnKeyType="done"
        onSubmitEditing={() => submitCode(step.email)}
      />
      {error ? <ErrorText>{error}</ErrorText> : null}
      <Button label="Sign in" onPress={() => submitCode(step.email)} disabled={busy} />
      <Button label="Send a new code" variant="secondary" onPress={() => sendCode(step.email)} disabled={busy} />
      <Button
        label="Use a different email address"
        variant="secondary"
        onPress={() => {
          setError(null);
          setStep({ name: 'email' });
        }}
        disabled={busy}
      />
    </Screen>
  );
}
