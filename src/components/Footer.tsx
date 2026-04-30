import { Link } from 'react-router-dom';
import { Box, Text } from '@mantine/core';

const Footer = () => {
  return (
    <Box
      component="footer"
      py="md"
      px="md"
      mt="auto"
      style={{
        backgroundColor: 'var(--mantine-color-gray-1)',
        borderTop: '1px solid var(--mantine-color-gray-3)',
        width: '100%',
      }}
    >
      <Text size="sm" c="dimmed">
        © {new Date().getFullYear()} Digital Wallet. All rights reserved.
      </Text>
      <Text size="sm" c="dimmed" mt={4}>
        <Link to="/privacy" style={{ textDecoration: 'none', color: 'inherit' }}>
          Privacy Policy
        </Link>
        {' | '}
        <Link to="/terms" style={{ textDecoration: 'none', color: 'inherit' }}>
          Terms of Service
        </Link>
      </Text>
    </Box>
  );
};

export default Footer;
