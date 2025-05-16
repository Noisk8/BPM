import { Box, SimpleGrid, Text, Heading, Badge, useToken } from '@chakra-ui/react';
import { BPM_COLOR_RANGES } from '../../types';

export const BpmColorChart = () => {
  return (
    <Box p={4} borderWidth="1px" borderRadius="md" mb={6}>
      <Heading size="md" mb={4}>Sistema de Colores por BPM</Heading>
      
      <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={4}>
        {BPM_COLOR_RANGES.map(range => (
          <Box 
            key={range.color} 
            p={4} 
            borderRadius="md" 
            borderWidth="1px" 
            textAlign="center"
          >
            <Text fontSize="2xl">{range.emoji}</Text>
            <Text fontWeight="bold">{range.min}-{range.max} BPM</Text>
            <Badge colorScheme={range.color !== 'orange' ? range.color : 'orange'}>
              {range.color}
            </Badge>
          </Box>
        ))}
      </SimpleGrid>
      
      <Text mt={4} fontSize="sm" color="gray.500">
        Esta clasificación por colores te ayuda a identificar rápidamente el rango de BPM de cada canción,
        facilitando la organización y selección para sets de DJ.
      </Text>
    </Box>
  );
};
