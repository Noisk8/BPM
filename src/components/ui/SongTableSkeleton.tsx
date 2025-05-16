import React from 'react';
import { 
  Box, 
  Skeleton, 
  Flex,
  useColorModeValue
} from '@chakra-ui/react';

interface SongTableSkeletonProps {
  rowCount?: number;
}

const SongTableSkeleton: React.FC<SongTableSkeletonProps> = ({ rowCount = 5 }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const headerBgColor = useColorModeValue('gray.100', 'gray.700');
  const hoverBgColor = useColorModeValue('gray.50', 'gray.700');

  return (
    <Box as="table" width="100%" borderWidth="1px" borderRadius="md" overflow="hidden">
      {/* Skeleton para el encabezado de la tabla */}
      <Box as="thead" bg={headerBgColor}>
        <Box as="tr">
          <Box as="th" p={3} textAlign="left" width="40px">
            <Skeleton height="20px" width="20px" />
          </Box>
          <Box as="th" p={3} textAlign="left">
            <Skeleton height="20px" width="120px" />
          </Box>
          <Box as="th" p={3} textAlign="left" width="80px">
            <Skeleton height="20px" width="60px" />
          </Box>
          <Box as="th" p={3} textAlign="left">
            <Skeleton height="20px" width="100px" />
          </Box>
          <Box as="th" p={3} textAlign="left" width="80px">
            <Skeleton height="20px" width="60px" />
          </Box>
        </Box>
      </Box>
      
      {/* Skeleton para las filas de canciones */}
      <Box as="tbody">
        {Array(rowCount).fill(0).map((_, index) => (
          <Box as="tr" key={index} _hover={{ bg: hoverBgColor }}>
            <Box as="td" p={3} width="40px">
              <Skeleton height="20px" width="20px" />
            </Box>
            <Box as="td" p={3}>
              <Skeleton height="20px" width={`${Math.floor(Math.random() * 40) + 60}%`} />
            </Box>
            <Box as="td" p={3} width="80px">
              <Flex alignItems="center">
                <Skeleton height="20px" width="60px" />
              </Flex>
            </Box>
            <Box as="td" p={3}>
              <Skeleton height="20px" width={`${Math.floor(Math.random() * 30) + 50}%`} />
            </Box>
            <Box as="td" p={3} width="80px">
              <Skeleton height="20px" width="40px" />
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default SongTableSkeleton;
