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
  const [lpData, setLpData] = useState<any>(null); // Datos del LP actual
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Datos del formulario del track
  const [formData, setFormData] = useState({
    title: '',
    artist_id: '', // Puede ser diferente del artista del LP (colaboración)
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
            setFormData({
              title: trackData.title || '',
              artist_id: trackData.artist_id || '',
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
        artist_id: formData.artist_id || null,
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
      } else {
        // Crear nuevo track
        result = await supabase
          .from('songs')
          .insert([trackData])
          .select();
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
              
              <FormControl id="artist_id">
                <FormLabel>Artista del track</FormLabel>
                <Select 
                  name="artist_id"
                  value={formData.artist_id}
                  onChange={handleChange}
                  placeholder="Selecciona el artista de este track"
                >
                  {artists.map(artist => (
                    <option key={artist.id} value={artist.id}>
                      {artist.name}
                    </option>
                  ))}
                </Select>
                <Text fontSize="sm" color="gray.500" mt={1}>
                  Puede ser diferente del artista del LP (colaboración)
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
