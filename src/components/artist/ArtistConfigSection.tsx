"use client";

import React, { useEffect, useState } from "react";
import ProfilePhotoUploader from "@/components/settings/ProfilePhotoUploader";
import artistService from "@/services/artistService";
import type { Artist as DBArtist } from "@/models/artist";

// Sub‐set of the artist columns we care about editing here.
export type EditableArtist = DBArtist & {
  subscribers?: number;
  verified?: boolean;
  profile_image_url?: string;
  [key: string]: any;  // Allow dynamic property access
};

interface ArtistConfigSectionProps {
  /** The auth.user.id which maps to the artists.id */
  userId?: string;
  /** Current artist row loaded from Supabase */
  artist: EditableArtist | null;
  /** Provinces list reused from parent */
  provinces: string[];
}

const MOZ_PHONE_REGEX = /^(82|83|84|85|86|87)\d{7}$/;

const ArtistConfigSection: React.FC<ArtistConfigSectionProps> = ({
  userId,
  artist,
  provinces,
}) => {
  /* Local component state so re-renders of the parent *do not* cause the
     component to unmount (and therefore blur your inputs). */
  const [artistName, setArtistName] = useState<string>("");
  const [artistBio, setArtistBio] = useState<string>("");
  const [province, setProvince] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [instagram, setInstagram] = useState<string>("");
  const [twitter, setTwitter] = useState<string>("");
  const [website, setWebsite] = useState<string>("");
  const [profileImageUrl, setProfileImageUrl] = useState<string>("");
  const [saving, setSaving] = useState(false);

  /* Sync artist prop into local state once it is fetched. */
  useEffect(() => {
    if (!artist) return;
    setArtistName(artist.name || "");
    setArtistBio(artist.bio || "");
    setProvince(artist.province || "");
    // Social links may be stored as JSON or legacy flat columns
    setInstagram(
      (artist as any).instagram || artist.social_links?.instagram || ""
    );
    setTwitter((artist as any).twitter || artist.social_links?.twitter || "");
    setWebsite((artist as any).website || artist.social_links?.website || "");
    setPhone((artist as any).phone || artist.phone || "");
  }, [artist]);

  const handleSave = async () => {
    if (!userId) {
      alert("Você precisa estar autenticado");
      return;
    }

    // Simple Mozambican phone validation (optional field)
    if (phone && !MOZ_PHONE_REGEX.test(phone)) {
      alert("Telefone inválido. Deve começar com 82-87 e possuir 9 dígitos.");
      return;
    }

    try {
      setSaving(true);
      // Validate phone number if provided
      if (phone && !MOZ_PHONE_REGEX.test(phone)) {
        throw new Error("Telefone inválido. Deve começar com 82-87 e possuir 9 dígitos.");
      }

      // Prepare update data
      const updateData = {
        name: artistName.trim(),
        bio: artistBio.trim(),
        province: province || null,
        phone: phone || null,
        social_links: {
          instagram: instagram.trim(),
          twitter: twitter.trim(),
          website: website.trim(),
        },
        profile_image_url: profileImageUrl || null
      };

      // Only update fields that have changed
      const updateFields = Object.entries(updateData).reduce((acc, [key, value]) => {
        if (value !== null && value !== artist?.[key]) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);

      await artistService.updateArtist(userId, updateFields);
      alert("Alterações guardadas com sucesso");
    } catch (err) {
      console.error("Erro ao salvar alterações", err);
      alert("Falha ao salvar alterações");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Configurações</h2>
        <p className="text-gray-400 text-lg">
          Personaliza o teu perfil e preferências da conta
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Perfil */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 shadow-lg">
          <h3 className="text-white font-semibold text-xl mb-6">
            Informações do Perfil
          </h3>
          <div className="space-y-6">
            <div className="flex items-center space-x-6">
              <ProfilePhotoUploader
                mode="artist"
                id={userId || artist?.id || ""}
                initialUrl={profileImageUrl || artist?.profile_image_url || "/avatar.svg"}
                onUploadSuccess={(url) => setProfileImageUrl(url)}
              />
            </div>
            {/* Nome */}
            <div>
              <label className="block text-gray-400 font-medium mb-3">
                Nome do Artista
              </label>
              <input
                type="text"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            {/* Bio */}
            <div>
              <label className="block text-gray-400 font-medium mb-3">Bio</label>
              <textarea
                rows={4}
                value={artistBio}
                onChange={(e) => setArtistBio(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            {/* Province */}
            <div>
              <label className="block text-gray-400 font-medium mb-3">
                Província
              </label>
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Selecione uma província</option>
                {provinces.map((prov) => (
                  <option key={prov} value={prov}>
                    {prov}
                  </option>
                ))}
              </select>
            </div>
            {/* Phone */}
            <div>
              <label className="block text-gray-400 font-medium mb-3">
                Telefone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="82XXXXXXX"
                className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Preferências */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 shadow-lg">
          <h3 className="text-white font-semibold text-xl mb-6">Preferências</h3>
          <div className="space-y-6">
            {/* Redes sociais */}
            <div>
              <label className="block text-gray-400 font-medium mb-3">
                Instagram
              </label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-gray-400 font-medium mb-3">Twitter</label>
              <input
                type="text"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-gray-400 font-medium mb-3">Website</label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://seu-site.com"
                className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white py-4 rounded-xl mt-8 font-medium transition-colors flex items-center justify-center gap-2"
      >
        {saving && (
          <span className="loader inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        )}
        Salvar Alterações
      </button>
    </div>
  );
};

export default ArtistConfigSection;
