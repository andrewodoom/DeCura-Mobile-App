import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';

import { SignInScreen } from './src/auth/SignInScreen';
import { readSupabaseConfig } from './src/config/env';
import { subscribeToUser, type SignedInUser } from './src/data/auth';
import { Body, Screen, Title } from './src/ui/components';

type RootState = { name: 'loading' } | { name: 'signedOut' } | { name: 'signedIn'; user: SignedInUser } | { name: 'notConfigured' };

export default function App() {
  // Missing or invalid EXPO_PUBLIC_ values stop the app before Supabase is used.
  const [configured] = useState(() => {
    try {
      readSupabaseConfig();
      return true;
    } catch {
      return false;
    }
  });
  const [state, setState] = useState<RootState>(configured ? { name: 'loading' } : { name: 'notConfigured' });

  useEffect(() => {
    if (!configured) {
      return undefined;
    }
    return subscribeToUser((user) => setState(user ? { name: 'signedIn', user } : { name: 'signedOut' }));
  }, [configured]);

  return (
    <>
      <AppContent state={state} />
      <StatusBar style="dark" />
    </>
  );
}

function AppContent({ state }: { state: RootState }) {
  switch (state.name) {
    case 'loading':
      return <Screen>{null}</Screen>;
    case 'notConfigured':
      return (
        <Screen>
          <Title>The app is not set up</Title>
          <Body>This build is missing its connection settings.</Body>
        </Screen>
      );
    case 'signedOut':
      return <SignInScreen />;
    case 'signedIn':
      return (
        <Screen>
          <Title>You are signed in</Title>
          <Body>{state.user.email ? `Signed in as ${state.user.email}.` : 'Signed in.'}</Body>
        </Screen>
      );
  }
}
