import React from 'react';
import { renderWithProviders, screen, fireEvent, waitFor } from '../../test-utils';
import Login from '../../pages/Login';

describe('Login Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('renders login form', () => {
    renderWithProviders(<Login />);
    
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
  });

  test('handles successful login', async () => {
    const testUser = { email: 'test@example.com', password: 'password123', name: 'Test User', role: 'user' };
    localStorage.setItem('users', JSON.stringify([testUser]));

    renderWithProviders(<Login />);
    
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: testUser.email } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: testUser.password } });
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    // Should store user in localStorage
    await waitFor(() => {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      expect(storedUser.email).toBe(testUser.email);
    });
  });

  test('shows error for invalid credentials', async () => {
    renderWithProviders(<Login />);
    
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'wrong@email.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    await waitFor(() => {
      expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
    });
  });
});