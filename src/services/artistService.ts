import { supabase } from './supabase';
import { Artist } from '../types';

export const getArtists = async (): Promise<Artist[]> => {
  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data || [];
};

export const createArtist = async (name: string): Promise<Artist> => {
  const { data, error } = await supabase
    .from('artists')
    .insert([{ name }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateArtist = async (id: string, name: string): Promise<Artist> => {
  const { data, error } = await supabase
    .from('artists')
    .update({ name })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteArtist = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('artists')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};
