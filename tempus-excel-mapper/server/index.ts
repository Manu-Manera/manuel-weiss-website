import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { v4 as uuid } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';

import type { AppConfig, Session } from './types.js';
import { TempusClient } from './services/tempusClient.js';
import { AnthropicClient } from './services/anthropicClient.js';
import { parseExcel, analyzeStructure } from './services/excelParser.js';
import { generateMappings } from './services/mappingEngine.js';
import { validateMappings, generateTempusExcel, generateReport } from './services/exportService.js';
import { anonymizeSampleRows, anonymizeSampleValues, generatePiiReport } from './services/anonymizer.js';
import { logAudit, getAuditLog, clearAuditLog } from './services/auditLog.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.set('trust proxy', 1);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    if (allowed.includes(file.mimetype) || file.originalname.match(/\.(xlsx|xls)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Nur Excel-Dateien (.xlsx, .xls) erlaubt'));
    }
  },
});

// ── DSGVO: Security Headers (Art. 32) ────────────────────────────────

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'", "https://cognito-idp.eu-central-1.amazonaws.com"],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

// ── DSGVO: CORS Restriction (Art. 32) ────────────────────────────────

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS: Herkunft nicht erlaubt'));
    }
  },
  credentials: true,
}));

// ── DSGVO: Rate Limiting (Art. 32) ───────────────────────────────────

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Zu viele Anfragen – bitte warten' },
});
app.use('/api/', limiter);

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Upload-Limit erreicht – bitte warten' },
});

app.use(express.json({ limit: '10mb' }));

// ── State ────────────────────────────────────────────────────────────

let config: AppConfig = {
  tempusBaseUrl: process.env.TEMPUS_API_BASE_URL || '',
  tempusApiKey: process.env.TEMPUS_API_KEY || '',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
};

const sessions = new Map<string, Session>();
const SESSION_TTL = 15 * 60 * 1000; // 15 Min (reduziert für DSGVO)

setInterval(() => {
  const now = Date.now();
  for (const [id, s] of sessions.entries()) {
    if (now - s.createdAt > SESSION_TTL) {
      logAudit('session_expired', id, { reason: 'ttl' });
      sessions.delete(id);
    }
  }
}, 60_000);

function paramStr(val: string | string[]): string {
  return Array.isArray(val) ? val[0] : val;
}

function getSession(id: string | string[]): Session {
  const key = paramStr(id);
  const s = sessions.get(key);
  if (!s) throw new Error('Session nicht gefunden oder abgelaufen');
  return s;
}

// ── DSGVO: Consent Tracking ──────────────────────────────────────────

const sessionConsent = new Map<string, { privacy: boolean; aiProcessing: boolean; timestamp: string }>();

// ── Helper ───────────────────────────────────────────────────────────

type AsyncHandler = (req: express.Request, res: express.Response) => Promise<void>;
const asyncRoute = (fn: AsyncHandler) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
  fn(req, res).catch((err) => {
    const message = err instanceof Error ? sanitizeError(err.message) : 'Interner Fehler';
    logAudit('error', undefined, { route: req.path }, 'error', message);
    next(err);
  });
};

function sanitizeError(msg: string): string {
  return msg
    .replace(/Bearer\s+\S+/gi, 'Bearer ***')
    .replace(/sk-ant-\S+/gi, 'sk-ant-***')
    .replace(/[^\s@]+@[^\s@]+\.[^\s@]+/g, '***@***.***')
    .slice(0, 200);
}

// ── CONFIG ROUTES ────────────────────────────────────────────────────

app.get('/api/config', (_req, res) => {
  res.json({
    tempusBaseUrl: config.tempusBaseUrl,
    hasTempusKey: !!config.tempusApiKey,
    hasAnthropicKey: !!config.anthropicApiKey,
  });
});

app.post('/api/config', (req, res) => {
  const { tempusBaseUrl, tempusApiKey, anthropicApiKey } = req.body;
  if (tempusBaseUrl !== undefined) config.tempusBaseUrl = tempusBaseUrl;
  if (tempusApiKey !== undefined) config.tempusApiKey = tempusApiKey;
  if (anthropicApiKey !== undefined) config.anthropicApiKey = anthropicApiKey;
  logAudit('config_updated', undefined, {
    hasTempusUrl: !!config.tempusBaseUrl,
    hasTempusKey: !!config.tempusApiKey,
    hasAnthropicKey: !!config.anthropicApiKey,
  });
  res.json({
    ok: true,
    tempusBaseUrl: config.tempusBaseUrl,
    hasTempusKey: !!config.tempusApiKey,
    hasAnthropicKey: !!config.anthropicApiKey,
  });
});

