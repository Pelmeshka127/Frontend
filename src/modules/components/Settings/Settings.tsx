import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSettings, updateTheme } from '../../api/getSettings.tsx';
import { MantineProvider, useMantineTheme, createTheme } from "@mantine/core";


type SettingsType = {
  themeType: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<SettingsType>({
  themeType: false,
  toggleTheme: () => {},
});

const themeLight =  createTheme({

});

const themeDark = createTheme({
  colors: {
    blue: [
      '#eef3ff',
      '#dee2f2',
      '#bdc2de',
      '#98a0ca',
      '#7a84ba',
      '#6672b0',
      '#5c68ac',
      '#4c5897',
      '#424e88',
      '#364379',
    ],
    
  },

  defaultRadius: 'xl',

  shadows: {
    md: '1px 1px 3px rgba(0, 0, 0, .25)',
    xl: '5px 5px 3px rgba(0, 0, 0, .25)',
  },

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
    <ThemeContext.Provider value ={{ themeType, toggleTheme }}>
       <MantineProvider theme = {themeType ? themeDark : themeLight}>
      {children}
      </MantineProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);