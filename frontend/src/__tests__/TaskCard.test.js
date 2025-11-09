import React from 'react';
import { renderWithProviders, screen, fireEvent, waitFor } from '../test-utils';
import TaskCard from '../components/TaskCard';

afterEach(() => {
  localStorage.clear();
});

test('TaskCard renders and can add a comment (admin flow)', async () => {
  // prepare localStorage so TaskProvider picks up users and current user
  const currentUser = { name: 'Admin', email: 'admin@example.com', role: 'admin' };
  localStorage.setItem('user', JSON.stringify(currentUser));
  localStorage.setItem('users', JSON.stringify([currentUser]));

  const task = { id: 123, title: 'Test task', description: 'A description', comments: [] };

  // render TaskCard with isAdmin true
  renderWithProviders(<TaskCard task={task} isAdmin={true} />);

  // title shown
  expect(screen.getByText(/Test task/i)).toBeInTheDocument();

  // add a comment
  const input = screen.getByLabelText(/Add comment/i);
  fireEvent.change(input, { target: { value: 'Looks good' } });

  const addButton = screen.getByRole('button', { name: /add/i });
  fireEvent.click(addButton);

  // wait for comment to appear
  await waitFor(() => expect(screen.getByText(/Looks good/i)).toBeInTheDocument());
});
