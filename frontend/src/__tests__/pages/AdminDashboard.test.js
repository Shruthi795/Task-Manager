import React from 'react';
import { renderWithProviders, screen, fireEvent, waitFor } from '../../test-utils';
import AdminDashboard from '../../pages/AdminDashboard';

describe('AdminDashboard Component', () => {
  const setupAdmin = () => {
    const admin = { name: 'Admin User', email: 'admin@example.com', role: 'admin' };
    const users = [
      admin,
      { name: 'Regular User', email: 'user@example.com', role: 'user' }
    ];
    const tasks = [
      { id: 1, title: 'Task 1', assignedTo: 'user@example.com', status: 'To Do', comments: [] },
      { id: 2, title: 'Task 2', assignedTo: 'user@example.com', status: 'Done', comments: [] }
    ];

    localStorage.setItem('user', JSON.stringify(admin));
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('tasks', JSON.stringify(tasks));
  };

  beforeEach(() => {
    localStorage.clear();
    setupAdmin();
  });

  test('renders admin dashboard with task list', async () => {
    renderWithProviders(<AdminDashboard />);
    
    expect(screen.getByText(/Admin Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Task 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Task 2/i)).toBeInTheDocument();
  });

  test('can create new task', async () => {
    // render add-task tab to show the new task form
    window.history.pushState({}, 'Add Task', '?tab=add-task');
    renderWithProviders(<AdminDashboard />);
    
    // Find and fill new task form
    fireEvent.change(screen.getByLabelText(/Title/i), { 
      target: { value: 'New Task' }
    });
    fireEvent.change(screen.getByLabelText(/Assign To/i), {
      target: { value: 'user@example.com' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Add/i }));

    // Check if task was added
    await waitFor(() => {
      const tasks = JSON.parse(localStorage.getItem('tasks'));
      expect(tasks).toHaveLength(3);
      expect(tasks[2].title).toBe('New Task');
    });
  });

  test('displays analytics data correctly', () => {
    // render analytics tab by setting the URL query param the component reads
    window.history.pushState({}, 'Analytics', '?tab=analytics');
    renderWithProviders(<AdminDashboard />);
    
    expect(screen.getByText(/Total Tasks/i)).toBeInTheDocument();
    expect(screen.getByText(/2/)).toBeInTheDocument(); // Total tasks
    expect(screen.getByText(/1/)).toBeInTheDocument(); // Done tasks
  });

  test('can delete a task', async () => {
    renderWithProviders(<AdminDashboard />);
    
    // Find and click delete button for Task 1
    // IconButton now includes an aria-label `delete-task-<id>`
    const deleteButtons = screen.getAllByLabelText(/delete-task-\d+/i);
    fireEvent.click(deleteButtons[0]);

    // Check if task was removed
    await waitFor(() => {
      const tasks = JSON.parse(localStorage.getItem('tasks'));
      expect(tasks).toHaveLength(1);
      expect(tasks[0].title).toBe('Task 2');
    });
  });
});