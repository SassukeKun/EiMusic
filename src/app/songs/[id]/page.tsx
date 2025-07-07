import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import SongControls from "@/components/SongControls";

export default async function SinglePage({ params }: any) {
  const { id } = params;
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: single, error } = await supabase
    .from("singles")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !single) {
    return <div className="text-center p-8">Single não encontrado</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="relative h-80 w-full">
        {single.cover_url && (
          <>
            <Image
              src={single.cover_url}
              alt={single.title}
              fill
              className="object-cover filter blur-sm opacity-30"
              unoptimized
            />
            <div className="absolute inset-0 bg-black bg-opacity-60" />
          </>
        )}
        <div className="absolute bottom-0 left-0 p-8 flex items-end space-x-6">
          {single.cover_url && (
            <Image
              src={single.cover_url}
              alt={single.title}
              width={200}
              height={200}
              className="shadow-2xl"
              unoptimized
            />
          )}
          <div className="space-y-2">
            <h1 className="text-5xl font-bold tracking-tight">
              {single.title}
            </h1>
            {single.description && (
              <p className="text-gray-300 max-w-lg">{single.description}</p>
            )}
            <SongControls single={single} />
          </div>
        </div>
      </div>
    </div>
  );
}
