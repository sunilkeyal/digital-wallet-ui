import { Link } from 'react-router-dom';
import { Box, Typography } from '@mui/material';

const Footer = () => {
  return (
    <Box 
      component="footer" 
      sx={{ 
        py: 2, 
        px: 2, 
        mt: 'auto', 
        backgroundColor: '#f5f5f5',
        borderTop: '1px solid #e0e0e0',
        width: '100%'
      }}
    >
      <Typography variant="body2" color="text.secondary" align="left">
        © {new Date().getFullYear()} Digital Wallet. All rights reserved.
      </Typography>
      <Typography variant="body2" color="text.secondary" align="left" sx={{ mt: 0.5 }}>
        <Link to="/privacy" style={{ textDecoration: 'none', color: 'inherit' }}>
          Privacy Policy
        </Link>
        {' | '}
        <Link to="/terms" style={{ textDecoration: 'none', color: 'inherit' }}>
          Terms of Service
        </Link>
      </Typography>
    </Box>
  );
};

export default Footer;
