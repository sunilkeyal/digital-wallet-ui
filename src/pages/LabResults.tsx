import { useState, useEffect } from 'react';
import { Box, Text, Paper, Table, Button, Modal, TextInput, Alert, ActionIcon, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { DateInput } from '@mantine/dates';
import { labResultApi } from '../services/api';
import type { LabResultDto } from '../types';

const LabResults = () => {
  const [results, setResults] = useState<LabResultDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [opened, { open, close }] = useDisclosure(false);
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

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const response = await labResultApi.getAll();
      setResults(response.data);
    } catch (err) {
      setError('Failed to load lab results');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
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
    } catch (err) {
      setError('Failed to add lab result');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await labResultApi.delete(id);
      fetchResults();
    } catch (err) {
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

      <Paper radius="md">
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Test Name</Table.Th>
              <Table.Th>Test Date</Table.Th>
              <Table.Th>Result</Table.Th>
              <Table.Th>Unit</Table.Th>
              <Table.Th>Reference Range</Table.Th>
              <Table.Th>Ordering Provider</Table.Th>
              <Table.Th>Laboratory</Table.Th>
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
          value={formData.testDate ? new Date(formData.testDate) : null}
          onChange={(date) => handleInputChange('testDate', date ? date.toISOString().split('T')[0] : '')}
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
