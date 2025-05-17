import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import { IconButton, useColorMode, Tooltip } from '@chakra-ui/react';

const ThemeToggle = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  
  return (
    <Tooltip label={colorMode === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}>
      <IconButton
        aria-label="Cambiar tema"
        icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
        onClick={toggleColorMode}
        variant="ghost"
        colorScheme={colorMode === 'light' ? 'purple' : 'yellow'}
        size="md"
      />
    </Tooltip>
  );
};

export default ThemeToggle;
