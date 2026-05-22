import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Drawer, VStack, Button, Theme } from '@chakra-ui/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useColorMode } from '../context/ColorModeContext';
import TopNav from './TopNav';
import { IconDashboard, IconVaccine, IconCreditCard, IconFlask, IconNotes, IconShield } from '@tabler/icons-react';
import { NoteProvider } from '../context/NoteContext';

const drawerLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: IconDashboard },
  { to: '/immunizations', label: 'Immunizations', icon: IconVaccine },
  { to: '/insurance-cards', label: 'Insurance Cards', icon: IconCreditCard },
  { to: '/lab-results', label: 'Lab Results', icon: IconFlask },
  { to: '/notes', label: 'Notes', icon: IconNotes },
];

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { colorMode } = useColorMode();

  const isActive = (path: string) => location.pathname === path;

  const handleNav = (to: string) => {
    navigate(to);
    setSidebarOpen(false);
  };

  return (
    <Theme appearance={colorMode} colorPalette="teal">
    <Box minH="100vh">
      <TopNav onMenuClick={() => setSidebarOpen(true)} />

      <Drawer.Root open={sidebarOpen} onOpenChange={(e) => setSidebarOpen(e.open)} placement="start">
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.Header>
              <Drawer.Title>Digital Wallet</Drawer.Title>
            </Drawer.Header>
            <Drawer.Body>
              <VStack gap={1} align="stretch">
                {drawerLinks.map((link) => (
                  <Button
                    key={link.to}
                    variant={isActive(link.to) ? 'solid' : 'ghost'}
                    colorPalette={isActive(link.to) ? 'teal' : 'gray'}
                    justifyContent="flex-start"
                    onClick={() => handleNav(link.to)}
                  >
                    <Box as={link.icon} size={16} />
                    <Box ml={2}>{link.label}</Box>
                  </Button>
                ))}
                {user?.roles?.includes('ROLE_ADMIN') && (
                  <Button
                    variant={isActive('/admin') ? 'solid' : 'ghost'}
                    colorPalette={isActive('/admin') ? 'teal' : 'gray'}
                    justifyContent="flex-start"
                    onClick={() => handleNav('/admin')}
                  >
                    <IconShield size={16} />
                    <Box ml={2}>Admin</Box>
                  </Button>
                )}
              </VStack>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Drawer.Root>

      <Box as="main" px={4} py={6} maxW="1200px" mx="auto">
        <NoteProvider>
          <Outlet />
        </NoteProvider>
      </Box>
    </Box>
    </Theme>
  );
};

export default MainLayout;
