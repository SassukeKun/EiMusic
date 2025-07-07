import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  trend?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, color, trend }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -4, scale: 1.02 }}
    className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300 shadow-lg"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-400 text-sm mb-2">{title}</p>
        <p className="text-2xl font-bold text-white mb-1">{value}</p>
        {trend && (
          <p className="text-green-400 text-sm flex items-center space-x-1">
            <TrendingUp className="w-3 h-3" />
            <span>{trend}</span>
          </p>
        )}
      </div>
      <div className={`p-4 rounded-xl bg-gradient-to-r ${color} shadow-lg`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
    </div>
  </motion.div>
);

export default StatsCard;
