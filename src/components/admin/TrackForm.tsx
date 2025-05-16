import React, { useState, useEffect } from 'react';
import { 
  Box, VStack, Heading, FormControl, FormLabel, Input, Button, 
  Select, Text, useToast, Flex, HStack, Center, InputGroup, InputRightElement
} from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const TrackForm: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { lpId, trackId } = useParams<{ lpId: string, trackId: string }>();
  const isEditMode = Boolean(trackId);
  
  const [artists, setArtists] = useState<any[]>([]);
  const [genres, setGenres] = useState<any[]>([]);
  const [lpData, setLpData] = useState<any>(null); // Datos del LP actual
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Datos del formulario del track
  const [formData, setFormData] = useState({
    title: '',
    artist_id: '', // Artista principal (para compatibilidad)
    artists: [] as string[], // Array de IDs de artistas para colaboraciones
    genres: [] as string[], // Array de IDs de géneros
    bpm: '',
    key: '',
    duration_seconds: ''
  });

  // Cargar datos necesarios: artistas y LP si añadimos a uno existente
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Cargar artistas para el selector
        const { data: artistsData, error: artistsError } = await supabase
          .from('artists')
          .select('id, name')
          .order('name');

        if (artistsError) throw artistsError;
        setArtists(artistsData || []);
        
        // Cargar géneros para el selector
        const { data: genresData, error: genresError } = await supabase
          .from('genres')
          .select('id, name, description')
          .order('name');
          
        if (genresError) throw genresError;
        setGenres(genresData || []);
        
        // Si estamos añadiendo a un LP existente o editando un track
        if (lpId) {
          const { data: albumData, error: albumError } = await supabase
            .from('albums')
            .select(`
              id, title, artist_id,
              artists:artist_id(id, name)
            `)
            .eq('id', lpId)
            .single();
            
          if (albumError) throw albumError;
          setLpData(albumData);
          
          // Si estamos añadiendo un track nuevo, usar el artista del LP por defecto
          if (!isEditMode && albumData?.artist_id) {
            setFormData(prev => ({ ...prev, artist_id: albumData.artist_id }));
          }
        }
        
        // Si estamos editando un track existente, cargar sus datos
        if (isEditMode && trackId) {
          const { data: trackData, error: trackError } = await supabase
            .from('songs')
            .select('*')
            .eq('id', trackId)
            .single();
            
          if (trackError) throw trackError;
          
          if (trackData) {
            // Cargar los artistas asociados a esta canción
            const { data: songArtists, error: songArtistsError } = await supabase
              .from('song_artists')
              .select('artist_id')
              .eq('song_id', trackId);
              
            if (songArtistsError) throw songArtistsError;
            
            // Cargar los géneros asociados a esta canción
            const { data: songGenres, error: songGenresError } = await supabase
              .from('song_genres')
              .select('genre_id')
              .eq('song_id', trackId);
              
            if (songGenresError) throw songGenresError;
            
            setFormData({
              title: trackData.title || '',
              artist_id: trackData.artist_id || '',
              artists: songArtists ? songArtists.map(sa => sa.artist_id) : [],
              genres: songGenres ? songGenres.map(sg => sg.genre_id) : [],
              bpm: trackData.bpm?.toString() || '',
              key: trackData.key || '',
              duration_seconds: trackData.duration_seconds?.toString() || ''
            });
            
            // También cargar info del LP al que pertenece este track
            if (trackData.album_id) {
              const { data: albumData, error: albumError } = await supabase
                .from('albums')
                .select(`
                  id, title, artist_id,
                  artists:artist_id(id, name)
                `)
                .eq('id', trackData.album_id)
                .single();
                
              if (albumError) throw albumError;
              setLpData(albumData);
            }
          }
        }
      } catch (err: any) {
        console.error('Error cargando datos:', err);
        setError('Error al cargar los datos necesarios');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [lpId, trackId, isEditMode]);

  // Manejar cambios en los campos del formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Añadir un artista a la lista de seleccionados
  const handleAddArtist = (artistId: string) => {
    if (!artistId) return;
    
    // Verificar si ya está en la lista
    if (formData.artists.includes(artistId)) {
      toast({
        title: 'Artista ya añadido',
        status: 'info',
        duration: 2000,
      });
      return;
    }
    
    // Añadir a la lista
    setFormData(prev => ({
      ...prev,
      artists: [...prev.artists, artistId]
    }));
  };
  
  // Eliminar un artista de la lista de seleccionados
  const handleRemoveArtist = (artistId: string) => {
    setFormData(prev => ({
      ...prev,
      artists: prev.artists.filter(id => id !== artistId)
    }));
  };
  
  // Añadir un género a la lista de seleccionados
  const handleAddGenre = (genreId: string) => {
    if (!genreId) return;
    
    // Verificar si ya está en la lista
    if (formData.genres.includes(genreId)) {
      toast({
        title: 'Género ya añadido',
        status: 'info',
        duration: 2000,
      });
      return;
    }
    
    // Añadir a la lista
    setFormData(prev => ({
      ...prev,
      genres: [...prev.genres, genreId]
    }));
  };
  
  // Eliminar un género de la lista de seleccionados
  const handleRemoveGenre = (genreId: string) => {
    setFormData(prev => ({
      ...prev,
      genres: prev.genres.filter(id => id !== genreId)
    }));
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

  // Guardar el track en la base de datos
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.title.trim()) {
      toast({
        title: 'Error',
        description: 'El título del track es obligatorio',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    if (!formData.bpm) {
      toast({
        title: 'Error',
        description: 'El BPM es obligatorio',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    try {
      setSubmitting(true);
      
      // Preparo los datos para enviar
      const trackData = {
        title: formData.title.trim(),
        artist_id: formData.artist_id || null, // Mantener para compatibilidad
        album_id: lpId || (lpData?.id || null), // Usar el LP actual
        bpm: formData.bpm ? parseInt(formData.bpm) : null,
        key: formData.key || null,
        duration_seconds: formData.duration_seconds ? parseInt(formData.duration_seconds) : null
      };
      
      let result;
      
      if (isEditMode && trackId) {
        // Actualizar track existente
        result = await supabase
          .from('songs')
          .update(trackData)
          .eq('id', trackId);
          
        if (result.error) throw result.error;
        
        // Actualizar relaciones con artistas
        // Primero eliminar todas las relaciones existentes
        const { error: deleteArtistsError } = await supabase
          .from('song_artists')
          .delete()
          .eq('song_id', trackId);
          
        if (deleteArtistsError) throw deleteArtistsError;
        
        // Luego insertar las nuevas relaciones
        if (formData.artists.length > 0) {
          const songArtistsData = formData.artists.map(artistId => ({
            song_id: trackId,
            artist_id: artistId
          }));
          
          const { error: insertArtistsError } = await supabase
            .from('song_artists')
            .insert(songArtistsData);
            
          if (insertArtistsError) throw insertArtistsError;
        }
        
        // Actualizar relaciones con géneros
        // Primero eliminar todas las relaciones existentes
        const { error: deleteGenresError } = await supabase
          .from('song_genres')
          .delete()
          .eq('song_id', trackId);
          
        if (deleteGenresError) throw deleteGenresError;
        
        // Luego insertar las nuevas relaciones
        if (formData.genres.length > 0) {
          const songGenresData = formData.genres.map(genreId => ({
            song_id: trackId,
            genre_id: genreId
          }));
          
          const { error: insertGenresError } = await supabase
            .from('song_genres')
            .insert(songGenresData);
            
          if (insertGenresError) throw insertGenresError;
        }
      } else {
        // Crear nuevo track
        result = await supabase
          .from('songs')
          .insert([trackData])
          .select();
          
        if (result.error) throw result.error;
        
        // Insertar relaciones con artistas si hay un nuevo track creado
        if (result.data && result.data.length > 0 && formData.artists.length > 0) {
          const newSongId = result.data[0].id;
          
          const songArtistsData = formData.artists.map(artistId => ({
            song_id: newSongId,
            artist_id: artistId
          }));
          
          const { error: insertError } = await supabase
            .from('song_artists')
            .insert(songArtistsData);
            
          if (insertError) throw insertError;
        }
        
        // Insertar relaciones con géneros si hay un nuevo track creado
        if (result.data && result.data.length > 0 && formData.genres.length > 0) {
          const newSongId = result.data[0].id;
          
          const songGenresData = formData.genres.map(genreId => ({
            song_id: newSongId,
            genre_id: genreId
          }));
          
          const { error: insertError } = await supabase
            .from('song_genres')
            .insert(songGenresData);
            
          if (insertError) throw insertError;
        }
      }
      
      if (result.error) throw result.error;
      
      toast({
        title: isEditMode ? 'Track actualizado' : 'Track creado',
        description: isEditMode ? 'El track se ha actualizado correctamente' : 'El track se ha añadido correctamente al LP',
        status: 'success',
        duration: 3000,
      });
      
      // Redireccionar a la vista del LP
      navigate('/admin/lps');
      
    } catch (err: any) {
      console.error('Error guardando track:', err);
      toast({
        title: 'Error',
        description: err.message || 'Error al guardar el track',
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
        <Heading>{isEditMode ? 'Editar Track' : 'Nuevo Track'}</Heading>
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
        <Box maxW="600px" mx="auto">
          {/* Mostrar info del LP al que se está añadiendo el track */}
          {lpData && (
            <Box p={4} bg="blue.50" borderRadius="md" mb={4}>
              <Text fontWeight="bold">Añadiendo track al LP:</Text>
              <Text fontSize="lg">{lpData.title}</Text>
              <Text color="gray.600">{lpData.artists?.name || 'Compilación / Varios artistas'}</Text>
            </Box>
          )}
          
          <Box as="form" onSubmit={handleSubmit} p={6} borderWidth="1px" borderRadius="lg" bg="white" shadow="md">
            <VStack spacing={4} align="stretch">
              <FormControl id="title" isRequired>
                <FormLabel>Título del track</FormLabel>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Nombre de la canción/track"
                />
              </FormControl>
              
              <FormControl mb={4}>
                <FormLabel>Artistas (colaboraciones)</FormLabel>
                <Flex align="center">
                  <Select 
                    placeholder="Seleccionar artistas"
                    onChange={(e) => handleAddArtist(e.target.value)}
                    value=""
                  >
                    {artists
                      .filter(artist => !formData.artists.includes(artist.id))
                      .map(artist => (
                        <option key={artist.id} value={artist.id}>
                          {artist.name}
                        </option>
                      ))}
                  </Select>
                </Flex>
                
                {formData.artists.length > 0 && (
                  <Box mt={2}>
                    <Text fontWeight="bold" mb={2}>Artistas seleccionados:</Text>
                    <VStack align="stretch" spacing={2}>
                      {formData.artists.map(artistId => {
                        const artist = artists.find(a => a.id === artistId);
                        return (
                          <Flex key={artistId} justify="space-between" align="center" p={2} borderWidth="1px" borderRadius="md">
                            <Text>{artist?.name || 'Artista desconocido'}</Text>
                            <Button size="sm" colorScheme="red" onClick={() => handleRemoveArtist(artistId)}>
                              Eliminar
                            </Button>
                          </Flex>
                        );
                      })}
                    </VStack>
                  </Box>
                )}
                
              </FormControl>
              
              <FormControl mb={4} mt={4}>
                <FormLabel>Géneros musicales</FormLabel>
                <Flex align="center">
                  <Select 
                    placeholder="Seleccionar géneros"
                    onChange={(e) => handleAddGenre(e.target.value)}
                    value=""
                  >
                    {genres
                      .filter(genre => !formData.genres.includes(genre.id))
                      .map(genre => (
                        <option key={genre.id} value={genre.id}>
                          {genre.name}
                        </option>
                      ))}
                  </Select>
                </Flex>
                
                {formData.genres.length > 0 && (
                  <Box mt={2}>
                    <Text fontWeight="bold" mb={2}>Géneros seleccionados:</Text>
                    <Flex flexWrap="wrap" gap={2}>
                      {formData.genres.map(genreId => {
                        const genre = genres.find(g => g.id === genreId);
                        return (
                          <Button 
                            key={genreId} 
                            size="sm" 
                            colorScheme="blue" 
                            variant="outline"
                            rightIcon={<span>×</span>}
                            onClick={() => handleRemoveGenre(genreId)}
                          >
                            {genre?.name || 'Género'}
                          </Button>
                        );
                      })}
                    </Flex>
                  </Box>
                )}
                <Text fontSize="sm" color="gray.500" mt={1}>
                  Puedes seleccionar múltiples géneros para clasificar la canción
                </Text>
              </FormControl>
              
              <FormControl id="bpm" isRequired>
                <FormLabel>BPM</FormLabel>
                <InputGroup>
                  <Input
                    name="bpm"
                    value={formData.bpm}
                    onChange={handleChange}
                    placeholder="Ej: 128"
                    type="number"
                  />
                  {formData.bpm && (
                    <InputRightElement>
                      <Text fontSize="xl">
                        {getBpmColorEmoji(parseInt(formData.bpm))}
                      </Text>
                    </InputRightElement>
                  )}
                </InputGroup>
              </FormControl>
              
              <FormControl id="key">
                <FormLabel>Tonalidad</FormLabel>
                <Input
                  name="key"
                  value={formData.key}
                  onChange={handleChange}
                  placeholder="Ej: Cm, F#m, etc."
                />
              </FormControl>
              
              <FormControl id="duration_seconds">
                <FormLabel>Duración (segundos)</FormLabel>
                <Input
                  name="duration_seconds"
                  value={formData.duration_seconds}
                  onChange={handleChange}
                  placeholder="Ej: 240 (4 minutos)"
                  type="number"
                />
              </FormControl>
              
              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                mt={4}
                isLoading={submitting}
                loadingText="Guardando..."
              >
                {isEditMode ? 'Actualizar Track' : 'Añadir Track'}
              </Button>
            </VStack>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default TrackForm;
