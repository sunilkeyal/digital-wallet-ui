import { Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="static" sx={{ width: '100%' }}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <img 
            src="/logo.svg" 
            alt="Digital Wallet Logo" 
            style={{ width: 40, height: 40, marginRight: 10 }}
            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <Typography variant="h6" component={Link} to="/" sx={{ color: 'white', textDecoration: 'none' }}>
            Digital Wallet
          </Typography>
        </Box>
        {user && (
          <Button color="inherit" onClick={handleLogout}>
            Logout ({user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email})
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
