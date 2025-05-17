import { 
  Box, 
  Flex, 
  HStack, 
  Button, 
  Text, 
  Link, 
  useColorModeValue, 
  Container,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  VStack
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { HamburgerIcon } from '@chakra-ui/icons';
import { useState, useEffect } from 'react';
import ThemeToggle from '../ui/ThemeToggle';

// Definición de los enlaces de navegación
const NavLinks = [
  { name: 'Inicio', path: '/' },
  { name: 'Canciones', path: '/songs' },
  { name: 'Info BPM', path: '/bpm-info' },
  { name: 'Admin', path: '/admin' }
];

const SimpleNavbar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Colores dinámicos basados en el tema con mejor contraste para modo oscuro
  const bgColor = useColorModeValue('white', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');
  const linkColor = useColorModeValue('blue.600', 'blue.300');
  const linkActiveColor = useColorModeValue('blue.700', 'blue.400');
  const navShadow = useColorModeValue('sm', 'dark-lg');

  // Detector de cambio de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Navegación para dispositivos móviles
  const MobileNav = () => (
    <>
      <IconButton
        aria-label="Abrir menú"
        icon={<HamburgerIcon />}
        onClick={onOpen}
        display={{ base: 'flex', md: 'none' }}
        variant="ghost"
        color={textColor}
        _hover={{ bg: hoverBg }}
      />
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent bg={bgColor} color={textColor}>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px" borderColor={borderColor}>
            <Text 
              bgGradient="linear(to-r, blue.500, purple.500)" 
              bgClip="text"
              fontWeight="extrabold"
            >
              BPM Manager
            </Text>
          </DrawerHeader>
          <DrawerBody>
            <VStack spacing={4} align="stretch" mt={4}>
              {NavLinks.map((link) => (
                <Link
                  key={link.path}
                  as={RouterLink}
                  to={link.path}
                  onClick={onClose}
                  p={2}
                  rounded="md"
                  color={linkColor}
                  fontWeight="medium"
                  _hover={{ 
                    bg: hoverBg,
                    color: linkActiveColor,
                    transform: 'translateX(2px)',
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  {link.name}
                </Link>
              ))}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );

  // Navegación para escritorio con efectos mejorados
  const DesktopNav = () => (
    <HStack spacing={8} display={{ base: 'none', md: 'flex' }}>
      {NavLinks.map((link) => (
        <Link
          key={link.path}
          as={RouterLink}
          to={link.path}
          px={3}
          py={2}
          rounded="md"
          color={linkColor}
          position="relative"
          fontWeight="medium"
          _hover={{ 
            bg: hoverBg,
            color: linkActiveColor,
            textDecoration: 'none',
          }}
          _after={{
            content: '""',
            position: 'absolute',
            width: '0%',
            height: '2px',
            bottom: '0',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'blue.500',
            transition: 'width 0.3s ease',
          }}
          _hover_after={{
            width: '80%',
          }}
        >
          {link.name}
        </Link>
      ))}
    </HStack>
  );

  return (
    <Box 
      as="nav" 
      position="sticky" 
      top="0" 
      zIndex="sticky"
      bg={bgColor} 
      color={textColor}
      borderBottom="1px"
      borderColor={borderColor}
      boxShadow={navShadow}
      transition="all 0.3s ease"
    >
      <Container maxW="container.xl">
        <Flex h={16} alignItems="center" justifyContent="space-between">
          {/* Logo y título */}
          <HStack spacing={8} alignItems="center">
            <Box fontWeight="bold" fontSize="xl">
              <Text 
                bgGradient="linear(to-r, blue.500, purple.500)" 
                bgClip="text"
                fontWeight="extrabold"
              >
                BPM Manager
              </Text>
            </Box>
            <DesktopNav />
          </HStack>

          {/* Menú móvil y botones de acción */}
          <Flex alignItems="center">
            {/* Switch para cambiar tema */}
            <ThemeToggle />
            
            {/* Botón de login */}
            <Button 
              as={RouterLink} 
              to="/login" 
              size="sm" 
              ml={4} 
              colorScheme="blue"
              display={{ base: 'none', md: 'inline-flex' }}
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: 'md',
              }}
              transition="all 0.2s ease"
            >
              Login
            </Button>
            
            {/* Menú móvil */}
            <MobileNav />
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
};

export default SimpleNavbar;
