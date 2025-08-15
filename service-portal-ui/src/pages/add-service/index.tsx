"use client"

import React, { useEffect, useState } from 'react';
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
} from '@mui/material';
import { ServiceDetails, Technicians } from '@/interfaces';
import useGetTechniciansDetails from '@/hooks/useGetTechniciansDetails';
import useSaveTechnicianDetails from '@/hooks/useSaveTechnicians';
import useSaveServiceDetails from '@/hooks/useSaveServiceDetails';
import { GetLabelZPL, ServiceStatusEnum } from '@/lib';
import { Constants } from '@/constants';
import useSendWhatsappMessage from '@/hooks/useSendWhatsappMessage';
import { SendWhatsappMessageRequest } from '@/interfaces/send-whatsapp.request.dto';
import { useZebraPrinter } from '@/hooks/useZebraPrinter';

declare global {
  interface Window {
    BrowserPrint: any;
  }
}

const AddService = () => {
  const [selectedTech, setSelectedTech] = useState<Technicians>({
    MobileNumber: '',
    Name: ''
  });

  const [itemName, setItemName] = useState('');
  const [faultMessage, setFaultMessage] = useState('');
  const [forceReload, setForceReload] = useState<boolean>(false)
  const {data : technicians, loading} = useGetTechniciansDetails(null, forceReload)
  const { saveTechnicianDetails } = useSaveTechnicianDetails();
  const { saveServiceDetails } = useSaveServiceDetails();
  const [errors, setErrors] = useState({
    itemName: false,
    faultMessage: false,
  });
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
	const [openAlert, setOpenAlert] = useState(false);
  const { sendWhatsappMessage } = useSendWhatsappMessage();
  const { print }  = useZebraPrinter();

  // function initPrinter() {
  //   if (!window.BrowserPrint) {
  //     alert('BrowserPrint SDK not loaded.');
  //     return;
  //   }

  //   window.BrowserPrint.getDefaultDevice('printer', (device: any) => {
  //     setPrinter(device);
  //   }, (err: any) => {
  //     console.error('Printer detection failed', err);
  //   });
  // }

  // function handlePrint(zpl: string) {
  //   if (!printer) return alert('No printer found');
  //   printer.send(zpl, () => {
  //     console.log('Sent to printer');
  //   }, (err: any) => {
  //     console.error('Print failed', err);
  //   });
  // }

  useEffect(() => {
    setForceReload(true);
    console.log('force Relod: ', forceReload)
  }, []);

  const handleReset = () => {
    setItemName('');
    setFaultMessage('');
    setSelectedTech({
      Name: '',
      MobileNumber: ''
    });
  };

  const handleSave = async () => {
    console.log('Handle Save start: selected Tech-', selectedTech)
    if (selectedTech.Name === '' || selectedTech.MobileNumber === '') return;

     const newErrors = {
      itemName: !itemName.trim(),
      faultMessage: !faultMessage.trim(),
    };
    setErrors(newErrors);

    if (newErrors.itemName || newErrors.faultMessage) {
      return; 
    }
    console.log('selected Tech: ', selectedTech)
    let finalTech = selectedTech
    if(!selectedTech.TecId){
      const techSave = await saveTechnicianDetails(selectedTech)
      console.log('techSave: ', techSave)
      if(techSave){
        finalTech = { ...selectedTech, TecId: techSave.TecId };
        setSelectedTech(finalTech); 
      }
      else{
        return;
      }
    }
    const payload : ServiceDetails = {
      ItemDetails: itemName,
      FaultMessage: faultMessage,
      TecId: finalTech.TecId,
      IsDeleted: false,
      Status: ServiceStatusEnum.ACTIVE
    };

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
  };

  const sendWhatsappMessageToTechnician = () => {
  const phone = selectedTech?.MobileNumber;
  const message = "Hello *" +selectedTech.Name + "*, your request *#" + itemName + "* has been successfully received for servicing. \nOnce the work is completed, `you will receive another message to come and pick it up.`";

  if (phone) {
    const url = `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank'); // Opens WhatsApp link in new tab
  }
}


  const printLabel = () => {
    console.log('Triggering label print...');
    const zpl = GetLabelZPL(selectedTech?.Name || '', itemName, faultMessage, selectedTech?.MobileNumber || '');
    print(zpl);
  };

  const getTechByNumber = (number: string) =>
    technicians.find((tech) => tech.MobileNumber === number);

  const getTechByName = (name: string) =>
    technicians.find((tech) => tech.Name === name);

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
            <TextField
              fullWidth
              label="Item Name"
              value={itemName}
              required
              onChange={(e) => setItemName(e.target.value)}
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
                const match = getTechByName(value || '');
                setSelectedTech(match || { ...selectedTech, Name: value, TecId: undefined });
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
                const match = getTechByNumber(value || '');
                setSelectedTech(match || { ...selectedTech, MobileNumber: value, TecId: undefined });
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
    </Box>
  );
};

export default AddService;
