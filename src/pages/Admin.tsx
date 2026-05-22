import { useState, useEffect, useCallback } from 'react';
import { IconPlus, IconTrash, IconDatabase, IconUsers } from '@tabler/icons-react';
import { authApi } from '../services/api';
import type { User } from '../types';
import {
  Box, Button, Heading, Text, Table, Tabs, Dialog, Field,
  Input, NativeSelect, Alert, HStack, VStack, Card, Badge, IconButton, Portal, Spinner, Center,
} from '@chakra-ui/react';

const Admin = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [opened, setOpened] = useState(false);
  const [formData, setFormData] = useState({
    email: '', password: '', firstName: '', lastName: '', roles: 'ROLE_USER',
  });
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

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleCreateUser = async () => {
    try {
      await authApi.createUser({
        email: formData.email, password: formData.password,
        firstName: formData.firstName, lastName: formData.lastName, roles: [formData.roles],
      });
      setOpened(false);
      setFormData({ email: '', password: '', firstName: '', lastName: '', roles: 'ROLE_USER' });
      fetchUsers();
    } catch {
      setError('Failed to create user');
    }
  };

  const handleDeleteUser = async (id: string) => {
    try { await authApi.deleteUser(id); fetchUsers(); }
    catch { setError('Failed to delete user'); }
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
      <Heading as="h1" size="lg" mb={2}>Admin Panel</Heading>
      <Text color="gray.500" fontSize="sm" mb={6}>Manage users and seed sample data.</Text>

      <Tabs.Root defaultValue="users">
        <Tabs.List mb={4}>
          <Tabs.Trigger value="users">
            <IconUsers size={16} />
            <Box ml={1.5}>User Management</Box>
          </Tabs.Trigger>
          <Tabs.Trigger value="seed">
            <IconDatabase size={16} />
            <Box ml={1.5}>Seed Sample Data</Box>
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="users">
          <HStack justify="flex-end" mb={3}>
            <Button colorScheme="blue" onClick={() => setOpened(true)}>
              <IconPlus size={16} />
              <Box ml={1.5}>Add User</Box>
            </Button>
          </HStack>

          {error && (
            <Alert.Root status="error" mb={4}>
              <Alert.Content>{error}</Alert.Content>
            </Alert.Root>
          )}

          {loading ? (
            <Center py={12}><Spinner color="blue.600" /></Center>
          ) : (
            <Box borderWidth="1px" rounded="lg" overflow="hidden">
              <Table.Root>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>Email</Table.ColumnHeader>
                    <Table.ColumnHeader>First Name</Table.ColumnHeader>
                    <Table.ColumnHeader>Last Name</Table.ColumnHeader>
                    <Table.ColumnHeader>Roles</Table.ColumnHeader>
                    <Table.ColumnHeader w="16">Actions</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {users.map((user) => (
                    <Table.Row key={user.id}>
                      <Table.Cell fontWeight="medium">{user.email}</Table.Cell>
                      <Table.Cell>{user.firstName || '-'}</Table.Cell>
                      <Table.Cell>{user.lastName || '-'}</Table.Cell>
                      <Table.Cell>
                        <Badge colorPalette="blue">{user.roles?.join(', ')}</Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <IconButton
                          aria-label="Delete user"
                          colorPalette="red"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id!)}
                          disabled={user.email === 'admin@digitalwallet.com'}
                        >
                          <IconTrash size={16} />
                        </IconButton>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                  {users.length === 0 && (
                    <Table.Row>
                      <Table.Cell colSpan={5} textAlign="center" color="gray.500">No users found.</Table.Cell>
                    </Table.Row>
                  )}
                </Table.Body>
              </Table.Root>
            </Box>
          )}
        </Tabs.Content>

        <Tabs.Content value="seed">
          <Card.Root variant="outline" maxW="lg">
            <Card.Body>
              <VStack gap={4} align="stretch">
                <Box>
                  <Heading as="h2" size="sm" mb={1}>Populate Sample Health Records</Heading>
                  <Text color="gray.500" fontSize="sm">
                    Select a user and click the button below to seed their account with sample
                    immunization records, insurance cards, and lab results. Existing records will
                    not be removed &mdash; new records will be appended.
                  </Text>
                </Box>

                <Field.Root>
                  <Field.Label>Select User</Field.Label>
                  <NativeSelect.Root>
                    <NativeSelect.Field
                      value={seedUserId}
                      onChange={(e) => { setSeedUserId(e.target.value); setSeedStatus(null); }}
                    >
                      <option value="" disabled>Choose a user to seed data for</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id!}>
                          {u.email}{u.firstName ? ` (${u.firstName} ${u.lastName ?? ''})`.trim() : ''}
                        </option>
                      ))}
                    </NativeSelect.Field>
                  </NativeSelect.Root>
                </Field.Root>

                {seedStatus && (
                  <Alert.Root status={seedStatus.type === 'success' ? 'success' : 'error'}>
                    <Alert.Content>{seedStatus.message}</Alert.Content>
                  </Alert.Root>
                )}

                <Button
                  colorScheme="blue"
                  loading={seedLoading}
                  onClick={handleSeedData}
                  disabled={!seedUserId}
                >
                  <IconDatabase size={16} />
                  <Box ml={1.5}>Seed Sample Data</Box>
                </Button>
              </VStack>
            </Card.Body>
          </Card.Root>
        </Tabs.Content>
      </Tabs.Root>

      <Dialog.Root open={opened} onOpenChange={(e) => setOpened(e.open)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Create User</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <VStack gap={4}>
                  <Field.Root>
                    <Field.Label>Email</Field.Label>
                    <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>Password</Field.Label>
                    <Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
                  </Field.Root>
                  <HStack gap={4} w="full">
                    <Field.Root flex={1}>
                      <Field.Label>First Name</Field.Label>
                      <Input value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
                    </Field.Root>
                    <Field.Root flex={1}>
                      <Field.Label>Last Name</Field.Label>
                      <Input value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
                    </Field.Root>
                  </HStack>
                  <Field.Root>
                    <Field.Label>Role</Field.Label>
                    <NativeSelect.Root>
                      <NativeSelect.Field
                        value={formData.roles}
                        onChange={(e) => setFormData({ ...formData, roles: e.target.value || 'ROLE_USER' })}
                      >
                        <option value="ROLE_USER">User</option>
                        <option value="ROLE_ADMIN">Admin</option>
                      </NativeSelect.Field>
                    </NativeSelect.Root>
                  </Field.Root>
                </VStack>
              </Dialog.Body>
              <Dialog.Footer>
                <Button variant="outline" mr={3} onClick={() => setOpened(false)}>Cancel</Button>
                <Button colorScheme="blue" onClick={handleCreateUser}>Create</Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Box>
  );
};

export default Admin;
