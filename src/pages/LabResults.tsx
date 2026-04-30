import { useState, useEffect } from 'react';
import {
  Container, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Box, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { labResultApi } from '../services/api';
import type { LabResultDto } from '../types';

const LabResults = () => {
  const [results, setResults] = useState<LabResultDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await labResultApi.create(formData);
      setOpenDialog(false);
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

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ mt: 0, mb: 0 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h4">Lab Results</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
          Add Result
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Test Name</TableCell>
              <TableCell>Test Date</TableCell>
              <TableCell>Result</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell>Reference Range</TableCell>
              <TableCell>Ordering Provider</TableCell>
              <TableCell>Laboratory</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {results.map((result) => (
              <TableRow key={result.id}>
                <TableCell>{result.testName}</TableCell>
                <TableCell>{result.testDate}</TableCell>
                <TableCell>{result.result}</TableCell>
                <TableCell>{result.unit}</TableCell>
                <TableCell>{result.referenceRange}</TableCell>
                <TableCell>{result.orderingProvider}</TableCell>
                <TableCell>{result.laboratory}</TableCell>
                <TableCell>
                  <Button size="small" color="error" onClick={() => handleDelete(result.id!)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {results.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No lab results found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Lab Result</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="testName"
            label="Test Name"
            fullWidth
            value={formData.testName}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="testDate"
            label="Test Date"
            type="date"
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            value={formData.testDate}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="result"
            label="Result"
            fullWidth
            value={formData.result}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="unit"
            label="Unit"
            fullWidth
            value={formData.unit}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="referenceRange"
            label="Reference Range"
            fullWidth
            value={formData.referenceRange}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="orderingProvider"
            label="Ordering Provider"
            fullWidth
            value={formData.orderingProvider}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="laboratory"
            label="Laboratory"
            fullWidth
            value={formData.laboratory}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="notes"
            label="Notes"
            fullWidth
            multiline
            rows={3}
            value={formData.notes}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">Add Result</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LabResults;
