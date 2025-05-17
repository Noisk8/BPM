import { 
  Flex, Button, Heading, Spacer, HStack, Menu, MenuButton, MenuList, MenuItem, 
  Avatar, Text, Box, useColorModeValue, Icon, Tooltip, IconButton
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { ChevronDownIcon, HamburgerIcon } from '@chakra-ui/icons';
import { useAuth } from '../../contexts/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { useState } from 'react';
import { FaMusic, FaHeadphones } from 'react-icons/fa';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Estados para efectos visuales
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  // Colores dinámicos basados en el modo de color
  const navBgColor = useColorModeValue(
    'rgba(240, 240, 240, 0.8)', // Modo claro: gris muy claro con transparencia
    'rgba(18, 18, 24, 0.8)'     // Modo oscuro: negro azulado con transparencia
  );
  const navTextColor = useColorModeValue('gray.800', 'cyberpunk.500');
  const logoGlow = useColorModeValue(
    '0 0 5px rgba(0, 207, 255, 0.3)', // Modo claro: brillo sutil
    '0 0 10px rgba(0, 207, 255, 0.7)' // Modo oscuro: brillo intenso
  );
  const buttonHoverBg = useColorModeValue('blackAlpha.50', 'whiteAlpha.100');
  const adminButtonColor = useColorModeValue('cyberpunk.600', 'cyberpunk.500');
  
  return (
    <Flex 
      as="nav" 
      bg={navBgColor} 
      color={navTextColor} 
      p={4} 
      align="center"
      position="sticky"
      top={0}
      zIndex={10}
      backdropFilter="blur(10px)"
      boxShadow={useColorModeValue(
        '0 2px 10px rgba(0, 0, 0, 0.05)',
        '0 2px 10px rgba(0, 0, 0, 0.2)'
      )}
      transition="all 0.3s ease"
    >
      <Flex align="center">
        <Icon as={FaHeadphones} w={6} h={6} color="cyberpunk.500" mr={2} />
        <Heading 
          size="md"
          bgGradient="linear(to-r, cyberpunk.500, neonPink.500)"
          bgClip="text"
          fontWeight="extrabold"
          letterSpacing="tight"
          textShadow={logoGlow}
        >
          <RouterLink to="/">BPM MANAGER</RouterLink>
        </Heading>
      </Flex>
      
      <Spacer />
      
      <HStack spacing={2}>
        <Button 
          as={RouterLink} 
          to="/" 
          variant="ghost" 
          fontSize="sm"
          fontWeight="medium"
          px={3}
          onMouseEnter={() => setHoveredButton('home')}
          onMouseLeave={() => setHoveredButton(null)}
          position="relative"
          overflow="hidden"
          _hover={{ bg: buttonHoverBg }}
        >
          {hoveredButton === 'home' && (
            <Box 
              position="absolute" 
              bottom="0" 
              left="0" 
              height="2px" 
              width="100%" 
              bgGradient="linear(to-r, cyberpunk.500, neonPink.500)" 
              animation="expandWidth 0.3s ease"
            />
          )}
          Inicio
        </Button>
        
        <Button 
          as={RouterLink} 
          to="/songs" 
          variant="ghost" 
          fontSize="sm"
          fontWeight="medium"
          px={3}
          onMouseEnter={() => setHoveredButton('songs')}
          onMouseLeave={() => setHoveredButton(null)}
          position="relative"
          overflow="hidden"
          _hover={{ bg: buttonHoverBg }}
        >
          {hoveredButton === 'songs' && (
            <Box 
              position="absolute" 
              bottom="0" 
              left="0" 
              height="2px" 
              width="100%" 
              bgGradient="linear(to-r, cyberpunk.500, neonPink.500)" 
              animation="expandWidth 0.3s ease"
            />
          )}
          Canciones
        </Button>
        
        <Button 
          as={RouterLink} 
          to="/albums" 
          variant="ghost" 
          fontSize="sm"
          fontWeight="medium"
          px={3}
          onMouseEnter={() => setHoveredButton('albums')}
          onMouseLeave={() => setHoveredButton(null)}
          position="relative"
          overflow="hidden"
          _hover={{ bg: buttonHoverBg }}
        >
          {hoveredButton === 'albums' && (
            <Box 
              position="absolute" 
              bottom="0" 
              left="0" 
              height="2px" 
              width="100%" 
              bgGradient="linear(to-r, cyberpunk.500, neonPink.500)" 
              animation="expandWidth 0.3s ease"
            />
          )}
          Álbumes
        </Button>
        
        <Button 
          as={RouterLink} 
          to="/artists" 
          variant="ghost" 
          fontSize="sm"
          fontWeight="medium"
          px={3}
          onMouseEnter={() => setHoveredButton('artists')}
          onMouseLeave={() => setHoveredButton(null)}
          position="relative"
          overflow="hidden"
          _hover={{ bg: buttonHoverBg }}
        >
          {hoveredButton === 'artists' && (
            <Box 
              position="absolute" 
              bottom="0" 
              left="0" 
              height="2px" 
              width="100%" 
              bgGradient="linear(to-r, cyberpunk.500, neonPink.500)" 
              animation="expandWidth 0.3s ease"
            />
          )}
          Artistas
        </Button>

        {/* Mostrar botón de Admin solo si el usuario es administrador */}
        {isAdmin && (
          <Tooltip label="Panel de administración" placement="bottom">
            <Button 
              as={RouterLink} 
              to="/admin" 
              colorScheme="cyberpunk"
              size="sm"
              fontWeight="bold"
              _hover={{
                boxShadow: '0 0 15px rgba(0, 207, 255, 0.7)',
                transform: 'translateY(-2px)'
              }}
              transition="all 0.2s ease"
            >
              Admin
            </Button>
          </Tooltip>
        )}

        {/* Botón de cambio de tema */}
        <ThemeToggle />
        
        {/* Si no hay sesión, mostrar botones de login/registro */}
        {!user ? (
          <HStack spacing={2}>
            <Button 
              as={RouterLink} 
              to="/login" 
              variant="outline" 
              size="sm"
              borderColor="cyberpunk.500"
              color="cyberpunk.500"
              _hover={{
                borderColor: "cyberpunk.400",
                color: "cyberpunk.400",
                boxShadow: "0 0 10px rgba(0, 207, 255, 0.5)"
              }}
            >
              Iniciar Sesión
            </Button>
            <Button 
              as={RouterLink} 
              to="/register" 
              colorScheme="cyberpunk"
              size="sm"
              _hover={{
                boxShadow: "0 0 15px rgba(0, 207, 255, 0.7)",
                transform: "translateY(-2px)"
              }}
              transition="all 0.2s ease"
            >
              Registrarse
            </Button>
          </HStack>
        ) : (
          <Menu>
            <MenuButton 
              as={Button} 
              rightIcon={<ChevronDownIcon />}
              variant="ghost"
              _hover={{ bg: buttonHoverBg }}
              _active={{ bg: buttonHoverBg }}
            >
              <HStack>
                <Avatar 
                  size="xs" 
                  name={user.email} 
                  bg="cyberpunk.500" 
                  color="white"
                  border="2px solid"
                  borderColor={useColorModeValue("cyberpunk.200", "cyberpunk.700")}
                />
                <Text 
                  display={{ base: 'none', md: 'block' }}
                  fontSize="sm"
                  fontWeight="medium"
                >
                  {user.email}
                </Text>
              </HStack>
            </MenuButton>
            <MenuList 
              bg={useColorModeValue("white", "#1e1e1e")}
              borderColor={useColorModeValue("gray.200", "#333")}
              boxShadow="lg"
              _hover={{ boxShadow: "xl" }}
            >
              <MenuItem 
                onClick={handleLogout}
                _hover={{
                  bg: useColorModeValue("red.50", "rgba(255, 0, 0, 0.1)"),
                  color: useColorModeValue("red.600", "red.300")
                }}
              >
                Cerrar Sesión
              </MenuItem>
            </MenuList>
          </Menu>
        )}
      </HStack>
    </Flex>
  );
}
