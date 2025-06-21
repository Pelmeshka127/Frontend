import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSettings, updateTheme } from '../../api/getSettings.tsx';
import { MantineProvider, useMantineTheme, createTheme, Button, Drawer, Switch } from "@mantine/core";
import { IconMoonStars, IconSun } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useAuth } from '../AuthContext/AuthContext.tsx';



export const Settings = () => {
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

  return {
    themeType: themeType,
    jsx: (
      <Switch
        label="Тема"
        size="md"
        color="dark.4"
        defaultChecked = {!themeType}
        onLabel={<IconSun size={16} stroke={2.5} color="var(--mantine-color-yellow-4)" />}
        offLabel={<IconMoonStars size={16} stroke={2.5} color="var(--mantine-color-blue-6)" />}
        onChange={() => toggleTheme()}
      />
    ),
  };

};
