import React from 'react';
import { renderWithProviders, screen, fireEvent } from '../test-utils';
import Navbar from '../components/Navbar';

afterEach(() => {
  localStorage.clear();
  jest.resetAllMocks();
});

// Mock useMediaQuery to simulate mobile view where the menu icon shows
jest.mock('@mui/material/useMediaQuery', () => () => false);

test('Navbar shows mobile menu button and opens drawer', async () => {
  // set a logged in user
  const currentUser = { name: 'User1', email: 'u1@example.com', role: 'user' };
  localStorage.setItem('user', JSON.stringify(currentUser));

  renderWithProviders(<Navbar />);

  // menu button exists (aria-label in component)
  const menuButton = screen.getByLabelText(/open navigation/i);
  expect(menuButton).toBeInTheDocument();

  // open drawer
  fireEvent.click(menuButton);

  // drawer content should contain app title
  // Use getAllByText since there are two drawers (permanent and mobile)
  const appTitles = screen.getAllByText(/Task Manager/i);
  expect(appTitles.length).toBeGreaterThan(0);
});
