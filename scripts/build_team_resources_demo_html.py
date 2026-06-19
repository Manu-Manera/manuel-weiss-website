#!/usr/bin/env python3
"""Rebuild tempus-demo-team-resources.html from DE Word script (incl. feedback)."""

from __future__ import annotations

import re
from pathlib import Path

HTML_PATH = Path(__file__).resolve().parents[1] / (
    "Onboarding Valkeen/onboarding-app/public/tempus-demo-team-resources.html"
)


def bi(de: str, en: str) -> str:
    return f'<span class="t-de">{de}</span><span class="t-en">{en}</span>'


def fb(de: str, en: str | None = None) -> str:
    en = en or de
    return f"""    <div class="box box-feedback">
      <div class="box-header"><span class="box-icon">🔧</span>{bi("Feedback", "Feedback")}</div>
      <div class="box-body">{bi(de, en)}</div>
    </div>"""


def scene_header(num: str, label: str, act_de: str, act_en: str, title_de: str, title_en: str, sub_de: str, sub_en: str, badge_style: str = "") -> str:
    style = f' style="{badge_style}"' if badge_style else ""
    return f"""  <div class="scene-header">
    <div class="scene-num-badge"{style}><div class="scene-num-big">{num}</div><div class="scene-num-label">{label}</div></div>
    <div class="scene-title-area">
      <div class="scene-act">{bi(act_de, act_en)}</div>
      <div class="scene-title">{bi(title_de, title_en)}</div>
      <div class="scene-subtitle">{bi(sub_de, sub_en)}</div>
    </div>
  </div>"""


def box_story(de: str, en: str) -> str:
    return f"""    <div class="box box-story">
      <div class="box-header"><span class="box-icon">📖</span>{bi("Einstieg", "Intro")}</div>
      <div class="box-body">{bi(de, en)}</div>
    </div>"""


def box_click(steps: list[tuple[str, str]]) -> str:
    items = []
    for i, (de, en) in enumerate(steps, 1):
        items.append(
            f'          <li><div class="click-step-num">{i}</div><div>{bi(de, en)}</div></li>'
        )
    return f"""    <div class="box box-click">
      <div class="box-header"><span class="box-icon">🖱️</span>{bi("Klickpfad", "Click path")}</div>
      <div class="box-body">
        <ul class="click-steps">
{chr(10).join(items)}
        </ul>
      </div>
    </div>"""


def box_say(items: list[tuple[str, str]] | None = None, de_single: str | None = None, en_single: str | None = None) -> str:
    if de_single:
        body = bi(de_single, en_single or de_single)
    else:
        lis = "".join(f"<li>{bi(d, e)}</li>" for d, e in (items or []))
        body = f'<ul style="list-style:disc;padding-left:18px;font-size:14px;line-height:2;">{lis}</ul>'
    return f"""    <div class="box box-say">
      <div class="box-header"><span class="box-icon">🎙️</span>{bi("Erklärpunkte", "Talking points")}</div>
      <div class="box-body">{body}</div>
    </div>"""


def box_impact(de: str, en: str) -> str:
    return f"""    <div class="box box-impact">
      <div class="box-header"><span class="box-icon">⚡</span>{bi("Wirkungssatz", "Impact statement")}</div>
      <div class="box-body">{bi(de, en)}</div>
    </div>"""


def box_context(de: str, en: str) -> str:
    return f"""    <div class="box box-context">
      <div class="box-header"><span class="box-icon">💡</span>{bi("Hintergrund", "Background")}</div>
      <div class="box-body">{bi(de, en)}</div>
    </div>"""


def transition(de: str, en: str) -> str:
    return f'    <div class="transition">→ {bi(de, en)}</div>'


def scene_open(sid: str, tags: str) -> str:
    return f'<div class="scene" id="{sid}">\n{tags}\n  <div class="scene-body">'


def scene_close(trans_de: str | None = None, trans_en: str | None = None) -> str:
    t = ""
    if trans_de:
        t = "\n" + transition(trans_de, trans_en or trans_de)
    return f"{t}\n  </div>\n</div>"


