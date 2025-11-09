import React from 'react';
import { renderWithProviders, screen, fireEvent } from '../../../src/test-utils';
import ActivityLog from '../../components/ActivityLog';

describe('ActivityLog Component', () => {
  const setupTasks = () => {
    const tasks = [
      {
        id: 1,
        title: 'Task 1',
        createdBy: 'admin@example.com',
        assignedTo: 'user@example.com',
        comments: [
          { text: 'Started work', author: 'user@example.com', time: '2025-10-30 09:00' }
        ]
      },
      {
        id: 2,
        title: 'Task 2',
        createdBy: 'admin@example.com',
        comments: []
      }
    ];

    localStorage.setItem('tasks', JSON.stringify(tasks));
  };

  beforeEach(() => {
    localStorage.clear();
    setupTasks();
  });

  test('renders activity log with task creation entries', () => {
    renderWithProviders(<ActivityLog />);
    
    expect(screen.getByText(/Activity Log/i)).toBeInTheDocument();
    expect(screen.getByText(/Task Created/i)).toBeInTheDocument();
    expect(screen.getByText(/Task 1/i)).toBeInTheDocument();
    expect(screen.getByText(/admin@example.com/i)).toBeInTheDocument();
  });

  test('shows task assignments', () => {
    renderWithProviders(<ActivityLog />);
    
    expect(screen.getByText(/Assigned/i)).toBeInTheDocument();
    expect(screen.getByText(/user@example.com/i)).toBeInTheDocument();
  });

  test('displays comments in activity', () => {
    renderWithProviders(<ActivityLog />);
    
    expect(screen.getByText(/Started work/i)).toBeInTheDocument();
  });

  test('sorts activities by time', () => {
    renderWithProviders(<ActivityLog />);
    
    const activities = screen.getAllByText(/Task/i);
    expect(activities).toHaveLength(3); // 2 task creations + 1 assignment
  });

  test('shows no activity message when empty', () => {
    localStorage.setItem('tasks', JSON.stringify([]));
    renderWithProviders(<ActivityLog />);
    
    expect(screen.getByText(/No activity yet/i)).toBeInTheDocument();
  });
});