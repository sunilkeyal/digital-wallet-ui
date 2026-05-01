import { useState, useEffect, useCallback } from 'react';
import { Box, Text, Paper, Table, Button, Modal, TextInput, Select, Alert, ActionIcon, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus, IconTrash } from '@tabler/icons-react';
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

  return (
    <Box mt={0} mb={0}>
      <Text size="xl" fw={700} mb="xs">Admin Panel - User Management</Text>

      <Group mb="xs" justify="flex-end">
        <Button leftSection={<IconPlus size={16} />} onClick={open}>
          Add User
        </Button>
      </Group>

      {error && <Alert color="red" mb="md">{error}</Alert>}

      {loading ? <Text>Loading...</Text> : (
        <Paper radius="md">
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
                  <Table.Td colSpan={5} ta="center">
                    No users found
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Paper>
      )}

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