SCENES_HTML = r'''
<!-- ══════════════════════════════════════════════
     SCENE 1 – Resource Management Grid
══════════════════════════════════════════════ -->
<div class="scene" id="team-resources-scene-01">
  <div class="scene-header">
    <div class="scene-num-badge" style="background:linear-gradient(135deg,var(--teal),var(--navy))"><div class="scene-num-big">01</div><div class="scene-num-label">Grid</div></div>
    <div class="scene-title-area">
      <div class="scene-act"><span class="t-de">Block 1 · Übersicht</span><span class="t-en">Block 1 · Overview</span></div>
      <div class="scene-title"><span class="t-de">Team Resources im Resource Management Grid</span><span class="t-en">Team Resources in Resource Management Grid</span></div>
      <div class="scene-subtitle"><span class="t-de">Unterschied Named vs. Team Resource</span><span class="t-en">Named vs. Team Resource</span></div>
    </div>
  </div>
  <div class="scene-tags"><span class="tag tag-teal">Grid</span><span class="tag tag-blue">Filter</span></div>
  <div class="scene-body">
    <div class="box box-story">
      <div class="box-header"><span class="box-icon">📖</span><span class="t-de">Einstieg</span><span class="t-en">Intro</span></div>
      <div class="box-body"><span class="t-de">„Ich starte im <strong>Resource Management Grid</strong>. Team Resources wirken zunächst wie normale Ressourcen — der Unterschied: <strong>Named Resource</strong> = eine Person, <strong>Team Resource</strong> = eine Gruppe, gemeinsam planbar.“</span><span class="t-en">"I start in the <strong>Resource Management Grid</strong>. Team Resources look like normal resources at first — the difference: <strong>Named Resource</strong> = one person, <strong>Team Resource</strong> = a group planned together."</span></div>
    </div>
    <div class="box box-click">
      <div class="box-header"><span class="box-icon">🖱️</span><span class="t-de">Klickpfad</span><span class="t-en">Click path</span></div>
      <div class="box-body"><ul class="click-steps">
        <li><div class="click-step-num">1</div><div><span class="t-de"><span class="click-path">Resource Management</span> Tile</span><span class="t-en"><span class="click-path">Resource Management</span> tile</span></div></li>
        <li><div class="click-step-num">2</div><div><span class="t-de"><span class="click-path">Quick Filter → Team Resources</span></span><span class="t-en"><span class="click-path">Quick Filter → Team Resources</span></span></div></li>
        <li><div class="click-step-num">3</div><div><span class="t-de"><span class="click-path">Columns → Is Team Resource</span></span><span class="t-en"><span class="click-path">Columns → Is Team Resource</span></span></div></li>
      </ul></div>
    </div>
    <div class="box box-feedback">
      <div class="box-header"><span class="box-icon">🔧</span><span class="t-de">Feedback</span><span class="t-en">Feedback</span></div>
      <div class="box-body"><span class="t-de"><strong>Quick Filter:</strong> Bei großem Resource Pool unbedingt zeigen — Kunden schätzen das.</span><span class="t-en"><strong>Quick Filter:</strong> Always show with large resource pools — customers value this.</span></div>
    </div>
    <div class="box box-impact">
      <div class="box-header"><span class="box-icon">⚡</span><span class="t-de">Wirkungssatz</span><span class="t-en">Impact</span></div>
      <div class="box-body"><span class="t-de">„Eine Team Resource ist <strong>keine Person und kein Login-User</strong> — eine planbare Kapazitätseinheit für ein Team.“</span><span class="t-en">"A Team Resource is <strong>not a person or login user</strong> — an assignable capacity unit for a team."</span></div>
    </div>
    <div class="transition">→ <span class="t-de">Team Resource Profile öffnen</span><span class="t-en">Open Team Resource profile</span></div>
  </div>
</div>

<!-- SCENE 2 -->
<div class="scene" id="team-resources-scene-02">
  <div class="scene-header">
    <div class="scene-num-badge"><div class="scene-num-big">02</div><div class="scene-num-label">Profile</div></div>
    <div class="scene-title-area">
      <div class="scene-act"><span class="t-de">Block 2 · Profil</span><span class="t-en">Block 2 · Profile</span></div>
      <div class="scene-title"><span class="t-de">Team Resource Profile öffnen</span><span class="t-en">Open Team Resource Profile</span></div>
      <div class="scene-subtitle"><span class="t-de">Was ist anders als bei Named Resources?</span><span class="t-en">What's different from Named Resources?</span></div>
    </div>
  </div>
  <div class="scene-tags"><span class="tag tag-rm">Profil</span><span class="tag tag-gold">Rate</span></div>
  <div class="scene-body">
    <div class="box box-click">
      <div class="box-header"><span class="box-icon">🖱️</span><span class="t-de">Klickpfad</span><span class="t-en">Click path</span></div>
      <div class="box-body"><ul class="click-steps">
        <li><div class="click-step-num">1</div><div><span class="t-de">Team Resource <strong>E-DOC Delivery Team</strong> öffnen</span><span class="t-en">Open <strong>E-DOC Delivery Team</strong></span></div></li>
        <li><div class="click-step-num">2</div><div><span class="t-de">Attribute Page — fehlende Login-Felder zeigen</span><span class="t-en">Attribute page — show missing login fields</span></div></li>
        <li><div class="click-step-num">3</div><div><span class="t-de">Default Rate / Rate-Bereich</span><span class="t-en">Default Rate area</span></div></li>
      </ul></div>
    </div>
    <div class="box box-say">
      <div class="box-header"><span class="box-icon">🎙️</span><span class="t-de">Erklärpunkte</span><span class="t-en">Talking points</span></div>
      <div class="box-body"><ul style="list-style:disc;padding-left:18px;font-size:14px;line-height:2;">
        <li><span class="t-de">Kein Login, E-Mail, SSO, Global Role — <strong>Planungsobjekt</strong>, keine Person</span><span class="t-en">No login, email, SSO, global role — a <strong>planning object</strong>, not a person</span></li>
        <li><span class="t-de"><strong>Manual</strong> — Flat Default-Rate fürs Team</span><span class="t-en"><strong>Manual</strong> — flat default rate for the team</span></li>
        <li><span class="t-de"><strong>Advanced</strong> — zeitphasierter Stundensatz</span><span class="t-en"><strong>Advanced</strong> — time-phased hourly rate</span></li>
        <li><span class="t-de"><strong>Auto-calculated</strong> — aus Team-Zusammensetzung (meist Kundenwunsch)</span><span class="t-en"><strong>Auto-calculated</strong> — from team constitution (most customers)</span></li>
      </ul></div>
    </div>
    <div class="box box-feedback">
      <div class="box-header"><span class="box-icon">🔧</span><span class="t-de">Feedback (Aayushi)</span><span class="t-en">Feedback (Aayushi)</span></div>
      <div class="box-body"><span class="t-de"><strong>Team Capacity</strong> ist die Standard-Landingpage — bewusst, weil das die wichtigste Seite ist. Alle <strong>3 Rate-Optionen</strong> kurz erklären.</span><span class="t-en"><strong>Team Capacity</strong> is the default landing page — all <strong>3 rate options</strong> briefly.</span></div>
    </div>
    <div class="transition">→ <span class="t-de">Team Capacity: Mitglieder &amp; Inclusion %</span><span class="t-en">Team Capacity: members &amp; Inclusion %</span></div>
  </div>
</div>

<!-- SCENE 3 -->
<div class="scene" id="team-resources-scene-03">
  <div class="scene-header">
    <div class="scene-num-badge"><div class="scene-num-big">03</div><div class="scene-num-label">Capacity</div></div>
    <div class="scene-title-area">
      <div class="scene-act"><span class="t-de">Block 3 · Team Capacity</span><span class="t-en">Block 3 · Team Capacity</span></div>
      <div class="scene-title"><span class="t-de">Team Capacity: Mitglieder und Inclusion %</span><span class="t-en">Team Capacity: Members and Inclusion %</span></div>
      <div class="scene-subtitle"><span class="t-de">Der wichtigste Mechanismus</span><span class="t-en">The key mechanism</span></div>
    </div>
  </div>
  <div class="scene-tags"><span class="tag tag-rm">Inclusion %</span><span class="tag tag-teal">Net Avail.</span></div>
  <div class="scene-body">
    <div class="box box-story">
      <div class="box-header"><span class="box-icon">📖</span><span class="t-de">Einstieg</span><span class="t-en">Intro</span></div>
      <div class="box-body"><span class="t-de">„Hier definiere ich, <strong>wer</strong> zum Team gehört und <strong>wie viel</strong> jede Person beiträgt — das ist der Kern von Team Resources.“</span><span class="t-en">"Here I define <strong>who</strong> is on the team and <strong>how much</strong> each person contributes — the core of Team Resources."</span></div>
    </div>
    <div class="box box-click">
      <div class="box-header"><span class="box-icon">🖱️</span><span class="t-de">Klickpfad</span><span class="t-en">Click path</span></div>
      <div class="box-body"><ul class="click-steps">
        <li><div class="click-step-num">1</div><div><span class="t-de">Tab <span class="click-path">Team Capacity</span></span><span class="t-en"><span class="click-path">Team Capacity</span> tab</span></div></li>
        <li><div class="click-step-num">2</div><div><span class="t-de">Start/End Date + Quick Date Picker</span><span class="t-en">Start/End date + quick picker</span></div></li>
        <li><div class="click-step-num">3</div><div><span class="t-de">Net Availability Grid unten — Manuel, Tanja, Edina, Christoph auswählen</span><span class="t-en">Net Availability grid — select members</span></div></li>
        <li><div class="click-step-num">4</div><div><span class="t-de">Tab <span class="click-path">Inclusion %</span> — Standard 100 %</span><span class="t-en"><span class="click-path">Inclusion %</span> tab — default 100%</span></div></li>
      </ul></div>
    </div>
    <div class="box box-say">
      <div class="box-header"><span class="box-icon">🎙️</span><span class="t-de">Erklärpunkte (mit Zahlen!)</span><span class="t-en">Talking points (use numbers!)</span></div>
      <div class="box-body"><span class="t-de">Beispiel: Manuel 176 h/Monat, <strong>50 % Inclusion</strong> → nur <strong>88 h</strong> zählen zur Team Capacity. Tanja/Edina/Christoph je 100 % → 176 h. <strong>Summe = 616 h</strong> (nicht 704 h).<br><br><strong>Formel:</strong> Team Capacity = Σ (Mitgliedskapazität × Inclusion %). Inclusion % ist zeitphasierbar (Juni 100 %, Juli 50 %).</span><span class="t-en">Example: Manuel 176 h/month at <strong>50% inclusion</strong> → only <strong>88 h</strong> count. Others at 100% → 176 h each. <strong>Total = 616 h</strong> (not 704).<br><br><strong>Formula:</strong> Team Capacity = sum(member capacity × inclusion %). Inclusion % can be time-phased.</span></div>
    </div>
    <div class="box box-feedback">
      <div class="box-header"><span class="box-icon">🔧</span><span class="t-de">Feedback</span><span class="t-en">Feedback</span></div>
      <div class="box-body"><span class="t-de"><strong>Hier die meiste Zeit verbringen!</strong> Konkrete Zahlen nutzen. Team nur innerhalb Start/End allokierbar. Heatmap im Grid unten kurz zeigen. <strong>Ressourcen können mehreren Teams</strong> angehören — kein Limit.</span><span class="t-en"><strong>Spend most time here!</strong> Use concrete numbers. Team allocatable only within date range. Briefly show heatmap. <strong>Resources can belong to multiple teams</strong>.</span></div>
    </div>
    <div class="box box-impact">
      <div class="box-header"><span class="box-icon">⚡</span><span class="t-de">Wirkungssatz</span><span class="t-en">Impact</span></div>
      <div class="box-body"><span class="t-de">„Inclusion % steuert, wie viel Kapazität jede Person dem Team wirklich gibt — das ist der Hebel für realistische Teamplanung.“</span><span class="t-en">"Inclusion % controls how much capacity each person truly gives the team — the lever for realistic team planning."</span></div>
    </div>
    <div class="transition">→ <span class="t-de">Story Points (kurz)</span><span class="t-en">Story Points (brief)</span></div>
  </div>
</div>

<!-- SCENE 4 -->
<div class="scene" id="team-resources-scene-04">
  <div class="scene-header">
    <div class="scene-num-badge"><div class="scene-num-big">04</div><div class="scene-num-label">SP</div></div>
    <div class="scene-title-area">
      <div class="scene-act"><span class="t-de">Block 4 · Story Points</span><span class="t-en">Block 4 · Story Points</span></div>
      <div class="scene-title"><span class="t-de">Story Points &amp; Cost per Story Point</span><span class="t-en">Story Points &amp; Cost per Story Point</span></div>
      <div class="scene-subtitle"><span class="t-de">Kurz zeigen — nicht live rechnen</span><span class="t-en">Brief — don't calculate live</span></div>
    </div>
  </div>
  <div class="scene-body">
    <div class="box box-click">
      <div class="box-header"><span class="box-icon">🖱️</span><span class="t-de">Klickpfad</span><span class="t-en">Click path</span></div>
      <div class="box-body"><ul class="click-steps"><li><div class="click-step-num">1</div><div><span class="t-de">Tab <span class="click-path">Story Points</span></span><span class="t-en"><span class="click-path">Story Points</span> tab</span></div></li>
      <li><div class="click-step-num">2</div><div><span class="t-de">z. B. 80 Story Points für einen Monat</span><span class="t-en">e.g. 80 story points for one month</span></div></li></ul></div>
    </div>
    <div class="box box-say">
      <div class="box-header"><span class="box-icon">🎙️</span><span class="t-de">Erklärpunkte</span><span class="t-en">Talking points</span></div>
      <div class="box-body"><span class="t-de">Story Points = <strong>Delivery Capacity des Teams</strong>, nur auf Team-Ebene. Formel (nur erwähnen): Cost/SP = (Team Capacity × Kosten/h × 100) / SP. Beispiel: 616 h, CHF 150/h, 80 SP → ca. CHF 1'155/SP. <strong>Nicht live rechnen.</strong></span><span class="t-en">Story Points = <strong>team delivery capacity</strong>, team level only. Mention formula only. <strong>Don't calculate live.</strong></span></div>
    </div>
    <div class="box box-feedback">
      <div class="box-header"><span class="box-icon">🔧</span><span class="t-de">Feedback (Aayushi)</span><span class="t-en">Feedback (Aayushi)</span></div>
      <div class="box-body"><span class="t-de">Story Points gehören dem <strong>Team</strong>, nicht Einzelpersonen — häufiges Missverständnis. Bei klassischer Stunden/FTE-Planung sind SP <strong>optional</strong>.</span><span class="t-en">Story Points belong to the <strong>team</strong>, not individuals. Optional for hours/FTE planning.</span></div>
    </div>
    <div class="box box-impact">
      <div class="box-header"><span class="box-icon">⚡</span><span class="t-de">Wirkungssatz</span><span class="t-en">Impact</span></div>
      <div class="box-body"><span class="t-de">„Story Points sind keine Einzelaufwände — sie sind eine Kapazitätseinheit für das gesamte Team.“</span><span class="t-en">"Story Points are not individual effort — they're a capacity unit for the whole team."</span></div>
    </div>
    <div class="transition">→ <span class="t-de">Team auf Projekt allokieren</span><span class="t-en">Allocate team to project</span></div>
  </div>
</div>

<!-- SCENE 5 -->
<div class="scene" id="team-resources-scene-05">
  <div class="scene-header">
    <div class="scene-num-badge"><div class="scene-num-big">05</div><div class="scene-num-label">Assign</div></div>
    <div class="scene-title-area">
      <div class="scene-act"><span class="t-de">Block 5 · Allokation</span><span class="t-en">Block 5 · Allocation</span></div>
      <div class="scene-title"><span class="t-de">Team Resource auf Projekt allokieren</span><span class="t-en">Allocate Team Resource to Project</span></div>
      <div class="scene-subtitle"><span class="t-de">FTE = Full Team Equivalent</span><span class="t-en">FTE = Full Team Equivalent</span></div>
    </div>
  </div>
  <div class="scene-body">
    <div class="box box-click">
      <div class="box-header"><span class="box-icon">🖱️</span><span class="t-de">Klickpfad</span><span class="t-en">Click path</span></div>
      <div class="box-body"><ul class="click-steps">
        <li><div class="click-step-num">1</div><div><span class="t-de">Projekt <strong>Stardust 2026</strong> → Allocation</span><span class="t-en">Project <strong>Stardust 2026</strong> → Allocation</span></div></li>
        <li><div class="click-step-num">2</div><div><span class="t-de"><span class="click-path">Add Assignment</span> → E-DOC Delivery Team (Team-Icon!)</span><span class="t-en"><span class="click-path">Add Assignment</span> → team (note icon!)</span></div></li>
        <li><div class="click-step-num">3</div><div><span class="t-de">Einheit: Hours / FTE / Story Points</span><span class="t-en">Unit: Hours / FTE / Story Points</span></div></li>
      </ul></div>
    </div>
    <div class="box box-say">
      <div class="box-header"><span class="box-icon">🎙️</span><span class="t-de">Erklärpunkte</span><span class="t-en">Talking points</span></div>
      <div class="box-body"><span class="t-de"><strong>1 FTE ≠ 1 Person.</strong> 1 FTE = Full Team Equivalent = gesamte Team Capacity (616 h). 0,5 FTE = 308 h. Vergleich: 1 FTE Einzelperson = 176 h. Eine Teamzuweisung statt fünf Einzel-Assignments.</span><span class="t-en"><strong>1 FTE ≠ 1 person.</strong> 1 FTE = full team equivalent. One team assignment instead of five individual ones.</span></div>
    </div>
    <div class="box box-feedback">
      <div class="box-header"><span class="box-icon">🔧</span><span class="t-de">Feedback</span><span class="t-en">Feedback</span></div>
      <div class="box-body"><span class="t-de">Immer das <strong>Team-Icon</strong> zeigen. Bei SP in Capacity: Auto-Umrechnung zwischen Einheiten; bei ungültiger Berechnung <strong>Alert-Icon</strong> → neu berechnen.</span><span class="t-en">Always point out the <strong>team icon</strong>. Alert icon if recalculation needed.</span></div>
    </div>
    <div class="transition">→ <span class="t-de">Net Availability</span><span class="t-en">Net Availability</span></div>
  </div>
</div>

<!-- SCENE 6 -->
<div class="scene" id="team-resources-scene-06">
  <div class="scene-header">
    <div class="scene-num-badge"><div class="scene-num-big">06</div><div class="scene-num-label">Net Avail.</div></div>
    <div class="scene-title-area">
      <div class="scene-act"><span class="t-de">Block 6 · Auswirkungen</span><span class="t-en">Block 6 · Impact</span></div>
      <div class="scene-title"><span class="t-de">Auswirkung auf Net Availability</span><span class="t-en">Impact on Net Availability</span></div>
    </div>
  </div>
  <div class="scene-body">
    <div class="box box-click">
      <div class="box-header"><span class="box-icon">🖱️</span><span class="t-de">Klickpfad</span><span class="t-en">Click path</span></div>
      <div class="box-body"><ul class="click-steps">
        <li><div class="click-step-num">1</div><div><span class="t-de">Resource Management → <span class="click-path">Net Availability</span></span><span class="t-en">Resource Management → <span class="click-path">Net Availability</span></span></div></li>
        <li><div class="click-step-num">2</div><div><span class="t-de">Quick Filter: Team Resources</span><span class="t-en">Quick Filter: Team Resources</span></div></li>
        <li><div class="click-step-num">3</div><div><span class="t-de">Auf Zelle klicken → Projekte hinter Allokation</span><span class="t-en">Click cell → projects behind allocation</span></div></li>
      </ul></div>
    </div>
    <div class="box box-say">
      <div class="box-header"><span class="box-icon">🎙️</span><span class="t-de">Erklärpunkte</span><span class="t-en">Talking points</span></div>
      <div class="box-body"><span class="t-de"><strong>Stunden:</strong> Net Availability = Team Capacity − Allokationen.<br><strong>FTE:</strong> Net Availability = 1 FTE − Allokationen (Team hat immer 1 FTE = Full Team Equivalent).<br>Aggregierte <strong>Team-Verfügbarkeit</strong>, nicht Einzelpersonen.</span><span class="t-en">Hours and FTE formulas. Aggregated <strong>team availability</strong>.</span></div>
    </div>
    <div class="box box-feedback">
      <div class="box-header"><span class="box-icon">🔧</span><span class="t-de">Feedback (Aayushi)</span><span class="t-en">Feedback (Aayushi)</span></div>
      <div class="box-body"><span class="t-de">Cross-Project-Allocation-Grid im Team-Profil als alternative Ansicht erwähnen.</span><span class="t-en">Mention cross-project allocation grid in team profile.</span></div>
    </div>
    <div class="transition">→ <span class="t-de">BPA Flatgrid</span><span class="t-en">BPA Flatgrid</span></div>
  </div>
</div>

<!-- SCENE 7 -->
<div class="scene" id="team-resources-scene-07">
  <div class="scene-header">
    <div class="scene-num-badge" style="background:linear-gradient(135deg,var(--rm),var(--teal))"><div class="scene-num-big">07</div><div class="scene-num-label">BPAFG</div></div>
    <div class="scene-title-area">
      <div class="scene-act"><span class="t-de">Block 7 · BPA</span><span class="t-en">Block 7 · BPA</span></div>
      <div class="scene-title"><span class="t-de">Team Resources im BPA Flatgrid</span><span class="t-en">Team Resources in BPA Flatgrid</span></div>
    </div>
  </div>
  <div class="scene-body">
    <div class="box box-click">
      <div class="box-header"><span class="box-icon">🖱️</span><span class="t-de">Klickpfad</span><span class="t-en">Click path</span></div>
      <div class="box-body"><ul class="click-steps">
        <li><div class="click-step-num">1</div><div><span class="t-de"><span class="click-path">Bulk Project Allocation Flat Grid</span></span><span class="t-en"><span class="click-path">BPA Flat Grid</span></span></div></li>
        <li><div class="click-step-num">2</div><div><span class="t-de">Resource Mode → Filter Team Resources</span><span class="t-en">Resource mode → filter teams</span></div></li>
        <li><div class="click-step-num">3</div><div><span class="t-de"><span class="click-path">Options → Show Team Assignments</span></span><span class="t-en"><span class="click-path">Show Team Assignments</span></span></div></li>
        <li><div class="click-step-num">4</div><div><span class="t-de">Resource Type Filter + Spalte Is Team Resource</span><span class="t-en">Resource type filter + column</span></div></li>
      </ul></div>
    </div>
    <div class="box box-feedback">
      <div class="box-header"><span class="box-icon">🔧</span><span class="t-de">Feedback (Aayushi)</span><span class="t-en">Feedback (Aayushi)</span></div>
      <div class="box-body"><span class="t-de"><strong>Show Team Assignments</strong> zeigt pro Person Team-Zugehörigkeit inkl. Inclusion % — erklärt Einfluss auf individuelle Verfügbarkeit. Zahlen im BPA sind <strong>team-basiert</strong>.</span><span class="t-en"><strong>Show Team Assignments</strong> explains impact on individual availability.</span></div>
    </div>
    <div class="box box-impact">
      <div class="box-header"><span class="box-icon">⚡</span><span class="t-de">Wirkungssatz</span><span class="t-en">Impact</span></div>
      <div class="box-body"><span class="t-de">„Das BPA Flatgrid ist der operative Arbeitsplatz für Team-Planung über Projekte hinweg.“</span><span class="t-en">"The BPA Flatgrid is the operational workspace for team planning across projects."</span></div>
    </div>
    <div class="transition">→ <span class="t-de">Resource Requests (kurz)</span><span class="t-en">Resource Requests (brief)</span></div>
  </div>
</div>

<!-- SCENE 8 -->
<div class="scene" id="team-resources-scene-08">
  <div class="scene-header">
    <div class="scene-num-badge"><div class="scene-num-big">08</div><div class="scene-num-label">RR</div></div>
    <div class="scene-title-area">
      <div class="scene-act"><span class="t-de">Block 8 · Requests</span><span class="t-en">Block 8 · Requests</span></div>
      <div class="scene-title"><span class="t-de">Resource Requests &amp; Replace</span><span class="t-en">Resource Requests &amp; Replace</span></div>
    </div>
  </div>
  <div class="scene-body">
    <div class="box box-say">
      <div class="box-header"><span class="box-icon">🎙️</span><span class="t-de">Regeln (kurz)</span><span class="t-en">Rules (brief)</span></div>
      <div class="box-body"><ul style="list-style:disc;padding-left:18px;font-size:14px;line-height:2;">
        <li><span class="t-de">Request geht an <strong>RM der Team Resource</strong></span><span class="t-en">Request goes to <strong>team resource RM</strong></span></li>
        <li><span class="t-de">Team ↔ Team ersetzen; Named ↔ Named</span><span class="t-en">Team ↔ team; Named ↔ named</span></li>
      </ul></div>
    </div>
    <div class="box box-feedback">
      <div class="box-header"><span class="box-icon">🔧</span><span class="t-de">Feedback</span><span class="t-en">Feedback</span></div>
      <div class="box-body"><span class="t-de">Kurz halten — nicht live zeigen, es sei denn der Kunde fragt.</span><span class="t-en">Keep short — don't demo live unless asked.</span></div>
    </div>
    <div class="box box-impact">
      <div class="box-header"><span class="box-icon">⚡</span><span class="t-de">Wirkungssatz</span><span class="t-en">Impact</span></div>
      <div class="box-body"><span class="t-de">„Team Resources und Named Resources sind zuweisbar, aber <strong>nicht austauschbar</strong>.“</span><span class="t-en">"Team and Named Resources are assignable but <strong>not interchangeable</strong>."</span></div>
    </div>
    <div class="transition">→ <span class="t-de">Timesheets FAQ</span><span class="t-en">Timesheets FAQ</span></div>
  </div>
</div>

<!-- SCENE 9 -->
<div class="scene" id="team-resources-scene-09">
  <div class="scene-header">
    <div class="scene-num-badge" style="background:linear-gradient(135deg,var(--purple),var(--navy))"><div class="scene-num-big">09</div><div class="scene-num-label">FAQ</div></div>
    <div class="scene-title-area">
      <div class="scene-act"><span class="t-de">Block 9 · FAQ</span><span class="t-en">Block 9 · FAQ</span></div>
      <div class="scene-title"><span class="t-de">Timesheets &amp; Reporting</span><span class="t-en">Timesheets &amp; Reporting</span></div>
    </div>
  </div>
  <div class="scene-body">
    <div class="box box-say">
      <div class="box-header"><span class="box-icon">🎙️</span><span class="t-de">Häufige Frage</span><span class="t-en">Common question</span></div>
      <div class="box-body"><span class="t-de">„Wenn Team Resources keine Timesheet User sind — wie funktioniert Time Tracking?“ → Team Resource bucht nicht selbst; Mitglieder (Timesheet User) buchen auf Team Assignments; Auswertung via <strong>Pivot Grid Reporting</strong>.</span><span class="t-en">Team resource doesn't book time; members book on team assignments; reporting via pivot grid.</span></div>
    </div>
    <div class="box box-feedback">
      <div class="box-header"><span class="box-icon">🔧</span><span class="t-de">Feedback</span><span class="t-en">Feedback</span></div>
      <div class="box-body"><span class="t-de">Nicht durchklicken — nur verbal. Separates Thema.</span><span class="t-en">Verbal only — separate topic.</span></div>
    </div>
  </div>
</div>
'''

