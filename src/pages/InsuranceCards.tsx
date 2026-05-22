import { useState, useEffect, useCallback } from 'react';
import { IconPlus, IconTrash, IconArrowUp, IconArrowDown } from '@tabler/icons-react';
import { insuranceCardApi } from '../services/api';
import type { InsuranceCardDto, PageResponse } from '../types';
import {
  Box, Button, Heading, Text, Table, Dialog, Field, Input,
  NativeSelect, Alert, HStack, VStack, IconButton, Portal, Spinner, Center,
} from '@chakra-ui/react';

const PAGE_SIZE_OPTIONS = ['10', '20', '50', '100', 'ALL'];

const InsuranceCards = () => {
  const [cards, setCards] = useState<InsuranceCardDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [opened, setOpened] = useState(false);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [sortBy, setSortBy] = useState('provider');
  const [sortDir, setSortDir] = useState('asc');
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isPaginated, setIsPaginated] = useState(true);
  const [formData, setFormData] = useState<InsuranceCardDto>({
    provider: '', policyNumber: '', groupNumber: '', effectiveDate: '',
    expiryDate: '', memberName: '', relationship: '',
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

  useEffect(() => { fetchCards(); }, [fetchCards]);

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
      await insuranceCardApi.create(formData);
      setOpened(false);
      setFormData({ provider: '', policyNumber: '', groupNumber: '', effectiveDate: '', expiryDate: '', memberName: '', relationship: '' });
      fetchCards();
    } catch {
      setError('Failed to add insurance card');
    }
  };

  const handleDelete = async (id: string) => {
    try { await insuranceCardApi.delete(id); fetchCards(); }
    catch { setError('Failed to delete insurance card'); }
  };

  if (loading) return <Center py={12}><Spinner color="blue.600" /></Center>;

  return (
    <Box>
      <HStack justify="space-between" mb={4}>
        <Box>
          <Heading as="h1" size="lg">Insurance Cards</Heading>
          <Text color="gray.500" fontSize="sm">Manage your insurance card information.</Text>
        </Box>
        <Button colorScheme="blue" onClick={() => setOpened(true)}>
          <IconPlus size={16} />
          <Box ml={1.5}>Add Card</Box>
        </Button>
      </HStack>

      {error && <Alert.Root status="error" mb={4}><Alert.Content>{error}</Alert.Content></Alert.Root>}

      <Box borderWidth="1px" rounded="lg" overflow="hidden">
        <Table.Root>
          <Table.Header>
            <Table.Row>
              {['provider', 'policyNumber', 'memberName', 'effectiveDate', 'expiryDate'].map((col) => (
                <Table.ColumnHeader key={col} cursor="pointer" onClick={() => handleSort(col)}>
                  <HStack gap={1}>
                    <Text>{col === 'policyNumber' ? 'Policy #' : col === 'effectiveDate' ? 'Effective Date' : col === 'expiryDate' ? 'Expiry Date' : col === 'memberName' ? 'Member Name' : col.charAt(0).toUpperCase() + col.slice(1)}</Text>
                    <SortIcon column={col} />
                  </HStack>
                </Table.ColumnHeader>
              ))}
              <Table.ColumnHeader w="16">Actions</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {cards.map((card) => (
              <Table.Row key={card.id}>
                <Table.Cell fontWeight="medium">{card.provider}</Table.Cell>
                <Table.Cell>{card.policyNumber}</Table.Cell>
                <Table.Cell>{card.memberName}</Table.Cell>
                <Table.Cell>{card.effectiveDate}</Table.Cell>
                <Table.Cell>{card.expiryDate}</Table.Cell>
                <Table.Cell>
                  <IconButton aria-label="Delete" colorPalette="red" variant="ghost" size="sm" onClick={() => handleDelete(card.id!)}>
                    <IconTrash size={16} />
                  </IconButton>
                </Table.Cell>
              </Table.Row>
            ))}
            {cards.length === 0 && (
              <Table.Row>
                <Table.Cell colSpan={6} textAlign="center" color="gray.500">No insurance cards found.</Table.Cell>
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
                <Dialog.Title>Add Insurance Card</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <VStack gap={4}>
                  <HStack gap={4} w="full">
                    <Field.Root flex={1}>
                      <Field.Label>Provider</Field.Label>
                      <Input value={formData.provider} onChange={(e) => handleInputChange('provider', e.target.value)} required />
                    </Field.Root>
                    <Field.Root flex={1}>
                      <Field.Label>Policy Number</Field.Label>
                      <Input value={formData.policyNumber} onChange={(e) => handleInputChange('policyNumber', e.target.value)} required />
                    </Field.Root>
                  </HStack>
                  <HStack gap={4} w="full">
                    <Field.Root flex={1}>
                      <Field.Label>Group Number</Field.Label>
                      <Input value={formData.groupNumber} onChange={(e) => handleInputChange('groupNumber', e.target.value)} />
                    </Field.Root>
                    <Field.Root flex={1}>
                      <Field.Label>Member Name</Field.Label>
                      <Input value={formData.memberName} onChange={(e) => handleInputChange('memberName', e.target.value)} />
                    </Field.Root>
                  </HStack>
                  <HStack gap={4} w="full">
                    <Field.Root flex={1}>
                      <Field.Label>Effective Date</Field.Label>
                      <Input type="date" value={formData.effectiveDate} onChange={(e) => handleInputChange('effectiveDate', e.target.value)} />
                    </Field.Root>
                    <Field.Root flex={1}>
                      <Field.Label>Expiry Date</Field.Label>
                      <Input type="date" value={formData.expiryDate} onChange={(e) => handleInputChange('expiryDate', e.target.value)} />
                    </Field.Root>
                  </HStack>
                  <Field.Root>
                    <Field.Label>Relationship</Field.Label>
                    <Input value={formData.relationship} onChange={(e) => handleInputChange('relationship', e.target.value)} />
                  </Field.Root>
                </VStack>
              </Dialog.Body>
              <Dialog.Footer>
                <Button variant="outline" mr={3} onClick={() => setOpened(false)}>Cancel</Button>
                <Button colorScheme="blue" onClick={handleSubmit}>Add Card</Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Box>
  );
};

export default InsuranceCards;
