import { Box, Tabs, TabList, TabPanels, Tab, TabPanel, Heading, Text } from '@chakra-ui/react';
import { ArtistForm } from '../../components/admin/ArtistForm';
import { AlbumForm } from '../../components/admin/AlbumForm';
import { SongForm } from '../../components/admin/SongForm';

export default function Dashboard() {
  return (
    <Box p={5}>
      <Heading mb={6}>Panel de Administración</Heading>
      <Text mb={4}>Desde aquí puedes gestionar todos los elementos de tu biblioteca musical y añadir nuevos discos, artistas y canciones.</Text>
      
      <Tabs colorScheme="blue" isLazy>
        <TabList>
          <Tab>Artistas</Tab>
          <Tab>Álbumes</Tab>
          <Tab>Canciones</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <ArtistForm />
          </TabPanel>
          <TabPanel>
            <AlbumForm />
          </TabPanel>
          <TabPanel>
            <SongForm />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