app.get('/api/config/test-tempus', asyncRoute(async (_req, res) => {
  if (!config.tempusBaseUrl || !config.tempusApiKey) {
    res.json({ ok: false, message: 'Tempus URL und API-Key erforderlich' });
    return;
  }
  const client = new TempusClient(config.tempusBaseUrl, config.tempusApiKey);
  const result = await client.testConnection();
  logAudit('test_tempus', undefined, { ok: result.ok });
  res.json(result);
}));

app.get('/api/config/test-anthropic', asyncRoute(async (_req, res) => {
  if (!config.anthropicApiKey) {
    res.json({ ok: false, message: 'Anthropic API-Key erforderlich' });
    return;
  }
  const client = new AnthropicClient(config.anthropicApiKey);
  const result = await client.testConnection();
  logAudit('test_anthropic', undefined, { ok: result.ok });
  res.json(result);
}));

// ── DSGVO: Privacy Endpoints ─────────────────────────────────────────

app.post('/api/privacy/consent', (req, res) => {
  const { sessionId, privacyAccepted, aiProcessingAccepted } = req.body;
  if (!sessionId || typeof privacyAccepted !== 'boolean') {
    res.status(400).json({ error: 'sessionId und privacyAccepted erforderlich' });
    return;
  }
  sessionConsent.set(sessionId, {
    privacy: privacyAccepted,
    aiProcessing: !!aiProcessingAccepted,
    timestamp: new Date().toISOString(),
  });
  logAudit('consent_recorded', sessionId, {
    privacy: privacyAccepted,
    aiProcessing: !!aiProcessingAccepted,
  });
  res.json({ ok: true });
});

app.get('/api/privacy/info', (_req, res) => {
  res.json({
    dataProcessor: 'Valkeen GmbH',
    purpose: 'Excel-Daten-Analyse und Transformation für Tempus-Import',
    dataCategories: [
      'Projektdaten (Projektnamen, Zeiträume, Prioritäten)',
      'Ressourcendaten (Namen, Rollen, Kapazitäten)',
      'Aufgabendaten (Task-Namen, Zuweisungen)',
    ],
    retention: '15 Minuten (nur In-Memory, kein Disk)',
    thirdParties: [
      {
        name: 'Anthropic (Claude AI)',
        purpose: 'Semantische Analyse von Spaltenstrukturen',
        location: 'USA',
        dataTransferred: 'Nur anonymisierte Spaltenheader und pseudonymisierte Beispielwerte',
        optional: true,
        requiresExplicitConsent: true,
      },
      {
        name: 'Tempus (ProSymmetry)',
        purpose: 'Abgleich mit vorhandenen Projektmanagement-Daten',
        location: 'Vom Kunden konfigurierte Instanz',
        dataTransferred: 'API-Anfragen zum Lesen vorhandener Entitäten',
        optional: false,
      },
    ],
    rights: [
      'Auskunft (Art. 15 DSGVO)',
      'Löschung (Art. 17 DSGVO) – DELETE /api/sessions/:id',
      'Einschränkung der Verarbeitung (Art. 18 DSGVO)',
      'Datenübertragbarkeit (Art. 20 DSGVO)',
      'Widerspruch (Art. 21 DSGVO)',
    ],
    technicalMeasures: [
      'TLS-Verschlüsselung (HTTPS)',
      'Security Headers (Helmet/HSTS)',
      'Rate Limiting',
      'PII-Anonymisierung vor AI-Verarbeitung',
      'Automatische Session-Löschung nach 15 Minuten',
      'Keine dauerhafte Datenspeicherung',
      'Audit-Logging ohne personenbezogene Daten',
    ],
  });
});

app.get('/api/privacy/audit-log', (_req, res) => {
  res.json(getAuditLog());
});

// ── UPLOAD & ANALYSIS ────────────────────────────────────────────────

