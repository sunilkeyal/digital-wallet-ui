import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box } from '@mantine/core';

interface NavItemsProps {
  onNavigate?: () => void;
}

export const NavItems = ({ onNavigate }: NavItemsProps) => {
  const { user } = useAuth();

  const getNavLinkStyle = (isActive: boolean) => ({
    display: 'block',
    padding: '10px 15px',
    marginBottom: '5px',
    textDecoration: 'none',
    borderRadius: '4px',
    color: isActive ? 'var(--mantine-color-blue-7)' : 'var(--mantine-color-gray-7)',
    backgroundColor: isActive ? 'var(--mantine-color-blue-0)' : 'transparent',
    fontWeight: isActive ? 600 : 400,
  });

  const links = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/immunizations', label: 'Immunizations' },
    { to: '/insurance-cards', label: 'Insurance Cards' },
    { to: '/lab-results', label: 'Lab Results' },
  ];

  return (
    <>
      {links.map(link => (
        <NavLink
          key={link.to}
          to={link.to}
          onClick={onNavigate}
          style={({ isActive }) => getNavLinkStyle(isActive)}
        >
          {link.label}
        </NavLink>
      ))}
      {user?.roles?.includes('ROLE_ADMIN') && (
        <NavLink
          to="/admin"
          onClick={onNavigate}
          style={({ isActive }) => getNavLinkStyle(isActive)}
        >
          Admin
        </NavLink>
      )}
    </>
  );
};

const LeftNav = () => {
  return (
    <Box
      visibleFrom="sm"
      style={{
        width: 240,
        borderRight: '1px solid var(--mantine-color-gray-3)',
        backgroundColor: 'var(--mantine-color-gray-0)',
        overflowY: 'auto',
        alignSelf: 'stretch',
      }}
    >
      <Box p="md">
        <NavItems />
      </Box>
    </Box>
  );
};

export default LeftNav;
