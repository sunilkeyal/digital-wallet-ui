import { useState, useEffect, useCallback } from 'react';
import { IconPlus, IconTrash, IconArrowUp, IconArrowDown } from '@tabler/icons-react';
import { labResultApi } from '../services/api';
import type { LabResultDto, PageResponse } from '../types';
import {
  Box, Button, Heading, Text, Table, Dialog, Field, Input,
  NativeSelect, Alert, HStack, VStack, IconButton, Portal, Spinner, Center,
} from '@chakra-ui/react';

const PAGE_SIZE_OPTIONS = ['10', '20', '50', '100', 'ALL'];

const LabResults = () => {
  const [results, setResults] = useState<LabResultDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [opened, setOpened] = useState(false);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [sortBy, setSortBy] = useState('testDate');
  const [sortDir, setSortDir] = useState('desc');
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isPaginated, setIsPaginated] = useState(true);
  const [formData, setFormData] = useState<LabResultDto>({
    testName: '', testDate: '', result: '', unit: '',
    referenceRange: '', orderingProvider: '', laboratory: '', notes: '',
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

  useEffect(() => { fetchResults(); }, [fetchResults]);

  const handleInputChange = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handlePageChange = (p: number) => setPage(p);

  const handleSizeChange = (value: string) => {
    setSize(value === 'ALL' ? 1000 : Number(value));
    setPage(1);
  };

  const handleSort = (column: string) => {
    if (sortBy === column) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortBy(column); setSortDir('asc'); }
    setPage(1);
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortBy !== column) return null;
    return sortDir === 'asc' ? <IconArrowUp size={12} /> : <IconArrowDown size={12} />;
  };

  const handleSubmit = async () => {
    try {
      await labResultApi.create(formData);
      setOpened(false);
      setFormData({ testName: '', testDate: '', result: '', unit: '', referenceRange: '', orderingProvider: '', laboratory: '', notes: '' });
      fetchResults();
    } catch {
      setError('Failed to add lab result');
    }
  };

  const handleDelete = async (id: string) => {
    try { await labResultApi.delete(id); fetchResults(); }
    catch { setError('Failed to delete lab result'); }
  };

  if (loading) return <Center py={12}><Spinner color="blue.600" /></Center>;

  return (
    <Box>
      <HStack justify="space-between" mb={4}>
        <Box>
          <Heading as="h1" size="lg">Lab Results</Heading>
          <Text color="gray.500" fontSize="sm">View and manage your laboratory results.</Text>
        </Box>
        <Button colorScheme="blue" onClick={() => setOpened(true)}>
          <IconPlus size={16} />
          <Box ml={1.5}>Add Result</Box>
        </Button>
      </HStack>

      {error && <Alert.Root status="error" mb={4}><Alert.Content>{error}</Alert.Content></Alert.Root>}

      <Box borderWidth="1px" rounded="lg" overflow="hidden">
        <Table.Root>
          <Table.Header>
            <Table.Row>
              {['testName', 'testDate', 'result', 'unit', 'referenceRange', 'orderingProvider', 'laboratory'].map((col) => (
                <Table.ColumnHeader key={col} cursor="pointer" onClick={() => handleSort(col)}>
                  <HStack gap={1}>
                    <Text>{col === 'testName' ? 'Test Name' : col === 'testDate' ? 'Test Date' : col === 'referenceRange' ? 'Reference Range' : col === 'orderingProvider' ? 'Ordering Provider' : col.charAt(0).toUpperCase() + col.slice(1)}</Text>
                    <SortIcon column={col} />
                  </HStack>
                </Table.ColumnHeader>
              ))}
              <Table.ColumnHeader w="16">Actions</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {results.map((result) => (
              <Table.Row key={result.id}>
                <Table.Cell fontWeight="medium">{result.testName}</Table.Cell>
                <Table.Cell>{result.testDate}</Table.Cell>
                <Table.Cell>{result.result}</Table.Cell>
                <Table.Cell>{result.unit}</Table.Cell>
                <Table.Cell>{result.referenceRange}</Table.Cell>
                <Table.Cell>{result.orderingProvider}</Table.Cell>
                <Table.Cell>{result.laboratory}</Table.Cell>
                <Table.Cell>
                  <IconButton aria-label="Delete" colorPalette="red" variant="ghost" size="sm" onClick={() => handleDelete(result.id!)}>
                    <IconTrash size={16} />
                  </IconButton>
                </Table.Cell>
              </Table.Row>
            ))}
            {results.length === 0 && (
              <Table.Row>
                <Table.Cell colSpan={8} textAlign="center" color="gray.500">No lab results found.</Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Root>

        <Box borderTopWidth="1px" p={3}>
          <HStack justify="space-between" wrap="wrap" gap={3}>
            <HStack gap={2}>
              <Text fontSize="sm" color="gray.500">Rows per page:</Text>
              <NativeSelect.Root size="sm" w="70px">
                <NativeSelect.Field value={size === 1000 ? 'ALL' : String(size)} onChange={(e) => handleSizeChange(e.target.value)}>
                  {PAGE_SIZE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </NativeSelect.Field>
              </NativeSelect.Root>
            </HStack>
            <HStack gap={3}>
              <Text fontSize="sm" color="gray.500">
                {size === 1000
                  ? `Showing all ${totalElements} records`
                  : `Showing ${(page - 1) * size + 1}-${Math.min(page * size, totalElements)} of ${totalElements}`}
              </Text>
              {isPaginated && totalPages > 1 && (
                <HStack gap={1}>
                  <Button size="xs" variant="outline" disabled={page <= 1} onClick={() => handlePageChange(page - 1)}>Prev</Button>
                  <Text fontSize="sm" px={2}>{page} of {totalPages}</Text>
                  <Button size="xs" variant="outline" disabled={page >= totalPages} onClick={() => handlePageChange(page + 1)}>Next</Button>
                </HStack>
              )}
            </HStack>
          </HStack>
        </Box>
      </Box>

      <Dialog.Root open={opened} onOpenChange={(e) => setOpened(e.open)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Add Lab Result</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <VStack gap={4}>
                  <HStack gap={4} w="full">
                    <Field.Root flex={1}>
                      <Field.Label>Test Name</Field.Label>
                      <Input value={formData.testName} onChange={(e) => handleInputChange('testName', e.target.value)} required />
                    </Field.Root>
                    <Field.Root flex={1}>
                      <Field.Label>Test Date</Field.Label>
                      <Input type="date" value={formData.testDate} onChange={(e) => handleInputChange('testDate', e.target.value)} />
                    </Field.Root>
                  </HStack>
                  <HStack gap={4} w="full">
                    <Field.Root flex={1}>
                      <Field.Label>Result</Field.Label>
                      <Input value={formData.result} onChange={(e) => handleInputChange('result', e.target.value)} />
                    </Field.Root>
                    <Field.Root flex={1}>
                      <Field.Label>Unit</Field.Label>
                      <Input value={formData.unit} onChange={(e) => handleInputChange('unit', e.target.value)} />
                    </Field.Root>
                  </HStack>
                  <HStack gap={4} w="full">
                    <Field.Root flex={1}>
                      <Field.Label>Reference Range</Field.Label>
                      <Input value={formData.referenceRange} onChange={(e) => handleInputChange('referenceRange', e.target.value)} />
                    </Field.Root>
                    <Field.Root flex={1}>
                      <Field.Label>Ordering Provider</Field.Label>
                      <Input value={formData.orderingProvider} onChange={(e) => handleInputChange('orderingProvider', e.target.value)} />
                    </Field.Root>
                  </HStack>
                  <Field.Root>
                    <Field.Label>Laboratory</Field.Label>
                    <Input value={formData.laboratory} onChange={(e) => handleInputChange('laboratory', e.target.value)} />
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>Notes</Field.Label>
                    <Input value={formData.notes} onChange={(e) => handleInputChange('notes', e.target.value)} />
                  </Field.Root>
                </VStack>
              </Dialog.Body>
              <Dialog.Footer>
                <Button variant="outline" mr={3} onClick={() => setOpened(false)}>Cancel</Button>
                <Button colorScheme="blue" onClick={handleSubmit}>Add Result</Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Box>
  );
};

export default LabResults;
