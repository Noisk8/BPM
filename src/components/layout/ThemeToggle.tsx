import React from 'react';
import { IconButton, useColorMode, useColorModeValue, Tooltip, Box } from '@chakra-ui/react';
import { SunIcon, MoonIcon } from '@chakra-ui/icons';

export const ThemeToggle: React.FC = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const SwitchIcon = useColorModeValue(MoonIcon, SunIcon);
  const nextMode = useColorModeValue('oscuro', 'claro');
  
  return (
    <Tooltip 
      label={`Cambiar a modo ${nextMode}`} 
      fontSize="sm"
      bg={useColorModeValue('gray.700', 'gray.200')}
      color={useColorModeValue('white', 'gray.800')}
      hasArrow
    >
      <Box position="relative">
        <IconButton
          size="md"
          fontSize="lg"
          aria-label={`Cambiar a modo ${nextMode}`}
          variant="ghost"
          color={useColorModeValue('gray.600', 'cyberpunk.500')}
          onClick={toggleColorMode}
          icon={<SwitchIcon />}
          _hover={{
            color: useColorModeValue('cyberpunk.500', 'cyberpunk.300'),
            transform: "translateY(-2px)",
            boxShadow: useColorModeValue(
              '0 0 5px rgba(0, 207, 255, 0.3)',
              '0 0 8px rgba(0, 207, 255, 0.6)'
            ),
          }}
          _active={{
            transform: "scale(0.95)",
          }}
          transition="all 0.2s ease"
          position="relative"
          zIndex={2}
        />
        {isDark && (
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            borderRadius="md"
            bg="transparent"
            zIndex={1}
            animation="pulse 2s infinite"
            sx={{
              '@keyframes pulse': {
                '0%': {
                  boxShadow: '0 0 0 0 rgba(0, 207, 255, 0.4)'
                },
                '70%': {
                  boxShadow: '0 0 0 6px rgba(0, 207, 255, 0)'
                },
                '100%': {
                  boxShadow: '0 0 0 0 rgba(0, 207, 255, 0)'
                }
              }
            }}
          />
        )}
      </Box>
    </Tooltip>
  );
};
