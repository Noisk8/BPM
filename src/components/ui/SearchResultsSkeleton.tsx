import React from 'react';
import { 
  Box, 
  Skeleton, 
  Heading,
  SimpleGrid,
  Flex
} from '@chakra-ui/react';
import { AlbumCardSkeleton } from './AlbumCardSkeleton';
import SongTableSkeleton from './SongTableSkeleton';

const SearchResultsSkeleton: React.FC = () => {
  return (
    <Box mb={8}>
      <Skeleton height="32px" width="300px" mb={4} />
      
      {/* Skeleton para resultados de álbumes */}
      <Box mb={6}>
        <Skeleton height="24px" width="200px" mb={3} />
        <SimpleGrid columns={[1, 2, 3, 4]} spacing={6}>
          <AlbumCardSkeleton />
          <AlbumCardSkeleton />
          <AlbumCardSkeleton />
          <AlbumCardSkeleton />
        </SimpleGrid>
      </Box>
      
      {/* Skeleton para resultados de canciones */}
      <Box>
        <Skeleton height="24px" width="200px" mb={3} />
        <SongTableSkeleton rowCount={6} />
      </Box>
    </Box>
  );
};

export default SearchResultsSkeleton;