app.post('/api/upload', uploadLimiter, upload.single('file'), asyncRoute(async (req, res) => {
  const buffer = req.file?.buffer;
  const fileName = req.file?.originalname || 'upload.xlsx';
  if (!buffer) {
    res.status(400).json({ error: 'Keine Datei hochgeladen' });
    return;
  }

  const sessionId = uuid();
  logAudit('upload_started', sessionId, { fileName: fileName.replace(/[^a-zA-Z0-9._-]/g, '_'), sizeKB: Math.round(buffer.length / 1024) });

  const parsedExcel = await parseExcel(buffer, fileName);

  if (parsedExcel.sheets.length === 0) {
    res.status(400).json({ error: 'Keine auswertbaren Sheets in der Datei gefunden' });
    return;
  }

  let analysis = analyzeStructure(parsedExcel);

  // DSGVO: PII-Report erstellen
  const piiReports = parsedExcel.sheets.map(sheet => ({
    sheet: sheet.name,
    piiFields: generatePiiReport(sheet.headers, sheet.rows),
  }));

  // AI-enhanced analysis – nur mit Consent und anonymisierten Daten
  const consent = sessionConsent.get(req.body?.consentSessionId || sessionId);
  const aiConsented = consent?.aiProcessing ?? false;
  // Consent auch unter neuer Session-ID speichern (für generate-mappings)
  if (consent) sessionConsent.set(sessionId, consent);

  if (config.anthropicApiKey && aiConsented) {
    try {
      const anthropic = new AnthropicClient(config.anthropicApiKey);

      // DSGVO: Anonymisierte Daten an AI senden
      const sheetsForAI = analysis.sheets.map(s => {
        const parsedSheet = parsedExcel.sheets.find(ps => ps.name === s.sheetName);
        const originalRows = (parsedSheet?.rows || []).slice(0, 5);
        const anonymizedRows = anonymizeSampleRows(originalRows, parsedSheet?.headers || []);
        const anonymizedColumns = s.columns.map(c => ({
          ...c,
          sampleValues: anonymizeSampleValues(c.sampleValues, c.name),
        }));

        return {
          sheetName: s.sheetName,
          columns: anonymizedColumns,
          sampleRows: anonymizedRows,
        };
      });

      logAudit('ai_analysis_started', sessionId, { sheetsCount: sheetsForAI.length, anonymized: true });

      const aiResult = await anthropic.analyzeStructure(sheetsForAI);

      for (const aiSheet of aiResult.sheets) {
        const sheet = analysis.sheets.find(s => s.sheetName === aiSheet.sheetName);
        if (!sheet) continue;
        if (aiSheet.suggestedEntity) sheet.suggestedEntity = aiSheet.suggestedEntity;
        for (const aiCol of aiSheet.columns) {
          const col = sheet.columns.find(c => c.name === aiCol.name);
          if (!col) continue;
          col.classification = aiCol.classification;
          col.suggestedTempusField = aiCol.suggestedTempusField;
          col.confidence = aiCol.confidence;
          col.relevance = aiCol.relevance as 'high' | 'medium' | 'low';
          col.reasoning = aiCol.reasoning;
        }
        if (aiResult.detectedRelationships) {
          sheet.relationships = aiResult.detectedRelationships
            .filter(r => r.fromSheet === aiSheet.sheetName)
            .map(r => ({ sourceColumn: r.fromColumn, targetSheet: r.toSheet, targetColumn: r.toColumn, type: r.relationship }));
        }
      }
      analysis.aiInsights = aiResult.insights;
      logAudit('ai_analysis_completed', sessionId, { sheetsCount: sheetsForAI.length });
    } catch (err) {
      logAudit('ai_analysis_failed', sessionId, {}, 'error', sanitizeError(err instanceof Error ? err.message : 'unknown'));
      analysis.aiInsights = 'AI-Analyse fehlgeschlagen – regelbasierte Analyse verwendet';
    }
  } else if (config.anthropicApiKey && !aiConsented) {
    analysis.aiInsights = 'AI-Analyse deaktiviert – keine Einwilligung für Drittland-Datenverarbeitung erteilt';
  }

  const session: Session = { id: sessionId, createdAt: Date.now(), parsedExcel, analysis };
  sessions.set(sessionId, session);

  logAudit('upload_completed', sessionId, { sheetsCount: parsedExcel.sheets.length, totalRows: parsedExcel.sheets.reduce((s, sh) => s + sh.totalRows, 0) });

  res.json({ sessionId, analysis, piiReports });
}));

// ── TEMPUS DATA SYNC ─────────────────────────────────────────────────

