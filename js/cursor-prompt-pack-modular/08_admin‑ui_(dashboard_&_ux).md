# Modul 08 — Admin-UI (Dashboard & UX) (OPTIMIERT)
**Repo:** `Manu-Manera/manuel-weiss-website` • **Version:** 5.0 • **Zeitzone:** Europe/Zurich  
**Prinzip:** *Kein Test-/Demo-Daten-Einsatz. Nur echte Quellen/Provider. Serverseitige Secrets.*
**Ziel:** Production-ready Admin Interface mit moderner UX und umfassendem Dashboard

---
# Repo-Ausrichtung & Pfade (ERWEITERT)
- **Admin Interface:** `ui/admin/ai-investments/` (in `admin/sections` registrieren)
- **Components:** `ui/components/` mit wiederverwendbaren UI-Komponenten
- **Styles:** `ui/styles/` mit modernem CSS und Dark/Light Mode
- **Real-time Updates:** WebSocket/SSE für Live-Daten
- **Performance:** Virtual Scrolling, Lazy Loading, Caching

# Smart Prompt – Implementierung (FÜR CURSOR - OPTIMIERT)
> **An Cursor – Production Admin Interface implementieren (Deutsch):**  

## PHASE 1: Dashboard System (ERWEITERT)
### **Main Dashboard Component:**
```typescript
// ui/admin/ai-investments/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useAPI } from '../../hooks/useAPI';
import { DashboardCard } from '../../components/DashboardCard';
import { LiveSignals } from './LiveSignals';
import { Proposals } from './Proposals';
import { RiskMetrics } from './RiskMetrics';
import { AgentHealth } from './AgentHealth';
import { LearningMetrics } from './LearningMetrics';

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [darkMode, setDarkMode] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  
  const { data: liveData, error, loading } = useAPI('/dashboard/live');
  const { connectionStatus, lastMessage } = useWebSocket('/ws/dashboard');
  
  useEffect(() => {
    if (lastMessage) {
      setData(prevData => ({
        ...prevData,
        ...lastMessage.data
      }));
    }
  }, [lastMessage]);
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Prefetch data for next tab
    prefetchTabData(tab);
  };
  
  const handleExport = async (format: 'csv' | 'pdf', dataType: string) => {
    try {
      const response = await fetch(`/api/export/${dataType}?format=${format}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        downloadFile(blob, `${dataType}-${new Date().toISOString()}.${format}`);
      }
    } catch (error) {
      console.error('Export failed:', error);
      showNotification('Export fehlgeschlagen', 'error');
    }
  };
  
  return (
    <div className={`dashboard ${darkMode ? 'dark-mode' : ''}`}>
      <DashboardHeader 
        onDarkModeToggle={() => setDarkMode(!darkMode)}
        onExport={handleExport}
        connectionStatus={connectionStatus}
      />
      
      <DashboardTabs 
        activeTab={activeTab}
        onTabChange={handleTabChange}
        tabs={[
          { id: 'overview', label: 'Übersicht', icon: 'dashboard' },
          { id: 'signals', label: 'Signale', icon: 'signal' },
          { id: 'proposals', label: 'Proposals', icon: 'lightbulb' },
          { id: 'decisions', label: 'Entscheidungen', icon: 'check-circle' },
          { id: 'risk', label: 'Risiko', icon: 'shield' },
          { id: 'learning', label: 'Lernen', icon: 'graduation-cap' },
          { id: 'settings', label: 'Einstellungen', icon: 'cog' }
        ]}
      />
      
      <DashboardContent activeTab={activeTab} data={data} />
    </div>
  );
};
```

## PHASE 2: Advanced UI Components (ERWEITERT)
### **Live Signals Component:**
```typescript
// ui/admin/ai-investments/LiveSignals.tsx
import React, { useState, useEffect } from 'react';
import { SignalCard } from '../../components/SignalCard';
import { SignalFilter } from '../../components/SignalFilter';
import { VirtualList } from '../../components/VirtualList';
import { useAPI } from '../../hooks/useAPI';
import { useWebSocket } from '../../hooks/useWebSocket';

