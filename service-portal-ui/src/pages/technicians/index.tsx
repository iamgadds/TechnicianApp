// pages/technicians/index.tsx

import SearchBox from '@/components/search-box';
import useGetTechniciansDetails from '@/hooks/useGetTechniciansDetails';
import { TechnicianDetailRequest, Technicians } from '@/interfaces';
import { AvatarName, getContrastColor, getInitials, stringToColor } from '@/lib';
import {
  Box, Typography, Autocomplete, TextField, Table, TableHead, TableRow,
  TableCell, TableBody, IconButton, Paper
} from '@mui/material';
import React, { useEffect, useState } from 'react';

const TechnicianDetails = () => {
  const [filter, setFilter] = useState<TechnicianDetailRequest | null>({
    GetServiceCount: true
  });
  const [options, setOptions] = useState([]);
  const {data: technicians, loading} = useGetTechniciansDetails(filter,false)

  const handleSearch = (text: string) => {
		setFilter(prevParams => {

      const isNumber = /^\d/.test(text); 

			if (prevParams === null) {
				return null
			} 

			return {
				...prevParams,
				TechnicianName: !isNumber ?  text : undefined,
        PhoneNumber: isNumber? text : undefined
			};
		});
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
                        backgroundColor: stringToColor(
                          tech.Name ?? '',
                        ),
                        color: getContrastColor(
                          stringToColor(
                            tech.Name ?? '',
                          ),
                        ),
                      }}
                    >
                      {getInitials(tech.Name ?? '')}
                    </AvatarName>
                  {tech.Name || '-'}
                  </Box>
                  </TableCell>
                <TableCell>{tech.MobileNumber || '-'}</TableCell>
                <TableCell>{tech.TotalServices || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Add your pagination controls below if needed */}
    </Box>
  );
};

export default TechnicianDetails;
