import type { TempusData, TempusProject, TempusResource, TempusTask, TempusCustomField } from '../types.js';

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
      const data = await this.request<PaginatedResponse<TempusProject>>('GET', '/Projects?page=1&pageSize=5');
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

  async getAssignments(projectIds?: number[]): Promise<unknown[]> {
    const query = projectIds?.length ? `?projectIds=${projectIds.join(',')}` : '';
    return this.fetchAll(`/Assignments${query}`);
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
    const [projects, resources, tasks, customFields, roles, skills, adminTimes, calendars] =
      await Promise.allSettled([
        this.getProjects(),
        this.getResources(),
        this.getTasks(),
        this.getCustomFields(),
        this.getRoles(),
        this.getSkills(),
        this.getAdminTimes(),
        this.getCalendars(),
      ]);

    const unwrap = <T>(result: PromiseSettledResult<T[]>): T[] =>
      result.status === 'fulfilled' ? result.value : [];

    return {
      projects: unwrap(projects),
      resources: unwrap(resources),
      tasks: unwrap(tasks),
      customFields: unwrap(customFields),
      roles: unwrap(roles),
      skills: unwrap(skills),
      adminTimes: unwrap(adminTimes),
      calendars: unwrap(calendars),
      fetchedAt: Date.now(),
    };
  }
}
