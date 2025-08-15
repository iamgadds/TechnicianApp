export const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Resolved':
        return { color: '#ffb300', background: 'rgba(255, 179, 0, 0.1)', dot: '#ffb300' }; // Amber
      case 'Active':
        return { color: '#1976d2', background: 'rgba(25, 118, 210, 0.1)', dot: '#1976d2' }; // Blue
      case 'Rejected':
        return { color: '#d32f2f', background: 'rgba(211, 47, 47, 0.1)', dot: '#d32f2f' }; // Red
      default:
        return { color: '#9e9e9e', background: 'rgba(158, 158, 158, 0.1)', dot: '#9e9e9e' }; // Grey
    }
  };