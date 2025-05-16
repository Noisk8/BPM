export interface Artist {
  id: string;
  name: string;
  created_at: string;
}

export interface Album {
  id: string;
  title: string;
  artist_id: string;
  release_year?: number;
  cover_image_url?: string;
  created_at: string;
  artist?: Artist;
}

export interface Song {
  id: string;
  title: string;
  album_id: string;
  artist_id: string;
  duration_seconds: number;
  bpm: number;
  key?: string;
  color_code: string;
  file_path?: string;
  created_at: string;
  album?: Album;
  artist?: Artist;
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
}

export type BPMColorRange = {
  min: number;
  max: number;
  color: string;
  emoji: string;
}

export const BPM_COLOR_RANGES: BPMColorRange[] = [
  { min: 70, max: 90, color: "blue", emoji: "🔵" },
  { min: 90, max: 100, color: "green", emoji: "🟢" },
  { min: 100, max: 110, color: "yellow", emoji: "🟡" },
  { min: 110, max: 120, color: "orange", emoji: "🟠" },
  { min: 120, max: 130, color: "red", emoji: "🔴" },
  { min: 130, max: 140, color: "purple", emoji: "🟣" }
];
