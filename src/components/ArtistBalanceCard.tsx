"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ArtistBalanceCard() {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchBalance() {
      const res = await fetch("/api/revenue/balance");
      if (res.ok) {
        const { balance } = await res.json();
        setBalance(balance);
      } else {
        setBalance(null);
      }
      setLoading(false);
    }
    fetchBalance();
  }, []);

  const requestPayout = async () => {
    alert("Solicitação de saque enviada. Será processada no ciclo semanal.");
    router.refresh();
  };

  if (loading) return null;
  if (balance === null) return null; // não é artista ou erro

  return (
    <div className="border p-4 rounded-md shadow-sm">
      <h3 className="text-lg font-semibold mb-2">Saldo a receber</h3>
      <p className="text-3xl font-bold mb-4">{balance.toFixed(2)} MT</p>
      <button
        disabled={balance < 100}
        onClick={requestPayout}
        className="bg-indigo-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
      >
        {balance < 100 ? "Mínimo 100 MT" : "Solicitar Saque"}
      </button>
    </div>
  );
}
