import { Avatar, styled } from "@mui/material";

export const AvatarName = styled(Avatar)(({ theme }) => ({
	height: 30,
	width: 30,
	mr: 5,
	backgroundColor: theme.palette.primary.main,
	fontSize: "14px",
}));