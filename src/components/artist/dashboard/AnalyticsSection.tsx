'use client';

import React, { useEffect, useState } from 'react';
import { BarChart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getSupabaseBrowserClient } from '@/utils/supabaseClient';

const AnalyticsSection: React.FC = () => {
  const { user, loading: authLoading, isArtist } = useAuth();
  const [loading, setLoading] = useState(true);
  const [platformRevenue, setPlatformRevenue] = useState<number>(0);
  const [donationsTotal, setDonationsTotal] = useState<number>(0);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !isArtist) {
      setLoading(false);
      return;
    }

    const uid = user.id; // safe after null-check

    async function fetchRevenue() {
      try {
        const supabase = getSupabaseBrowserClient();
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startIso = startOfMonth.toISOString();

        // Receita da plataforma: revenue_transactions.amount
        const { data: revRows, error: revErr } = await supabase
          .from('revenue_transactions')
          .select('amount')
          .eq('artist_id', uid)
          .gte('created_at', startIso);
        if (revErr) throw revErr;
        const platformSum = revRows?.reduce((s, r) => s + Number(r.amount), 0) ?? 0;

        // Doações: donations.amount
        const { data: donRows, error: donErr } = await supabase
          .from('donations')
          .select('amount')
          .eq('artist_id', uid)
          .gte('created_at', startIso);
        if (donErr) throw donErr;
        const donationRaw = donRows?.reduce((s, r) => s + Number(r.amount), 0) ?? 0;
        const donationNet = donationRaw * 0.85; // após 15% de taxa

        setPlatformRevenue(platformSum);
        setDonationsTotal(donationNet);
      } catch (err) {
        console.error('Erro ao buscar receitas:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchRevenue();
  }, [authLoading, user, isArtist]);

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-MZ', {
      style: 'currency',
      currency: 'MZN',
      minimumFractionDigits: 2,
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !isArtist) {
    return (
      <div className="text-center py-16 text-gray-400">
        Não disponível – apenas para artistas autenticados.
      </div>
    );
  }

  const total = platformRevenue + donationsTotal;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Receita do Mês</h2>
          <p className="text-gray-400 text-lg">Relatório financeiro do mês corrente</p>
        </div>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-lg">
        <h3 className="text-white font-semibold text-lg mb-4 flex items-center">
          <BarChart className="w-6 h-6 mr-3 text-blue-400" />
          Receita do Mês
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-gray-300">
            <thead>
              <tr>
                <th className="py-2 px-4">Fonte</th>
                <th className="py-2 px-4">Valor (MT)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-gray-700/30">
                <td className="py-2 px-4">Receita da Plataforma</td>
                <td className="py-2 px-4">{formatCurrency(platformRevenue)}</td>
              </tr>
              <tr>
                <td className="py-2 px-4">Doações</td>
                <td className="py-2 px-4">{formatCurrency(donationsTotal)}</td>
              </tr>
              <tr className="font-semibold bg-gray-700/30">
                <td className="py-2 px-4">Total</td>
                <td className="py-2 px-4">{formatCurrency(total)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsSection;

