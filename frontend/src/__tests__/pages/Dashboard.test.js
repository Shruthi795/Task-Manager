import React from 'react';
import { renderWithProviders, screen, fireEvent, waitFor } from '../../test-utils';
import Dashboard from '../../pages/Dashboard';

describe('User Dashboard Component', () => {
  const setupUserWithTasks = () => {
    const user = { name: 'Test User', email: 'user@example.com', role: 'user' };
    const tasks = [
      { 
        id: 1, 
        title: 'User Task 1', 
        description: 'First task',
        assignedTo: 'user@example.com', 
        status: 'To Do',
        comments: []
      },
      { 
        id: 2, 
        title: 'User Task 2',
        description: 'Second task', 
        assignedTo: 'user@example.com', 
        status: 'In Progress',
        comments: [{ text: 'Working on it', author: 'user@example.com', time: '2025-10-30' }]
      }
    ];

    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('tasks', JSON.stringify(tasks));
  };

  beforeEach(() => {
    localStorage.clear();
    setupUserWithTasks();
  });

  test('renders user dashboard with assigned tasks', () => {
    renderWithProviders(<Dashboard />);
    
    expect(screen.getByText(/My Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/User Task 1/i)).toBeInTheDocument();
    expect(screen.getByText(/User Task 2/i)).toBeInTheDocument();
  });

  test('displays task statistics correctly', () => {
    renderWithProviders(<Dashboard />);
    
    // Check status chips
    expect(screen.getByText(/Total: 2/i)).toBeInTheDocument();
    expect(screen.getByText(/To Do: 1/i)).toBeInTheDocument();
    expect(screen.getByText(/In Progress: 1/i)).toBeInTheDocument();
  });

  test('can update task status', async () => {
    renderWithProviders(<Dashboard />);
    
    // Find and click the Done button for first task
    const doneButton = screen.getAllByRole('button', { name: /Done/i })[0];
    fireEvent.click(doneButton);

    // Verify status update in localStorage
    await waitFor(() => {
      const tasks = JSON.parse(localStorage.getItem('tasks'));
      const updatedTask = tasks.find(t => t.id === 1);
      expect(updatedTask.status).toBe('Done');
    });
  });

  test('can add comment to task', async () => {
    renderWithProviders(<Dashboard />);
    
    // Find first task's comment input
    const commentInputs = screen.getAllByPlaceholderText(/Add a comment/i);
    fireEvent.change(commentInputs[0], { target: { value: 'New comment' } });
    fireEvent.keyDown(commentInputs[0], { key: 'Enter', code: 'Enter' });

    // Verify comment was added
    await waitFor(() => {
      const tasks = JSON.parse(localStorage.getItem('tasks'));
      const updatedTask = tasks.find(t => t.id === 1);
      expect(updatedTask.comments[0].text).toBe('New comment');
    });
  });

  test('shows activity log with task history', () => {
    renderWithProviders(<Dashboard />);
    
    // Check if existing comment appears in activity log
    expect(screen.getByText(/Working on it/i)).toBeInTheDocument();
  });
});