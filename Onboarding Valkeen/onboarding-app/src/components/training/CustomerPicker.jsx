import { useEffect, useState } from 'react';
import { Building2, Plus, Loader2 } from 'lucide-react';
import { listCustomers, saveCustomerIndex, getCustomerIndex } from '../../services/trainingAdminService';
import { newBranding } from '../../data/trainingSchema';

const STORAGE_KEY = 'training-admin-current-customer';

export function useCustomerSelection() {
  const [customers, setCustomers] = useState([]);
  const [currentId, setCurrentId] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) || null; } catch { return null; }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function refresh() {
    setLoading(true);
    try {
      let res;
      try {
        res = await listCustomers();
      } catch (e) {
        if (e?.status === 401 || e?.status === 403) {
          res = await getCustomerIndex();
        } else throw e;
      }
      const list = res?.customers || [];
      setCustomers(list);
      if (!currentId && list.length) {
        setCurrentId(list[0].customerId);
        try { localStorage.setItem(STORAGE_KEY, list[0].customerId); } catch {}
      }
      setError(null);
    } catch (e) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void refresh(); }, []);

  function select(id) {
    setCurrentId(id);
    try { localStorage.setItem(STORAGE_KEY, id); } catch {}
  }

  async function addCustomer({ customerId, customerName, domainHint }) {
    const next = customers.filter((c) => c.customerId !== customerId);
    next.push({ customerId, customerName, domainHint, active: true });
    next.sort((a, b) => (a.customerName || '').localeCompare(b.customerName || ''));
    await saveCustomerIndex({
      schemaVersion: 1,
      updatedAt: new Date().toISOString(),
      customers: next
    });
    setCustomers(next);
    select(customerId);
    return newBranding(customerId, { customerName, domainHint });
  }

  return { customers, currentId, select, addCustomer, refresh, loading, error };
}

export default function CustomerPicker({ customers, currentId, onSelect, onAdd }) {
  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState({ customerId: '', customerName: '', domainHint: '' });
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!draft.customerId || !draft.customerName) return;
    try {
      setBusy(true);
      await onAdd?.(draft);
      setDraft({ customerId: '', customerName: '', domainHint: '' });
      setShowAdd(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-white/80 font-semibold">
          <Building2 className="w-4 h-4 text-indigo-400" />
          Kunde
        </div>
        <button
          onClick={() => setShowAdd((v) => !v)}
          className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/70"
        >
          <Plus className="w-3.5 h-3.5" />
          Neu
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {(customers || []).map((c) => (
          <button
            key={c.customerId}
            onClick={() => onSelect?.(c.customerId)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              currentId === c.customerId
                ? 'bg-indigo-500 text-white'
                : 'bg-white/5 hover:bg-white/10 text-white/70'
            }`}
            title={c.domainHint}
          >
            {c.customerName}
          </button>
        ))}
        {customers?.length === 0 && (
          <span className="text-xs text-white/40">Noch kein Kunde angelegt</span>
        )}
      </div>

      {showAdd && (
        <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-white/10">
          <input
            value={draft.customerId}
            onChange={(e) => setDraft((d) => ({ ...d, customerId: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') }))}
            placeholder="customerId (z.B. knauf)"
            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white"
            required
          />
          <input
            value={draft.customerName}
            onChange={(e) => setDraft((d) => ({ ...d, customerName: e.target.value }))}
            placeholder="Anzeigename (z.B. Knauf)"
            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white"
            required
          />
          <input
            value={draft.domainHint}
            onChange={(e) => setDraft((d) => ({ ...d, domainHint: e.target.value }))}
            placeholder="Tempus-Subdomain (z.B. knauf.prosymmetry.com)"
            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white"
          />
          <div className="sm:col-span-3 flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-sm"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={busy}
              className="px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-sm flex items-center gap-1"
            >
              {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Anlegen
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