app.post('/api/sessions/:id/sync-tempus', asyncRoute(async (req, res) => {
  const session = getSession(req.params.id);

  if (!config.tempusBaseUrl || !config.tempusApiKey) {
    res.status(400).json({ error: 'Tempus API nicht konfiguriert' });
    return;
  }

  logAudit('tempus_sync_started', session.id, {});
  const client = new TempusClient(config.tempusBaseUrl, config.tempusApiKey);
  const tempusData = await client.fetchAllData();
  session.tempusData = tempusData;

  const summary = {
    projects: tempusData.projects.length,
    resources: tempusData.resources.length,
    tasks: tempusData.tasks.length,
    customFields: tempusData.customFields.length,
    roles: tempusData.roles.length,
    skills: tempusData.skills.length,
  };

  logAudit('tempus_sync_completed', session.id, summary);
  res.json({ ok: true, summary, tempusData });
}));

// ── MAPPING ──────────────────────────────────────────────────────────

app.post('/api/sessions/:id/generate-mappings', asyncRoute(async (req, res) => {
  const session = getSession(req.params.id);

  if (!session.parsedExcel || !session.analysis) {
    res.status(400).json({ error: 'Bitte zuerst eine Excel-Datei hochladen' });
    return;
  }
  if (!session.tempusData) {
    res.status(400).json({ error: 'Bitte zuerst Tempus-Daten synchronisieren' });
    return;
  }

  const consent = sessionConsent.get(session.id);
  const aiConsented = consent?.aiProcessing ?? false;
  const anthropic = config.anthropicApiKey && aiConsented ? new AnthropicClient(config.anthropicApiKey) : undefined;

  logAudit('mapping_started', session.id, { withAI: !!anthropic });

  const mappingResult = await generateMappings(
    session.parsedExcel,
    session.analysis,
    session.tempusData,
    anthropic,
  );

  session.mappingResult = mappingResult;
  logAudit('mapping_completed', session.id, { ...mappingResult.summary });
  res.json(mappingResult);
}));

app.put('/api/sessions/:id/mappings/:mappingId', asyncRoute(async (req, res) => {
  const session = getSession(req.params.id);
  if (!session.mappingResult) {
    res.status(400).json({ error: 'Keine Mappings vorhanden' });
    return;
  }

  const mappingId = paramStr(req.params.mappingId);
  const { status, matchedId, matchedName } = req.body;

  const fm = session.mappingResult.fieldMappings.find(f => f.id === mappingId);
  if (fm) {
    if (status) fm.status = status;
    if (status === 'confirmed') fm.matchType = 'user_confirmed';
    res.json({ ok: true, mapping: fm });
    return;
  }

  const em = session.mappingResult.entityMappings.find(e => e.id === mappingId);
  if (em) {
    if (status) em.status = status;
    if (matchedId !== undefined) em.matchedId = matchedId;
    if (matchedName !== undefined) em.matchedName = matchedName;
    if (status === 'confirmed') em.matchType = 'user_confirmed';
    res.json({ ok: true, mapping: em });
    return;
  }

  res.status(404).json({ error: 'Mapping nicht gefunden' });
}));

app.post('/api/sessions/:id/mappings/bulk-action', asyncRoute(async (req, res) => {
  const session = getSession(req.params.id);
  if (!session.mappingResult) {
    res.status(400).json({ error: 'Keine Mappings vorhanden' });
    return;
  }

  const { action, filter } = req.body as {
    action: 'confirm_all' | 'confirm_suggested' | 'reject_all';
    filter?: { sheet?: string; entity?: string; minConfidence?: number };
  };

  let count = 0;
  const shouldApply = (item: { sourceSheet: string; targetEntity: string; confidence: number; status: string }) => {
    if (filter?.sheet && item.sourceSheet !== filter.sheet) return false;
    if (filter?.entity && item.targetEntity !== filter.entity) return false;
    if (filter?.minConfidence && item.confidence < filter.minConfidence) return false;
    return true;
  };

  for (const fm of session.mappingResult.fieldMappings) {
    if (!shouldApply(fm)) continue;
    if (action === 'confirm_all' || (action === 'confirm_suggested' && fm.status === 'suggested')) {
      fm.status = 'confirmed'; fm.matchType = 'user_confirmed'; count++;
    } else if (action === 'reject_all') { fm.status = 'rejected'; count++; }
  }

  for (const em of session.mappingResult.entityMappings) {
    if (!shouldApply(em)) continue;
    if (action === 'confirm_all' || (action === 'confirm_suggested' && (em.status === 'suggested' || em.status === 'create_new'))) {
      em.status = 'confirmed'; em.matchType = 'user_confirmed'; count++;
    } else if (action === 'reject_all') { em.status = 'rejected'; count++; }
  }

  logAudit('bulk_mapping_action', session.id, { action, count });
  res.json({ ok: true, updatedCount: count });
}));

