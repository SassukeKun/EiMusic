import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  content: any;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ show, onClose, onConfirm, content }) => {
  if (!show) return null;

  const contentType = content?.titulo ? 'item' : 'comunidade';
  const contentName = content?.titulo || content?.nome;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: -20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl w-full max-w-md p-8 m-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-500/20 mb-6">
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Confirmar Exclusão</h3>
              <p className="text-gray-400 text-lg mb-1">
                Tens a certeza que queres excluir o {contentType}:
              </p>
              <p className="text-purple-300 font-semibold text-xl mb-6">"{contentName}"?</p>
              <p className="text-gray-500 text-sm mb-8">Esta ação não pode ser desfeita.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={onClose}
                className="w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-xl transition-colors duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirm}
                className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-red-600/40"
              >
                Excluir
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DeleteConfirmModal;
