import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { AuthProvider } from '../context/AuthContext';
import Dashboard from '../pages/Dashboard';

describe('Dashboard', () => {
  it('renders dashboard heading', () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <BrowserRouter>
          <AuthProvider>
            <Dashboard />
          </AuthProvider>
        </BrowserRouter>
      </ChakraProvider>
    );
    expect(screen.getByText(/Welcome/i)).toBeInTheDocument();
  });
});
