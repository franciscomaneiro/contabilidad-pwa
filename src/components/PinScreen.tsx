'use client';

import React, { useState } from 'react';
import { verifyPin, saveAuthSession } from '@/lib/auth';
import { ShieldCheck, Delete, KeyRound, AlertCircle } from 'lucide-react';

interface PinScreenProps {
  onSuccess: () => void;
}

export function PinScreen({ onSuccess }: PinScreenProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [remember, setRemember] = useState(true);

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(false);

      if (nextPin.length === 4) {
        if (verifyPin(nextPin)) {
          saveAuthSession(remember);
          onSuccess();
        } else {
          setError(true);
          // Haptic vibration on mobile if supported
          if (typeof window !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate(200);
          }
          setTimeout(() => {
            setPin('');
          }, 400);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  const handleClear = () => {
    setPin('');
    setError(false);
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-white flex flex-col justify-between items-center px-6 py-10 max-w-md mx-auto select-none">
      {/* Top Header */}
      <div className="flex flex-col items-center mt-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FCD535] to-[#F0B90B] flex items-center justify-center shadow-lg shadow-yellow-500/10 mb-4">
          <KeyRound className="w-8 h-8 text-[#0B0E14]" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Contabilidad Binance</h1>
        <p className="text-sm text-gray-400 mt-1">Ingresa el PIN de 4 dígitos</p>

        {/* PIN Indicators */}
        <div className={`flex items-center gap-4 mt-8 transition-transform duration-200 ${error ? 'animate-bounce' : ''}`}>
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pin.length > index;
            return (
              <div
                key={index}
                className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                  error
                    ? 'border-red-500 bg-red-500/50'
                    : isFilled
                    ? 'border-[#F0B90B] bg-[#F0B90B] scale-110 shadow-sm shadow-yellow-500/50'
                    : 'border-gray-600 bg-transparent'
                }`}
              />
            );
          })}
        </div>

        {error && (
          <div className="flex items-center gap-1.5 text-xs text-red-400 mt-3">
            <AlertCircle className="w-4 h-4" />
            <span>PIN incorrecto. Intenta de nuevo.</span>
          </div>
        )}
      </div>

      {/* Numeric Keypad */}
      <div className="w-full max-w-xs my-6">
        <div className="grid grid-cols-3 gap-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleDigit(num)}
              className="w-full h-16 rounded-2xl bg-[#181A20] hover:bg-[#23272F] active:scale-95 text-xl font-semibold text-white transition-all duration-150 flex items-center justify-center border border-gray-800/80 shadow-sm"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="w-full h-16 rounded-2xl bg-transparent hover:bg-gray-800/40 active:scale-95 text-xs font-medium text-gray-400 transition-all flex items-center justify-center"
          >
            Limpiar
          </button>
          <button
            onClick={() => handleDigit('0')}
            className="w-full h-16 rounded-2xl bg-[#181A20] hover:bg-[#23272F] active:scale-95 text-xl font-semibold text-white transition-all duration-150 flex items-center justify-center border border-gray-800/80 shadow-sm"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            aria-label="Borrar"
            className="w-full h-16 rounded-2xl bg-[#181A20] hover:bg-[#23272F] active:scale-95 text-gray-300 transition-all flex items-center justify-center border border-gray-800/80"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>

        {/* Remember device toggle */}
        <label className="flex items-center justify-center gap-2 mt-6 cursor-pointer text-xs text-gray-400 hover:text-gray-300">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="w-4 h-4 rounded bg-gray-800 border-gray-700 text-[#F0B90B] focus:ring-0 focus:ring-offset-0"
          />
          <span>Mantener sesión iniciada (30 días)</span>
        </label>
      </div>

      {/* Footer Info */}
      <div className="text-center text-xs text-gray-500 pb-2">
        <p>🔒 PIN inicial: <span className="text-gray-400 font-mono font-bold">1234</span></p>
      </div>
    </div>
  );
}
