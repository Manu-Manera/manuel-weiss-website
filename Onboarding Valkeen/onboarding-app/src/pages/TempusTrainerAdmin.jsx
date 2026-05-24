import { useState, useEffect } from 'react';
import {
  Settings2, Save, Type,
  Building2, Compass, BookOpen, Activity
} from 'lucide-react';
import { saveBranding, getBranding } from '../services/trainingAdminService';
import { newBranding } from '../data/trainingSchema';
import CustomerPicker, { useCustomerSelection } from '../components/training/CustomerPicker';
import TourEditor from '../components/training/TourEditor';
import SlideEditor from '../components/training/SlideEditor';
import TrainerDashboard from '../components/training/TrainerDashboard';
import LocalModeBanner from '../components/training/LocalModeBanner';

export default function TempusTrainerAdmin() {
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('customers');
  const customerSel = useCustomerSelection();
  const cid = customerSel.currentId;
  const [branding, setBranding] = useState(null);
  const [brandingLoaded, setBrandingLoaded] = useState(false);

  useEffect(() => {
    if (!cid) { setBranding(null); setBrandingLoaded(false); return; }
    let cancelled = false;
    (async () => {
      try {
        const b = await getBranding(cid);
        if (!cancelled) {
          const customerName = customerSel.customers.find((c) => c.customerId === cid)?.customerName || cid;
          const domainHint = customerSel.customers.find((c) => c.customerId === cid)?.domainHint || '';
          setBranding(b?.customerName ? b : newBranding(cid, { customerName, domainHint }));
          setBrandingLoaded(true);
        }
      } catch {
        if (!cancelled) {
          setBranding(newBranding(cid));
          setBrandingLoaded(true);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [cid]);

  async function handleSaveBranding() {
    if (!cid || !branding) return;
    try {
      await saveBranding(cid, branding);
      setError('Branding gespeichert.');
      setTimeout(() => setError(null), 2500);
    } catch (e) {
      setError(`Branding-Speicher-Fehler: ${e.message}`);
    }
  }

  const sections = [
    { id: 'customers', label: 'Kunden', icon: Building2 },
    { id: 'branding', label: 'Branding', icon: Type },
    { id: 'tours', label: 'Touren', icon: Compass },
    { id: 'slides', label: 'Folien', icon: BookOpen },
    { id: 'progress', label: 'Fortschritte', icon: Activity },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Settings2 className="w-8 h-8 text-amber-400" />
            Tempus Trainer Admin
          </h1>
          <p className="text-white/60">
            Kunden, Branding, Touren und Folien für die Browser-Extension verwalten.
          </p>
        </div>
      </div>

      {error && (
        <div className={`glass-card p-4 ${
          error.includes('gespeichert') ? 'border-amber-500/30 bg-amber-500/10 text-amber-400' : 'border-red-500/30 bg-red-500/10 text-red-400'
        }`}>
          {error}
        </div>
      )}

      <LocalModeBanner customerId={cid} />

      <div className="flex flex-wrap gap-2 mb-6">
        {sections.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
              activeSection === id ? 'bg-indigo-500/30 text-white' : 'bg-white/5 hover:bg-white/10 text-white/70'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {activeSection === 'customers' && (
        <div className="space-y-4">
          <CustomerPicker
            customers={customerSel.customers}
            currentId={customerSel.currentId}
            onSelect={customerSel.select}
            onAdd={customerSel.addCustomer}
          />
          <div className="glass-card p-5 text-sm text-white/70 space-y-2">
            <p className="font-semibold text-white">So funktioniert das Trainings-Tool</p>
            <ol className="list-decimal list-inside space-y-1 text-white/60">
              <li>Kunde anlegen oder auswählen.</li>
              <li>Im Tab "Branding" Logo, Farbe und Tempus-Subdomain pflegen.</li>
              <li>Im Tab "Folien" Theorie-Folien anlegen.</li>
              <li>Im Tab "Touren" Schritte pflegen oder per Browser-Extension-Recorder importieren.</li>
              <li>Live-Test: Tempus-Tab öffnen, im Editor "Live-Test" – die Extension spielt die Tour direkt ab.</li>
              <li>Trainees rufen <code>/onboarding/tempus-trainer</code> auf, wählen ihre Tour, das Tempus-Tab wird geöffnet, die Extension übernimmt.</li>
            </ol>
          </div>
        </div>
      )}

      {activeSection === 'branding' && (
        <div className="glass-card p-6 space-y-4">
          <CustomerPicker
            customers={customerSel.customers}
            currentId={customerSel.currentId}
            onSelect={customerSel.select}
            onAdd={customerSel.addCustomer}
          />
          {!cid && <div className="text-white/60">Bitte zuerst Kunde wählen.</div>}
          {cid && brandingLoaded && branding && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/60 mb-1">Anzeigename</label>
                <input
                  value={branding.customerName || ''}
                  onChange={(e) => setBranding((b) => ({ ...b, customerName: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1">Akzentfarbe (HEX)</label>
                <input
                  value={branding.accentColor || '#6366f1'}
                  onChange={(e) => setBranding((b) => ({ ...b, accentColor: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1">Logo-URL</label>
                <input
                  value={branding.logoUrl || ''}
                  onChange={(e) => setBranding((b) => ({ ...b, logoUrl: e.target.value || null }))}
                  placeholder="https://…/logo.png"
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1">Tempus-Subdomain</label>
                <input
                  value={branding.domainHint || ''}
                  onChange={(e) => setBranding((b) => ({ ...b, domainHint: e.target.value }))}
                  placeholder="z.B. knauf.prosymmetry.com"
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm text-white/60 mb-1">Begrüßungstext</label>
                <textarea
                  value={branding.welcomeText || ''}
                  onChange={(e) => setBranding((b) => ({ ...b, welcomeText: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm"
                />
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <button
                  onClick={handleSaveBranding}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm"
                >
                  <Save className="w-4 h-4" /> Branding speichern
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeSection === 'tours' && (
        <div className="space-y-4">
          <CustomerPicker
            customers={customerSel.customers}
            currentId={customerSel.currentId}
            onSelect={customerSel.select}
            onAdd={customerSel.addCustomer}
          />
          <TourEditor customerId={cid} />
        </div>
      )}

      {activeSection === 'slides' && (
        <div className="space-y-4">
          <CustomerPicker
            customers={customerSel.customers}
            currentId={customerSel.currentId}
            onSelect={customerSel.select}
            onAdd={customerSel.addCustomer}
          />
          <SlideEditor customerId={cid} />
        </div>
      )}

      {activeSection === 'progress' && (
        <div className="space-y-4">
          <CustomerPicker
            customers={customerSel.customers}
            currentId={customerSel.currentId}
            onSelect={customerSel.select}
            onAdd={customerSel.addCustomer}
          />
          <TrainerDashboard customerId={cid} />
        </div>
      )}
    </div>
  );
}
