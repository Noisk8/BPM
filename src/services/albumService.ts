import { supabase } from './supabase';
import { Album } from '../types';

export const getAlbums = async (): Promise<Album[]> => {
  const { data, error } = await supabase
    .from('albums')
    .select('*, artist:artists(*)')
    .order('title');
  
  if (error) throw error;
  return data || [];
};

export const createAlbum = async (album: Omit<Album, 'id' | 'created_at'>): Promise<Album> => {
  const { data, error } = await supabase
    .from('albums')
    .insert([album])
    .select('*, artist:artists(*)')
    .single();
  
  if (error) throw error;
  return data;
};

export const updateAlbum = async (id: string, updates: Partial<Album>): Promise<Album> => {
  const { data, error } = await supabase
    .from('albums')
    .update(updates)
    .eq('id', id)
    .select('*, artist:artists(*)')
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteAlbum = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('albums')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};
