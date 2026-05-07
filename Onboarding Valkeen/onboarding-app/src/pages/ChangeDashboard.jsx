import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Calendar,
  CheckCircle,
  Circle,
  Clock,
  FileText,
  Grid3X3,
  Loader2,
  Megaphone,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';

import '../styles/change-workshop.css';
import { useProgress } from '../hooks/useLocalStorage';
import { KOTTER_CATALOG_ITEMS } from '../data/kotterCatalogData';
import { WORKSHOP_PHASE_CATALOG } from '../data/workshopPhaseCatalog';

const SUPPORT_LEVELS = [
  { value: 'champion', label: 'Champion', color: '#10b981', score: 2 },
  { value: 'supporter', label: 'Unterstützer', color: '#22c55e', score: 1 },
  { value: 'neutral', label: 'Neutral', color: '#94a3b8', score: 0 },
  { value: 'skeptic', label: 'Skeptiker', color: '#f59e0b', score: -1 },
  { value: 'blocker', label: 'Blocker', color: '#ef4444', score: -2 },
];

const INFLUENCE_LEVELS = [
  { value: 'high', label: 'Hoch', score: 3 },
  { value: 'medium', label: 'Mittel', score: 2 },
  { value: 'low', label: 'Niedrig', score: 1 },
];

function ProgressRing({ value, max, size = 80, strokeWidth = 8, color = '#8b5cf6' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = max > 0 ? (value / max) * 100 : 0;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#e2e8f0"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-500"
      />
    </svg>
  );
}

