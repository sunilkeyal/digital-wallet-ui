import { Box, Typography } from '@mui/material';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <Box sx={{ mt: 0, mb: 0 }}>
      <Typography variant="h4" sx={{ mb: 1 }}>
        Welcome, {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.email}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        This is your digital wallet dashboard. Use the navigation menu on the left to access your immunization history, insurance cards, and lab results.
      </Typography>
      <Box sx={{ mt: 4, p: 3, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Quick Stats
        </Typography>
        <Typography variant="body2">
          Use the navigation menu to view and manage your health records.
        </Typography>
      </Box>
    </Box>
  );
};

export default Dashboard;
