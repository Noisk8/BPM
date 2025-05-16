import { Flex, Button, Heading, Spacer, HStack, Menu, MenuButton, MenuList, MenuItem, Avatar, Text } from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { useAuth } from '../../contexts/AuthContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <Flex as="nav" bg="blue.800" color="white" p={4} align="center">
      <Heading size="md">
        <RouterLink to="/">BPM Manager</RouterLink>
      </Heading>
      <Spacer />
      <HStack spacing={4}>
        <Button as={RouterLink} to="/" variant="ghost" colorScheme="whiteAlpha">
          Inicio
        </Button>
        <Button as={RouterLink} to="/songs" variant="ghost" colorScheme="whiteAlpha">
          Canciones
        </Button>
        <Button as={RouterLink} to="/albums" variant="ghost" colorScheme="whiteAlpha">
          Álbumes
        </Button>
        <Button as={RouterLink} to="/artists" variant="ghost" colorScheme="whiteAlpha">
          Artistas
        </Button>

        {/* Mostrar botón de Admin solo si el usuario es administrador */}
        {isAdmin && (
          <Button as={RouterLink} to="/admin" colorScheme="teal">
            Admin
          </Button>
        )}

        {/* Si no hay sesión, mostrar botones de login/registro */}
        {!user ? (
          <HStack>
            <Button as={RouterLink} to="/login" variant="outline" colorScheme="whiteAlpha">
              Iniciar Sesión
            </Button>
            <Button as={RouterLink} to="/register" colorScheme="blue">
              Registrarse
            </Button>
          </HStack>
        ) : (
          /* Si hay sesión, mostrar menú de usuario */
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />} variant="ghost">
              <HStack>
                <Avatar size="sm" name={user.email || 'Usuario'} bg="blue.300" />
                <Text display={{ base: 'none', md: 'block' }}>{user.email}</Text>
              </HStack>
            </MenuButton>
            <MenuList color="black">
              <MenuItem onClick={handleLogout}>Cerrar sesión</MenuItem>
            </MenuList>
          </Menu>
        )}
      </HStack>
    </Flex>
  );
}
