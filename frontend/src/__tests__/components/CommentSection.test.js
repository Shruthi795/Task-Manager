import React from 'react';
import { renderWithProviders, screen, fireEvent } from '../../test-utils';
import CommentSection from '../../components/CommentSection';

describe('CommentSection Component', () => {
  const sampleComments = [
    { text: 'First comment', author: 'user1@example.com', time: '2025-10-30 09:00' },
    { text: 'Second comment', author: 'user2@example.com', time: '2025-10-30 10:00' }
  ];

  test('renders comments when provided', () => {
    renderWithProviders(<CommentSection comments={sampleComments} />);
    
    expect(screen.getByText('Comments:')).toBeInTheDocument();
    expect(screen.getByText('First comment')).toBeInTheDocument();
    expect(screen.getByText('Second comment')).toBeInTheDocument();
  });

  test('shows comment authors and timestamps', () => {
    renderWithProviders(<CommentSection comments={sampleComments} />);
    
    expect(screen.getByText(/user1@example.com/)).toBeInTheDocument();
    expect(screen.getByText(/2025-10-30 09:00/)).toBeInTheDocument();
  });

  test('returns null when no comments provided', () => {
    const { container } = renderWithProviders(<CommentSection comments={[]} />);
    expect(container.firstChild).toBeNull();
  });

  test('handles undefined comments gracefully', () => {
    const { container } = renderWithProviders(<CommentSection />);
    expect(container.firstChild).toBeNull();
  });
});