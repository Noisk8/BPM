import { useState } from 'react';
import { 
  Box, Button, FormControl, FormLabel, Input, 
  useToast, VStack, Heading 
} from '@chakra-ui/react';
import { createArtist } from '../../services/artistService';
import { useQueryClient } from '@tanstack/react-query';

export const ArtistForm = () => {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      await createArtist(name);
      setName('');
      toast({
        title: 'Artista creado',
        status: 'success',
        duration: 3000,
      });
      queryClient.invalidateQueries(['artists']);
    } catch (error: any) {
      toast({
        title: 'Error al crear artista',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit} p={5} shadow="md" borderWidth="1px" borderRadius="md">
      <Heading size="md" mb={4}>Añadir Nuevo Artista</Heading>
      <VStack spacing={4}>
        <FormControl id="artist-name" isRequired>
          <FormLabel>Nombre del Artista</FormLabel>
          <Input 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Introduzca el nombre del artista"
          />
        </FormControl>
        <Button 
          type="submit" 
          colorScheme="blue" 
          isLoading={isLoading}
          w="full"
        >
          Guardar Artista
        </Button>
      </VStack>
    </Box>
  );
};
