import React from 'react';
import { renderWithProviders, screen, fireEvent, waitFor } from '../../test-utils';
import { TaskProvider, useTaskContext } from '../../context/TaskContext';

// Test component that uses TaskContext
function TestComponent() {
  const { users, tasks, currentUser, signup, login, logout, addTask, assignTask, addComment } = useTaskContext();
  
  return (
    <div>
      <div data-testid="context-data">
        {JSON.stringify({ users, tasks, currentUser })}
      </div>
      <button onClick={() => signup({ name: 'Test', email: 'test@ex.com', password: '123', role: 'user' })}>
        Signup
      </button>
      <button onClick={() => login({ email: 'test@ex.com', password: '123' })}>
        Login
      </button>
      <button onClick={logout}>Logout</button>
      <button onClick={() => addTask({ title: 'New Task', assignedTo: 'test@ex.com' })}>
        Add Task
      </button>
      <button onClick={() => assignTask(1, 'test@ex.com')}>
        Assign Task
      </button>
      <button onClick={() => addComment(1, { text: 'Comment', author: 'test@ex.com' })}>
        Add Comment
      </button>
    </div>
  );
}

describe('TaskContext Provider', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('provides initial empty state', () => {
    renderWithProviders(<TestComponent />);
    
    const contextData = JSON.parse(screen.getByTestId('context-data').textContent);
    expect(contextData).toEqual({
      users: [],
      tasks: [],
      currentUser: null
    });
  });

  test('signup adds user and logs them in', async () => {
    renderWithProviders(<TestComponent />);
    
    fireEvent.click(screen.getByText('Signup'));

    await waitFor(() => {
      const contextData = JSON.parse(screen.getByTestId('context-data').textContent);
      expect(contextData.users).toHaveLength(1);
      expect(contextData.currentUser.email).toBe('test@ex.com');
    });
  });

  test('login sets current user', async () => {
    // Setup existing user
    const user = { name: 'Test', email: 'test@ex.com', password: '123', role: 'user' };
    localStorage.setItem('users', JSON.stringify([user]));

    renderWithProviders(<TestComponent />);
    
    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      const contextData = JSON.parse(screen.getByTestId('context-data').textContent);
      expect(contextData.currentUser.email).toBe('test@ex.com');
    });
  });

  test('logout clears current user', async () => {
    // Setup logged in user
    const user = { name: 'Test', email: 'test@ex.com', password: '123', role: 'user' };
    localStorage.setItem('user', JSON.stringify(user));

    renderWithProviders(<TestComponent />);
    
    fireEvent.click(screen.getByText('Logout'));

    await waitFor(() => {
      const contextData = JSON.parse(screen.getByTestId('context-data').textContent);
      expect(contextData.currentUser).toBeNull();
    });
  });

  test('can add and assign tasks', async () => {
    renderWithProviders(<TestComponent />);
    
    fireEvent.click(screen.getByText('Add Task'));

    await waitFor(() => {
      const contextData = JSON.parse(screen.getByTestId('context-data').textContent);
      expect(contextData.tasks).toHaveLength(1);
      expect(contextData.tasks[0].title).toBe('New Task');
    });

    fireEvent.click(screen.getByText('Assign Task'));

    await waitFor(() => {
      const contextData = JSON.parse(screen.getByTestId('context-data').textContent);
      expect(contextData.tasks[0].assignedTo).toBe('test@ex.com');
    });
  });

  test('can add comments to tasks', async () => {
    // Setup existing task
    const task = { id: 1, title: 'Task', comments: [] };
    localStorage.setItem('tasks', JSON.stringify([task]));

    renderWithProviders(<TestComponent />);
    
    fireEvent.click(screen.getByText('Add Comment'));

    await waitFor(() => {
      const contextData = JSON.parse(screen.getByTestId('context-data').textContent);
      expect(contextData.tasks[0].comments).toHaveLength(1);
      expect(contextData.tasks[0].comments[0].text).toBe('Comment');
    });
  });
});