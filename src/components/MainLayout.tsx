import { Outlet } from 'react-router-dom';
import Header from './Header';
import LeftNav, { NavItems } from './LeftNav';
import Footer from './Footer';
import { Box, Drawer } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

const MainLayout = () => {
  const [opened, { toggle, close }] = useDisclosure(false);

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header opened={opened} onToggle={toggle} />
      <Box style={{ display: 'flex', flex: 1 }}>
        <LeftNav />
        <Box
          component="main"
          px={{ base: 'md', sm: 'lg', md: 40 }}
          py={{ base: 'md', sm: 'lg', md: 24 }}
          style={{ flex: 1, overflow: 'auto' }}
        >
          <Outlet />
        </Box>
      </Box>
      <Footer />
      <Drawer opened={opened} onClose={close} title="Navigation" padding="md" size={260}>
        <NavItems onNavigate={close} />
      </Drawer>
    </Box>
  );
};

export default MainLayout;
