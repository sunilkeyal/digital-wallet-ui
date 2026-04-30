import { Box, Text, Paper } from '@mantine/core';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <Box mt={0} mb={0}>
      <Text size="xl" fw={700} mb="xs">
        Welcome, {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.email}
      </Text>
      <Text c="dimmed" mb="md">
        This is your digital wallet dashboard. Use the navigation menu on the left to access your immunization history, insurance cards, and lab results.
      </Text>
      <Paper p="md" radius="md" style={{ backgroundColor: 'var(--mantine-color-blue-0)', border: '1px solid var(--mantine-color-blue-2)' }}>
        <Text fw={600} size="lg" mb="xs" c="blue.8">
          Quick Stats
        </Text>
        <Text size="sm" c="dimmed">
          Use the navigation menu to view and manage your health records.
        </Text>
      </Paper>
    </Box>
  );
};

export default Dashboard;
