import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box } from '@mantine/core';

const LeftNav = () => {
  const { user } = useAuth();

  const getNavLinkStyle = (isActive: boolean) => ({
    display: 'block',
    padding: '10px 15px',
    marginBottom: '5px',
    textDecoration: 'none',
    color: isActive ? 'var(--mantine-color-blue-7)' : 'var(--mantine-color-gray-7)',
    backgroundColor: isActive ? 'var(--mantine-color-blue-0)' : 'transparent',
    borderRadius: '4px',
    fontWeight: isActive ? 600 : 400,
  });

  return (
    <Box
      style={{
        width: 240,
        borderRight: '1px solid var(--mantine-color-gray-3)',
        backgroundColor: 'var(--mantine-color-gray-0)',
        overflowY: 'auto',
        height: '100%',
      }}
    >
      <Box p="md">
        <NavLink to="/dashboard" style={({ isActive }) => getNavLinkStyle(isActive)}>
          Dashboard
        </NavLink>
        <NavLink to="/immunizations" style={({ isActive }) => getNavLinkStyle(isActive)}>
          Immunizations
        </NavLink>
        <NavLink to="/insurance-cards" style={({ isActive }) => getNavLinkStyle(isActive)}>
          Insurance Cards
        </NavLink>
        <NavLink to="/lab-results" style={({ isActive }) => getNavLinkStyle(isActive)}>
          Lab Results
        </NavLink>
        {user?.roles?.includes('ROLE_ADMIN') && (
          <NavLink to="/admin" style={({ isActive }) => getNavLinkStyle(isActive)}>
            Admin
          </NavLink>
        )}
      </Box>
    </Box>
  );
};

export default LeftNav;
