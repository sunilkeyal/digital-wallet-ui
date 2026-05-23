import { useState, useEffect, useCallback, useRef } from 'react';
import { IconPlus, IconTrash, IconDatabase, IconUsers, IconDownload, IconUpload } from '@tabler/icons-react';
import { authApi } from '../services/api';
import type { User } from '../types';
import {
  Box, Button, Flex, Heading, Text, Table, Tabs, Dialog, Field,
  Input, NativeSelect, Alert, HStack, VStack, Card, Badge, IconButton, Portal, Spinner, Center, Checkbox, Stack,
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

  const [backupTypes, setBackupTypes] = useState<Record<string, boolean>>({
    immunizations: true, insuranceCards: true, labResults: true, notes: true, all: true,
  });
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [restoreWarnOpen, setRestoreWarnOpen] = useState(false);
  const [pendingRestoreFile, setPendingRestoreFile] = useState<File | null>(null);
  const [backupError, setBackupError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleBackupTypeChange = (key: string, checked: boolean) => {
    if (key === 'all') {
      setBackupTypes({
        immunizations: checked, insuranceCards: checked, labResults: checked, notes: checked, all: checked,
      });
    } else {
      const next = { ...backupTypes, [key]: checked };
      const allSelected = next.immunizations && next.insuranceCards && next.labResults && next.notes;
      setBackupTypes({ ...next, all: allSelected });
    }
  };

  const handleBackup = async () => {
    const selected = Object.entries(backupTypes)
      .filter(([k, v]) => v && k !== 'all')
      .map(([k]) => k);
    if (selected.length === 0) { setBackupError('Select at least one data type.'); return; }
    try {
      setBackupLoading(true);
      setBackupError('');
      const ts = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      for (const type of selected) {
        const response = await authApi.backup([type]);
        zip.file(`${type}-${ts}.dwallet`, response.data);
      }
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${ts}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const json = JSON.parse(text);
          setBackupError(json.error || 'Backup failed.');
        } catch {
          setBackupError('Backup failed. Please try again.');
        }
      } else {
        setBackupError(err.response?.data?.error || 'Backup failed. Please try again.');
      }
    } finally {
      setBackupLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingRestoreFile(file);
    setRestoreWarnOpen(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRestore = async () => {
    if (!pendingRestoreFile) return;
    try {
      setRestoreLoading(true);
      setRestoreStatus(null);
      setRestoreWarnOpen(false);
      if (pendingRestoreFile.name.endsWith('.zip')) {
        const JSZip = (await import('jszip')).default;
        const zip = await JSZip.loadAsync(pendingRestoreFile);
        const dwalletFiles = Object.keys(zip.files).filter((name) => name.endsWith('.dwallet'));
        if (dwalletFiles.length === 0) {
          setRestoreStatus({ type: 'error', message: 'No backup files (.dwallet) found in the archive.' });
          setPendingRestoreFile(null); setRestoreLoading(false); return;
        }
        for (const name of dwalletFiles) {
          const blob = await zip.files[name].async('blob');
          const file = new File([blob], name, { type: 'application/octet-stream' });
          await authApi.restore(file);
        }
        setRestoreStatus({ type: 'success', message: `Restored ${dwalletFiles.length} backup file(s) successfully.` });
      } else {
        const response = await authApi.restore(pendingRestoreFile);
        setRestoreStatus({ type: 'success', message: response.data.message });
      }
      setPendingRestoreFile(null);
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Restore failed. Please check the backup file.';
      setRestoreStatus({ type: 'error', message: msg });
    } finally {
      setRestoreLoading(false);
    }
  };

  return (
    <Box>
      <Heading as="h1" size="lg" mb={2}>Admin Panel</Heading>
      <Text color="gray.500" fontSize="sm" mb={6}>Manage users, seed sample data, and backup/restore records.</Text>

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
          <Tabs.Trigger value="backup">
            <IconDownload size={16} />
            <Box ml={1.5}>Backup &amp; Restore</Box>
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="users">
          <HStack justify="flex-end" mb={3}>
            <Button colorPalette="teal" onClick={() => setOpened(true)}>
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
            <Center py={12}><Spinner color="teal.600" /></Center>
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
                        <Badge colorPalette="teal">{user.roles?.join(', ')}</Badge>
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
                  colorPalette="teal"
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

        <Tabs.Content value="backup">
          <Flex gap={{ base: 4, md: 6 }} align="stretch" direction={{ base: 'column', md: 'row' }}>
            <Card.Root variant="outline" flex={1}>
              <Card.Body p={{ base: 3, md: 6 }}>
                <VStack gap={{ base: 3, md: 4 }} align="stretch">
                  <Box>
                    <Heading as="h2" size={{ base: 'sm', md: 'md' }} mb={1}>Backup</Heading>
                    <Text color="gray.500" fontSize={{ base: 'xs', md: 'sm' }}>
                      Create an encrypted snapshot of your selected data. The backup file is
                      AES-256 encrypted and can only be restored through this admin panel.
                      Each data type is stored as a separate file within the archive.
                    </Text>
                  </Box>

                  <Stack gap={2}>
                    <Checkbox.Root
                      checked={backupTypes.all}
                      onCheckedChange={(e) => handleBackupTypeChange('all', !!e.checked)}
                    >
                      <Checkbox.HiddenInput />
                      <Checkbox.Control />
                      <Checkbox.Label fontWeight="semibold">All Data</Checkbox.Label>
                    </Checkbox.Root>
                    <Box pl={{ base: 4, md: 6 }}>
                      <Stack gap={1}>
                        <Checkbox.Root
                          checked={backupTypes.immunizations}
                          onCheckedChange={(e) => handleBackupTypeChange('immunizations', !!e.checked)}
                        >
                          <Checkbox.HiddenInput />
                          <Checkbox.Control />
                          <Checkbox.Label>Immunizations</Checkbox.Label>
                        </Checkbox.Root>
                        <Checkbox.Root
                          checked={backupTypes.insuranceCards}
                          onCheckedChange={(e) => handleBackupTypeChange('insuranceCards', !!e.checked)}
                        >
                          <Checkbox.HiddenInput />
                          <Checkbox.Control />
                          <Checkbox.Label>Insurance Cards</Checkbox.Label>
                        </Checkbox.Root>
                        <Checkbox.Root
                          checked={backupTypes.labResults}
                          onCheckedChange={(e) => handleBackupTypeChange('labResults', !!e.checked)}
                        >
                          <Checkbox.HiddenInput />
                          <Checkbox.Control />
                          <Checkbox.Label>Lab Results</Checkbox.Label>
                        </Checkbox.Root>
                        <Checkbox.Root
                          checked={backupTypes.notes}
                          onCheckedChange={(e) => handleBackupTypeChange('notes', !!e.checked)}
                        >
                          <Checkbox.HiddenInput />
                          <Checkbox.Control />
                          <Checkbox.Label>Notes</Checkbox.Label>
                        </Checkbox.Root>
                      </Stack>
                    </Box>
                  </Stack>

                  {backupError && (
                    <Alert.Root status="error">

                      <Alert.Content>{backupError}</Alert.Content>
                    </Alert.Root>
                  )}

                  <Button colorPalette="teal" loading={backupLoading} onClick={handleBackup} w={{ base: 'full', md: 'auto' }}>
                    <IconDownload size={16} />
                    <Box ml={1.5}>Download Backup</Box>
                  </Button>
                </VStack>
              </Card.Body>
            </Card.Root>

            <Card.Root variant="outline" flex={1}>
              <Card.Body p={{ base: 3, md: 6 }}>
                <VStack gap={{ base: 3, md: 4 }} align="stretch">
                  <Box>
                    <Heading as="h2" size={{ base: 'sm', md: 'md' }} mb={1}>Restore</Heading>
                    <Text color="gray.500" fontSize={{ base: 'xs', md: 'sm' }}>
                      Upload a previously created backup archive (.zip) to restore your data.
                      The system will decrypt the archive, delete all existing records for the
                      data types found in the backup, and replace them with the backed-up data.
                    </Text>
                    <Alert.Root status="warning" mt={3}>
                      <Alert.Content>
                        <Text fontWeight="semibold">Warning:</Text>
                        This operation is irreversible. All current records will be permanently
                        deleted before the restore begins. We recommend creating a fresh backup
                        before proceeding.
                      </Alert.Content>
                    </Alert.Root>
                  </Box>

                  {restoreStatus && (
                    <Alert.Root status={restoreStatus.type === 'success' ? 'success' : 'error'}>
                      <Alert.Content>{restoreStatus.message}</Alert.Content>
                    </Alert.Root>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".zip"
                    style={{ display: 'none' }}
                    onChange={handleFileSelect}
                  />
                  <Button
                    colorPalette="teal"
                    variant="outline"
                    loading={restoreLoading}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={restoreLoading}
                    w={{ base: 'full', md: 'auto' }}
                  >
                    <IconUpload size={16} />
                    <Box ml={1.5}>Upload &amp; Restore</Box>
                  </Button>
                </VStack>
              </Card.Body>
            </Card.Root>
          </Flex>

          <Dialog.Root open={restoreWarnOpen} onOpenChange={(e) => { if (!e.open) setRestoreWarnOpen(false); }}>
            <Portal>
              <Dialog.Backdrop />
              <Dialog.Positioner>
                <Dialog.Content>
                  <Dialog.Header>
                    <Dialog.Title>Warning: Data Will Be Deleted</Dialog.Title>
                  </Dialog.Header>
                  <Dialog.Body>
                    <Text mb={3}>
                      Restoring from a backup will <strong>permanently delete all existing records</strong>
                      and replace them with the data from the backup archive. All backup files found
                      in the archive will be processed. This action cannot be undone.
                    </Text>
                    <Alert.Root status="error">
                      <Alert.Content>
                        Are you sure you want to proceed with the restore?
                      </Alert.Content>
                    </Alert.Root>
                  </Dialog.Body>
                  <Dialog.Footer>
                    <Button variant="ghost" mr={3} onClick={() => { setRestoreWarnOpen(false); setPendingRestoreFile(null); }}>Cancel</Button>
                    <Button colorPalette="red" onClick={handleRestore}>Restore</Button>
                  </Dialog.Footer>
                </Dialog.Content>
              </Dialog.Positioner>
            </Portal>
          </Dialog.Root>
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
                <Button variant="ghost" mr={3} onClick={() => setOpened(false)}>Cancel</Button>
                <Button colorPalette="teal" onClick={handleCreateUser}>Create</Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Box>
  );
};

export default Admin;
