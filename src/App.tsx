import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useParams } from 'react-router-dom'
import { Box, Flex, Heading, Spacer, HStack, Button, Text, VStack, Center, SimpleGrid, 
  Input, FormControl, FormLabel, FormErrorMessage, InputGroup, InputRightElement, IconButton,
  useToast, Select, Skeleton } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { 
  ViewIcon, ViewOffIcon, EditIcon, DeleteIcon, ArrowBackIcon, AddIcon
} from '@chakra-ui/icons'

// Importamos las dependencias necesarias
import { createClient } from '@supabase/supabase-js'

// Cliente de Supabase para operaciones de base de datos
import { supabase } from './services/supabase'

// Importamos los componentes de formularios que creamos separados
import LPForm from './components/admin/LPForm'
import TrackForm from './components/admin/TrackForm'
import DeleteAlbumButton from './components/admin/DeleteAlbumButton'
import { AlbumSkeletonGrid } from './components/ui/AlbumCardSkeleton'
import SearchResultsSkeleton from './components/ui/SearchResultsSkeleton'
import TableSkeleton from './components/ui/TableSkeleton'
import AlbumDetailSkeleton from './components/ui/AlbumDetailSkeleton'

// Componente de navegación simple
const SimpleNavbar = () => {
  // Estado para simular la autenticación
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  
  // Función para cerrar sesión
  const handleLogout = () => {
    setIsLoggedIn(false);
    // Guardar estado en localStorage
    localStorage.removeItem('isLoggedIn');
    navigate('/');
  };
  
  // Verificar si está logueado al cargar
  useEffect(() => {
    const storedLoginState = localStorage.getItem('isLoggedIn');
    if (storedLoginState === 'true') {
      setIsLoggedIn(true);
    }
  }, []);
  
  return (
    <Flex as="nav" bg="blue.800" color="white" p={4} align="center">
      <Heading size="md">
        <RouterLink to="/">BPM Manager</RouterLink>
      </Heading>
      <Spacer />
      <HStack spacing={4}>
        <Button as={RouterLink} to="/" variant="ghost" colorScheme="whiteAlpha">
          Inicio
        </Button>
        <Button as={RouterLink} to="/songs" variant="ghost" colorScheme="whiteAlpha">
          Canciones
        </Button>
        <Button as={RouterLink} to="/bpm-info" variant="ghost" colorScheme="whiteAlpha">
          Info BPM
        </Button>
        
        {isLoggedIn ? (
          <>
            <Button as={RouterLink} to="/admin" colorScheme="teal">
              Dashboard
            </Button>
            <Button onClick={handleLogout} colorScheme="red" variant="outline">
              Cerrar sesión
            </Button>
          </>
        ) : (
          <Button as={RouterLink} to="/login" colorScheme="green">
            Iniciar sesión
          </Button>
        )}
      </HStack>
    </Flex>
  )
}

