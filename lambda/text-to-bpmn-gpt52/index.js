/**
 * AWS Lambda: Text-to-BPMN mit GPT-5.2
 * Generiert BPMN 2.0 XML aus Prozessbeschreibung (Text) per OpenAI GPT-5.2.
 * 
 * NEUER ANSATZ: GPT liefert strukturiertes JSON, wir generieren daraus BPMN XML + DI.
 * Das ist flexibler und robuster als Regex-Parsing von GPT-generiertem XML.
 * 
 * POST Body: { text: string, processId?: string, openaiApiKey: string }
 * Response: { success: true, bpmnXml: string, interpretation?: string, assumptions?: string }
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

const SYSTEM_PROMPT = `Du bist ein erfahrener BPMN-2.0-Prozessmodellierer. Analysiere den Text GENAU und erstelle ein fachlich korrektes Prozessdiagramm.

WICHTIG - TEXTANALYSE:
1. Lies den Text SEHR SORGFÄLTIG und verstehe die Geschäftslogik
2. Achte auf Bedingungen: "wenn X, dann Y" - was passiert bei X und was bei NICHT-X?
3. Schwellenwerte verstehen: "unter 5000" bedeutet < 5000, "ab 5000" bedeutet >= 5000
4. Unterscheide: Welche Schritte sind NUR bei bestimmten Bedingungen nötig?

REGELN:
1. Ein Schritt = ein Task. Rolle im Namen: "HR: Antrag prüfen", "Mitarbeiter: Formular ausfüllen"
2. Entscheidungen → exclusiveGateway mit beschreibenden Labels (z.B. "< 5000 Fr.", ">= 5000 Fr.")
3. Mindestens 3-5 Tasks pro Prozess
4. Bei mehreren Schwellenwerten: Mehrere Gateways NACHEINANDER verwenden

LAYOUT (SEHR WICHTIG):
- row = Zeile (0, 1, 2...), col = Spalte (0, 1, 2...)
- Start IMMER bei row:0, col:0
- Hauptpfad (häufigster Fall): row:0, col erhöht sich
- Verzweigungen: VERSCHIEDENE ZEILEN (row) für verschiedene Pfade!
- Gateway-Ausgänge: Ein Pfad geht RECHTS weiter (gleiche row), andere Pfade gehen NACH UNTEN (row+1, row+2...)
- JEDE Position (row,col) nur EINMAL verwenden!
- Pfade die wieder zusammenführen: Verwende ein weiteres Gateway zum Zusammenführen

BEISPIEL MIT SCHWELLENWERTEN:
{
  "processId": "Process_1",
  "processName": "Weiterbildungsantrag",
  "interpretation": "Genehmigungsprozess abhängig von Kosten",
  "assumptions": ["Unter 5000 Fr. keine Vereinbarung nötig"],
  "elements": [
    {"id": "Start_1", "type": "startEvent", "name": "Start", "row": 0, "col": 0},
    {"id": "Task_1", "type": "userTask", "name": "Mitarbeiter: Weiterbildung beantragen", "row": 0, "col": 1},
    {"id": "Gateway_1", "type": "exclusiveGateway", "name": "Kosten?", "row": 0, "col": 2},
    {"id": "Task_2", "type": "userTask", "name": "Teamleitung: Genehmigen", "row": 0, "col": 3},
    {"id": "Gateway_2", "type": "exclusiveGateway", "name": "Kosten >= 5000?", "row": 1, "col": 3},
    {"id": "Task_3", "type": "userTask", "name": "Bereichsleitung: Genehmigen", "row": 1, "col": 4},
    {"id": "Task_4", "type": "userTask", "name": "HR: Vereinbarung erstellen", "row": 1, "col": 5},
    {"id": "Task_5", "type": "userTask", "name": "Mitarbeiter: Vereinbarung unterschreiben", "row": 1, "col": 6},
    {"id": "Gateway_3", "type": "exclusiveGateway", "name": "Zusammenführung", "row": 0, "col": 7},
    {"id": "Task_6", "type": "userTask", "name": "HR: Skills eintragen", "row": 0, "col": 8},
    {"id": "End_1", "type": "endEvent", "name": "Ende", "row": 0, "col": 9}
  ],
  "flows": [
    {"id": "Flow_1", "source": "Start_1", "target": "Task_1"},
    {"id": "Flow_2", "source": "Task_1", "target": "Gateway_1"},
    {"id": "Flow_3", "source": "Gateway_1", "target": "Task_2", "name": "< 5000 Fr."},
    {"id": "Flow_4", "source": "Gateway_1", "target": "Gateway_2", "name": ">= 5000 Fr."},
    {"id": "Flow_5", "source": "Gateway_2", "target": "Task_3", "name": "< 10000 Fr."},
    {"id": "Flow_6", "source": "Gateway_2", "target": "Task_3", "name": ">= 10000 Fr."},
    {"id": "Flow_7", "source": "Task_2", "target": "Gateway_3"},
    {"id": "Flow_8", "source": "Task_3", "target": "Task_4"},
    {"id": "Flow_9", "source": "Task_4", "target": "Task_5"},
    {"id": "Flow_10", "source": "Task_5", "target": "Gateway_3"},
    {"id": "Flow_11", "source": "Gateway_3", "target": "Task_6"},
    {"id": "Flow_12", "source": "Task_6", "target": "End_1"}
  ]
}

ELEMENT-TYPEN: startEvent, endEvent, task, userTask, serviceTask, manualTask, exclusiveGateway, parallelGateway

KRITISCH:
- Gib NUR das JSON aus, keinen anderen Text!
- JEDES Element MUSS row und col haben!
- KEINE zwei Elemente dürfen gleiche row UND col haben!
- Task-Namen MÜSSEN mit Rolle beginnen
- Gateway-Ausgänge MÜSSEN auf VERSCHIEDENEN Zeilen (rows) liegen!
- Verstehe die Geschäftslogik GENAU bevor du modellierst!`;

function normalizeProcessText(text) {
  if (!text || typeof text !== 'string') return '';
  return text.trim().replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').replace(/[ \t]+/g, ' ').substring(0, 8000);
}

function buildUserMessage(text) {
  return `Prozess-Text:\n\n${normalizeProcessText(text)}`;
}

/**
 * Parst die GPT-Antwort und extrahiert das JSON.
 */
