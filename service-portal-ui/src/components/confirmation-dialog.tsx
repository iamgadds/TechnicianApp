
import { ConfirmationDialogProps } from "@/interfaces/common";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
} from "@mui/material";

export const ConfirmationDialog = ({
	open,
	content,
	confirmText,
	cancelText,
	title,
	selectedValue,
	onClose,
	showConfirm = true,
}: ConfirmationDialogProps) => {
	const handleClose = () => {
		onClose(selectedValue || false);
	};

	const handleItemClick = (isConfirmed: boolean) => {
		onClose(isConfirmed);
	};

	return (
		<Dialog
			open={open}
			onClose={handleClose}
			aria-labelledby="alert-dialog-title"
			aria-describedby="alert-dialog-description"
		>
			<DialogTitle id="alert-dialog-title">
				{title || "Are you sure?"}
			</DialogTitle>
			<DialogContent>
				{/* // ?If content is a string, wrap it in DialogContentText */}
				{typeof content === "string" ? (
					<DialogContentText id="alert-dialog-description">
						{content}
					</DialogContentText>
				) : (
					content
				)}
			</DialogContent>
			<DialogActions>
				<Button
					onClick={() => handleItemClick(false)}
					variant="outlined"
					size="small"
				>
					{cancelText || "Cancel"}
				</Button>
				{showConfirm && (
					<Button
						onClick={() => handleItemClick(true)}
						size="small"
						variant="contained"
						color="primary"
						autoFocus
					>
						{confirmText || "Confirm"}
					</Button>
				)}
			</DialogActions>
		</Dialog>
	);
};
