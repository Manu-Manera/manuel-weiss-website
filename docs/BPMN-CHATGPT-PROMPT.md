# BPMN-Generierung mit ChatGPT – optimierter Prompt

Wenn du BPMN direkt in **ChatGPT** (Chat) erzeugen willst, nutze den folgenden Prompt. Einfach kopieren, in ChatGPT einfügen und unten deine Prozessbeschreibung ergänzen.

---

## Prompt (in ChatGPT einfügen)

```
Du bist ein BPMN-2.0-Experte. Analysiere meine Prozessbeschreibung intelligent und erzeuge daraus valides BPMN 2.0 XML.

Smart erkennen – analysiere den Text und erkenne:
- Rollen/Akteure: Wer handelt? (Mitarbeiter, Teamleitung, HR, …) → mindestens ein Task pro Rolle.
- Einzelaktionen: Auch wenn mehrere mit "und" in einem Satz stehen ("gibt ein und hinterlegt und erzeugt") → jede Tätigkeit wird ein eigener Task.
- Entscheidungen: "oder", "bestätigt oder lehnt ab" → als exclusiveGateway mit zwei Wegen modellieren.
- Reihenfolge: Was passiert nacheinander? Flows und Abhängigkeiten aus dem Text ableiten.

Dann BPMN erzeugen: mehrere bpmn:task mit Namen "[Rolle]: [Aktion]", sequenceFlow in der erkannten Reihenfolge, bei Verzweigungen bpmn:exclusiveGateway. Keine Pauschaltasks – immer die erkannten Rollen und Einzelaktionen abbilden.

Technik:
- XML mit <?xml version="1.0" encoding="UTF-8"?>, Namespaces bpmn, bpmndi, dc, di (BPMN 2.0 Standard).
- bpmn:process isExecutable="true", bpmn:startEvent, mehrere bpmn:task, bpmn:endEvent, bpmn:sequenceFlow; bei Entscheidungen bpmn:exclusiveGateway.
- Optional: bpmndi:BPMNDiagram mit BPMNPlane, BPMNShape, BPMNEdge für bpmn.io.
- Antworte nur mit dem XML, ohne ``` oder Erklärungen.

Prozessbeschreibung:
[HIER DEINE STORY EINFÜGEN – z.B.: Mitarbeiter startet. Teamleitung bestätigt oder lehnt ab. HR gibt in Kernsystem ein und hinterlegt im Dossier und erzeugt Bestätigung.]
```

---

## Beispiel

**Eingabe (Prozessbeschreibung):**  
Mitarbeiter startet. Teamleitung bestätigt oder lehnt ab. HR gibt in Kernsystem ein und hinterlegt im Dossier und erzeugt Bestätigung.

**Erwartung:**  
Mehrere Tasks, u.a.: „Mitarbeiter: … starten“, „Teamleitung: Bestätigen“ / „Ablehnen“ (oder Gateway), „HR: Im Kernsystem eingeben“, „HR: Im Dossier hinterlegen“, „HR: Bestätigung erzeugen“ – mit passenden sequenceFlows.

Das erhaltene XML kannst du in bpmn-generator.html einfügen (Tab „XML“) oder in demo.bpmn.io öffnen.
