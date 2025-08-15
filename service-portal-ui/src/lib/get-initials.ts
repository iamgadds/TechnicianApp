export const getInitials = (name: string) => {
	if (!name) return "";

	const words = name.split(" ");

	// If the name contains spaces, return initials from the first two words
	if (words.length > 1) {
		return words
			.map(n => n[0])
			.join("")
			.slice(0, 2)
			.toUpperCase();
	}

	// If only one word, check for PascalCase or camelCase
	const pascalCaseMatch = name.match(/[A-Z]/g); // Matches capital letters

	if (pascalCaseMatch && pascalCaseMatch.length >= 2) {
		// Return the first two capital letters
		return pascalCaseMatch.slice(0, 2).join("").toUpperCase();
	}

	// If no PascalCase or camelCase, return the first two characters of the word
	return name.slice(0, 2).toUpperCase();
};
