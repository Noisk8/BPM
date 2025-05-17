import { useState, useEffect } from 'react';
import { Box, Text, VStack, Heading, Code, Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react';

const DebugEnv = () => {
  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Verificar si import.meta.env está definido
      if (!import.meta || !import.meta.env) {
        setError('import.meta.env no está disponible. Esto puede ser un problema con Vite o la configuración del entorno.');
        return;
      }

      // Recopilar todas las variables de entorno que comienzan con VITE_
      const vars: Record<string, string> = {};
      Object.keys(import.meta.env).forEach(key => {
        if (key.startsWith('VITE_')) {
          vars[key] = import.meta.env[key] || '(vacío)';
        }
      });
      setEnvVars(vars);
    } catch (err) {
      setError(`Error al acceder a las variables de entorno: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, []);

  return (
    <Box p={5} maxW="800px" mx="auto" mt={10}>
      <VStack spacing={4} align="stretch">
        <Heading size="lg">Depuración de Variables de Entorno</Heading>
        
        {error ? (
          <Alert status="error" variant="solid" borderRadius="md">
            <AlertIcon />
            <AlertTitle mr={2}>Error:</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        
        <Text>
          Si la aplicación aparece en blanco, puede deberse a problemas con las variables de entorno.
          A continuación se muestran las variables disponibles:
        </Text>
        
        {Object.keys(envVars).length > 0 ? (
          <Box p={4} borderWidth={1} borderRadius="md" bg="gray.50" color="black">
            <VStack align="start" spacing={2}>
              {Object.entries(envVars).map(([key, value]) => (
                <Text key={key}>
                  <Code fontWeight="bold">{key}:</Code> {value ? (value.length > 10 ? `${value.substring(0, 10)}...` : value) : '(vacío)'}
                </Text>
              ))}
            </VStack>
          </Box>
        ) : (
          <Text color="red.500">No se encontraron variables de entorno con prefijo VITE_</Text>
        )}
        
        <Text mt={4}>
          Si no ves las variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY, o están vacías, 
          necesitas configurar correctamente el archivo .env en la raíz del proyecto.
        </Text>
        
        <Alert status="info" mt={4} borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>Información de diagnóstico:</AlertTitle>
            <AlertDescription>
              <Text>Ruta actual: / (DebugEnv)</Text>
              <Text>React y Chakra UI están cargados correctamente si puedes ver este mensaje.</Text>
              <Text>Prueba navegar a <Code>/home</Code> o <Code>/bpm-info</Code> para ver si otras rutas funcionan.</Text>
            </AlertDescription>
          </Box>
        </Alert>
      </VStack>
    </Box>
  );
};

export default DebugEnv;
