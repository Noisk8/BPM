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
  Text,
  useToast,
  Container,
  SimpleGrid,
  FormErrorMessage,
  Textarea,
  Select,
  Flex,
  IconButton,
  useColorModeValue,
  Image
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { supabase } from '../../services/supabase';

// Tipo para el formulario de LP
interface LPFormData {
  title: string;
  release_year: string;
  cover_url: string;
  description: string;
  artist_id: string;
  genre: string;
}

const LPForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const isEditMode = !!id;

  // Colores dinámicos basados en el tema
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Estado para el formulario
  const [formData, setFormData] = useState<LPFormData>({
    title: '',
    release_year: '',
    cover_url: '',
    description: '',
    artist_id: '',
    genre: ''
  });
  
  // Estado para errores de validación
  const [errors, setErrors] = useState<Partial<Record<keyof LPFormData, string>>>({});
  
  // Estado para la carga
  const [isLoading, setIsLoading] = useState(false);
  const [artists, setArtists] = useState<any[]>([]);
  
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
  
  // Cargar datos para edición y lista de artistas
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
      
      // Si estamos en modo edición, cargar datos del LP
      if (isEditMode) {
        const { data: lpData, error } = await supabase
          .from('lps')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) {
          toast({
            title: 'Error al cargar datos',
            description: error.message,
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        } else if (lpData) {
          setFormData({
            title: lpData.title || '',
            release_year: lpData.release_year?.toString() || '',
            cover_url: lpData.cover_url || '',
            description: lpData.description || '',
            artist_id: lpData.artist_id?.toString() || '',
            genre: lpData.genre || ''
          });
        }
      }
      
      setIsLoading(false);
    };
    
    fetchData();
  }, [id, isEditMode, toast]);
  
  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error al editar el campo
    if (errors[name as keyof LPFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };
  
  // Validar formulario
  const validateForm = () => {
    const newErrors: Partial<Record<keyof LPFormData, string>> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'El título es obligatorio';
    }
    
    if (!formData.artist_id) {
      newErrors.artist_id = 'Debes seleccionar un artista';
    }
    
    if (formData.release_year && !/^\d{4}$/.test(formData.release_year)) {
      newErrors.release_year = 'El año debe tener 4 dígitos';
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
      const lpData = {
        title: formData.title,
        release_year: formData.release_year ? parseInt(formData.release_year) : null,
        cover_url: formData.cover_url,
        description: formData.description,
        artist_id: formData.artist_id ? parseInt(formData.artist_id) : null,
        genre: formData.genre
      };
      
      let result;
      
      if (isEditMode) {
        // Actualizar LP existente
        result = await supabase
          .from('lps')
          .update(lpData)
          .eq('id', id);
      } else {
        // Crear nuevo LP
        result = await supabase
          .from('lps')
          .insert([lpData]);
      }
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      toast({
        title: isEditMode ? 'LP actualizado' : 'LP creado',
        description: isEditMode 
          ? 'El LP ha sido actualizado correctamente' 
          : 'El LP ha sido creado correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      navigate('/admin/lps');
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
            onClick={() => navigate('/admin/lps')}
            mr={4}
            size="sm"
          />
          <Heading size="lg">
            {isEditMode ? 'Editar LP' : 'Nuevo LP'}
          </Heading>
        </Flex>
        
        <form onSubmit={handleSubmit}>
          <VStack spacing={6} align="stretch">
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <FormControl isRequired isInvalid={!!errors.title}>
                <FormLabel>Título</FormLabel>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Título del LP"
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
            
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <FormControl isInvalid={!!errors.release_year}>
                <FormLabel>Año de lanzamiento</FormLabel>
                <Input
                  name="release_year"
                  value={formData.release_year}
                  onChange={handleChange}
                  placeholder="YYYY"
                />
                <FormErrorMessage>{errors.release_year}</FormErrorMessage>
              </FormControl>
              
              <FormControl>
                <FormLabel>Género</FormLabel>
                <Input
                  name="genre"
                  value={formData.genre}
                  onChange={handleChange}
                  placeholder="Género musical"
                />
              </FormControl>
            </SimpleGrid>
            
            <FormControl>
              <FormLabel>URL de la portada</FormLabel>
              <Input
                name="cover_url"
                value={formData.cover_url}
                onChange={handleChange}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
              {formData.cover_url && (
                <Box mt={2} borderRadius="md" overflow="hidden" maxW="150px">
                  <Image 
                    src={formData.cover_url} 
                    alt="Portada del LP" 
                    fallbackSrc="https://via.placeholder.com/150?text=Sin+imagen"
                  />
                </Box>
              )}
              <Text fontSize="sm" color="gray.500" mt={1}>
                Ingresa la URL directa de la imagen
              </Text>
            </FormControl>
            
            <FormControl>
              <FormLabel>Descripción</FormLabel>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Descripción del LP"
                rows={4}
              />
            </FormControl>
            
            <Flex justify="flex-end" mt={4}>
              <Button
                colorScheme="gray"
                mr={3}
                onClick={() => navigate('/admin/lps')}
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

export default LPForm;