export const LiveSignals: React.FC = () => {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [filters, setFilters] = useState<SignalFilters>({
    source: 'all',
    asset: '',
    timeframe: '1h',
    minScore: 0.5
  });
  const [sortBy, setSortBy] = useState<'score' | 'timestamp' | 'confidence'>('score');
  
  const { data: initialSignals, loading } = useAPI('/signals', { params: filters });
  const { lastMessage } = useWebSocket('/ws/signals');
  
  useEffect(() => {
    if (initialSignals) {
      setSignals(initialSignals);
    }
  }, [initialSignals]);
  
  useEffect(() => {
    if (lastMessage?.type === 'new_signal') {
      setSignals(prev => [lastMessage.data, ...prev].slice(0, 100)); // Keep last 100
    }
  }, [lastMessage]);
  
  const handleFilterChange = (newFilters: SignalFilters) => {
    setFilters(newFilters);
    // Debounced API call
    debounce(() => {
      fetchSignals(newFilters);
    }, 300)();
  };
  
  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    setSignals(prev => [...prev].sort((a, b) => {
      switch (newSortBy) {
        case 'score':
          return b.score - a.score;
        case 'timestamp':
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        case 'confidence':
          return b.confidence - a.confidence;
        default:
          return 0;
      }
    }));
  };
  
  return (
    <div className="live-signals">
      <div className="signals-header">
        <h2>Live Signale</h2>
        <div className="signals-controls">
          <SignalFilter 
            filters={filters}
            onFilterChange={handleFilterChange}
          />
          <select 
            value={sortBy} 
            onChange={(e) => handleSortChange(e.target.value)}
            className="sort-select"
          >
            <option value="score">Nach Score</option>
            <option value="timestamp">Nach Zeit</option>
            <option value="confidence">Nach Konfidenz</option>
          </select>
        </div>
      </div>
      
      <VirtualList
        items={signals}
        itemHeight={120}
        containerHeight={600}
        renderItem={(signal, index) => (
          <SignalCard 
            key={signal.id}
            signal={signal}
            onScoreClick={(score) => showScoreDetails(score)}
            onAssetClick={(asset) => showAssetDetails(asset)}
          />
        )}
      />
      
      {loading && <div className="loading-spinner">Lade Signale...</div>}
    </div>
  );
};
```

### **Proposals Management:**
```typescript
// ui/admin/ai-investments/Proposals.tsx
import React, { useState, useEffect } from 'react';
import { ProposalCard } from '../../components/ProposalCard';
import { ProposalActions } from '../../components/ProposalActions';
import { ExplainDrawer } from '../../components/ExplainDrawer';
import { useAPI } from '../../hooks/useAPI';

