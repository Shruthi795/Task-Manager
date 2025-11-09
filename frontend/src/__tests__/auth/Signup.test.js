import React from 'react';
import { renderWithProviders, screen, fireEvent, waitFor } from '../../test-utils';
import Signup from '../../pages/Signup';

describe('Signup Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('renders signup form', () => {
    renderWithProviders(<Signup />);
    
    expect(screen.getByText(/Sign up/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create account/i })).toBeInTheDocument();
  });

  test('handles successful signup', async () => {
    renderWithProviders(<Signup />);
    
    const newUser = {
      name: 'New User',
      email: 'new@example.com',
      password: 'password123',
      role: 'user'
    };

    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: newUser.name } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: newUser.email } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: newUser.password } });
    fireEvent.change(screen.getByLabelText(/Role/i), { target: { value: newUser.role } });
    
    fireEvent.click(screen.getByRole('button', { name: /Create account/i }));

    // Should store new user in users array and current user
    await waitFor(() => {
      const users = JSON.parse(localStorage.getItem('users'));
      const currentUser = JSON.parse(localStorage.getItem('user'));
      
      expect(users).toHaveLength(1);
      expect(users[0].email).toBe(newUser.email);
      expect(currentUser.email).toBe(newUser.email);
    });
  });

  test('prevents duplicate email signup', async () => {
    const existingUser = { name: 'Existing', email: 'exists@example.com', password: '123', role: 'user' };
    localStorage.setItem('users', JSON.stringify([existingUser]));

    renderWithProviders(<Signup />);
    
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'New Name' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: existingUser.email } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'newpass' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/User already exists/i)).toBeInTheDocument();
    });
  });
});