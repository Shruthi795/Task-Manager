# Test Coverage Documentation

## Test Structure

### 1. Authentication Tests (`__tests__/auth/`)
- `Login.test.js`: Tests login form, successful login, and error handling
- `Signup.test.js`: Tests registration, duplicate email prevention

### 2. Page Tests (`__tests__/pages/`)
- `Dashboard.test.js`: User dashboard, task list, status updates
- `AdminDashboard.test.js`: Task creation, assignment, analytics

### 3. Component Tests (`__tests__/components/`)
- `ActivityLog.test.js`: Activity tracking and display
- `CommentSection.test.js`: Comment rendering and interactions
- `Navbar.test.js`: Navigation and mobile responsiveness
- `TaskCard.test.js`: Task display and actions

### 4. Context Tests (`__tests__/context/`)
- `TaskContext.test.js`: Global state management, data persistence

## Coverage Areas

### User Flows
- [x] Authentication (Login/Signup)
- [x] Task Management (Create/Edit/Delete)
- [x] Task Assignment
- [x] Comments and Activity
- [x] Status Updates
- [x] Mobile Navigation

### Component Features
- [x] Form Validation
- [x] Data Persistence (localStorage)
- [x] Responsive Design
- [x] Error Handling
- [x] Loading States
- [x] User Permissions

### State Management
- [x] Context Updates
- [x] Data Synchronization
- [x] User Session
- [x] Task Status Tracking

## Running Tests

### Development Mode
```bash
npm test
```
Launches test runner in interactive watch mode.

### CI Mode
```bash
npm test -- --watchAll=false --coverage
```
Runs all tests once and generates coverage report.

## Test Utils

The `test-utils.js` file provides:
- Common provider wrappers (Task, Theme, Router)
- Helper functions for testing
- Mock data setup

## Best Practices

1. Reset state between tests:
```javascript
beforeEach(() => {
  localStorage.clear();
});
```

2. Mock mobile views:
```javascript
jest.mock('@mui/material/useMediaQuery', () => () => false);
```

3. Test data persistence:
```javascript
await waitFor(() => {
  const stored = JSON.parse(localStorage.getItem('key'));
  expect(stored).toBeDefined();
});
```

## GitHub Actions Integration

Tests run automatically on:
- Push to main branch
- Pull request creation
- Pull request updates

See `.github/workflows/frontend-tests.yml` for configuration.