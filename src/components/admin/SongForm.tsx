import { useState, useEffect, useRef } from 'react';
import { 
  Box, Button, FormControl, FormLabel, Input, 
  Select, useToast, VStack, Heading, NumberInput,
  NumberInputField, NumberInputStepper, NumberIncrementStepper,
  NumberDecrementStepper, Text, HStack, Tabs, TabList, Tab, TabPanels, TabPanel,
  Table, Thead, Tbody, Tr, Th, Td, Badge, Flex, Spacer, IconButton, useDisclosure,
  AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent,
  AlertDialogOverlay, SimpleGrid, InputGroup, InputLeftElement, InputRightElement, Tooltip,
  Slider, SliderTrack, SliderFilledTrack, SliderThumb
} from '@chakra-ui/react';
import { createSong, getSongs, deleteSong } from '../../services/songService';
import { getArtists } from '../../services/artistService';
import { getAlbums } from '../../services/albumService';
import { useQueryClient } from '@tanstack/react-query';
import { Artist, Album, BPM_COLOR_RANGES, Song } from '../../types';
import { AddIcon, DeleteIcon, EditIcon, SearchIcon, TimeIcon } from '@chakra-ui/icons';
import { getBpmColorEmoji, getBpmColorName, formatDuration } from '../../utils/bpmUtils';

