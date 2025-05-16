import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSongs, createSong, updateSong, deleteSong, getSongsByBpmRange } from '../services/songService';
import { Song } from '../types';

export const useSongs = (bpmRange?: [number, number]) => {
  const queryClient = useQueryClient();
  
  // Query para obtener todas las canciones o filtradas por BPM
  const songsQuery = useQuery(
    bpmRange ? ['songs', 'bpm', bpmRange[0], bpmRange[1]] : ['songs'],
    () => bpmRange ? getSongsByBpmRange(bpmRange[0], bpmRange[1]) : getSongs()
  );

  // Mutación para crear una canción
  const createMutation = useMutation(
    (newSong: Omit<Song, 'id' | 'created_at' | 'color_code'>) => createSong(newSong),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['songs']);
      }
    }
  );

  // Mutación para actualizar una canción
  const updateMutation = useMutation(
    ({id, updates}: {id: string, updates: Partial<Omit<Song, 'id' | 'created_at'>>}) => 
      updateSong(id, updates),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['songs']);
      }
    }
  );

  // Mutación para eliminar una canción
  const deleteMutation = useMutation(
    (id: string) => deleteSong(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['songs']);
      }
    }
  );

  return {
    songs: songsQuery.data || [],
    isLoading: songsQuery.isLoading,
    isError: songsQuery.isError,
    error: songsQuery.error,
    createSong: createMutation.mutate,
    updateSong: updateMutation.mutate,
    deleteSong: deleteMutation.mutate,
    isCreating: createMutation.isLoading,
    isUpdating: updateMutation.isLoading,
    isDeleting: deleteMutation.isLoading
  };
};
