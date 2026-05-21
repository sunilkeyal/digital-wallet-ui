import { useState, useEffect, useCallback } from 'react';
import {
  Box, Text, Paper, Table, Button, Modal, TextInput, Select, Alert,
  ActionIcon, Group, Tabs, Stack
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus, IconTrash, IconDatabase, IconUsers } from '@tabler/icons-react';
import { authApi } from '../services/api';
import type { User } from '../types';

const Admin = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [opened, { open, close }] = useDisclosure(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    roles: 'ROLE_USER' as string,
  });

  // Seed tab state
  const [seedUserId, setSeedUserId] = useState('');
  const [seedLoading, setSeedLoading] = useState(false);
  const [seedStatus, setSeedStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await authApi.getAllUsers();
      setUsers(response.data);
    } catch {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleCreateUser = async () => {
    try {
      await authApi.createUser({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        roles: [formData.roles],
      });
      close();
      setFormData({ email: '', password: '', firstName: '', lastName: '', roles: 'ROLE_USER' });
      fetchUsers();
    } catch {
      setError('Failed to create user');
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await authApi.deleteUser(id);
      fetchUsers();
    } catch {
      setError('Failed to delete user');
    }
  };

  const handleSeedData = async () => {
    if (!seedUserId) {
      setSeedStatus({ type: 'error', message: 'Please select a user to seed data for.' });
      return;
    }
    try {
      setSeedLoading(true);
      setSeedStatus(null);
      const response = await authApi.seedData(seedUserId);
      setSeedStatus({ type: 'success', message: response.data.message });
    } catch {
      setSeedStatus({ type: 'error', message: 'Failed to seed data. Please try again.' });
    } finally {
      setSeedLoading(false);
    }
  };

  return (
    <Box>
      <Text size="xl" fw={700} mb="md">Admin Panel</Text>

      <Tabs defaultValue="users">
        <Tabs.List mb="md">
          <Tabs.Tab value="users" leftSection={<IconUsers size={16} />}>
            User Management
          </Tabs.Tab>
          <Tabs.Tab value="seed" leftSection={<IconDatabase size={16} />}>
            Seed Sample Data
          </Tabs.Tab>
        </Tabs.List>

        {/* User Management Tab */}
        <Tabs.Panel value="users">
          <Group mb="xs" justify="flex-end">
            <Button leftSection={<IconPlus size={16} />} onClick={open}>
              Add User
            </Button>
          </Group>

          {error && <Alert color="red" mb="md">{error}</Alert>}

          {loading ? <Text>Loading...</Text> : (
            <Paper radius="md" style={{ overflowX: 'auto' }}>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Email</Table.Th>
                    <Table.Th>First Name</Table.Th>
                    <Table.Th>Last Name</Table.Th>
                    <Table.Th>Roles</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {users.map((user) => (
                    <Table.Tr key={user.id}>
                      <Table.Td>{user.email}</Table.Td>
                      <Table.Td>{user.firstName || '-'}</Table.Td>
                      <Table.Td>{user.lastName || '-'}</Table.Td>
                      <Table.Td>{user.roles?.join(', ')}</Table.Td>
                      <Table.Td>
                        <ActionIcon
                          color="red"
                          onClick={() => handleDeleteUser(user.id!)}
                          disabled={user.email === 'admin@digitalwallet.com'}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                  {users.length === 0 && (
                    <Table.Tr>
                      <Table.Td colSpan={5} ta="center">No users found</Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            </Paper>
          )}
        </Tabs.Panel>

        {/* Seed Sample Data Tab */}
        <Tabs.Panel value="seed">
          <Paper p="xl" radius="md" withBorder maw={560}>
            <Stack gap="md">
              <Box>
                <Text fw={600} size="lg" mb={4}>Populate Sample Health Records</Text>
                <Text c="dimmed" size="sm">
                  Select a user and click the button below to seed their account with sample
                  immunization records, insurance cards, and lab results. Existing records will
                  not be removed — new records will be appended.
                </Text>
              </Box>

              <Select
                label="Select User"
                placeholder="Choose a user to seed data for"
                data={users.map((u) => ({
                  value: u.id!,
                  label: `${u.email}${u.firstName ? ` (${u.firstName} ${u.lastName ?? ''})`.trim() : ''}`,
                }))}
                value={seedUserId}
                onChange={(v) => { setSeedUserId(v ?? ''); setSeedStatus(null); }}
                searchable
              />

              {seedStatus && (
                <Alert color={seedStatus.type === 'success' ? 'green' : 'red'}>
                  {seedStatus.message}
                </Alert>
              )}

              <Button
                leftSection={<IconDatabase size={16} />}
                loading={seedLoading}
                onClick={handleSeedData}
                disabled={!seedUserId}
              >
                Seed Sample Data
              </Button>
            </Stack>
          </Paper>
        </Tabs.Panel>
      </Tabs>

      <Modal opened={opened} onClose={close} title="Create User" centered>
        <TextInput
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          mb="sm"
          required
        />
        <TextInput
          label="Password"
          type="password"
          value={formData.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
          mb="sm"
          required
        />
        <TextInput
          label="First Name"
          value={formData.firstName}
          onChange={(e) => handleInputChange('firstName', e.target.value)}
          mb="sm"
        />
        <TextInput
          label="Last Name"
          value={formData.lastName}
          onChange={(e) => handleInputChange('lastName', e.target.value)}
          mb="sm"
        />
        <Select
          label="Role"
          value={formData.roles}
          onChange={(value) => handleInputChange('roles', value || 'ROLE_USER')}
          data={[
            { value: 'ROLE_USER', label: 'User' },
            { value: 'ROLE_ADMIN', label: 'Admin' },
          ]}
          mb="md"
        />
        <Group justify="flex-end">
          <Button variant="default" onClick={close}>Cancel</Button>
          <Button onClick={handleCreateUser}>Create</Button>
        </Group>
      </Modal>
    </Box>
  );
};

export default Admin;

