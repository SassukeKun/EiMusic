"use client";

import React, { useState } from "react";
import { useSupabaseClient } from "@/utils/supabaseClient";
import { useRouter } from "next/navigation";

interface Props {
  communityId: string;
  alreadyMember: boolean;
}

export default function CommunityJoinButton({ communityId, alreadyMember }: Props) {
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(alreadyMember);

  const join = async () => {
    setLoading(true);
    const res = await fetch(`/api/communities/${communityId}/join`, {
      method: "POST",
    });
    if (res.ok) {
      setJoined(true);
      router.refresh();
    } else {
      const { error } = await res.json();
      alert(error);
    }
    setLoading(false);
  };

  if (joined) return <span className="text-green-600 font-semibold">Membro</span>;

  return (
    <button
      disabled={loading}
      onClick={join}
      className="bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700 disabled:opacity-50"
    >
      {loading ? "Entrando..." : "Entrar"}
    </button>
  );
}
