import { Box, Heading, Container } from '@chakra-ui/react';
import SongList from '../components/songs/SongList';

export default function Songs() {
  return (
    <Container maxW="container.xl" p={5}>
      <Heading mb={6}>Todas las Canciones</Heading>
      <SongList />
    </Container>
  );
}