CLOSING_HTML = r'''
<!-- CLOSING -->
<div class="closing">
  <h2><span class="t-de">Zusammenfassung — Team Resources</span><span class="t-en">Summary — Team Resources</span></h2>
  <div class="closing-grid">
    <div class="closing-item"><div style="font-size:18px;">👥</div><div><span class="t-de"><strong>Team Resource</strong> — keine Person, planbare Team-Kapazität</span><span class="t-en"><strong>Team Resource</strong> — not a person, assignable team capacity</span></div></div>
    <div class="closing-item"><div style="font-size:18px;">📊</div><div><span class="t-de"><strong>Inclusion %</strong> — Anteil jeder Person an Team Capacity</span><span class="t-en"><strong>Inclusion %</strong> — each person's share of team capacity</span></div></div>
    <div class="closing-item"><div style="font-size:18px;">⚡</div><div><span class="t-de"><strong>1 FTE</strong> = Full Team Equivalent (nicht eine Person)</span><span class="t-en"><strong>1 FTE</strong> = Full Team Equivalent (not one person)</span></div></div>
    <div class="closing-item"><div style="font-size:18px;">📈</div><div><span class="t-de"><strong>Story Points</strong> — Team als Ganzes, optional</span><span class="t-en"><strong>Story Points</strong> — whole team, optional</span></div></div>
    <div class="closing-item"><div style="font-size:18px;">🔄</div><div><span class="t-de"><strong>Replace:</strong> Team ↔ Team, Named ↔ Named</span><span class="t-en"><strong>Replace:</strong> team ↔ team, named ↔ named</span></div></div>
    <div class="closing-item"><div style="font-size:18px;">🎯</div><div><span class="t-de"><strong>Requests</strong> → RM der Team Resource</span><span class="t-en"><strong>Requests</strong> → team resource RM</span></div></div>
  </div>
  <div class="closing-final">
    <span class="t-de">„Weg von vorschneller Detailplanung auf Personenebene — <strong>hin zu realistischer, steuerbarer Team-Capacity.</strong> Das spart Zeit und gibt bessere Transparenz über die Team-Auslastung.“</span>
    <span class="t-en">"Away from premature individual detail planning — <strong>towards realistic, manageable team capacity.</strong> This saves time and improves visibility into team utilization."</span>
  </div>
</div>

<div class="qr-section">
  <div class="qr-header">📋 <span class="t-de">Quick Cheat Sheet — 20 Minuten</span><span class="t-en">Quick cheat sheet — 20 min</span></div>
  <div class="qr-body">
    <p style="font-weight:700;margin-bottom:8px;"><span class="t-de">Nicht zu tief gehen:</span><span class="t-en">Don't go too deep:</span></p>
    <ul style="list-style:disc;padding-left:20px;font-size:14px;line-height:2;">
      <li><span class="t-de">Detaillierte Kostenformeln (nur erwähnen)</span><span class="t-en">Detailed cost formulas (mention only)</span></li>
      <li><span class="t-de">Team Resources klonen</span><span class="t-en">Cloning team resources</span></li>
      <li><span class="t-de">Global Replace im Detail</span><span class="t-en">Global replace in detail</span></li>
      <li><span class="t-de">Pivot Grid Timesheet Reporting live</span><span class="t-en">Pivot grid timesheet reporting live</span></li>
    </ul>
    <p style="font-weight:700;margin:16px 0 8px;"><span class="t-de">Bester Demo-Flow:</span><span class="t-en">Best demo flow:</span></p>
    <p style="font-size:14px;line-height:1.7;"><span class="t-de">RM Grid → Profil → <strong>Team Capacity (Zeit!)</strong> → Projekt-Allokation → Net Availability → BPA (<strong>Show Team Assignments</strong>) → Recap</span><span class="t-en">RM Grid → Profile → <strong>Team Capacity (time!)</strong> → Project allocation → Net Availability → BPA → Recap</span></p>
  </div>
</div>

<div class="box box-feedback" style="margin:20px 0;">
  <div class="box-header"><span class="box-icon">🔧</span><span class="t-de">Opening — Feedback (Story)</span><span class="t-en">Opening — Feedback (story)</span></div>
  <div class="box-body">
    <span class="t-de"><strong>Mehr Story:</strong> Warum nutzt Giacomo Team Resources? Er will nicht 5 Einzel-Assignments verwalten — er allokiert sein Delivery Team als <strong>eine Einheit</strong> auf Stardust 2026.</span>
    <span class="t-en"><strong>More story:</strong> Why does Giacomo use Team Resources? He doesn't want five individual assignments — he allocates his delivery team as <strong>one unit</strong>.</span>
  </div>
</div>
'''