function parseJsonResponse(content) {
  const raw = (content || '').trim();
  
  // Versuche JSON aus Code-Block zu extrahieren
  const jsonBlockMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonBlockMatch) {
    try {
      return JSON.parse(jsonBlockMatch[1].trim());
    } catch (e) {
      console.warn('JSON parse from code block failed:', e.message);
    }
  }
  
  // Versuche direktes JSON zu parsen
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.warn('JSON parse failed:', e.message);
    }
  }
  
  return null;
}

/**
 * Generiert BPMN XML aus dem strukturierten JSON.
 */
function generateBpmnXmlFromJson(data, processId) {
  const pid = data.processId || processId || 'Process_1';
  const pname = escapeXml(data.processName || 'Prozess');
  const elements = data.elements || [];
  const flows = data.flows || [];
  const lanes = data.lanes || [];
  
  let processContent = '';
  
  // Lanes (optional)
  if (lanes.length > 0) {
    processContent += '    <bpmn:laneSet id="LaneSet_1">\n';
    for (const lane of lanes) {
      processContent += `      <bpmn:lane id="${lane.id}" name="${escapeXml(lane.name)}">\n`;
      for (const elId of (lane.elementIds || [])) {
        processContent += `        <bpmn:flowNodeRef>${elId}</bpmn:flowNodeRef>\n`;
      }
      processContent += '      </bpmn:lane>\n';
    }
    processContent += '    </bpmn:laneSet>\n';
  }
  
  // Elements
  for (const el of elements) {
    const type = el.type || 'task';
    const bpmnType = mapToBpmnType(type);
    const name = escapeXml(el.name || '');
    
    // Finde eingehende und ausgehende Flows
    const incoming = flows.filter(f => f.target === el.id).map(f => f.id);
    const outgoing = flows.filter(f => f.source === el.id).map(f => f.id);
    
    processContent += `    <bpmn:${bpmnType} id="${el.id}" name="${name}"`;
    
    if (incoming.length === 0 && outgoing.length === 0) {
      processContent += '/>\n';
    } else {
      processContent += '>\n';
      for (const inc of incoming) {
        processContent += `      <bpmn:incoming>${inc}</bpmn:incoming>\n`;
      }
      for (const out of outgoing) {
        processContent += `      <bpmn:outgoing>${out}</bpmn:outgoing>\n`;
      }
      processContent += `    </bpmn:${bpmnType}>\n`;
    }
  }
  
  // Sequence Flows
  for (const flow of flows) {
    const name = flow.name ? ` name="${escapeXml(flow.name)}"` : '';
    processContent += `    <bpmn:sequenceFlow id="${flow.id}" sourceRef="${flow.source}" targetRef="${flow.target}"${name}/>\n`;
  }
  
  // Generiere DI (Diagram Interchange)
  const diXml = generateDiXml(elements, flows, pid);
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_1">
  <bpmn:process id="${pid}" name="${pname}" isExecutable="true">
${processContent}  </bpmn:process>
${diXml}
</bpmn:definitions>`;
}

/**
 * Mappt Element-Typen auf BPMN-Typen.
 */
function mapToBpmnType(type) {
  const mapping = {
    'startEvent': 'startEvent',
    'endEvent': 'endEvent',
    'task': 'task',
    'userTask': 'userTask',
    'serviceTask': 'serviceTask',
    'manualTask': 'manualTask',
    'scriptTask': 'scriptTask',
    'sendTask': 'sendTask',
    'receiveTask': 'receiveTask',
    'exclusiveGateway': 'exclusiveGateway',
    'parallelGateway': 'parallelGateway',
    'inclusiveGateway': 'inclusiveGateway',
    'eventBasedGateway': 'eventBasedGateway'
  };
  return mapping[type] || 'task';
}

/**
 * Generiert DI (Diagram Interchange) XML mit intelligentem Layout.
 */
function generateDiXml(elements, flows, processId) {
  if (!elements || elements.length === 0) return '';
  
  // Berechne Layout basierend auf Flow-Struktur
  const positions = calculateLayout(elements, flows);
  
  let diXml = `  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="${processId}">
`;
  
  // Shapes
  for (const el of elements) {
    const pos = positions[el.id];
    if (pos) {
      diXml += `      <bpmndi:BPMNShape id="${el.id}_di" bpmnElement="${el.id}">
        <dc:Bounds x="${pos.x}" y="${pos.y}" width="${pos.width}" height="${pos.height}"/>
      </bpmndi:BPMNShape>
`;
    }
  }
  
  // Edges - mit Kollisionsvermeidung und Label-Positionierung
  for (const flow of flows) {
    const srcPos = positions[flow.source];
    const tgtPos = positions[flow.target];
    if (srcPos && tgtPos) {
      const waypoints = calculateWaypointsWithAvoidance(srcPos, tgtPos, positions, flow.source, flow.target);
      diXml += `      <bpmndi:BPMNEdge id="${flow.id}_di" bpmnElement="${flow.id}">
`;
      for (const wp of waypoints) {
        diXml += `        <di:waypoint x="${Math.round(wp.x)}" y="${Math.round(wp.y)}"/>
`;
      }
      
      // Label-Position für Flows mit Namen - intelligent positionieren
      if (flow.name && waypoints.length >= 2) {
        const wp0 = waypoints[0];
        const wp1 = waypoints[1];
        
        // Bestimme Richtung des ersten Segments
        const goesRight = wp1.x > wp0.x;
        const goesDown = wp1.y > wp0.y;
        const goesUp = wp1.y < wp0.y;
        
        let labelX, labelY;
        
        if (goesDown) {
          // Pfad geht nach unten (Nein-Pfad) - Label links neben dem vertikalen Segment
          labelX = wp0.x - flow.name.length * 4 - 5;
          labelY = wp0.y + 10;
        } else if (goesUp) {
          // Pfad geht nach oben - Label links neben dem vertikalen Segment
          labelX = wp0.x - flow.name.length * 4 - 5;
          labelY = wp0.y - 20;
        } else if (goesRight) {
          // Pfad geht nach rechts (Ja-Pfad) - Label über dem horizontalen Segment
          labelX = wp0.x + 10;
          labelY = wp0.y - 18;
        } else {
          // Fallback
          labelX = wp0.x + 5;
          labelY = wp0.y - 15;
        }
        
        diXml += `        <bpmndi:BPMNLabel>
          <dc:Bounds x="${Math.round(labelX)}" y="${Math.round(labelY)}" width="${flow.name.length * 7}" height="14"/>
        </bpmndi:BPMNLabel>
`;
      }
      
      diXml += `      </bpmndi:BPMNEdge>
`;
    }
  }
  
  diXml += `    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>`;
  
  return diXml;
}

/**
 * Berechnet Layout-Positionen basierend auf row/col aus dem JSON.
 * Falls row/col fehlen, wird ein Fallback-Algorithmus verwendet.
 * Enthält Kollisionserkennung und -korrektur.
 */
function calculateLayout(elements, flows) {
  const positions = {};
  
  // Konstanten für das Grid-Layout (vergrößert für besseres Routing)
  const startX = 150;       // Mehr Rand links
  const startY = 100;       // Mehr Rand oben
  const cellWidth = 220;    // Breiter für Routing-Kanäle zwischen Elementen
  const cellHeight = 150;   // Höher für vertikale Routing-Kanäle
  const minSpacing = 30;    // Mindestabstand zwischen Elementen
  
  // Prüfe ob row/col vorhanden sind
  const hasGridInfo = elements.some(el => el.row !== undefined && el.col !== undefined);
  
  // Schritt 1: Korrigiere row/col bei Duplikaten
  const correctedElements = fixDuplicatePositions(elements, flows);
  
  if (hasGridInfo) {
    // Nutze row/col aus dem JSON für sauberes Grid-Layout
    for (const el of correctedElements) {
      const row = el.row ?? 0;
      const col = el.col ?? 0;
      const dims = getElementDimensions(el.type);
      
      // Berechne Position basierend auf Grid
      const x = startX + col * cellWidth + (cellWidth - dims.width) / 2;
      const y = startY + row * cellHeight + (cellHeight - dims.height) / 2;
      
      positions[el.id] = {
        x: Math.round(x),
        y: Math.round(y),
        width: dims.width,
        height: dims.height,
        row: row,
        col: col
      };
    }
  } else {
    // Fallback: Berechne Layout basierend auf Flow-Struktur
    const depths = {};
    const rows = {};
    const visited = new Set();
    
    // BFS für Tiefenberechnung
    const startElements = correctedElements.filter(el => 
      el.type === 'startEvent' || !flows.some(f => f.target === el.id)
    );
    
    const queue = startElements.map(el => ({ id: el.id, depth: 0, row: 0 }));
    while (queue.length > 0) {
      const { id, depth, row } = queue.shift();
      if (visited.has(id)) continue;
      visited.add(id);
      depths[id] = depth;
      rows[id] = row;
      
      const outgoing = flows.filter(f => f.source === id);
      outgoing.forEach((flow, idx) => {
        if (!visited.has(flow.target)) {
          queue.push({ id: flow.target, depth: depth + 1, row: row + idx });
        }
      });
    }
    
    for (const el of correctedElements) {
      const col = depths[el.id] ?? 0;
      const row = rows[el.id] ?? 0;
      const dims = getElementDimensions(el.type);
      
      const x = startX + col * cellWidth + (cellWidth - dims.width) / 2;
      const y = startY + row * cellHeight + (cellHeight - dims.height) / 2;
      
      positions[el.id] = {
        x: Math.round(x),
        y: Math.round(y),
        width: dims.width,
        height: dims.height,
        row: row,
        col: col
      };
    }
  }
  
  // Schritt 2: Prüfe und korrigiere Überlappungen
  resolveOverlaps(positions, minSpacing);
  
  return positions;
}

/**
 * Korrigiert doppelte row/col Positionen.
 */
function fixDuplicatePositions(elements, flows) {
  const corrected = elements.map(el => ({ ...el }));
  const occupied = new Map(); // "row,col" -> element id
  
  // Sortiere nach Flow-Reihenfolge (Start zuerst)
  const elementOrder = [];
  const visited = new Set();
  
  function visit(id) {
    if (visited.has(id)) return;
    visited.add(id);
    elementOrder.push(id);
    const outgoing = flows.filter(f => f.source === id);
    for (const flow of outgoing) {
      visit(flow.target);
    }
  }
  
  // Starte mit startEvent
  const startEl = corrected.find(el => el.type === 'startEvent');
  if (startEl) visit(startEl.id);
  
  // Füge nicht besuchte Elemente hinzu
  for (const el of corrected) {
    if (!visited.has(el.id)) {
      elementOrder.push(el.id);
    }
  }
  
  // Gehe in Flow-Reihenfolge durch und korrigiere Duplikate
  for (const elId of elementOrder) {
    const el = corrected.find(e => e.id === elId);
    if (!el || el.row === undefined || el.col === undefined) continue;
    
    let row = el.row;
    let col = el.col;
    const key = `${row},${col}`;
    
    if (occupied.has(key)) {
      // Position ist bereits belegt - finde freie Position
      // Versuche erst gleiche Spalte, nächste Zeile
      let newRow = row + 1;
      while (occupied.has(`${newRow},${col}`)) {
        newRow++;
      }
      el.row = newRow;
      console.log(`Kollision korrigiert: ${el.id} von (${row},${col}) nach (${newRow},${col})`);
    }
    
    occupied.set(`${el.row},${el.col}`, el.id);
  }
  
  return corrected;
}

/**
 * Löst verbleibende Überlappungen durch Verschieben von Elementen.
 */
function resolveOverlaps(positions, minSpacing) {
  const ids = Object.keys(positions);
  let hasOverlap = true;
  let iterations = 0;
  const maxIterations = 50;
  
  while (hasOverlap && iterations < maxIterations) {
    hasOverlap = false;
    iterations++;
    
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const a = positions[ids[i]];
        const b = positions[ids[j]];
        
        if (checkOverlap(a, b, minSpacing)) {
          hasOverlap = true;
          
          // Verschiebe Element b nach unten oder rechts
          const overlapX = (a.x + a.width + minSpacing) - b.x;
          const overlapY = (a.y + a.height + minSpacing) - b.y;
          
          if (overlapY > 0 && overlapY < overlapX) {
            // Verschiebe nach unten
            b.y = a.y + a.height + minSpacing;
            b.row = (b.row || 0) + 1;
          } else if (overlapX > 0) {
            // Verschiebe nach rechts
            b.x = a.x + a.width + minSpacing;
            b.col = (b.col || 0) + 1;
          }
        }
      }
    }
  }
  
  if (iterations >= maxIterations) {
    console.warn('Max iterations reached in resolveOverlaps');
  }
}

/**
 * Prüft ob zwei Elemente sich überlappen.
 */
function checkOverlap(a, b, spacing = 0) {
  return !(
    a.x + a.width + spacing <= b.x ||
    b.x + b.width + spacing <= a.x ||
    a.y + a.height + spacing <= b.y ||
    b.y + b.height + spacing <= a.y
  );
}

/**
 * Gibt die Dimensionen für einen Element-Typ zurück.
 */
function getElementDimensions(type) {
  if (type === 'startEvent' || type === 'endEvent') {
    return { width: 36, height: 36 };
  }
  if (type.includes('Gateway') || type.includes('gateway')) {
    return { width: 50, height: 50 };
  }
  return { width: 100, height: 80 };
}

/**
 * Prüft ob eine horizontale oder vertikale Linie ein Rechteck schneidet.
 */
function lineIntersectsRect(x1, y1, x2, y2, rect, padding = 5) {
  const left = rect.x - padding;
  const right = rect.x + rect.width + padding;
  const top = rect.y - padding;
  const bottom = rect.y + rect.height + padding;
  
  // Horizontale Linie
  if (y1 === y2) {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    return y1 > top && y1 < bottom && maxX > left && minX < right;
  }
  
  // Vertikale Linie
  if (x1 === x2) {
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    return x1 > left && x1 < right && maxY > top && minY < bottom;
  }
  
  return false;
}

/**
 * Prüft ob ein Pfad durch irgendein Element geht (außer src und tgt).
 */
function pathIntersectsElements(waypoints, positions, srcId, tgtId) {
  const obstacles = Object.entries(positions)
    .filter(([id]) => id !== srcId && id !== tgtId)
    .map(([id, pos]) => pos);
  
  for (let i = 0; i < waypoints.length - 1; i++) {
    const p1 = waypoints[i];
    const p2 = waypoints[i + 1];
    
    for (const obstacle of obstacles) {
      if (lineIntersectsRect(p1.x, p1.y, p2.x, p2.y, obstacle)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Berechnet Waypoints für BPMN-konforme Verbindungen.
 * 
 * REGELN:
 * 1. Tasks/Events: Immer LINKS rein, RECHTS raus
 * 2. Gateways: 
 *    - Hauptpfad (Ja): RECHTS raus
 *    - Alternativpfad (Nein): UNTEN raus
 *    - Eingang: LINKS rein
 * 3. Pfeile dürfen NIEMALS durch Elemente gehen
 * 4. Rechtwinklige Verbindungen (nur horizontal/vertikal)
 */
function calculateWaypointsWithAvoidance(src, tgt, positions, srcId, tgtId) {
  // Positionen berechnen
  const srcRight = src.x + src.width;
  const srcLeft = src.x;
  const srcCenterX = src.x + src.width / 2;
  const srcCenterY = src.y + src.height / 2;
  const srcBottom = src.y + src.height;
  const srcTop = src.y;
  
  const tgtRight = tgt.x + tgt.width;
  const tgtLeft = tgt.x;
  const tgtCenterX = tgt.x + tgt.width / 2;
  const tgtCenterY = tgt.y + tgt.height / 2;
  const tgtTop = tgt.y;
  const tgtBottom = tgt.y + tgt.height;
  
  // Prüfe ob Source ein Gateway ist (darf von allen Seiten ausgehen)
  const srcIsGateway = src.width === 50; // Gateways sind 50x50
  const tgtIsGateway = tgt.width === 50;
  
  // Prüfe ob Ziel ein Event ist (Start/End - 36x36)
  const tgtIsEvent = tgt.width === 36;
  
  // Richtungen bestimmen
  const tgtIsRight = tgt.x > src.x;
  const tgtIsLeft = tgt.x < src.x;
  const tgtIsBelow = tgt.y > src.y;
  const tgtIsAbove = tgt.y < src.y;
  const sameRow = Math.abs(srcCenterY - tgtCenterY) < 30;
  const sameCol = Math.abs(srcCenterX - tgtCenterX) < 30;
  
  // Berechne globale Grenzen für Routing-Kanäle
  let globalMinY = Infinity, globalMaxY = -Infinity;
  let globalMinX = Infinity, globalMaxX = -Infinity;
  for (const pos of Object.values(positions)) {
    globalMinY = Math.min(globalMinY, pos.y);
    globalMaxY = Math.max(globalMaxY, pos.y + pos.height);
    globalMinX = Math.min(globalMinX, pos.x);
    globalMaxX = Math.max(globalMaxX, pos.x + pos.width);
  }
  const ROUTE_GAP = 50;
  
  // ============================================
  // SPEZIALFALL: Ziel ist ein End-Event - IMMER von links rein!
  // ============================================
  if (tgtIsEvent) {
    // End-Event muss immer von links angesteuert werden
    if (sameRow && tgtIsRight) {
      // Direkte horizontale Verbindung
      return [
        { x: srcRight, y: srcCenterY },
        { x: tgtLeft, y: tgtCenterY }
      ];
    }
    
    // Event ist auf anderer Zeile - route so dass wir von links reinkommen
    if (srcIsGateway) {
      // Gateway: unten raus, dann horizontal zum Event
      return [
        { x: srcCenterX, y: srcBottom },
        { x: srcCenterX, y: tgtCenterY },
        { x: tgtLeft, y: tgtCenterY }
      ];
    }
    
    // Task/andere: rechts raus, dann zum Event von links
    const midX = srcRight + 30;
    return [
      { x: srcRight, y: srcCenterY },
      { x: midX, y: srcCenterY },
      { x: midX, y: tgtCenterY },
      { x: tgtLeft, y: tgtCenterY }
    ];
  }
  
  // ============================================
  // FALL 1: Ziel ist RECHTS auf gleicher Zeile (Hauptpfad)
  // ============================================
  if (tgtIsRight && sameRow) {
    // Gateway oder Task: rechts raus, links rein
    return [
      { x: srcRight, y: srcCenterY },
      { x: tgtLeft, y: tgtCenterY }
    ];
  }
  
  // ============================================
  // FALL 2: Gateway → Ziel ist UNTEN (Nein-Pfad)
  // Gateway geht UNTEN raus, dann horizontal zum Ziel
  // ============================================
  if (srcIsGateway && tgtIsBelow) {
    // Gateway: UNTEN raus für Alternativpfade
    const directPath = [
      { x: srcCenterX, y: srcBottom },
      { x: srcCenterX, y: tgtCenterY },
      { x: tgtLeft, y: tgtCenterY }
    ];
    
    if (!pathIntersectsElements(directPath, positions, srcId, tgtId)) {
      return directPath;
    }
    
    // Alternative wenn blockiert: weiter unten routen
    const routeY = Math.max(srcBottom + 30, tgtCenterY);
    return [
      { x: srcCenterX, y: srcBottom },
      { x: srcCenterX, y: routeY },
      { x: tgtLeft - 20, y: routeY },
      { x: tgtLeft - 20, y: tgtCenterY },
      { x: tgtLeft, y: tgtCenterY }
    ];
  }
  
  // ============================================
  // FALL 3: Ziel ist RECHTS-UNTEN oder RECHTS-OBEN (kein Gateway)
  // ============================================
  if (tgtIsRight) {
    // Task: rechts raus, Knick, links rein
    const midX = srcRight + (tgtLeft - srcRight) / 2;
    
    const directPath = [
      { x: srcRight, y: srcCenterY },
      { x: midX, y: srcCenterY },
      { x: midX, y: tgtCenterY },
      { x: tgtLeft, y: tgtCenterY }
    ];
    
    if (!pathIntersectsElements(directPath, positions, srcId, tgtId)) {
      return directPath;
    }
    
    // Alternative: Route außen herum
    if (tgtIsBelow) {
      const routeY = globalMaxY + ROUTE_GAP;
      return [
        { x: srcRight, y: srcCenterY },
        { x: srcRight + 20, y: srcCenterY },
        { x: srcRight + 20, y: routeY },
        { x: tgtLeft - 20, y: routeY },
        { x: tgtLeft - 20, y: tgtCenterY },
        { x: tgtLeft, y: tgtCenterY }
      ];
    } else {
      const routeY = globalMinY - ROUTE_GAP;
      return [
        { x: srcRight, y: srcCenterY },
        { x: srcRight + 20, y: srcCenterY },
        { x: srcRight + 20, y: routeY },
        { x: tgtLeft - 20, y: routeY },
        { x: tgtLeft - 20, y: tgtCenterY },
        { x: tgtLeft, y: tgtCenterY }
      ];
    }
  }
  
  // ============================================
  // FALL 4: Ziel ist UNTEN (gleiche Spalte) - Gateway direkt runter
  // ============================================
  if (tgtIsBelow && sameCol && srcIsGateway) {
    return [
      { x: srcCenterX, y: srcBottom },
      { x: tgtCenterX, y: tgtTop }
    ];
  }
  
  // ============================================
  // FALL 4: Ziel ist UNTEN (Gateway nach unten-rechts/links)
  // ============================================
  if (tgtIsBelow && srcIsGateway) {
    // Gateway geht unten raus, dann horizontal zum Ziel
    // Aber: Prüfe ob der Weg frei ist!
    const directPath = [
      { x: srcCenterX, y: srcBottom },
      { x: srcCenterX, y: tgtCenterY },
      { x: tgtLeft, y: tgtCenterY }
    ];
    
    if (!pathIntersectsElements(directPath, positions, srcId, tgtId)) {
      return directPath;
    }
    
    // Alternative: Route UNTER allen Elementen
    const routeY = globalMaxY + ROUTE_GAP;
    return [
      { x: srcCenterX, y: srcBottom },
      { x: srcCenterX, y: routeY },
      { x: tgtLeft - 20, y: routeY },
      { x: tgtLeft - 20, y: tgtCenterY },
      { x: tgtLeft, y: tgtCenterY }
    ];
  }
  
  // ============================================
  // FALL 5: Ziel ist UNTEN (Task muss rechts raus)
  // ============================================
  if (tgtIsBelow) {
    // Route RECHTS vom Diagramm
    const routeX = globalMaxX + ROUTE_GAP;
    return [
      { x: srcRight, y: srcCenterY },
      { x: routeX, y: srcCenterY },
      { x: routeX, y: tgtCenterY },
      { x: tgtLeft, y: tgtCenterY }
    ];
  }
  
  // ============================================
  // FALL 6: Ziel ist LINKS (Rückwärts-Flow)
  // ============================================
  if (tgtIsLeft) {
    // Rückwärts-Flows gehen UNTER dem Diagramm
    const routeY = globalMaxY + ROUTE_GAP;
    
    if (srcIsGateway) {
      return [
        { x: srcCenterX, y: srcBottom },
        { x: srcCenterX, y: routeY },
        { x: tgtLeft - 20, y: routeY },
        { x: tgtLeft - 20, y: tgtCenterY },
        { x: tgtLeft, y: tgtCenterY }
      ];
    }
    
    return [
      { x: srcRight, y: srcCenterY },
      { x: srcRight + 20, y: srcCenterY },
      { x: srcRight + 20, y: routeY },
      { x: tgtLeft - 20, y: routeY },
      { x: tgtLeft - 20, y: tgtCenterY },
      { x: tgtLeft, y: tgtCenterY }
    ];
  }
  
  // ============================================
  // FALL 7: Ziel ist OBEN
  // ============================================
  if (tgtIsAbove) {
    // Route ÜBER allen Elementen
    const routeY = globalMinY - ROUTE_GAP;
    
    if (srcIsGateway) {
      return [
        { x: srcCenterX, y: srcTop },
        { x: srcCenterX, y: routeY },
        { x: tgtLeft - 20, y: routeY },
        { x: tgtLeft - 20, y: tgtCenterY },
        { x: tgtLeft, y: tgtCenterY }
      ];
    }
    
    return [
      { x: srcRight, y: srcCenterY },
      { x: srcRight + 20, y: srcCenterY },
      { x: srcRight + 20, y: routeY },
      { x: tgtLeft - 20, y: routeY },
      { x: tgtLeft - 20, y: tgtCenterY },
      { x: tgtLeft, y: tgtCenterY }
    ];
  }
  
  // ============================================
  // FALLBACK: Sichere Route außen herum
  // ============================================
  const routeY = globalMaxY + ROUTE_GAP;
  return [
    { x: srcRight, y: srcCenterY },
    { x: srcRight + 20, y: srcCenterY },
    { x: srcRight + 20, y: routeY },
    { x: tgtLeft - 20, y: routeY },
    { x: tgtLeft - 20, y: tgtCenterY },
    { x: tgtLeft, y: tgtCenterY }
  ];
}

/**
 * Escaped XML-Sonderzeichen.
 */
function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/\r?\n/g, ' ')
    .trim()
    .substring(0, 150);
}

/**
 * Fallback-BPMN wenn KI kein gültiges JSON liefert.
 */
function buildFallbackBpmnXml(text, processId) {
  const pid = (processId || 'process').replace(/[^a-zA-Z0-9_-]/g, '_');
  const taskName = escapeXml(text.length > 80 ? text.substring(0, 77) + '...' : text || 'Prozess');

  return `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI">
  <bpmn:process id="Proc_${pid}" name="${taskName}" isExecutable="true">
    <bpmn:startEvent id="Start_1" name="Start"/>
    <bpmn:sequenceFlow id="Flow_1" sourceRef="Start_1" targetRef="Task_1"/>
    <bpmn:task id="Task_1" name="${taskName}"/>
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Task_1" targetRef="End_1"/>
    <bpmn:endEvent id="End_1" name="Ende"/>
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Proc_${pid}">
      <bpmndi:BPMNShape id="Start_1_di" bpmnElement="Start_1"><dc:Bounds x="152" y="102" width="36" height="36"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_1_di" bpmnElement="Task_1"><dc:Bounds x="240" y="80" width="100" height="80"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_1_di" bpmnElement="End_1"><dc:Bounds x="392" y="102" width="36" height="36"/></bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_1_di" bpmnElement="Flow_1"><di:waypoint x="188" y="120"/><di:waypoint x="240" y="120"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_2_di" bpmnElement="Flow_2"><di:waypoint x="340" y="120"/><di:waypoint x="392" y="120"/></bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;
}

