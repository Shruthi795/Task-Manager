import React from 'react';
import { renderWithProviders, screen } from '../test-utils';

import Dashboard from '../pages/Dashboard';

afterEach(() => {
  localStorage.clear();
});

test('Dashboard shows header and stats for a user with tasks', async () => {
  const user = { name: 'Bob', email: 'bob@example.com', role: 'user' };
  const tasks = [
    { id: 1, title: 'T1', assignedTo: 'bob@example.com', status: 'To Do', comments: [] },
    { id: 2, title: 'T2', assignedTo: 'bob@example.com', status: 'Done', comments: [] },
  ];

  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('tasks', JSON.stringify(tasks));

  renderWithProviders(<Dashboard />);

  expect(screen.getByText(/My Dashboard/i)).toBeInTheDocument();
  // Check that aggregate chips appear: Total, To Do, Done
  expect(screen.getByText(/Total:/i)).toBeInTheDocument();
  expect(screen.getByText(/To Do:/i)).toBeInTheDocument();
  expect(screen.getByText(/Done:/i)).toBeInTheDocument();
});
