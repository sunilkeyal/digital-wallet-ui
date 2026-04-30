import { createTheme } from '@mantine/core';

const theme = createTheme({
  colors: {
    blue: [
      '#E3F2FD',
      '#BBDEFB',
      '#90CAF9',
      '#64B5F6',
      '#42A5F5',
      '#2196F3', // Primary - 500
      '#1E88E5',
      '#1976D2',
      '#1565C0',
      '#0D47A1',
    ],
  },
  primaryColor: 'blue',
  primaryShade: { light: 6, dark: 8 },
  fontFamily: [
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
  ].join(','),
  defaultRadius: 'md',
  components: {
    Button: {
      styles: {
        root: {
          fontWeight: 600,
          textTransform: 'none',
        },
      },
    },
    Card: {
      styles: {
        root: {
          borderRadius: '12px',
        },
      },
    },
  },
});

export default theme;
