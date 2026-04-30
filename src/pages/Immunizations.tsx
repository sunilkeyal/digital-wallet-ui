import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Alert, Select, MenuItem, FormControl, InputLabel,
  TablePagination
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { immunizationApi } from '../services/api';
import type { ImmunizationDto, PageResponse } from '../types';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 1000]; // 1000 acts as "ALL"

const Immunizations = () => {
  const [immunizations, setImmunizations] = useState<ImmunizationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isPaginated, setIsPaginated] = useState(true);
  const [formData, setFormData] = useState<ImmunizationDto>({
    vaccineName: '',
    manufacturer: '',
    lotNumber: '',
    administrationDate: '',
    administeredBy: '',
    facilityName: '',
    facilityAddress: '',
    notes: '',
  });

  useEffect(() => {
    fetchImmunizations();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size]);

  const fetchImmunizations = async () => {
    try {
      setLoading(true);
      const response = await immunizationApi.getAll(page, size);
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
    } catch (err) {
      setError('Failed to load immunizations');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await immunizationApi.create(formData);
      setOpenDialog(false);
      setFormData({
        vaccineName: '',
        manufacturer: '',
        lotNumber: '',
        administrationDate: '',
        administeredBy: '',
        facilityName: '',
        facilityAddress: '',
        notes: '',
      });
      fetchImmunizations();
    } catch (err) {
      setError('Failed to add immunization');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await immunizationApi.delete(id);
      fetchImmunizations();
    } catch (err) {
      setError('Failed to delete immunization');
    }
  };

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleSizeChange = (event: any) => {
    const newSize = Number(event.target.value);
    setSize(newSize);
    setPage(0);
  };

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ mt: 0, mb: 0 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h4">Immunization History</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Page Size</InputLabel>
            <Select value={size} label="Page Size" onChange={handleSizeChange}>
              {PAGE_SIZE_OPTIONS.map(option => (
                <MenuItem key={option} value={option}>
                  {option === 1000 ? 'ALL' : option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
            Add Record
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Vaccine</TableCell>
              <TableCell>Manufacturer</TableCell>
              <TableCell>Lot Number</TableCell>
              <TableCell>Date Administered</TableCell>
              <TableCell>Administered By</TableCell>
              <TableCell>Facility</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {immunizations.map((imm) => (
              <TableRow key={imm.id}>
                <TableCell>{imm.vaccineName}</TableCell>
                <TableCell>{imm.manufacturer}</TableCell>
                <TableCell>{imm.lotNumber}</TableCell>
                <TableCell>{imm.administrationDate}</TableCell>
                <TableCell>{imm.administeredBy}</TableCell>
                <TableCell>{imm.facilityName}</TableCell>
                <TableCell>
                  <Button size="small" color="error" onClick={() => handleDelete(imm.id!)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {immunizations.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No immunization records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {isPaginated && (
          <TablePagination
            component="div"
            count={totalElements}
            page={page}
            onPageChange={handlePageChange}
            rowsPerPage={size}
            rowsPerPageOptions={[]}
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count}`}
          />
        )}
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Immunization Record</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="vaccineName"
            label="Vaccine Name"
            fullWidth
            value={formData.vaccineName}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="manufacturer"
            label="Manufacturer"
            fullWidth
            value={formData.manufacturer}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="lotNumber"
            label="Lot Number"
            fullWidth
            value={formData.lotNumber}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="administrationDate"
            label="Date Administered"
            type="date"
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            value={formData.administrationDate}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="administeredBy"
            label="Administered By"
            fullWidth
            value={formData.administeredBy}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="facilityName"
            label="Facility Name"
            fullWidth
            value={formData.facilityName}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="facilityAddress"
            label="Facility Address"
            fullWidth
            value={formData.facilityAddress}
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
          <Button onClick={handleSubmit} variant="contained">Add Record</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Immunizations;
