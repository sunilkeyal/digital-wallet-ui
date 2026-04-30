import { Box } from '@mui/material';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LeftNav = () => {
  const { user } = useAuth();

  const getNavLinkStyle = (isActive: boolean) => ({
    display: 'block',
    padding: '10px 15px',
    marginBottom: '5px',
    textDecoration: 'none',
    color: isActive ? '#1976d2' : '#333',
    backgroundColor: isActive ? '#e3f2fd' : 'transparent',
    borderRadius: '4px',
    fontWeight: isActive ? 600 : 400,
  });

  return (
    <Box
      sx={{
        width: 240,
        flexShrink: 0,
        position: 'fixed',
        top: 64,
        left: 0,
        height: 'calc(100vh - 64px - 56px)',
        overflowY: 'auto',
        borderRight: '1px solid #e0e0e0',
        backgroundColor: '#fafafa',
        zIndex: 1000,
      }}
    >
      <Box sx={{ p: 2 }}>
        <NavLink
          to="/dashboard"
          style={({ isActive }) => getNavLinkStyle(isActive)}
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/immunizations"
          style={({ isActive }) => getNavLinkStyle(isActive)}
        >
          Immunizations
        </NavLink>
        <NavLink
          to="/insurance-cards"
          style={({ isActive }) => getNavLinkStyle(isActive)}
        >
          Insurance Cards
        </NavLink>
        <NavLink
          to="/lab-results"
          style={({ isActive }) => getNavLinkStyle(isActive)}
        >
          Lab Results
        </NavLink>
        {user?.roles?.includes('ROLE_ADMIN') && (
          <NavLink
            to="/admin"
            style={({ isActive }) => getNavLinkStyle(isActive)}
          >
            Admin
          </NavLink>
        )}
      </Box>
    </Box>
  );
};

export default LeftNav;