CSS_ADDITION = """
.box-feedback .box-header { background: linear-gradient(90deg, #f59e0b, #d97706); color: white; font-weight: 700; }
.box-feedback .box-body   { background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); color: var(--gray-700); border: 2px dashed #f59e0b; border-top: none; font-size: 13px; line-height: 1.65; }
.box-feedback .box-body strong { color: #92400e; }
.qr-section { background: white; border: 1px solid var(--gray-300); border-radius: var(--radius); margin-bottom: 20px; box-shadow: var(--shadow); overflow: hidden; }
.qr-header { background: var(--rm); color: white; padding: 14px 24px; font-size: 15px; font-weight: 700; }
.qr-body { padding: 20px 24px; }
"""

STORY_HOOK_FB = """
<div class="box box-feedback" style="margin-top:16px;">
  <div class="box-header"><span class="box-icon">🔧</span><span class="t-de">Feedback — Opening / Story</span><span class="t-en">Feedback — Opening / story</span></div>
  <div class="box-body">
    <span class="t-de"><strong>Fokus auf das Warum:</strong> Giacomo will sein ganzes Delivery Team als eine Einheit planen — nicht fünf separate Assignment-Zeilen. Das löst seinen Alltags-Schmerz als Team Lead.</span>
    <span class="t-en"><strong>Focus on why:</strong> Giacomo wants to plan his whole delivery team as one unit — not five separate assignment lines.</span>
  </div>
</div>
"""


