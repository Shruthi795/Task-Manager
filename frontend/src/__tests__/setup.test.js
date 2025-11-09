import { render, screen } from '@testing-library/react';

// A simple test to verify Jest is working
test('basic test setup check', () => {
  expect(true).toBe(true);
});

// A simple DOM test
test('DOM testing setup check', () => {
  render(<div data-testid="test-element">Test</div>);
  const element = screen.getByTestId('test-element');
  expect(element).toBeInTheDocument();
});