export const SongForm = () => {
  // Estado del formulario
  const [title, setTitle] = useState('');
  const [artistId, setArtistId] = useState('');
  const [albumId, setAlbumId] = useState('');
  const [bpm, setBpm] = useState<number>(120);
  const [durationSeconds, setDurationSeconds] = useState<number>(180);
  const [key, setKey] = useState('');
  
  // Estado de datos
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [filteredAlbums, setFilteredAlbums] = useState<Album[]>([]);
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [bpmFilter, setBpmFilter] = useState<[number, number]>([70, 140]);
  
  // Estado de edición y eliminación
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [songToDelete, setSongToDelete] = useState<Song | null>(null);
  
  // Estado UI
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const toast = useToast();
  const queryClient = useQueryClient();

  // Cargar todos los datos necesarios
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingData(true);
      try {
        const [artistsData, albumsData, songsData] = await Promise.all([
          getArtists(),
          getAlbums(),
          getSongs()
        ]);
        setArtists(artistsData);
        setAlbums(albumsData);
        setSongs(songsData);
        setFilteredSongs(songsData);
      } catch (error: any) {
        toast({
          title: 'Error al cargar datos',
          description: error.message,
          status: 'error',
          duration: 5000,
        });
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, [toast]);

  // Filtrar álbumes por artista seleccionado
  useEffect(() => {
    if (artistId) {
      const filtered = albums.filter(album => album.artist_id === artistId);
      setFilteredAlbums(filtered);
      // Limpiar selección de álbum si el artista cambia
      if (editingSong?.artist_id !== artistId) {
        setAlbumId('');
      }
    } else {
      setFilteredAlbums([]);
    }
  }, [artistId, albums, editingSong]);

  // Filtrar canciones según términos de búsqueda y BPM
  useEffect(() => {
    let filtered = [...songs];
    
    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(song => {
        const artistName = artists.find(a => a.id === song.artist_id)?.name.toLowerCase() || '';
        const albumTitle = albums.find(a => a.id === song.album_id)?.title.toLowerCase() || '';
        return (
          song.title.toLowerCase().includes(term) ||
          artistName.includes(term) ||
          albumTitle.includes(term) ||
          (song.key?.toLowerCase().includes(term) || false)
        );
      });
    }
    
    // Filtrar por rango de BPM
    filtered = filtered.filter(song => {
      const songBpm = song.bpm || 0;
      return songBpm >= bpmFilter[0] && songBpm <= bpmFilter[1];
    });
    
    setFilteredSongs(filtered);
  }, [searchTerm, bpmFilter, songs, artists, albums]);

  // Resetear el formulario
  const resetForm = () => {
    setTitle('');
    setArtistId('');
    setAlbumId('');
    setBpm(120);
    setDurationSeconds(180);
    setKey('');
    setEditingSong(null);
  };

  // Obtener nombres de artista y álbum
  const getArtistName = (id: string) => {
    const artist = artists.find(a => a.id === id);
    return artist ? artist.name : 'Desconocido';
  };

  const getAlbumTitle = (id: string) => {
    const album = albums.find(a => a.id === id);
    return album ? album.title : 'Desconocido';
  };

  // Editar canción
  const handleEdit = (song: Song) => {
    setEditingSong(song);
    setTitle(song.title);
    setArtistId(song.artist_id);
    setAlbumId(song.album_id);
    setBpm(song.bpm || 120);
    setDurationSeconds(song.duration_seconds || 180);
    setKey(song.key || '');
  };

  // Confirmar eliminación
  const handleConfirmDelete = (song: Song) => {
    setSongToDelete(song);
    onOpen();
  };

  // Eliminar canción
  const handleDelete = async () => {
    if (!songToDelete) return;
    
    try {
      await deleteSong(songToDelete.id);
      setSongs(songs.filter(s => s.id !== songToDelete.id));
      setFilteredSongs(filteredSongs.filter(s => s.id !== songToDelete.id));
      
      toast({
        title: 'Canción eliminada',
        status: 'success',
        duration: 3000,
      });
      
      queryClient.invalidateQueries(['songs']);
    } catch (error: any) {
      toast({
        title: 'Error al eliminar canción',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      onClose();
      setSongToDelete(null);
    }
  };

  // Guardar canción (crear o actualizar)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !artistId || !albumId) return;

    setIsLoading(true);
    try {
      await createSong({
        id: editingSong?.id, // Si tiene ID, actualiza. Si no, crea nuevo
        title,
        artist_id: artistId,
        album_id: albumId,
        bpm,
        duration_seconds: durationSeconds,
        key: key || undefined
      });
      
      // Recargar los datos
      const songsData = await getSongs();
      setSongs(songsData);
      setFilteredSongs(songsData);
      
      // Resetear formulario
      resetForm();
      
      toast({
        title: editingSong ? 'Canción actualizada' : 'Canción creada',
        status: 'success',
        duration: 3000,
      });
      
      queryClient.invalidateQueries(['songs']);
    } catch (error: any) {
      toast({
        title: editingSong ? 'Error al actualizar canción' : 'Error al crear canción',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Navegación entre pestañas
  const handleTabChange = (index: number) => {
    // Si cambio a la pestaña de listado, resetear formulario
    if (index === 0 && editingSong) {
      resetForm();
    }
  };

  return (
    <Tabs isLazy onChange={handleTabChange} colorScheme="blue">
      <TabList>
        <Tab>Listado de Canciones</Tab>
        <Tab>{editingSong ? 'Editar Canción' : 'Nueva Canción'}</Tab>
      </TabList>
      
      <TabPanels>
        {/* Panel de listado de canciones */}
        <TabPanel>
          <Heading size="md" mb={4}>Gestión de Canciones</Heading>
          
          {/* Controles de búsqueda y filtrado */}
          <Box mb={6}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
              {/* Buscador */}
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.300" />
                </InputLeftElement>
                <Input 
                  placeholder="Buscar canciones..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <InputRightElement>
                    <IconButton
                      aria-label="Limpiar búsqueda"
                      icon={<DeleteIcon />}
                      size="sm"
                      variant="ghost"
                      onClick={() => setSearchTerm('')}
                    />
                  </InputRightElement>
                )}
              </InputGroup>
              
              {/* Filtro de BPM con colores */}
              <Box>
                <Text mb={2} fontWeight="medium">Filtro de BPM: {bpmFilter[0]} - {bpmFilter[1]}</Text>
                <HStack spacing={2}>
                  <Text fontSize="sm">70</Text>
                  <Slider 
                    min={70} 
                    max={140} 
                    step={1}
                    value={bpmFilter}
                    onChange={(val) => setBpmFilter(val)}
                    colorScheme="blue"
                  >
                    <SliderTrack bg="gray.100">
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb boxSize={6} index={0}>
                      <Box color="blue.500">🔵</Box>
                    </SliderThumb>
                    <SliderThumb boxSize={6} index={1}>
                      <Box color="purple.500">🟣</Box>
                    </SliderThumb>
                  </Slider>
                  <Text fontSize="sm">140</Text>
                </HStack>
                <HStack spacing={1} mt={1} justifyContent="space-between">
                  <Badge colorScheme="blue">🔵 70-90</Badge>
                  <Badge colorScheme="green">🟢 90-100</Badge>
                  <Badge colorScheme="yellow">🟡 100-110</Badge>
                  <Badge colorScheme="orange">🟠 110-120</Badge>
                  <Badge colorScheme="red">🔴 120-130</Badge>
                  <Badge colorScheme="purple">🟣 130-140</Badge>
                </HStack>
              </Box>
            </SimpleGrid>
          </Box>
          
          {/* Tabla de canciones */}
          {isLoadingData ? (
            <Flex justifyContent="center" my={8}>
              <Text>Cargando canciones...</Text>
            </Flex>
          ) : filteredSongs.length === 0 ? (
            <Box p={5} borderWidth="1px" borderRadius="md" textAlign="center">
              <Text>No se encontraron canciones que coincidan con tus criterios.</Text>
            </Box>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Título</Th>
                    <Th>Artista</Th>
                    <Th>Álbum</Th>
                    <Th>BPM</Th>
                    <Th>Duración</Th>
                    <Th>Clave</Th>
                    <Th>Acciones</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredSongs.map(song => (
                    <Tr key={song.id}>
                      <Td fontWeight="medium">{song.title}</Td>
                      <Td>{getArtistName(song.artist_id)}</Td>
                      <Td>{getAlbumTitle(song.album_id)}</Td>
                      <Td>
                        <Tooltip label={`${song.bpm} BPM - ${getBpmColorName(song.bpm || 0)}`}>
                          <Badge colorScheme={getBpmColorName(song.bpm || 0).toLowerCase()}>
                            {getBpmColorEmoji(song.bpm || 0)} {song.bpm}
                          </Badge>
                        </Tooltip>
                      </Td>
                      <Td>{formatDuration(song.duration_seconds || 0)}</Td>
                      <Td>{song.key || '-'}</Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            aria-label="Editar"
                            icon={<EditIcon />}
                            size="sm"
                            colorScheme="blue"
                            variant="ghost"
                            onClick={() => handleEdit(song)}
                          />
                          <IconButton
                            aria-label="Eliminar"
                            icon={<DeleteIcon />}
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => handleConfirmDelete(song)}
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </TabPanel>
        
        {/* Panel de formulario */}
        <TabPanel>
          <Box as="form" onSubmit={handleSubmit} p={5} shadow="md" borderWidth="1px" borderRadius="md">
            <Heading size="md" mb={4}>{editingSong ? 'Editar Canción' : 'Añadir Nueva Canción'}</Heading>
            
            {editingSong && (
              <HStack mb={4}>
                <Button size="sm" onClick={resetForm} colorScheme="gray">
                  Cancelar edición
                </Button>
              </HStack>
            )}
            
            <VStack spacing={4}>
              <FormControl id="song-title" isRequired>
                <FormLabel>Título de la Canción</FormLabel>
                <Input 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="Introduzca el título de la canción"
                />
              </FormControl>
              
              <FormControl id="artist-id" isRequired>
                <FormLabel>Artista</FormLabel>
                <Select 
                  placeholder="Seleccione un artista" 
                  value={artistId}
                  onChange={(e) => setArtistId(e.target.value)}
                  isDisabled={isLoadingData}
                >
                  {artists.map(artist => (
                    <option key={artist.id} value={artist.id}>
                      {artist.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl id="album-id" isRequired>
                <FormLabel>Álbum</FormLabel>
                <Select 
                  placeholder={artistId ? "Seleccione un álbum" : "Seleccione primero un artista"}
                  value={albumId}
                  onChange={(e) => setAlbumId(e.target.value)}
                  isDisabled={!artistId || isLoadingData}
                >
                  {filteredAlbums.map(album => (
                    <option key={album.id} value={album.id}>
                      {album.title}
                    </option>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl id="bpm" isRequired>
                <FormLabel>BPM (Tempo)</FormLabel>
                <Box>
                  <NumberInput 
                    min={70} 
                    max={140} 
                    step={1}
                    value={bpm}
                    onChange={(_, valueAsNumber) => setBpm(valueAsNumber)}
                    mb={2}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  
                  <Slider
                    min={70}
                    max={140}
                    step={1}
                    value={bpm}
                    onChange={(val) => setBpm(val)}
                    mb={2}
                  >
                    <SliderTrack bg="gray.100">
                      <Box position="relative" right={10} />
                      <SliderFilledTrack bg={getBpmColorName(bpm).toLowerCase() + '.400'} />
                    </SliderTrack>
                    <SliderThumb boxSize={6}>
                      <Box>{getBpmColorEmoji(bpm)}</Box>
                    </SliderThumb>
                  </Slider>
                  
                  <Badge colorScheme={getBpmColorName(bpm).toLowerCase()} p={2} borderRadius="md">
                    <Text fontSize="md">
                      {getBpmColorEmoji(bpm)} {bpm} BPM - {getBpmColorName(bpm)}
                    </Text>
                  </Badge>
                </Box>
              </FormControl>
              
              <FormControl id="duration-seconds" isRequired>
                <FormLabel>Duración (segundos)</FormLabel>
                <InputGroup>
                  <NumberInput 
                    min={1} 
                    max={3600} 
                    value={durationSeconds}
                    onChange={(_, valueAsNumber) => setDurationSeconds(valueAsNumber)}
                    w="full"
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <InputRightElement width="4.5rem">
                    <Text fontSize="sm" color="gray.500" pr={4}>
                      <TimeIcon mr={1} />
                      {formatDuration(durationSeconds)}
                    </Text>
                  </InputRightElement>
                </InputGroup>
              </FormControl>
              
              <FormControl id="key">
                <FormLabel>Clave/Tonalidad</FormLabel>
                <Input 
                  value={key} 
                  onChange={(e) => setKey(e.target.value)} 
                  placeholder="Ej: Cm, D#, F (opcional)"
                />
              </FormControl>
              
              <Button 
                type="submit" 
                leftIcon={<AddIcon />}
                colorScheme="blue" 
                isLoading={isLoading}
                w="full"
                mt={2}
              >
                {editingSong ? 'Actualizar Canción' : 'Guardar Canción'}
              </Button>
            </VStack>
          </Box>
        </TabPanel>
      </TabPanels>
      
      {/* Diálogo de confirmación para eliminación */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Eliminar Canción
            </AlertDialogHeader>

            <AlertDialogBody>
              ¿Estás seguro que deseas eliminar la canción <strong>{songToDelete?.title}</strong>?
              Esta acción no se puede deshacer.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancelar
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>
                Eliminar
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Tabs>
  );
};