def patch_html(content: str) -> str:
    if ".box-feedback .box-header" not in content:
        content = content.replace(".box-tip .box-body", CSS_ADDITION + "\n.box-tip .box-body", 1)

    content = re.sub(
        r'<div class="hero-meta-item">📋 <span class="t-de">4 Blöcke</span>.*?</div>',
        '<div class="hero-meta-item">📋 <span class="t-de">9 Blöcke · inkl. Feedback</span><span class="t-en">9 blocks · incl. feedback</span></div>',
        content,
        count=1,
    )
    content = re.sub(
        r'<html lang="en" class="lang-en">',
        '<html lang="de" class="lang-de">',
        content,
        count=1,
    )
    content = re.sub(
        r'<button class="lang-btn" id="btn-de"',
        '<button class="lang-btn active" id="btn-de"',
        content,
        count=1,
    )
    content = re.sub(
        r'<button class="lang-btn active" id="btn-en"',
        '<button class="lang-btn" id="btn-en"',
        content,
        count=1,
    )

    if "<!-- STORY HOOK -->" in content and "Feedback — Opening" not in content.split("<!-- CAST -->")[0]:
        content = content.replace("</div>\n</div>\n\n<!-- CAST -->", STORY_HOOK_FB + "\n</div>\n</div>\n\n<!-- CAST -->", 1)

    m = re.search(
        r'(<div class="page" id="team-resources-scenes-page">)\s*.*?(</div><!-- /page -->)',
        content,
        re.DOTALL,
    )
    if not m:
        raise RuntimeError("Could not find scenes page region")
    content = content[: m.start()] + m.group(1) + "\n" + SCENES_HTML + "\n" + CLOSING_HTML + "\n" + m.group(2) + content[m.end() :]

    # Add feedback to BOX_TYPES in JS
    if "'feedback'" not in content and "BOX_TYPES = [" in content:
        content = content.replace(
            "{ type: 'tip',     icon: '✅', label: 'Tipp'",
            "{ type: 'feedback', icon: '🔧', label: 'Feedback',           desc: 'Review-Hinweis aus Transkript', bg: '#d97706' },\n  { type: 'tip',     icon: '✅', label: 'Tipp'",
            1,
        )

    return content


def main():
    text = HTML_PATH.read_text(encoding="utf-8")
    HTML_PATH.write_text(patch_html(text), encoding="utf-8")
    print(f"Updated: {HTML_PATH}")


if __name__ == "__main__":
    main()
