import { supabase } from './supabase';
import { Song } from '../types';

export const getSongs = async (): Promise<Song[]> => {
  const { data, error } = await supabase
    .from('songs')
    .select('*, album:albums(*, artist:artists(*)), artist:artists(*)')
    .order('title');
  
  if (error) throw error;
  return data || [];
};

export const getSongsByBpmRange = async (minBpm: number, maxBpm: number): Promise<Song[]> => {
  const { data, error } = await supabase
    .from('songs')
    .select('*, album:albums(*, artist:artists(*)), artist:artists(*)')
    .gte('bpm', minBpm)
    .lte('bpm', maxBpm)
    .order('bpm');
  
  if (error) throw error;
  return data || [];
};

export const createSong = async (song: Omit<Song, 'id' | 'created_at' | 'color_code'>): Promise<Song> => {
  const { data, error } = await supabase
    .from('songs')
    .insert([song])
    .select('*, album:albums(*, artist:artists(*)), artist:artists(*)')
    .single();
  
  if (error) throw error;
  return data;
};

export const updateSong = async (id: string, updates: Partial<Omit<Song, 'id' | 'created_at'>>): Promise<Song> => {
  const { data, error } = await supabase
    .from('songs')
    .update(updates)
    .eq('id', id)
    .select('*, album:albums(*, artist:artists(*)), artist:artists(*)')
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteSong = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('songs')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};
