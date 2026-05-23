import { useState, useEffect, useCallback } from 'react';
import { IconPlus, IconTrash, IconArrowUp, IconArrowDown } from '@tabler/icons-react';
import { immunizationApi } from '../services/api';
import type { ImmunizationDto, PageResponse } from '../types';
import {
  Box, Button, Heading, Text, Table, Dialog, Field, Input,
  NativeSelect, Alert, HStack, VStack, IconButton, Portal, Spinner, Center, Badge,
} from '@chakra-ui/react';

const PAGE_SIZE_OPTIONS = ['10', '20', '50', '100', 'ALL'];

const Immunizations = () => {
  const [immunizations, setImmunizations] = useState<ImmunizationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [opened, setOpened] = useState(false);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [sortBy, setSortBy] = useState('vaccineName');
  const [sortDir, setSortDir] = useState('asc');
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isPaginated, setIsPaginated] = useState(true);
  const [patientFilter, setPatientFilter] = useState(() => {
    try { return localStorage.getItem('immunizationPatientFilter') || ''; } catch { return ''; }
  });
  const [formData, setFormData] = useState<ImmunizationDto>({
    vaccineName: '', patientName: '', manufacturer: '', lotNumber: '', administrationDate: '',
    administeredBy: '', facilityName: '', facilityAddress: '', notes: '',
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

  useEffect(() => { fetchImmunizations(); }, [fetchImmunizations]);

  useEffect(() => { localStorage.setItem('immunizationPatientFilter', patientFilter); }, [patientFilter]);

  const patientNames = [...new Set(immunizations.map((i) => i.patientName).filter(Boolean))].sort();
  const displayedImmunizations = patientFilter
    ? immunizations.filter((i) => i.patientName === patientFilter)
    : immunizations;

  const handleInputChange = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    try {
      await immunizationApi.create(formData);
      setOpened(false);
      setFormData({ vaccineName: '', patientName: '', manufacturer: '', lotNumber: '', administrationDate: '', administeredBy: '', facilityName: '', facilityAddress: '', notes: '' });
      fetchImmunizations();
    } catch {
      setError('Failed to add immunization');
    }
  };

  const handleDelete = async (id: string) => {
    try { await immunizationApi.delete(id); fetchImmunizations(); }
    catch { setError('Failed to delete immunization'); }
  };

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

  if (loading) return <Center py={12}><Spinner color="blue.600" /></Center>;

  return (
    <Box>
      <HStack justify="space-between" mb={4}>
        <Box>
          <Heading as="h1" size="lg">Immunization History</Heading>
          <Text color="gray.500" fontSize="sm">Manage your vaccination records.</Text>
        </Box>
        <Button colorScheme="blue" onClick={() => setOpened(true)}>
          <IconPlus size={16} />
          <Box ml={1.5}>Add Record</Box>
        </Button>
      </HStack>

      {error && <Alert.Root status="error" mb={4}><Alert.Content>{error}</Alert.Content></Alert.Root>}

      {patientNames.length > 0 && (
        <HStack mb={3} gap={2}>
          <Text fontSize="sm" color="gray.500">Filter by person:</Text>
          <NativeSelect.Root size="sm" w="fit-content">
            <NativeSelect.Field value={patientFilter} onChange={(e) => { setPatientFilter(e.target.value); setPage(1); }}>
              <option value="">All</option>
              {patientNames.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </HStack>
      )}

      <Box borderWidth="1px" rounded="lg" overflow="hidden">
        <Table.Root>
          <Table.Header>
            <Table.Row>
              {['patientName', 'vaccineName', 'manufacturer', 'lotNumber', 'administrationDate', 'administeredBy', 'facilityName'].map((col) => (
                <Table.ColumnHeader key={col} cursor="pointer" onClick={() => handleSort(col)}>
                  <HStack gap={1}>
                    <Text>{col === 'vaccineName' ? 'Vaccine' : col === 'patientName' ? 'Person' : col === 'administrationDate' ? 'Date Administered' : col === 'administeredBy' ? 'Administered By' : col === 'facilityName' ? 'Facility' : col.charAt(0).toUpperCase() + col.slice(1)}</Text>
                    <SortIcon column={col} />
                  </HStack>
                </Table.ColumnHeader>
              ))}
              <Table.ColumnHeader w="16">Actions</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {displayedImmunizations.map((imm) => (
              <Table.Row key={imm.id}>
                <Table.Cell><Badge colorPalette="teal">{imm.patientName}</Badge></Table.Cell>
                <Table.Cell fontWeight="medium">{imm.vaccineName}</Table.Cell>
                <Table.Cell>{imm.manufacturer}</Table.Cell>
                <Table.Cell>{imm.lotNumber}</Table.Cell>
                <Table.Cell>{imm.administrationDate}</Table.Cell>
                <Table.Cell>{imm.administeredBy}</Table.Cell>
                <Table.Cell>{imm.facilityName}</Table.Cell>
                <Table.Cell>
                  <IconButton aria-label="Delete" colorPalette="red" variant="ghost" size="sm" onClick={() => handleDelete(imm.id!)}>
                    <IconTrash size={16} />
                  </IconButton>
                </Table.Cell>
              </Table.Row>
            ))}
            {displayedImmunizations.length === 0 && (
              <Table.Row>
                <Table.Cell colSpan={8} textAlign="center" color="gray.500">No immunization records found.</Table.Cell>
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
                {patientFilter
                  ? `Showing ${displayedImmunizations.length} record(s) for "${patientFilter}"`
                  : size === 1000
                    ? `Showing all ${totalElements} records`
                    : `Showing ${(page - 1) * size + 1}-${Math.min(page * size, totalElements)} of ${totalElements}`}
              </Text>
              {!patientFilter && isPaginated && totalPages > 1 && (
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
                <Dialog.Title>Add Immunization Record</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <VStack gap={4}>
                  <Field.Root>
                    <Field.Label>Vaccine Name</Field.Label>
                    <Input value={formData.vaccineName} onChange={(e) => handleInputChange('vaccineName', e.target.value)} required />
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>Person</Field.Label>
                    <Input value={formData.patientName ?? ''} onChange={(e) => handleInputChange('patientName', e.target.value)} placeholder="e.g. John, Jane, Mom" />
                  </Field.Root>
                  <HStack gap={4} w="full">
                    <Field.Root flex={1}>
                      <Field.Label>Manufacturer</Field.Label>
                      <Input value={formData.manufacturer} onChange={(e) => handleInputChange('manufacturer', e.target.value)} />
                    </Field.Root>
                    <Field.Root flex={1}>
                      <Field.Label>Lot Number</Field.Label>
                      <Input value={formData.lotNumber} onChange={(e) => handleInputChange('lotNumber', e.target.value)} />
                    </Field.Root>
                  </HStack>
                  <HStack gap={4} w="full">
                    <Field.Root flex={1}>
                      <Field.Label>Date Administered</Field.Label>
                      <Input type="date" value={formData.administrationDate} onChange={(e) => handleInputChange('administrationDate', e.target.value)} />
                    </Field.Root>
                    <Field.Root flex={1}>
                      <Field.Label>Administered By</Field.Label>
                      <Input value={formData.administeredBy} onChange={(e) => handleInputChange('administeredBy', e.target.value)} />
                    </Field.Root>
                  </HStack>
                  <Field.Root>
                    <Field.Label>Facility Name</Field.Label>
                    <Input value={formData.facilityName} onChange={(e) => handleInputChange('facilityName', e.target.value)} />
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>Facility Address</Field.Label>
                    <Input value={formData.facilityAddress} onChange={(e) => handleInputChange('facilityAddress', e.target.value)} />
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>Notes</Field.Label>
                    <Input value={formData.notes} onChange={(e) => handleInputChange('notes', e.target.value)} />
                  </Field.Root>
                </VStack>
              </Dialog.Body>
              <Dialog.Footer>
                <Button variant="outline" mr={3} onClick={() => setOpened(false)}>Cancel</Button>
                <Button colorScheme="blue" onClick={handleSubmit}>Add Record</Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Box>
  );
};

export default Immunizations;
