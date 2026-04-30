import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import Header from '../components/Header';

describe('Header', () => {
  it('renders header with logo text', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Header />
        </AuthProvider>
      </BrowserRouter>
    );
    expect(screen.getByText(/Digital Wallet/i)).toBeInTheDocument();
  });
});
