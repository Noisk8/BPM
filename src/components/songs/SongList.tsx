import { useState } from 'react';
import { 
  Box, Table, Thead, Tbody, Tr, Th, Td, 
  Spinner, Text, HStack, RangeSlider, 
  RangeSliderTrack, RangeSliderFilledTrack, 
  RangeSliderThumb, Badge, Flex, Heading
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { getSongs } from '../../services/songService';
import { BpmColorBadge } from '../common/BpmColorBadge';
import { BPM_COLOR_RANGES } from '../../types';

export default function SongList() {
  const [bpmRange, setBpmRange] = useState<[number, number]>([70, 140]);
  
  const { data: songs, isLoading, error } = useQuery(['songs'], getSongs);
  
  if (isLoading) return <Spinner size="xl" />;
  if (error) return <Text color="red.500">Error al cargar las canciones</Text>;
  if (!songs?.length) return <Text>No hay canciones disponibles</Text>;
  
  // Filtrar canciones por BPM
  const filteredSongs = songs.filter(
    song => song.bpm >= bpmRange[0] && song.bpm <= bpmRange[1]
  );

  // Función para formatear segundos a formato MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <Box>
      <Box mb={6}>
        <Heading size="md" mb={3}>Filtrar por BPM</Heading>
        <Flex mb={2}>
          {BPM_COLOR_RANGES.map((range) => (
            <Badge 
              key={range.color} 
              p={2} 
              mr={2} 
              borderRadius="md" 
              fontSize="md"
            >
              {range.emoji} {range.min}-{range.max}
            </Badge>
          ))}
        </Flex>
        <RangeSlider 
          aria-label={['min', 'max']}
          min={70}
          max={140}
          step={1}
          defaultValue={bpmRange}
          onChange={(val) => setBpmRange(val as [number, number])}
          colorScheme="blue"
        >
          <RangeSliderTrack>
            <RangeSliderFilledTrack />
          </RangeSliderTrack>
          <RangeSliderThumb index={0} />
          <RangeSliderThumb index={1} />
        </RangeSlider>
        <Flex justify="space-between" mt={1}>
          <Text>{bpmRange[0]} BPM</Text>
          <Text>{bpmRange[1]} BPM</Text>
        </Flex>
      </Box>

      <Heading size="md" mb={4}>
        {filteredSongs.length} canciones encontradas
      </Heading>

      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Canción</Th>
              <Th>Artista</Th>
              <Th>Álbum</Th>
              <Th isNumeric>BPM</Th>
              <Th>Color</Th>
              <Th>Duración</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredSongs.map((song) => (
              <Tr key={song.id}>
                <Td fontWeight="bold">{song.title}</Td>
                <Td>{song.artist?.name || 'Desconocido'}</Td>
                <Td>{song.album?.title || 'Desconocido'}</Td>
                <Td isNumeric>{song.bpm}</Td>
                <Td>
                  <BpmColorBadge bpm={song.bpm} />
                </Td>
                <Td>{formatDuration(song.duration_seconds)}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
}
