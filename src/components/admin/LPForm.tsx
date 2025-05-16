import React, { useState, useEffect } from 'react';
import { 
  Box, VStack, Heading, FormControl, FormLabel, Input, Button, 
  Select, Text, useToast, Flex, HStack, Center, Tag, TagLabel, TagCloseButton,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton,
  Tabs, TabList, TabPanels, Tab, TabPanel, IconButton, Checkbox, Divider, SimpleGrid
} from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowBackIcon, AddIcon, SmallAddIcon, DeleteIcon } from '@chakra-ui/icons';
import { createClient } from '@supabase/supabase-js';

// Interfaces para tipado
interface Artist {
  id: string;
  name: string;
}

interface SelectedArtist {
  id: string;
  name: string;
  isPrimary: boolean;
}

interface Song {
  id?: string; // ID opcional para canciones existentes
  title: string;
  bpm: string;
  artist_id?: string; // ID del artista específico para esta canción
}

// Interfaces para las respuestas de Supabase
type AlbumArtistResponse = {
  artist_id: string;
  is_primary: boolean;
  artists: {
    id: string;
    name: string;
  };
};

// Configuración de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const LPForm: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para modal de nuevo artista
  const [isNewArtistModalOpen, setIsNewArtistModalOpen] = useState(false);
  const [newArtistName, setNewArtistName] = useState('');
  
  // Estado para llevar track de múltiples artistas seleccionados
  const [selectedArtists, setSelectedArtists] = useState<SelectedArtist[]>([]);
  
  // Array para almacenar IDs de canciones a eliminar cuando se guarde el formulario
  const [songsToDelete, setSongsToDelete] = useState<string[]>([]);
  
  // Estado para previsualizar la URL de la imagen
  const [showImagePreview, setShowImagePreview] = useState(false);
  
  // Datos del formulario
  const [formData, setFormData] = useState({
    title: '',
    release_year: '',
    cover_image_url: ''
  });
  
  // Estado para nuevas canciones (versión simplificada)
  const [songsData, setSongsData] = useState<Song[]>([]);
  const [isAddingSongs, setIsAddingSongs] = useState(false);

  // Cargar artistas para el selector
  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const { data, error } = await supabase
          .from('artists')
          .select('id, name')
          .order('name');

        if (error) throw error;
        setArtists(data || []);
      } catch (err: any) {
        console.error('Error cargando artistas:', err);
        setError('Error al cargar la lista de artistas');
      }
    };

    fetchArtists();
  }, []);

  // Si estamos en modo edición, cargar los datos del LP
  useEffect(() => {
    const fetchLPData = async () => {
      if (!isEditMode) return;
      
      try {
        setLoading(true);
        // Obtener datos básicos del álbum
        const { data, error } = await supabase
          .from('albums')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        
        if (data) {
          setFormData({
            title: data.title || '',
            release_year: data.release_year?.toString() || '',
            cover_image_url: data.cover_image_url || ''
          });
          
          // Si hay url de imagen, mostrar la previsualización
          if (data.cover_image_url) {
            setShowImagePreview(true);
          }
          
          // Cargar los artistas asociados al álbum
          const { data: albumArtists, error: artistsError } = await supabase
            .from('album_artists')
            .select('artist_id, is_primary, artists:artist_id(id, name)')
            .eq('album_id', id);
            
          if (artistsError) throw artistsError;
          
          if (albumArtists && albumArtists.length > 0) {
            // Hacemos un console.log para inspeccionar la estructura
            console.log('Album artists data:', albumArtists);
            
            // Tratamos la respuesta como un array con estructura cualquiera 
            const artists = albumArtists.map((item: any) => ({
              id: item.artist_id, // Usamos el artist_id directamente de la relación
              name: item.artists?.name || 'Artista desconocido', // Accedemos con precaución
              isPrimary: item.is_primary
            }));
            
            setSelectedArtists(artists);
          }
          
          // Cargar las canciones del álbum con información completa
          const { data: songs, error: songsError } = await supabase
            .from('songs')
            .select(`
              id, title, bpm, artist_id
            `)
            .eq('album_id', id);
            
          if (songsError) throw songsError;
          
          if (songs && songs.length > 0) {
            const formattedSongs = songs.map(song => ({
              id: song.id,
              title: song.title || '',
              bpm: song.bpm?.toString() || '',
              artist_id: song.artist_id || undefined
            }));
            
            setSongsData(formattedSongs);
          }
        }
      } catch (err: any) {
        console.error('Error cargando datos del LP:', err);
        setError('Error al cargar los datos del LP');
      } finally {
        setLoading(false);
      }
    };

    fetchLPData();
  }, [id, isEditMode]);

  // Manejar cambios en los campos del formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Verificar URL de imagen y mostrar vista previa
  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Si hay una URL de imagen, mostrar la vista previa
    if (name === 'cover_image_url' && value) {
      setShowImagePreview(true);
    } else if (name === 'cover_image_url' && !value) {
      setShowImagePreview(false);
    }
  };
  
  // Manejar selección de artistas
  const handleArtistSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const artistId = e.target.value;
    if (!artistId) return;
    
    // Buscar el artista en el array de artistas
    const artist = artists.find(a => a.id === artistId);
    if (!artist) return;
    
    // Verificar si el artista ya está seleccionado
    if (selectedArtists.some(a => a.id === artistId)) {
      toast({
        title: 'Artista ya añadido',
        description: 'Este artista ya está asociado al LP',
        status: 'info',
        duration: 3000,
      });
      return;
    }
    
    // Si es el primer artista, hacerlo primario automáticamente
    const isPrimary = selectedArtists.length === 0;
    
    setSelectedArtists(prev => [...prev, {
      id: artist.id,
      name: artist.name,
      isPrimary
    }]);
    
    // Resetear el select
    e.target.value = '';
  };
  
  // Eliminar un artista de la selección
  const removeSelectedArtist = (artistId: string) => {
    setSelectedArtists(prev => {
      const filtered = prev.filter(a => a.id !== artistId);
      
      // Si se eliminó el artista primario y hay otros artistas, hacer primario al primero
      if (prev.find(a => a.id === artistId)?.isPrimary && filtered.length > 0) {
        filtered[0].isPrimary = true;
      }
      
      return filtered;
    });
  };
  
  // Cambiar el artista primario
  const togglePrimaryArtist = (artistId: string) => {
    setSelectedArtists(prev => prev.map(artist => ({
      ...artist,
      isPrimary: artist.id === artistId
    })));
  };
  
  // Crear un nuevo artista
  const handleCreateNewArtist = async () => {
    if (!newArtistName.trim()) {
      toast({
        title: 'Nombre requerido',
        description: 'Por favor ingresa un nombre para el artista',
        status: 'warning',
        duration: 3000,
      });
      return;
    }
    
    try {
      // Insertar el nuevo artista en la base de datos
      const { data, error } = await supabase
        .from('artists')
        .insert([{ name: newArtistName.trim() }])
        .select();
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Añadir el nuevo artista a los artistas seleccionados
        const newArtist = data[0];
        
        // Agregar el artista a la lista de seleccionados
        const isPrimary = selectedArtists.length === 0; // Si es el primero, hacerlo principal
        setSelectedArtists(prev => [...prev, {
          id: newArtist.id,
          name: newArtist.name,
          isPrimary
        }]);
        
        // Refrescar la lista de artistas
        setArtists(prev => [...prev, newArtist]);
        
        toast({
          title: 'Artista creado',
          description: `${newArtistName} ha sido creado y añadido al LP`,
          status: 'success',
          duration: 3000,
        });
        
        // Cerrar el modal y limpiar
        setIsNewArtistModalOpen(false);
        setNewArtistName('');
      }
    } catch (err: any) {
      console.error('Error creando artista:', err);
      toast({
        title: 'Error',
        description: err.message || 'Error al crear el artista',
        status: 'error',
        duration: 5000,
      });
    }
  };
  
  // Manejar cambios en los datos de las canciones
  const handleSongChange = (index: number, field: string, value: string) => {
    // Asegurarnos de que estamos accediendo al elemento correcto
    if (index >= 0 && index < songsData.length) {
      setSongsData(prev => {
        const updated = [...prev];
        updated[index] = { ...updated[index], [field]: value };
        return updated;
      });
    }
  };
  
  // Añadir una nueva canción vacía al formulario
  const addEmptySong = () => {
    setSongsData(prev => [...prev, {
      id: `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // ID temporal único
      title: '',
      bpm: '',
      artist_id: selectedArtists.length === 1 ? selectedArtists[0].id : undefined
    }]);
  };
  
  // Eliminar una canción del formulario
  const removeSong = async (index: number) => {
    // Guardamos una copia antes de modificar
    const songToRemove = songsData[index];
    const newSongs = songsData.filter((_, i) => i !== index);
    
    // Si estamos en modo edición y la canción tiene un ID real (no temporal),
    // la eliminamos directamente de la base de datos
    if (isEditMode && songToRemove?.id && !songToRemove.id.startsWith('new-')) {
      try {
        // Eliminar directamente de la base de datos
        const { error } = await supabase
          .from('songs')
          .delete()
          .eq('id', songToRemove.id);
          
        if (error) {
          console.error('Error eliminando canción:', error);
          toast({
            title: 'Error',
            description: 'No se pudo eliminar la canción',
            status: 'error',
            duration: 3000,
          });
          return; // No continuar si hay error
        }
        
        toast({
          title: 'Canción eliminada',
          description: 'La canción se ha eliminado correctamente',
          status: 'success',
          duration: 2000,
        });
      } catch (err) {
        console.error('Error al eliminar canción:', err);
      }
    }
    
    setSongsData(newSongs);
  };
  
  // Obtener emoji de color para el BPM
  const getBpmColorEmoji = (bpm: number): string => {
    if (bpm >= 70 && bpm < 90) return '🔵'; // Azul
    if (bpm >= 90 && bpm < 100) return '🟢'; // Verde
    if (bpm >= 100 && bpm < 110) return '🟡'; // Amarillo
    if (bpm >= 110 && bpm < 120) return '🟠'; // Naranja
    if (bpm >= 120 && bpm < 130) return '🔴'; // Rojo
    if (bpm >= 130 && bpm <= 140) return '🟣'; // Púrpura
    return '';
  };

  // Guardar el LP en la base de datos
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.title.trim()) {
      toast({
        title: 'Error',
        description: 'El título del LP es obligatorio',
        status: 'error',
        duration: 3000,
      });
      return;
    }
    
    // Validar que haya al menos un artista seleccionado
    if (selectedArtists.length === 0) {
      toast({
        title: 'Error',
        description: 'Debes seleccionar al menos un artista para el LP',
        status: 'error',
        duration: 3000,
      });
      return;
    }
    
    // Validar que haya un artista primario
    if (!selectedArtists.some(artist => artist.isPrimary)) {
      toast({
        title: 'Error',
        description: 'Debes marcar un artista como principal',
        status: 'error',
        duration: 3000,
      });
      return;
    }
    
    // Validar canciones si hay alguna añadida
    if (songsData.length > 0) {
      // Verificar que todas las canciones tengan título y BPM
      const invalidSongs = songsData.filter(song => !song.title.trim() || !song.bpm.trim());
      if (invalidSongs.length > 0) {
        toast({
          title: 'Error en canciones',
          description: 'Todas las canciones deben tener título y BPM',
          status: 'error',
          duration: 3000,
        });
        return;
      }
    }

    try {
      setSubmitting(true);
      
      // Obtener el artista primario
      const primaryArtist = selectedArtists.find(artist => artist.isPrimary);
      
      // Preparo los datos del álbum
      const albumData = {
        title: formData.title.trim(),
        artist_id: primaryArtist?.id || null, // El artista principal como referencia directa
        release_year: formData.release_year ? parseInt(formData.release_year) : null,
        cover_image_url: formData.cover_image_url || null
      };
      
      let albumId;
      
      if (isEditMode && id) {
        // Actualizar LP existente
        const { error } = await supabase
          .from('albums')
          .update(albumData)
          .eq('id', id);
          
        if (error) throw error;
        albumId = id;
        
        // Eliminar todas las relaciones album_artists existentes para recriarlas
        const { error: deleteError } = await supabase
          .from('album_artists')
          .delete()
          .eq('album_id', id);
          
        if (deleteError) throw deleteError;
        
      } else {
        // Crear nuevo LP
        const { data, error } = await supabase
          .from('albums')
          .insert([albumData])
          .select();
          
        if (error) throw error;
        if (!data || data.length === 0) throw new Error('No se recibió ID del nuevo álbum');
        
        albumId = data[0].id;
      }
      
      // Crear relaciones album_artists para todos los artistas seleccionados
      const albumArtistsData = selectedArtists.map(artist => ({
        album_id: albumId,
        artist_id: artist.id,
        is_primary: artist.isPrimary
      }));
      
      const { error: artistsError } = await supabase
        .from('album_artists')
        .insert(albumArtistsData);
        
      if (artistsError) throw artistsError;
      
      // Procesar canciones si hay alguna
      if (isEditMode && albumId) {
        // Obtener todas las canciones existentes para este LP
        const { data: existingSongs } = await supabase
          .from('songs')
          .select('id')
          .eq('album_id', albumId);
          
        const existingSongIds = existingSongs?.map(song => song.id) || [];
        
        // Identificar canciones existentes vs nuevas en el formulario actual
        const existingSongsInForm = songsData.filter(song => song.id && !song.id.startsWith('new-'));
        const newSongs = songsData.filter(song => !song.id || song.id.startsWith('new-'));
        
        // Obtener IDs de las canciones que están actualmente en el formulario
        const songIdsInForm = existingSongsInForm.map(song => song.id);
        
        // Identificar canciones que ya no están en el formulario pero existen en la BD
        // Estas son las que debemos eliminar definitivamente
        const songsToDelete = existingSongIds.filter(id => !songIdsInForm.includes(id));
        
        // Eliminar canciones que ya no están en el formulario
        if (songsToDelete.length > 0) {
          console.log(`Eliminando ${songsToDelete.length} canciones que ya no están en el formulario:`, songsToDelete);
          
          for (const songId of songsToDelete) {
            const { error: deleteError } = await supabase
              .from('songs')
              .delete()
              .eq('id', songId);
              
            if (deleteError) {
              console.error(`Error al eliminar canción ${songId}:`, deleteError);
            }
          }
        }
        
        // Actualizar canciones existentes que permanecen en el formulario
        for (const song of existingSongsInForm) {
          const { error: updateError } = await supabase
            .from('songs')
            .update({
              title: song.title.trim(),
              bpm: song.bpm ? parseInt(song.bpm) : null,
              artist_id: song.artist_id || primaryArtist?.id || null,
            })
            .eq('id', song.id);
            
          if (updateError) throw updateError;
        }
        
        // Preparar nuevas canciones para insertar
        if (newSongs.length > 0) {
          const songsToInsert = newSongs.map(song => ({
            title: song.title.trim(),
            bpm: song.bpm ? parseInt(song.bpm) : null,
            key: null,
            artist_id: song.artist_id || primaryArtist?.id || null,
            album_id: albumId,
            duration_seconds: 0 // Usamos 0 como valor predeterminado para evitar el error de not-null
          }));
          
          // Insertar las canciones nuevas
          const { error: songsError } = await supabase
            .from('songs')
            .insert(songsToInsert);
            
          if (songsError) throw songsError;
        }
      } 
      // Para LPs nuevos, simplemente insertamos todas las canciones
      else if (songsData.length > 0) {
        const songsToInsert = songsData.map(song => ({
          title: song.title.trim(),
          bpm: song.bpm ? parseInt(song.bpm) : null,
          key: null,
          artist_id: song.artist_id || primaryArtist?.id || null,
          album_id: albumId,
          duration_seconds: 0 // Usamos 0 como valor predeterminado para evitar el error de not-null
        }));
        
        // Insertar las canciones
        const { error: songsError } = await supabase
          .from('songs')
          .insert(songsToInsert);
          
        if (songsError) throw songsError;
      }
      
      toast({
        title: isEditMode ? 'LP actualizado' : 'LP creado',
        description: isEditMode 
          ? `El LP "${formData.title}" y sus ${songsData.length} canciones se han actualizado correctamente` 
          : `El LP "${formData.title}" con ${songsData.length} canciones ha sido creado correctamente`,
        status: 'success',
        duration: 4000,
      });
      
      // Redireccionar a la lista de LPs
      navigate('/admin/lps');
      
    } catch (err: any) {
      console.error('Error guardando LP:', err);
      toast({
        title: 'Error',
        description: err.message || 'Error al guardar el LP',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box p={5}>
      <Flex justify="space-between" align="center" mb={5}>
        <Heading>{isEditMode ? 'Editar LP' : 'Nuevo LP'}</Heading>
        <Button leftIcon={<ArrowBackIcon />} variant="outline" onClick={() => navigate('/admin/lps')}>
          Volver
        </Button>
      </Flex>

      {loading ? (
        <Center h="200px">
          <Text>Cargando datos...</Text>
        </Center>
      ) : error ? (
        <Box p={4} bg="red.100" color="red.800" borderRadius="md" mb={4}>
          <Text>{error}</Text>
        </Box>
      ) : (
        <Box maxW="800px" mx="auto">
          <Tabs variant="enclosed">
            <TabList>
              <Tab>Información del LP</Tab>
              <Tab>Artistas {selectedArtists.length > 0 && `(${selectedArtists.length})`}</Tab>
              <Tab>Canciones {songsData.length > 0 && `(${songsData.length})`}</Tab>
            </TabList>
            
            <TabPanels>
              <TabPanel>
                <Box as="form" p={6} borderWidth="1px" borderRadius="lg" bg="white" shadow="md">
                  <VStack spacing={4} align="stretch">
                    <FormControl id="title" isRequired>
                      <FormLabel>Título del LP</FormLabel>
                      <Input
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Nombre del álbum/LP"
                      />
                    </FormControl>
                    
                    <FormControl id="release_year">
                      <FormLabel>Año de lanzamiento</FormLabel>
                      <Input
                        name="release_year"
                        value={formData.release_year}
                        onChange={handleChange}
                        placeholder="Ej: 2020"
                        type="number"
                      />
                    </FormControl>
                    
                    <FormControl id="cover_image_url">
                      <FormLabel>URL de la portada</FormLabel>
                      <Input
                        name="cover_image_url"
                        value={formData.cover_image_url}
                        onChange={handleImageUrlChange}
                        placeholder="https://ejemplo.com/imagen.jpg"
                      />
                      
                      {/* Vista previa de la imagen */}
                      {showImagePreview && formData.cover_image_url && (
                        <Box mt={4}>
                          <Text mb={2} fontSize="sm">Vista previa:</Text>
                          <Box 
                            width="200px" 
                            height="200px" 
                            backgroundImage={`url(${formData.cover_image_url})`}
                            backgroundSize="cover"
                            backgroundPosition="center"
                            borderRadius="md"
                            boxShadow="md"
                          />
                        </Box>
                      )}
                    </FormControl>
                  </VStack>
                </Box>
              </TabPanel>
              
              <TabPanel>
                <Box p={6} borderWidth="1px" borderRadius="lg" bg="white" shadow="md">
                  <VStack spacing={4} align="stretch">
                    <Flex justify="space-between" align="center">
                      <FormControl flex="1">
                        <FormLabel>Seleccionar artistas existentes</FormLabel>
                        <Select
                          placeholder="Seleccionar artista"
                          onChange={handleArtistSelect}
                        >
                          <option value="">Seleccionar...</option>
                          {artists.map(artist => (
                            <option key={artist.id} value={artist.id}>
                              {artist.name}
                            </option>
                          ))}
                        </Select>
                      </FormControl>
                      
                      <Button
                        mt={8}
                        ml={4}
                        colorScheme="teal"
                        leftIcon={<SmallAddIcon />}
                        onClick={() => setIsNewArtistModalOpen(true)}
                      >
                        Nuevo Artista
                      </Button>
                    </Flex>
                    
                    {selectedArtists.length > 0 ? (
                      <Box>
                        <Text fontWeight="bold" mb={2}>Artistas seleccionados:</Text>
                        <Box minH="100px" p={3} borderWidth="1px" borderRadius="md">
                          {selectedArtists.map(artist => (
                            <HStack key={artist.id} mb={2} p={2} bg={artist.isPrimary ? "blue.50" : "gray.50"} borderRadius="md">
                              <Checkbox 
                                isChecked={artist.isPrimary}
                                onChange={() => togglePrimaryArtist(artist.id)}
                                colorScheme="blue"
                              />
                              <Text flex="1">{artist.name}</Text>
                              <Text fontSize="sm" color={artist.isPrimary ? "blue.500" : "gray.500"}>
                                {artist.isPrimary ? "Principal" : ""}
                              </Text>
                              <IconButton
                                aria-label="Eliminar artista"
                                icon={<DeleteIcon />}
                                size="sm"
                                colorScheme="red"
                                variant="ghost"
                                onClick={() => removeSelectedArtist(artist.id)}
                              />
                            </HStack>
                          ))}
                        </Box>
                        <Text fontSize="sm" color="gray.500" mt={1}>
                          Marca la casilla para establecer el artista principal del LP. Si hay múltiples artistas, debe haber uno principal.
                        </Text>
                      </Box>
                    ) : (
                      <Box p={5} borderWidth="1px" borderStyle="dashed" borderRadius="md" textAlign="center">
                        <Text color="gray.500">No hay artistas seleccionados. Añade al menos uno.</Text>
                      </Box>
                    )}
                  </VStack>
                </Box>
              </TabPanel>
              
              <TabPanel>
                <Box p={6} borderWidth="1px" borderRadius="lg" bg="white" shadow="md">
                  <VStack spacing={4} align="stretch">
                    <Flex justify="space-between" align="center">
                      <Heading size="md">Canciones del LP</Heading>
                      <Button
                        colorScheme="teal"
                        leftIcon={<AddIcon />}
                        onClick={addEmptySong}
                      >
                        Añadir Canción
                      </Button>
                    </Flex>
                    
                    {songsData.length > 0 ? (
                      <VStack spacing={4} align="stretch" divider={<Divider />}>
                        {songsData.map((song, index) => (
                          <Box key={index} p={4} borderWidth="1px" borderRadius="md">
                            <Flex justify="space-between" align="center" mb={3}>
                              <Heading size="sm">Canción {index + 1}</Heading>
                              <IconButton
                                aria-label="Eliminar canción"
                                icon={<DeleteIcon />}
                                size="sm"
                                colorScheme="red"
                                onClick={() => removeSong(index)}
                              />
                            </Flex>
                            
                            <SimpleGrid columns={[1, null, 2]} spacing={4}>
                              <FormControl isRequired>
                                <FormLabel>Título</FormLabel>
                                <Input
                                  value={song.title}
                                  onChange={(e) => handleSongChange(index, 'title', e.target.value)}
                                  placeholder="Nombre de la canción"
                                />
                              </FormControl>
                              
                              <FormControl isRequired>
                                <FormLabel>BPM</FormLabel>
                                <Input
                                  value={song.bpm}
                                  onChange={(e) => handleSongChange(index, 'bpm', e.target.value)}
                                  placeholder="Ej: 128"
                                  type="number"
                                  min="70"
                                  max="140"
                                />
                                {song.bpm && (
                                  <Text mt={1}>
                                    {getBpmColorEmoji(parseInt(song.bpm))} {parseInt(song.bpm)} BPM
                                  </Text>
                                )}
                              </FormControl>
                              
                              {/* Selector de artista específico para la canción */}
                              {selectedArtists.length > 1 && (
                                <FormControl gridColumn="span 2">
                                  <FormLabel>Artista de esta canción</FormLabel>
                                  <Select
                                    value={song.artist_id || ''}
                                    onChange={(e) => handleSongChange(index, 'artist_id', e.target.value)}
                                    placeholder="Seleccionar artista específico"
                                  >
                                    <option value="">Usar artista principal del LP</option>
                                    {selectedArtists.map(artist => (
                                      <option key={artist.id} value={artist.id}>
                                        {artist.name} {artist.isPrimary ? '(Principal)' : ''}
                                      </option>
                                    ))}
                                  </Select>
                                </FormControl>
                              )}
                            </SimpleGrid>
                          </Box>
                        ))}
                      </VStack>
                    ) : (
                      <Box p={5} borderWidth="1px" borderStyle="dashed" borderRadius="md" textAlign="center">
                        <Text color="gray.500">No hay canciones añadidas. Puedes agregar canciones con el botón superior.</Text>
                      </Box>
                    )}
                  </VStack>
                </Box>
              </TabPanel>
            </TabPanels>
          </Tabs>
          
          <Box mt={6} borderWidth="1px" borderRadius="lg" p={6} bg="blue.50">
            <Flex justify="space-between" align="center">
              <Box>
                <Text fontWeight="bold">Estás {isEditMode ? 'editando' : 'creando'} un LP con:</Text>
                <Text>{selectedArtists.length} artista(s) y {songsData.length} canción(es)</Text>
              </Box>
              <Button
                onClick={handleSubmit}
                colorScheme="blue"
                size="lg"
                isLoading={submitting}
                loadingText="Guardando..."
              >
                {isEditMode ? 'Actualizar LP' : 'Crear LP'}
              </Button>
            </Flex>
          </Box>
        </Box>
      )}
      
      {/* Modal para crear nuevo artista */}
      <Modal isOpen={isNewArtistModalOpen} onClose={() => setIsNewArtistModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Crear nuevo artista</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl isRequired>
              <FormLabel>Nombre del artista</FormLabel>
              <Input
                value={newArtistName}
                onChange={(e) => setNewArtistName(e.target.value)}
                placeholder="Nombre del artista"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setIsNewArtistModalOpen(false)}>
              Cancelar
            </Button>
            <Button colorScheme="blue" onClick={handleCreateNewArtist}>
              Crear y añadir
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
    </Box>
  );
};

export default LPForm;
