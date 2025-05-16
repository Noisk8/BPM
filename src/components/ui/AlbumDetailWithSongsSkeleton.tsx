import React from 'react';
import { Box, Skeleton } from '@chakra-ui/react';
import AlbumDetailSkeleton from './AlbumDetailSkeleton';
import SongTableSkeleton from './SongTableSkeleton';

interface AlbumDetailWithSongsSkeletonProps {
  songCount?: number;
}

const AlbumDetailWithSongsSkeleton: React.FC<AlbumDetailWithSongsSkeletonProps> = ({ 
  songCount = 8 
}) => {
  return (
    <>
      <AlbumDetailSkeleton />
      <Box mt={10}>
        <Skeleton height="30px" width="150px" mb={4} />
        <SongTableSkeleton rowCount={songCount} />
      </Box>
    </>
  );
};

export default AlbumDetailWithSongsSkeleton;
