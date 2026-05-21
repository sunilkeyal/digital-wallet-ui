import { useState, useEffect, useCallback } from 'react';
import { Box, Text, Paper, Table, Button, Modal, TextInput, Alert, Pagination, Select, Stack, ActionIcon, Group } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus, IconTrash, IconArrowUp, IconArrowDown } from '@tabler/icons-react';
import { labResultApi } from '../services/api';
import type { LabResultDto, PageResponse } from '../types';

const PAGE_SIZE_OPTIONS = ['10', '20', '50', '100', 'ALL'];

const LabResults = () => {
  const [results, setResults] = useState<LabResultDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [opened, { open, close }] = useDisclosure(false);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [sortBy, setSortBy] = useState('testDate');
  const [sortDir, setSortDir] = useState('desc');
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isPaginated, setIsPaginated] = useState(true);
  const [formData, setFormData] = useState<LabResultDto>({
    testName: '',
    testDate: '',
    result: '',
    unit: '',
    referenceRange: '',
    orderingProvider: '',
    laboratory: '',
    notes: '',
  });

  const fetchResults = useCallback(async () => {
    try {
      setLoading(true);
      const response = await labResultApi.getAll(page - 1, size, sortBy, sortDir);
      const data = response.data;

      if (Array.isArray(data)) {
        setResults(data);
        setTotalElements(data.length);
        setIsPaginated(false);
      } else {
        const pageData = data as PageResponse<LabResultDto>;
        setResults(pageData.content || []);
        setTotalElements(pageData.totalElements || 0);
        setTotalPages(pageData.totalPages || 0);
        setIsPaginated(true);
      }
    } catch {
      setError('Failed to load lab results');
    } finally {
      setLoading(false);
    }
  }, [page, size, sortBy, sortDir]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

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
      await labResultApi.create(formData);
      close();
      setFormData({
        testName: '',
        testDate: '',
        result: '',
        unit: '',
        referenceRange: '',
        orderingProvider: '',
        laboratory: '',
        notes: '',
      });
      fetchResults();
    } catch {
      setError('Failed to add lab result');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await labResultApi.delete(id);
      fetchResults();
    } catch {
      setError('Failed to delete lab result');
    }
  };

  if (loading) return <Text>Loading...</Text>;

  return (
    <Box mt={0} mb={0}>
      <Group justify="space-between" mb="xs">
        <Text size="xl" fw={700}>Lab Results</Text>
        <Button leftSection={<IconPlus size={16} />} onClick={open}>
          Add Result
        </Button>
      </Group>

      {error && <Alert color="red" mb="md">{error}</Alert>}

      <Paper radius="md" style={{ overflowX: 'auto' }}>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ cursor: 'pointer' }} onClick={() => handleSort('testName')}>
                <Group gap={4} justify="space-between">
                  Test Name
                  {getSortIcon('testName')}
                </Group>
              </Table.Th>
              <Table.Th style={{ cursor: 'pointer' }} onClick={() => handleSort('testDate')}>
                <Group gap={4} justify="space-between">
                  Test Date
                  {getSortIcon('testDate')}
                </Group>
              </Table.Th>
              <Table.Th style={{ cursor: 'pointer' }} onClick={() => handleSort('result')}>
                <Group gap={4} justify="space-between">
                  Result
                  {getSortIcon('result')}
                </Group>
              </Table.Th>
              <Table.Th style={{ cursor: 'pointer' }} onClick={() => handleSort('unit')}>
                <Group gap={4} justify="space-between">
                  Unit
                  {getSortIcon('unit')}
                </Group>
              </Table.Th>
              <Table.Th style={{ cursor: 'pointer' }} onClick={() => handleSort('referenceRange')}>
                <Group gap={4} justify="space-between">
                  Reference Range
                  {getSortIcon('referenceRange')}
                </Group>
              </Table.Th>
              <Table.Th style={{ cursor: 'pointer' }} onClick={() => handleSort('orderingProvider')}>
                <Group gap={4} justify="space-between">
                  Ordering Provider
                  {getSortIcon('orderingProvider')}
                </Group>
              </Table.Th>
              <Table.Th style={{ cursor: 'pointer' }} onClick={() => handleSort('laboratory')}>
                <Group gap={4} justify="space-between">
                  Laboratory
                  {getSortIcon('laboratory')}
                </Group>
              </Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {results.map((result) => (
              <Table.Tr key={result.id}>
                <Table.Td>{result.testName}</Table.Td>
                <Table.Td>{result.testDate}</Table.Td>
                <Table.Td>{result.result}</Table.Td>
                <Table.Td>{result.unit}</Table.Td>
                <Table.Td>{result.referenceRange}</Table.Td>
                <Table.Td>{result.orderingProvider}</Table.Td>
                <Table.Td>{result.laboratory}</Table.Td>
                <Table.Td>
                  <ActionIcon color="red" onClick={() => handleDelete(result.id!)}>
                    <IconTrash size={16} />
                  </ActionIcon>
                </Table.Td>
              </Table.Tr>
            ))}
            {results.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={8} ta="center">
                  No lab results found
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

      <Modal opened={opened} onClose={close} title="Add Lab Result" centered>
        <TextInput
          label="Test Name"
          value={formData.testName}
          onChange={(e) => handleInputChange('testName', e.target.value)}
          mb="sm"
          required
        />
        <DateInput
          label="Test Date"
          value={formData.testDate || undefined}
          onChange={(date) => handleInputChange('testDate', date ?? '')}
          mb="sm"
        />
        <TextInput
          label="Result"
          value={formData.result}
          onChange={(e) => handleInputChange('result', e.target.value)}
          mb="sm"
        />
        <TextInput
          label="Unit"
          value={formData.unit}
          onChange={(e) => handleInputChange('unit', e.target.value)}
          mb="sm"
        />
        <TextInput
          label="Reference Range"
          value={formData.referenceRange}
          onChange={(e) => handleInputChange('referenceRange', e.target.value)}
          mb="sm"
        />
        <TextInput
          label="Ordering Provider"
          value={formData.orderingProvider}
          onChange={(e) => handleInputChange('orderingProvider', e.target.value)}
          mb="sm"
        />
        <TextInput
          label="Laboratory"
          value={formData.laboratory}
          onChange={(e) => handleInputChange('laboratory', e.target.value)}
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
          <Button onClick={handleSubmit}>Add Result</Button>
        </Group>
      </Modal>
    </Box>
  );
};

export default LabResults;
