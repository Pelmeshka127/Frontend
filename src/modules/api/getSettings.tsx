interface SettingsParams {
  userId: number;
  darkTheme: boolean;
  showDateOfBirth: boolean;
  chatYourselfDefault: boolean;
  contactAutoAccept: boolean;
}

const getSettings = async () => {
  const response = await fetch('/api/settings', {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch settings');
  }

  const settings = response.json;

  return settings;
};

const updateTheme = async (darkTheme: boolean) => {
  const response = await fetch('/api/settings/theme', {
    method: 'PUT',
    body: JSON.stringify({ darkTheme })
  });

  if (!response.ok) {
    throw new Error('Failed to update theme');
  }
};

export { getSettings, updateTheme };