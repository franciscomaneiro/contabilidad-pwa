'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Movement, MovementType } from '@/types';
import { getMovements, deleteMovement, computeSummary } from '@/lib/storage';
import { isSupabaseConfigured } from '@/lib/supabase';
import { AddMovementModal } from './AddMovementModal';
import { ReceiptModal } from './ReceiptModal';
import { SettingsModal } from './SettingsModal';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Minus,
  Search,
  Filter,
  Settings,
  Lock,
  Receipt,
  Trash2,
  Cloud,
  Database,
  ExternalLink,
  Calendar,
} from 'lucide-react';

interface DashboardProps {
  onLock: () => void;
}

export function Dashboard({ onLock }: DashboardProps) {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense' | 'receipt'>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [modalInitialType, setModalInitialType] = useState<MovementType>('expense');
  const [viewingReceiptMovement, setViewingReceiptMovement] = useState<Movement | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getMovements();
      setMovements(data);
    } catch (err) {
      console.error('Error fetching movements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const summary = useMemo(() => computeSummary(movements), [movements]);

  const filteredMovements = useMemo(() => {
    return movements.filter((m) => {
      const matchesSearch =
        m.concept.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.notes && m.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (filterType === 'income') return m.type === 'income';
      if (filterType === 'expense') return m.type === 'expense';
      if (filterType === 'receipt') return Boolean(m.receipt_url);

      return true;
    });
  }, [movements, searchQuery, filterType]);

  const handleDelete = async (id: string, concept: string) => {
    if (confirm(`¿Estás seguro de eliminar el movimiento "${concept}"?`)) {
      await deleteMovement(id);
      await loadData();
    }
  };

  const openAddModal = (type: MovementType) => {
    setModalInitialType(type);
    setIsAddModalOpen(true);
  };

  const formatDate = (isoDate: string) => {
    const d = new Date(isoDate);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    
    const timeStr = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    if (isToday) {
      return `Hoy, ${timeStr}`;
    }
    return `${d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}, ${timeStr}`;
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-white pb-24">
      {/* Top Header */}
      <header className="sticky top-0 z-20 bg-[#0B0E14]/90 backdrop-blur-md border-b border-gray-800/80 px-4 py-3 flex items-center justify-between max-w-xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FCD535] to-[#F0B90B] flex items-center justify-center text-black font-extrabold shadow-md shadow-yellow-500/10">
            <Wallet className="w-5 h-5 text-[#0B0E14]" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
              Fondo Binance
              <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-gray-800 text-yellow-400 font-semibold border border-yellow-500/20">
                Papá
              </span>
            </h1>
            <p className="text-[11px] text-gray-400 flex items-center gap-1">
              {isSupabaseConfigured ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Sincronizado
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                  Modo Local
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsSettingsOpen(true)}
            aria-label="Ajustes"
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/80 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={onLock}
            aria-label="Bloquear aplicación"
            className="p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-gray-800/80 transition-colors"
          >
            <Lock className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-xl mx-auto px-4 pt-4 space-y-4">
        {/* Main Balance Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#181C26] via-[#12151D] to-[#0E1017] border border-gray-800 p-6 shadow-xl">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-[#F0B90B]/10 rounded-full blur-2xl pointer-events-none" />

          <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
            Saldo Restante Disponible
          </p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              ${summary.currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-sm font-bold text-[#F0B90B]">USDT</span>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-gray-800/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ArrowDownLeft className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-gray-400">Total Depositado</p>
                <p className="text-xs font-bold text-emerald-400">
                  +${summary.totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-gray-400">Total Gastado</p>
                <p className="text-xs font-bold text-red-400">
                  -${summary.totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => openAddModal('income')}
            className="py-3.5 px-4 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Depósito (+ Saldo)</span>
          </button>
          <button
            onClick={() => openAddModal('expense')}
            className="py-3.5 px-4 rounded-2xl bg-[#F0B90B] hover:bg-[#FCD535] text-black font-extrabold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-md shadow-yellow-500/15"
          >
            <Minus className="w-4 h-4" />
            <span>Gasto (- Saldo)</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="space-y-2 pt-2">
          {/* Search box */}
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5" />
            <input
              type="text"
              placeholder="Buscar por concepto (farmacia, luz...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#14171F] border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#F0B90B] transition-colors"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                filterType === 'all'
                  ? 'bg-white text-black font-semibold'
                  : 'bg-[#14171F] text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              Todos ({movements.length})
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                filterType === 'expense'
                  ? 'bg-red-500/20 text-red-400 font-semibold border border-red-500/30'
                  : 'bg-[#14171F] text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              Solo Gastos
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                filterType === 'income'
                  ? 'bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30'
                  : 'bg-[#14171F] text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              Solo Depósitos
            </button>
            <button
              onClick={() => setFilterType('receipt')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                filterType === 'receipt'
                  ? 'bg-[#F0B90B]/20 text-[#FCD535] font-semibold border border-yellow-500/30'
                  : 'bg-[#14171F] text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              Con Comprobante
            </button>
          </div>
        </div>

        {/* Movements Timeline */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between text-xs text-gray-400 px-1 font-semibold">
            <span>HISTORIAL DE MOVIMIENTOS</span>
            <span>{filteredMovements.length} registro(s)</span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-gray-500">
              Cargando movimientos...
            </div>
          ) : filteredMovements.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-800 p-8 text-center text-gray-500">
              <Receipt className="w-8 h-8 mx-auto text-gray-600 mb-2" />
              <p className="text-xs font-semibold text-gray-400">No hay movimientos todavía</p>
              <p className="text-[11px] text-gray-500 mt-1">
                Registra el primer depósito o gasto con los botones superiores.
              </p>
            </div>
          ) : (
            filteredMovements.map((m) => {
              const isIncome = m.type === 'income';
              return (
                <div
                  key={m.id}
                  className="rounded-2xl bg-[#14171F] border border-gray-800/80 p-3.5 hover:border-gray-700 transition-all flex flex-col gap-2.5"
                >
                  {/* Top row: Icon, Concept, Amount */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isIncome
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                            : 'bg-red-500/15 text-red-400 border border-red-500/20'
                        }`}
                      >
                        {isIncome ? (
                          <ArrowDownLeft className="w-5 h-5" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white leading-tight">
                          {m.concept}
                        </h4>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {formatDate(m.date)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div
                        className={`text-base font-extrabold ${
                          isIncome ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {isIncome ? '+' : '-'}${m.amount.toFixed(2)}
                      </div>
                      {/* Running Balance Pill */}
                      {m.running_balance !== undefined && (
                        <div className="text-[10px] text-gray-400 font-medium">
                          Saldo: <span className="text-gray-200 font-semibold">${m.running_balance.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom row: Receipt link and delete action */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-800/60 text-xs">
                    {m.receipt_url ? (
                      <button
                        onClick={() => setViewingReceiptMovement(m)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-[#F0B90B] hover:text-[#FCD535] bg-[#F0B90B]/10 hover:bg-[#F0B90B]/20 px-2.5 py-1 rounded-lg border border-yellow-500/20 transition-all"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Ver Comprobante</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-gray-600 italic">Sin comprobante</span>
                    )}

                    <button
                      onClick={() => handleDelete(m.id, m.concept)}
                      aria-label="Eliminar movimiento"
                      className="text-gray-500 hover:text-red-400 p-1 rounded-md transition-colors"
                      title="Eliminar este movimiento"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Modals */}
      <AddMovementModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSaved={loadData}
        initialType={modalInitialType}
      />

      <ReceiptModal
        movement={viewingReceiptMovement}
        onClose={() => setViewingReceiptMovement(null)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        movements={movements}
        onLock={onLock}
      />
    </div>
  );
}
