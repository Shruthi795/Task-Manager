# Testing Documentation

## Setup & Running Tests

### First Time Setup
```bash
# Install dependencies
npm install
```

### Running Tests
```bash
# Run tests in watch mode (development)
npm test

# Run tests once with coverage (CI mode)
npm test -- --watchAll=false --coverage
```

## Test Structure

### Unit & Integration Tests (`src/__tests__/`)
- `TaskCard.test.js` - Tests task rendering and comment functionality
- `Navbar.test.js` - Tests mobile menu and navigation
- `Dashboard.test.js` - Tests dashboard layout and stats

### Test Utils (`src/test-utils.js`)
Provides a wrapper with common providers:
- TaskContext
- Material-UI Theme
- React Router

## Writing Tests

### Example: Testing a Component
```javascript
import { renderWithProviders, screen } from '../test-utils';
import YourComponent from './YourComponent';

test('your test description', () => {
  // Setup localStorage if needed (TaskProvider reads it)
  localStorage.setItem('user', JSON.stringify({ name: 'Test User' }));

  // Render with providers
  renderWithProviders(<YourComponent />);

  // Make assertions
  expect(screen.getByText(/expected text/i)).toBeInTheDocument();
});
```

### Testing Tips
1. Clear localStorage between tests:
```javascript
afterEach(() => {
  localStorage.clear();
});
```

2. Testing mobile layouts:
```javascript
// Mock useMediaQuery for mobile view
jest.mock('@mui/material/useMediaQuery', () => () => false);
```

3. Common patterns:
- Use `screen.getByRole()` for buttons, links
- Use `screen.getByLabelText()` for form inputs
- Use `fireEvent` for clicks, input changes
- Use `waitFor()` for async updates

## CI/CD

Tests run automatically on:
- Push to main
- Pull requests

The workflow is defined in `.github/workflows/frontend-tests.yml`.

## Coverage
Coverage reports are generated in `coverage/` when running tests with the `--coverage` flag.