import { useState, useEffect, useCallback } from 'react';
import { Box, Text, Paper, Table, Button, Modal, TextInput, Alert, Pagination, Select, Stack, ActionIcon, Group } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus, IconTrash, IconArrowUp, IconArrowDown } from '@tabler/icons-react';
import { insuranceCardApi } from '../services/api';
import type { InsuranceCardDto, PageResponse } from '../types';

const PAGE_SIZE_OPTIONS = ['10', '20', '50', '100', 'ALL'];

const InsuranceCards = () => {
  const [cards, setCards] = useState<InsuranceCardDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [opened, { open, close }] = useDisclosure(false);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [sortBy, setSortBy] = useState('provider');
  const [sortDir, setSortDir] = useState('asc');
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isPaginated, setIsPaginated] = useState(true);
  const [formData, setFormData] = useState<InsuranceCardDto>({
    provider: '',
    policyNumber: '',
    groupNumber: '',
    effectiveDate: '',
    expiryDate: '',
    memberName: '',
    relationship: '',
  });

  const fetchCards = useCallback(async () => {
    try {
      setLoading(true);
      const response = await insuranceCardApi.getAll(page - 1, size, sortBy, sortDir);
      const data = response.data;

      if (Array.isArray(data)) {
        setCards(data);
        setTotalElements(data.length);
        setIsPaginated(false);
      } else {
        const pageData = data as PageResponse<InsuranceCardDto>;
        setCards(pageData.content || []);
        setTotalElements(pageData.totalElements || 0);
        setTotalPages(pageData.totalPages || 0);
        setIsPaginated(true);
      }
    } catch {
      setError('Failed to load insurance cards');
    } finally {
      setLoading(false);
    }
  }, [page, size, sortBy, sortDir]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
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

  const handleSubmit = async () => {
    try {
      await insuranceCardApi.create(formData);
      close();
      setFormData({
        provider: '',
        policyNumber: '',
        groupNumber: '',
        effectiveDate: '',
        expiryDate: '',
        memberName: '',
        relationship: '',
      });
      fetchCards();
    } catch {
      setError('Failed to add insurance card');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await insuranceCardApi.delete(id);
      fetchCards();
    } catch {
      setError('Failed to delete insurance card');
    }
  };

  if (loading) return <Text>Loading...</Text>;

  return (
    <Box mt={0} mb={0}>
      <Group justify="space-between" mb="xs">
        <Text size="xl" fw={700}>Insurance Cards</Text>
        <Button leftSection={<IconPlus size={16} />} onClick={open}>
          Add Card
        </Button>
      </Group>

      {error && <Alert color="red" mb="md">{error}</Alert>}

      <Paper radius="md" style={{ overflowX: 'auto' }}>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ cursor: 'pointer' }} onClick={() => handleSort('provider')}>
                <Group gap={4} justify="space-between">
                  Provider
                  {getSortIcon('provider')}
                </Group>
              </Table.Th>
              <Table.Th style={{ cursor: 'pointer' }} onClick={() => handleSort('policyNumber')}>
                <Group gap={4} justify="space-between">
                  Policy Number
                  {getSortIcon('policyNumber')}
                </Group>
              </Table.Th>
              <Table.Th style={{ cursor: 'pointer' }} onClick={() => handleSort('memberName')}>
                <Group gap={4} justify="space-between">
                  Member Name
                  {getSortIcon('memberName')}
                </Group>
              </Table.Th>
              <Table.Th style={{ cursor: 'pointer' }} onClick={() => handleSort('effectiveDate')}>
                <Group gap={4} justify="space-between">
                  Effective Date
                  {getSortIcon('effectiveDate')}
                </Group>
              </Table.Th>
              <Table.Th style={{ cursor: 'pointer' }} onClick={() => handleSort('expiryDate')}>
                <Group gap={4} justify="space-between">
                  Expiry Date
                  {getSortIcon('expiryDate')}
                </Group>
              </Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {cards.map((card) => (
              <Table.Tr key={card.id}>
                <Table.Td>{card.provider}</Table.Td>
                <Table.Td>{card.policyNumber}</Table.Td>
                <Table.Td>{card.memberName}</Table.Td>
                <Table.Td>{card.effectiveDate}</Table.Td>
                <Table.Td>{card.expiryDate}</Table.Td>
                <Table.Td>
                  <ActionIcon color="red" onClick={() => handleDelete(card.id!)}>
                    <IconTrash size={16} />
                  </ActionIcon>
                </Table.Td>
              </Table.Tr>
            ))}
            {cards.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={6} ta="center">
                  No insurance cards found
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
        <Box p="md" style={{ borderTop: '1px solid #eee' }}>
          <Stack gap="xs" align="center">
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
              <Stack gap="xs" align="center">
                <Text size="sm" c="dimmed">
                  {size === 1000
                    ? `Showing all ${totalElements} records`
                    : `Showing ${(page - 1) * size + 1}-${Math.min(page * size, totalElements)} of ${totalElements} records`}
                </Text>
                {totalPages > 1 && (
                  <Pagination
                    value={page}
                    onChange={handlePageChange}
                    total={totalPages}
                    boundaries={1}
                    siblings={1}
                    withEdges
                  />
                )}
              </Stack>
            )}
            {!isPaginated && (
              <Text size="sm" c="dimmed">
                Showing all {totalElements} records
              </Text>
            )}
          </Stack>
        </Box>
      </Paper>

      <Modal opened={opened} onClose={close} title="Add Insurance Card" centered>
        <TextInput
          label="Provider"
          value={formData.provider}
          onChange={(e) => handleInputChange('provider', e.target.value)}
          mb="sm"
          required
        />
        <TextInput
          label="Policy Number"
          value={formData.policyNumber}
          onChange={(e) => handleInputChange('policyNumber', e.target.value)}
          mb="sm"
          required
        />
        <TextInput
          label="Group Number"
          value={formData.groupNumber}
          onChange={(e) => handleInputChange('groupNumber', e.target.value)}
          mb="sm"
        />
        <DateInput
          label="Effective Date"
          value={formData.effectiveDate || undefined}
          onChange={(date) => handleInputChange('effectiveDate', date ?? '')}
          mb="sm"
        />
        <DateInput
          label="Expiry Date"
          value={formData.expiryDate || undefined}
          onChange={(date) => handleInputChange('expiryDate', date ?? '')}
          mb="sm"
        />
        <TextInput
          label="Member Name"
          value={formData.memberName}
          onChange={(e) => handleInputChange('memberName', e.target.value)}
          mb="sm"
        />
        <TextInput
          label="Relationship"
          value={formData.relationship}
          onChange={(e) => handleInputChange('relationship', e.target.value)}
          mb="md"
        />
        <Group justify="flex-end">
          <Button variant="default" onClick={close}>Cancel</Button>
          <Button onClick={handleSubmit}>Add Card</Button>
        </Group>
      </Modal>
    </Box>
  );
};

export default InsuranceCards;
