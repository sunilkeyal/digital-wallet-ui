import { Link, useNavigate } from 'react-router-dom';
import { Group, Text, Button } from '@mantine/core';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ backgroundColor: 'var(--mantine-color-blue-7)', padding: '12px 24px' }}>
      <Group justify="space-between" align="center" style={{ maxWidth: '100%' }}>
        <Group gap="sm">
          <img
            src="/logo.svg"
            alt="Digital Wallet Logo"
            width={40}
            height={40}
            style={{ borderRadius: '8px', objectFit: 'contain' }}
          />
          <Text
            component={Link}
            to="/"
            size="lg"
            fw={600}
            c="white"
            style={{ textDecoration: 'none' }}
          >
            Digital Wallet
          </Text>
        </Group>
        {user && (
          <Button variant="subtle" c="white" onClick={handleLogout}>
            Logout ({user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email})
          </Button>
        )}
      </Group>
    </div>
  );
};

export default Header;
