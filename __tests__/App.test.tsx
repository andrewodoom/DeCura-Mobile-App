import { render, screen } from '@testing-library/react-native';

import App from '../App';

// Proves the test runner, the jest-expo preset and React Native rendering work
// in continuous integration (QA-04). Replaced by real screen tests from milestone 1.
describe('QA-04-T02 test tooling', () => {
  it('renders the app root', async () => {
    await render(<App />);

    expect(await screen.findByText(/App\.tsx/)).toBeOnTheScreen();
  });
});
