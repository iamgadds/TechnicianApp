// Function to generate a consistent color from a string (name)
export function stringToColor(name: string) {
	if (name) {
		let hash = 0;

		for (let i = 0; i < name.length; i += 1) {
			// eslint-disable-next-line no-bitwise
			hash = name.charCodeAt(i) + ((hash << 5) - hash);
		}

		let color = "#";

		// Replace ++ with a standard for loop increment
		for (let i = 0; i < 3; i += 1) {
			const value = Math.floor(hash / 256 ** i) % 256; // Avoid bitwise shift and masking
			// Replace string concatenation with template literals
			color += `${`00${value.toString(16)}`.slice(-2)}`;
		}

		return color;
	}

	return "#ffff";
}
