import { useState } from 'react';
import { 
  Box, Container, Heading, SimpleGrid, Text, 
  Card, CardBody, CardHeader, Spinner, Image,
  Input, InputGroup, InputLeftElement, Flex,
  Badge, AspectRatio 
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { useQuery } from '@tanstack/react-query';
import { getAlbums } from '../services/albumService';

export default function Albums() {
  const [search, setSearch] = useState('');
  const { data: albums, isLoading, error } = useQuery(['albums'], getAlbums);

  if (isLoading) return <Spinner size="xl" />;
  if (error) return <Text color="red.500">Error al cargar los álbumes</Text>;
  if (!albums?.length) return <Text>No hay álbumes disponibles</Text>;

  // Filtrar álbumes por búsqueda
  const filteredAlbums = albums.filter(album => 
    album.title.toLowerCase().includes(search.toLowerCase()) ||
    album.artist?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Container maxW="container.xl" p={5}>
      <Heading mb={6}>Álbumes</Heading>
      
      <InputGroup mb={8}>
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="gray.300" />
        </InputLeftElement>
        <Input 
          placeholder="Buscar álbum o artista..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </InputGroup>

      <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={6}>
        {filteredAlbums.map(album => (
          <Card key={album.id} overflow="hidden">
            <AspectRatio ratio={1} maxH="200px">
              <Image 
                src={album.cover_image_url || 'https://via.placeholder.com/300?text=Album+Cover'} 
                alt={album.title}
                objectFit="cover"
                fallbackSrc="https://via.placeholder.com/300?text=Album+Cover"
              />
            </AspectRatio>
            <CardHeader>
              <Heading size="md">{album.title}</Heading>
              <Text color="gray.500">{album.artist?.name}</Text>
              {album.release_year && (
                <Badge colorScheme="blue" mt={2}>
                  {album.release_year}
                </Badge>
              )}
            </CardHeader>
          </Card>
        ))}
      </SimpleGrid>
    </Container>
  );
}
