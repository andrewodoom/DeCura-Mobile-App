import { act, render, screen } from '@testing-library/react-native';

import App from '../App';
import { readSupabaseConfig } from '../src/config/env';
import { subscribeToUser, type SignedInUser } from '../src/data/auth';

jest.mock('../src/data/auth', () => ({
  ...jest.requireActual('../src/data/auth'),
  subscribeToUser: jest.fn(),
}));

jest.mock('../src/data/client', () => ({ supabase: jest.fn() }));

jest.mock('../src/config/env', () => ({ readSupabaseConfig: jest.fn() }));

const mockedSubscribe = jest.mocked(subscribeToUser);
const mockedConfig = jest.mocked(readSupabaseConfig);

beforeEach(() => {
  mockedSubscribe.mockReset();
  mockedSubscribe.mockReturnValue(() => {});
  mockedConfig.mockReset();
  mockedConfig.mockReturnValue({ url: 'https://example.supabase.co', publishableKey: 'sb_publishable_example' });
});

// Proves the test runner, the jest-expo preset and React Native rendering work
// in continuous integration (QA-04).
describe('QA-04-T02 test tooling', () => {
  it('renders the app root', async () => {
    await render(<App />);

    expect(await screen.findByLabelText('Loading')).toBeOnTheScreen();
  });
});

describe('REQ-ACC-01a-T04 the app root follows the session', () => {
  it('shows sign-in when there is no session, and the signed-in screen after', async () => {
    let listener: (user: SignedInUser | null) => void = () => {};
    mockedSubscribe.mockImplementation((next) => {
      listener = next;
      next(null);
      return () => {};
    });

    await render(<App />);
    expect(await screen.findByRole('button', { name: 'Send code' })).toBeOnTheScreen();

    await act(async () => listener({ email: 'owner@example.com' }));
    expect(await screen.findByText('Signed in as owner@example.com.')).toBeOnTheScreen();
  });
});

describe('SEC-01-T03 the app stops before using Supabase when its settings are invalid', () => {
  it('says the app is not set up, and never subscribes to a session', async () => {
    mockedConfig.mockImplementation(() => {
      throw new Error('EXPO_PUBLIC_SUPABASE_URL is not set');
    });

    await render(<App />);

    expect(await screen.findByText('The app is not set up')).toBeOnTheScreen();
    expect(mockedSubscribe).not.toHaveBeenCalled();
  });
});
