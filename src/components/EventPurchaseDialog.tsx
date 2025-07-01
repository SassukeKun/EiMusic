"use client";

import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";

interface Props {
  eventId: string;
  eventName: string;
  price: number;
  className?: string;
}

export default function EventPurchaseDialog({ eventId, eventName, price, className = "" }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msisdn, setMsisdn] = useState("");
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  const pollStatus = async (id: string) => {
    try {
      const res = await fetch(`/api/payments/${id}/status`);
      if (res.ok) {
        const { status } = await res.json();
        setStatus(status);
        if (status === "COMPLETED" || status === "FAILED") {
          return true;
        }
      }
    } catch {
      // ignore errors
    }
    return false;
  };

  useEffect(() => {
    if (!paymentId) return;
    const interval = setInterval(async () => {
      const done = await pollStatus(paymentId);
      if (done) clearInterval(interval);
    }, 4000);
    return () => clearInterval(interval);
  }, [paymentId]);

  const initiatePayment = async () => {
    if (!/^\d{8,12}$/.test(msisdn)) {
      alert("Número Mpesa inválido");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: price,
          msisdn,
          sourceType: "event",
          sourceId: eventId,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        setPaymentId(json.paymentId);
        setStatus(json.status);
      } else {
        const { error } = await res.json();
        alert(error || "Falha ao iniciar pagamento");
      }
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (status === "COMPLETED") {
      return <p className="mb-4 text-green-600">Pagamento confirmado! Ingresso disponível.</p>;
    }
    if (status === "FAILED") {
      return <p className="mb-4 text-red-600">Pagamento falhou. Tenta novamente.</p>;
    }
    if (paymentId) {
      return <p className="mb-4">Pagamento pendente… Confirma no teu telemóvel Mpesa.</p>;
    }
    return (
      <div className="mb-4 space-y-3">
        <p>Confirma a compra do ingresso por {price} MT.</p>
        <input
          type="tel"
          placeholder="Seu nº Mpesa"
          value={msisdn}
          onChange={(e) => setMsisdn(e.target.value)}
          className="w-full border px-3 py-2 rounded-md"
        />
      </div>
    );
  };

  const renderActions = () => {
    if (status === "COMPLETED") {
      return (
        <button onClick={close} className="px-3 py-1 rounded-md border">
          Fechar
        </button>
      );
    }
    return (
      <>
        <button onClick={close} className="px-3 py-1 rounded-md border">
          Cancelar
        </button>
        {!paymentId && (
          <button
            disabled={loading}
            onClick={initiatePayment}
            className="bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Processando…" : "Confirmar"}
          </button>
        )}
      </>
    );
  };

  return (
    <>
      <button onClick={open} className={`bg-indigo-600 text-white px-3 py-1 rounded-md ${className}`}>
        Comprar ({price} MT)
      </button>

      <Dialog open={isOpen} onClose={close} className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-black opacity-30" aria-hidden="true" />
        <div className="bg-white rounded-md p-6 z-10 max-w-sm w-full">
          <Dialog.Title className="text-lg font-semibold mb-2">{eventName}</Dialog.Title>

          {renderContent()}

          <div className="flex justify-end gap-2">{renderActions()}</div>
        </div>
      </Dialog>
    </>
  );
}
