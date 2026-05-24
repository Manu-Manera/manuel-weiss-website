/**
 * Seed-Daten für das Tempus-Trainings-Tool.
 *
 * Wird vom Backend einmalig in S3 unter customers/demo/ ausgespielt
 * und vom Authoring-UI als Fallback gezeigt, wenn die API nicht erreichbar ist.
 *
 * Halt: 1 Demo-Kunde "demo" mit 1 Tour ("RM Grundlagen") und 2 Theorie-Folien.
 * Realistische Tempus-Selectoren werden im Authoring nachträglich gepflegt.
 */

import { SCHEMA_VERSION } from './trainingSchema';

const NOW = '2026-05-08T00:00:00.000Z';

export const DEMO_BRANDING = {
  customerId: 'demo',
  customerName: 'Demo Kunde',
  logoUrl: null,
  accentColor: '#6366f1',
  welcomeText: 'Willkommen in der Demo-Tour für Tempus Resource. Diese Tour zeigt dir die wichtigsten RM-Funktionen.',
  domainHint: 'demo.prosymmetry.com'
};

export const DEMO_SLIDES = [
  {
    id: 'slide_rm_intro',
    customerId: 'demo',
    title: 'Was ist Resource Management in Tempus?',
    subtitle: 'Grundlagen vor dem ersten Klick',
    estimatedReadSeconds: 60,
    voiceover: null,
    blocks: [
      { id: 'b1', type: 'heading', text: 'Deine Rolle als Resource Manager' },
      {
        id: 'b2', type: 'text',
        markdown: 'Als RM weist du Ressourcen Projekten zu, prüfst Kapazitäten und gibst Allokationen frei. Tempus nutzt dafür drei Kern-Konzepte: **Net Availability**, **Allocations** und **Resource Requests**.'
      },
      {
        id: 'b3', type: 'callout', variant: 'info',
        markdown: 'In den nächsten 5 Minuten lernst du, wie du eine Anfrage prüfst und freigibst – live in deinem Tempus.'
      }
    ],
    createdAt: NOW,
    updatedAt: NOW
  },
  {
    id: 'slide_rm_net_availability',
    customerId: 'demo',
    title: 'Net Availability',
    subtitle: 'Was die Zahlen bedeuten',
    estimatedReadSeconds: 45,
    voiceover: null,
    blocks: [
      { id: 'b1', type: 'heading', text: 'Net Availability erklärt' },
      {
        id: 'b2', type: 'text',
        markdown: 'Net Availability = Kapazität minus Allokationen minus Abwesenheiten. Eine grüne Zelle bedeutet freie Kapazität, eine rote Zelle Überallokation.'
      },
      {
        id: 'b3', type: 'callout', variant: 'tip',
        markdown: 'Tipp: Klicke auf eine rote Zelle, um den **Impact Assessment**-Dialog zu öffnen und zu sehen, welche Projekte beteiligt sind.'
      }
    ],
    createdAt: NOW,
    updatedAt: NOW
  }
];

export const DEMO_TOUR = {
  id: 'tour_rm_basics',
  customerId: 'demo',
  title: 'Resource Manager – Grundlagen',
  description: 'Erste geführte Tour: Login, Resource Grid öffnen, Net Availability prüfen, Anfrage freigeben.',
  domainHint: 'demo.prosymmetry.com',
  audience: ['RM'],
  status: 'published',
  schemaVersion: SCHEMA_VERSION,
  coverImage: '',
  estimatedDurationMin: '5',
  createdAt: NOW,
  updatedAt: NOW,
  createdBy: 'valkeen.seed',
  steps: [
    {
      id: 'step_intro',
      kind: 'theory',
      slideId: 'slide_rm_intro',
      placement: 'modal',
      validation: { type: 'manual-next' },
      next: 'step_open_grid'
    },
    {
      id: 'step_open_grid',
      kind: 'highlight',
      target: {
        selectors: [
          '[data-testid="nav-resource-grid"]',
          'a[aria-label="Resource Grid"]',
          'a[href*="resource-grid"]'
        ]
      },
      tip: {
        title: 'Resource Grid öffnen',
        body: 'Klicke auf **Resource Grid** in der Navigation. Hier siehst du alle Ressourcen mit ihren Kapazitäten.',
        placement: { position: 'right' }
      },
      validation: { type: 'url-contains', value: '/resource-grid', timeoutMs: 30000 },
      next: 'step_explain_availability'
    },
    {
      id: 'step_explain_availability',
      kind: 'theory',
      slideId: 'slide_rm_net_availability',
      placement: 'sidepanel',
      validation: { type: 'manual-next' },
      next: 'step_filter_red_cells'
    },
    {
      id: 'step_filter_red_cells',
      kind: 'highlight',
      target: {
        selectors: [
          '[data-testid="filter-button"]',
          'button[aria-label="Filter"]',
          'button:has-text("Filter")'
        ]
      },
      tip: {
        title: 'Filter setzen',
        body: 'Öffne den Filter und wähle "Net Availability < 0", um nur überallokierte Ressourcen zu sehen.',
        placement: { position: 'bottom-end' }
      },
      validation: { type: 'click-target' },
      next: 'step_open_request',
      onFail: 'step_help_filter'
    },
    {
      id: 'step_help_filter',
      kind: 'theory',
      slideId: 'slide_rm_net_availability',
      placement: 'modal',
      validation: { type: 'manual-next' },
      next: 'step_filter_red_cells'
    },
    {
      id: 'step_open_request',
      kind: 'highlight',
      target: {
        selectors: [
          '[data-testid="nav-resource-requests"]',
          'a[aria-label="Resource Requests"]',
          'a[href*="resource-requests"]'
        ]
      },
      tip: {
        title: 'Anfragen öffnen',
        body: 'Wechsle zu **Resource Requests**, um offene Anfragen freizugeben oder abzulehnen.',
        placement: { position: 'right' }
      },
      validation: { type: 'url-contains', value: '/resource-requests' },
      next: 'step_complete'
    },
    {
      id: 'step_complete',
      kind: 'checklist',
      tip: {
        title: 'Geschafft!',
        body: 'Du hast die Grundlagen-Tour abgeschlossen. In der Advanced-Tour lernst du Bulk-Approve, Delegation und Reports.',
        placement: { position: 'bottom' }
      },
      validation: { type: 'manual-next' }
    }
  ]
};

export const DEMO_CUSTOMER_INDEX = {
  schemaVersion: SCHEMA_VERSION,
  updatedAt: NOW,
  customers: [
    {
      customerId: 'demo',
      customerName: 'Demo Kunde',
      domainHint: 'demo.prosymmetry.com',
      active: true
    }
  ]
};
