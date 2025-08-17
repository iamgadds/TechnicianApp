"use client"

import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  TextField,
  Autocomplete,
  Button,
  Typography,
  Paper,
  Grid,
  Divider,
  Alert,
  Snackbar,
} from '@mui/material';
import { Items, ServiceDetails, Technicians } from '@/interfaces';
import useGetTechniciansDetails from '@/hooks/useGetTechniciansDetails';
import useSaveTechnicianDetails from '@/hooks/useSaveTechnicians';
import useSaveServiceDetails from '@/hooks/useSaveServiceDetails';
import { GetLabelZPL, getWhatsAppMessage, ServiceStatusEnum } from '@/lib';
import { Constants } from '@/constants';
import { useZebraPrinter } from '@/hooks/useZebraPrinter';
import useGetItemDetails from '@/hooks/useGetItemDetails';
import useSaveItemDetails from '@/hooks/useSaveItemsDetails';

declare global {
  interface Window {
    BrowserPrint: any;
  }
}

const AddService = () => {
  const itemNameRef = useRef<HTMLInputElement>(null);

  const [selectedTech, setSelectedTech] = useState<Technicians>({
    MobileNumber: '',
    Name: ''
  });
  const [faultMessage, setFaultMessage] = useState('');
  const [forceReload, setForceReload] = useState<boolean>(false)
  const {data : technicians, loading} = useGetTechniciansDetails(null, forceReload)
  const { saveTechnicianDetails } = useSaveTechnicianDetails();
  const { saveServiceDetails } = useSaveServiceDetails();
  const [errors, setErrors] = useState({});
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
	const [openAlert, setOpenAlert] = useState(false);
  const { print }  = useZebraPrinter();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [selectedItem, setSelectedItem] = useState<Items>({
    ItemName: '',
  });
  const [forceReloadItems, setForceReloadItems] = useState<boolean>(false);
  const { data: itemsList, loading: itemsLoading } = useGetItemDetails(null, forceReloadItems);
  const { saveItemDetails } = useSaveItemDetails();

  useEffect(() => {
    setForceReload(true);
    console.log('force Relod: ', forceReload)
  }, []);

  const handleReset = () => {
    setFaultMessage('');
    setSelectedTech({
      Name: '',
      MobileNumber: ''
    });
    setSelectedItem({
      ItemName: '',
    });
    itemNameRef.current?.focus();

  };

  const handleSave = async () => {
    console.log('Handle Save start: selected Tech-', selectedTech)
    if (selectedTech.Name === '' || selectedTech.MobileNumber === '' || selectedItem.ItemName === '') return;

     const newErrors = {
      faultMessage: !faultMessage.trim(),
      mobileNumber: !/^[6-9]\d{9}$/.test(selectedTech.MobileNumber || ''),
    };
    setErrors(newErrors);

    if (newErrors.faultMessage || newErrors.mobileNumber) {
      return;
    }
    console.log('selected Tech: ', selectedTech)
    let finalTech = selectedTech
    let finalItem = selectedItem;
    try{
      if(!selectedTech.TecId){
        const techSave = await saveTechnicianDetails(selectedTech)
        console.log('techSave: ', techSave)
        if(techSave?.ok){
          const responseData : Technicians = await techSave.json();
          finalTech = { ...selectedTech, TecId: responseData.TecId };
          setSelectedTech(finalTech); 
        }
        else if (!techSave?.ok){
            const errorData = await techSave?.json();
            throw new Error(errorData.message || 'Failed to insert technician');
        }
      }
      if (!finalItem.ItemId && selectedItem.ItemName.trim()) {
        // If item doesn't exist already, save it
        const saveResp = await saveItemDetails({ ItemName: selectedItem.ItemName.trim() }, "add");
        if (saveResp && saveResp.ok) {
          const responseData: Items = await saveResp.json();
          finalItem = responseData;
          setSelectedItem(finalItem);
          setForceReloadItems((prev) => !prev); // refetch list
        }
        else if (!saveResp?.ok){
            const errorData = await saveResp?.json();
            throw new Error(errorData.message || 'Failed to insert item');
        }
      }
    }
    catch (error : any){
       setSnackbar({
      open: true,
      message: error?.message || 'Error in saving service details.',
      severity: 'error'
      });
      return;
    }

    const payload : ServiceDetails = {
      ItemId: finalItem.ItemId,
      FaultMessage: faultMessage,
      TecId: finalTech.TecId,
      IsDeleted: false,
      Status: ServiceStatusEnum.ACTIVE
    };
    try{
      const serviceResp = await saveServiceDetails(payload);

      if(serviceResp){
      setOpenAlert(true);
      setAlertMessage(Constants.ServiceDetailsSaveSuccess);
      setForceReload(!forceReload); 
      handleReset();
      sendWhatsappMessageToTechnician();
      printLabel();
    }
    else{
      setAlertMessage(Constants.ServiceDetailsSaveFailed);
    }    
    }
    catch{
      setAlertMessage(Constants.ServiceDetailsSaveFailed);
      return;
    }
    

    
  };

  const sendWhatsappMessageToTechnician = () => {
  const phone = selectedTech?.MobileNumber;
  const message = getWhatsAppMessage(selectedTech?.Name || '', selectedItem?.ItemName || '', ServiceStatusEnum.ACTIVE);

  if (phone) {
    const url = `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank'); // Opens WhatsApp link in new tab
  }
}


  const printLabel = () => {
    console.log('Triggering label print...');
    const zpl = GetLabelZPL(selectedTech?.Name || '', selectedItem?.ItemName, faultMessage, selectedTech?.MobileNumber || '');
    print(zpl);
  };

  const getTechByNumber = (number: string) =>
    technicians.find((tech) => tech.MobileNumber === number);

  const getTechByName = (name: string) =>
    technicians.find((tech) => tech.Name === name);

  const getItemByName = (name: string) =>
    itemsList?.data?.find((item) => item.ItemName === name);

  return (
    <Box p={3}>
      {alertMessage && openAlert && (
				<Alert
					severity={alertMessage.includes("failed") ? "error" : "success"}
					onClose={() => setOpenAlert(false)}
					sx={{
						position: "absolute",
						top: 16, // adjust this value to your preference
						right: 16, // adjust this value to your preference
						zIndex: 5000, // make sure it stays on top of other content
					}}
				>
					{alertMessage}
				</Alert>
			)}
      <Paper elevation={3} sx={{ padding: 4 }}>
        <form
    onSubmit={(e) => {
      e.preventDefault();
      handleSave();
    }}
  >
      <Grid item xs={12}>
        <Typography variant="h6"  sx={{ mb: 1 }}>
            Add Service
        </Typography>
        <Divider />
      </Grid>


        <Grid container spacing={3} mt={1}>
          {/* Item Details */}
          <Grid item xs={12} sm={6}>
            <Autocomplete
              options={itemsList?.data?.map((item) => item.ItemName) || []}
              value={selectedItem?.ItemName || ''}
              freeSolo // allow new item entry
              onInputChange={(_, value) => {
                const match = getItemByName(value || '');
                setSelectedItem(match || { ...selectedItem, ItemName: value, ItemId: undefined });
              }}
              onChange={(_, value) => {
                const match = getItemByName(value || '');
                setSelectedItem(match || { ...selectedItem, ItemName: '', ItemId: undefined });
              }}
              loading={itemsLoading}
              renderInput={(params) => (
                <TextField {...params} label="Item Name" fullWidth required 
                inputRef={itemNameRef} />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Fault Message"
              value={faultMessage}
              required
              onChange={(e) => setFaultMessage(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={12}>
          <Typography variant="h6" sx={{ mb: 1, mt: 2 }}>
            Technician Details
          </Typography>
          <Divider />
          </Grid>
          
          {/* Technician Details */}
          <Grid item xs={12} sm={6}>
            <Autocomplete
              options={technicians.map((tech) => tech.Name)}
              value={selectedTech?.Name || ''}
              freeSolo // <-- this allows free typing
              disableClearable // optional: disables the X clear button
              onInputChange={(e, value) => {
                setSelectedTech({ ...selectedTech, Name: value });
                console.log('Changing Selected Tech on selection: ', selectedTech)
              }}
              onChange={(e, value) => {
                const match = getTechByName(value || '');
                setSelectedTech(match || {
                  Name: '',
                  MobileNumber: '',
                  TecId: undefined
                });
                console.log('Changing Selected Tech on writing: ', selectedTech)
              }}
              renderInput={(params) => (
                <TextField {...params} label="Technician Name" fullWidth
                onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault(); // prevent it from selecting only
                        document.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                      }
                    }}
              />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Autocomplete
              options={technicians.map((tech) => tech.MobileNumber)}
              value={selectedTech?.MobileNumber || ''}
              freeSolo // <-- this allows free typing
              disableClearable // optional: disables the X clear button
              onInputChange={(e, value) => {
                setSelectedTech({ ...selectedTech, MobileNumber: value});
              }}
              onChange={(e, value) => {
                const match = getTechByNumber(value || '');
                setSelectedTech(match || {
                  Name: '',
                  MobileNumber: '',
                  TecId: undefined
                });
              }}
              renderInput={(params) => {
                const mobile = selectedTech?.MobileNumber || '';
                const isValidNumber = /^[6-9]\d{9}$/.test(mobile);
                const showError = mobile.length > 0 && !isValidNumber;
            
                return (
                  <TextField
                    {...params}
                    label="Technician Number"
                    fullWidth
                    error={showError}
                    helperText={
                      showError ? 'Enter a valid 10-digit mobile number' : ''
                    }
                    onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault(); // prevent it from selecting only
                      document.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                    }
                  }}

                  />
                );
              }}
            />
          </Grid>

          {/* Buttons */}
          <Grid item xs={12}>
            <Box sx={{alignItems: 'flex-end'}} display="flex" gap={2}>
              <Button type='submit' variant="contained" color="primary">
                Save
              </Button>
              <Button variant="outlined" color="secondary" onClick={handleReset}>
                Reset
              </Button>
            </Box>
          </Grid>
        </Grid>
        </form>
      </Paper>
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
    </Box>
  );
};

export default AddService;
