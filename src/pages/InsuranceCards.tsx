import { useState, useEffect } from 'react';
import { Box, Text, Paper, Table, Button, Modal, TextInput, Alert, ActionIcon, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { DateInput } from '@mantine/dates';
import { insuranceCardApi } from '../services/api';
import type { InsuranceCardDto } from '../types';

const InsuranceCards = () => {
  const [cards, setCards] = useState<InsuranceCardDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [opened, { open, close }] = useDisclosure(false);
  const [formData, setFormData] = useState<InsuranceCardDto>({
    provider: '',
    policyNumber: '',
    groupNumber: '',
    effectiveDate: '',
    expiryDate: '',
    memberName: '',
    relationship: '',
  });

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const response = await insuranceCardApi.getAll();
      setCards(response.data);
    } catch {
      setError('Failed to load insurance cards');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
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

      <Paper radius="md">
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Provider</Table.Th>
              <Table.Th>Policy Number</Table.Th>
              <Table.Th>Member Name</Table.Th>
              <Table.Th>Effective Date</Table.Th>
              <Table.Th>Expiry Date</Table.Th>
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
