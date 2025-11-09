// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// JSDOM in Node doesn't provide ResizeObserver which some chart libraries (recharts)
// and components rely on. Provide a minimal mock to avoid test failures.
class ResizeObserver {
	observe() {}
	unobserve() {}
	disconnect() {}
}

global.ResizeObserver = global.ResizeObserver || ResizeObserver;
