import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { AuthProvider } from '../context/AuthContext';
import TopNav from '../components/TopNav';

describe('TopNav', () => {
  it('renders nav with app name', () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <BrowserRouter>
          <AuthProvider>
            <TopNav onMenuClick={() => {}} />
          </AuthProvider>
        </BrowserRouter>
      </ChakraProvider>
    );
    expect(screen.getByText(/Digital Wallet/i)).toBeInTheDocument();
  });
});
