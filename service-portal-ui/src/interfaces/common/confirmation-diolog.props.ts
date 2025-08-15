import React from "react";

export interface ConfirmationDialogProps {
	open: boolean;
	selectedValue?: boolean;
	onClose: (value: boolean) => void;
	title?: string;
	content?: string | React.ReactNode;
	confirmText?: string;
	cancelText?: string;
	showConfirm?: boolean;
}
