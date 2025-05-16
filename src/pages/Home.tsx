import { 
  Box, Heading, Text, SimpleGrid, Button, 
  Card, CardBody, CardFooter, Image, 
  Stack, HStack, Divider
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { BPM_COLOR_RANGES } from '../types';

export default function Home() {
  return (
    <Box maxW="container.xl" mx="auto" p={5}>
      <Box mb={10} textAlign="center">
        <Heading as="h1" size="2xl" mb={4}>
          Gestor BPM para Música
        </Heading>
        <Text fontSize="xl" maxW="3xl" mx="auto">
          Organiza y visualiza tu colección musical por BPM con un sistema de colores intuitivo. 
          Ideal para DJ's y productores musicales.
        </Text>

        <HStack spacing={4} mt={6} justify="center">
          <Button as={RouterLink} to="/songs" colorScheme="blue" size="lg">
            Ver Canciones
          </Button>
          <Button as={RouterLink} to="/admin" colorScheme="green" size="lg">
            Administrar
          </Button>
        </HStack>
      </Box>

      <Divider mb={10} />

      <Heading as="h2" size="lg" mb={6}>Guía de Colores BPM</Heading>
      <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={4}>
        {BPM_COLOR_RANGES.map(range => (
          <Card key={range.color} align="center" variant="elevated">
            <CardBody>
              <Heading size="4xl" mb={4}>{range.emoji}</Heading>
              <Stack>
                <Text fontWeight="bold" fontSize="xl">
                  {range.min}-{range.max} BPM
                </Text>
                <Text>{range.color}</Text>
              </Stack>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      <Divider my={10} />

      <Heading as="h2" size="lg" mb={6}>Funcionalidades</Heading>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
        <Card>
          <CardBody>
            <Heading size="md" mb={4}>Gestión de Artistas y Álbumes</Heading>
            <Text>
              Organiza tu biblioteca musical con un completo sistema de gestión de artistas y álbumes.
            </Text>
          </CardBody>
          <CardFooter>
            <Button as={RouterLink} to="/admin" colorScheme="blue">
              Administrar
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardBody>
            <Heading size="md" mb={4}>Filtrado por BPM</Heading>
            <Text>
              Encuentra rápidamente canciones en rangos específicos de BPM con nuestro sistema de filtrado visual.
            </Text>
          </CardBody>
          <CardFooter>
            <Button as={RouterLink} to="/songs" colorScheme="blue">
              Ver Canciones
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardBody>
            <Heading size="md" mb={4}>Visualización Codificada por Colores</Heading>
            <Text>
              Sistema de colores intuitivo para identificar rápidamente el rango de BPM de cada canción.
            </Text>
          </CardBody>
          <CardFooter>
            <Button as={RouterLink} to="/songs" colorScheme="blue">
              Ver Canciones
            </Button>
          </CardFooter>
        </Card>
      </SimpleGrid>
    </Box>
  );
}
