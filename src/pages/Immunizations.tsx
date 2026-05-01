import { useState, useEffect, useCallback } from 'react';
import { Box, Text, Paper, Table, Button, Modal, TextInput, Select, Alert, Pagination, Group, ActionIcon } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus, IconTrash, IconArrowUp, IconArrowDown } from '@tabler/icons-react';
import { immunizationApi } from '../services/api';
import type { ImmunizationDto, PageResponse } from '../types';

const PAGE_SIZE_OPTIONS = ['10', '20', '50', '100', 'ALL'];

const Immunizations = () => {
  const [immunizations, setImmunizations] = useState<ImmunizationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [opened, { open, close }] = useDisclosure(false);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [sortBy, setSortBy] = useState('vaccineName');
  const [sortDir, setSortDir] = useState('asc');
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isPaginated, setIsPaginated] = useState(true);
  const [formData, setFormData] = useState<ImmunizationDto>({
    vaccineName: '',
    manufacturer: '',
    lotNumber: '',
    administrationDate: '',
    administeredBy: '',
    facilityName: '',
    facilityAddress: '',
    notes: '',
  });

  const fetchImmunizations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await immunizationApi.getAll(page - 1, size, sortBy, sortDir);
      const data = response.data;

      if (Array.isArray(data)) {
        setImmunizations(data);
        setTotalElements(data.length);
        setIsPaginated(false);
      } else {
        const pageData = data as PageResponse<ImmunizationDto>;
        setImmunizations(pageData.content || []);
        setTotalElements(pageData.totalElements || 0);
        setTotalPages(pageData.totalPages || 0);
        setIsPaginated(true);
      }
    } catch {
      setError('Failed to load immunizations');
    } finally {
      setLoading(false);
    }
  }, [page, size, sortBy, sortDir]);

  useEffect(() => {
    fetchImmunizations();
  }, [fetchImmunizations]);

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    try {
      await immunizationApi.create(formData);
      close();
      setFormData({
        vaccineName: '',
        manufacturer: '',
        lotNumber: '',
        administrationDate: '',
        administeredBy: '',
        facilityName: '',
        facilityAddress: '',
        notes: '',
      });
      fetchImmunizations();
    } catch {
      setError('Failed to add immunization');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await immunizationApi.delete(id);
      fetchImmunizations();
    } catch {
      setError('Failed to delete immunization');
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleSizeChange = (value: string | null) => {
    const newSize = value === 'ALL' ? 1000 : Number(value);
    setSize(newSize);
    setPage(1);
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
    setPage(1);
  };

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return null;
    return sortDir === 'asc' ? <IconArrowUp size={14} /> : <IconArrowDown size={14} />;
  };

  if (loading) return <Text>Loading...</Text>;

  return (
    <Box mt={0} mb={0}>
      <Group justify="space-between" mb="xs">
        <Text size="xl" fw={700}>Immunization History</Text>
        <Button leftSection={<IconPlus size={16} />} onClick={open}>
          Add Record
        </Button>
      </Group>

      {error && <Alert color="red" mb="md">{error}</Alert>}

      <Paper radius="md">
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ cursor: 'pointer' }} onClick={() => handleSort('vaccineName')}>
                <Group gap={4} justify="space-between">
                  Vaccine
                  {getSortIcon('vaccineName')}
                </Group>
              </Table.Th>
              <Table.Th style={{ cursor: 'pointer' }} onClick={() => handleSort('manufacturer')}>
                <Group gap={4} justify="space-between">
                  Manufacturer
                  {getSortIcon('manufacturer')}
                </Group>
              </Table.Th>
              <Table.Th style={{ cursor: 'pointer' }} onClick={() => handleSort('lotNumber')}>
                <Group gap={4} justify="space-between">
                  Lot Number
                  {getSortIcon('lotNumber')}
                </Group>
              </Table.Th>
              <Table.Th style={{ cursor: 'pointer' }} onClick={() => handleSort('administrationDate')}>
                <Group gap={4} justify="space-between">
                  Date Administered
                  {getSortIcon('administrationDate')}
                </Group>
              </Table.Th>
              <Table.Th style={{ cursor: 'pointer' }} onClick={() => handleSort('administeredBy')}>
                <Group gap={4} justify="space-between">
                  Administered By
                  {getSortIcon('administeredBy')}
                </Group>
              </Table.Th>
              <Table.Th style={{ cursor: 'pointer' }} onClick={() => handleSort('facilityName')}>
                <Group gap={4} justify="space-between">
                  Facility
                  {getSortIcon('facilityName')}
                </Group>
              </Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {immunizations.map((imm) => (
              <Table.Tr key={imm.id}>
                <Table.Td>{imm.vaccineName}</Table.Td>
                <Table.Td>{imm.manufacturer}</Table.Td>
                <Table.Td>{imm.lotNumber}</Table.Td>
                <Table.Td>{imm.administrationDate}</Table.Td>
                <Table.Td>{imm.administeredBy}</Table.Td>
                <Table.Td>{imm.facilityName}</Table.Td>
                <Table.Td>
                  <ActionIcon color="red" onClick={() => handleDelete(imm.id!)}>
                    <IconTrash size={16} />
                  </ActionIcon>
                </Table.Td>
              </Table.Tr>
            ))}
            {immunizations.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={7} ta="center">
                  No immunization records found
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
        <Group justify="space-between" p="md" style={{ borderTop: '1px solid #eee' }}>
          <Group gap="xs">
            <Text size="sm" c="dimmed">Rows per page:</Text>
            <Select
              size="xs"
              value={size === 1000 ? 'ALL' : String(size)}
              onChange={handleSizeChange}
              data={PAGE_SIZE_OPTIONS}
              style={{ width: 70 }}
            />
          </Group>
          {isPaginated && (
            <>
              <Text size="sm" c="dimmed">
                {size === 1000
                  ? `Showing all ${totalElements} records`
                  : `Showing ${(page - 1) * size + 1}-${Math.min(page * size, totalElements)} of ${totalElements} records`}
              </Text>
              {totalPages > 1 && (
                <Group gap="xs">
                  <Pagination
                    value={page}
                    onChange={handlePageChange}
                    total={totalPages}
                    boundaries={1}
                    siblings={1}
                    withEdges
                  />
                </Group>
              )}
            </>
          )}
          {!isPaginated && (
            <Text size="sm" c="dimmed">
              Showing all {totalElements} records
            </Text>
          )}
        </Group>
      </Paper>

      <Modal opened={opened} onClose={close} title="Add Immunization Record" centered>
        <TextInput
          label="Vaccine Name"
          value={formData.vaccineName}
          onChange={(e) => handleInputChange('vaccineName', e.target.value)}
          mb="sm"
          required
        />
        <TextInput
          label="Manufacturer"
          value={formData.manufacturer}
          onChange={(e) => handleInputChange('manufacturer', e.target.value)}
          mb="sm"
        />
        <TextInput
          label="Lot Number"
          value={formData.lotNumber}
          onChange={(e) => handleInputChange('lotNumber', e.target.value)}
          mb="sm"
        />
        <DateInput
          label="Date Administered"
          value={formData.administrationDate || undefined}
          onChange={(date) => handleInputChange('administrationDate', date ?? '')}
          mb="sm"
        />
        <TextInput
          label="Administered By"
          value={formData.administeredBy}
          onChange={(e) => handleInputChange('administeredBy', e.target.value)}
          mb="sm"
        />
        <TextInput
          label="Facility Name"
          value={formData.facilityName}
          onChange={(e) => handleInputChange('facilityName', e.target.value)}
          mb="sm"
        />
        <TextInput
          label="Facility Address"
          value={formData.facilityAddress}
          onChange={(e) => handleInputChange('facilityAddress', e.target.value)}
          mb="sm"
        />
        <TextInput
          label="Notes"
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          mb="md"
        />
        <Group justify="flex-end">
          <Button variant="default" onClick={close}>Cancel</Button>
          <Button onClick={handleSubmit}>Add Record</Button>
        </Group>
      </Modal>
    </Box>
  );
};

export default Immunizations;
