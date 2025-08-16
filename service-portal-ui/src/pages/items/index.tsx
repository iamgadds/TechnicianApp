import SearchBox from '@/components/search-box';
import useGetItemDetails from '@/hooks/useGetItemDetails';
import { ItemDetailRequest, Items } from '@/interfaces';
import {
  Box, Typography, TextField, Table, TableHead, TableRow,
  TableCell, TableBody, IconButton, Paper, Dialog, DialogTitle, 
  DialogContent, DialogActions, Button, Snackbar, Alert,
  CircularProgress
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import React, { useEffect, useState } from 'react';
import useSaveItemDetails from '@/hooks/useSaveItemsDetails';
import PaginationFooter from '@/components/pagination-footer';

const ItemDetails = () => {
  // Filtering and paging state
  const [filter, setFilter] = useState<ItemDetailRequest | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [forceUpdate, setForceUpdate] = useState(false);

  // States for Add/Edit
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<Items | null>(null);
  const [validationError, setValidationError] = useState(false);

  // Delete confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Items | null>(null);

  // Snackbar
  const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  // Getting items
  const { data : result, loading } = useGetItemDetails(filter, forceUpdate);
  // Note: data expected to be `PagedResponse<Items>` in your backend

  const { saveItemDetails } = useSaveItemDetails();

  // --- Search ---
  const handleSearch = (text: string) => {
    setFilter({ ItemName: text });
    setPage(1); // Always reset to first page on search
  };

  // --- Add/Edit Dialog ---
  const handleOpenDialog = (item?: Items) => {
    setEditForm(item ? { ...item } : { ItemName: '' });
    setValidationError(false);
    setEditDialogOpen(true);
  };
  const handleCloseDialog = () => {
    setEditDialogOpen(false);
    setEditForm(null);
    setValidationError(false);
  };
  const handleEditFormChange = (val: string) => {
    setEditForm(prev => prev ? { ...prev, ItemName: val } : { ItemName: val });
    if (validationError && val.trim().length > 0) setValidationError(false);
  };

  // --- Save Add/Edit ---
  const handleSaveEdit = async () => {
    if (!editForm?.ItemName || editForm.ItemName.trim().length === 0) {
      setValidationError(true);
      setSnackbar({ open: true, message: 'Item name is required', severity: 'error' });
      return;
    }
    try {
      const response = await saveItemDetails(editForm, editForm.ItemId ? 'update' : 'add');
      if (!response?.ok) {
        const errorData = await response?.json();
        throw new Error(errorData?.message || 'Failed to save item');
      }
      setSnackbar({ open: true, message: `Item ${editForm.ItemId ? 'updated' : 'added'} successfully`, severity: 'success' });
      setEditDialogOpen(false);
      setForceUpdate(p => !p);
    } catch (error: any) {
      setSnackbar({ open: true, message: error?.message || 'Error saving item', severity: 'error' });
    }
  };

  // --- Delete ---
  const handleDeleteConfirmation = (item: Items) => {
    setSelectedItem(item);
    setDeleteConfirmOpen(true);
  };
  const handleDelete = async (confirm: boolean) => {
    if (confirm && selectedItem) {
      try {
        const response = await saveItemDetails(selectedItem, 'delete');
        if (!response?.ok) {
          const errorData = await response?.json();
          throw new Error(errorData?.message || 'Failed to delete item');
        }
        setSnackbar({ open: true, message: 'Item deleted successfully', severity: 'success' });
        setForceUpdate(p => !p);
      } catch (error: any) {
        setSnackbar({ open: true, message: error?.message || 'Error deleting item', severity: 'error' });
      }
    }
    setDeleteConfirmOpen(false);
    setSelectedItem(null);
  };

  // --- Table Column: UpdatedOn: Convert to date string ---
  const formatDate = (dateVal?: string | Date) =>
    dateVal ? new Date(dateVal).toLocaleString() : '-';

    useEffect(() => {
        setFilter(prevParams => {
            if (prevParams === null) {
                return {
            Page: page,
            PageSize: rowsPerPage,
          }
            }
  
            return {
                ...prevParams,
                Page: page,
                PageSize: rowsPerPage,
            };
        });
    }, [page, rowsPerPage]);

  // --- Render ---
  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Item Details</Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <SearchBox onSearch={handleSearch} />
          <Button 
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Add Item
          </Button>
        </Box>
      </Box>
      <Paper elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Item Name</strong></TableCell>
              <TableCell><strong>Updated On</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          {
            loading ? (
                    <Box display="flex" justifyContent="center" mt={4}>
                      <CircularProgress />
                    </Box>
                  ) : (
            <TableBody>
            {result?.data.map((item: Items, idx) => (
              <TableRow key={item.ItemId || idx}>
                <TableCell>{item.ItemName || '-'}</TableCell>
                <TableCell>{formatDate(item.CreatedOn)}</TableCell>
                <TableCell align="right">
                  <IconButton 
                    onClick={() => handleOpenDialog(item)}
                    color="default"
                    size="small"
                  >
                    <Edit />
                  </IconButton>
                  <IconButton 
                    onClick={() => handleDeleteConfirmation(item)}
                    color="default"
                    size="small"
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {result?.totalItems === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center">No items found.</TableCell>
              </TableRow>
            )}
          </TableBody>
                  )
          }
          
        </Table>
        <PaginationFooter
          rowsPerPage={rowsPerPage}
          setRowsPerPage={setRowsPerPage}
          page={page}
          setPage={setPage}
          totalItems={result?.totalItems || 0}
        />
      </Paper>
      {/* Add/Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
        <DialogTitle>{editForm?.ItemId ? 'Edit Item' : 'Add Item'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Item Name"
            value={editForm?.ItemName || ''}
            onChange={(e) => handleEditFormChange(e.target.value)}
            error={validationError}
            margin="normal"
            autoFocus
            helperText={validationError ? "Item Name is required" : ''}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSaveEdit();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
      {/* Delete Confirmation */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete <strong>{selectedItem?.ItemName}</strong>?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleDelete(false)}>Cancel</Button>
          <Button onClick={() => handleDelete(true)} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ItemDetails;
