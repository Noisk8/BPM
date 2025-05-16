import { useState, useEffect } from 'react';
import { 
  Box, Button, FormControl, FormLabel, Input, 
  Select, useToast, VStack, Heading, NumberInput,
  NumberInputField, NumberInputStepper, NumberIncrementStepper,
  NumberDecrementStepper, Grid, HStack, Text, Badge, Divider, 
  Flex, Icon, Image, SimpleGrid, Tabs, TabList, Tab, TabPanels, TabPanel,
  useDisclosure, AlertDialog, AlertDialogOverlay, AlertDialogContent,
  AlertDialogHeader, AlertDialogBody, AlertDialogFooter
} from '@chakra-ui/react';
import { createAlbum, getAlbums, deleteAlbum } from '../../services/albumService';
import { getArtists } from '../../services/artistService';
import { useQueryClient } from '@tanstack/react-query';
import { Artist, Album } from '../../types';
import { AddIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { getBpmColorEmoji, getBpmColorName } from '../../utils/bpmUtils';

export const AlbumForm = () => {
  const [title, setTitle] = useState('');
  const [artistId, setArtistId] = useState('');
  const [releaseYear, setReleaseYear] = useState<number | undefined>(undefined);
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [albumToDelete, setAlbumToDelete] = useState<Album | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const queryClient = useQueryClient();
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  // Cargar artistas y álbumes
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingData(true);
      try {
        const [artistsData, albumsData] = await Promise.all([
          getArtists(),
          getAlbums()
        ]);
        setArtists(artistsData);
        setAlbums(albumsData);
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

  // Reiniciar el formulario
  const resetForm = () => {
    setTitle('');
    setArtistId('');
    setReleaseYear(undefined);
    setCoverImageUrl('');
    setEditingAlbum(null);
  };

  // Iniciar edición de un álbum
  const handleEdit = (album: Album) => {
    setEditingAlbum(album);
    setTitle(album.title);
    setArtistId(album.artist_id);
    setReleaseYear(album.release_year || undefined);
    setCoverImageUrl(album.cover_image_url || '');
  };

  // Confirmar eliminación
  const handleConfirmDelete = (album: Album) => {
    setAlbumToDelete(album);
    onOpen();
  };

  // Eliminar álbum
  const handleDelete = async () => {
    if (!albumToDelete) return;
    
    try {
      await deleteAlbum(albumToDelete.id);
      setAlbums(albums.filter(a => a.id !== albumToDelete.id));
      toast({
        title: 'Álbum eliminado',
        status: 'success',
        duration: 3000,
      });
      queryClient.invalidateQueries(['albums']);
    } catch (error: any) {
      toast({
        title: 'Error al eliminar álbum',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      onClose();
      setAlbumToDelete(null);
    }
  };

  // Guardar álbum (crear o actualizar)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !artistId) return;

    setIsLoading(true);
    try {
      await createAlbum({
        id: editingAlbum?.id, // Si es null, se crea nuevo. Si tiene valor, actualiza
        title,
        artist_id: artistId,
        release_year: releaseYear,
        cover_image_url: coverImageUrl || undefined
      });
      
      resetForm();
      
      toast({
        title: editingAlbum ? 'Álbum actualizado' : 'Álbum creado',
        status: 'success',
        duration: 3000,
      });
      
      // Recargar los datos
      const albumsData = await getAlbums();
      setAlbums(albumsData);
      queryClient.invalidateQueries(['albums']);
    } catch (error: any) {
      toast({
        title: editingAlbum ? 'Error al actualizar álbum' : 'Error al crear álbum',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Función que devuelve el artista correspondiente a un ID
  const getArtistName = (id: string) => {
    const artist = artists.find(a => a.id === id);
    return artist ? artist.name : 'Desconocido';
  };

  return (
    <Tabs isLazy colorScheme="blue">
      <TabList>
        <Tab>Listado de Álbumes</Tab>
        <Tab>{editingAlbum ? 'Editar Álbum' : 'Nuevo Álbum'}</Tab>
      </TabList>
      
      <TabPanels>
        {/* Panel de listado de álbumes */}
        <TabPanel>
          <Heading size="md" mb={4}>Gestión de Álbumes</Heading>
          <Text mb={4}>Aquí puedes ver todos los álbumes registrados en el sistema.</Text>
          
          {isLoadingData ? (
            <Flex justifyContent="center" my={8}>
              <Text>Cargando álbumes...</Text>
            </Flex>
          ) : albums.length === 0 ? (
            <Box p={5} borderWidth="1px" borderRadius="md" textAlign="center">
              <Text>No hay álbumes registrados. ¡Añade el primero!</Text>
            </Box>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {albums.map(album => (
                <Box key={album.id} p={4} borderWidth="1px" borderRadius="md" position="relative">
                  {album.cover_image_url && (
                    <Image 
                      src={album.cover_image_url} 
                      alt={album.title}
                      borderRadius="md"
                      objectFit="cover"
                      boxSize="150px"
                      mx="auto"
                      mb={3}
                    />
                  )}
                  
                  <Heading size="sm" mb={2} noOfLines={1}>{album.title}</Heading>
                  <Text fontSize="sm" mb={1}>
                    Artista: <strong>{getArtistName(album.artist_id)}</strong>
                  </Text>
                  {album.release_year && (
                    <Text fontSize="sm" mb={1}>Año: {album.release_year}</Text>
                  )}
                  
                  {/* Información BPM */}
                  {album.songs && album.songs.length > 0 && (
                    <VStack align="start" mt={3} spacing={1}>
                      <Text fontSize="sm" fontWeight="bold">BPM promedio:</Text>
                      <HStack spacing={1}>
                        {Array.from(new Set(album.songs.map(song => {
                          const bpm = song.bpm || 0;
                          return { emoji: getBpmColorEmoji(bpm), name: getBpmColorName(bpm) };
                        }))).map((bpmInfo, index) => (
                          <Badge key={index} colorScheme={bpmInfo.name.toLowerCase()} mt={1}>
                            {bpmInfo.emoji} {bpmInfo.name}
                          </Badge>
                        ))}
                      </HStack>
                    </VStack>
                  )}
                  
                  <Divider my={3} />
                  
                  <HStack justifyContent="flex-end" mt={2}>
                    <Button
                      leftIcon={<EditIcon />}
                      size="sm"
                      colorScheme="blue"
                      variant="outline"
                      onClick={() => handleEdit(album)}
                    >
                      Editar
                    </Button>
                    <Button
                      leftIcon={<DeleteIcon />}
                      size="sm"
                      colorScheme="red"
                      variant="outline"
                      onClick={() => handleConfirmDelete(album)}
                    >
                      Eliminar
                    </Button>
                  </HStack>
                </Box>
              ))}
            </SimpleGrid>
          )}
        </TabPanel>
        
        {/* Panel de formulario */}
        <TabPanel>
          <Box as="form" onSubmit={handleSubmit} p={5} shadow="md" borderWidth="1px" borderRadius="md">
            <Heading size="md" mb={4}>{editingAlbum ? 'Editar Álbum' : 'Añadir Nuevo Álbum'}</Heading>
            
            {editingAlbum && (
              <HStack mb={4}>
                <Button size="sm" onClick={resetForm} colorScheme="gray">
                  Cancelar edición
                </Button>
              </HStack>
            )}
            
            <VStack spacing={4}>
              <FormControl id="album-title" isRequired>
                <FormLabel>Título del Álbum</FormLabel>
                <Input 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="Introduzca el título del álbum"
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
              
              <FormControl id="release-year">
                <FormLabel>Año de Lanzamiento</FormLabel>
                <NumberInput 
                  min={1900} 
                  max={new Date().getFullYear()} 
                  value={releaseYear || ''}
                  onChange={(_, valueAsNumber) => setReleaseYear(valueAsNumber)}
                >
                  <NumberInputField placeholder="Año de lanzamiento (opcional)" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
              
              <FormControl id="cover-image">
                <FormLabel>URL de Portada</FormLabel>
                <Input 
                  value={coverImageUrl} 
                  onChange={(e) => setCoverImageUrl(e.target.value)} 
                  placeholder="URL de la imagen de portada (opcional)"
                />
              </FormControl>
              
              <Button 
                type="submit" 
                leftIcon={<AddIcon />}
                colorScheme="blue" 
                isLoading={isLoading}
                w="full"
              >
                {editingAlbum ? 'Actualizar Álbum' : 'Guardar Álbum'}
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
              Eliminar Álbum
            </AlertDialogHeader>

            <AlertDialogBody>
              ¿Estás seguro que deseas eliminar el álbum <strong>{albumToDelete?.title}</strong>?
              Esta acción no se puede deshacer y también eliminará todas las canciones asociadas.
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
