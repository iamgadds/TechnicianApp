import React, { useState } from "react";
import { IconButton, Paper, InputAdornment, TextField } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";

interface SearchBoxProps {
	onSearch: (query: string) => void;
}

const SearchBox = ({ onSearch }: SearchBoxProps) => {
	const [searchQuery, setSearchQuery] = useState("");

	const handleSearch = () => {
		onSearch(searchQuery);
	};

	return (
		<Paper
			sx={{
				display: "flex",
				alignItems: "center",
				width: 300,
				borderRadius: 0,
				boxShadow: "none",
				transition: "border-bottom 0.3s",
				mr: 1,
			}}
		>
			<TextField
				variant="standard"
				label="Search Filters"
				value={searchQuery}
				onChange={e => setSearchQuery(e.target.value)}
				onKeyDown={e => e.key === "Enter" && handleSearch()}
				InputProps={{
					startAdornment: (
						<InputAdornment position="start">
							<IconButton>
								<FilterListIcon />
							</IconButton>
						</InputAdornment>
					),
				}}
				sx={{ ml: 1, flex: 1 }}
			/>
		</Paper>
	);
};

export default SearchBox;
