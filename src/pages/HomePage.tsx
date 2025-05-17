import { 
  Box, 
  Heading, 
  Text, 
  Button, 
  SimpleGrid, 
  Container, 
  Flex, 
  Image, 
  VStack, 
  useColorModeValue, 
  useColorMode,
  Icon,
  Badge,
  HStack
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { Link as RouterLink } from 'react-router-dom';
import { FaMusic, FaCompactDisc, FaMicrophone, FaGuitar, FaHeadphones, FaPlay } from 'react-icons/fa';
import { ArrowForwardIcon, MoonIcon, SunIcon } from '@chakra-ui/icons';
import '../styles/cyberpunk.css';

const HomePage = () => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  
  // Colores dinámicos basados en el modo de color
  const bgGradient = useColorModeValue(
    'linear(to-br, gray.50, blue.50)', 
    'linear(to-br, gray.900, blue.900)'
  );
  const cardBg = useColorModeValue('white', '#1a1a1a');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const headingColor = useColorModeValue('gray.800', 'white');
  const accentColor = useColorModeValue('cyberpunk.600', 'cyberpunk.400');
  const glowColor = useColorModeValue('rgba(0, 207, 255, 0.3)', 'rgba(0, 207, 255, 0.6)');
  
  // Animaciones
  const pulse = keyframes`
    0% { opacity: 0.8; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.05); }
    100% { opacity: 0.8; transform: scale(1); }
  `;
  const pulseAnimation = `${pulse} 3s infinite`;
  
  // Características de la aplicación
  const features = [
    {
      icon: FaMusic,
      title: "Gestión de Canciones",
      description: "Organiza tus canciones por BPM y visualiza su categoría de color para una mejor organización.",
      path: "/songs"
    },
    {
      icon: FaCompactDisc,
      title: "Catálogo de LPs",
      description: "Administra tu colección de álbumes con información detallada y listado de canciones.",
      path: "/admin/lps"
    },
    {
      icon: FaMicrophone,
      title: "Artistas",
      description: "Mantén un registro de artistas y su música asociada.",
      path: "/admin/artists"
    },
    {
      icon: FaGuitar,
      title: "Explorador BPM",
      description: "Explora canciones por categorías de BPM usando nuestro sistema de colores.",
      path: "/admin/bpm-explorer"
    }
  ];

  return (
    <Box 
      minHeight="90vh" 
      w="full"
      bgGradient={bgGradient}
      className="cyberpunk-grid"
      position="relative"
      overflow="hidden"
      py={10}
      sx={{
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: isDark ? 
            'radial-gradient(circle at center, rgba(0, 207, 255, 0.1) 0%, rgba(0, 0, 0, 0) 70%)' : 
            'radial-gradient(circle at center, rgba(0, 207, 255, 0.05) 0%, rgba(255, 255, 255, 0) 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }
      }}
    >
      {/* Efecto de línea de escaneo */}
      <Box 
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        pointerEvents="none"
        className="scan-effect"
        opacity={0.7}
      />
      
      <Container maxW="container.xl">
        <VStack spacing={10} align="stretch">
          {/* Hero Section */}
          <Flex 
            direction={{ base: "column", md: "row" }} 
            align="center" 
            justify="space-between"
            gap={8}
          >
            <Box flex={1}>
              <Heading 
                as="h1" 
                size="2xl" 
                bgGradient={isDark ? "linear(to-r, cyan.400, purple.400)" : "linear(to-r, blue.600, purple.600)"}
                bgClip="text"
                letterSpacing="tight"
                fontWeight="extrabold"
                className="cyberpunk-glitch"
                data-text="BPM MANAGER"
                mb={4}
                position="relative"
                _after={{
                  content: '""',
                  position: 'absolute',
                  bottom: '-10px',
                  left: '0',
                  width: '100px',
                  height: '4px',
                  background: isDark ? 'cyan.400' : 'blue.600',
                  boxShadow: `0 0 10px ${glowColor}`,
                }}
              >
                BPM MANAGER
              </Heading>
              <Text 
                fontSize="xl" 
                opacity={0.8}
                maxW="2xl"
                mb={6}
                className="terminal-text"
                color={isDark ? "gray.300" : "gray.700"}
              >
                Sistema de gestión musical por ritmos con categorización por colores
              </Text>
              
              <HStack spacing={4} mb={8}>
                <Badge colorScheme="blue" p={2} borderRadius="md" fontSize="md">
                  <Icon as={FaHeadphones} mr={2} />
                  Organiza tu música
                </Badge>
                <Badge colorScheme="purple" p={2} borderRadius="md" fontSize="md">
                  <Icon as={FaPlay} mr={2} />
                  Clasifica por BPM
                </Badge>
              </HStack>
              <Button 
                as={RouterLink} 
                to="/bpm-info" 
                size="lg" 
                colorScheme="blue" 
                rightIcon={<ArrowForwardIcon />}
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: isDark ? "0 0 15px rgba(0, 207, 255, 0.7)" : "0 0 15px rgba(0, 130, 255, 0.4)"
                }}
                position="relative"
                overflow="hidden"
                sx={{
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '0',
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                    transition: 'all 0.5s',
                  },
                  '&:hover::before': {
                    left: '100%',
                  }
                }}
              >
                Conocer el sistema BPM
              </Button>
            </Box>
            
            <Flex 
              flex={1} 
              justify="center"
              position="relative"
            >
              <Box 
                position="relative" 
                width="100%" 
                maxW="400px"
                height="400px"
                borderRadius="full"
                overflow="hidden"
                boxShadow={isDark ? "0 0 30px rgba(0, 207, 255, 0.5)" : "0 0 30px rgba(0, 130, 255, 0.3)"}
                animation={pulseAnimation}
              >
                <Image 
                  src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" 
                  alt="DJ Mixer"
                  objectFit="cover"
                  width="100%"
                  height="100%"
                />
                <Box 
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  bottom={0}
                  bgGradient="linear(to-t, blackAlpha.700, transparent)"
                />
              </Box>
            </Flex>
          </Flex>
          
          {/* Features Section */}
          <Box mt={12} position="relative" zIndex={1}>
            <Heading 
              as="h2" 
              size="xl" 
              mb={6}
              textAlign="center"
              color={headingColor}
              position="relative"
              display="inline-block"
              _after={{
                content: '""',
                position: 'absolute',
                bottom: '-10px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '100px',
                height: '3px',
                background: isDark ? 'cyan.400' : 'blue.600',
                borderRadius: 'full',
              }}
            >
              Características
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8} maxW="container.lg" mx="auto">
              {features.map((feat, index) => (
                <Box 
                  key={index}
                  p={6} 
                  borderWidth="1px" 
                  borderRadius="lg" 
                  borderColor={borderColor}
                  bg={cardBg}
                  boxShadow="md"
                  transition="all 0.3s ease"
                  _hover={{
                    transform: "translateY(-5px)",
                    boxShadow: isDark ? "0 10px 20px rgba(0, 207, 255, 0.2)" : "0 10px 20px rgba(0, 130, 255, 0.1)"
                  }}
                  height="100%"
                  className="neon-card"
                  position="relative"
                  overflow="hidden"
                  sx={{
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: '0',
                      left: '0',
                      width: '5px',
                      height: '100%',
                      background: isDark ? 'cyan.400' : 'blue.500',
                      opacity: 0.7,
                    }
                  }}
                >
                  <Flex 
                    w={12} 
                    h={12} 
                    align="center" 
                    justify="center" 
                    borderRadius="full" 
                    bg={isDark ? "blue.900" : "blue.50"}
                    color={isDark ? "blue.200" : "blue.600"}
                    mb={4}
                  >
                    <Icon as={feat.icon} boxSize={6} />
                  </Flex>
                  <Heading as="h3" size="md" mb={3} color={headingColor}>
                    {feat.title}
                  </Heading>
                  <Text opacity={0.8} mb={4}>
                    {feat.description}
                  </Text>
                  <Button 
                    as={RouterLink} 
                    to={feat.path} 
                    size="sm" 
                    colorScheme="blue" 
                    variant="link" 
                    rightIcon={<ArrowForwardIcon />}
                  >
                    Explorar
                  </Button>
                </Box>
              ))}
            </SimpleGrid>
          </Box>
          
          {/* BPM System Preview */}
          <Box mt={16} textAlign="center" position="relative" zIndex={1}>
            <Heading 
              as="h2" 
              size="xl" 
              mb={6}
              color={headingColor}
              position="relative"
              display="inline-block"
              _after={{
                content: '""',
                position: 'absolute',
                bottom: '-10px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '100px',
                height: '3px',
                background: isDark ? 'cyan.400' : 'blue.600',
                borderRadius: 'full',
              }}
            >
              Sistema de Colores BPM
            </Heading>
            <Text fontSize="lg" maxW="2xl" mx="auto" mb={8} opacity={0.8}>
              Nuestro sistema de categorización por colores te ayuda a organizar tu música según el tempo:
            </Text>
            
            <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={4} maxW="container.lg" mx="auto">
              <Box p={4} bg={cardBg} borderRadius="md" borderWidth="1px" borderColor={borderColor} className="bpm-card">
                <Text fontSize="3xl" mb={2}>🔵</Text>
                <Text fontWeight="bold">70-90 BPM</Text>
                <Text fontSize="sm" opacity={0.7}>Azul</Text>
                <Box h="4px" bg="blue.400" borderRadius="full" mt={2} width="100%" />  
              </Box>
              <Box p={4} bg={cardBg} borderRadius="md" borderWidth="1px" borderColor={borderColor} className="bpm-card">
                <Text fontSize="3xl" mb={2}>🟢</Text>
                <Text fontWeight="bold">90-100 BPM</Text>
                <Text fontSize="sm" opacity={0.7}>Verde</Text>
                <Box h="4px" bg="green.400" borderRadius="full" mt={2} width="100%" />
              </Box>
              <Box p={4} bg={cardBg} borderRadius="md" borderWidth="1px" borderColor={borderColor} className="bpm-card">
                <Text fontSize="3xl" mb={2}>🟡</Text>
                <Text fontWeight="bold">100-110 BPM</Text>
                <Text fontSize="sm" opacity={0.7}>Amarillo</Text>
                <Box h="4px" bg="yellow.400" borderRadius="full" mt={2} width="100%" />
              </Box>
              <Box p={4} bg={cardBg} borderRadius="md" borderWidth="1px" borderColor={borderColor} className="bpm-card">
                <Text fontSize="3xl" mb={2}>🟠</Text>
                <Text fontWeight="bold">110-120 BPM</Text>
                <Text fontSize="sm" opacity={0.7}>Naranja</Text>
                <Box h="4px" bg="orange.400" borderRadius="full" mt={2} width="100%" />
              </Box>
              <Box p={4} bg={cardBg} borderRadius="md" borderWidth="1px" borderColor={borderColor} className="bpm-card">
                <Text fontSize="3xl" mb={2}>🔴</Text>
                <Text fontWeight="bold">120-130 BPM</Text>
                <Text fontSize="sm" opacity={0.7}>Rojo</Text>
                <Box h="4px" bg="red.400" borderRadius="full" mt={2} width="100%" />
              </Box>
              <Box p={4} bg={cardBg} borderRadius="md" borderWidth="1px" borderColor={borderColor} className="bpm-card">
                <Text fontSize="3xl" mb={2}>🟣</Text>
                <Text fontWeight="bold">130-140 BPM</Text>
                <Text fontSize="sm" opacity={0.7}>Púrpura</Text>
                <Box h="4px" bg="purple.400" borderRadius="full" mt={2} width="100%" />
              </Box>
            </SimpleGrid>
            
            <Button 
              as={RouterLink} 
              to="/bpm-info" 
              size="md" 
              colorScheme="blue" 
              mt={8}
              rightIcon={<ArrowForwardIcon />}
            >
              Más información
            </Button>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default HomePage;
