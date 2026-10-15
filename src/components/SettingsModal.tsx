'use client';

import React, { useState } from 'react';
import { Movement } from '@/types';
import { isSupabaseConfigured } from '@/lib/supabase';
import { setCustomPin, clearAuthSession } from '@/lib/auth';
import { X, Key, FileSpreadsheet, Lock, Check, Cloud, Database, AlertCircle } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  movements: Movement[];
  onLock: () => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  movements,
  onLock,
}: SettingsModalProps) {
  const [newPin, setNewPin] = useState('');
  const [pinSaved, setPinSaved] = useState(false);
  const [pinError, setPinError] = useState('');

  if (!isOpen) return null;

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{4}$/.test(newPin)) {
      setPinError('El PIN debe tener exactamente 4 números.');
      return;
    }
    setCustomPin(newPin);
    setPinSaved(true);
    setPinError('');
    setTimeout(() => {
      setPinSaved(false);
      setNewPin('');
    }, 2000);
  };

  const handleExportCSV = () => {
    if (movements.length === 0) {
      alert('No hay movimientos registrados para exportar.');
      return;
    }

    const headers = ['Fecha', 'Tipo', 'Concepto', 'Monto (USDT)', 'Saldo Restante (USDT)'];
    const rows = movements.map((m) => [
      `"${new Date(m.date).toLocaleString('es-ES')}"`,
      `"${m.type === 'income' ? 'Depósito' : 'Gasto'}"`,
      `"${m.concept.replace(/"/g, '""')}"`,
      m.amount.toFixed(2),
      m.running_balance !== undefined ? m.running_balance.toFixed(2) : '',
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `contabilidad-binance-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLockNow = () => {
    clearAuthSession();
    onClose();
    onLock();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-[#14171F] border border-gray-800 rounded-3xl p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-800">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            Ajustes & Seguridad
          </h2>
          <button
            onClick={onClose}
            aria-label="Cerrar ajustes"
            className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Change PIN section */}
        <div className="bg-[#0B0E14] border border-gray-800/80 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white mb-2">
            <Key className="w-4 h-4 text-[#F0B90B]" />
            <span>Cambiar PIN de Acceso</span>
          </div>
          <form onSubmit={handleSavePin} className="space-y-3">
            <div className="flex gap-2">
              <input
                type="password"
                maxLength={4}
                pattern="\d{4}"
                placeholder="Nuevo PIN (4 dígitos)"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                className="flex-1 px-3 py-2 bg-[#181A20] border border-gray-700 rounded-xl text-center font-mono text-lg text-white focus:outline-none focus:border-[#F0B90B]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#F0B90B] hover:bg-[#FCD535] text-black font-semibold text-xs rounded-xl transition-all"
              >
                Actualizar
              </button>
            </div>
            {pinSaved && (
              <p className="text-xs text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> PIN actualizado exitosamente
              </p>
            )}
            {pinError && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {pinError}
              </p>
            )}
          </form>
        </div>

        {/* Sync Status */}
        <div className="bg-[#0B0E14] border border-gray-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              {isSupabaseConfigured ? (
                <Cloud className="w-4 h-4 text-emerald-400" />
              ) : (
                <Database className="w-4 h-4 text-yellow-500" />
              )}
              <span>Sincronización en la Nube</span>
            </div>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                isSupabaseConfigured
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
              }`}
            >
              {isSupabaseConfigured ? 'Supabase Activo' : 'Modo Local'}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-2 leading-relaxed">
            {isSupabaseConfigured
              ? 'Tus datos se sincronizan en tiempo real entre todos tus dispositivos mediante Supabase.'
              : 'Los datos se guardan en este dispositivo. Para compartir en vivo entre tu teléfono y el de tu papá, agrega las variables de Supabase en Vercel.'}
          </p>
        </div>

        {/* Export CSV button */}
        <button
          type="button"
          onClick={handleExportCSV}
          className="w-full py-3 px-4 rounded-xl bg-[#181A20] hover:bg-[#20242D] border border-gray-800 text-sm font-medium text-white flex items-center justify-center gap-2 transition-all"
        >
          <FileSpreadsheet className="w-4 h-4 text-[#F0B90B]" />
          <span>Exportar Historial a Excel / CSV</span>
        </button>

        {/* Lock Screen Now */}
        <button
          type="button"
          onClick={handleLockNow}
          className="w-full py-3 px-4 rounded-xl bg-red-950/20 hover:bg-red-950/40 border border-red-900/40 text-sm font-semibold text-red-400 flex items-center justify-center gap-2 transition-all"
        >
          <Lock className="w-4 h-4" />
          <span>Bloquear App Ahora</span>
        </button>
      </div>
    </div>
  );
}
