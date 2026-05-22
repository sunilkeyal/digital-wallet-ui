import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Button, Flex, Text, IconButton, Menu } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { useColorMode } from '../context/ColorModeContext';
import { IconMenu2, IconUser, IconLogout, IconDashboard, IconVaccine, IconCreditCard, IconFlask, IconShield, IconSun, IconMoon } from '@tabler/icons-react';

interface TopNavProps {
  onMenuClick: () => void;
}

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: IconDashboard },
  { to: '/immunizations', label: 'Immunizations', icon: IconVaccine },
  { to: '/insurance-cards', label: 'Insurance Cards', icon: IconCreditCard },
  { to: '/lab-results', label: 'Lab Results', icon: IconFlask },
];

const TopNav = ({ onMenuClick }: TopNavProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { colorMode, toggleColorMode } = useColorMode();

  const isActive = (path: string) => location.pathname === path;

  return (
    <Box
      as="nav"
      borderBottom="1px solid"
      borderColor="border"
      bg="bg"
      position="sticky"
      top={0}
      zIndex={10}
    >
      <Flex px={4} h={14} align="center" maxW="1200px" mx="auto">
        <IconButton
          aria-label="Open menu"
          variant="ghost"
          display={{ base: 'flex', md: 'none' }}
          mr={2}
          onClick={onMenuClick}
        >
          <IconMenu2 size={20} />
        </IconButton>

        <Flex align="center" gap={1} mr={6}>
          <Text fontSize="lg" fontWeight="bold" color="colorPalette.fg" letterSpacing="tight">
            Digital Wallet
          </Text>
        </Flex>

        <Flex gap={1} display={{ base: 'none', md: 'flex' }} flex={1}>
          {navLinks.map((link) => (
            <Button
              key={link.to}
              variant={isActive(link.to) ? 'solid' : 'ghost'}
              colorPalette={isActive(link.to) ? 'teal' : 'gray'}
              size="sm"
              onClick={() => navigate(link.to)}
            >
              <Box as={link.icon} size={16} />
              <Box ml={1.5}>{link.label}</Box>
            </Button>
          ))}
          {user?.roles?.includes('ROLE_ADMIN') && (
            <Button
              variant={isActive('/admin') ? 'solid' : 'ghost'}
              colorPalette={isActive('/admin') ? 'teal' : 'gray'}
              size="sm"
              onClick={() => navigate('/admin')}
            >
              <IconShield size={16} />
              <Box ml={1.5}>Admin</Box>
            </Button>
          )}
        </Flex>

        <IconButton aria-label="Toggle color mode" variant="ghost" size="sm" onClick={toggleColorMode}>
          {colorMode === 'light' ? <IconMoon size={18} /> : <IconSun size={18} />}
        </IconButton>

        {user && (
          <Menu.Root>
            <Menu.Trigger asChild>
              <Button variant="ghost" size="sm" ml="auto">
                <IconUser size={16} />
                <Box ml={1.5} display={{ base: 'none', sm: 'inline' }}>
                  {user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email}
                </Box>
              </Button>
            </Menu.Trigger>
            <Menu.Content>
              <Menu.Item value="logout" onClick={logout}>
                <IconLogout size={16} />
                <Box ml={2}>Logout</Box>
              </Menu.Item>
            </Menu.Content>
          </Menu.Root>
        )}
      </Flex>
    </Box>
  );
};

export default TopNav;
