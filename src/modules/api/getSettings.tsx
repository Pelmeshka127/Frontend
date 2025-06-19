interface SettingsParams {
  userId: number;
  darkTheme: boolean;
  showDateOfBirth: boolean;
  chatYourselfDefault: boolean;
  contactAutoAccept: boolean;
}

const getSettings = async () => {
  const response = await fetch("/api/settings/get")
  if (!response.ok) {
    throw new Error('Failed to fetch settings');
  }
  const settings = response.json()
  return settings
};


const updateTheme = async (darkTheme: boolean) => {
  const response = await fetch(`/api/settings/theme?darkTheme=${darkTheme}`);
  if (!response.ok) {
    throw new Error('Failed to update theme');
  }
};

export { getSettings, updateTheme };