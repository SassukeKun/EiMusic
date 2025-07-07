import React from 'react';
import { BarChart, LineChart, PieChart, Users, Map, TrendingUp } from 'lucide-react';

const AnalyticsSection = () => (
  <div className="space-y-8">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Análise de Performance</h2>
        <p className="text-gray-400 text-lg">Acompanhe o crescimento e o engajamento do seu público</p>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-lg">
        <h3 className="text-white font-semibold text-lg mb-4 flex items-center">
          <LineChart className="w-6 h-6 mr-3 text-purple-400" />
          Crescimento de Streams (Últimos 30 dias)
        </h3>
        <div className="h-64 bg-gray-700/30 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">[Gráfico de Linha de Streams]</p>
        </div>
      </div>
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-lg">
        <h3 className="text-white font-semibold text-lg mb-4 flex items-center">
          <BarChart className="w-6 h-6 mr-3 text-blue-400" />
          Receita por Mês (Últimos 6 meses)
        </h3>
        <div className="h-64 bg-gray-700/30 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">[Gráfico de Barras de Receita]</p>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-lg">
        <h3 className="text-white font-semibold text-lg mb-4 flex items-center">
          <PieChart className="w-6 h-6 mr-3 text-green-400" />
          Fontes de Streams
        </h3>
        <div className="h-48 bg-gray-700/30 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">[Gráfico de Pizza de Fontes]</p>
        </div>
      </div>
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-lg">
        <h3 className="text-white font-semibold text-lg mb-4 flex items-center">
          <Users className="w-6 h-6 mr-3 text-yellow-400" />
          Demografia do Público
        </h3>
        <div className="h-48 bg-gray-700/30 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">[Dados Demográficos]</p>
        </div>
      </div>
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-lg">
        <h3 className="text-white font-semibold text-lg mb-4 flex items-center">
          <Map className="w-6 h-6 mr-3 text-red-400" />
          Top Cidades
        </h3>
        <div className="h-48 bg-gray-700/30 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">[Mapa de Cidades]</p>
        </div>
      </div>
    </div>
  </div>
);

export default AnalyticsSection;
