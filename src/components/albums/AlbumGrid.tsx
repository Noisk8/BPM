import { 
  Box, SimpleGrid, Card, CardBody, CardHeader, 
  Heading, Image, Text, Badge, AspectRatio
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { getAlbums } from '../../services/albumService';
import { Album } from '../../types';

type AlbumGridProps = {
  albums?: Album[];
  isLoading?: boolean;
};

export default function AlbumGrid({ albums, isLoading }: AlbumGridProps) {
  const { data: fetchedAlbums, isLoading: isFetching } = useQuery(
    ['albums'], 
    getAlbums,
    { enabled: !albums }
  );

  const displayAlbums = albums || fetchedAlbums || [];
  const loading = isLoading || isFetching;

  if (loading) {
    return <Text>Cargando álbumes...</Text>;
  }

  if (!displayAlbums.length) {
    return <Text>No se encontraron álbumes</Text>;
  }

  return (
    <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
      {displayAlbums.map(album => (
        <Card key={album.id} overflow="hidden" h="100%">
          <AspectRatio ratio={1} maxH="200px">
            <Image 
              src={album.cover_image_url || 'https://via.placeholder.com/300?text=Album+Cover'} 
              alt={album.title}
              objectFit="cover"
              fallbackSrc="https://via.placeholder.com/300?text=Album+Cover"
            />
          </AspectRatio>
          <CardHeader>
            <Heading size="md" noOfLines={1}>{album.title}</Heading>
            <Text color="gray.500" noOfLines={1}>{album.artist?.name || 'Artista desconocido'}</Text>
            {album.release_year && (
              <Badge colorScheme="blue" mt={2}>
                {album.release_year}
              </Badge>
            )}
          </CardHeader>
        </Card>
      ))}
    </SimpleGrid>
  );
}