// Página principal con los álbumes y buscador
const HomePage = () => {
  const navigate = useNavigate();
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{albums: any[], songs: any[]}>({
    albums: [],
    songs: []
  });
  const [isSearching, setIsSearching] = useState(false);

  // Cargar los álbumes de la base de datos
  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        setLoading(true);
        // Consultar los álbumes con información de artistas
        const { data, error } = await supabase
          .from('albums')
          .select(`
            id, title, release_year, cover_image_url
          `)
          .order('release_year', { ascending: false });

        if (error) throw error;
        
        // Por cada álbum, obtener los artistas asociados
        if (data) {
          const albumsWithDetails = await Promise.all(data.map(async (album) => {
            // Obtener los artistas del álbum
            const { data: albumArtists } = await supabase
              .from('album_artists')
              .select('artists:artist_id(id, name), is_primary')
              .eq('album_id', album.id);
              
            // Obtener algunas canciones del álbum para mostrar BPMs
            const { data: albumSongs } = await supabase
              .from('songs')
              .select('id, title, bpm')
              .eq('album_id', album.id)
              .limit(5);
              
            return {
              ...album,
              artists: albumArtists || [],
              songs: albumSongs || []
            };
          }));
          
          setAlbums(albumsWithDetails);
        } else {
          setAlbums([]);
        }
      } catch (err: any) {
        setError(err.message || 'Error al cargar los álbumes');
        console.error('Error cargando álbumes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
  }, []);

  // Función de búsqueda
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults({albums: [], songs: []});
      setIsSearching(false);
      return;
    }
    
    setIsSearching(true);
    try {
      // Buscar álbumes que coincidan con la consulta
      const { data: albumsData, error: albumsError } = await supabase
        .from('albums')
        .select(`id, title, release_year, cover_image_url`)
        .ilike('title', `%${searchQuery}%`);
        
      if (albumsError) throw albumsError;
      
      // Buscar canciones que coincidan con la consulta
      const { data: songsData, error: songsError } = await supabase
        .from('songs')
        .select(`
          id, title, bpm,
          artists:artist_id(id, name),
          albums:album_id(id, title)
        `)
        .ilike('title', `%${searchQuery}%`);
        
      if (songsError) throw songsError;
      
      setSearchResults({
        albums: albumsData || [],
        songs: songsData || []
      });
    } catch (err: any) {
      console.error('Error en la búsqueda:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Función para obtener el emoji de color según el BPM
  const getBpmColorEmoji = (bpm: number): string => {
    if (bpm >= 70 && bpm < 90) return '🔵'; // Azul
    if (bpm >= 90 && bpm < 100) return '🟢'; // Verde
    if (bpm >= 100 && bpm < 110) return '🟡'; // Amarillo
    if (bpm >= 110 && bpm < 120) return '🟠'; // Naranja
    if (bpm >= 120 && bpm < 130) return '🔴'; // Rojo
    if (bpm >= 130 && bpm <= 140) return '🟣'; // Púrpura
    return '';
  };

  // Formatear duración en segundos a formato mm:ss
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Función para obtener el artista principal del álbum
  const getPrimaryArtist = (artists: any[]) => {
    const primaryArtist = artists.find(a => a.is_primary);
    return primaryArtist ? primaryArtist.artists.name : 
           artists.length > 0 ? artists[0].artists.name : 'Artista desconocido';
  };

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading as="h1" size="xl" mb={4}>BPM Music Manager</Heading>
          <Text fontSize="lg" color="gray.600" mb={6}>
            Explora tu colección de música organizada por BPM.
          </Text>
          
          {/* Buscador */}
          <FormControl mb={8}>
            <Flex>
              <Input 
                placeholder="Buscar álbumes o canciones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                size="lg"
                borderRadius="md"
                mr={2}
              />
              <Button 
                colorScheme="blue" 
                onClick={handleSearch} 
                isLoading={isSearching}
                size="lg"
              >
                Buscar
              </Button>
            </Flex>
          </FormControl>
        </Box>
        
        {/* Resultados de búsqueda */}
        {searchQuery && (
          <Box mb={8}>
            {isSearching ? (
              <SearchResultsSkeleton />
            ) : (
              <>
                <Heading size="md" mb={4}>Resultados de búsqueda para "{searchQuery}"</Heading>
                
                {searchResults.albums.length > 0 && (
              <Box mb={6}>
                <Heading size="sm" mb={3}>Álbumes encontrados ({searchResults.albums.length})</Heading>
                <SimpleGrid columns={[1, 2, 3, 4]} spacing={6}>
                  {searchResults.albums.map(album => (
                    <Box 
                      key={album.id} 
                      borderWidth="1px" 
                      borderRadius="lg" 
                      overflow="hidden"
                      transition="transform 0.3s"
                      _hover={{ transform: 'translateY(-5px)', shadow: 'md' }}
                      onClick={() => navigate(`/album/${album.id}`)}
                      cursor="pointer"
                    >
                      <Box 
                        height="180px" 
                        bg="gray.200" 
                        bgImage={album.cover_image_url ? `url(${album.cover_image_url})` : 'none'}
                        bgSize="cover"
                        bgPosition="center"
                      >
                        {!album.cover_image_url && (
                          <Center height="100%">
                            <Text fontSize="5xl">💿</Text>
                          </Center>
                        )}
                      </Box>
                      <Box p={4}>
                        <Heading size="sm" isTruncated>{album.title}</Heading>
                        <Text color="gray.600" fontSize="sm">
                          {album.release_year}
                        </Text>
                      </Box>
                      </Box>
                    ))}
                  </SimpleGrid>
                </Box>
              )}
              
              {searchResults.songs.length > 0 && (
                <Box mb={6}>
                  <Heading size="sm" mb={3}>Canciones encontradas ({searchResults.songs.length})</Heading>
                  <Box as="table" width="100%" borderWidth="1px" borderRadius="md">
                    <Box as="thead" bg="gray.100">
                      <Box as="tr">
                        <Box as="th" p={3} textAlign="left">Título</Box>
                        <Box as="th" p={3} textAlign="left">BPM</Box>
                        <Box as="th" p={3} textAlign="left">Álbum</Box>
                        <Box as="th" p={3} textAlign="left">Artista</Box>
                      </Box>
                    </Box>
                    <Box as="tbody">
                      {searchResults.songs.map(song => (
                        <Box 
                          as="tr" 
                          key={song.id}
                          _hover={{ bg: 'gray.100' }}
                          cursor="pointer"
                        >
                          <Box as="td" p={3}>{song.title}</Box>
                          <Box as="td" p={3}>
                            <Flex align="center">
                              <Text mr={2}>{song.bpm}</Text>
                              {getBpmColorEmoji(song.bpm)}
                            </Flex>
                          </Box>
                          <Box as="td" p={3}>{song.albums.title}</Box>
                          <Box as="td" p={3}>{song.artists.name}</Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>
              )}
              
              {searchResults.albums.length === 0 && searchResults.songs.length === 0 && (
                <Box p={4} bg="gray.100" borderRadius="md">
                  <Text>No se encontraron resultados para "{searchQuery}"</Text>
                </Box>
              )}
          </>
          )}
        </Box>
      )}
      
      {/* Lista de álbumes */}
      {!searchQuery && (
        <Box>
          <Flex align="center" justify="space-between" mb={4}>
            <Heading size="md">Últimos álbumes añadidos</Heading>
          </Flex>
          
          {loading ? (
            <AlbumSkeletonGrid count={8} />
          ) : error ? (
            <Box p={4} bg="red.100" color="red.800" borderRadius="md" mb={4}>
              <Text>{error}</Text>
            </Box>
          ) : albums.length === 0 ? (
            <Box p={4} bg="gray.100" borderRadius="md">
              <Text>No hay álbumes disponibles.</Text>
            </Box>
          ) : (
            <SimpleGrid columns={[1, 2, 3, 4]} spacing={6}>
              {albums.map(album => (
                <Box 
                  key={album.id} 
                  borderWidth="1px" 
                  borderRadius="lg" 
                  overflow="hidden"
                  transition="transform 0.3s"
                  _hover={{ transform: 'translateY(-5px)', shadow: 'md' }}
                  onClick={() => navigate(`/album/${album.id}`)}
                  cursor="pointer"
                >
                  <Box 
                    height="180px" 
                    bg="gray.200" 
                    bgImage={album.cover_image_url ? `url(${album.cover_image_url})` : 'none'}
                    bgSize="cover"
                    bgPosition="center"
                  >
                    {!album.cover_image_url && (
                      <Center height="100%">
                        <Text fontSize="5xl">💿</Text>
                      </Center>
                    )}
                  </Box>
                  <Box p={4}>
                    <Heading size="sm" isTruncated>{album.title}</Heading>
                    <Text color="gray.600" fontSize="sm">
                      {album.release_year}
                    </Text>
                  </Box>
                </Box>
              ))}
            </SimpleGrid>
          )}
        </Box>
      )}
      
      {/* Lista de álbumes */}
      {!searchQuery && (
          <Box>
            <Flex align="center" justify="space-between" mb={4}>
              <Heading size="md">Últimos álbumes añadidos</Heading>
            </Flex>
            
            {loading ? (
              <AlbumSkeletonGrid count={8} />
            ) : error ? (
              <Box p={4} bg="red.100" color="red.800" borderRadius="md" mb={4}>
                <Text>{error}</Text>
              </Box>
            ) : albums.length === 0 ? (
              <Box p={4} bg="gray.100" borderRadius="md">
                <Text>No hay álbumes disponibles.</Text>
              </Box>
            ) : (
              <SimpleGrid columns={[1, 2, 3, 4]} spacing={6}>
                {albums.map(album => (
                  <Box 
                    key={album.id} 
                    borderWidth="1px" 
                    borderRadius="lg" 
                    overflow="hidden"
                    transition="transform 0.3s"
                    _hover={{ transform: 'translateY(-5px)', shadow: 'md' }}
                    onClick={() => navigate(`/album/${album.id}`)}
                    cursor="pointer"
                  >
                    <Box 
                      height="180px" 
                      bg="gray.200" 
                      bgImage={album.cover_image_url ? `url(${album.cover_image_url})` : 'none'}
                      bgSize="cover"
                      bgPosition="center"
                    >
                      {!album.cover_image_url && (
                        <Center height="100%">
                          <Text fontSize="5xl">💿</Text>
                        </Center>
                      )}
                    </Box>
                    <Box p={4}>
                      <Heading size="sm" isTruncated>{album.title}</Heading>
                      <Text color="gray.600" fontSize="sm">
                        {getPrimaryArtist(album.artists)} · {album.release_year}
                      </Text>
                      
                      {/* Mostrar BPMs de algunas canciones */}
                      {album.songs && album.songs.length > 0 && (
                        <Flex mt={2} flexWrap="wrap" gap={1}>
                          {album.songs.map((song: any) => (
                            <Text key={song.id} fontSize="sm">
                              {getBpmColorEmoji(song.bpm)}
                            </Text>
                          ))}
                        </Flex>
                      )}
                    </Box>
                  </Box>
                ))}
              </SimpleGrid>
            )}
          </Box>
        )}
        
        {/* Explorar por BPM */}
        <Box mt={4}>
          <Heading size="md" mb={4}>Explorar por BPM</Heading>
          <SimpleGrid columns={[2, 3, 6]} spacing={3}>
            <Button leftIcon={<Text>🔵</Text>} as={RouterLink} to="/songs" colorScheme="blue" variant="outline">
              70-90 BPM
            </Button>
            <Button leftIcon={<Text>🟢</Text>} as={RouterLink} to="/songs" colorScheme="green" variant="outline">
              90-100 BPM
            </Button>
            <Button leftIcon={<Text>🟡</Text>} as={RouterLink} to="/songs" colorScheme="yellow" variant="outline">
              100-110 BPM
            </Button>
            <Button leftIcon={<Text>🟠</Text>} as={RouterLink} to="/songs" colorScheme="orange" variant="outline">
              110-120 BPM
            </Button>
            <Button leftIcon={<Text>🔴</Text>} as={RouterLink} to="/songs" colorScheme="red" variant="outline">
              120-130 BPM
            </Button>
            <Button leftIcon={<Text>🟣</Text>} as={RouterLink} to="/songs" colorScheme="purple" variant="outline">
              130-140 BPM
            </Button>
          </SimpleGrid>
        </Box>
      </VStack>
    </Box>
  );
}

// Página de información BPM
const BpmInfoPage = () => {
  return (
    <Center minHeight="80vh">
      <VStack spacing={5}>
        <Heading>Información de BPM</Heading>
        <Text fontSize="xl">Sistema de gestión musical por BPM</Text>
        
        <Box p={5} borderWidth="1px" borderRadius="md">
          <Heading size="md" mb={3}>Código de colores BPM:</Heading>
          <VStack align="start" spacing={2}>
            <Text>🔵 70-90 BPM (azul)</Text>
            <Text>🟢 90-100 BPM (verde)</Text>
            <Text>🟡 100-110 BPM (amarillo)</Text>
            <Text>🟠 110-120 BPM (naranja)</Text>
            <Text>🔴 120-130 BPM (rojo)</Text>
            <Text>🟣 130-140 BPM (púrpura)</Text>
          </VStack>
        </Box>
      </VStack>
    </Center>
  )
}

// Página de canciones con visualización del sistema de colores BPM
const SongsPage = () => {
  // Canciones de ejemplo para demostración
  const sampleSongs = [
    { id: '1', title: 'Canción Lenta', artist: 'Artista 1', bpm: 85 },
    { id: '2', title: 'Ritmo Verde', artist: 'Artista 2', bpm: 95 },
    { id: '3', title: 'Tempo Medio', artist: 'Artista 3', bpm: 105 },
    { id: '4', title: 'Ritmo Activo', artist: 'Artista 1', bpm: 115 },
    { id: '5', title: 'Beat Rápido', artist: 'Artista 2', bpm: 125 },
    { id: '6', title: 'Ultra Ritmo', artist: 'Artista 3', bpm: 135 },
  ];

  // Función para obtener el emoji de color según el BPM
  const getBpmColorEmoji = (bpm: number): string => {
    if (bpm >= 70 && bpm < 90) return '🔵';
    if (bpm >= 90 && bpm < 100) return '🟢';
    if (bpm >= 100 && bpm < 110) return '🟡';
    if (bpm >= 110 && bpm < 120) return '🟠';
    if (bpm >= 120 && bpm < 130) return '🔴';
    if (bpm >= 130 && bpm <= 140) return '🟣';
    return '';
  };

  // Función para obtener el nombre del color según el BPM
  const getBpmColorName = (bpm: number): string => {
    if (bpm >= 70 && bpm < 90) return 'Azul';
    if (bpm >= 90 && bpm < 100) return 'Verde';
    if (bpm >= 100 && bpm < 110) return 'Amarillo';
    if (bpm >= 110 && bpm < 120) return 'Naranja';
    if (bpm >= 120 && bpm < 130) return 'Rojo';
    if (bpm >= 130 && bpm <= 140) return 'Púrpura';
    return '';
  };

  return (
    <Box p={5}>
      <Heading mb={5}>Canciones por BPM</Heading>
      <Text mb={4}>Visualiza las canciones por su valor de BPM y categoría de color:</Text>
      
      <Box overflowX="auto">
        <Box as="table" width="100%" mb={6} borderWidth="1px" borderRadius="md">
          <Box as="thead" bg="gray.100">
            <Box as="tr">
              <Box as="th" p={3} textAlign="left">Título</Box>
              <Box as="th" p={3} textAlign="left">Artista</Box>
              <Box as="th" p={3} textAlign="left">BPM</Box>
              <Box as="th" p={3} textAlign="left">Categoría</Box>
            </Box>
          </Box>
          <Box as="tbody">
            {sampleSongs.map(song => (
              <Box as="tr" key={song.id} _hover={{ bg: 'gray.50' }}>
                <Box as="td" p={3}>{song.title}</Box>
                <Box as="td" p={3}>{song.artist}</Box>
                <Box as="td" p={3}>
                  <Flex alignItems="center">
                    <Text mr={2}>{song.bpm}</Text>
                    <Text fontSize="xl">{getBpmColorEmoji(song.bpm)}</Text>
                  </Flex>
                </Box>
                <Box as="td" p={3}>{getBpmColorName(song.bpm)}</Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      <Box borderWidth="1px" borderRadius="md" p={4} bg="gray.50">
        <Heading size="md" mb={3}>Sistema de colores BPM:</Heading>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <Box borderWidth="1px" borderRadius="md" p={3} bg="blue.50">
            <Text><Text as="span" fontSize="xl">🔵</Text> 70-90 BPM (Azul)</Text>
          </Box>
          <Box borderWidth="1px" borderRadius="md" p={3} bg="green.50">
            <Text><Text as="span" fontSize="xl">🟢</Text> 90-100 BPM (Verde)</Text>
          </Box>
          <Box borderWidth="1px" borderRadius="md" p={3} bg="yellow.50">
            <Text><Text as="span" fontSize="xl">🟡</Text> 100-110 BPM (Amarillo)</Text>
          </Box>
          <Box borderWidth="1px" borderRadius="md" p={3} bg="orange.50">
            <Text><Text as="span" fontSize="xl">🟠</Text> 110-120 BPM (Naranja)</Text>
          </Box>
          <Box borderWidth="1px" borderRadius="md" p={3} bg="red.50">
            <Text><Text as="span" fontSize="xl">🔴</Text> 120-130 BPM (Rojo)</Text>
          </Box>
          <Box borderWidth="1px" borderRadius="md" p={3} bg="purple.50">
            <Text><Text as="span" fontSize="xl">🟣</Text> 130-140 BPM (Púrpura)</Text>
          </Box>
        </SimpleGrid>
      </Box>
    </Box>
  );
};

// Variables para la configuración de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Página de Login
const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();
  
  // Iniciar sesión con Supabase
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        toast({
          title: 'Login exitoso',
          description: 'Bienvenido al sistema',
          status: 'success',
          duration: 3000,
        });
        
        // Guardar el token de sesión en localStorage
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('supabase.session', JSON.stringify(data.session));
        
        navigate('/admin');
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Center minH="80vh">
      <Box w="100%" maxW="400px" p={6} borderWidth="1px" borderRadius="lg">
        <VStack spacing={6}>
          <Heading size="lg">Iniciar Sesión</Heading>
          <Text>Ingresa tus credenciales para acceder al panel de administración</Text>
          
          {error && (
            <Box w="100%" p={3} bg="red.100" color="red.800" borderRadius="md">
              <Text>{error}</Text>
            </Box>
          )}
          
          <Box as="form" onSubmit={handleLogin} w="100%">
            <VStack spacing={4}>
              <FormControl id="email" isRequired>
                <FormLabel>Email</FormLabel>
                <Input 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  type="email" 
                  placeholder="tu@email.com"
                />
              </FormControl>
              
              <FormControl id="password" isRequired>
                <FormLabel>Contraseña</FormLabel>
                <InputGroup>
                  <Input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="********"
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                      onClick={() => setShowPassword(!showPassword)}
                      variant="ghost"
                      size="sm"
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>
              
              <Button
                type="submit"
                colorScheme="blue"
                isLoading={isLoading}
                loadingText="Iniciando sesión..."
                w="100%"
                mt={4}
              >
                Iniciar Sesión
              </Button>
            </VStack>
          </Box>
          
          <Box mt={4} textAlign="center" w="100%" borderTopWidth="1px" pt={4}>
            <Text fontSize="sm" color="gray.600">
              Ingresa con tu cuenta de Supabase para acceder al sistema de administración
            </Text>
          </Box>
        </VStack>
      </Box>
    </Center>
  );
};

// Página de Dashboard de Administración
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<{ lps: number, songs: number }>({ lps: 0, songs: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Protección para verificar sesión con Supabase
  useEffect(() => {
    const checkSession = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        navigate('/login');
      }
    };
    
    checkSession();
  }, [navigate]);

  // Cargar estadísticas generales
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Obtener conteo de canciones
        const { count: songsCount, error: songsError } = await supabase
          .from('songs')
          .select('*', { count: 'exact', head: true });
          
        if (songsError) throw songsError;
        
        // Obtener conteo de álbumes/LPs
        const { count: albumsCount, error: albumsError } = await supabase
          .from('albums')
          .select('*', { count: 'exact', head: true });
          
        if (albumsError) throw albumsError;
        
        setStats({
          lps: albumsCount || 0,
          songs: songsCount || 0
        });
      } catch (err: any) {
        setError(err.message || 'Error al cargar estadísticas');
        console.error('Error cargando estadísticas:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  return (
    <Box p={5}>
      <Heading mb={5}>Panel de Administración</Heading>
      <Text mb={4}>Bienvenido al sistema de gestión de LPs por BPM.</Text>
      
      {loading ? (
        <Center h="100px">
          <Text>Cargando estadísticas...</Text>
        </Center>
      ) : error ? (
        <Box p={4} bg="red.100" color="red.800" borderRadius="md" mb={4}>
          <Text>{error}</Text>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
          <Box p={4} borderWidth="1px" borderRadius="md" bg="blue.50">
            <Heading size="md">{stats.lps}</Heading>
            <Text>LPs/Álbumes</Text>
          </Box>
          <Box p={4} borderWidth="1px" borderRadius="md" bg="purple.50">
            <Heading size="md">{stats.songs}</Heading>
            <Text>Tracks</Text>
          </Box>
        </SimpleGrid>
      )}
      
      <SimpleGrid columns={{ base: 1, md: 1, lg: 2 }} spacing={6} mb={10}>
        <Box p={5} borderWidth="1px" borderRadius="md" bg="blue.50">
          <Heading size="md" mb={3}>🔀 Gestionar LPs</Heading>
          <Text mb={3}>Añade y gestiona LPs con sus tracks y valores BPM</Text>
          <Text mb={3} fontSize="sm">Los LPs son el elemento central de tu colección. Desde aquí puedes gestionar todos tus discos y sus tracks.</Text>
          <Button colorScheme="blue" mt={2} onClick={() => navigate('/admin/lps')} size="lg" width="100%">
            Gestionar LPs
          </Button>
        </Box>
        
        <Box p={5} borderWidth="1px" borderRadius="md" bg="purple.50">
          <Heading size="md" mb={3}>🔍 Explorar por BPM</Heading>
          <Text mb={3}>Visualiza y filtra tracks por categorías de BPM</Text>
          <Text mb={3} fontSize="sm">Explora tu colección usando el sistema de colores BPM para encontrar rápidamente tracks para tu mezcla.</Text>
          <Button colorScheme="purple" mt={2} onClick={() => navigate('/admin/bpm-explorer')} size="lg" width="100%">
            Explorador BPM
          </Button>
        </Box>
      </SimpleGrid>
      
      <Box borderWidth="1px" borderRadius="md" p={5} mb={5} bg="gray.50">
        <Heading size="md" mb={4}>Sistema de colores BPM</Heading>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <Box borderWidth="1px" borderRadius="md" p={3} bg="blue.50">
            <Text><Text as="span" fontSize="xl">🔵</Text> 70-90 BPM (Azul)</Text>
          </Box>
          <Box borderWidth="1px" borderRadius="md" p={3} bg="green.50">
            <Text><Text as="span" fontSize="xl">🟢</Text> 90-100 BPM (Verde)</Text>
          </Box>
          <Box borderWidth="1px" borderRadius="md" p={3} bg="yellow.50">
            <Text><Text as="span" fontSize="xl">🟡</Text> 100-110 BPM (Amarillo)</Text>
          </Box>
          <Box borderWidth="1px" borderRadius="md" p={3} bg="orange.50">
            <Text><Text as="span" fontSize="xl">🟠</Text> 110-120 BPM (Naranja)</Text>
          </Box>
          <Box borderWidth="1px" borderRadius="md" p={3} bg="red.50">
            <Text><Text as="span" fontSize="xl">🔴</Text> 120-130 BPM (Rojo)</Text>
          </Box>
          <Box borderWidth="1px" borderRadius="md" p={3} bg="purple.50">
            <Text><Text as="span" fontSize="xl">🟣</Text> 130-140 BPM (Púrpura)</Text>
          </Box>
        </SimpleGrid>
      </Box>
    </Box>
  );
};

// Componente para gestionar canciones
const ManageSongs = () => {
  const navigate = useNavigate();
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar sesión
  useEffect(() => {
    const checkSession = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        navigate('/login');
      }
    };
    
    checkSession();
  }, [navigate]);

  // Cargar canciones
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('songs')
          .select(`
            id, title, bpm, duration_seconds, key,
            artists:artist_id(id, name),
            albums:album_id(id, title)
          `)
          .order('title');

        if (error) throw error;
        setSongs(data || []);
      } catch (err: any) {
        setError(err.message || 'Error al cargar las canciones');
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, []);

  // Obtener emoji de color para el BPM
  const getBpmColorEmoji = (bpm: number): string => {
    if (bpm >= 70 && bpm < 90) return '🔵';
    if (bpm >= 90 && bpm < 100) return '🟢';
    if (bpm >= 100 && bpm < 110) return '🟡';
    if (bpm >= 110 && bpm < 120) return '🟠';
    if (bpm >= 120 && bpm < 130) return '🔴';
    if (bpm >= 130 && bpm <= 140) return '🟣';
    return '';
  };

  return (
    <Box p={5}>
      <Flex justify="space-between" align="center" mb={5}>
        <Heading>Gestionar Canciones</Heading>
        <HStack>
          <Button leftIcon={<ArrowBackIcon />} variant="outline" onClick={() => navigate('/admin')}>
            Volver
          </Button>
          <Button colorScheme="green">
            Añadir Canción
          </Button>
        </HStack>
      </Flex>

      {loading ? (
        <Center h="400px">
          <TableSkeleton rows={8} />
        </Center>
      ) : error ? (
        <Box p={4} bg="red.100" color="red.800" borderRadius="md" mb={4}>
          <Text>{error}</Text>
        </Box>
      ) : songs.length === 0 ? (
        <Box p={4} bg="gray.100" borderRadius="md">
          <Text>No hay canciones disponibles.</Text>
        </Box>
      ) : (
        <Box overflowX="auto">
          <Box as="table" width="100%" mb={6} borderWidth="1px" borderRadius="md">
            <Box as="thead" bg="gray.100">
              <Box as="tr">
                <Box as="th" p={3} textAlign="left">BPM</Box>
                <Box as="th" p={3} textAlign="left">Título</Box>
                <Box as="th" p={3} textAlign="left">Artista</Box>
                <Box as="th" p={3} textAlign="left">Álbum</Box>
                <Box as="th" p={3} textAlign="left">Acciones</Box>
              </Box>
            </Box>
            <Box as="tbody">
              {songs.map(song => (
                <Box as="tr" key={song.id} _hover={{ bg: 'gray.50' }}>
                  <Box as="td" p={3}>
                    <Flex alignItems="center">
                      <Text mr={2}>{song.bpm}</Text>
                      <Text fontSize="xl">{getBpmColorEmoji(song.bpm)}</Text>
                    </Flex>
                  </Box>
                  <Box as="td" p={3}>{song.title}</Box>
                  <Box as="td" p={3}>{song.artists?.name || 'Desconocido'}</Box>
                  <Box as="td" p={3}>{song.albums?.title || 'Single'}</Box>
                  <Box as="td" p={3}>
                    <HStack spacing={2}>
                      <IconButton
                        aria-label="Editar"
                        icon={<EditIcon />}
                        size="sm"
                        colorScheme="blue"
                      />
                      <IconButton
                        aria-label="Eliminar"
                        icon={<DeleteIcon />}
                        size="sm"
                        colorScheme="red"
                      />
                    </HStack>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

// Componente para gestionar álbumes
const ManageAlbums = () => {
  const navigate = useNavigate();
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar sesión
  useEffect(() => {
    const checkSession = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        navigate('/login');
      }
    };
    
    checkSession();
  }, [navigate]);

  // Cargar álbumes
  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('albums')
          .select(`
            id, title, release_year,
            artists:artist_id(id, name)
          `)
          .order('title');

        if (error) throw error;
        setAlbums(data || []);
      } catch (err: any) {
        setError(err.message || 'Error al cargar los álbumes');
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
  }, []);

  return (
    <Box p={5}>
      <Flex justify="space-between" align="center" mb={5}>
        <Heading>Gestionar Álbumes</Heading>
        <HStack>
          <Button leftIcon={<ArrowBackIcon />} variant="outline" onClick={() => navigate('/admin')}>
            Volver
          </Button>
          <Button colorScheme="blue">
            Añadir Álbum
          </Button>
        </HStack>
      </Flex>

      {loading ? (
        <Center h="400px">
          <TableSkeleton rows={5} />
        </Center>
      ) : error ? (
        <Box p={4} bg="red.100" color="red.800" borderRadius="md" mb={4}>
          <Text>{error}</Text>
        </Box>
      ) : albums.length === 0 ? (
        <Box p={4} bg="gray.100" borderRadius="md">
          <Text>No hay álbumes disponibles.</Text>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {albums.map(album => (
            <Box key={album.id} p={5} borderWidth="1px" borderRadius="md" bg="blue.50">
              <Heading size="md" mb={2}>{album.title}</Heading>
              <Text mb={3}>{album.artists?.name || 'Artista desconocido'}</Text>
              <Text mb={3}>{album.release_year || 'Año desconocido'}</Text>
              <HStack spacing={2} mt={3}>
                <IconButton
                  aria-label="Editar"
                  icon={<EditIcon />}
                  colorScheme="blue"
                  size="sm"
                />
                <IconButton
                  aria-label="Eliminar"
                  icon={<DeleteIcon />}
                  colorScheme="red"
                  size="sm"
                />
                <IconButton
                  aria-label="Ver canciones"
                  icon={<ViewIcon />}
                  colorScheme="purple"
                  size="sm"
                />
              </HStack>
            </Box>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
};

// Componente para gestionar artistas
const ManageArtists = () => {
  const navigate = useNavigate();
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar sesión
  useEffect(() => {
    const checkSession = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        navigate('/login');
      }
    };
    
    checkSession();
  }, [navigate]);

  // Cargar artistas
  useEffect(() => {
    const fetchArtists = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('artists')
          .select('id, name')
          .order('name');

        if (error) throw error;
        setArtists(data || []);
      } catch (err: any) {
        setError(err.message || 'Error al cargar los artistas');
      } finally {
        setLoading(false);
      }
    };

    fetchArtists();
  }, []);

  return (
    <Box p={5}>
      <Flex justify="space-between" align="center" mb={5}>
        <Heading>Gestionar Artistas</Heading>
        <HStack>
          <Button leftIcon={<ArrowBackIcon />} variant="outline" onClick={() => navigate('/admin')}>
            Volver
          </Button>
          <Button colorScheme="green">
            Añadir Artista
          </Button>
        </HStack>
      </Flex>

      {loading ? (
        <Center h="400px">
          <Text>Cargando artistas...</Text>
        </Center>
      ) : error ? (
        <Box p={4} bg="red.100" color="red.800" borderRadius="md" mb={4}>
          <Text>{error}</Text>
        </Box>
      ) : artists.length === 0 ? (
        <Box p={4} bg="gray.100" borderRadius="md">
          <Text>No hay artistas disponibles.</Text>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {artists.map(artist => (
            <Box key={artist.id} p={5} borderWidth="1px" borderRadius="md" bg="green.50">
              <Heading size="md" mb={2}>{artist.name}</Heading>
              <HStack spacing={2} mt={3}>
                <IconButton
                  aria-label="Editar"
                  icon={<EditIcon />}
                  colorScheme="blue"
                  size="sm"
                />
                <IconButton
                  aria-label="Eliminar"
                  icon={<DeleteIcon />}
                  colorScheme="red"
                  size="sm"
                />
                <IconButton
                  aria-label="Ver álbumes"
                  icon={<ViewIcon />}
                  colorScheme="purple"
                  size="sm"
                />
              </HStack>
            </Box>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
};

// Componente para gestionar LPs (el elemento central de la aplicación)
const ManageLPs = () => {
  const navigate = useNavigate();
  const [lps, setLPs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  // Verificar sesión
  useEffect(() => {
    const checkSession = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        navigate('/login');
      }
    };
    
    checkSession();
  }, [navigate]);

  // Cargar LPs con información anidada de artistas y canciones
  useEffect(() => {
    const fetchLPs = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('albums')
          .select(`
            id, title, release_year,
            artists:artist_id(id, name)
          `)
          .order('title');

        if (error) throw error;
        
        // Obtenemos los LPs con sus datos básicos
        const albumsWithSongs = data || [];
        
        // Para cada LP, cargamos sus tracks (canciones)
        for (const album of albumsWithSongs) {
          const { data: songs, error: songsError } = await supabase
            .from('songs')
            .select(`
              id, title, bpm, duration_seconds, key,
              artists:artist_id(id, name)
            `)
            .eq('album_id', album.id)
            .order('title');
            
          if (songsError) throw songsError;
          // Usamos una aserción de tipo para indicar que album puede tener la propiedad songs
          (album as any).songs = songs || [];
        }
        
        setLPs(albumsWithSongs);
      } catch (err: any) {
        setError(err.message || 'Error al cargar los LPs');
        console.error('Error cargando LPs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLPs();
  }, []);

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
  
  // Formatear duración en segundos a formato mm:ss
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <Box p={5}>
      <Flex justify="space-between" align="center" mb={5}>
        <Heading>Gestión de LPs</Heading>
        <HStack>
          <Button leftIcon={<ArrowBackIcon />} variant="outline" onClick={() => navigate('/admin')}>
            Volver
          </Button>
          <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={() => navigate('/admin/lps/new')}>
            Nuevo LP
          </Button>
        </HStack>
      </Flex>

      {loading ? (
        <Center h="400px">
          <Text>Cargando LPs...</Text>
        </Center>
      ) : error ? (
        <Box p={4} bg="red.100" color="red.800" borderRadius="md" mb={4}>
          <Text>{error}</Text>
        </Box>
      ) : lps.length === 0 ? (
        <Box p={4} bg="gray.100" borderRadius="md">
          <Text>No hay LPs disponibles. ¡Añade tu primer LP!</Text>
          <Button mt={4} colorScheme="blue" leftIcon={<AddIcon />} onClick={() => navigate('/admin/lps/new')}>
            Añadir primer LP
          </Button>
        </Box>
      ) : (
        <Box>
          {lps.map(lp => (
            <Box key={lp.id} mb={8} p={5} borderWidth="1px" borderRadius="lg" bg="white" shadow="md">
              <Flex justify="space-between" align="flex-start" mb={4}>
                <Box>
                  <Heading size="lg">{lp.title}</Heading>
                  <Text color="gray.600">{lp.artists?.name || 'Artista desconocido/Compilación'}</Text>
                  <Text color="gray.500" fontSize="sm">{lp.release_year || 'Año desconocido'}</Text>
                </Box>
                <HStack spacing={2}>
                  <Button
                    size="sm"
                    leftIcon={<EditIcon />}
                    onClick={() => navigate(`/admin/lps/edit/${lp.id}`)}
                  >
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    leftIcon={<AddIcon />}
                    onClick={() => navigate(`/admin/lps/${lp.id}/add-track`)}
                  >
                    Añadir Track
                  </Button>
                </HStack>
              </Flex>

              {/* Lista de tracks */}
              {lp.songs && lp.songs.length > 0 ? (
                <Box p={4} borderWidth="1px" borderRadius="md" bg="gray.50">
                  <Heading size="md" mb={4}>Tracks ({lp.songs.length})</Heading>
                  
                  <Box overflowX="auto">
                    <Box as="table" width="100%">
                      <Box as="thead">
                        <Box as="tr">
                          <Box as="th" p={2} textAlign="left">BPM</Box>
                          <Box as="th" p={2} textAlign="left">Título</Box>
                          <Box as="th" p={2} textAlign="left">Artista</Box>
                          <Box as="th" p={2} textAlign="left">Duración</Box>
                          <Box as="th" p={2} textAlign="left">Acciones</Box>
                        </Box>
                      </Box>
                      <Box as="tbody">
                        {lp.songs.map((track: any) => (
                          <Box as="tr" key={track.id} _hover={{ bg: 'gray.100' }}>
                            <Box as="td" p={2}>
                              <Flex alignItems="center">
                                <Text mr={2}>{track.bpm}</Text>
                                <Text fontSize="xl" title={`BPM: ${track.bpm}`}>
                                  {getBpmColorEmoji(track.bpm)}
                                </Text>
                              </Flex>
                            </Box>
                            <Box as="td" p={2}>{track.title}</Box>
                            <Box as="td" p={2}>{track.artists?.name || (lp.artists?.name !== track.artists?.name ? track.artists?.name : '')}</Box>
                            <Box as="td" p={2}>{track.duration_seconds ? formatDuration(track.duration_seconds) : '--:--'}</Box>
                            <Box as="td" p={3}>
                              <HStack spacing={2}>
                                <IconButton
                                  aria-label="Editar track"
                                  icon={<EditIcon />}
                                  size="sm"
                                  colorScheme="blue"
                                  variant="ghost"
                                  onClick={() => navigate(`/admin/tracks/edit/${track.id}`)}
                                />
                                <IconButton
                                  aria-label="Eliminar track"
                                  icon={<DeleteIcon />}
                                  size="sm"
                                  colorScheme="red"
                                  variant="ghost"
                                />
                              </HStack>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              ) : (
                <Box p={4} bg="gray.50" borderRadius="md" mt={3}>
                  <Text color="gray.500">No hay tracks en este LP. Añade el primero.</Text>
                  <Button
                    mt={2}
                    size="sm"
                    leftIcon={<AddIcon />}
                    colorScheme="blue"
                    onClick={() => navigate(`/admin/lps/${lp.id}/add-track`)}
                  >
                    Añadir Track
                  </Button>
                </Box>
              )}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

// Componente para explorar tracks por BPM
const BpmExplorer = () => {
  const navigate = useNavigate();
  const [tracks, setTracks] = useState<any[]>([]);
  const [filteredTracks, setFilteredTracks] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar sesión
  useEffect(() => {
    const checkSession = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        navigate('/login');
      }
    };
    
    checkSession();
  }, [navigate]);

  // Cargar todos los tracks
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('songs')
          .select(`
            id, title, bpm, duration_seconds,
            artists:artist_id(id, name),
            albums:album_id(id, title)
          `)
          .order('bpm');

        if (error) throw error;
        setTracks(data || []);
        setFilteredTracks(data || []);
      } catch (err: any) {
        setError(err.message || 'Error al cargar los tracks');
        console.error('Error cargando tracks:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTracks();
  }, []);

  // Obtener emoji y nombre de color para el BPM
  const getBpmColorEmoji = (bpm: number): string => {
    if (bpm >= 70 && bpm < 90) return '🔵'; // Azul
    if (bpm >= 90 && bpm < 100) return '🟢'; // Verde
    if (bpm >= 100 && bpm < 110) return '🟡'; // Amarillo
    if (bpm >= 110 && bpm < 120) return '🟠'; // Naranja
    if (bpm >= 120 && bpm < 130) return '🔴'; // Rojo
    if (bpm >= 130 && bpm <= 140) return '🟣'; // Púrpura
    return '';
  };
  
  const getBpmCategory = (bpm: number): string => {
    if (bpm >= 70 && bpm < 90) return 'Azul (70-90)'; 
    if (bpm >= 90 && bpm < 100) return 'Verde (90-100)';
    if (bpm >= 100 && bpm < 110) return 'Amarillo (100-110)';
    if (bpm >= 110 && bpm < 120) return 'Naranja (110-120)';
    if (bpm >= 120 && bpm < 130) return 'Rojo (120-130)';
    if (bpm >= 130 && bpm <= 140) return 'Púrpura (130-140)';
    return 'Otro';
  };

  // Formatear duración en segundos a formato mm:ss
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Filtrar por categoría de BPM
  const filterByCategory = (category: string | null) => {
    setSelectedCategory(category);
    
    if (!category) {
      setFilteredTracks(tracks);
      return;
    }
    
    let min = 0, max = 999;
    
    if (category === 'Azul (70-90)') { min = 70; max = 89; }
    else if (category === 'Verde (90-100)') { min = 90; max = 99; }
    else if (category === 'Amarillo (100-110)') { min = 100; max = 109; }
    else if (category === 'Naranja (110-120)') { min = 110; max = 119; }
    else if (category === 'Rojo (120-130)') { min = 120; max = 129; }
    else if (category === 'Púrpura (130-140)') { min = 130; max = 140; }
    
    setFilteredTracks(tracks.filter(track => track.bpm >= min && track.bpm <= max));
  };

  return (
    <Box p={5}>
      <Flex justify="space-between" align="center" mb={5}>
        <Heading>Explorador BPM</Heading>
        <Button leftIcon={<ArrowBackIcon />} variant="outline" onClick={() => navigate('/admin')}>
          Volver
        </Button>
      </Flex>

      {/* Categorías de BPM */}
      <Box borderWidth="1px" borderRadius="md" p={4} mb={6} bg="gray.50">
        <Heading size="md" mb={4}>Filtrar por categoría BPM</Heading>
        <Flex flexWrap="wrap" gap={3}>
          <Button 
            onClick={() => filterByCategory(null)} 
            colorScheme={!selectedCategory ? 'gray' : 'gray'}
            variant={!selectedCategory ? 'solid' : 'outline'}
          >
            Todos
          </Button>
          <Button 
            leftIcon={<Text>🔵</Text>} 
            onClick={() => filterByCategory('Azul (70-90)')} 
            colorScheme="blue"
            variant={selectedCategory === 'Azul (70-90)' ? 'solid' : 'outline'}
          >
            70-90 BPM
          </Button>
          <Button 
            leftIcon={<Text>🟢</Text>} 
            onClick={() => filterByCategory('Verde (90-100)')} 
            colorScheme="green"
            variant={selectedCategory === 'Verde (90-100)' ? 'solid' : 'outline'}
          >
            90-100 BPM
          </Button>
          <Button 
            leftIcon={<Text>🟡</Text>} 
            onClick={() => filterByCategory('Amarillo (100-110)')} 
            colorScheme="yellow"
            variant={selectedCategory === 'Amarillo (100-110)' ? 'solid' : 'outline'}
          >
            100-110 BPM
          </Button>
          <Button 
            leftIcon={<Text>🟠</Text>} 
            onClick={() => filterByCategory('Naranja (110-120)')} 
            colorScheme="orange"
            variant={selectedCategory === 'Naranja (110-120)' ? 'solid' : 'outline'}
          >
            110-120 BPM
          </Button>
          <Button 
            leftIcon={<Text>🔴</Text>} 
            onClick={() => filterByCategory('Rojo (120-130)')} 
            colorScheme="red"
            variant={selectedCategory === 'Rojo (120-130)' ? 'solid' : 'outline'}
          >
            120-130 BPM
          </Button>
          <Button 
            leftIcon={<Text>🟣</Text>} 
            onClick={() => filterByCategory('Púrpura (130-140)')} 
            colorScheme="purple"
            variant={selectedCategory === 'Púrpura (130-140)' ? 'solid' : 'outline'}
          >
            130-140 BPM
          </Button>
        </Flex>
      </Box>

      {loading ? (
        <Center h="300px">
          <Text>Cargando tracks...</Text>
        </Center>
      ) : error ? (
        <Box p={4} bg="red.100" color="red.800" borderRadius="md" mb={4}>
          <Text>{error}</Text>
        </Box>
      ) : filteredTracks.length === 0 ? (
        <Box p={4} bg="gray.100" borderRadius="md">
          <Text>No hay tracks en esta categoría de BPM.</Text>
        </Box>
      ) : (
        <Box overflowX="auto">
          <Box as="table" width="100%" borderWidth="1px" borderRadius="md">
            <Box as="thead" bg="gray.100">
              <Box as="tr">
                <Box as="th" p={3} textAlign="left">BPM</Box>
                <Box as="th" p={3} textAlign="left">Título</Box>
                <Box as="th" p={3} textAlign="left">Artista</Box>
                <Box as="th" p={3} textAlign="left">LP/Álbum</Box>
                <Box as="th" p={3} textAlign="left">Duración</Box>
              </Box>
            </Box>
            <Box as="tbody">
              {filteredTracks.map(track => (
                <Box as="tr" key={track.id} _hover={{ bg: 'gray.50' }}>
                  <Box as="td" p={3}>
                    <Flex alignItems="center">
                      <Text mr={2}>{track.bpm}</Text>
                      <Text fontSize="xl">{getBpmColorEmoji(track.bpm)}</Text>
                    </Flex>
                  </Box>
                  <Box as="td" p={3}>{track.title}</Box>
                  <Box as="td" p={3}>{track.artists?.name || 'Desconocido'}</Box>
                  <Box as="td" p={3}>{track.albums?.title || 'Single'}</Box>
                  <Box as="td" p={3}>{track.duration_seconds ? formatDuration(track.duration_seconds) : '--:--'}</Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

// Nota: Los componentes de formulario ya no están definidos aquí,
// sino que los hemos movido a archivos separados y los importamos arriba

// Página de detalle del álbum
const AlbumDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [album, setAlbum] = useState<any>(null);
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [songsLoading, setSongsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlbumDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Obtener detalles del álbum
        const { data: albumData, error: albumError } = await supabase
          .from('albums')
          .select('*')
          .eq('id', id)
          .single();
          
        if (albumError) throw albumError;
        
        // Obtener artistas del álbum
        const { data: albumArtists, error: artistsError } = await supabase
          .from('album_artists')
          .select('artists:artist_id(id, name), is_primary')
          .eq('album_id', id);
          
        if (artistsError) throw artistsError;
        
        // Obtener canciones del álbum
        setSongsLoading(true);
        const { data: songsData, error: songsError } = await supabase
          .from('songs')
          .select(`
            id, title, bpm, key, duration_seconds,
            artists:artist_id(id, name)
          `)
          .eq('album_id', id);
          
        if (songsError) throw songsError;
        setSongsLoading(false);
        
        // Combinar toda la información
        setAlbum({
          ...albumData,
          artists: albumArtists || []
        });
        
        setSongs(songsData || []);
      } catch (err: any) {
        setError(err.message || 'Error al cargar los detalles del álbum');
        console.error('Error cargando detalles del álbum:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAlbumDetails();
  }, [id]);
  
  // Función para obtener el emoji de color según el BPM
  const getBpmColorEmoji = (bpm: number): string => {
    if (bpm >= 70 && bpm < 90) return '🔵'; // Azul
    if (bpm >= 90 && bpm < 100) return '🟢'; // Verde
    if (bpm >= 100 && bpm < 110) return '🟡'; // Amarillo
    if (bpm >= 110 && bpm < 120) return '🟠'; // Naranja
    if (bpm >= 120 && bpm < 130) return '🔴'; // Rojo
    if (bpm >= 130 && bpm <= 140) return '🟣'; // Púrpura
    return '';
  };
  
  // Formatear duración en segundos a formato mm:ss
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Función para obtener el artista principal del álbum
  const getPrimaryArtist = (artists: any[]) => {
    const primaryArtist = artists.find(a => a.is_primary);
    return primaryArtist ? primaryArtist.artists.name : 
           artists.length > 0 ? artists[0].artists.name : 'Artista desconocido';
  };
  
  return (
    <Box p={4}>
      <Button 
        leftIcon={<ArrowBackIcon />} 
        colorScheme="blue" 
        variant="outline" 
        onClick={() => navigate('/')} 
        mb={6}
      >
        Volver a la biblioteca
      </Button>
      
      {loading ? (
        <>
          <AlbumDetailSkeleton />
          <Box mt={10}>
            <Skeleton height="30px" width="150px" mb={4} />
            <TableSkeleton rows={8} />
          </Box>
        </>
      ) : error ? (
        <Box p={4} bg="red.100" color="red.800" borderRadius="md" mb={4}>
          <Text>{error}</Text>
        </Box>
      ) : album ? (
        <Box>
          <Flex direction={{ base: 'column', md: 'row' }} gap={8}>
            {/* Portada del álbum */}
            <Box 
              width={{ base: 'full', md: '300px' }}
              height={{ base: '300px', md: '300px' }}
              bg="gray.200"
              borderRadius="md"
              overflow="hidden"
              bgImage={album.cover_image_url ? `url(${album.cover_image_url})` : 'none'}
              bgSize="cover"
              bgPosition="center"
              boxShadow="lg"
            >
              {!album.cover_image_url && (
                <Center height="100%">
                  <Text fontSize="8xl">💿</Text>
                </Center>
              )}
            </Box>
            
            {/* Información del álbum */}
            <Box flex="1">
              <Heading size="xl" mb={2}>{album.title}</Heading>
              <Flex mb={4} alignItems="center">
                {album.artists && album.artists.length > 0 && (
                  <Text fontSize="lg" color="gray.600">
                    {getPrimaryArtist(album.artists)}
                  </Text>
                )}
                <Text mx={2} color="gray.400">•</Text>
                <Text color="gray.600">{album.release_year}</Text>
              </Flex>
              
              {album.artists && album.artists.length > 1 && (
                <Box mb={4}>
                  <Text fontWeight="bold" mb={1}>Artistas:</Text>
                  {album.artists.map((a: any) => (
                    <Text key={a.artists.id}>
                      {a.artists.name}{a.is_primary && ' (Principal)'}
                    </Text>
                  ))}
                </Box>
              )}
              
              {/* Botones de acción */}
              <Flex gap={3} mt={4} mb={8}>
                <Button 
                  colorScheme="blue" 
                  leftIcon={<EditIcon />}
                  onClick={() => navigate(`/admin/lps/edit/${album.id}`)}
                >
                  Editar LP
                </Button>
                <DeleteAlbumButton albumId={album.id} />
              </Flex>
            </Box>
          </Flex>
          
          {/* Lista de canciones */}
          <Box mt={10}>
            <Heading size="md" mb={4}>Canciones</Heading>
            {songsLoading ? (
              <Center h="200px">  
                <TableSkeleton rows={5} />
              </Center>
            ) : songs.length === 0 ? (
              <Box p={4} bg="gray.100" borderRadius="md">
                <Text>No hay canciones en este álbum.</Text>
              </Box>
            ) : (
              <Box as="table" width="100%" borderWidth="1px" borderRadius="md">
                <Box as="thead" bg="gray.100">
                  <Box as="tr">
                    <Box as="th" p={3} textAlign="left">#</Box>
                    <Box as="th" p={3} textAlign="left">Título</Box>
                    <Box as="th" p={3} textAlign="left">BPM</Box>
                    <Box as="th" p={3} textAlign="left">Artista</Box>
                    <Box as="th" p={3} textAlign="left">Duración</Box>
                  </Box>
                </Box>
                <Box as="tbody">
                  {songs.map((song, index) => (
                    <Box as="tr" key={song.id} _hover={{ bg: 'gray.50' }}>
                      <Box as="td" p={3}>{index + 1}</Box>
                      <Box as="td" p={3}>{song.title}</Box>
                      <Box as="td" p={3}>
                        <Flex alignItems="center">
                          <Text mr={2}>{song.bpm}</Text>
                          <Text fontSize="xl">{getBpmColorEmoji(song.bpm)}</Text>
                        </Flex>
                      </Box>
                      <Box as="td" p={3}>{song.artists?.name || 'Artista principal'}</Box>
                      <Box as="td" p={3}>{song.duration_seconds ? formatDuration(song.duration_seconds) : '--:--'}</Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      ) : (
        <Box p={4} bg="gray.100" borderRadius="md">
          <Text>No se encontró el álbum.</Text>
        </Box>
      )}
    </Box>
  );
};

function App() {
  return (
    <Box>
      <SimpleNavbar />
      <Box as="main" p={4}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/album/:id" element={<AlbumDetailPage />} />
          <Route path="/songs" element={<SongsPage />} />
          <Route path="/bpm-info" element={<BpmInfoPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/lps" element={<ManageLPs />} />
          <Route path="/admin/lps/new" element={<LPForm />} />
          <Route path="/admin/lps/edit/:id" element={<LPForm />} />
          <Route path="/admin/lps/:lpId/add-track" element={<TrackForm />} />
          <Route path="/admin/tracks/edit/:trackId" element={<TrackForm />} />
          <Route path="/admin/bpm-explorer" element={<BpmExplorer />} />
          {/* Mantenemos estas rutas para compatibilidad */}
          <Route path="/admin/songs" element={<ManageSongs />} />
          <Route path="/admin/albums" element={<ManageAlbums />} />
          <Route path="/admin/artists" element={<ManageArtists />} />
        </Routes>
      </Box>
    </Box>
  )
}

export default App
