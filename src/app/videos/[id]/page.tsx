"use client";

import React, { useState, useEffect, use } from "react";
import { getSupabaseBrowserClient } from "@/utils/supabaseClient";
import { VideoPlayer, formatDuration } from "@/components/VideoPlayer";
import type { Video } from "@/types/index";
import { useRouter } from "next/navigation";

interface VideoPageProps {
  params: Promise<{ id: string }>;
}

export default function VideoPage({ params }: VideoPageProps) {
  const { id } = use(params);
  const supabaseClient = getSupabaseBrowserClient();
  const router = useRouter();
  const [video, setVideo] = useState<Video | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const loadVideo = async () => {
      const { data, error } = await supabaseClient
        .from("videos")
        .select("*, artists(*)")
        .eq("id", id)
        .single();
      if (error) {
        console.error("Error fetching video:", error);
        return;
      }
      const v = data as any;
      const artistRow = v.artists ?? {
        id: "",
        name: "Unknown Artist",
        profile_image_url: "",
        verified: false,
        subscribers: 0,
      };
      const formatted: Video = {
        id: v.id,
        title: v.title,
        artist: {
          id: artistRow.id,
          name: artistRow.name,
          avatar: artistRow.profile_image_url,
          verified: artistRow.verified,
          subscribers: artistRow.subscribers,
        },
        thumbnail: v.thumbnail_url,
        videoUrl: v.video_url,
        duration: formatDuration(v.duration),
        views: v.views,
        likes: v.likes,
        dislikes: v.dislikes,
        uploadDate: new Date(v.created_at).toISOString().split("T")[0],
        description: v.description,
        genre: v.genre,
        isLiked: false,
        isDisliked: false,
        isBookmarked: false,
      };
      setVideo(formatted);
    };
    loadVideo();
  }, [id, supabaseClient]);

  if (!video) return <div>Loading...</div>;

  return (
    <VideoPlayer
      video={video}
      isPlaying={isPlaying}
      onPlayPause={() => setIsPlaying(!isPlaying)}
      onClose={() => router.back()}
    />
  );
}
