'use client';

import React from 'react';
import { Movement } from '@/types';
import { X, Download, Calendar, DollarSign } from 'lucide-react';

interface ReceiptModalProps {
  movement: Movement | null;
  onClose: () => void;
}

export function ReceiptModal({ movement, onClose }: ReceiptModalProps) {
  if (!movement || !movement.receipt_url) return null;

  const handleDownload = () => {
    if (!movement.receipt_url) return;
    const a = document.createElement('a');
    a.href = movement.receipt_url;
    a.download = `comprobante-${movement.concept.toLowerCase().replace(/\s+/g, '-')}.jpg`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#14171F] border border-gray-800 rounded-3xl p-4 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 px-2 border-b border-gray-800">
          <div>
            <h3 className="text-sm font-bold text-white">{movement.concept}</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {new Date(movement.date).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleDownload}
              className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              title="Descargar comprobante"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image Display */}
        <div className="flex-1 overflow-auto my-3 flex items-center justify-center bg-[#0B0E14] rounded-2xl p-2 border border-gray-800/60">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={movement.receipt_url}
            alt={movement.concept}
            className="max-h-[65vh] w-auto object-contain rounded-xl shadow-md"
          />
        </div>

        {/* Footer Info */}
        <div className="px-2 pt-1 flex items-center justify-between text-xs text-gray-400">
          <span>Monto: <strong className="text-white">${movement.amount.toFixed(2)} USDT</strong></span>
          <span className="capitalize">{movement.type === 'income' ? '🟢 Depósito' : '🔴 Gasto'}</span>
        </div>
      </div>
    </div>
  );
}
