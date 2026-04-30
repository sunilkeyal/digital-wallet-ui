import { Outlet } from 'react-router-dom';
import Header from './Header';
import LeftNav from './LeftNav';
import Footer from './Footer';
import { Box } from '@mui/material';

const MainLayout = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Box sx={{ display: 'flex', flex: 1, position: 'relative' }}>
        <LeftNav />
        <Box
          component="main"
          sx={{
            flex: 1,
            p: 0,
            ml: '280px',
            mr: '40px',
            mt: '64px',
            mb: '56px',
          }}
        >
          <Outlet />
        </Box>
      </Box>
      <Footer />
    </Box>
  );
};

export default MainLayout;
