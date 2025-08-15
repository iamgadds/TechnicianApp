import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Menu,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Autocomplete,
  IconButton,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useEffect, useState } from 'react';
import useGetTechniciansDetails from '@/hooks/useGetTechniciansDetails';
import { ServiceDetails, ServiceDetailsRequest, TechnicianDetailRequest, Technicians } from '@/interfaces';
import useGetServiceDetails from '@/hooks/useGetServiceDetails';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { AvatarName, getContrastColor, getInitials, GetLabelZPL, getStatusColor, ServiceStatusEnum, stringToColor } from '@/lib';
import useSaveServiceDetails from '@/hooks/useSaveServiceDetails';
import { ConfirmationDialog } from '@/components';
import PaginationFooter from '@/components/pagination-footer';
import { SendWhatsappMessageRequest } from '@/interfaces/send-whatsapp.request.dto';
import useSendWhatsappMessage from '@/hooks/useSendWhatsappMessage';
import PrintIcon from '@mui/icons-material/Print';
import PrintDisabledIcon from '@mui/icons-material/PrintDisabled';
import { useZebraPrinter } from '@/hooks/useZebraPrinter';


export default function ServiceDashboard() {
  const [serviceName, setServiceName] = useState('');
  const [status, setStatus] = useState('');
  const [selectedTechnician, setSelectedTechnician] = useState<Technicians | null>();
  const [forceReload, setForceReload] = useState<boolean>(false)
  const [rowsPerPage, setRowsPerPage] = useState(10);
	const [page, setPage] = useState(1);
  const {data : technicians, loading: loadingTechnician} = useGetTechniciansDetails(null, false)
  const [serviceDetailRequest, setServiceDetailRequest] = useState<ServiceDetailsRequest | null>(null);
  const {data: result, loading: loadingResults} = useGetServiceDetails(serviceDetailRequest, forceReload);
  const {saveServiceDetails} = useSaveServiceDetails();
  const [openConfirmation, setOpenConfirmation] = useState(false);
  const [ selectedService, setSelectedService ] = useState<ServiceDetails | null>(null);
  const [ isSelectedStatusResolve, setIsSelectedStatusResolve] = useState<boolean | null>(null);
  const [confirmationContent, setConfirmationContent] = useState<string>('');
  const { sendWhatsappMessage } = useSendWhatsappMessage();
  const {isReady, print} = useZebraPrinter();

  const statuses = [
    { value: '', label: 'All' }, 
    ...Object.entries(ServiceStatusEnum).map(([key, value]) => ({
      value: value,
      label: value,
    })),
  ];

  useEffect(() => {
		setServiceDetailRequest(prevParams => {
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


  const resetFilters = () => {
    setServiceName('');
    setStatus('');
    setSelectedTechnician({
      MobileNumber: '',
      Name: ''
    });
  };

  const handleServiceDetailRequest = () => {
    setServiceDetailRequest({
      ItemDetails: serviceName,
      TecId: selectedTechnician?.TecId,
      Status: status,
      Page: 1,
      PageSize: 10,
    })
  }

    const sendWhatsappMessageToTechnician = () => {
  const phone = selectedService?.Technician?.MobileNumber; 
  const message = "Hello *" + selectedService?.Technician?.Name + "*, the servicing of your Service *#" + selectedService?.ItemDetails + "* is now complete. \n`You may come and collect it at your convenience.` \nThank you!"

  if (phone) {
    const url = `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank'); // Opens WhatsApp link in new tab
  }
}

  const handleDeleteConfirmationClose = async (value: boolean) => {
		setOpenConfirmation(false);
		try {
			if (value) {
				const payload : ServiceDetails = {
          ...selectedService,
          Status: isSelectedStatusResolve ? ServiceStatusEnum.RESOLVED : ServiceStatusEnum.REJECTED
        };
    
        const response = await saveServiceDetails(payload);
        if(isSelectedStatusResolve){
          sendWhatsappMessageToTechnician();
        }
				setSelectedService(null);
        setIsSelectedStatusResolve(null);

				if (response) {
					setForceReload(!forceReload);
				}
			}
		} catch {
			console.error("An error Occurred");
		}
	};

  const handleSave = (details: ServiceDetails | null, isAccepted: boolean | null)  => {
    setSelectedService(details)
    setIsSelectedStatusResolve(isAccepted)
    setOpenConfirmation(true)
    setConfirmationContent(`Are you sure you want to mark the service as ${isAccepted ? 'resolved' : 'rejected'}?.`)
  }

  const handlePrint = (details: ServiceDetails | null) =>{
    if(details && isReady){
      const zpl = GetLabelZPL(details?.Technician?.Name || '', details?.ItemDetails || '', details?.FaultMessage || '', details?.Technician?.MobileNumber || '');
      print(zpl);
    }
  }

  return (
    <Box p={1}>
      <Paper sx={{ p: 1, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <Select
              fullWidth
              native
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              size='small'
            >
              {statuses.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          </Grid>
          <Grid item xs={12} md={3}>
            <Autocomplete
              options={technicians}
              value={selectedTechnician}
              onChange={(_, val) => {setSelectedTechnician(val)}}
              getOptionLabel={(option) => `${option.Name} (${option.MobileNumber})`}
              isOptionEqualToValue={(option, value) => option.MobileNumber === value?.MobileNumber}
              size='small'
              renderInput={(params) => <TextField {...params} label="Technician" />}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              label="Service Name"
              fullWidth
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              size='small'
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Button variant="contained" onClick={handleServiceDetailRequest} sx={{ mr: 1 }} size='small'>
              Search
            </Button>
            <Button variant="outlined" color='secondary' onClick={resetFilters} size='small'>
              Reset
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {loadingResults ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Service Name</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Technician Name</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Created On</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
            <TableCell ></TableCell>
            <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {result?.data.map((row: ServiceDetails) => (
              <TableRow key={row.SvdId}>
                <TableCell>{row.ItemDetails || "-"}</TableCell>
                <TableCell>
                    <Box display='flex' alignItems='center'>
                    <AvatarName
                      sx={{
                        mr: 1,
                        backgroundColor: stringToColor(
                          row.Technician?.Name ?? '',
                        ),
                        color: getContrastColor(
                          stringToColor(
                            row.Technician?.Name ?? '',
                          ),
                        ),
                      }}
                    >
                      {getInitials(row.Technician?.Name ?? '')}
                    </AvatarName>
                      {row.Technician?.Name || "-"}
                    </Box>
                  </TableCell>
                <TableCell>{row.CreatedOn ? new Date(row.CreatedOn).toLocaleDateString() : "-"}</TableCell>
                <TableCell>
                  {(() => {
                    const statusKey = Object.keys(ServiceStatusEnum).find(
                      key => ServiceStatusEnum[key as keyof typeof ServiceStatusEnum] === row.Status
                    ) as keyof typeof ServiceStatusEnum | undefined;

                    const displayStatus = statusKey ? ServiceStatusEnum[statusKey] : 'Unknown';

                    return (
                      <Box
                        display="inline-flex"
                        alignItems="center"
                        px={1.5}
                        py={0.5}
                        borderRadius="16px"
                        bgcolor={getStatusColor(row.Status).background}
                        border={`1px solid ${getStatusColor(row.Status).color}`}
                        color={getStatusColor(row.Status).color}
                        fontWeight={500}
                      >
                        <Box
                          width={8}
                          height={8}
                          borderRadius="50%"
                          bgcolor={getStatusColor(row.Status).dot}
                          mr={1}
                        />
                        <Typography variant="body2">{displayStatus}</Typography>
                      </Box>
                    );
                  })()}
              </TableCell>

                <TableCell>
                { row.Status === ServiceStatusEnum.ACTIVE && (
                  <Box display="flex" gap={1}>
                  <IconButton
                    color="success"
                    onClick={() => handleSave(row, true)} >
                    <CheckCircleOutlineOutlinedIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleSave(row, false)}
                  >
                    <CancelOutlinedIcon />
                  </IconButton>
                </Box>)}
              </TableCell>
              <TableCell>
                <IconButton
                    color={isReady ? "inherit" : "error"}
                    onClick={() => handlePrint(row)} >
                    {isReady ? <PrintIcon /> : <PrintDisabledIcon />}
                  </IconButton>
               </TableCell>

              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

        <PaginationFooter
							rowsPerPage={rowsPerPage}
							setRowsPerPage={setRowsPerPage}
							page={page}
							setPage={setPage}
							totalItems={result?.totalItems ?? 0}
						/>
      <ConfirmationDialog
							open={openConfirmation}
							onClose={handleDeleteConfirmationClose}
							title="Confirm"
							content={confirmationContent}
						/>
    </Box>
  );
}