// ── VALIDATION ───────────────────────────────────────────────────────

app.get('/api/sessions/:id/validation', asyncRoute(async (req, res) => {
  const session = getSession(req.params.id);
  if (!session.parsedExcel || !session.mappingResult || !session.tempusData) {
    res.status(400).json({ error: 'Alle vorherigen Schritte müssen abgeschlossen sein' });
    return;
  }
  const validation = validateMappings(session.parsedExcel, session.mappingResult, session.tempusData);
  session.validation = validation;
  logAudit('validation_completed', session.id, { ...validation.summary, canExport: validation.canExport });
  res.json(validation);
}));

// ── EXPORT ───────────────────────────────────────────────────────────

app.post('/api/sessions/:id/export', asyncRoute(async (req, res) => {
  const session = getSession(req.params.id);
  if (!session.parsedExcel || !session.mappingResult || !session.tempusData) {
    res.status(400).json({ error: 'Alle vorherigen Schritte müssen abgeschlossen sein' });
    return;
  }
  const buffer = await generateTempusExcel(session.parsedExcel, session.mappingResult, session.tempusData);
  session.exportBuffer = buffer;
  logAudit('export_generated', session.id, { sizeKB: Math.round(buffer.length / 1024) });
  res.json({ ok: true, message: 'Export bereit', size: buffer.length });
}));

app.get('/api/sessions/:id/download', asyncRoute(async (req, res) => {
  const session = getSession(req.params.id);
  if (!session.exportBuffer) {
    res.status(400).json({ error: 'Bitte zuerst Export generieren' });
    return;
  }
  const fileName = `tempus-import-${new Date().toISOString().split('T')[0]}.xlsx`;
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  logAudit('file_downloaded', session.id, { type: 'export' });
  res.send(session.exportBuffer);
}));

app.get('/api/sessions/:id/download-report', asyncRoute(async (req, res) => {
  const session = getSession(req.params.id);
  if (!session.mappingResult || !session.validation) {
    res.status(400).json({ error: 'Mapping und Validierung erforderlich' });
    return;
  }
  const buffer = await generateReport(session.mappingResult, session.validation);
  const fileName = `tempus-mapping-report-${new Date().toISOString().split('T')[0]}.xlsx`;
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  logAudit('file_downloaded', session.id, { type: 'report' });
  res.send(buffer);
}));

// ── DSGVO: Löschung (Art. 17) ────────────────────────────────────────

app.delete('/api/sessions/:id', (req, res) => {
  const key = paramStr(req.params.id);
  const existed = sessions.has(key);
  sessions.delete(key);
  sessionConsent.delete(key);
  logAudit('session_deleted', key, { existed, reason: 'user_request' });
  res.json({ ok: true, message: existed ? 'Session und alle zugehörigen Daten gelöscht' : 'Keine Session gefunden' });
});

app.delete('/api/sessions', (_req, res) => {
  const count = sessions.size;
  sessions.clear();
  sessionConsent.clear();
  logAudit('all_sessions_deleted', undefined, { count, reason: 'user_request' });
  res.json({ ok: true, message: `${count} Sessions gelöscht` });
});

// ── Serve frontend in production ─────────────────────────────────────

if (process.env.NODE_ENV === 'production') {
  const distPath = path.resolve(__dirname, '..', 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// ── DSGVO: Error Handler – keine PII in Responses (Art. 25) ─────────

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const safeMessage = sanitizeError(err.message);
  logAudit('unhandled_error', undefined, {}, 'error', safeMessage);
  res.status(500).json({ error: safeMessage });
});

// ── Start ────────────────────────────────────────────────────────────

const PORT = parseInt(process.env.PORT || '3001', 10);
app.listen(PORT, () => {
  console.log(`Tempus Excel Mapper running on port ${PORT} (DSGVO-compliant mode)`);
});