export const Proposals: React.FC = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showExplainDrawer, setShowExplainDrawer] = useState(false);
  
  const { data: proposalsData, loading, refetch } = useAPI('/proposals');
  
  useEffect(() => {
    if (proposalsData) {
      setProposals(proposalsData);
    }
  }, [proposalsData]);
  
  const handleProposalAction = async (proposalId: string, action: 'approve' | 'reject' | 'comment') => {
    setActionLoading(proposalId);
    
    try {
      const response = await fetch(`/api/proposals/${proposalId}/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action,
          comment: action === 'comment' ? prompt('Kommentar eingeben:') : undefined
        })
      });
      
      if (response.ok) {
        // Update local state
        setProposals(prev => prev.map(p => 
          p.id === proposalId 
            ? { ...p, status: action, updatedAt: new Date().toISOString() }
            : p
        ));
        
        showNotification(`Proposal ${action === 'approve' ? 'genehmigt' : 'abgelehnt'}`, 'success');
      }
    } catch (error) {
      console.error('Proposal action failed:', error);
      showNotification('Aktion fehlgeschlagen', 'error');
    } finally {
      setActionLoading(null);
    }
  };
  
  const handleKeyboardShortcuts = (event: KeyboardEvent) => {
    if (selectedProposal) {
      switch (event.key.toLowerCase()) {
        case 'a':
          handleProposalAction(selectedProposal.id, 'approve');
          break;
        case 'r':
          handleProposalAction(selectedProposal.id, 'reject');
          break;
        case 'd':
          setShowExplainDrawer(true);
          break;
      }
    }
  };
  
  useEffect(() => {
    document.addEventListener('keydown', handleKeyboardShortcuts);
    return () => document.removeEventListener('keydown', handleKeyboardShortcuts);
  }, [selectedProposal]);
  
  return (
    <div className="proposals">
      <div className="proposals-header">
        <h2>Investment Proposals</h2>
        <div className="proposals-controls">
          <button 
            className="btn btn-primary"
            onClick={() => refetch()}
            disabled={loading}
          >
            {loading ? 'Lade...' : 'Aktualisieren'}
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => setShowExplainDrawer(true)}
            disabled={!selectedProposal}
          >
            Erklärung (D)
          </button>
        </div>
      </div>
      
      <div className="proposals-grid">
        {proposals.map(proposal => (
          <ProposalCard 
            key={proposal.id}
            proposal={proposal}
            onAction={handleProposalAction}
            onSelect={setSelectedProposal}
            loading={actionLoading === proposal.id}
            selected={selectedProposal?.id === proposal.id}
          />
        ))}
      </div>
      
      {showExplainDrawer && selectedProposal && (
        <ExplainDrawer 
          proposal={selectedProposal}
          onClose={() => setShowExplainDrawer(false)}
        />
      )}
    </div>
  );
};
```

## PHASE 3: Risk & Learning Components (ERWEITERT)
### **Risk Metrics Dashboard:**
```typescript
// ui/admin/ai-investments/RiskMetrics.tsx
import React, { useState, useEffect } from 'react';
import { RiskChart } from '../../components/RiskChart';
import { RiskAlerts } from '../../components/RiskAlerts';
import { RiskLimits } from '../../components/RiskLimits';
import { VaRGauge } from '../../components/VaRGauge';
import { CorrelationHeatmap } from '../../components/CorrelationHeatmap';
import { useAPI } from '../../hooks/useAPI';

export const RiskMetrics: React.FC = () => {
  const [riskData, setRiskData] = useState<RiskData | null>(null);
  const [alerts, setAlerts] = useState<RiskAlert[]>([]);
  const [timeframe, setTimeframe] = useState<'1h' | '4h' | '1d' | '1w'>('1d');
  
  const { data: riskMetrics, loading } = useAPI('/risk/metrics', { 
    params: { timeframe } 
  });
  
  useEffect(() => {
    if (riskMetrics) {
      setRiskData(riskMetrics);
      setAlerts(riskMetrics.alerts || []);
    }
  }, [riskMetrics]);
  
  return (
    <div className="risk-metrics">
      <div className="risk-header">
        <h2>Risiko-Metriken</h2>
        <div className="risk-controls">
          <select 
            value={timeframe} 
            onChange={(e) => setTimeframe(e.target.value as any)}
            className="timeframe-select"
          >
            <option value="1h">1 Stunde</option>
            <option value="4h">4 Stunden</option>
            <option value="1d">1 Tag</option>
            <option value="1w">1 Woche</option>
          </select>
        </div>
      </div>
      
      <div className="risk-content">
        <div className="risk-charts">
          <VaRGauge 
            data={riskData?.varData}
            title="Value at Risk (VaR)"
            threshold={0.05}
          />
          <CorrelationHeatmap 
            data={riskData?.correlationMatrix}
            title="Korrelations-Matrix"
          />
          <RiskChart 
            data={riskData?.volatilityChart}
            title="Volatilität"
            type="bar"
          />
        </div>
        
        <div className="risk-sidebar">
          <RiskAlerts 
            alerts={alerts}
            onAction={handleAlertAction}
          />
          <RiskLimits 
            limits={riskData?.limits}
            current={riskData?.current}
          />
        </div>
      </div>
    </div>
  );
};
```

### **Learning Metrics:**
```typescript
// ui/admin/ai-investments/LearningMetrics.tsx
import React, { useState, useEffect } from 'react';
import { LearningChart } from '../../components/LearningChart';
import { HitRateMetrics } from '../../components/HitRateMetrics';
import { SharpeRatio } from '../../components/SharpeRatio';
import { ReliabilityMetrics } from '../../components/ReliabilityMetrics';
import { PromptABTesting } from '../../components/PromptABTesting';
import { useAPI } from '../../hooks/useAPI';

export const LearningMetrics: React.FC = () => {
  const [learningData, setLearningData] = useState<LearningData | null>(null);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');
  
  const { data: metrics, loading } = useAPI('/learning/metrics', { 
    params: { timeframe } 
  });
  
  useEffect(() => {
    if (metrics) {
      setLearningData(metrics);
    }
  }, [metrics]);
  
  return (
    <div className="learning-metrics">
      <div className="learning-header">
        <h2>Lern-Metriken</h2>
        <div className="learning-controls">
          <select 
            value={timeframe} 
            onChange={(e) => setTimeframe(e.target.value as any)}
            className="timeframe-select"
          >
            <option value="7d">7 Tage</option>
            <option value="30d">30 Tage</option>
            <option value="90d">90 Tage</option>
          </select>
        </div>
      </div>
      
      <div className="learning-content">
        <div className="learning-charts">
          <HitRateMetrics 
            data={learningData?.hitRates}
            title="Hit Rate (7/30/90 Tage)"
          />
          <SharpeRatio 
            data={learningData?.sharpeRatios}
            title="Sharpe Ratio"
          />
          <ReliabilityMetrics 
            data={learningData?.reliability}
            title="Zuverlässigkeit"
          />
        </div>
        
        <div className="learning-sidebar">
          <PromptABTesting 
            data={learningData?.abTests}
            title="Prompt A/B Testing"
          />
        </div>
      </div>
    </div>
  );
};
```

## PHASE 4: Performance & Accessibility (ERWEITERT)
### **Virtual Scrolling Implementation:**
```typescript
// ui/components/VirtualList.tsx
import React, { useState, useEffect, useRef } from 'react';

export const VirtualList: React.FC<VirtualListProps> = ({
  items,
  itemHeight,
  containerHeight,
  renderItem
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [visibleItems, setVisibleItems] = useState<VisibleItem[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    
    const visible = items.slice(startIndex, endIndex).map((item, index) => ({
      item,
      index: startIndex + index,
      top: (startIndex + index) * itemHeight
    }));
    
    setVisibleItems(visible);
  }, [scrollTop, items, itemHeight, containerHeight]);
  
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  };
  
  return (
    <div 
      ref={containerRef}
      className="virtual-list"
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index, top }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top,
              height: itemHeight,
              width: '100%'
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
};
```

### **Accessibility Features:**
```typescript
// ui/hooks/useAccessibility.ts
export const useAccessibility = () => {
  const [isKeyboardNavigation, setIsKeyboardNavigation] = useState(false);
  const [announcements, setAnnouncements] = useState<string[]>([]);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        setIsKeyboardNavigation(true);
      }
    };
    
    const handleMouseDown = () => {
      setIsKeyboardNavigation(false);
    };
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);
  
  const announce = (message: string) => {
    setAnnouncements(prev => [...prev, message]);
    // Auto-remove after 3 seconds
    setTimeout(() => {
      setAnnouncements(prev => prev.slice(1));
    }, 3000);
  };
  
  const handleKeyboardShortcuts = (event: KeyboardEvent) => {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 'k':
          event.preventDefault();
          openCommandPalette();
          break;
        case 'd':
          event.preventDefault();
          toggleDarkMode();
          break;
        case 'r':
          event.preventDefault();
          refreshData();
          break;
        case 'e':
          event.preventDefault();
          openExportDialog();
          break;
      }
    }
  };
  
  useEffect(() => {
    document.addEventListener('keydown', handleKeyboardShortcuts);
    return () => document.removeEventListener('keydown', handleKeyboardShortcuts);
  }, []);
  
  return {
    isKeyboardNavigation,
    announcements,
    announce
  };
};
```

**Design:** Clean, modern, Dark/Light, ARIA/Keyboard, Skelett-Loader, lehrreiche Empty-States.
**Datenzugriff nur via `packages/api-client`.**

# Zusätzliche Verbesserungen (PRODUCTION-GRADE - OPTIMIERT)
- **What-Changed-Diff** bei Re-Scores
- **CSV/PDF Export** & **Audit-Trail** Ansicht
- **Prefetch/Cache** für häufige Queries
- **Real-time Updates** mit WebSocket/SSE
- **Performance Monitoring** mit Metriken
- **Error Boundaries** für robuste Fehlerbehandlung
- **Progressive Web App** Features
- **Offline Support** mit Service Workers

# Fehlervermeidung – Was schiefgehen kann & Gegenmaßnahmen (ERWEITERT)
- **Layout-Jank** bei Event-Storm.  
  **Fix:** Virtualization + Debounce + RequestAnimationFrame
- **A11y Defizite** (Fokus, ARIA).  
  **Fix:** axe-Checks, Tastatur-Flows, Screen Reader Tests
- **Memory Leaks** → Performance Degradation.  
  **Fix:** Cleanup Listeners, WeakMap Usage, Memory Profiling
- **State Management Issues** → UI Inconsistencies.  
  **Fix:** Centralized State, Immutable Updates, State Validation
- **Network Failures** → Poor User Experience.  
  **Fix:** Offline Support, Retry Logic, Graceful Degradation
- **Browser Compatibility** → Cross-Platform Issues.  
  **Fix:** Polyfills, Feature Detection, Progressive Enhancement

# Akzeptanzkriterien (Definition of Done - ERWEITERT)
- Responsiv, a11y-Checks grün, Shortcuts funktionieren, keine direkten Secrets im FE
- **Performance Benchmarks** erreicht (< 2s Load Time, < 100ms Interaction)
- **Accessibility Standards** erfüllt (WCAG 2.1 AA)
- **Cross-Browser Compatibility** getestet (Chrome, Firefox, Safari, Edge)
- **Mobile Responsiveness** vollständig implementiert
- **Dark/Light Mode** funktional und getestet
- **Keyboard Navigation** vollständig implementiert
- **Screen Reader Support** getestet und funktional
- **Export Functionality** vollständig implementiert (CSV/PDF)

# Build/Test-Gates & Verifikation (AUSFÜHREN - OPTIMIERT)
```bash
# E2E Tests
./scripts/test:e2e:admin
./scripts/test:e2e:signals
./scripts/test:e2e:proposals

# Accessibility Tests
./scripts/test:a11y:admin
./scripts/test:a11y:components

# Performance Tests
./scripts/test:performance:admin
./scripts/test:performance:components

# Lighthouse Tests
./scripts/test:lighthouse:admin
./scripts/test:lighthouse:mobile

# Cross-Browser Tests
./scripts/test:browser:admin
./scripts/test:browser:components
```

# Artefakte & Deliverables (ERWEITERT)
- `ui/admin/ai-investments/*` (vollständige Admin Interface)
- **Style-Guide** (Design System, Component Library)
- **Accessibility Report** (WCAG Compliance, Screen Reader Tests)
- **Performance Report** (Load Times, Interaction Times, Memory Usage)
- **Cross-Browser Report** (Compatibility Matrix, Issues)
- **Mobile Report** (Responsive Design, Touch Interactions)
- **Export Tools** (CSV/PDF Generation, Audit Trail)
- **Documentation** (User Guide, Developer Guide, API Documentation)
- **Testing Suite** (E2E Tests, A11y Tests, Performance Tests)

