import { Outlet } from 'react-router-dom';
import Header from './Header';
import LeftNav from './LeftNav';
import Footer from './Footer';
import { Box } from '@mantine/core';

const MainLayout = () => {
  return (
    <Box style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Box style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <LeftNav />
        <Box
          component="main"
          style={{ flex: 1, padding: '24px 40px', overflow: 'auto' }}
        >
          <Outlet />
        </Box>
      </Box>
      <Footer />
    </Box>
  );
};

export default MainLayout;
