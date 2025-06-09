"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useAlbumUpload } from "@/hooks/useAlbumUpload";
import {
  FaUpload,
  FaImage,
  FaTimes,
  FaMusic,
  FaPlus,
  FaMinus,
  FaGlobe,
  FaLock,
  FaUsers,
  FaSave,
  FaCloudUploadAlt,
  FaArrowLeft,
  FaArrowRight,
  FaInfoCircle,
  FaCalendarAlt,
  FaTag,
  FaEye,
  FaVolumeUp,
} from "react-icons/fa";
import FileUploader from "@/components/upload/FileUploader";
import uploadService from "@/services/uploadService";

// Componente principal para upload de álbum
export default function AlbumUploadPage() {
  const { isArtist, loading, user } = useAuth();
  const { uploadAlbum, uploadState: albumUploadState } = useAlbumUpload();

  // Estado para gerenciar upload de álbum
  const [uploadStep, setUploadStep] = useState<
    "initial" | "tracks" | "details" | "uploading" | "success" | "error"
  >("initial");
  const [coverArtFile, setCoverArtFile] = useState<File | null>(null);
  const [coverArtPreview, setCoverArtPreview] = useState<string | undefined>(
    undefined
  );
  const [trackFiles, setTrackFiles] = useState<File[]>([]);
  const [trackFileNames, setTrackFileNames] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Estado para metadados do álbum
  const [albumTitle, setAlbumTitle] = useState<string>("");
  const [albumDescription, setAlbumDescription] = useState<string>("");
  const [albumGenre, setAlbumGenre] = useState<string>("");
  const [albumVisibility, setAlbumVisibility] = useState<
    "public" | "private" | "followers"
  >("public");
  const [isExplicit, setIsExplicit] = useState<boolean>(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>("");
  const [releaseDate, setReleaseDate] = useState<string>("");

  // Refs
  const audioInputRef = useRef<HTMLInputElement>(null);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-indigo-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
          <p className="text-gray-400">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Verificação de artista
  if (!isArtist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-indigo-900 text-white flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-700">
          <h1 className="text-2xl font-bold mb-4">Acesso Restrito</h1>
          <p className="text-gray-400 mb-6">
            Esta página é exclusiva para artistas. Registre-se como artista para
            fazer upload de álbuns.
          </p>
          <Link
            href="/artist/register"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Registrar como Artista
          </Link>
        </div>
      </div>
    );
  }

  // Manipulador para seleção de capa do álbum
  const handleCoverArtSelect = (file: File) => {
    setCoverArtFile(file);
    const objectUrl = URL.createObjectURL(file);
    setCoverArtPreview(objectUrl);

    // Se for o primeiro passo, avançar para a seleção de faixas
    if (uploadStep === "initial") {
      setTimeout(() => setUploadStep("tracks"), 1600);
    }

    return () => URL.revokeObjectURL(objectUrl);
  };

  // Manipulador para limpar a capa
  const handleClearCoverArt = () => {
    setCoverArtFile(null);
    setCoverArtPreview(undefined);
  };

  // Manipulador para adicionar faixas
  const handleAddTrack = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);

      // Verificar tipos de arquivo
      const validFiles = newFiles.filter((file) =>
        file.type.startsWith("audio/")
      );
      if (validFiles.length !== newFiles.length) {
        setError("Alguns arquivos não são de áudio e foram ignorados");
      }

      // Verificar tamanho de arquivos (50MB máximo por arquivo)
      const validSizeFiles = validFiles.filter(
        (file) => file.size <= 50 * 1024 * 1024
      );
      if (validSizeFiles.length !== validFiles.length) {
        setError("Alguns arquivos são maiores que 50MB e foram ignorados");
      }

      // Adicionar ao estado
      setTrackFiles((prev) => [...prev, ...validSizeFiles]);
      setTrackFileNames((prev) => [
        ...prev,
        ...validSizeFiles.map((file) => file.name),
      ]);

      // Limpar input
      if (audioInputRef.current) {
        audioInputRef.current.value = "";
      }
    }
  };

  // Manipulador para remover uma faixa
  const handleRemoveTrack = (index: number) => {
    setTrackFiles((prev) => prev.filter((_, i) => i !== index));
    setTrackFileNames((prev) => prev.filter((_, i) => i !== index));
  };

  // Manipulador para adicionar tag
  const handleAddTag = () => {
    if (
      tagInput.trim() &&
      !tags.includes(tagInput.trim()) &&
      tags.length < 10
    ) {
      setTags((prev) => [...prev, tagInput.trim()]);
      setTagInput("");
    }
  };

  // Manipulador para remover tag
  const handleRemoveTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  // Manipulador para enviar para detalhes
  const handleProceedToDetails = () => {
    if (trackFiles.length === 0) {
      setError("Adicione pelo menos uma faixa ao álbum");
      return;
    }

    setError(null);
    setUploadStep("details");
  };

  // Manipulador para voltar para seleção de faixas
  const handleBackToTracks = () => {
    setUploadStep("tracks");
  };

  // Manipulador para iniciar upload
  const handleStartUpload = async () => {
    if (!coverArtFile || trackFiles.length === 0 || !albumTitle.trim()) {
      setError("Preencha todos os campos obrigatórios");
      return;
    }

    setUploadStep("uploading");

    try {
      const metadata = {
        title: albumTitle,
        description: albumDescription,
        genre: albumGenre,
        releaseDate: releaseDate || new Date().toISOString(),
        visibility: albumVisibility,
        isExplicit,
        tags: tags.length > 0 ? tags : undefined,
      };

      const result = await uploadAlbum(coverArtFile, trackFiles, metadata);

      if (result) {
        setUploadResult(result);
        setUploadStep("success");
      } else {
        setError("Falha no upload do álbum");
        setUploadStep("error");
      }
    } catch (err: any) {
      console.error("Erro ao fazer upload do álbum:", err);
      setError(err.message || "Ocorreu um erro ao fazer upload do álbum");
      setUploadStep("error");
    }
  };

  // Manipulador para reiniciar o processo
  const handleReset = () => {
    setCoverArtFile(null);
    setCoverArtPreview(undefined);
    setTrackFiles([]);
    setTrackFileNames([]);
    setAlbumTitle("");
    setAlbumDescription("");
    setAlbumGenre("");
    setAlbumVisibility("public");
    setIsExplicit(false);
    setTags([]);
    setTagInput("");
    setReleaseDate("");
    setError(null);
    setUploadResult(null);
    setUploadProgress(0);
    setUploadStep("initial");
  };

  // Renderização do conteúdo com base na etapa atual
  const renderContent = () => {
    switch (uploadStep) {
      case "initial":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto p-8 bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700"
          >
            {/* ✅ BOTÃO DE VOLTAR ADICIONADO */}
            <div className="mb-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.history.back()}
                className="flex items-center text-gray-400 hover:text-white transition-colors"
              >
                <FaArrowLeft className="mr-2" />
                Voltar
              </motion.button>
            </div>

            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-block p-4 bg-indigo-600/20 rounded-full mb-4"
              >
                <FaMusic className="text-4xl text-indigo-400" />
              </motion.div>
              <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Upload de Álbum
              </h1>
              <p className="text-gray-300 text-lg">
                Comece carregando a capa do seu álbum. Em seguida, você poderá
                adicionar as faixas e os detalhes.
              </p>
            </div>

            {/* ✅ CONTAINER FIXO PARA A IMAGEM - CORREÇÃO DO TRANSBORDAMENTO */}
            <div className="max-w-md mx-auto mb-8">
              <div className="w-full max-w-sm mx-auto">
                {/* Container com altura fixa e aspect ratio */}
                <div className="relative w-full aspect-square max-h-80 bg-gray-700/30 border-2 border-dashed border-gray-600 rounded-xl overflow-hidden">
                  {coverArtPreview ? (
                    <div className="relative w-full h-full group">
                      <Image
                        src={coverArtPreview}
                        alt="Capa do álbum"
                        fill
                        style={{ objectFit: "cover" }}
                        className="rounded-xl"
                      />
                      {/* Overlay para o botão de remover */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={handleClearCoverArt}
                          className="bg-red-500/80 hover:bg-red-500 backdrop-blur-sm rounded-full p-3 text-white transition-colors"
                        >
                          <FaTimes size={16} />
                        </motion.button>
                      </div>
                    </div>
                  ) : (
                    /* Estado vazio - área de upload */
                    <div
                      className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-700/50 transition-colors"
                      onClick={() => {
                        // Simular clique no input de arquivo
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = "image/*";
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement)
                            .files?.[0];
                          if (file) {
                            handleCoverArtSelect(file);
                          }
                        };
                        input.click();
                      }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="bg-indigo-600/20 p-4 rounded-full mb-4"
                      >
                        <FaImage className="text-3xl text-indigo-400" />
                      </motion.div>
                      <h3 className="text-lg font-semibold mb-2">
                        Adicionar Capa
                      </h3>
                      <p className="text-gray-400 text-sm text-center px-4">
                        Clique para selecionar uma imagem
                      </p>
                      <p className="text-gray-500 text-xs mt-2">
                        JPG, PNG até 5MB
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ✅ INDICADORES DE PROGRESSO - POSICIONADOS CORRETAMENTE */}
            <div className="text-center">
              <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto text-sm text-gray-400">
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-400">1</div>
                  <div className="text-indigo-400">Capa</div>
                </div>
                <div className="text-center opacity-50">
                  <div className="text-2xl font-bold">2</div>
                  <div>Faixas</div>
                </div>
                <div className="text-center opacity-50">
                  <div className="text-2xl font-bold">3</div>
                  <div>Detalhes</div>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case "tracks":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl mx-auto p-8 bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700"
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Adicionar Faixas
              </h1>
              <p className="text-gray-300">
                Selecione os arquivos de áudio que compõem seu álbum
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* ✅ Preview da capa - ALTURA FIXA PARA EVITAR TRANSBORDAMENTO */}
              <div className="lg:col-span-1">
                <div className="bg-gray-700/50 rounded-xl p-6 border border-gray-600 sticky top-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <FaEye className="mr-2 text-indigo-400" />
                    Preview do Álbum
                  </h3>
                  {coverArtPreview && (
                    <div className="relative w-full aspect-square mb-4 rounded-lg overflow-hidden max-h-64">
                      <Image
                        src={coverArtPreview}
                        alt="Capa do álbum"
                        fill
                        style={{ objectFit: "cover" }}
                        className="rounded-lg"
                      />
                      <button
                        onClick={handleClearCoverArt}
                        className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 backdrop-blur-sm rounded-full p-2 text-white transition-colors"
                      >
                        <FaTimes size={14} />
                      </button>
                    </div>
                  )}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Faixas:</span>
                      <span className="text-white font-medium">
                        {trackFiles.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tamanho:</span>
                      <span className="text-white font-medium">
                        {(
                          trackFiles.reduce((acc, file) => acc + file.size, 0) /
                          (1024 * 1024)
                        ).toFixed(1)}{" "}
                        MB
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Área de upload */}
              <div className="lg:col-span-2">
                <div
                  className="border-2 border-dashed border-gray-600 hover:border-indigo-500/50 rounded-xl p-8 text-center transition-all cursor-pointer bg-gray-700/20 hover:bg-gray-700/30"
                  onClick={() => audioInputRef.current?.click()}
                >
                  <input
                    type="file"
                    accept="audio/*"
                    multiple
                    onChange={handleAddTrack}
                    ref={audioInputRef}
                    className="hidden"
                    id="audio-upload"
                  />

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="inline-block p-6 bg-indigo-600/20 rounded-full mb-4"
                  >
                    <FaMusic className="text-4xl text-indigo-400" />
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2">
                    Adicionar Faixas
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Selecione múltiplos arquivos de áudio
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center mx-auto"
                  >
                    <FaPlus className="mr-2" />
                    Escolher Arquivos
                  </motion.button>
                  <p className="text-gray-500 text-sm mt-4">
                    MP3, WAV, FLAC até 50MB por arquivo
                  </p>
                </div>
              </div>
            </div>

            {/* Mensagem de erro */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-red-900/30 border border-red-500 p-4 rounded-lg mb-6 text-red-200"
                >
                  <div className="flex items-center">
                    <FaInfoCircle className="mr-2" />
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Lista de faixas */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center">
                  <FaVolumeUp className="mr-2 text-indigo-400" />
                  Faixas ({trackFiles.length})
                </h2>
                {trackFiles.length > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={handleProceedToDetails}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                  >
                    Próximo: Detalhes
                    <FaArrowRight className="ml-2" />
                  </motion.button>
                )}
              </div>

              {trackFiles.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <FaMusic className="text-4xl mx-auto mb-4 opacity-50" />
                  <p className="italic">Nenhuma faixa adicionada ainda</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                  {trackFileNames.map((name, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between bg-gray-700/40 backdrop-blur-sm p-4 rounded-lg border border-gray-600/30"
                    >
                      <div className="flex items-center flex-1">
                        <div className="bg-indigo-600/20 p-2 rounded-lg mr-4">
                          <FaMusic className="text-indigo-400" />
                        </div>
                        <div className="flex-1">
                          <span className="font-medium text-white block truncate">
                            {name}
                          </span>
                          <span className="text-sm text-gray-400">
                            Faixa {index + 1} •{" "}
                            {(trackFiles[index].size / (1024 * 1024)).toFixed(
                              1
                            )}{" "}
                            MB
                          </span>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleRemoveTrack(index)}
                        className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-900/20 transition-colors"
                      >
                        <FaTimes />
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Navegação */}
            <div className="flex justify-between items-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setUploadStep("initial")}
                className="flex items-center py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
              >
                <FaArrowLeft className="mr-2" />
                Voltar
              </motion.button>

              <div className="text-center">
                <div className="grid grid-cols-3 gap-4 text-sm text-gray-400">
                  <div className="text-center opacity-50">
                    <div className="text-lg font-bold">1</div>
                    <div>Capa</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-indigo-400">2</div>
                    <div className="text-indigo-400">Faixas</div>
                  </div>
                  <div className="text-center opacity-50">
                    <div className="text-lg font-bold">3</div>
                    <div>Detalhes</div>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={handleProceedToDetails}
                disabled={trackFiles.length === 0}
                className={`flex items-center py-2 px-4 rounded-lg transition-colors font-medium ${
                  trackFiles.length === 0
                    ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white"
                }`}
              >
                Próximo: Detalhes
                <FaArrowRight className="ml-2" />
              </motion.button>
            </div>
          </motion.div>
        );

      case "details":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl mx-auto p-8 bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700"
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Detalhes do Álbum
              </h1>
              <p className="text-gray-300">
                Finalize as informações do seu álbum
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* Preview */}
              <div className="lg:col-span-1">
                <div className="bg-gray-700/50 rounded-xl p-6 border border-gray-600 sticky top-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <FaEye className="mr-2 text-indigo-400" />
                    Preview Final
                  </h3>
                  {coverArtPreview && (
                    <div className="relative w-full aspect-square mb-4 rounded-lg overflow-hidden max-h-64">
                      <Image
                        src={coverArtPreview}
                        alt="Capa do álbum"
                        fill
                        style={{ objectFit: "cover" }}
                        className="rounded-lg"
                      />
                    </div>
                  )}
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Título:</span>
                      <span className="text-white font-medium truncate ml-2">
                        {albumTitle || "Sem título"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Faixas:</span>
                      <span className="text-white font-medium">
                        {trackFiles.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Gênero:</span>
                      <span className="text-white font-medium">
                        {albumGenre || "Não definido"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Visibilidade:</span>
                      <span className="text-white font-medium flex items-center">
                        {albumVisibility === "public" && (
                          <>
                            <FaGlobe className="mr-1" />
                            Público
                          </>
                        )}
                        {albumVisibility === "followers" && (
                          <>
                            <FaUsers className="mr-1" />
                            Seguidores
                          </>
                        )}
                        {albumVisibility === "private" && (
                          <>
                            <FaLock className="mr-1" />
                            Privado
                          </>
                        )}
                      </span>
                    </div>
                    {tags.length > 0 && (
                      <div>
                        <span className="text-gray-400 block mb-2">Tags:</span>
                        <div className="flex flex-wrap gap-1">
                          {tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="bg-indigo-900/50 text-indigo-200 px-2 py-1 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                          {tags.length > 3 && (
                            <span className="text-gray-400 text-xs">
                              +{tags.length - 3} mais
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Formulário */}
              <div className="lg:col-span-2">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-900/30 border border-red-500 p-4 rounded-lg mb-6 text-red-200"
                  >
                    <div className="flex items-center">
                      <FaInfoCircle className="mr-2" />
                      {error}
                    </div>
                  </motion.div>
                )}

                <div className="space-y-6">
                  {/* Título */}
                  <div>
                    <label className="block text-gray-300 mb-2 font-medium flex items-center">
                      <FaMusic className="mr-2 text-indigo-400" />
                      Título do Álbum *
                    </label>
                    <input
                      type="text"
                      value={albumTitle}
                      onChange={(e) => setAlbumTitle(e.target.value)}
                      className="w-full bg-gray-700/50 text-white rounded-lg px-4 py-3 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="Digite o título do álbum"
                      required
                    />
                  </div>

                  {/* Descrição */}
                  <div>
                    <label className="block text-gray-300 mb-2 font-medium flex items-center">
                      <FaInfoCircle className="mr-2 text-indigo-400" />
                      Descrição
                    </label>
                    <textarea
                      value={albumDescription}
                      onChange={(e) => setAlbumDescription(e.target.value)}
                      className="w-full bg-gray-700/50 text-white rounded-lg px-4 py-3 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                      placeholder="Conte a história por trás do seu álbum..."
                      rows={4}
                    />
                  </div>

                  {/* Gênero e Data */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 mb-2 font-medium flex items-center">
                        <FaTag className="mr-2 text-indigo-400" />
                        Gênero
                      </label>
                      <select
                        value={albumGenre}
                        onChange={(e) => setAlbumGenre(e.target.value)}
                        className="w-full bg-gray-700/50 text-white rounded-lg px-4 py-3 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      >
                        <option value="">Selecione um gênero</option>
                        <option value="afrobeat">Afrobeat</option>
                        <option value="pop">Pop</option>
                        <option value="rock">Rock</option>
                        <option value="hiphop">Hip Hop</option>
                        <option value="rnb">R&B</option>
                        <option value="kizomba">Kizomba</option>
                        <option value="jazz">Jazz</option>
                        <option value="electronic">Eletrônica</option>
                        <option value="classical">Clássica</option>
                        <option value="reggae">Reggae</option>
                        <option value="amapiano">Amapiano</option>
                        <option value="other">Outro</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-300 mb-2 font-medium flex items-center">
                        <FaCalendarAlt className="mr-2 text-indigo-400" />
                        Data de Lançamento
                      </label>
                      <input
                        type="date"
                        value={releaseDate}
                        onChange={(e) => setReleaseDate(e.target.value)}
                        className="w-full bg-gray-700/50 text-white rounded-lg px-4 py-3 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* Visibilidade */}
                  <div>
                    <label className="block text-gray-300 mb-3 font-medium flex items-center">
                      <FaEye className="mr-2 text-indigo-400" />
                      Visibilidade
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <motion.label
                        whileHover={{ scale: 1.02 }}
                        className={`flex items-center cursor-pointer p-4 rounded-lg border-2 transition-all ${
                          albumVisibility === "public"
                            ? "border-indigo-500 bg-indigo-900/20"
                            : "border-gray-600 hover:border-gray-500"
                        }`}
                      >
                        <input
                          type="radio"
                          name="visibility"
                          value="public"
                          checked={albumVisibility === "public"}
                          onChange={() => setAlbumVisibility("public")}
                          className="sr-only"
                        />
                        <FaGlobe className="mr-3 text-indigo-400" />
                        <div>
                          <div className="font-medium">Público</div>
                          <div className="text-sm text-gray-400">
                            Todos podem ver
                          </div>
                        </div>
                      </motion.label>

                      <motion.label
                        whileHover={{ scale: 1.02 }}
                        className={`flex items-center cursor-pointer p-4 rounded-lg border-2 transition-all ${
                          albumVisibility === "followers"
                            ? "border-indigo-500 bg-indigo-900/20"
                            : "border-gray-600 hover:border-gray-500"
                        }`}
                      >
                        <input
                          type="radio"
                          name="visibility"
                          value="followers"
                          checked={albumVisibility === "followers"}
                          onChange={() => setAlbumVisibility("followers")}
                          className="sr-only"
                        />
                        <FaUsers className="mr-3 text-indigo-400" />
                        <div>
                          <div className="font-medium">Seguidores</div>
                          <div className="text-sm text-gray-400">
                            Apenas seguidores
                          </div>
                        </div>
                      </motion.label>

                      <motion.label
                        whileHover={{ scale: 1.02 }}
                        className={`flex items-center cursor-pointer p-4 rounded-lg border-2 transition-all ${
                          albumVisibility === "private"
                            ? "border-indigo-500 bg-indigo-900/20"
                            : "border-gray-600 hover:border-gray-500"
                        }`}
                      >
                        <input
                          type="radio"
                          name="visibility"
                          value="private"
                          checked={albumVisibility === "private"}
                          onChange={() => setAlbumVisibility("private")}
                          className="sr-only"
                        />
                        <FaLock className="mr-3 text-indigo-400" />
                        <div>
                          <div className="font-medium">Privado</div>
                          <div className="text-sm text-gray-400">
                            Apenas você
                          </div>
                        </div>
                      </motion.label>
                    </div>
                  </div>

                  {/* Checkbox Explícito */}
                  <div>
                    <motion.label
                      whileHover={{ scale: 1.02 }}
                      className={`flex items-center cursor-pointer p-4 rounded-lg border-2 transition-all ${
                        isExplicit
                          ? "border-yellow-500 bg-yellow-900/20"
                          : "border-gray-600 hover:border-gray-500"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isExplicit}
                        onChange={(e) => setIsExplicit(e.target.checked)}
                        className="sr-only"
                      />
                      <div
                        className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${
                          isExplicit
                            ? "border-yellow-500 bg-yellow-500"
                            : "border-gray-600"
                        }`}
                      >
                        {isExplicit && (
                          <FaTimes className="text-black text-xs" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">Conteúdo Explícito</div>
                        <div className="text-sm text-gray-400">
                          Marque se o álbum contém linguagem explícita
                        </div>
                      </div>
                    </motion.label>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-gray-300 mb-3 font-medium flex items-center">
                      <FaTag className="mr-2 text-indigo-400" />
                      Tags (máximo 10)
                    </label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(), handleAddTag())
                        }
                        className="flex-1 bg-gray-700/50 text-white rounded-lg px-4 py-3 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="Digite uma tag e pressione Enter"
                        disabled={tags.length >= 10}
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAddTag}
                        disabled={tags.length >= 10 || !tagInput.trim()}
                        className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                          tags.length >= 10 || !tagInput.trim()
                            ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                            : "bg-indigo-600 hover:bg-indigo-500 text-white"
                        }`}
                      >
                        <FaPlus />
                      </motion.button>
                    </div>

                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag, index) => (
                          <motion.div
                            key={tag}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="bg-indigo-900/50 border border-indigo-700 text-indigo-200 rounded-full px-3 py-1 text-sm flex items-center"
                          >
                            {tag}
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleRemoveTag(tag)}
                              className="ml-2 text-indigo-300 hover:text-white transition-colors"
                            >
                              <FaTimes size={12} />
                            </motion.button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                    <p className="text-gray-500 text-sm mt-2">
                      As tags ajudam outros usuários a descobrir seu álbum (
                      {tags.length}/10)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navegação */}
            <div className="flex justify-between items-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={handleBackToTracks}
                className="flex items-center py-3 px-6 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors font-medium"
              >
                <FaArrowLeft className="mr-2" />
                Voltar
              </motion.button>

              <div className="text-center">
                <div className="grid grid-cols-3 gap-4 text-sm text-gray-400">
                  <div className="text-center opacity-50">
                    <div className="text-lg font-bold">1</div>
                    <div>Capa</div>
                  </div>
                  <div className="text-center opacity-50">
                    <div className="text-lg font-bold">2</div>
                    <div>Faixas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-indigo-400">3</div>
                    <div className="text-indigo-400">Detalhes</div>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStartUpload}
                disabled={!albumTitle.trim()}
                className={`flex items-center py-3 px-6 rounded-lg transition-colors font-medium ${
                  !albumTitle.trim()
                    ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg"
                }`}
              >
                <FaCloudUploadAlt className="mr-2" />
                Publicar Álbum
              </motion.button>
            </div>
          </motion.div>
        );

      case "uploading":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto p-8 bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700"
          >
            <div className="text-center mb-8">
              <motion.div
                animate={{
                  rotate: 360,
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity },
                }}
                className="inline-block p-6 bg-indigo-600/20 rounded-full mb-6"
              >
                <FaCloudUploadAlt className="text-5xl text-indigo-400" />
              </motion.div>
              <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Enviando Álbum
              </h1>
              <p className="text-gray-300 mb-2 text-lg">
                Enviando "{albumTitle}"
              </p>
              <p className="text-gray-400 text-sm">
                Isso pode levar alguns minutos, dependendo do tamanho dos
                arquivos.
              </p>
            </div>

            {/* Barra de progresso melhorada */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Progresso do upload</span>
                <span>{uploadProgress.toFixed(0)}% concluído</span>
              </div>
              <div className="relative w-full h-4 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 rounded-full relative"
                >
                  <motion.div
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  />
                </motion.div>
              </div>
            </div>

            {/* Informações do upload */}
            <div className="bg-gray-700/40 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Faixas:</span>
                  <span className="text-white font-medium">
                    {trackFiles.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tamanho total:</span>
                  <span className="text-white font-medium">
                    {(
                      trackFiles.reduce((acc, file) => acc + file.size, 0) /
                      (1024 * 1024)
                    ).toFixed(1)}{" "}
                    MB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Gênero:</span>
                  <span className="text-white font-medium">
                    {albumGenre || "Não definido"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Visibilidade:</span>
                  <span className="text-white font-medium capitalize">
                    {albumVisibility}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-gray-400 text-sm">
                Por favor, não feche esta janela durante o upload
              </p>
            </div>
          </motion.div>
        );

      case "success":
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-3xl mx-auto p-8 bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-block p-6 bg-green-500/20 rounded-full mb-6"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <FaCloudUploadAlt className="text-5xl text-green-400" />
                </motion.div>
              </motion.div>
              <h1 className="text-3xl font-bold mb-4 text-green-500">
                Upload Concluído!
              </h1>
              <p className="text-gray-300 text-lg">
                Seu álbum foi publicado com sucesso
              </p>
            </div>

            <div className="text-center mb-8">
              {coverArtPreview && (
                <div className="w-48 h-48 mx-auto mb-6 relative rounded-xl overflow-hidden shadow-2xl">
                  <Image
                    src={coverArtPreview}
                    alt="Capa do álbum"
                    fill
                    style={{ objectFit: "cover" }}
                    className="rounded-xl"
                  />
                </div>
              )}

              <h2 className="text-2xl font-bold text-white mb-2">
                {albumTitle}
              </h2>
              <p className="text-gray-400 mb-4">
                {trackFiles.length} faixa{trackFiles.length !== 1 ? "s" : ""} •{" "}
                {albumGenre}
              </p>

              {tags.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  {tags.slice(0, 5).map((tag) => (
                    <span
                      key={tag}
                      className="bg-indigo-900/50 text-indigo-200 px-3 py-1 rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col space-y-4">
              <motion.div whileHover={{ scale: 1.02 }}>
                <Link
                  href={`/artist/albums/${uploadResult?.albumId}`}
                  className="block w-full py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-lg text-white transition-colors text-center font-medium"
                >
                  Ver Álbum Publicado
                </Link>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={handleReset}
                className="w-full py-3 px-6 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors font-medium"
              >
                Enviar Outro Álbum
              </motion.button>
            </div>
          </motion.div>
        );

      case "error":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto p-8 bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700"
          >
            <div className="text-center mb-8">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, -5, 5, 0],
                }}
                transition={{ duration: 0.5, repeat: 3 }}
                className="inline-block p-6 bg-red-500/20 rounded-full mb-6"
              >
                <FaTimes className="text-5xl text-red-400" />
              </motion.div>
              <h1 className="text-3xl font-bold mb-4 text-red-500">
                Erro no Upload
              </h1>
              <p className="text-gray-300">
                Ocorreu um problema durante o envio do seu álbum
              </p>
            </div>

            <div className="bg-red-900/30 border border-red-500 p-6 rounded-lg mb-8 text-red-200">
              <div className="flex items-start">
                <FaInfoCircle className="mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-medium mb-2">Detalhes do erro:</h3>
                  <p className="text-sm">
                    {error ||
                      "Ocorreu um erro desconhecido ao fazer o upload do álbum. Por favor, tente novamente."}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => setUploadStep("details")}
                className="flex-1 py-3 px-6 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white transition-colors font-medium"
              >
                Tentar Novamente
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={handleReset}
                className="flex-1 py-3 px-6 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors font-medium"
              >
                Recomeçar
              </motion.button>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-indigo-900 text-white py-8">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute top-1/2 -left-32 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute -bottom-32 right-1/4 w-96 h-96 rounded-full bg-indigo-500/5 blur-3xl" />
      </div>

      <div className="relative z-10">{renderContent()}</div>
    </div>
  );
}
