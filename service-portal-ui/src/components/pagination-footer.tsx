import React from "react";
import { Box, IconButton, MenuItem, Select, Typography } from "@mui/material";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

interface PaginationFooterProps {
	rowsPerPage: number;
	setRowsPerPage: (rowsPerPage: number) => void;
	page: number;
	setPage: (page: number) => void;
	totalItems: number;
}

const PaginationFooter = ({
	rowsPerPage,
	setRowsPerPage,
	page,
	setPage,
	totalItems,
}: PaginationFooterProps) => {
	const totalPages = Math.ceil(totalItems / rowsPerPage);
	const startItem = (page - 1) * rowsPerPage + 1;
	const endItem = Math.min(page * rowsPerPage, totalItems);

	const handleRowsPerPageChange = (event: any) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(1); // Reset to first page when changing rows per page
	};

	const handlePreviousPage = () => {
		if (page > 1) {
			setPage(page - 1);
		}
	};

	const handleNextPage = () => {
		if (page < totalPages) {
			setPage(page + 1);
		}
	};

	return (
		<Box
			sx={{
				display: "flex",
				justifyContent: "flex-end",
				alignItems: "center",
				padding: "8px 16px",
			}}
		>
			<Typography variant="body2" fontSize="small" sx={{ marginRight: "8px" }}>
				Rows per page:
			</Typography>
			<Select
				value={rowsPerPage}
				onChange={handleRowsPerPageChange}
				variant="standard"
				disableUnderline
				sx={{ marginRight: "16px" }}
				size="small"
			>
				<MenuItem value={10}>10</MenuItem>
				<MenuItem value={25}>25</MenuItem>
				<MenuItem value={50}>50</MenuItem>
			</Select>
			<Typography fontSize="small" variant="body2" sx={{ marginRight: "16px" }}>
				{startItem}-{endItem} of {totalItems}{" "}
			</Typography>
			<IconButton onClick={handlePreviousPage} disabled={page === 1}>
				<KeyboardArrowLeftIcon fontSize="small" />
			</IconButton>
			<IconButton onClick={handleNextPage} disabled={page >= totalPages}>
				<KeyboardArrowRightIcon fontSize="small" />
			</IconButton>
		</Box>
	);
};

export default PaginationFooter;
