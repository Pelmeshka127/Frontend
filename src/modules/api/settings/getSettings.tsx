export const getSettings = async (): Promise<{ darkTheme: boolean }> => {
  const response = await fetch('/api/settings', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('Failed to fetch settings');
  }

  return response.json();
};