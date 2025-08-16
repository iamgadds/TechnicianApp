// pages/technicians/index.tsx

import SearchBox from '@/components/search-box';
import useGetTechniciansDetails from '@/hooks/useGetTechniciansDetails';
import { TechnicianDetailRequest, Technicians } from '@/interfaces';
import { AvatarName, getContrastColor, getInitials, stringToColor } from '@/lib';
import {
  Box, Typography, Autocomplete, TextField, Table, TableHead, TableRow,
  TableCell, TableBody, IconButton, Paper, Dialog, DialogTitle, 
  DialogContent, DialogActions, Button, Snackbar, Alert
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import React, { useEffect, useState } from 'react';
import useSaveTechnicianDetails from '@/hooks/useSaveTechnicians';
import { ConfirmationDialog } from '@/components';

const TechnicianDetails = () => {
  const [filter, setFilter] = useState<TechnicianDetailRequest | null>({
    GetServiceCount: true
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState<Technicians | null>(null);
  const [editForm, setEditForm] = useState<Technicians | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [forceUpdate, setForceUpdate] = useState(false);
    // Add state for validation errors
const [validationErrors, setValidationErrors] = useState({
  Name: false,
  MobileNumber: false
});
 const [openConfirmation, setOpenConfirmation] = useState(false);
  const [confirmationContent, setConfirmationContent] = useState<string>('');
  
  const { data: technicians, loading } = useGetTechniciansDetails(filter, forceUpdate);
  const { saveTechnicianDetails } = useSaveTechnicianDetails();

  const handleSearch = (text: string) => {
    setFilter(prevParams => {
      const isNumber = /^\d/.test(text); 
      
      if (prevParams === null) {
        return null
      }
      
      return {
        ...prevParams,
        TechnicianName: !isNumber ? text : undefined,
        PhoneNumber: isNumber ? text : undefined
      };
    });
  };



const validateForm = () => {
  const nameValid = editForm && editForm.Name!.trim()?.length > 0;
  const mobileValid = /^[6-9]\d{9}$/.test(editForm?.MobileNumber || '');
  
  setValidationErrors({
    Name: !nameValid,
    MobileNumber: !mobileValid
  });
  
  return nameValid && mobileValid;
};

const handleFormChange = (field: string, value: string) => {
  setEditForm(prev => ({ ...prev, [field]: value }));
  
  // Clear validation error when user starts typing
  if (validationErrors[field as keyof typeof validationErrors]) {
    setValidationErrors(prev => ({ ...prev, [field]: false }));
  }
};

  const handleEdit = (technician: Technicians) => {
    setSelectedTechnician(technician);
    setEditForm({
      Name: technician.Name || '',
      MobileNumber: technician.MobileNumber || '',
      TecId: technician.TecId || 0
    });
    setEditDialogOpen(true);
  };

  const handleDeleteConfirmation = (technician: Technicians) => {
    setSelectedTechnician(technician);
    setConfirmationContent(`Are you sure you want to delete ${technician?.Name}?`);
    setOpenConfirmation(true);
  }

  const handleDelete = async (value: boolean) => {
    if (value) {
      try {
        const response = await saveTechnicianDetails({
          ...selectedTechnician,
        },'delete');

        if (!response?.ok) {
          const errorData = await response?.json();
          throw new Error(errorData.message || 'Failed to delete technician');
        }
        
        if (response.ok) {
          setSnackbar({
            open: true,
            message: 'Technician deleted successfully',
            severity: 'success'
          });
          setForceUpdate(prev => !prev); // Trigger re-fetch
        }
      } catch (error : any) {
        setSnackbar({
          open: true,
          message: error?.message || 'Error deleting technician',
          severity: 'error'
        });
      }
    }
    setOpenConfirmation(false);
  };

  const handleSaveEdit = async () => {
    if (!validateForm()) {
    setSnackbar({
      open: true,
      message: 'Please fix validation errors before saving',
      severity: 'error'
    });
    return;
  }

    try {
      const response = await saveTechnicianDetails({
          ...editForm,
        });
      
      
      if (!response?.ok) {
      const errorData = await response?.json();
      throw new Error(errorData.message || 'Failed to update technician');
    }
    
    setSnackbar({
      open: true,
      message: 'Technician updated successfully',
      severity: 'success'
    });
    setEditDialogOpen(false);
    setForceUpdate(prev => !prev); // Refresh the list
  } catch (error : any) {
    setSnackbar({
      open: true,
      message: error?.message || 'Error updating technician',
      severity: 'error'
    });
  }
  };

  const handleCloseDialog = () => {
    setEditDialogOpen(false);
    setSelectedTechnician(null);
    setEditForm({ Name: '', MobileNumber: '' });
    setValidationErrors({ Name: false, MobileNumber: false });
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Technician Details</Typography>
        <SearchBox onSearch={handleSearch} />
      </Box>

      <Paper elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Technician Name</strong></TableCell>
              <TableCell><strong>Phone Number</strong></TableCell>
              <TableCell><strong>Total Services</strong></TableCell>
              <TableCell><strong>Total Resolved Services</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {technicians.map((tech: Technicians, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Box display='flex' alignItems='center'>
                    <AvatarName
                      sx={{
                        mr: 1,
                        backgroundColor: stringToColor(tech.Name ?? ''),
                        color: getContrastColor(stringToColor(tech.Name ?? '')),
                      }}
                    >
                      {getInitials(tech.Name ?? '')}
                    </AvatarName>
                    {tech.Name || '-'}
                  </Box>
                </TableCell>
                <TableCell>{tech.MobileNumber || '-'}</TableCell>
                <TableCell>{tech.TotalServices || '-'}</TableCell>
                <TableCell>{tech.ResolvedServices || '-'}</TableCell>
                <TableCell align="right">
                  <IconButton 
                    onClick={() => handleEdit(tech)}
                    color="default"
                    size="small"
                  >
                    <Edit />
                  </IconButton>
                  <IconButton 
                    onClick={() => handleDeleteConfirmation(tech)}
                    color="default"
                    size="small"
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Technician</DialogTitle>
        <DialogContent>
           <form onSubmit={(e) => {
      e.preventDefault();
      handleSaveEdit();
    }}>
          <TextField
        fullWidth
        label="Name"
        value={editForm?.Name}
        onChange={(e) => handleFormChange('Name', e.target.value)}
        error={validationErrors.Name}
        helperText={
          validationErrors.Name ? 'Name is required' : ''
        }
        margin="normal"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            document.querySelector('form')?.dispatchEvent(
              new Event('submit', { cancelable: true, bubbles: true })
            );
          }
        }}
      />
      
      <TextField
        fullWidth
        label="Mobile Number"
        value={editForm?.MobileNumber}
        onChange={(e) => {
          // Only allow numeric input
          const value = e.target.value.replace(/\D/g, '');
          if (value.length <= 10) {
            handleFormChange('MobileNumber', value);
          }
        }}
        error={validationErrors.MobileNumber}
        helperText={
          validationErrors.MobileNumber 
            ? 'Enter a valid 10-digit mobile number starting with 6-9' 
            : editForm && editForm?.MobileNumber!.length > 0 && editForm?.MobileNumber!.length < 10
            ? `${10 - editForm?.MobileNumber!.length || 0} digits remaining`
            : ''
        }
        margin="normal"
        inputProps={{
          maxLength: 10,
          pattern: '[6-9][0-9]{9}',
          inputMode: 'numeric'
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            document.querySelector('form')?.dispatchEvent(
              new Event('submit', { cancelable: true, bubbles: true })
            );
          }
        }}
      />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity === 'success' ? 'success' : 'error'} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <ConfirmationDialog
                    open={openConfirmation}
                    onClose={handleDelete}
                    title="Confirm"
                    content={confirmationContent}
                    confirmText='Delete'
                  />
    </Box>
  );
};

export default TechnicianDetails;
