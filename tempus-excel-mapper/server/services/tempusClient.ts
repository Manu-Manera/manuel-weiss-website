import type {
  TempusData, TempusProject, TempusResource, TempusTask, TempusCustomField,
  TempusAssignment, TempusSkill, TempusAdminTime, TempusSheetData,
  TempusAdvancedRate, TempusFinancial, TempusTeamResource,
} from '../types.js';

interface PaginatedResponse<T> {
  items?: T[];
  totalCount?: number;
}

export class TempusClient {
  private baseUrl: string;
  private apiKey: string;
  private apiBase: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.apiKey = apiKey;
    this.apiBase = `${this.baseUrl}/api/sg/v1`;
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const url = path.startsWith('http') ? path : `${this.apiBase}${path}`;
    const opts: RequestInit = {
      method,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    };
    if (body && (method === 'POST' || method === 'PUT')) {
      opts.body = JSON.stringify(body);
    }

    const res = await fetch(url, opts);
    const text = await res.text();

    if (!res.ok) {
      const status = res.status;
      if (status === 401) throw new Error('Ungültiger API-Key oder fehlende Berechtigung');
      if (status === 429) throw new Error('Rate Limit erreicht – bitte warten');
      throw new Error(`Tempus API ${status}: ${text.slice(0, 200)}`);
    }

    return text ? JSON.parse(text) : (null as T);
  }

  async testConnection(): Promise<{ ok: boolean; message: string; projectCount?: number }> {
    try {
      const data = await this.request<PaginatedResponse<TempusProject>>('GET', '/Projects?page=1&pageSize=10');
      const count = data?.items?.length ?? 0;
      return { ok: true, message: `Verbindung erfolgreich (${count} Projekte gefunden)`, projectCount: count };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { ok: false, message: msg };
    }
  }

  // ── Paginated fetch helper ─────────────────────────────────────────

  private async fetchAll<T>(path: string, pageSize = 200): Promise<T[]> {
    const all: T[] = [];
    let page = 1;
    while (true) {
      const separator = path.includes('?') ? '&' : '?';
      const data = await this.request<PaginatedResponse<T> | T[]>(
        'GET',
        `${path}${separator}page=${page}&pageSize=${pageSize}`
      );
      const items = Array.isArray(data) ? data : (data?.items ?? []);
      all.push(...items);
      if (items.length < pageSize) break;
      page++;
    }
    return all;
  }

  // ── GET Endpoints ──────────────────────────────────────────────────

  async getProjects(): Promise<TempusProject[]> {
    return this.fetchAll<TempusProject>('/Projects');
  }

  async getResources(): Promise<TempusResource[]> {
    return this.fetchAll<TempusResource>('/Resources');
  }

  async getTasks(projectIds?: number[]): Promise<TempusTask[]> {
    const query = projectIds?.length ? `?projectIds=${projectIds.join(',')}` : '';
    return this.fetchAll<TempusTask>(`/Tasks${query}`);
  }

  async getCustomFields(): Promise<TempusCustomField[]> {
    return this.fetchAll<TempusCustomField>('/CustomFields');
  }

  async getRoles(): Promise<Array<{ id: number; name: string }>> {
    return this.fetchAll('/Roles');
  }

  async getSkills(): Promise<Array<{ id: number; name: string }>> {
    return this.fetchAll('/Skills');
  }

  async getAdminTimes(): Promise<Array<{ id: number; name: string }>> {
    return this.fetchAll('/AdminTimes');
  }

  async getCalendars(): Promise<Array<{ id: number; name: string }>> {
    return this.fetchAll('/Calendars');
  }

  async getAssignments(projectIds?: number[]): Promise<TempusAssignment[]> {
    const query = projectIds?.length ? `?projectIds=${projectIds.join(',')}` : '';
    return this.fetchAll<TempusAssignment>(`/Assignments${query}`);
  }

  async getSheetData(): Promise<TempusSheetData[]> {
    try { return await this.fetchAll<TempusSheetData>('/SheetData'); } catch { return []; }
  }

  async getAdvancedRates(): Promise<TempusAdvancedRate[]> {
    try { return await this.fetchAll<TempusAdvancedRate>('/AdvancedRates'); } catch { return []; }
  }

  async getFinancials(): Promise<TempusFinancial[]> {
    try { return await this.fetchAll<TempusFinancial>('/Financials'); } catch { return []; }
  }

  async getTeamResources(): Promise<TempusTeamResource[]> {
    try { return await this.fetchAll<TempusTeamResource>('/TeamResources'); } catch { return []; }
  }

  // ── CREATE Endpoints ───────────────────────────────────────────────

  async createProjects(projects: unknown[]): Promise<unknown> {
    return this.request('POST', '/Projects', projects);
  }

  async createResources(resources: unknown[]): Promise<unknown> {
    return this.request('POST', '/Resources', resources);
  }

  async createTasks(tasks: unknown[]): Promise<unknown> {
    return this.request('POST', '/Tasks', tasks);
  }

  async createCustomFields(fields: unknown[]): Promise<unknown> {
    return this.request('POST', '/CustomFields', fields);
  }

  async updateCustomFields(fields: unknown[]): Promise<unknown> {
    return this.request('PUT', '/CustomFields', fields);
  }

  async createAssignments(assignments: unknown[]): Promise<unknown> {
    return this.request('POST', '/Assignments', assignments);
  }

  // ── Fetch all relevant Tempus data ─────────────────────────────────

  async fetchAllData(): Promise<TempusData> {
    const [
      projects, resources, tasks, customFields, assignments,
      roles, skills, adminTimes, sheetData, advancedRates,
      financials, teamResources, calendars,
    ] = await Promise.allSettled([
      this.getProjects(),
      this.getResources(),
      this.getTasks(),
      this.getCustomFields(),
      this.getAssignments(),
      this.getRoles(),
      this.getSkills(),
      this.getAdminTimes(),
      this.getSheetData(),
      this.getAdvancedRates(),
      this.getFinancials(),
      this.getTeamResources(),
      this.getCalendars(),
    ]);

    const unwrap = <T>(result: PromiseSettledResult<T[]>): T[] =>
      result.status === 'fulfilled' ? result.value : [];

    return {
      projects: unwrap(projects),
      resources: unwrap(resources),
      tasks: unwrap(tasks),
      customFields: unwrap(customFields),
      assignments: unwrap(assignments),
      roles: unwrap(roles),
      skills: unwrap(skills),
      adminTimes: unwrap(adminTimes),
      sheetData: unwrap(sheetData),
      advancedRates: unwrap(advancedRates),
      financials: unwrap(financials),
      teamResources: unwrap(teamResources),
      calendars: unwrap(calendars),
      fetchedAt: Date.now(),
    };
  }
}
