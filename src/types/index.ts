// src/types/index.ts
// Shared types for the application

export interface Video {
  id: string;
  title: string;
  artist: {
    id: string;
    name: string;
    avatar: string;
    verified: boolean;
    subscribers?: number;
  };
  thumbnail: string;
  videoUrl: string;
  duration: string;
  views: number;
  likes: number;
  dislikes: number;
  uploadDate: string;
  description: string;
  genre: string;
  isLiked?: boolean;
  isDisliked?: boolean;
  isBookmarked?: boolean;
}
