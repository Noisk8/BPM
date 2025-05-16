import React from 'react';
import { 
  Box, 
  Skeleton, 
  SkeletonText, 
  Flex, 
  useColorModeValue,
  SimpleGrid
} from '@chakra-ui/react';

// Componente de skeleton para una tarjeta de álbum individual
export const AlbumCardSkeleton: React.FC = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box 
      borderWidth="1px" 
      borderRadius="lg" 
      overflow="hidden"
      boxShadow="md"
      bg={bgColor}
      borderColor={borderColor}
      position="relative"
      transition="transform 0.3s, box-shadow 0.3s"
      height="100%"
      display="flex"
      flexDirection="column"
    >
      {/* Skeleton para la imagen de portada */}
      <Skeleton 
        height="180px" 
        width="100%" 
        startColor="gray.100" 
        endColor="gray.300"
      />
      
      <Box p={4}>
        {/* Skeleton para el título del álbum */}
        <Skeleton height="24px" width="70%" mb={2} />
        
        {/* Skeleton para el nombre del artista */}
        <Skeleton height="16px" width="50%" mb={3} />
        
        <Flex justify="space-between" align="center" mt={2}>
          {/* Skeleton para la cantidad de canciones */}
          <Skeleton height="16px" width="30%" />
          
          {/* Skeleton para el año de lanzamiento */}
          <Skeleton height="16px" width="20%" />
        </Flex>
      </Box>
    </Box>
  );
};

// Componente grid para mostrar múltiples skeletons
interface AlbumSkeletonGridProps {
  count?: number;
}

export const AlbumSkeletonGrid: React.FC<AlbumSkeletonGridProps> = ({ count = 6 }) => {
  return (
    <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6} width="100%">
      {Array(count).fill(0).map((_, index) => (
        <AlbumCardSkeleton key={index} />
      ))}
    </SimpleGrid>
  );
};

export default AlbumSkeletonGrid;
