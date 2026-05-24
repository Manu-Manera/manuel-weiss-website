import { useEffect, useState } from 'react';
import { Activity, Loader2, AlertTriangle, Users, TrendingUp } from 'lucide-react';
import { getProgressAggregate } from '../../services/trainingAdminService';

export default function TrainerDashboard({ customerId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!customerId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    getProgressAggregate(customerId)
      .then((d) => { if (!cancelled) setData(d); })
      .catch((e) => { if (!cancelled) setError(e?.message || String(e)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [customerId]);

  if (!customerId) return <div className="text-white/60">Bitte zuerst Kunde wählen.</div>;

  if (loading) return <div className="text-white/60 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Lade Fortschritte…</div>;

  if (error) {
    return (
      <div className="glass-card p-3 border-red-500/30 bg-red-500/10 text-red-300 text-sm flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 mt-0.5" />
        <span>{error}</span>
      </div>
    );
  }

  const trainees = data?.trainees || [];
  const totalEvents = trainees.reduce((acc, t) => acc + t.tours.reduce((a, x) => a + (x.events || 0), 0), 0);
  const completedTours = trainees.reduce((acc, t) => acc + t.tours.filter((x) => x.status === 'completed').length, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-4">
          <div className="text-xs text-white/50 flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Trainees</div>
          <div className="text-2xl font-bold text-white mt-1">{trainees.length}</div>
        </div>
        <div className="glass-card p-4">
          <div className="text-xs text-white/50 flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> Events insgesamt</div>
          <div className="text-2xl font-bold text-white mt-1">{totalEvents}</div>
        </div>
        <div className="glass-card p-4">
          <div className="text-xs text-white/50 flex items-center gap-1"><Activity className="w-3.5 h-3.5" /> Abgeschlossene Touren</div>
          <div className="text-2xl font-bold text-emerald-300 mt-1">{completedTours}</div>
        </div>
      </div>

      <div className="glass-card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-white/60 text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left px-4 py-2">Trainee</th>
              <th className="text-left px-4 py-2">Tour</th>
              <th className="text-left px-4 py-2">Status</th>
              <th className="text-left px-4 py-2">Events</th>
              <th className="text-left px-4 py-2">Aktualisiert</th>
            </tr>
          </thead>
          <tbody>
            {trainees.flatMap((t) => (t.tours.length ? t.tours : [null]).map((tour, i) => (
              <tr key={`${t.userId}_${i}`} className="border-t border-white/5">
                <td className="px-4 py-2 text-white">{i === 0 ? t.userId : ''}</td>
                <td className="px-4 py-2 text-white/80">{tour?.tourId ?? '—'}</td>
                <td className="px-4 py-2">
                  {tour ? (
                    <span className={`text-xs px-2 py-0.5 rounded-md ${statusClass(tour.status)}`}>
                      {tour.status || tour.lastStatus || '—'}
                    </span>
                  ) : '—'}
                </td>
                <td className="px-4 py-2 text-white/60">{tour?.events ?? '—'}</td>
                <td className="px-4 py-2 text-white/40">{tour?.updatedAt ?? t.updatedAt}</td>
              </tr>
            )))}
            {trainees.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-white/40">Noch keine Fortschritte erfasst.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function statusClass(status) {
  switch (status) {
    case 'completed': return 'bg-emerald-500/15 text-emerald-300';
    case 'in-progress': return 'bg-indigo-500/15 text-indigo-300';
    case 'failed': return 'bg-red-500/15 text-red-300';
    default: return 'bg-white/5 text-white/60';
  }
}