function BarChart({ data, height = 120 }) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex items-end justify-around gap-2" style={{ height }}>
      {data.map((item, i) => {
        const barHeight = (item.value / maxValue) * (height - 20);
        return (
          <div key={i} className="flex flex-col items-center gap-1">
            <span className="text-xs font-medium text-slate-700">{item.value}</span>
            <div
              className="w-8 rounded-t transition-all duration-300"
              style={{ height: barHeight, backgroundColor: item.color }}
              title={`${item.label}: ${item.value}`}
            />
            <span className="text-[10px] text-slate-500 text-center leading-tight">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function HeatmapGrid({ stakeholders }) {
  const grid = useMemo(() => {
    const counts = {};
    INFLUENCE_LEVELS.forEach((inf) => {
      counts[inf.value] = {};
      SUPPORT_LEVELS.forEach((sup) => {
        counts[inf.value][sup.value] = 0;
      });
    });
    stakeholders.forEach((s) => {
      const inf = s.influence || 'medium';
      const sup = s.support || 'neutral';
      if (counts[inf]?.[sup] !== undefined) {
        counts[inf][sup]++;
      }
    });
    return counts;
  }, [stakeholders]);

  const maxCount = useMemo(() => {
    let max = 1;
    Object.values(grid).forEach((row) => {
      Object.values(row).forEach((c) => {
        if (c > max) max = c;
      });
    });
    return max;
  }, [grid]);

  const getHeatColor = (count) => {
    if (count === 0) return 'bg-slate-50';
    const intensity = count / maxCount;
    if (intensity > 0.7) return 'bg-violet-500 text-white';
    if (intensity > 0.4) return 'bg-violet-300';
    return 'bg-violet-100';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr>
            <th className="p-1.5"></th>
            {SUPPORT_LEVELS.map((s) => (
              <th key={s.value} className="p-1.5 text-center font-medium text-slate-600">
                {s.label.slice(0, 3)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {INFLUENCE_LEVELS.map((inf) => (
            <tr key={inf.value}>
              <td className="p-1.5 font-medium text-slate-600">{inf.label}</td>
              {SUPPORT_LEVELS.map((sup) => {
                const count = grid[inf.value]?.[sup.value] || 0;
                const isHighRisk = inf.value === 'high' && (sup.value === 'skeptic' || sup.value === 'blocker');
                return (
                  <td
                    key={sup.value}
                    className={`p-2 text-center border border-slate-200 ${getHeatColor(count)} ${isHighRisk && count > 0 ? 'ring-2 ring-red-400' : ''}`}
                  >
                    {count > 0 ? count : ''}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ActivityLog({ profile }) {
  const activities = useMemo(() => {
    const items = [];

    (profile?.stakeholders || []).forEach((s) => {
      if (s.createdAt) {
        items.push({ type: 'stakeholder_created', label: `Stakeholder "${s.name}" erstellt`, date: s.createdAt });
      }
      (s.supportHistory || []).forEach((h) => {
        const fromL = SUPPORT_LEVELS.find((l) => l.value === h.from);
        const toL = SUPPORT_LEVELS.find((l) => l.value === h.to);
        items.push({
          type: 'sentiment_change',
          label: `${s.name}: ${fromL?.label || h.from} → ${toL?.label || h.to}`,
          date: h.date,
          improved: (toL?.score || 0) > (fromL?.score || 0),
        });
      });
    });

    (profile?.commsPlan || []).forEach((c) => {
      if (c.createdAt) {
        items.push({ type: 'comms_created', label: `Komm.-Maßnahme "${c.title}" erstellt`, date: c.createdAt });
      }
      if (c.status === 'done' && c.updatedAt) {
        items.push({ type: 'comms_done', label: `"${c.title}" abgeschlossen`, date: c.updatedAt });
      }
    });

    Object.entries(profile?.kotterAnswers || {}).forEach(([slug, data]) => {
      if (data._status === 'done' && data._updatedAt) {
        const k = KOTTER_CATALOG_ITEMS.find((i) => i.slug === slug);
        items.push({ type: 'kotter_done', label: `Kotter "${k?.label || slug}" abgeschlossen`, date: data._updatedAt });
      }
    });

    return items.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 15);
  }, [profile]);

  if (activities.length === 0) {
    return <p className="text-sm text-slate-500 italic">Noch keine Aktivitäten erfasst.</p>;
  }

  const iconMap = {
    stakeholder_created: Users,
    sentiment_change: TrendingUp,
    comms_created: Megaphone,
    comms_done: CheckCircle,
    kotter_done: Target,
  };

  return (
    <div className="space-y-2 max-h-[300px] overflow-y-auto">
      {activities.map((a, i) => {
        const Icon = iconMap[a.type] || Activity;
        return (
          <div key={i} className="flex items-start gap-2 text-xs">
            <Icon
              className={`w-4 h-4 shrink-0 mt-0.5 ${
                a.type === 'sentiment_change' && !a.improved ? 'text-red-500' : 'text-violet-500'
              }`}
            />
            <div className="flex-1 min-w-0">
              <p className="text-slate-700 m-0 truncate">{a.label}</p>
              <p className="text-slate-400 m-0">{new Date(a.date).toLocaleString('de-CH')}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ChangeDashboard() {
  const { progress, isLoading } = useProgress();

  const kotter = progress.changeWorkshopKotter || { activeProfileId: null, profiles: {} };
  const { activeProfileId, profiles } = kotter;
  const activeProfile = activeProfileId ? profiles[activeProfileId] : null;

  const stats = useMemo(() => {
    if (!activeProfile) return null;

    const stakeholders = activeProfile.stakeholders || [];
    const commsPlan = activeProfile.commsPlan || [];
    const kotterAnswers = activeProfile.kotterAnswers || {};
    const phaseAnswers = activeProfile.phaseAnswers || {};

    const totalStakeholders = stakeholders.length;
    const criticalStakeholders = stakeholders.filter(
      (s) => s.influence === 'high' && (s.support === 'skeptic' || s.support === 'blocker')
    ).length;
    const championsCount = stakeholders.filter((s) => s.support === 'champion' || s.support === 'supporter').length;

    const totalComms = commsPlan.length;
    const doneComms = commsPlan.filter((c) => c.status === 'done').length;
    const upcomingComms = commsPlan.filter((c) => c.status === 'planned' || c.status === 'in_progress').length;

    const kotterDone = KOTTER_CATALOG_ITEMS.filter((k) => kotterAnswers[k.slug]?._status === 'done').length;
    const phasesDone = WORKSHOP_PHASE_CATALOG.filter((p) => phaseAnswers[p.id]?._status === 'done').length;

    const allActions = [];
    stakeholders.forEach((s) => {
      (s.actions || []).forEach((a) => allActions.push(a));
    });
    const totalActions = allActions.length;
    const doneActions = allActions.filter((a) => a.done).length;

    let riskScore = 0;
    stakeholders.forEach((s) => {
      const inf = INFLUENCE_LEVELS.find((l) => l.value === s.influence)?.score || 2;
      const sup = SUPPORT_LEVELS.find((l) => l.value === s.support)?.score || 0;
      if (sup < 0) riskScore += inf * Math.abs(sup);
    });
    const maxRisk = stakeholders.length * 6;
    const riskPercent = maxRisk > 0 ? Math.round((riskScore / maxRisk) * 100) : 0;

    return {
      totalStakeholders,
      criticalStakeholders,
      championsCount,
      totalComms,
      doneComms,
      upcomingComms,
      kotterDone,
      phasesDone,
      totalActions,
      doneActions,
      riskPercent,
    };
  }, [activeProfile]);

  if (isLoading) {
    return (
      <div className="cw-workshop min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="cw-workshop min-h-screen relative">
      <div className="cw-workshop-page-bg" aria-hidden />
      <div className="cw-workshop-page-overlay" aria-hidden />

      <header className="cw-wh-header border-b border-slate-200/80">
        <div className="cw-container cw-wh-top flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-3">
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/change-workflow" className="cw-btn cw-btn-ghost cw-btn-compact inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" aria-hidden />
              Workshop
            </Link>
            <span className="cw-kicker flex items-center gap-2">
              <BarChart3 className="w-4 h-4" aria-hidden />
              Dashboard
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/change-workflow/journey" className="cw-btn cw-btn-accent-outline cw-btn-compact">
              → Journey
            </Link>
          </div>
        </div>
      </header>

      <main className="cw-container py-8 max-w-6xl space-y-6">
        {!activeProfile ? (
          <div className="cw-card text-center py-8">
            <BarChart3 className="w-10 h-10 mx-auto text-slate-400 mb-4" aria-hidden />
            <p className="text-slate-600">
              Kein Kundenpaket aktiv. Bitte zuerst im{' '}
              <Link to="/change-workflow/kotter/dringlichkeit" className="text-violet-600 underline">Workshop</Link>{' '}
              ein Paket anlegen.
            </p>
          </div>
        ) : (
          <>
            <div className="cw-card bg-gradient-to-br from-violet-50/80 to-white">
              <h1 className="text-xl font-bold text-slate-800 m-0 mb-1">
                {activeProfile.customerLabel || 'Change Dashboard'}
              </h1>
              <p className="text-sm text-slate-600 m-0">Übersicht aller KPIs und Fortschritte</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="cw-card text-center">
                <div className="relative inline-flex items-center justify-center mb-2">
                  <ProgressRing value={stats.kotterDone} max={8} color="#8b5cf6" />
                  <span className="absolute text-lg font-bold text-violet-700">{stats.kotterDone}/8</span>
                </div>
                <p className="text-xs font-semibold text-slate-600 m-0">Kotter-Schritte</p>
              </div>

              <div className="cw-card text-center">
                <div className="relative inline-flex items-center justify-center mb-2">
                  <ProgressRing value={stats.phasesDone} max={8} color="#06b6d4" />
                  <span className="absolute text-lg font-bold text-cyan-700">{stats.phasesDone}/8</span>
                </div>
                <p className="text-xs font-semibold text-slate-600 m-0">Workshop-Phasen</p>
              </div>

              <div className="cw-card text-center">
                <div className="relative inline-flex items-center justify-center mb-2">
                  <ProgressRing value={stats.doneComms} max={stats.totalComms || 1} color="#10b981" />
                  <span className="absolute text-lg font-bold text-emerald-700">{stats.doneComms}/{stats.totalComms}</span>
                </div>
                <p className="text-xs font-semibold text-slate-600 m-0">Komm.-Maßnahmen</p>
              </div>

              <div className="cw-card text-center">
                <div className="relative inline-flex items-center justify-center mb-2">
                  <ProgressRing value={stats.doneActions} max={stats.totalActions || 1} color="#f59e0b" />
                  <span className="absolute text-lg font-bold text-amber-700">{stats.doneActions}/{stats.totalActions}</span>
                </div>
                <p className="text-xs font-semibold text-slate-600 m-0">Stakeholder-Actions</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="cw-card">
                <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-violet-600" />
                  Stakeholder-Verteilung
                </h2>
                <BarChart
                  data={[
                    { label: 'Champion', value: (activeProfile.stakeholders || []).filter((s) => s.support === 'champion').length, color: '#10b981' },
                    { label: 'Support', value: (activeProfile.stakeholders || []).filter((s) => s.support === 'supporter').length, color: '#22c55e' },
                    { label: 'Neutral', value: (activeProfile.stakeholders || []).filter((s) => s.support === 'neutral').length, color: '#94a3b8' },
                    { label: 'Skeptik', value: (activeProfile.stakeholders || []).filter((s) => s.support === 'skeptic').length, color: '#f59e0b' },
                    { label: 'Blocker', value: (activeProfile.stakeholders || []).filter((s) => s.support === 'blocker').length, color: '#ef4444' },
                  ]}
                />
                <div className="mt-4 pt-4 border-t border-slate-200 flex flex-wrap gap-4 text-xs">
                  <span className="text-slate-600">
                    <span className="font-semibold text-slate-800">{stats.totalStakeholders}</span> Stakeholder gesamt
                  </span>
                  <span className="text-emerald-600">
                    <span className="font-semibold">{stats.championsCount}</span> Unterstützer
                  </span>
                  {stats.criticalStakeholders > 0 && (
                    <span className="text-red-600">
                      <AlertTriangle className="w-3 h-3 inline mr-0.5" />
                      <span className="font-semibold">{stats.criticalStakeholders}</span> kritisch
                    </span>
                  )}
                </div>
              </div>

              <div className="cw-card">
                <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Grid3X3 className="w-5 h-5 text-violet-600" />
                  Stakeholder-Heatmap
                </h2>
                <HeatmapGrid stakeholders={activeProfile.stakeholders || []} />
                <p className="text-[10px] text-slate-500 mt-3">
                  Rot umrandet = kritische Zone (hoher Einfluss + negative Haltung)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="cw-card">
                <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-violet-600" />
                  Risiko-Übersicht
                </h2>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">Risiko-Score</span>
                      <span className={`font-bold ${stats.riskPercent > 40 ? 'text-red-600' : stats.riskPercent > 20 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {stats.riskPercent}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          stats.riskPercent > 40 ? 'bg-red-500' : stats.riskPercent > 20 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(stats.riskPercent, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="p-2 rounded-lg bg-emerald-50">
                    <p className="font-bold text-emerald-700 m-0">{stats.championsCount}</p>
                    <p className="text-emerald-600 m-0">Unterstützer</p>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50">
                    <p className="font-bold text-slate-700 m-0">{stats.upcomingComms}</p>
                    <p className="text-slate-600 m-0">Offene Komm.</p>
                  </div>
                  <div className="p-2 rounded-lg bg-red-50">
                    <p className="font-bold text-red-700 m-0">{stats.criticalStakeholders}</p>
                    <p className="text-red-600 m-0">Kritische SH</p>
                  </div>
                </div>
              </div>

              <div className="cw-card">
                <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-violet-600" />
                  Aktivitätsprotokoll
                </h2>
                <ActivityLog profile={activeProfile} />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Link to="/change-workflow/stakeholders" className="cw-card no-underline hover:border-violet-300 transition-all">
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-violet-500" />
                  <div>
                    <p className="text-lg font-bold text-slate-800 m-0">{stats.totalStakeholders}</p>
                    <p className="text-xs text-slate-600 m-0">Stakeholder</p>
                  </div>
                </div>
              </Link>
              <Link to="/change-workflow/comms-plan" className="cw-card no-underline hover:border-violet-300 transition-all">
                <div className="flex items-center gap-3">
                  <Megaphone className="w-8 h-8 text-emerald-500" />
                  <div>
                    <p className="text-lg font-bold text-slate-800 m-0">{stats.totalComms}</p>
                    <p className="text-xs text-slate-600 m-0">Komm.-Plan</p>
                  </div>
                </div>
              </Link>
              <Link to="/change-workflow/journey" className="cw-card no-underline hover:border-violet-300 transition-all">
                <div className="flex items-center gap-3">
                  <Target className="w-8 h-8 text-cyan-500" />
                  <div>
                    <p className="text-lg font-bold text-slate-800 m-0">{stats.kotterDone}/8</p>
                    <p className="text-xs text-slate-600 m-0">Kotter-Status</p>
                  </div>
                </div>
              </Link>
              <Link to="/change-workflow/tools" className="cw-card no-underline hover:border-violet-300 transition-all">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-amber-500" />
                  <div>
                    <p className="text-lg font-bold text-slate-800 m-0">{stats.totalActions}</p>
                    <p className="text-xs text-slate-600 m-0">Actions</p>
                  </div>
                </div>
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
