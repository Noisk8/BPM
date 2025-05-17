import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  useToast,
  Container,
  SimpleGrid,
  FormErrorMessage,
  Flex,
  IconButton,
  useColorModeValue,
  Text,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { BPM_COLOR_RANGES } from '../../types';
import { supabase } from '../../services/supabase';

// Tipo para el formulario de Track
interface TrackFormData {
  title: string;
  bpm: number;
  duration_seconds: number;
  artist_id: string;
  lp_id: string;
  track_number: number;
  key: string;
}

const TrackForm = () => {
  const { trackId, lpId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const isEditMode = !!trackId;

  // Colores dinámicos basados en el tema
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Estado para el formulario
  const [formData, setFormData] = useState<TrackFormData>({
    title: '',
    bpm: 120,
    duration_seconds: 180,
    artist_id: '',
    lp_id: lpId || '',
    track_number: 1,
    key: ''
  });
  
  // Estado para errores de validación
  const [errors, setErrors] = useState<Partial<Record<keyof TrackFormData, string>>>({});
  
  // Estado para la carga
  const [isLoading, setIsLoading] = useState(false);
  const [artists, setArtists] = useState<any[]>([]);
  const [lps, setLps] = useState<any[]>([]);
  const [currentLp, setCurrentLp] = useState<any>(null);
  
  // Verificar sesión
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast({
          title: 'Sesión no válida',
          description: 'Debes iniciar sesión para acceder a esta página',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        navigate('/login');
      }
    };
    
    checkSession();
  }, [navigate, toast]);
  
  // Cargar datos para edición y listas de artistas y LPs
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      // Cargar lista de artistas
      const { data: artistsData } = await supabase
        .from('artists')
        .select('*')
        .order('name');
      
      if (artistsData) {
        setArtists(artistsData);
      }
      
      // Cargar lista de LPs
      const { data: lpsData } = await supabase
        .from('lps')
        .select('*')
        .order('title');
      
      if (lpsData) {
        setLps(lpsData);
      }
      
      // Si estamos en modo edición, cargar datos de la canción
      if (isEditMode && trackId) {
        const { data: trackData, error } = await supabase
          .from('tracks')
          .select('*')
          .eq('id', trackId)
          .single();
        
        if (error) {
          toast({
            title: 'Error al cargar datos',
            description: error.message,
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        } else if (trackData) {
          setFormData({
            title: trackData.title || '',
            bpm: trackData.bpm || 120,
            duration_seconds: trackData.duration_seconds || 180,
            artist_id: trackData.artist_id?.toString() || '',
            lp_id: trackData.lp_id?.toString() || '',
            track_number: trackData.track_number || 1,
            key: trackData.key || ''
          });
        }
      }
      
      // Si tenemos un LP específico (para añadir canción a un LP)
      if (lpId) {
        const { data: lpData } = await supabase
          .from('lps')
          .select('*, artists(*)')
          .eq('id', lpId)
          .single();
        
        if (lpData) {
          setCurrentLp(lpData);
          // Pre-seleccionar el artista del LP si no estamos en modo edición
          if (!isEditMode && lpData.artist_id) {
            setFormData(prev => ({
              ...prev,
              artist_id: lpData.artist_id.toString()
            }));
          }
        }
      }
      
      setIsLoading(false);
    };
    
    fetchData();
  }, [trackId, lpId, isEditMode, toast]);
  
  // Obtener el emoji de color según el BPM
  const getBpmColorEmoji = (bpm: number): string => {
    for (const range of BPM_COLOR_RANGES) {
      if (bpm >= range.min && bpm <= range.max) {
        return range.emoji;
      }
    }
    return '⚪'; // Default
  };
  
  // Obtener el nombre del color según el BPM
  const getBpmColorName = (bpm: number): string => {
    for (const range of BPM_COLOR_RANGES) {
      if (bpm >= range.min && bpm <= range.max) {
        return range.name;
      }
    }
    return 'Sin categoría';
  };
  
  // Formatear duración en segundos a formato mm:ss
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error al editar el campo
    if (errors[name as keyof TrackFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };
  
  // Manejar cambios en campos numéricos
  const handleNumberChange = (name: keyof TrackFormData, value: number) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error al editar el campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };
  
  // Validar formulario
  const validateForm = () => {
    const newErrors: Partial<Record<keyof TrackFormData, string>> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'El título es obligatorio';
    }
    
    if (!formData.artist_id) {
      newErrors.artist_id = 'Debes seleccionar un artista';
    }
    
    if (!formData.lp_id) {
      newErrors.lp_id = 'Debes seleccionar un LP';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: 'Formulario incompleto',
        description: 'Por favor, completa todos los campos requeridos',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const trackData = {
        title: formData.title,
        bpm: formData.bpm,
        duration_seconds: formData.duration_seconds,
        artist_id: formData.artist_id ? parseInt(formData.artist_id) : null,
        lp_id: formData.lp_id ? parseInt(formData.lp_id) : null,
        track_number: formData.track_number,
        key: formData.key
      };
      
      let result;
      
      if (isEditMode) {
        // Actualizar canción existente
        result = await supabase
          .from('tracks')
          .update(trackData)
          .eq('id', trackId);
      } else {
        // Crear nueva canción
        result = await supabase
          .from('tracks')
          .insert([trackData]);
      }
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      toast({
        title: isEditMode ? 'Canción actualizada' : 'Canción creada',
        description: isEditMode 
          ? 'La canción ha sido actualizada correctamente' 
          : 'La canción ha sido creada correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Navegar de vuelta al LP o a la lista de canciones
      if (formData.lp_id) {
        navigate(`/album/${formData.lp_id}`);
      } else {
        navigate('/admin/songs');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Container maxW="container.md" py={8}>
      <Box 
        bg={bgColor} 
        p={6} 
        borderRadius="lg" 
        boxShadow="md"
        borderWidth="1px"
        borderColor={borderColor}
      >
        <Flex mb={6} align="center">
          <IconButton
            aria-label="Volver"
            icon={<ArrowBackIcon />}
            onClick={() => lpId ? navigate(`/album/${lpId}`) : navigate('/admin/songs')}
            mr={4}
            size="sm"
          />
          <Heading size="lg">
            {isEditMode ? 'Editar Canción' : 'Nueva Canción'}
          </Heading>
        </Flex>
        
        {currentLp && (
          <Box 
            p={4} 
            bg={useColorModeValue('blue.50', 'blue.900')} 
            borderRadius="md" 
            mb={6}
          >
            <Text fontWeight="bold">
              Añadiendo canción al LP: {currentLp.title}
            </Text>
            {currentLp.artists && (
              <Text fontSize="sm">
                Artista: {currentLp.artists.name}
              </Text>
            )}
          </Box>
        )}
        
        <form onSubmit={handleSubmit}>
          <VStack spacing={6} align="stretch">
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <FormControl isRequired isInvalid={!!errors.title}>
                <FormLabel>Título</FormLabel>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Título de la canción"
                />
                <FormErrorMessage>{errors.title}</FormErrorMessage>
              </FormControl>
              
              <FormControl isRequired isInvalid={!!errors.artist_id}>
                <FormLabel>Artista</FormLabel>
                <Select
                  name="artist_id"
                  value={formData.artist_id}
                  onChange={handleChange}
                  placeholder="Selecciona un artista"
                >
                  {artists.map(artist => (
                    <option key={artist.id} value={artist.id}>
                      {artist.name}
                    </option>
                  ))}
                </Select>
                <FormErrorMessage>{errors.artist_id}</FormErrorMessage>
              </FormControl>
            </SimpleGrid>
            
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
              <FormControl>
                <FormLabel>BPM</FormLabel>
                <Flex align="center">
                  <NumberInput
                    min={60}
                    max={200}
                    value={formData.bpm}
                    onChange={(_, val) => handleNumberChange('bpm', val)}
                    mr={3}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <Text fontSize="2xl">{getBpmColorEmoji(formData.bpm)}</Text>
                </Flex>
                <Text fontSize="sm" color="gray.500">
                  Categoría: {getBpmColorName(formData.bpm)}
                </Text>
              </FormControl>
              
              <FormControl>
                <FormLabel>Duración (segundos)</FormLabel>
                <NumberInput
                  min={1}
                  value={formData.duration_seconds}
                  onChange={(_, val) => handleNumberChange('duration_seconds', val)}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <Text fontSize="sm" color="gray.500">
                  {formatDuration(formData.duration_seconds)}
                </Text>
              </FormControl>
              
              <FormControl>
                <FormLabel>Número de pista</FormLabel>
                <NumberInput
                  min={1}
                  value={formData.track_number}
                  onChange={(_, val) => handleNumberChange('track_number', val)}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </SimpleGrid>
            
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <FormControl isRequired isInvalid={!!errors.lp_id}>
                <FormLabel>LP</FormLabel>
                <Select
                  name="lp_id"
                  value={formData.lp_id}
                  onChange={handleChange}
                  placeholder="Selecciona un LP"
                  isDisabled={!!lpId} // Deshabilitar si ya tenemos un LP específico
                >
                  {lps.map(lp => (
                    <option key={lp.id} value={lp.id}>
                      {lp.title}
                    </option>
                  ))}
                </Select>
                <FormErrorMessage>{errors.lp_id}</FormErrorMessage>
              </FormControl>
              
              <FormControl>
                <FormLabel>Tonalidad</FormLabel>
                <Input
                  name="key"
                  value={formData.key}
                  onChange={handleChange}
                  placeholder="Ej: Am, C, G#m"
                />
              </FormControl>
            </SimpleGrid>
            
            <Flex justify="flex-end" mt={4}>
              <Button
                colorScheme="gray"
                mr={3}
                onClick={() => lpId ? navigate(`/album/${lpId}`) : navigate('/admin/songs')}
              >
                Cancelar
              </Button>
              <Button
                colorScheme="blue"
                type="submit"
                isLoading={isLoading}
              >
                {isEditMode ? 'Actualizar' : 'Crear'}
              </Button>
            </Flex>
          </VStack>
        </form>
      </Box>
    </Container>
  );
};

export default TrackForm;
