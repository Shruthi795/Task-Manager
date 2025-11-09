import React from 'react';
import { render } from '@testing-library/react';
import { TaskProvider } from '../src/context/TaskContext';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { BrowserRouter } from 'react-router-dom';

export function renderWithProviders(ui, { providerProps = {}, ...renderOptions } = {}) {
  const theme = createTheme();

  function Wrapper({ children }) {
    return (
      <ThemeProvider theme={theme}>
        <TaskProvider {...providerProps}>
          <BrowserRouter>{children}</BrowserRouter>
        </TaskProvider>
      </ThemeProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

export * from '@testing-library/react';
