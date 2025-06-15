import { useDisclosure } from '@mantine/hooks';
import { Drawer, Button } from '@mantine/core';
import { Switch } from '@mantine/core';
import { IconSun, IconMoonStars } from '@tabler/icons-react';

interface SettingsProps {
  opened: boolean;
  onClose: () => void;
}

export function DarkTheme({ opened, onClose }: SettingsProps) {
  const [opened, { open, close }] = useDisclosure(false);
  return (
    <>
      <Drawer opened={opened} onClose={close} title="Settings" position="right">
        
          <Switch
            label="Theme"
            size="md"
            color="dark.4"
            onLabel={<IconSun size={16} stroke={2.5} color="var(--mantine-color-yellow-4)" />}
            offLabel={<IconMoonStars size={16} stroke={2.5} color="var(--mantine-color-blue-6)" />}
          />
        
      </Drawer>

      <Button variant="default" onClick={open}>
        Open Drawer
      </Button>
    </>
  );
}


export default DarkTheme;