/**
 * Hauptfunktion: Ruft GPT auf und generiert BPMN.
 */
async function generateBpmnWithGPT52(text, processId, apiKey) {
  const openaiApiUrl = 'https://api.openai.com/v1/chat/completions';

  const response = await fetch(openaiApiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-5.2',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserMessage(text) }
      ],
      max_completion_tokens: 4096,
      temperature: 0.3
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || response.statusText);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';
  
  const jsonData = parseJsonResponse(content);
  
  if (!jsonData || !jsonData.elements || jsonData.elements.length === 0) {
    console.warn('No valid JSON from GPT, using fallback');
    return {
      bpmnXml: buildFallbackBpmnXml(text, processId),
      interpretation: 'Fallback: KI hat kein gültiges JSON geliefert.',
      assumptions: 'ANNAHME: Einfaches Start → Task → Ende Diagramm erstellt.'
    };
  }
  
  const bpmnXml = generateBpmnXmlFromJson(jsonData, processId);
  
  return {
    bpmnXml,
    interpretation: jsonData.interpretation || undefined,
    assumptions: (jsonData.assumptions || []).join('\n') || undefined
  };
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ success: false, error: 'Method not allowed' }) };
  }

  try {
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body || {};
    const text = (body.text || '').trim();
    const processId = body.processId || 'process';
    const openaiApiKey = (body.openaiApiKey || '').trim();

    if (!text) {
      return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ success: false, error: 'text is required' }) };
    }
    if (!openaiApiKey || openaiApiKey.length < 10) {
      return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ success: false, error: 'openaiApiKey is required (im Admin unter API Keys hinterlegen)' }) };
    }

    const result = await generateBpmnWithGPT52(text, processId, openaiApiKey);

    const payload = { success: true, bpmnXml: result.bpmnXml };
    if (result.interpretation) payload.interpretation = result.interpretation;
    if (result.assumptions) payload.assumptions = result.assumptions;

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(payload)
    };
  } catch (e) {
    console.error('text-to-bpmn-gpt52:', e);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ success: false, error: e.message || 'Server error' })
    };
  }
};
