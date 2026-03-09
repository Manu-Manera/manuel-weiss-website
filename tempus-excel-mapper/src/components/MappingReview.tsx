import { useState } from 'react';
import { useAppStore, type MappingStatus, type FieldMapping, type EntityMapping } from '../store';
import * as api from '../api';
import {
  GitMerge, Check, X, AlertTriangle, ArrowRight, ArrowLeft, Loader2,
  Filter, CheckCircle, XCircle, HelpCircle, PlusCircle, ChevronDown, ChevronUp, Sparkles,
} from 'lucide-react';

type Tab = 'fields' | 'entities' | 'new';

const STATUS_CONFIG: Record<MappingStatus, { label: string; color: string; icon: typeof Check }> = {
  suggested: { label: 'Vorschlag', color: 'bg-blue-100 text-blue-700', icon: Sparkles },
  confirmed: { label: 'Bestätigt', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  rejected: { label: 'Abgelehnt', color: 'bg-red-100 text-red-700', icon: XCircle },
  needs_review: { label: 'Prüfen', color: 'bg-amber-100 text-amber-700', icon: AlertTriangle },
  create_new: { label: 'Neu anlegen', color: 'bg-purple-100 text-purple-700', icon: PlusCircle },
};

export default function MappingReview() {
  const store = useAppStore();
  const [activeTab, setActiveTab] = useState<Tab>('fields');
  const [filterStatus, setFilterStatus] = useState<MappingStatus | 'all'>('all');
  const [filterSheet, setFilterSheet] = useState<string>('all');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const mappingResult = store.mappingResult;
  const sessionId = store.sessionId;

  if (!mappingResult) {
    return <div className="text-center text-gray-500 py-12">Keine Mappings vorhanden</div>;
  }

  const allSheets = [...new Set([
    ...mappingResult.fieldMappings.map(fm => fm.sourceSheet),
    ...mappingResult.entityMappings.map(em => em.sourceSheet),
  ])];

  const newEntities = mappingResult.entityMappings.filter(em => em.isNew);

  const filteredFieldMappings = mappingResult.fieldMappings.filter(fm => {
    if (filterStatus !== 'all' && fm.status !== filterStatus) return false;
    if (filterSheet !== 'all' && fm.sourceSheet !== filterSheet) return false;
    return true;
  });

  const filteredEntityMappings = mappingResult.entityMappings.filter(em => {
    if (activeTab === 'new' && !em.isNew) return false;
    if (filterStatus !== 'all' && em.status !== filterStatus) return false;
    if (filterSheet !== 'all' && em.sourceSheet !== filterSheet) return false;
    return true;
  });

  const handleUpdateMapping = async (mappingId: string, status: MappingStatus, isField: boolean) => {
    if (!sessionId) return;
    try {
      await api.updateMapping(sessionId, mappingId, { status });
      if (isField) {
        store.updateFieldMapping(mappingId, status);
      } else {
        store.updateEntityMapping(mappingId, status);
      }
    } catch (err: unknown) {
      store.setError(err instanceof Error ? err.message : 'Update fehlgeschlagen');
    }
  };

  const handleBulkAction = async (action: 'confirm_all' | 'confirm_suggested' | 'reject_all') => {
    if (!sessionId) return;
    setBulkLoading(true);
    try {
      const filter = filterSheet !== 'all' ? { sheet: filterSheet } : undefined;
      const result = await api.bulkMappingAction(sessionId, action, filter);

      // Refresh mappings from server
      const fresh = await api.generateMappings(sessionId);
      store.setMappingResult(fresh as any);
    } catch (err: unknown) {
      store.setError(err instanceof Error ? err.message : 'Bulk-Aktion fehlgeschlagen');
    } finally {
      setBulkLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    const next = new Set(expandedRows);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpandedRows(next);
  };

  const handleProceed = () => {
    store.setStep(4);
  };

  const ConfidenceBar = ({ value }: { value: number }) => (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${
            value >= 0.8 ? 'bg-green-500' : value >= 0.5 ? 'bg-amber-500' : 'bg-red-500'
          }`}
          style={{ width: `${value * 100}%` }}
        />
      </div>
      <span className="text-xs text-gray-500 w-8">{Math.round(value * 100)}%</span>
    </div>
  );

  const StatusBadge = ({ status }: { status: MappingStatus }) => {
    const cfg = STATUS_CONFIG[status];
    const Icon = cfg.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
        <Icon className="w-3 h-3" /> {cfg.label}
      </span>
    );
  };

  const ActionButtons = ({ id, status, isField }: { id: string; status: MappingStatus; isField: boolean }) => (
    <div className="flex items-center gap-1">
      {status !== 'confirmed' && (
        <button
          onClick={() => handleUpdateMapping(id, 'confirmed', isField)}
          className="p-1 rounded hover:bg-green-100 text-green-600"
          title="Bestätigen"
        >
          <Check className="w-4 h-4" />
        </button>
      )}
      {status !== 'rejected' && (
        <button
          onClick={() => handleUpdateMapping(id, 'rejected', isField)}
          className="p-1 rounded hover:bg-red-100 text-red-600"
          title="Ablehnen"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <GitMerge className="w-7 h-7 text-primary-600" />
          Mapping Review
        </h2>
        <p className="mt-2 text-gray-600">
          Überprüfe und bestätige die Zuordnungsvorschläge. Du kannst jeden Vorschlag einzeln oder gesammelt bearbeiten.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <SummaryCard label="Felder gemappt" value={mappingResult.summary.mappedFields} color="text-blue-600" />
        <SummaryCard label="Entitäten erkannt" value={mappingResult.summary.matchedEntities} color="text-green-600" />
        <SummaryCard label="Neue Elemente" value={mappingResult.summary.newEntities} color="text-purple-600" />
        <SummaryCard label="Konflikte" value={mappingResult.summary.conflicts} color="text-amber-600" />
        <SummaryCard label="Nicht zugeordnet" value={mappingResult.unmappedColumns.length} color="text-gray-500" />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 flex gap-6">
        {([
          { key: 'fields' as Tab, label: 'Feld-Zuordnungen', count: mappingResult.fieldMappings.length },
          { key: 'entities' as Tab, label: 'Entitäts-Matches', count: mappingResult.entityMappings.length },
          { key: 'new' as Tab, label: 'Neue Elemente', count: newEntities.length },
        ]).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Filters & Bulk Actions */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5"
          >
            <option value="all">Alle Status</option>
            <option value="suggested">Vorschläge</option>
            <option value="confirmed">Bestätigt</option>
            <option value="rejected">Abgelehnt</option>
            <option value="needs_review">Zu prüfen</option>
            <option value="create_new">Neu anzulegen</option>
          </select>
          <select
            value={filterSheet}
            onChange={(e) => setFilterSheet(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5"
          >
            <option value="all">Alle Sheets</option>
            {allSheets.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleBulkAction('confirm_suggested')}
            disabled={bulkLoading}
            className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 disabled:opacity-50 flex items-center gap-1"
          >
            {bulkLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
            Vorschläge übernehmen
          </button>
          <button
            onClick={() => handleBulkAction('confirm_all')}
            disabled={bulkLoading}
            className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 disabled:opacity-50"
          >
            Alle bestätigen
          </button>
        </div>
      </div>

      {/* Field Mappings Table */}
      {activeTab === 'fields' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Quelle</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">→</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Ziel (Tempus)</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Match</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Confidence</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Aktion</th>
              </tr>
            </thead>
            <tbody>
              {filteredFieldMappings.map(fm => (
                <tr key={fm.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="text-gray-500 text-xs">{fm.sourceSheet}.</span>
                    <span className="font-medium">{fm.sourceColumn}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">→</td>
                  <td className="px-4 py-3 font-medium text-primary-700">{fm.targetEntity}.{fm.targetField}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      fm.matchType === 'exact' ? 'bg-green-100 text-green-700' :
                      fm.matchType === 'fuzzy' ? 'bg-amber-100 text-amber-700' :
                      fm.matchType === 'ai_suggested' ? 'bg-purple-100 text-purple-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {fm.matchType}
                    </span>
                  </td>
                  <td className="px-4 py-3"><ConfidenceBar value={fm.confidence} /></td>
                  <td className="px-4 py-3"><StatusBadge status={fm.status} /></td>
                  <td className="px-4 py-3 text-right"><ActionButtons id={fm.id} status={fm.status} isField={true} /></td>
                </tr>
              ))}
              {filteredFieldMappings.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Keine Ergebnisse</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Entity Mappings Table */}
      {(activeTab === 'entities' || activeTab === 'new') && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Quellwert</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Entität</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Tempus-Match</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Confidence</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Aktion</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntityMappings.map(em => (
                <>
                  <tr
                    key={em.id}
                    className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
                    onClick={() => toggleExpand(em.id)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {expandedRows.has(em.id) ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        <span className="font-medium">{em.sourceValue}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{em.targetEntity}</td>
                    <td className="px-4 py-3">
                      {em.isNew ? (
                        <span className="text-purple-600 flex items-center gap-1">
                          <PlusCircle className="w-3 h-3" /> Neu anlegen
                        </span>
                      ) : (
                        <span className="text-green-700">
                          {em.matchedName} {em.matchedId ? `(ID: ${em.matchedId})` : ''}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3"><ConfidenceBar value={em.confidence} /></td>
                    <td className="px-4 py-3"><StatusBadge status={em.status} /></td>
                    <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                      <ActionButtons id={em.id} status={em.status} isField={false} />
                    </td>
                  </tr>
                  {expandedRows.has(em.id) && (
                    <tr key={`${em.id}-detail`} className="bg-gray-50">
                      <td colSpan={6} className="px-8 py-3">
                        <p className="text-sm text-gray-600">
                          <strong>Begründung:</strong> {em.reasoning}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Quelle: {em.sourceSheet}.{em.sourceColumn} | Match-Typ: {em.matchType}
                        </p>
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {filteredEntityMappings.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Keine Ergebnisse</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Unmapped Columns */}
      {mappingResult.unmappedColumns.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <h4 className="text-sm font-semibold text-amber-800 flex items-center gap-2 mb-2">
            <HelpCircle className="w-4 h-4" /> Nicht zugeordnete Spalten
          </h4>
          <div className="flex flex-wrap gap-2">
            {mappingResult.unmappedColumns.map(col => (
              <span key={col} className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs">{col}</span>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => store.setStep(2)}
          className="px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Zurück
        </button>

        <button
          onClick={handleProceed}
          className="px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 flex items-center gap-2"
        >
          Zur Validierung
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}
