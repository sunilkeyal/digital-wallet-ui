import { useState, useEffect, useCallback, useRef } from 'react';
import { IconPlus, IconTrash, IconArrowUp, IconArrowDown, IconUpload } from '@tabler/icons-react';
import { immunizationApi } from '../services/api';
import type { ImmunizationDto, PageResponse } from '../types';
import { formatDate } from '../utils/format';
import {
  Box, Button, Heading, Text, Table, Dialog, Field, Input,
  NativeSelect, Alert, HStack, VStack, IconButton, Portal, Spinner, Center, Badge, Pagination,
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
  const [patientFilter, setPatientFilter] = useState(() => {
    try { return localStorage.getItem('immunizationPatientFilter') || ''; } catch { return ''; }
  });
  const [formData, setFormData] = useState<ImmunizationDto>({
    vaccineName: '', patientName: '', tradeName: '', administrationDate: '',
    administeredBy: '', facilityName: '', facilityAddress: '', notes: '',
  });
  const [ocrOpen, setOcrOpen] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrRecords, setOcrRecords] = useState<ImmunizationDto[]>([]);
  const [ocrError, setOcrError] = useState('');
  const [ocrSaved, setOcrSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchSize = 1000;
  const fetchPage = 0;

  const fetchImmunizations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await immunizationApi.getAll(fetchPage, fetchSize, sortBy, sortDir);
      const data = response.data;
      if (Array.isArray(data)) {
        setImmunizations(data);
      } else {
        const pageData = data as PageResponse<ImmunizationDto>;
        setImmunizations(pageData.content || []);
      }
    } catch {
      setError('Failed to load immunizations');
    } finally {
      setLoading(false);
    }
  }, [fetchPage, fetchSize, sortBy, sortDir]);

  useEffect(() => { fetchImmunizations(); }, [fetchImmunizations]);

  useEffect(() => { localStorage.setItem('immunizationPatientFilter', patientFilter); }, [patientFilter]);

  const patientNames = [...new Set(immunizations.map((i) => i.patientName).filter(Boolean))].sort();
  const displayedImmunizations = patientFilter
    ? immunizations.filter((i) => i.patientName === patientFilter)
    : immunizations;
  const localTotalPages = Math.ceil(displayedImmunizations.length / size) || 1;
  const pagedImmunizations = displayedImmunizations.slice((page - 1) * size, page * size);

  const handleInputChange = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    try {
      await immunizationApi.create(formData);
      setOpened(false);
      setFormData({ vaccineName: '', patientName: '', tradeName: '', administrationDate: '', administeredBy: '', facilityName: '', facilityAddress: '', notes: '' });
      fetchImmunizations();
    } catch {
      setError('Failed to add immunization');
    }
  };

  const handleDelete = async (id: string) => {
    try { await immunizationApi.delete(id); fetchImmunizations(); }
    catch { setError('Failed to delete immunization'); }
  };

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

  const handleOcrFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setOcrLoading(true);
    setOcrError('');
    setOcrSaved(false);
    setOcrRecords([]);
    try {
      const response = await immunizationApi.ocr(file);
      setOcrRecords(response.data.records);
      if (response.data.count === 0) {
        setOcrError('No immunization records could be extracted from the PDF.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'OCR processing failed.';
      setOcrError(msg);
    } finally {
      setOcrLoading(false);
      setOcrOpen(true);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleOcrSave = async () => {
    try {
      setOcrLoading(true);
      await immunizationApi.saveOcrRecords(ocrRecords);
      setOcrSaved(true);
      setOcrOpen(false);
      fetchImmunizations();
    } catch {
      setOcrError('Failed to save records.');
    } finally {
      setOcrLoading(false);
    }
  };

  const updateOcrRecord = (index: number, field: string, value: string) => {
    setOcrRecords((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  if (loading) return <Center py={12}><Spinner color="blue.600" /></Center>;

  return (
    <Box>
      <HStack justify="space-between" mb={4}>
        <Box>
          <Heading as="h1" size="lg">Immunization History</Heading>
          <Text color="gray.500" fontSize="sm">Manage your vaccination records.</Text>
        </Box>
        <HStack gap={2}>
          <Button colorScheme="blue" onClick={() => setOpened(true)}>
            <IconPlus size={16} />
            <Box ml={1.5}>Add Record</Box>
          </Button>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <IconUpload size={16} />
            <Box ml={1.5}>Upload PDF</Box>
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            style={{ display: 'none' }}
            onChange={handleOcrFileSelect}
          />
        </HStack>
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
              {['patientName', 'vaccineName', 'tradeName', 'administrationDate', 'administeredBy', 'facilityName'].map((col) => (
                <Table.ColumnHeader key={col} cursor="pointer" onClick={() => handleSort(col)}>
                  <HStack gap={1}>
                    <Text>{col === 'vaccineName' ? 'Vaccine' : col === 'patientName' ? 'Person' : col === 'administrationDate' ? 'Date Administered' : col === 'administeredBy' ? 'Administered By' : col === 'facilityName' ? 'Facility' : col === 'tradeName' ? 'Trade Name' : col.charAt(0).toUpperCase() + col.slice(1)}</Text>
                    <SortIcon column={col} />
                  </HStack>
                </Table.ColumnHeader>
              ))}
              <Table.ColumnHeader w="16">Actions</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {pagedImmunizations.map((imm) => (
              <Table.Row key={imm.id}>
                <Table.Cell><Badge colorPalette="teal">{imm.patientName}</Badge></Table.Cell>
                <Table.Cell fontWeight="medium">{imm.vaccineName}</Table.Cell>
                <Table.Cell>{imm.tradeName}</Table.Cell>
                <Table.Cell>{formatDate(imm.administrationDate)}</Table.Cell>
                <Table.Cell>{imm.administeredBy}</Table.Cell>
                <Table.Cell>{imm.facilityName}</Table.Cell>
                <Table.Cell>
                  <IconButton aria-label="Delete" colorPalette="red" variant="ghost" size="sm" onClick={() => handleDelete(imm.id!)}>
                    <IconTrash size={16} />
                  </IconButton>
                </Table.Cell>
              </Table.Row>
            ))}
            {pagedImmunizations.length === 0 && (
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
              <NativeSelect.Root size="sm" w="auto">
                <NativeSelect.Field value={size === 1000 ? 'ALL' : String(size)} onChange={(e) => handleSizeChange(e.target.value)}>
                  {PAGE_SIZE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
            </HStack>
            <HStack gap={3}>
              <Text fontSize="sm" color="gray.500">
                {patientFilter
                  ? pagedImmunizations.length < displayedImmunizations.length
                    ? `Showing ${(page - 1) * size + 1}-${(page - 1) * size + pagedImmunizations.length} of ${displayedImmunizations.length} for "${patientFilter}"`
                    : `Showing ${displayedImmunizations.length} record(s) for "${patientFilter}"`
                  : size >= displayedImmunizations.length
                    ? `Showing all ${displayedImmunizations.length} records`
                    : `Showing ${(page - 1) * size + 1}-${Math.min(page * size, displayedImmunizations.length)} of ${displayedImmunizations.length}`}
              </Text>
              {localTotalPages > 1 && (
                <Pagination.Root
                  count={displayedImmunizations.length}
                  pageSize={size}
                  page={page}
                  onPageChange={(e) => setPage(e.page)}
                >
                  <HStack gap={1}>
                    <Pagination.PrevTrigger asChild>
                      <Button size="xs" variant="outline">Prev</Button>
                    </Pagination.PrevTrigger>
                    <Pagination.PageText format="compact" />
                    <Pagination.NextTrigger asChild>
                      <Button size="xs" variant="outline">Next</Button>
                    </Pagination.NextTrigger>
                  </HStack>
                </Pagination.Root>
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
                  <Field.Root>
                    <Field.Label>Trade Name</Field.Label>
                    <Input value={formData.tradeName} onChange={(e) => handleInputChange('tradeName', e.target.value)} placeholder="e.g. Pfizer-BioNTech LOT-123456" />
                  </Field.Root>
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

      <Dialog.Root open={ocrOpen} onOpenChange={(e) => { if (!e.open && !ocrLoading) { setOcrOpen(false); } }}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content maxW="800px">
              <Dialog.Header>
                <Dialog.Title>
                  {ocrLoading ? 'Processing PDF...' : ocrSaved ? 'Records Saved' : 'Extracted Immunization Records'}
                </Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                {ocrLoading && (
                  <Center py={8}>
                    <VStack gap={4}>
                      <Spinner color="teal.600" size="xl" />
                      <Text>Running OCR on PDF...</Text>
                    </VStack>
                  </Center>
                )}
                {!ocrLoading && ocrError && (
                  <Alert.Root status="error" mb={4}>
                    <Alert.Content>{ocrError}</Alert.Content>
                  </Alert.Root>
                )}
                {!ocrLoading && !ocrError && ocrRecords.length > 0 && (
                  <VStack gap={4} align="stretch">
                    <Text fontSize="sm" color="gray.500">
                      {ocrRecords.length} record(s) extracted. Review and edit fields before saving.
                    </Text>
                    {ocrRecords.map((rec, i) => (
                      <Box key={i} borderWidth="1px" rounded="md" p={3}>
                        <HStack justify="space-between" mb={2}>
                          <Text fontWeight="semibold" fontSize="sm">Record #{i + 1}</Text>
                        </HStack>
                        <VStack gap={2} align="stretch">
                          <HStack gap={2}>
                            <Field.Root flex={1}>
                              <Field.Label fontSize="xs">Person</Field.Label>
                              <Input size="sm" value={rec.patientName ?? ''}
                                onChange={(e) => updateOcrRecord(i, 'patientName', e.target.value)} />
                            </Field.Root>
                            <Field.Root flex={2}>
                              <Field.Label fontSize="xs">Vaccine</Field.Label>
                              <Input size="sm" value={rec.vaccineName ?? ''}
                                onChange={(e) => updateOcrRecord(i, 'vaccineName', e.target.value)} />
                            </Field.Root>
                          </HStack>
                          <HStack gap={2}>
                            <Field.Root flex={2}>
                              <Field.Label fontSize="xs">Trade Name</Field.Label>
                              <Input size="sm" value={rec.tradeName ?? ''}
                                onChange={(e) => updateOcrRecord(i, 'tradeName', e.target.value)} />
                            </Field.Root>
                            <Field.Root flex={1}>
                              <Field.Label fontSize="xs">Date</Field.Label>
                              <Input size="sm" type="date" value={rec.administrationDate ?? ''}
                                onChange={(e) => updateOcrRecord(i, 'administrationDate', e.target.value)} />
                            </Field.Root>
                          </HStack>
                          <HStack gap={2}>
                            <Field.Root flex={1}>
                              <Field.Label fontSize="xs">Administered By</Field.Label>
                              <Input size="sm" value={rec.administeredBy ?? ''}
                                onChange={(e) => updateOcrRecord(i, 'administeredBy', e.target.value)} />
                            </Field.Root>
                            <Field.Root flex={1}>
                              <Field.Label fontSize="xs">Facility</Field.Label>
                              <Input size="sm" value={rec.facilityName ?? ''}
                                onChange={(e) => updateOcrRecord(i, 'facilityName', e.target.value)} />
                            </Field.Root>
                          </HStack>
                        </VStack>
                      </Box>
                    ))}
                  </VStack>
                )}
                {!ocrLoading && !ocrError && ocrRecords.length === 0 && (
                  <Text color="gray.500">No records were extracted from the PDF.</Text>
                )}
              </Dialog.Body>
              <Dialog.Footer>
                <Button variant="outline" mr={3} onClick={() => { setOcrOpen(false); setOcrRecords([]); }}
                  disabled={ocrLoading}>Close</Button>
                {!ocrLoading && !ocrSaved && ocrRecords.length > 0 && (
                  <Button colorPalette="teal" onClick={handleOcrSave}>
                    Save {ocrRecords.length} Record(s)
                  </Button>
                )}
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Box>
  );
};

export default Immunizations;
