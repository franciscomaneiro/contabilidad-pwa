'use client';

import React, { useState, useEffect } from 'react';
import { MovementType } from '@/types';
import { addMovement, compressImage } from '@/lib/storage';
import { X, Camera, ArrowDownLeft, ArrowUpRight, Check, Image as ImageIcon, Loader2 } from 'lucide-react';

interface AddMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialType?: MovementType;
}

const COMMON_CONCEPTS = [
  'Depósito Binance',
  'Supermercado',
  'Farmacia / Salud',
  'Luz / Electricidad',
  'Internet / Servicios',
  'Efectivo entregado',
  'Transferencia bancaria',
  'Reparación / Mantenimiento',
];

export function AddMovementModal({
  isOpen,
  onClose,
  onSaved,
  initialType = 'expense',
}: AddMovementModalProps) {
  const [type, setType] = useState<MovementType>(initialType);
  const [amount, setAmount] = useState<string>('');
  const [concept, setConcept] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [receiptUrl, setReceiptUrl] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setType(initialType);
      setAmount('');
      setConcept(initialType === 'income' ? 'Depósito Binance' : '');
      // Format local datetime for input (YYYY-MM-DDTHH:mm)
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      setDate(now.toISOString().slice(0, 16));
      setReceiptUrl('');
      setNotes('');
      setError('');
    }
  }, [isOpen, initialType]);

  if (!isOpen) return null;

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const compressed = await compressImage(file);
      setReceiptUrl(compressed);
    } catch (err) {
      console.error('Error procesando imagen:', err);
      setError('No se pudo procesar la imagen seleccionada.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const numericAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Por favor ingresa un monto válido mayor a 0.');
      return;
    }

    if (!concept.trim()) {
      setError('El concepto es obligatorio para tener claridad del movimiento.');
      return;
    }

    try {
      setIsLoading(true);
      await addMovement({
        type,
        amount: numericAmount,
        concept: concept.trim(),
        date: new Date(date).toISOString(),
        receipt_url: receiptUrl || undefined,
        notes: notes.trim() || undefined,
      });

      onSaved();
      onClose();
    } catch (err) {
      console.error('Error guardando movimiento:', err);
      setError('Ocurrió un error al registrar el movimiento.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-[#14171F] border border-gray-800 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800/80">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            {type === 'income' ? (
              <span className="flex items-center gap-2 text-emerald-400">
                <ArrowDownLeft className="w-5 h-5" /> Registrar Depósito
              </span>
            ) : (
              <span className="flex items-center gap-2 text-red-400">
                <ArrowUpRight className="w-5 h-5" /> Registrar Gasto
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-[#0B0E14] rounded-xl mt-4 border border-gray-800">
          <button
            type="button"
            onClick={() => {
              setType('expense');
              if (concept === 'Depósito Binance') setConcept('');
            }}
            className={`py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              type === 'expense'
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" /> Gasto (- Saldo)
          </button>
          <button
            type="button"
            onClick={() => {
              setType('income');
              if (!concept) setConcept('Depósito Binance');
            }}
            className={`py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              type === 'income'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" /> Depósito (+ Saldo)
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Monto */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
              Monto (USDT / USD) *
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-2xl font-bold text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#0B0E14] border border-gray-800 rounded-xl text-2xl font-bold text-white focus:outline-none focus:border-[#F0B90B] focus:ring-1 focus:ring-[#F0B90B] transition-all"
                autoFocus
              />
            </div>
          </div>

          {/* Concepto */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
              Concepto (Requerido) *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Pago de farmacia, Compra alimentos..."
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#0B0E14] border border-gray-800 rounded-xl text-white text-sm focus:outline-none focus:border-[#F0B90B] focus:ring-1 focus:ring-[#F0B90B] transition-all"
            />
            {/* Quick concept pills */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {COMMON_CONCEPTS.slice(type === 'income' ? 0 : 1, type === 'income' ? 2 : 7).map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => setConcept(item)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                    concept === item
                      ? 'bg-yellow-500/20 text-[#FCD535] border-yellow-500/40'
                      : 'bg-gray-800/60 text-gray-400 border-gray-700/60 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Fecha y Hora */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
              Fecha y Hora
            </label>
            <input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 bg-[#0B0E14] border border-gray-800 rounded-xl text-white text-sm focus:outline-none focus:border-[#F0B90B] transition-all"
            />
          </div>

          {/* Comprobante / Foto */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
              Comprobante / Captura (Opcional)
            </label>
            {receiptUrl ? (
              <div className="relative mt-1 group rounded-xl overflow-hidden border border-gray-800 w-full h-36 bg-[#0B0E14] flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={receiptUrl}
                  alt="Comprobante"
                  className="max-h-full max-w-full object-contain"
                />
                <button
                  type="button"
                  onClick={() => setReceiptUrl('')}
                  aria-label="Eliminar comprobante"
                  className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-red-600/80 rounded-full text-white backdrop-blur-sm transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl border border-dashed border-gray-700 bg-[#0B0E14] text-gray-400 hover:text-white hover:border-[#F0B90B] transition-all cursor-pointer">
                <Camera className="w-5 h-5 text-[#F0B90B]" />
                <span className="text-xs font-medium">Subir foto o captura del pago</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-xs text-red-400 bg-red-950/30 p-2.5 rounded-lg border border-red-900/50">
              {error}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 shadow-lg ${
              type === 'income'
                ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
                : 'bg-[#F0B90B] hover:bg-[#FCD535] text-black shadow-yellow-500/20'
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Check className="w-5 h-5" />
                Guardar {type === 'income' ? 'Depósito' : 'Gasto'}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
