import React from 'react';
import { 
  Box, 
  Skeleton, 
  Flex, 
  useColorModeValue,
  Center
} from '@chakra-ui/react';

const AlbumDetailSkeleton: React.FC = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Flex 
      direction={{ base: 'column', md: 'row' }} 
      gap={6} 
      mb={8}
    >
      {/* Skeleton para la imagen de portada */}
      <Skeleton 
        width={{ base: '100%', md: '300px' }} 
        height={{ base: '300px', md: '300px' }} 
        borderRadius="lg"
      />
      
      {/* Skeleton para la información del álbum */}
      <Box flex="1">
        {/* Título del álbum */}
        <Skeleton height="40px" width="60%" mb={2} />
        
        {/* Artista y año */}
        <Flex mb={4} alignItems="center">
          <Skeleton height="24px" width="40%" />
          <Box mx={2} />
          <Skeleton height="24px" width="15%" />
        </Flex>
        
        {/* Lista de artistas */}
        <Box mb={4}>
          <Skeleton height="20px" width="25%" mb={1} />
          <Skeleton height="16px" width="35%" mb={1} />
          <Skeleton height="16px" width="30%" mb={1} />
          <Skeleton height="16px" width="40%" mb={1} />
        </Box>
        
        {/* Botones de acción */}
        <Flex gap={3} mt={4} mb={8}>
          <Skeleton height="40px" width="120px" />
          <Skeleton height="40px" width="120px" />
        </Flex>
      </Box>
    </Flex>
  );
};

export default AlbumDetailSkeleton;
