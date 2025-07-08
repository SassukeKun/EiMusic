export interface Artist {
  id: string;
  name: string;
  profile_image_url: string;
}

export interface RawRelease {
  id: string;
  title: string;
  cover_url?: string;
  file_url?: string;
  video_url?: string;
  created_at: string;
  artist_id: string;
  artist: Artist[];
  type?: 'album' | 'single' | 'video';
}

export interface Release {
  id: string;
  title: string;
  cover_url: string;
  created_at: string;
  artist: Artist;
  type: 'album' | 'single' | 'video';
}
