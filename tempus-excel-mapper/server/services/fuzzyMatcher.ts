import * as fuzzball from 'fuzzball';
import type { TempusData } from '../types.js';

// ── Types ────────────────────────────────────────────────────────────

export interface MatchCandidate {
  id: number;
  name: string;
  entityType: string;
  score: number;
  matchLevel: 'exact' | 'normalized' | 'fuzzy';
}

export interface MatchResult {
  sourceValue: string;
  bestMatch: MatchCandidate | null;
  topCandidates: MatchCandidate[];
  isAmbiguous: boolean;
  isNew: boolean;
}

interface IndexEntry {
  id: number;
  name: string;
  normalized: string;
  entityType: string;
}

// ── Normalization ────────────────────────────────────────────────────

const UMLAUT_MAP: Record<string, string> = {
  'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss',
  'Ä': 'Ae', 'Ö': 'Oe', 'Ü': 'Ue',
};

function normalize(s: string): string {
  let out = s.toLowerCase().trim();
  for (const [k, v] of Object.entries(UMLAUT_MAP)) {
    out = out.replaceAll(k, v);
  }
  return out.replace(/[\s\-_.]+/g, ' ').replace(/[^a-z0-9 ]/g, '');
}

// ── Blocking ─────────────────────────────────────────────────────────
// Group entries by first N characters to avoid O(n²) comparisons

function blockKey(normalized: string, prefixLen = 3): string {
  return normalized.slice(0, prefixLen).padEnd(prefixLen, '_');
}

// ── FuzzyMatcher ─────────────────────────────────────────────────────

export class FuzzyMatcher {
  private entries: IndexEntry[] = [];
  private exactMap = new Map<string, IndexEntry[]>();
  private normalizedMap = new Map<string, IndexEntry[]>();
  private blocks = new Map<string, IndexEntry[]>();
  private entityTypeIndex = new Map<string, IndexEntry[]>();
  private stats = {
    totalEntries: 0,
    projectCount: 0,
    resourceCount: 0,
    taskCount: 0,
    customFieldCount: 0,
    assignmentCount: 0,
    skillCount: 0,
    adminTimeCount: 0,
    departments: new Set<string>(),
    roles: new Set<string>(),
    projectNames: [] as string[],
    resourceNames: [] as string[],
  };

  buildIndex(tempusData: TempusData): void {
    this.entries = [];
    this.exactMap.clear();
    this.normalizedMap.clear();
    this.blocks.clear();
    this.entityTypeIndex.clear();

    const addEntry = (id: number, name: string, entityType: string) => {
      if (!name || typeof name !== 'string') return;
      const norm = normalize(name);
      const entry: IndexEntry = { id, name, normalized: norm, entityType };
      this.entries.push(entry);

      const exactKey = name.toLowerCase().trim();
      if (!this.exactMap.has(exactKey)) this.exactMap.set(exactKey, []);
      this.exactMap.get(exactKey)!.push(entry);

      if (!this.normalizedMap.has(norm)) this.normalizedMap.set(norm, []);
      this.normalizedMap.get(norm)!.push(entry);

      const bk = blockKey(norm);
      if (!this.blocks.has(bk)) this.blocks.set(bk, []);
      this.blocks.get(bk)!.push(entry);

      if (!this.entityTypeIndex.has(entityType)) this.entityTypeIndex.set(entityType, []);
      this.entityTypeIndex.get(entityType)!.push(entry);
    };

    for (const p of tempusData.projects) {
      addEntry(p.id, p.name, 'projects');
      this.stats.projectNames.push(p.name);
    }
    for (const r of tempusData.resources) {
      addEntry(r.id, r.name, 'resources');
      this.stats.resourceNames.push(r.name);
    }
    for (const t of tempusData.tasks) addEntry(t.id, t.name, 'tasks');
    for (const cf of tempusData.customFields) addEntry(cf.id, cf.name, 'customFields');
    for (const s of tempusData.skills) addEntry(s.id, s.name, 'skills');
    for (const a of tempusData.adminTimes) addEntry(a.id, a.name, 'adminTimes');
    for (const r of tempusData.roles) {
      addEntry(r.id, r.name, 'roles');
      this.stats.roles.add(r.name);
    }

    this.stats.totalEntries = this.entries.length;
    this.stats.projectCount = tempusData.projects.length;
    this.stats.resourceCount = tempusData.resources.length;
    this.stats.taskCount = tempusData.tasks.length;
    this.stats.customFieldCount = tempusData.customFields.length;
    this.stats.assignmentCount = tempusData.assignments.length;
    this.stats.skillCount = tempusData.skills.length;
    this.stats.adminTimeCount = tempusData.adminTimes.length;

    console.log(`[FuzzyMatcher] Index built: ${this.entries.length} entries, ${this.blocks.size} blocks`);
  }

