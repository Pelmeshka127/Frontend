export const updateTheme = async (darkTheme: boolean): Promise<void> => {
  const response = await fetch('/api/settings/theme', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    credentials: 'include',
    body: JSON.stringify({ darkTheme })
  });

  if (!response.ok) {
    throw new Error('Failed to update theme');
  }
};