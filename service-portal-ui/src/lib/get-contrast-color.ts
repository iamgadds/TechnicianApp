export function adjustColorLuminance(hex: string, lum: number) {
	// Ensure the hex is valid
	hex = String(hex).replace(/[^0-9a-f]/gi, "");

	// Handle shorthand hex colors (e.g., "03F" => "0033FF")
	if (hex.length === 3) {
		hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
	}

	// Adjust color luminance
	let rgb = "#";
	for (let i = 0; i < 3; i += 1) {
		// Replaced `++` with `i += 1`
		const c = parseInt(hex.substring(i * 2, i * 2 + 2), 16); // Split `let` declarations
		const adjustedC = Math.round(Math.min(Math.max(0, c + c * lum), 255)); // Adjust luminance

		// Replaced string concatenation with template literals
		rgb += `${`00${adjustedC.toString(16)}`.slice(-2)}`;
	}

	return rgb;
}

// Function to calculate the luminance of a color and return a contrasting color
export function getContrastColor(hex: string) {
	// Remove non-hex characters and ensure full-length color
	hex = String(hex).replace(/[^0-9a-f]/gi, "");

	if (hex.length === 3) {
		hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
	}

	// Convert hex to RGB
	const r = parseInt(hex.slice(0, 2), 16);
	const g = parseInt(hex.slice(2, 4), 16);
	const b = parseInt(hex.slice(4, 6), 16);

	// Calculate luminance
	const brightness = (r * 299 + g * 587 + b * 114) / 1000;

	// If brightness is above a threshold, return a darker color for contrast; otherwise, return white
	return brightness > 150 ? adjustColorLuminance(hex, -0.6) : "#FFFFFF"; // Darken by 60% if too bright
}
