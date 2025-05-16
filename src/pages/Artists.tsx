import { useState } from 'react';
import { 
  Box, Container, Heading, SimpleGrid, Text, 
  Card, CardBody, CardHeader, Spinner, 
  Input, InputGroup, InputLeftElement 
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { useQuery } from '@tanstack/react-query';
import { getArtists } from '../services/artistService';

export default function Artists() {
  const [search, setSearch] = useState('');
  const { data: artists, isLoading, error } = useQuery(['artists'], getArtists);

  if (isLoading) return <Spinner size="xl" />;
  if (error) return <Text color="red.500">Error al cargar los artistas</Text>;
  if (!artists?.length) return <Text>No hay artistas disponibles</Text>;

  // Filtrar artistas por búsqueda
  const filteredArtists = artists.filter(artist => 
    artist.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Container maxW="container.xl" p={5}>
      <Heading mb={6}>Artistas</Heading>
      
      <InputGroup mb={8}>
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="gray.300" />
        </InputLeftElement>
        <Input 
          placeholder="Buscar artista..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </InputGroup>

      <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={6}>
        {filteredArtists.map(artist => (
          <Card key={artist.id}>
            <CardHeader>
              <Heading size="md">{artist.name}</Heading>
            </CardHeader>
            <CardBody>
              {/* Aquí podrías añadir más información del artista si la tienes */}
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>
    </Container>
  );
}
