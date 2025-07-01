"use client";

import React, { useEffect, useState } from "react";
import { useSupabaseClient } from "@/utils/supabaseClient";
import { useRouter } from "next/navigation";

interface Props {
  className?: string;
}

export default function SubscriptionBanner({ className = "" }: Props) {
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [plan, setPlan] = useState<"free" | "premium" | "vip" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlan() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setPlan(null);
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("users")
        .select("plan")
        .eq("id", user.id)
        .single();
      setPlan((data?.plan as any) || "free");
      setLoading(false);
    }
    fetchPlan();
  }, [supabase]);

  if (loading) return null;
  if (plan && plan !== "free") return null; // Banner só para usuários Free

  const upgrade = async () => {
    router.push("/pricing"); // página de preços (a criar)
  };

  return (
    <div className={`bg-indigo-600 text-white p-4 rounded-md ${className}`}>
      <span>Você está no plano gratuito. Atualize para Premium ou VIP para desbloquear todo o catálogo!</span>
      <button
        onClick={upgrade}
        className="ml-4 bg-white text-indigo-600 px-3 py-1 rounded-md font-semibold"
      >
        Ver Planos
      </button>
    </div>
  );
}
