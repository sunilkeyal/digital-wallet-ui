import { useState, useEffect } from 'react';
import {
  Container, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Box, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { insuranceCardApi } from '../services/api';
import type { InsuranceCardDto } from '../types';

const InsuranceCards = () => {
  const [cards, setCards] = useState<InsuranceCardDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
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
    } catch (err) {
      setError('Failed to load insurance cards');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await insuranceCardApi.create(formData);
      setOpenDialog(false);
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
    } catch (err) {
      setError('Failed to add insurance card');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await insuranceCardApi.delete(id);
      fetchCards();
    } catch (err) {
      setError('Failed to delete insurance card');
    }
  };

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ mt: 0, mb: 0 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h4">Insurance Cards</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
          Add Card
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Provider</TableCell>
              <TableCell>Policy Number</TableCell>
              <TableCell>Member Name</TableCell>
              <TableCell>Effective Date</TableCell>
              <TableCell>Expiry Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cards.map((card) => (
              <TableRow key={card.id}>
                <TableCell>{card.provider}</TableCell>
                <TableCell>{card.policyNumber}</TableCell>
                <TableCell>{card.memberName}</TableCell>
                <TableCell>{card.effectiveDate}</TableCell>
                <TableCell>{card.expiryDate}</TableCell>
                <TableCell>
                  <Button size="small" color="error" onClick={() => handleDelete(card.id!)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {cards.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No insurance cards found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Insurance Card</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="provider"
            label="Provider"
            fullWidth
            value={formData.provider}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="policyNumber"
            label="Policy Number"
            fullWidth
            value={formData.policyNumber}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="groupNumber"
            label="Group Number"
            fullWidth
            value={formData.groupNumber}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="effectiveDate"
            label="Effective Date"
            type="date"
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            value={formData.effectiveDate}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="expiryDate"
            label="Expiry Date"
            type="date"
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            value={formData.expiryDate}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="memberName"
            label="Member Name"
            fullWidth
            value={formData.memberName}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="relationship"
            label="Relationship"
            fullWidth
            value={formData.relationship}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">Add Card</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InsuranceCards;