  /**
   * Match a single value against the index, optionally scoped to an entity type.
   * Returns best match + top-K candidates + ambiguity flag.
   */
  match(value: string, entityType?: string, topK = 5): MatchResult {
    const input = value.trim();
    if (!input) return { sourceValue: value, bestMatch: null, topCandidates: [], isAmbiguous: false, isNew: true };

    const inputLower = input.toLowerCase().trim();
    const inputNorm = normalize(input);
    const candidates: MatchCandidate[] = [];

    // Phase 1: Exact match (case-insensitive)
    const exactHits = this.exactMap.get(inputLower);
    if (exactHits) {
      for (const e of exactHits) {
        if (entityType && e.entityType !== entityType) continue;
        candidates.push({ id: e.id, name: e.name, entityType: e.entityType, score: 1.0, matchLevel: 'exact' });
      }
    }

    // Phase 2: Normalized match
    if (candidates.length === 0) {
      const normHits = this.normalizedMap.get(inputNorm);
      if (normHits) {
        for (const e of normHits) {
          if (entityType && e.entityType !== entityType) continue;
          candidates.push({ id: e.id, name: e.name, entityType: e.entityType, score: 0.92, matchLevel: 'normalized' });
        }
      }
    }

    // Phase 3: Fuzzy matching via blocking (only if no exact/normalized match)
    if (candidates.length === 0) {
      const searchScope = this.getCandidateScope(inputNorm, entityType);
      const limit = Math.min(searchScope.length, 5000);

      for (let i = 0; i < limit; i++) {
        const entry = searchScope[i];
        const score = fuzzball.ratio(inputNorm, entry.normalized) / 100;

        if (score >= 0.65) {
          const tokenScore = fuzzball.token_sort_ratio(inputNorm, entry.normalized) / 100;
          const bestScore = Math.max(score, tokenScore);
          if (bestScore >= 0.70) {
            candidates.push({ id: entry.id, name: entry.name, entityType: entry.entityType, score: bestScore, matchLevel: 'fuzzy' });
          }
        }
      }
    }

    candidates.sort((a, b) => b.score - a.score);
    const topCandidates = candidates.slice(0, topK);
    const bestMatch = topCandidates[0] ?? null;

    const isAmbiguous = bestMatch !== null
      && bestMatch.score < 0.85
      && topCandidates.length >= 2
      && (topCandidates[1].score / bestMatch.score) > 0.85;

    const isNew = bestMatch === null || bestMatch.score < 0.65;

    return { sourceValue: value, bestMatch, topCandidates, isAmbiguous, isNew };
  }

  /**
   * Batch match multiple values — optimized to avoid redundant lookups.
   */
  matchBatch(values: string[], entityType?: string, topK = 5): Map<string, MatchResult> {
    const results = new Map<string, MatchResult>();
    const seen = new Map<string, MatchResult>();

    for (const val of values) {
      const key = val.toLowerCase().trim();
      if (seen.has(key)) {
        results.set(val, seen.get(key)!);
        continue;
      }
      const result = this.match(val, entityType, topK);
      seen.set(key, result);
      results.set(val, result);
    }

    return results;
  }

  /**
   * Generate a compact summary of Tempus data for the AI prompt.
   * Avoids sending 20k entries by aggregating into statistics + samples.
   */
  getSummaryForAI(): TempusSummary {
    const projectSample = this.stats.projectNames.slice(0, 80);
    const resourceSample = this.stats.resourceNames.slice(0, 80);

    const projectDepartments = new Set<string>();
    for (const entries of this.entityTypeIndex.get('projects') ?? []) {
      projectDepartments.add(entries.name.split(' ')[0]);
    }

    return {
      projectCount: this.stats.projectCount,
      resourceCount: this.stats.resourceCount,
      taskCount: this.stats.taskCount,
      customFieldCount: this.stats.customFieldCount,
      assignmentCount: this.stats.assignmentCount,
      skillCount: this.stats.skillCount,
      adminTimeCount: this.stats.adminTimeCount,
      roles: [...this.stats.roles],
      projectNameSamples: projectSample,
      resourceNameSamples: resourceSample,
      hasLargeDataset: this.stats.resourceCount > 500 || this.stats.projectCount > 200,
    };
  }

  private getCandidateScope(inputNorm: string, entityType?: string): IndexEntry[] {
    if (entityType) {
      const typeEntries = this.entityTypeIndex.get(entityType);
      if (typeEntries && typeEntries.length <= 5000) return typeEntries;
    }

    const bk = blockKey(inputNorm);
    const blockEntries = this.blocks.get(bk);
    if (blockEntries && blockEntries.length > 0) {
      if (entityType) return blockEntries.filter(e => e.entityType === entityType);
      return blockEntries;
    }

    if (entityType) {
      return (this.entityTypeIndex.get(entityType) ?? []).slice(0, 5000);
    }

    return this.entries.slice(0, 5000);
  }
}

// ── Summary type for AI ──────────────────────────────────────────────

export interface TempusSummary {
  projectCount: number;
  resourceCount: number;
  taskCount: number;
  customFieldCount: number;
  assignmentCount: number;
  skillCount: number;
  adminTimeCount: number;
  roles: string[];
  projectNameSamples: string[];
  resourceNameSamples: string[];
  hasLargeDataset: boolean;
}
