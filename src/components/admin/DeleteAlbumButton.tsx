import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useToast
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface DeleteAlbumButtonProps {
  albumId: string;
  variant?: string;
  size?: string;
  isInline?: boolean;
}

const DeleteAlbumButton: React.FC<DeleteAlbumButtonProps> = ({ 
  albumId, 
  variant = "outline", 
  size = "md",
  isInline = false
}) => {
  const navigate = useNavigate();
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  // Función para eliminar el álbum
  const handleDelete = async () => {
    if (!albumId) return;
    setIsDeleting(true);
    
    try {
      // 1. Primero eliminar las canciones asociadas
      const { error: songsError } = await supabase
        .from('songs')
        .delete()
        .eq('album_id', albumId);
      
      if (songsError) throw songsError;
      
      // 2. Eliminar las relaciones de artistas
      const { error: artistsError } = await supabase
        .from('album_artists')
        .delete()
        .eq('album_id', albumId);
      
      if (artistsError) throw artistsError;
      
      // 3. Finalmente eliminar el álbum
      const { error: albumError } = await supabase
        .from('albums')
        .delete()
        .eq('id', albumId);
      
      if (albumError) throw albumError;
      
      toast({
        title: 'Álbum eliminado',
        description: 'El álbum y sus canciones han sido eliminados correctamente',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Redirigir a la página principal si no es un botón inline
      if (!isInline) {
        navigate('/');
      }
    } catch (error) {
      console.error('Error eliminando el álbum:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el álbum',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      <Button 
        leftIcon={<DeleteIcon />}
        colorScheme="red"
        variant={variant}
        size={size}
        onClick={handleOpen}
      >
        Eliminar LP
      </Button>

      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirmar eliminación</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            ¿Estás seguro de que deseas eliminar este álbum? Esta acción no se puede deshacer y se eliminarán todas las canciones asociadas.
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleClose} isDisabled={isDeleting}>
              Cancelar
            </Button>
            <Button colorScheme="red" onClick={handleDelete} isLoading={isDeleting}>
              Eliminar definitivamente
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default DeleteAlbumButton;
