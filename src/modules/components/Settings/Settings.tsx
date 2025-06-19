import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSettings, updateTheme } from '../../api/getSettings.tsx';


type SettingsType = {
  themeType: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<SettingsType>({
  themeType: false,
  toggleTheme: () => {},
});

export const Settings: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeType, setThemeType] = useState<boolean>(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const settings = await getSettings();
        setThemeType(settings.darkTheme);
      } catch (error) {
        console.error('Failed to load theme settings', error);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme = !themeType;
    setThemeType(newTheme);
    try {
      await updateTheme(newTheme);
    } catch (error) {
      console.error('Failed to update theme', error);
      setThemeType(!newTheme); // Rollback on error
    }
  };

  return (
    <ThemeContext.Provider value={{ themeType, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);