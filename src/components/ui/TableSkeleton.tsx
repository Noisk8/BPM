import React from 'react';
import { Box, Skeleton, Stack } from '@chakra-ui/react';

interface TableSkeletonProps {
  rows?: number;
}

const TableSkeleton: React.FC<TableSkeletonProps> = ({ rows = 5 }) => {
  return (
    <Box borderWidth="1px" borderRadius="md" overflow="hidden" width="100%">
      {/* Encabezado de tabla */}
      <Box bg="gray.100" p={3} display="flex" gap={4}>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={`head-${i}`} height="20px" width={`${i === 1 ? 40 : 120}px`} />
        ))}
      </Box>
      
      {/* Filas */}
      <Stack spacing={0}>
        {Array(rows).fill(0).map((_, i) => (
          <Box key={`row-${i}`} p={3} borderTopWidth={i > 0 ? "1px" : 0} display="flex" gap={4}>
            {[1, 2, 3, 4].map((j) => (
              <Skeleton key={`cell-${i}-${j}`} height="20px" width={`${j === 1 ? 40 : 120}px`} />
            ))}
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default TableSkeleton;
