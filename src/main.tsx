import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { MantineProvider } from '@mantine/core';
import theme from './theme';
import '@mantine/core/styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider theme={theme}>
      <App />
    </MantineProvider>
  </StrictMode>
);
