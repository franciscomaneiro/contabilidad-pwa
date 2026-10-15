import { Movement, BalanceSummary } from '@/types';
import { supabase, isSupabaseConfigured } from './supabase';

const LOCAL_STORAGE_KEY = 'binance_account_movements_v1';

export function calculateRunningBalances(movements: Movement[]): Movement[] {
  // Sort chronologically ascending to calculate running balance correctly
  const sorted = [...movements].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let current = 0;
  const withBalances = sorted.map((m) => {
    if (m.type === 'income') {
      current += Number(m.amount);
    } else {
      current -= Number(m.amount);
    }
    return {
      ...m,
      running_balance: Number(current.toFixed(2)),
    };
  });

  // Return newest first for display
  return withBalances.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function computeSummary(movements: Movement[]): BalanceSummary {
  let totalIncome = 0;
  let totalExpenses = 0;

  for (const m of movements) {
    if (m.type === 'income') {
      totalIncome += Number(m.amount);
    } else {
      totalExpenses += Number(m.amount);
    }
  }

  const currentBalance = Number((totalIncome - totalExpenses).toFixed(2));

  return {
    currentBalance,
    totalIncome: Number(totalIncome.toFixed(2)),
    totalExpenses: Number(totalExpenses.toFixed(2)),
    movementsCount: movements.length,
  };
}

// Local Storage helpers
function getLocalMovements(): Movement[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading localStorage:', e);
    return [];
  }
}

function saveLocalMovements(movements: Movement[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(movements));
  } catch (e) {
    console.error('Error saving localStorage:', e);
  }
}

// Unified API for components
export async function getMovements(): Promise<Movement[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('movements')
        .select('*')
        .order('date', { ascending: true });

      if (error) {
        console.warn('Supabase fetch error, fallback to local:', error.message);
        return calculateRunningBalances(getLocalMovements());
      }

      if (data) {
        return calculateRunningBalances(data as Movement[]);
      }
    } catch (err) {
      console.warn('Supabase connection error:', err);
    }
  }

  return calculateRunningBalances(getLocalMovements());
}

export async function addMovement(movement: Omit<Movement, 'id' | 'created_at' | 'running_balance'>): Promise<Movement> {
  const newMovement: Movement = {
    ...movement,
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `m_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('movements')
        .insert([{
          id: newMovement.id,
          type: newMovement.type,
          amount: newMovement.amount,
          concept: newMovement.concept,
          date: newMovement.date,
          receipt_url: newMovement.receipt_url || null,
          notes: newMovement.notes || null,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error inserting to Supabase:', error);
        throw error;
      }

      if (data) {
        // Also keep local copy updated
        const local = getLocalMovements();
        saveLocalMovements([...local, data as Movement]);
        return data as Movement;
      }
    } catch (err) {
      console.warn('Supabase failed, falling back to local save:', err);
    }
  }

  // Fallback to local
  const current = getLocalMovements();
  const updated = [...current, newMovement];
  saveLocalMovements(updated);
  return newMovement;
}

export async function deleteMovement(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('movements').delete().eq('id', id);
      if (error) {
        console.error('Error deleting from Supabase:', error);
      }
    } catch (e) {
      console.error(e);
    }
  }

  const current = getLocalMovements();
  saveLocalMovements(current.filter((m) => m.id !== id));
  return true;
}

// Compress image in browser to keep it lightweight (< 150KB)
export async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Compress as JPEG 0.72 quality
        const dataUrl = canvas.toDataURL('image/jpeg', 0.72);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}
