import { supabase } from './supabase';

export type LoginCredentials = {
  email: string;
  password: string;
};

export type SignUpCredentials = LoginCredentials & {
  name?: string;
};

export const signUp = async (credentials: SignUpCredentials) => {
  const { data, error } = await supabase.auth.signUp({
    email: credentials.email,
    password: credentials.password,
    options: {
      data: {
        name: credentials.name,
        role: 'user'
      }
    }
  });

  if (error) throw error;
  return data;
};

export const signIn = async (credentials: LoginCredentials) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password
  });

  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
};

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
};

export const isAdmin = async () => {
  const user = await getCurrentUser();
  if (!user) return false;
  
  // Verifica si el usuario tiene rol de admin
  return user.user_metadata?.role === 'admin';
};
