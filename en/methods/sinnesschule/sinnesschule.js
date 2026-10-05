/* =========================================================
   The Sensory school
   Ein lebenslanger Meisterschaftsweg zur Schulung der Sinne.

   - Graduierung ohne sichtbares Limit: superlineare XP-Kurve,
     jede Stufe kostet spürbar mehr (battle-fähig fürs ganze Leben).
   - Aufstieg ist an Prüfungen gekoppelt ("Door" zur nächsten Stufe).
   - Anonyme Arena: Vergleich der "Sharpness" unter Pseudonym.

   Persistenz: window.workflowAPI (DynamoDB) + localStorage-Fallback.
   Rangliste: /snowflake-highscores?game=sinnesschule (anonym).
   ========================================================= */

const SS_METHOD = 'sinnesschule';

/* ---------------- Graduierungs-System (→ ∞) ---------------- */
const SS_TITLES = [
    'Erwachen', 'Aufmerksamkeit', 'Discrimination', 'Sharpness', 'Fineness',
    'Depth', 'Presence', 'Clarity', 'Meisterschaft', 'Vollendung',
    'Großmeister', 'Guardian of the senses', 'Seher', 'Listener', 'Feeler',
    'True connoisseur', 'Enlightened sense', 'Transformer of perception', 'Zeitloser', 'Vollkommener'
];

// XP, um von Stufe g zur Stufe g+1 zu gelangen – wächst superlinear.
function SS_gap(g) { return Math.round(120 * Math.pow(g, 1.45)); }

// Kumulierte XP, um Stufe g überhaupt zu erreichen (g>=1 → 0 bei g=1).
const _ssTcache = [0, 0];
function SS_T(g) {
    if (g < 1) return 0;
    for (let k = _ssTcache.length; k <= g; k++) _ssTcache[k] = _ssTcache[k - 1] + SS_gap(k - 1);
    return _ssTcache[g];
}
function SS_gradeFromXP(xp) {
    let g = 1;
    while (g < 2000 && xp >= SS_T(g + 1)) g++;
    return g;
}
function SS_roman(n) {
    if (n <= 0) return '';
    const map = [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];
    let r = ''; for (const [v, s] of map) while (n >= v) { r += s; n -= v; } return r;
}
function SS_titleFor(g) {
    if (g <= SS_TITLES.length) return SS_TITLES[g - 1];
    const tier = g - SS_TITLES.length; // 1, 2, 3 …
    return `${SS_TITLES[SS_TITLES.length - 1]} ${SS_roman(tier + 1)}`;
}
// Geforderte Prüfungs-Punktzahl, um die nächste Stufe zu öffnen – steigt mit der Stufe.
function SS_reqExam(g) { return Math.min(96, 64 + g * 2); }

/* ---------------- Die sechs Disziplinen ---------------- */
const SS_SENSES = [
    { id: 'sehen',     name: 'Seeing',     icon: '👁️', accent: '#60a5fa', soft: 'rgba(96,165,250,.16)', glow: 'rgba(96,165,250,.18)' },
    { id: 'hoeren',    name: 'Hearing',     icon: '👂', accent: '#a78bfa', soft: 'rgba(167,139,250,.16)', glow: 'rgba(167,139,250,.18)' },
    { id: 'riechen',   name: 'Smell',   icon: '👃', accent: '#f472b6', soft: 'rgba(244,114,182,.16)', glow: 'rgba(244,114,182,.18)' },
    { id: 'schmecken', name: 'Taste', icon: '👅', accent: '#fb923c', soft: 'rgba(251,146,60,.16)',  glow: 'rgba(251,146,60,.18)' },
    { id: 'tasten',    name: 'Touch',    icon: '🖐️', accent: '#34d399', soft: 'rgba(52,211,153,.16)',  glow: 'rgba(52,211,153,.18)' },
    { id: 'innensinn', name: 'Inner sense', icon: '🌀', accent: '#e0b04a', soft: 'rgba(224,176,74,.16)',  glow: 'rgba(224,176,74,.18)' },
    { id: 'empathie',  name: 'Empathy',  icon: '🫂', accent: '#fb7185', soft: 'rgba(251,113,133,.16)', glow: 'rgba(251,113,133,.18)' }
];
const SS_SENSE_MAP = Object.fromEntries(SS_SENSES.map(s => [s.id, s]));

/* ---------------- Verbundene Persönlichkeitsentwicklungs-Methoden ----------------
   Als geführter Pfad nach Empathie-Aspekt: jede Methode vertieft einen Teilbereich. */
const SS_LINKED_METHODS = {
    empathie: [
        { tag: 'Cognitive', label: 'Johari window', href: '../johari-window/johari-window.html',
          desc: 'Spot blind spots – compare self-image and how others see you to understand people more clearly.' },
        { tag: 'Cognitive', label: 'Circular interview', href: '../circular-interview/circular-interview.html',
          desc: 'Shift perspectives with circular questions – see the world through someone else\'s eyes.' },
        { tag: 'Emotional', label: 'Emotional intelligence', href: '../emotional-intelligence/emotional-intelligence.html',
          desc: 'Notice feelings more closely – your own and others\' – and name them precisely.' },
        { tag: 'Listening', label: 'Nonviolent communication', href: '../nonviolent-communication/nonviolent-communication.html',
          desc: 'Observation, feeling, need, request – speak and listen with empathy.' },
        { tag: 'Listening', label: 'Active-empathic communication', href: '../aek-communication/aek-communication.html',
          desc: 'Train active listening and reflecting as a skill.' },
        { tag: 'Inner steadiness', label: 'Mindfulness', href: '../mindfulness/mindfulness.html',
          desc: 'Stay steady – feel with others without losing yourself in their feeling.' },
        { tag: 'Inner steadiness', label: 'The five pillars of identity', href: '../five-pillars/five-pillars.html',
          desc: 'Strengthen your own ground so compassion without self-loss becomes possible.' }
    ],
    innensinn: [
        { tag: 'Go deeper', label: 'Achtsamkeit & Meditation', href: '../mindfulness/mindfulness.html',
          desc: 'Feel body, breath, and the present moment – home of the inner sense.' },
        { tag: 'Reflection', label: 'Journaling', href: '../journaling/journaling.html',
          desc: 'Clarify inner experience in writing and distinguish it ever more finely.' }
    ],
    hoeren: [
        { tag: 'Apply', label: 'Communication', href: '../communication/communication.html',
          desc: 'Listen consciously in conversation – the basis of real understanding.' },
        { tag: 'Apply', label: 'Active-empathic communication', href: '../aek-communication/aek-communication.html',
          desc: 'Sharpen listening as a trainable skill.' }
    ]
};

/* ---------------- Übungen (Dojo) ---------------- */
const SS_EXERCISES = {
    sehen: [
        { id: 'sehen_farbtiefe', icon: '🎨', title: 'Color depth', dur: 180, xp: 25, steps: [
            { text: 'Pick an object nearby and rest your gaze on it.', sec: 25 },
            { text: 'Find every shade in its color – where is it lighter, where darker?', sec: 45 },
            { text: 'Find at least three different tones in this one color.', sec: 45 },
            { text: 'Move to the next color and repeat the game.', sec: 45 },
            { text: 'Breathe out and let your gaze soften. You have seen more finely.', sec: 20 }
        ]},
        { id: 'sehen_detail', icon: '🔍', title: 'Detail memory', dur: 150, xp: 22, steps: [
            { text: 'Look at an object closely for 60 seconds.', sec: 60 },
            { text: 'Close your eyes and describe it inwardly – shape, edges, shadows.', sec: 45 },
            { text: 'Open your eyes and check: What had you missed?', sec: 45 }
        ]},
        { id: 'sehen_peripherie', icon: '↔️', title: 'Periphery', dur: 120, xp: 18, steps: [
            { text: 'Fix a point straight ahead without moving your eyes.', sec: 30 },
            { text: 'Notice what is happening at the left and right edges.', sec: 45 },
            { text: 'Notice movement and light in the periphery – without looking there.', sec: 45 }
        ]}
    ],
    hoeren: [
        { id: 'hoeren_tonhoehe', icon: '🎚️', title: 'Pitch sharpness', dur: 120, xp: 24, game: 'pitch', gameLabel: 'Interaktives Hörspiel',
          intro: 'Listen to the tones and find the highest. It gets finer round by round.' },
        { id: 'hoeren_landschaft', icon: '🎧', title: 'Soundscape', dur: 180, xp: 25, steps: [
            { text: 'Close your eyes. Listen only to the nearest sound around you.', sec: 40 },
            { text: 'Widen your hearing space – what sounds at middle distance?', sec: 50 },
            { text: 'Reach for the farthest sound you can find.', sec: 50 },
            { text: 'Hold all layers at once – near, mid, far.', sec: 40 }
        ]},
        { id: 'hoeren_stille', icon: '🤫', title: 'The quietest voice', dur: 120, xp: 18, steps: [
            { text: 'Become still. Find the quietest audible sound in the room.', sec: 60 },
            { text: 'Stay with it. Does it get clearer the longer you listen?', sec: 60 }
        ]},
        { id: 'hoeren_instrument', icon: '🎻', title: 'One instrument', dur: 150, xp: 22, steps: [
            { text: 'Listen to music (or recall a piece) and pick one instrument.', sec: 30 },
            { text: 'Follow only this one instrument through the whole passage.', sec: 70 },
            { text: 'Consciously switch to another and follow it.', sec: 50 }
        ]}
    ],
    riechen: [
        { id: 'riechen_safari', icon: '🗺️', title: 'Scent safari', dur: 150, xp: 24, game: 'challenge', gameLabel: 'Perception mission' },
        { id: 'riechen_blind', icon: '🌿', title: 'Blind smelling', dur: 150, xp: 22, steps: [
            { text: 'Take in a scent (spice, herb, coffee) with your eyes closed.', sec: 40 },
            { text: 'Name what you smell – and what lies beneath it.', sec: 55 },
            { text: 'Breathe at your arm in between to “reset” your nose.', sec: 55 }
        ]},
        { id: 'riechen_raum', icon: '🏠', title: 'Scent of the room', dur: 120, xp: 18, steps: [
            { text: 'Close your eyes and smell the room you are in.', sec: 50 },
            { text: 'Which layers do you find? Wood, dust, food, freshness?', sec: 70 }
        ]}
    ],
    schmecken: [
        { id: 'schmecken_safari', icon: '🗺️', title: 'Aroma safari', dur: 150, xp: 24, game: 'challenge', gameLabel: 'Perception mission' },
        { id: 'schmecken_langsam', icon: '🍵', title: 'The long bite', dur: 150, xp: 22, steps: [
            { text: 'Take a small bite or sip. Do not swallow yet.', sec: 20 },
            { text: 'Feel the sweetness first, then the acidity.', sec: 45 },
            { text: 'Look for bitterness, salt, umami – each on its own.', sec: 45 },
            { text: 'Let the aftertaste fade and watch it.', sec: 40 }
        ]},
        { id: 'schmecken_vergleich', icon: '⚖️', title: 'The comparison', dur: 120, xp: 18, steps: [
            { text: 'Set out two versions of the same thing (e.g. two apples, two chocolates).', sec: 25 },
            { text: 'Taste the first – hold the impression.', sec: 45 },
            { text: 'Taste the second – where is the fine difference?', sec: 50 }
        ]}
    ],
    tasten: [
        { id: 'tasten_safari', icon: '🗺️', title: 'Touch safari', dur: 150, xp: 24, game: 'challenge', gameLabel: 'Perception mission' },
        { id: 'tasten_material', icon: '🪵', title: 'Read materials', dur: 150, xp: 22, steps: [
            { text: 'Close your eyes and feel an object.', sec: 40 },
            { text: 'Separate temperature, texture, and weight from each other.', sec: 60 },
            { text: 'Follow every edge, every unevenness with your fingertips.', sec: 50 }
        ]},
        { id: 'tasten_temperatur', icon: '🌡️', title: 'Temperature & texture', dur: 120, xp: 18, steps: [
            { text: 'Touch three surfaces in a row with your eyes closed.', sec: 50 },
            { text: 'What is cooler, what is rougher? Name the fine differences.', sec: 70 }
        ]}
    ],
    innensinn: [
        { id: 'innensinn_zeitgefuehl', icon: '⏳', title: 'Sense of time', dur: 120, xp: 24, game: 'time', gameLabel: 'Interaktive Wahrnehmung',
          intro: 'Estimate a span of time – without counting. Feel how long time feels.' },
        { id: 'innensinn_bodyscan', icon: '🧘', title: 'Body scan', dur: 240, xp: 30, steps: [
            { text: 'Close your eyes. Feel your body\'s contact with the surface beneath you.', sec: 40 },
            { text: 'Walk your attention upward from the feet.', sec: 70 },
            { text: 'Pause at tensions – without judging them.', sec: 70 },
            { text: 'Breathe into every area that calls to you.', sec: 60 }
        ]},
        { id: 'innensinn_atem', icon: '🌬️', title: 'Atem-Anker', dur: 180, xp: 22, breath: {
            repeats: 6,
            phases: [
                { label: 'Inhale', action: 'inhale', sec: 4 },
                { label: 'Hold',   action: 'hold',   sec: 4 },
                { label: 'Exhale', action: 'exhale', sec: 6 }
            ]
        }},
        { id: 'innensinn_herz', icon: '❤️', title: 'Feel the heartbeat', dur: 120, xp: 18, steps: [
            { text: 'Sit still. Try to feel your heartbeat without touching.', sec: 60 },
            { text: 'Do you find it in the chest? In the neck? In the fingertips?', sec: 60 }
        ]}
    ],
    empathie: [
        { id: 'empathie_perspektive', icon: '🧠', title: 'Perspective shift (cognitive)', dur: 180, xp: 25, steps: [
            { text: 'Think of a reaction from someone that recently irritated you.', sec: 35 },
            { text: 'Don\'t ask “What\'s wrong with them?”, but: “What might be behind it?”', sec: 50 },
            { text: 'What fear, expectation, hurt, or worry might be possible?', sec: 50 },
            { text: 'You don\'t have to excuse anything – you just look deeper than the behavior.', sec: 45 }
        ]},
        { id: 'empathie_granularitaet', icon: '🎭', title: 'Emotional granularity', dur: 150, xp: 22, steps: [
            { text: 'Check in: What exactly do you feel in this moment?', sec: 30 },
            { text: 'Name it precisely: sad, irritated, ashamed, nervous, touched, envious …', sec: 45 },
            { text: 'Recall a conversation. What did the other person feel – as precisely as you can?', sec: 45 },
            { text: 'The more finely you recognize your own feelings, the more finely you recognize them in others.', sec: 30 }
        ]},
        { id: 'empathie_mitgefuehl', icon: '🫂', title: 'Compassion with inner steadiness', dur: 180, xp: 26, steps: [
            { text: 'Think of someone who is not doing well right now.', sec: 35 },
            { text: 'Let yourself be touched – feel along a little.', sec: 45 },
            { text: 'Say inwardly: “I am with you, but I am not you.”', sec: 45 },
            { text: 'Stay steady and ask yourself: “What would actually help now?”', sec: 55 }
        ]},
        { id: 'empathie_zuhoeren', icon: '👂', title: 'Active listening (reflecting)', dur: 150, xp: 22, steps: [
            { text: 'Intend this: In the next conversation, reflect first, then evaluate.', sec: 30 },
            { text: 'Give back what you heard: “You weren\'t just annoyed – more disappointed?”', sec: 60 },
            { text: '“Yes, exactly” = you were close. A correction = you learn more.', sec: 60 }
        ]},
        { id: 'empathie_regulation', icon: '🛟', title: 'Self-regulation in over-empathy', dur: 120, xp: 18, breath: {
            repeats: 5,
            phases: [
                { label: 'Inhale – “I notice”', action: 'inhale', sec: 4 },
                { label: 'Hold', action: 'hold', sec: 2 },
                { label: 'Exhale – “without taking it on”', action: 'exhale', sec: 6 }
            ]
        }}
    ]
};

/* ---------------- Wahrnehmungs-Missionen (Riechen/Schmecken/Tasten) ----------------
   Zufällig gezogen, damit jede Übung neu und überraschend ist. Jede Mission hat
   3 kleine Aufgaben zum Abhaken – ein Spiel statt einer Textwand. */
const SS_CHALLENGES = {
    riechen: [
        { title: 'Kitchen safari', items: ['Find a sweetish scent', 'Find a tart-earthy scent', 'Find a fresh-zesty scent'] },
        { title: 'Three layers', items: ['Smell something and find the top scent note', 'Sense the note beneath', 'Find what stays in the background'] },
        { title: 'Memory scent', items: ['Smell something everyday', 'Let a memory arise', 'Name exactly what the scent reminds you of'] },
        { title: 'Natural vs. artificial', items: ['Find a natural scent', 'Find an artificial scent', 'Describe the fine difference'] }
    ],
    schmecken: [
        { title: 'Five basic tastes', items: ['Find something sweet or salty', 'Sense acidity or bitterness', 'Look for the umami / the depth'] },
        { title: 'The long aftertaste', items: ['Take a small bite', 'Hold it and watch the first impression', 'Follow the aftertaste until it disappears'] },
        { title: 'Temperature play', items: ['Taste something warm or cold', 'Notice how temperature changes the taste', 'Name what shifts'] },
        { title: 'Texture & taste', items: ['Feel the texture in your mouth', 'Separate it from the pure taste', 'Describe both separately'] }
    ],
    tasten: [
        { title: 'Material detective', items: ['Feel three surfaces blindly', 'Sort from rough to smooth', 'Find the finest unevenness'] },
        { title: 'Temperature journey', items: ['Touch something cool', 'Touch something warm', 'Feel how quickly your skin adapts'] },
        { title: 'Weight & pressure', items: ['Hold two things in your hands', 'Feel the difference in weight', 'Consciously vary your pressure'] },
        { title: 'Read edges', items: ['Pick an object', 'Follow every edge with your fingertip', 'Find a spot you had missed'] }
    ]
};

/* ---------------- Prüfungen ---------------- */
const SS_EXAMS = {
    sehen:     { type: 'color', title: 'Exam of seeing', protocol: 'In each round, find the field whose color differs only slightly. It gets finer each round – and harder with each level.' },
    hoeren:    { type: 'pitch', title: 'Exam of hearing',
                 protocol: 'In each round, hear several tones and find the highest. The gap gets finer each round and each level.' },
    riechen:   { type: 'rounds', target: 6, unit: 'Scents', title: 'Exam of smelling',
                 prompts: ['Have a scent handed to you blindly', 'Recognize a spice with your eyes closed', 'Tell two similar herbs apart', 'Find the hidden second scent note', 'Recognize a fruit by smell alone', 'Classify a scent: sweet, tart, or fresh?'],
                 protocol: 'In each round you smell blindly and decide honestly whether you were right. Tap “recognized” or “missed”.' },
    schmecken: { type: 'rounds', target: 5, unit: 'Aromas', title: 'Exam of tasting',
                 prompts: ['Taste blindly and name the main aroma', 'Recognize a hidden ingredient', 'Tell sweet from slightly sour', 'Find a bitter or salty note', 'Recognize the umami depth'],
                 protocol: 'In each round you taste blindly and decide honestly whether you recognized the aroma correctly.' },
    tasten:    { type: 'rounds', target: 6, unit: 'Materials', title: 'Exam of touching',
                 prompts: ['Recognize a material blindly by grip', 'Tell two similar textures apart', 'Estimate the temperature of a surface', 'Recognize an object by touch alone', 'Find the rougher of two surfaces', 'Recognize a weight by comparison'],
                 protocol: 'In each round you feel blindly and decide honestly whether you recognized it correctly.' },
    innensinn: { type: 'time', title: 'Exam of the inner sense',
                 protocol: 'In each round, estimate a span of time – without counting. The closer you are to the target time, the higher the score.' },
    empathie:  { type: 'scenario', title: 'Exam of empathy',
                 protocol: 'In each situation, choose the reading that is most empathic – the one that looks deeper instead of taking the behavior personally, judging, or rushing to “fix” it.' }
};

/* Empathie-Szenarien (fein): alle vier Optionen klingen zugewandt oder plausibel.
   Nur EINE trifft die feine Balance – präzise Wahrnehmung, tentativ, präsent,
   eigene Regung haltend. Die Distraktoren sind die subtilen Fallen:
   projizieren, sich übergehen / verschmelzen, von sich reden, vorschnell lösen/trösten,
   Worte über Körpersignale stellen. `w` erklärt das Warum nach der Antwort. */
const SS_EMP_SCENARIOS = [
    { s: 'A friend tells you about a fight with her mother. She seems composed, but her voice trembles slightly.',
      o: [
        'That must be tearing you up inside, I know this feeling well.',
        'You seem composed, and yet I hear something shaky – which is closer?',
        'It was just like that for me once, it passed eventually.',
        'The main thing is that you two start talking again as soon as possible.'
      ], a: 1,
      w: 'Empathy here means: name the double message – composed and moved at once – and ask openly, instead of projecting the intensity, talking about yourself, or jumping straight to the solution.' },

    { s: 'A friend says “all good” several times on the phone, but quickly changes the subject when you ask.',
      o: [
        'If he says everything is fine, I simply believe him.',
        'It\'s probably nothing serious, don\'t worry too much.',
        'I sense you\'re dodging – I won\'t push, but I\'m here.',
        'Now finally tell me what\'s really going on with you.'
      ], a: 2,
      w: 'Take the signal – the dodge – seriously without pushing: offer presence, instead of taking the words at face value, soothing, or applying pressure.' },

    { s: 'A colleague gets a promotion you had hoped for yourself. He is beaming and talking excitedly.',
      o: [
        'I am truly totally happy for you, without the slightest ulterior thought!',
        'Congratulations – I notice mixed feelings and am still honestly glad.',
        'Congratulations, even if the job is sure to bring a lot of stress.',
        'Congratulations, you had an advantage through the boss anyway.'
      ], a: 1,
      w: 'Mature empathy includes honesty with yourself: notice your own reaction and still stay open – instead of denying it, downplaying it, or putting the other person down.' },

    { s: 'A friend is crying after a breakup. You feel her grief pulling you in strongly.',
      o: [
        'You cry along so much that you can barely speak yourself.',
        'Come on, let\'s go out, that will distract you quickly.',
        'Don\'t you worry, you\'ll surely find someone much better soon.',
        'You stay quietly with her, feel with her, and still stay inwardly steady.'
      ], a: 3,
      w: 'The fine line: emotional empathy without distance pulls you in; distraction and comfort phrases skip over the feeling. Compassion stays present – with inner steadiness.' },

    { s: 'Your partner talks excitedly about a project. You are tired and unfocused.',
      o: [
        '“Mhm, sounds good” – while your eyes keep drifting to your phone.',
        '“Can we maybe do this later?” – with no further explanation.',
        '“I\'m tired right now, but I want to listen – can you give me ten minutes?”',
        'You force yourself to listen and grow more and more irritated inside.'
      ], a: 2,
      w: 'Real closeness needs honesty about your own state – instead of fake listening, dismissing without reason, or overriding yourself until resentment builds.' },

    { s: 'A teammate becomes unusually quiet in the meeting after their idea was rejected.',
      o: [
        'Don\'t take it personally, that was just factual feedback.',
        'Your idea was really good, the others just didn\'t get it.',
        'He seems quite calm, so the rejection probably doesn\'t bother him.',
        'I notice you\'ve gone quiet – how is that for you?'
      ], a: 3,
      w: 'Notice the change and address it gently – instead of downplaying it, reflexively taking sides against others, or missing the quiet signal.' },

    { s: 'Your mother calls for the third time while you are in the middle of an urgent task.',
      o: [
        'You pick up annoyed and sound rather curt.',
        '“I\'m stuck right now – can I call you back in an hour?”',
        'You don\'t pick up, just to avoid any risk of a fight.',
        'You drop everything, even if it means missing your deadline.'
      ], a: 1,
      w: 'Empathy without self-loss: set your own boundary clearly and warmly – instead of dumping the stress into the relationship, avoiding, or giving yourself up.' },

    { s: 'An acquaintance proudly tells you about something that seems rather unimportant to you.',
      o: [
        'Come on, that really isn\'t anything special at all.',
        'Honestly, mine was a whole size bigger back then.',
        'I can see this really means a lot to you – tell me more.',
        'You nod kindly and politely, but inside you are somewhere else entirely.'
      ], a: 2,
      w: 'Empathy measures with their scale, not yours: see the value from their world – instead of belittling, one-upping, or staying politely absent.' },

    { s: 'Someone in a discussion suddenly reacts irritably to a question that is actually harmless.',
      o: [
        'Why are you reacting so aggressively to a harmless question?',
        'I think I touched a sore spot there.',
        'You get irritated yourself and fire back just as sharply.',
        'You withdraw and prefer to say nothing more about it.'
      ], a: 1,
      w: 'Suspect and name a hurt behind the irritation without shrinking yourself – instead of labeling, mirroring the agitation, or withdrawing completely.' },

    { s: 'The person across from you says “I\'m fine”, but sighs audibly.',
      o: [
        'Nice to hear that everything is really fine with you for once.',
        'Well, every one of us has a really bad day sometimes.',
        'The words say “fine”, the sigh sounds different – want to talk?',
        'Come on, spit it out, what\'s really going on?'
      ], a: 2,
      w: 'When there is a discrepancy, the body signal often counts more than the words: name the gap gently – instead of believing the words, dismissing it generally, or pushing.' }
];

/* ---------------- Philosophie ---------------- */
const SS_QUOTES = [
    { t: 'The beginner sees many possibilities, the master few – but he sees them fully.', w: 'Zen mind' },
    { t: 'Who sharpens one sense, sharpens all.', w: 'Shokunin path' },
    { t: 'It is not repetition that makes the master, but attention in the repetition.', w: 'Kaizen' },
    { t: 'The world is not poor in wonders, but in attention.', w: 'Old wisdom' },
    { t: 'Practice as if you had all the time – and as if this breath were the only one.', w: 'The Sensory school' }
];

/* ---------------- Pseudonym-Generator (anonym) ---------------- */
const SS_ALIAS_ADJ = ['Stiller', 'Wacher', 'Finer', 'Clearer', 'Tiefer', 'Quieter', 'Heller', 'Geduldiger', 'Wandernder', 'Zeitloser', 'Listener', 'Feeler', 'Scharfer', 'Gentler', 'Wahrer'];
const SS_ALIAS_NOUN = ['Fox', 'Crane', 'Lynx', 'Falcon', 'Wolf', 'Heron', 'Badger', 'Eule', 'Deer', 'Otter', 'Marten', 'Rabe', 'Ibex', 'Wal', 'Monk'];

/* =========================================================
   App
   ========================================================= */
class Sinnesschule {
    constructor() {
        this.view = 'dashboard';
        this.activeSense = 'sehen';
        this.timer = null;
        this.exam = null;
        this.leaderboard = null;
        this.state = this._defaultState();
    }

    _defaultState() {
        const senses = {};
        SS_SENSES.forEach(s => {
            senses[s.id] = { xp: 0, sessions: 0, doorGrade: 0, bestExam: 0, examScores: [] };
        });
        return {
            startedAt: new Date().toISOString().slice(0, 10),
            alias: null,
            senses,
            streak: 0,
            lastPracticeDate: null,
            totalSessions: 0,
            totalMinutes: 0,
            log: [],
            practiceDays: []
        };
    }

    async init() {
        await this._load();
        if (!this.state.alias) this.state.alias = this._generateAlias();
        this._bindNav();
        this.render();
    }

    /* ---------------- Persistenz ---------------- */
    _merge(base, incoming) {
        const out = JSON.parse(JSON.stringify(base));
        if (!incoming) return out;
        Object.keys(incoming).forEach(k => {
            if (k === 'senses' && incoming.senses) {
                SS_SENSES.forEach(s => {
                    out.senses[s.id] = Object.assign({}, out.senses[s.id], incoming.senses[s.id] || {});
                });
            } else {
                out[k] = incoming[k];
            }
        });
        return out;
    }

    async _load() {
        try {
            const local = JSON.parse(localStorage.getItem('ss_state'));
            if (local && local.startedAt) this.state = this._merge(this._defaultState(), local);
        } catch (e) { /* ignore */ }

        try {
            if (window.workflowAPI) {
                const res = await window.workflowAPI.getWorkflowResults(SS_METHOD);
                const remote = res && (res.results || res.state || (res.startedAt ? res : null));
                if (remote && remote.startedAt) {
                    this.state = this._merge(this._defaultState(), remote);
                    localStorage.setItem('ss_state', JSON.stringify(this.state));
                }
            }
        } catch (e) { console.warn('Cloud-Load fehlgeschlagen:', e); }
    }

    async _save() {
        localStorage.setItem('ss_state', JSON.stringify(this.state));
        let synced = false;
        try {
            if (window.workflowAPI) {
                const loggedIn = this._isLoggedIn();
                await window.workflowAPI.saveWorkflowResults(SS_METHOD, this.state);
                synced = !!loggedIn;
            }
        } catch (e) { console.warn('Cloud-Save fehlgeschlagen:', e); }
        this._setSyncBadge(synced);
    }

    _setSyncBadge(synced) {
        const badge = document.getElementById('ss-sync-badge');
        const text = document.getElementById('ss-sync-text');
        if (!badge || !text) return;
        if (synced) {
            badge.classList.add('synced');
            badge.querySelector('i').className = 'fas fa-cloud';
            text.textContent = 'Saved across devices';
        } else {
            badge.classList.remove('synced');
            badge.querySelector('i').className = 'fas fa-cloud-slash';
            text.textContent = 'Saved locally';
        }
    }

    /* ---------------- Identität / Anmeldung ---------------- */
    _isLoggedIn() {
        try { return !!(window.realUserAuth && window.realUserAuth.isLoggedIn && window.realUserAuth.isLoggedIn()); }
        catch (e) { return false; }
    }
    _identityId() {
        try {
            if (!this._isLoggedIn()) return null;
            const u = window.realUserAuth.getCurrentUser ? window.realUserAuth.getCurrentUser() : null;
            return (u && (u.id || u.sub || u.email)) || null;
        } catch (e) { return null; }
    }
    _openLogin() {
        try {
            if (window.realUserAuth && window.realUserAuth.showAuthModal) return window.realUserAuth.showAuthModal();
            if (window.realUserAuth && window.realUserAuth.openModal) return window.realUserAuth.openModal();
        } catch (e) { /* ignore */ }
        this._toast('Bitte melde dich über die Website an.');
    }

    _generateAlias() {
        const a = SS_ALIAS_ADJ[Math.floor(Math.random() * SS_ALIAS_ADJ.length)];
        const n = SS_ALIAS_NOUN[Math.floor(Math.random() * SS_ALIAS_NOUN.length)];
        const num = Math.floor(1000 + Math.random() * 9000);
        return `${a} ${n} #${num}`;
    }

    /* ---------------- Praxis-Tage / Streak ---------------- */
    _registerPracticeDay(minutes) {
        const today = this._today();
        const yest = this._dayOffset(-1);
        if (this.state.lastPracticeDate !== today) {
            if (this.state.lastPracticeDate === yest || !this.state.lastPracticeDate) {
                this.state.streak = (this.state.streak || 0) + 1;
            } else {
                this.state.streak = 1;
            }
            this.state.lastPracticeDate = today;
        }
        if (!this.state.practiceDays.includes(today)) this.state.practiceDays.push(today);
        this.state.totalSessions++;
        this.state.totalMinutes += minutes;
    }

    _today() { return new Date().toISOString().slice(0, 10); }
    _dayOffset(d) { return new Date(Date.now() + d * 86400000).toISOString().slice(0, 10); }

    /* ---------------- Graduierung (→ ∞) ---------------- */
    _rawGrade(id) { return SS_gradeFromXP(this.state.senses[id].xp); }
    _grade(id) { return Math.min(this._rawGrade(id), (this.state.senses[id].doorGrade || 0) + 1); }
    _needsExam(id) { return this._rawGrade(id) > this._grade(id); }
    _title(id) { return SS_titleFor(this._grade(id)); }

    _gradeProgress(id) {
        if (this._needsExam(id)) return 100;
        const g = this._grade(id);
        const base = SS_T(g), next = SS_T(g + 1);
        const xp = this.state.senses[id].xp;
        return Math.max(0, Math.min(100, Math.round(((xp - base) / (next - base)) * 100)));
    }
    _xpToNext(id) {
        const g = this._grade(id);
        return Math.max(0, SS_T(g + 1) - this.state.senses[id].xp);
    }

    _totalXP() { return SS_SENSES.reduce((a, s) => a + (this.state.senses[s.id].xp || 0), 0); }
    _overallGrade() { return SS_gradeFromXP(Math.round(this._totalXP() / SS_SENSES.length)); }
    _overallTitle() { return SS_titleFor(this._overallGrade()); }

    /* ---------------- Navigation ---------------- */
    _bindNav() {
        document.querySelectorAll('.ss-nav-btn').forEach(btn => {
            btn.addEventListener('click', () => this.go(btn.dataset.view));
        });
        this._bindSwipe();
    }
    _bindSwipe() {
        const main = document.getElementById('ss-main');
        if (!main || main._swipeBound) return;
        main._swipeBound = true;
        let x0 = null, y0 = null;
        main.addEventListener('touchstart', e => {
            if (e.touches.length !== 1) { x0 = null; return; }
            x0 = e.touches[0].clientX; y0 = e.touches[0].clientY;
        }, { passive: true });
        main.addEventListener('touchend', e => {
            if (x0 == null) return;
            const t = e.changedTouches[0];
            const dx = t.clientX - x0, dy = t.clientY - y0;
            x0 = null;
            if (Math.abs(dx) < 65 || Math.abs(dy) > 55) return;
            if (this.timer) return; // nicht während einer laufenden Übung
            const views = [...document.querySelectorAll('#ss-nav .ss-nav-btn')].map(b => b.dataset.view);
            const cur = views.indexOf(this.view);
            if (cur < 0) return;
            const next = dx < 0 ? cur + 1 : cur - 1;
            if (next < 0 || next >= views.length) return;
            this._haptic('light');
            this.go(views[next]);
        }, { passive: true });
    }

    go(view) {
        this._stopTimer();
        this.view = view;
        document.querySelectorAll('.ss-nav-btn').forEach(b => b.classList.toggle('active', b.dataset.view === view));
        this.render();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    render() {
        const main = document.getElementById('ss-main');
        if (!main) return;
        switch (this.view) {
            case 'dashboard': main.innerHTML = this._renderDashboard(); this._afterDashboard(); break;
            case 'practice':  main.innerHTML = this._renderPractice(); this._afterPractice(); break;
            case 'exams':     main.innerHTML = this._renderExams(); this._afterExams(); break;
            case 'journal':   main.innerHTML = this._renderJournal(); this._afterJournal(); break;
            case 'journey':   main.innerHTML = this._renderJourney(); break;
            case 'arena':     main.innerHTML = this._renderArena(); this._afterArena(); break;
        }
        this._setSyncBadge(document.getElementById('ss-sync-badge')?.classList.contains('synced'));
    }

    /* ===================== DASHBOARD ===================== */
    _renderDashboard() {
        const days = (this.state.practiceDays || []).length;
        const hours = Math.floor(this.state.totalMinutes / 60);
        const mins = this.state.totalMinutes % 60;
        const quote = SS_QUOTES[days % SS_QUOTES.length];

        return `
        <div class="ss-hero">
            <div class="ss-kicker">Lifelong path · since ${this._fmtDate(this.state.startedAt)}</div>
            <h1>Train your senses, train your perception</h1>
            <p>Seven disciplines – from the five senses via the inner sense to empathy. Choose one daily, practice it consciously, and open the door to the next level through exams. The path never ends – it only deepens.</p>
        </div>

        <div class="ss-stats">
            <div class="ss-stat"><div class="ss-stat-value">${this.state.streak > 0 ? '<span class="flame">🔥</span> ' : ''}${this.state.streak || 0}</div><div class="ss-stat-label">Tage in Folge</div></div>
            <div class="ss-stat"><div class="ss-stat-value">${days}</div><div class="ss-stat-label">Practice days</div></div>
            <div class="ss-stat"><div class="ss-stat-value">${hours}h ${mins}m</div><div class="ss-stat-label">Total practice</div></div>
            <div class="ss-stat"><div class="ss-stat-value">${this._totalXP().toLocaleString('de-DE')}</div><div class="ss-stat-label">Total sharpness</div></div>
        </div>

        <p class="ss-section-title">Deine Disziplinen</p>
        <div class="ss-grid">
            ${SS_SENSES.map(s => this._senseCard(s)).join('')}
        </div>

        <div class="ss-quote">„${quote.t}"<span class="who">— ${quote.w}</span></div>
        `;
    }

    _senseCard(s) {
        const st = this.state.senses[s.id];
        const grade = this._grade(s.id);
        const prog = this._gradeProgress(s.id);
        const needsExam = this._needsExam(s.id);
        return `
        <div class="ss-sense-card" data-sense="${s.id}" style="--accent:${s.accent};--accent-soft:${s.soft};--accent-glow:${s.glow}">
            <div class="ss-sense-head">
                <div class="ss-sense-icon">${s.icon}</div>
                <div>
                    <div class="ss-sense-name">${s.name}</div>
                    <div class="ss-sense-grade-name">${SS_titleFor(grade)}</div>
                </div>
                <div class="ss-sense-rank">${this._romanGrade(grade)}</div>
            </div>
            <div class="ss-progress-track"><div class="ss-progress-fill" style="width:${prog}%"></div></div>
            <div class="ss-sense-meta">
                <span>${st.xp.toLocaleString('de-DE')} Sharpness</span>
                <span>${needsExam ? '⚑ Prüfung öffnet die Tür' : `noch ${this._xpToNext(s.id).toLocaleString('de-DE')}`}</span>
            </div>
        </div>`;
    }

    _romanGrade(g) {
        // dezente Stufenanzeige (Grad), nie ein Maximum – nur ein wachsender Rang
        return 'Grad ' + g;
    }

    _afterDashboard() {
        document.querySelectorAll('.ss-sense-card').forEach(card => {
            card.addEventListener('click', () => {
                this.activeSense = card.dataset.sense;
                this.go('practice');
            });
        });
    }

    /* ===================== PRACTICE (Dojo) ===================== */
    _renderPractice() {
        const s = SS_SENSE_MAP[this.activeSense];
        const grade = this._grade(this.activeSense);
        const exs = SS_EXERCISES[this.activeSense] || [];
        const needsExam = this._needsExam(this.activeSense);
        const linked = SS_LINKED_METHODS[this.activeSense] || [];
        const linkedHtml = linked.length ? `
        <div class="ss-panel" style="--accent:${s.accent};--accent-soft:${s.soft}">
            <h3><i class="fas fa-route"></i> Deepen your path</h3>
            <p class="sub">${this.activeSense === 'empathie'
                ? 'Empathie fließt nahtlos in deine Persönlichkeitsentwicklung. Dieser Pfad vertieft jeden Aspekt – vom Verstehen über das Fühlen bis zum inneren Halt:'
                : 'Diese Disziplin fließt nahtlos in deine Persönlichkeitsentwicklung. Vertiefe sie mit passenden Methoden:'}</p>
            <div class="ss-link-list">
                ${linked.map(m => `
                <a class="ss-link-item" href="${m.href}">
                    <span class="ss-link-tag">${this._esc(m.tag || '')}</span>
                    <span class="ss-link-body">
                        <span class="ss-link-label">${this._esc(m.label)}</span>
                        <span class="ss-link-desc">${this._esc(m.desc || '')}</span>
                    </span>
                    <i class="fas fa-arrow-right-long"></i>
                </a>`).join('')}
            </div>
        </div>` : '';

        return `
        <div class="ss-sense-picker">
            ${SS_SENSES.map(x => `<button class="ss-chip ${x.id === this.activeSense ? 'active' : ''}" data-sense="${x.id}">${x.icon} ${x.name}</button>`).join('')}
        </div>

        <div class="ss-panel" style="--accent:${s.accent};--accent-soft:${s.soft}">
            <h2>${s.icon} ${s.name} — ${SS_titleFor(grade)} (Grad ${grade})</h2>
            <p class="sub">Choose an exercise and do it consciously. Each completed exercise brings sharpness points and a logbook entry.</p>
            ${needsExam ? `<div style="background:rgba(224,176,74,.12);border:1px solid rgba(224,176,74,.35);color:#e0b04a;padding:12px 16px;border-radius:12px;margin-bottom:16px;font-size:14px"><i class="fas fa-medal"></i> Du hast genug geübt – die <strong>Prüfung des ${s.name}s</strong> öffnet die Tür zum nächsten Grad. <button class="ss-btn ss-btn-gold" style="margin-left:10px;padding:6px 14px;font-size:13px" id="ss-goto-exam">Zur Prüfung</button></div>` : ''}
            <div class="ss-exercise-list">
                ${exs.map(ex => `
                    <div class="ss-exercise-item" data-ex="${ex.id}">
                        <div class="ic">${ex.icon}</div>
                        <div class="body">
                            <div class="title">${ex.title}</div>
                            <div class="desc">${ex.breath ? 'Guided breathing exercise' : ex.game ? (ex.gameLabel || 'Interaktiv') : ex.steps.length + ' Schritte'} · +${ex.xp} Schärfe</div>
                        </div>
                        <div class="dur">${Math.round(ex.dur / 60)} Min</div>
                    </div>`).join('')}
            </div>
        </div>
        ${linkedHtml}`;
    }

    _afterPractice() {
        document.querySelectorAll('.ss-chip').forEach(c => c.addEventListener('click', () => {
            this.activeSense = c.dataset.sense; this.render();
        }));
        document.querySelectorAll('.ss-exercise-item').forEach(item => {
            item.addEventListener('click', () => this._startExercise(item.dataset.ex));
        });
        const examBtn = document.getElementById('ss-goto-exam');
        if (examBtn) examBtn.addEventListener('click', () => this.go('exams'));
    }

    _findExercise(id) {
        return (SS_EXERCISES[this.activeSense] || []).find(e => e.id === id);
    }

    /* ---------------- Übungs-Player ---------------- */
    _startExercise(exId) {
        const ex = this._findExercise(exId);
        if (!ex) return;
        this._stopTimer();
        if (ex.game) return this._startGame(ex);
        const s = SS_SENSE_MAP[this.activeSense];
        const R = 110, C = 2 * Math.PI * R;

        const main = document.getElementById('ss-main');
        main.innerHTML = `
        <div class="ss-panel ss-player" style="--accent:${s.accent}">
            <h2>${ex.icon} ${ex.title}</h2>
            <div class="ss-ring-wrap" ${ex.breath ? 'style="display:none"' : ''}>
                <svg width="240" height="240">
                    <defs><linearGradient id="ssGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stop-color="#6366f1"/><stop offset="100%" stop-color="#8b5cf6"/>
                    </linearGradient></defs>
                    <circle class="ss-ring-bg" cx="120" cy="120" r="${R}"/>
                    <circle class="ss-ring-fg" id="ss-ring" cx="120" cy="120" r="${R}" stroke-dasharray="${C}" stroke-dashoffset="0"/>
                </svg>
                <div class="ss-ring-time" id="ss-time">${this._mmss(ex.dur)}</div>
            </div>
            ${ex.breath ? `<div class="ss-breath-orb" id="ss-orb">Bereit</div>` : ''}
            <div class="ss-instruction" id="ss-instr">${ex.breath ? 'Folge dem Atemrhythmus des Kreises.' : ex.steps[0].text}</div>
            <div class="ss-player-controls">
                <button class="ss-btn ss-btn-ghost" id="ss-stop"><i class="fas fa-xmark"></i> Beenden</button>
            </div>
        </div>`;

        document.getElementById('ss-stop').addEventListener('click', () => { this._stopTimer(); this.render(); });

        if (ex.breath) this._runBreath(ex);
        else this._runGuided(ex, R, C);
    }

    _runGuided(ex, R, C) {
        let elapsed = 0;
        const total = ex.dur;
        let stepIdx = 0;
        let stepEnd = ex.steps[0].sec;
        const ring = document.getElementById('ss-ring');
        const timeEl = document.getElementById('ss-time');
        const instr = document.getElementById('ss-instr');

        this.timer = setInterval(() => {
            elapsed++;
            const left = total - elapsed;
            if (timeEl) timeEl.textContent = this._mmss(Math.max(0, left));
            if (ring) ring.style.strokeDashoffset = C * (elapsed / total);

            if (elapsed >= stepEnd && stepIdx < ex.steps.length - 1) {
                stepIdx++;
                stepEnd += ex.steps[stepIdx].sec;
                if (instr) { instr.style.opacity = 0; setTimeout(() => { instr.textContent = ex.steps[stepIdx].text; instr.style.opacity = 1; }, 350); }
            }
            if (elapsed >= total) { this._stopTimer(); this._completeExercise(ex); }
        }, 1000);
    }

    async _runBreath(ex) {
        const orb = document.getElementById('ss-orb');
        const instr = document.getElementById('ss-instr');
        let stopped = false;
        this._breathStop = () => { stopped = true; };

        for (let r = 0; r < ex.breath.repeats && !stopped; r++) {
            for (const ph of ex.breath.phases) {
                if (stopped) break;
                if (orb) { orb.className = 'ss-breath-orb ' + ph.action; orb.textContent = ph.label; }
                if (instr) instr.textContent = `${ph.label} … (${r + 1}/${ex.breath.repeats})`;
                await this._wait(ph.sec * 1000, () => stopped);
            }
        }
        if (!stopped) this._completeExercise(ex);
    }

    /* ---------------- Audio-Helfer ---------------- */
    _audio() {
        if (!this._ac) {
            try { this._ac = new (window.AudioContext || window.webkitAudioContext)(); }
            catch (e) { this._ac = null; }
        }
        if (this._ac && this._ac.state === 'suspended') { try { this._ac.resume(); } catch (e) { /* ignore */ } }
        return this._ac;
    }
    _playTone(freq, ms = 600, type = 'sine') {
        const ctx = this._audio();
        if (!ctx) return;
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = type; o.frequency.value = freq;
        const t0 = ctx.currentTime, dur = ms / 1000;
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(0.28, t0 + 0.02);
        g.gain.setValueAtTime(0.28, t0 + dur - 0.06);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
        o.start(t0); o.stop(t0 + dur + 0.02);
    }

    /* ---------------- Interaktive Übungs-Spiele ---------------- */
    _startGame(ex) {
        const s = SS_SENSE_MAP[this.activeSense];
        const main = document.getElementById('ss-main');
        main.innerHTML = `
        <div class="ss-panel ss-player ss-game-panel" style="--accent:${s.accent}">
            <h2>${ex.icon} ${ex.title}</h2>
            ${ex.intro ? `<p class="sub">${this._esc(ex.intro)}</p>` : ''}
            <div id="ss-game" class="ss-game"></div>
            <div class="ss-player-controls">
                <button class="ss-btn ss-btn-ghost" id="ss-stop"><i class="fas fa-xmark"></i> Beenden</button>
            </div>
        </div>`;
        document.getElementById('ss-stop').addEventListener('click', () => this.render());
        const finish = () => this._completeExercise(ex);
        if (ex.game === 'pitch') this._pitchStage({ mount: 'ss-game', rounds: 6, grade: this._grade(this.activeSense), onFinish: finish });
        else if (ex.game === 'time') this._timeStage({ mount: 'ss-game', rounds: 3, onFinish: finish });
        else if (ex.game === 'challenge') this._challengeStage(ex, 'ss-game', finish);
        else this.render();
    }

    // Tonhöhen-Unterscheidung (Hören) – wird mit Runde & Grad feiner
    _pitchStage(opts) {
        const pads = 4;
        const st = { round: 0, correct: 0 };
        const render = () => {
            const el = document.getElementById(opts.mount);
            if (!el) return;
            if (st.round >= opts.rounds) { opts.onFinish(Math.round(st.correct / opts.rounds * 100)); return; }
            const base = 300 + Math.random() * 180;
            const cents = Math.max(9, 80 - st.round * 7 - (opts.grade || 0) * 2.5);
            const higher = Math.floor(Math.random() * pads);
            const freqs = Array.from({ length: pads }, (_, i) => i === higher ? base * Math.pow(2, cents / 1200) : base);
            el.innerHTML = `
                <div class="ss-game-head"><strong>Round ${st.round + 1}/${opts.rounds}</strong><span>Which tone is the highest?</span></div>
                <div class="ss-pitch-pads">
                    ${freqs.map((_, i) => `<button class="ss-pitch-pad" data-i="${i}"><i class="fas fa-volume-high"></i><b>${i + 1}</b></button>`).join('')}
                </div>
                <button class="ss-btn ss-btn-ghost ss-pitch-all"><i class="fas fa-play"></i> All one after another</button>
                <div class="ss-pitch-answer"><span>Your answer:</span><div class="ss-ans-row">${freqs.map((_, i) => `<button class="ss-ans" data-ans="${i}">${i + 1}</button>`).join('')}</div></div>`;
            const playPad = (i, ms) => { const p = el.querySelector(`.ss-pitch-pad[data-i="${i}"]`); if (p) { p.classList.add('playing'); setTimeout(() => p.classList.remove('playing'), ms); } this._playTone(freqs[i], ms); };
            el.querySelectorAll('.ss-pitch-pad').forEach(p => p.addEventListener('click', () => playPad(+p.dataset.i, 650)));
            el.querySelector('.ss-pitch-all').addEventListener('click', () => freqs.forEach((_, i) => setTimeout(() => playPad(i, 480), i * 620)));
            el.querySelectorAll('.ss-ans').forEach(a => a.addEventListener('click', () => {
                const ans = +a.dataset.ans;
                if (ans === higher) st.correct++;
                el.querySelectorAll('.ss-ans').forEach(b => {
                    const i = +b.dataset.ans;
                    if (i === higher) b.classList.add('correct');
                    else if (i === ans) b.classList.add('wrong');
                    b.disabled = true;
                });
                this._playTone(freqs[higher], 420);
                st.round++;
                setTimeout(render, 750);
            }));
        };
        render();
    }

    // Zeitgefühl (Innensinn) – Zeitspanne ohne Zählen schätzen
    _timeStage(opts) {
        const targets = [8, 12, 15, 18, 22, 25, 30].sort(() => Math.random() - 0.5).slice(0, opts.rounds);
        const st = { round: 0, errs: [] };
        const render = () => {
            const el = document.getElementById(opts.mount);
            if (!el) return;
            if (st.round >= opts.rounds) {
                const avg = st.errs.reduce((a, b) => a + b, 0) / st.errs.length;
                opts.onFinish(Math.max(0, Math.round(100 - avg * 100)));
                return;
            }
            const target = targets[st.round];
            el.innerHTML = `
                <div class="ss-game-head"><strong>Round ${st.round + 1}/${opts.rounds}</strong><span>Don't count – just feel!</span></div>
                <div class="ss-time-target">Estimate <b>${target} Seconds</b></div>
                <div class="ss-time-orb" id="ss-time-orb">Ready</div>
                <button class="ss-btn ss-btn-primary" id="ss-time-go"><i class="fas fa-play"></i> Start</button>
                <div class="ss-time-fb" id="ss-time-fb"></div>`;
            let t0 = null;
            const orb = el.querySelector('#ss-time-orb');
            const btn = el.querySelector('#ss-time-go');
            btn.addEventListener('click', () => {
                if (t0 === null) {
                    t0 = performance.now();
                    orb.classList.add('running'); orb.textContent = '…';
                    btn.innerHTML = '<i class="fas fa-hand"></i> Now!';
                } else {
                    const elapsed = (performance.now() - t0) / 1000;
                    const err = Math.min(1, Math.abs(elapsed - target) / target);
                    st.errs.push(err);
                    orb.classList.remove('running');
                    btn.disabled = true;
                    const fb = el.querySelector('#ss-time-fb');
                    if (fb) fb.innerHTML = `You: <b>${elapsed.toFixed(1)}s</b> · Target ${target}s · deviation ${Math.round(err * 100)}%`;
                    st.round++;
                    setTimeout(render, 1500);
                }
            });
        };
        render();
    }

    // Wahrnehmungs-Mission (Riechen/Schmecken/Tasten) – zufällig, mit Checkliste
    _challengeStage(ex, mount, onFinish) {
        const pool = SS_CHALLENGES[this.activeSense] || [];
        const m = pool.length ? pool[Math.floor(Math.random() * pool.length)] : { title: 'Mission', items: ['Notice something consciously'] };
        const el = document.getElementById(mount);
        if (!el) return;
        el.innerHTML = `
            <div class="ss-mission">
                <div class="ss-mission-title">🗺️ ${this._esc(m.title)}</div>
                <p class="sub">Complete the three small tasks in your surroundings and check them off. A new mission awaits you each time.</p>
                <div class="ss-mission-items">
                    ${m.items.map((it, i) => `<label class="ss-mission-item"><input type="checkbox" data-i="${i}"><span>${this._esc(it)}</span></label>`).join('')}
                </div>
                <button class="ss-btn ss-btn-primary" id="ss-mission-done" disabled><i class="fas fa-check"></i> Complete mission</button>
            </div>`;
        const boxes = [...el.querySelectorAll('.ss-mission-item input')];
        const doneBtn = el.querySelector('#ss-mission-done');
        const upd = () => {
            boxes.forEach(b => b.closest('.ss-mission-item').classList.toggle('checked', b.checked));
            doneBtn.disabled = !boxes.every(b => b.checked);
        };
        boxes.forEach(b => b.addEventListener('change', upd));
        doneBtn.addEventListener('click', () => onFinish(100));
    }

    _completeExercise(ex) {
        const id = this.activeSense;
        const before = this._grade(id);
        const minutes = Math.max(1, Math.round(ex.dur / 60));
        this._registerPracticeDay(minutes);
        this.state.senses[id].xp += ex.xp;
        this.state.senses[id].sessions++;
        const after = this._grade(id);

        this._save();
        this._chime();

        if (after > before) { this._haptic('level'); this._celebrate(); this._showLevelUp(id, after); }
        else { this._haptic('ok'); this._toast(`+${ex.xp} Sharpness · ${SS_SENSE_MAP[id].name}`, 'success'); }

        this._openReflection(ex);
    }

    _openReflection(ex) {
        const s = SS_SENSE_MAP[this.activeSense];
        const main = document.getElementById('ss-main');
        main.innerHTML = `
        <div class="ss-panel" style="--accent:${s.accent};--accent-soft:${s.soft}">
            <h2><i class="fas fa-feather"></i> What did you notice?</h2>
            <p class="sub">Note what stood out today – something you would have missed yesterday. That sharpens the sense more than the exercise itself.</p>
            <div class="ss-field">
                <label>Your observation (${s.name})</label>
                <textarea class="ss-textarea" id="ss-refl" placeholder="e.g. For the first time I heard the fridge humming quietly under the traffic …"></textarea>
            </div>
            <div class="ss-field">
                <label>How clear was your perception?</label>
                <div class="ss-rating" id="ss-refl-rating">
                    ${[1,2,3,4,5].map(i => `<span class="star" data-v="${i}">★</span>`).join('')}
                </div>
            </div>
            <div style="display:flex;gap:12px;flex-wrap:wrap">
                <button class="ss-btn ss-btn-primary" id="ss-refl-save"><i class="fas fa-check"></i> Save entry</button>
                <button class="ss-btn ss-btn-ghost" id="ss-refl-skip">Skip</button>
            </div>
        </div>`;

        let rating = 3;
        const stars = main.querySelectorAll('#ss-refl-rating .star');
        const paint = () => stars.forEach(st => st.classList.toggle('on', +st.dataset.v <= rating));
        stars.forEach(st => st.addEventListener('click', () => { rating = +st.dataset.v; paint(); }));
        paint();

        main.querySelector('#ss-refl-save').addEventListener('click', () => {
            const text = main.querySelector('#ss-refl').value.trim();
            this.state.log.unshift({
                id: Date.now(), date: this._today(), sense: this.activeSense,
                exercise: ex.title, text: text || '(no note)', rating
            });
            this._save();
            this._toast('Logbook entry saved', 'success');
            this.go('dashboard');
        });
        main.querySelector('#ss-refl-skip').addEventListener('click', () => this.go('dashboard'));
    }

    _showLevelUp(senseId, grade) {
        const s = SS_SENSE_MAP[senseId];
        let ov = document.querySelector('.ss-levelup');
        if (!ov) { ov = document.createElement('div'); ov.className = 'ss-levelup'; document.body.appendChild(ov); }
        ov.innerHTML = `
        <div class="ss-levelup-card">
            <div class="seal">${s.icon}</div>
            <h2>Level up!</h2>
            <p>${s.name} · Level ${grade}<br><strong style="color:#e0b04a;font-size:18px">${SS_titleFor(grade)}</strong></p>
            <button class="ss-btn ss-btn-gold ss-btn-lg" id="ss-lvl-ok">Continue on the path</button>
        </div>`;
        ov.classList.add('show');
        ov.querySelector('#ss-lvl-ok').addEventListener('click', () => ov.classList.remove('show'));
        this._chime(true);
    }

    /* ===================== EXAMS ===================== */
    _renderExams() {
        return `
        <div class="ss-hero">
            <div class="ss-kicker">Prüfungen</div>
            <h1>Öffne die nächste Tür</h1>
            <p>Each discipline has its exam. Pass it – once you have practiced enough – to rise to the next level. The required score rises with each level: a path that never ends.</p>
        </div>
        <div class="ss-grid">
            ${SS_SENSES.map(s => {
                const st = this.state.senses[s.id];
                const grade = this._grade(s.id);
                const req = SS_reqExam(grade);
                const best = st.examScores.length ? Math.max(...st.examScores.map(e => e.score)) : 0; const needsExam = this._needsExam(s.id); return `
                <div class="ss-sense-card" data-exam="${s.id}" style="--accent:${s.accent};--accent-soft:${s.soft};--accent-glow:${s.glow}">
                    <div class="ss-sense-head">
                        <div class="ss-sense-icon">${s.icon}</div>
                        <div>
                            <div class="ss-sense-name">${SS_EXAMS[s.id].title}</div>
                            <div class="ss-sense-grade-name">${st.examScores.length} Versuche · Best ${best}</div>
                        </div>
                        <div class="ss-sense-rank">≥ ${req}</div>
                    </div>
                    <p class="ss-sense-meta" style="margin-top:8px">${needsExam ? '⚑ Tür wartet auf dich' : `Grad ${grade} · ${SS_titleFor(grade)}`}</p>
                </div>`;
            }).join('')}
        </div>`;
    }

    _afterExams() {
        document.querySelectorAll('[data-exam]').forEach(c => {
            c.addEventListener('click', () => this._startExam(c.dataset.exam));
        });
    }

    _startExam(senseId) {
        this.activeSense = senseId;
        const exam = SS_EXAMS[senseId];
        if (exam.type === 'color') return this._examColor(senseId);
        if (exam.type === 'pitch') return this._examPitch(senseId);
        if (exam.type === 'time') return this._examTime(senseId);
        if (exam.type === 'rounds') return this._examRounds(senseId);
        if (exam.type === 'count') return this._examCount(senseId);
        if (exam.type === 'scale') return this._examScale(senseId);
        if (exam.type === 'scenario') return this._examScenario(senseId);
    }

    _examStageShell(senseId) {
        const s = SS_SENSE_MAP[senseId];
        const grade = this._grade(senseId);
        document.getElementById('ss-main').innerHTML = `
        <div class="ss-panel" style="--accent:${s.accent}">
            <h2>${s.icon} ${SS_EXAMS[senseId].title}</h2>
            <p class="sub">${SS_EXAMS[senseId].protocol} · Pass at ${SS_reqExam(grade)} points.</p>
            <div id="ss-exam-stage"></div>
        </div>`;
        return grade;
    }

    // Hör-Prüfung (interaktives Tonhöhen-Spiel)
    _examPitch(senseId) {
        const grade = this._examStageShell(senseId);
        const rounds = Math.min(6 + Math.floor(grade / 3), 14);
        this._pitchStage({ mount: 'ss-exam-stage', rounds, grade, onFinish: (score) => this._finishExam(score) });
    }

    // Innensinn-Prüfung (Zeitgefühl)
    _examTime(senseId) {
        this._examStageShell(senseId);
        this._timeStage({ mount: 'ss-exam-stage', rounds: 4, onFinish: (score) => this._finishExam(score) });
    }

    // Riechen/Schmecken/Tasten-Prüfung (rundenbasierte Blind-Challenge, zufällige Aufgaben)
    _examRounds(senseId) {
        this._examStageShell(senseId);
        const exam = SS_EXAMS[senseId];
        const total = exam.target;
        const prompts = (exam.prompts || []).slice().sort(() => Math.random() - 0.5);
        const st = { round: 0, correct: 0 };
        const render = () => {
            const el = document.getElementById('ss-exam-stage');
            if (!el) return;
            if (st.round >= total) { this._finishExam(Math.round(st.correct / total * 100)); return; }
            const prompt = prompts[st.round % prompts.length] || 'Notice consciously';
            el.innerHTML = `
                <div class="ss-game-head"><strong>Round ${st.round + 1}/${total}</strong><span>Be honest with yourself</span></div>
                <div class="ss-mission-title" style="margin:6px 0 18px">${this._esc(prompt)}</div>
                <div class="ss-rounds-btns">
                    <button class="ss-btn ss-btn-primary" data-ok="1"><i class="fas fa-check"></i> Recognized</button>
                    <button class="ss-btn ss-btn-ghost" data-ok="0"><i class="fas fa-xmark"></i> Missed</button>
                </div>`;
            el.querySelectorAll('[data-ok]').forEach(b => b.addEventListener('click', () => {
                if (+b.dataset.ok) st.correct++;
                st.round++;
                render();
            }));
        };
        render();
    }

    // --- Empathie-Prüfung (Szenarien, kognitive Empathie) ---
    _examScenario(senseId) {
        const s = SS_SENSE_MAP[senseId];
        const grade = this._grade(senseId);
        const rounds = Math.min(SS_EMP_SCENARIOS.length, 6 + Math.floor(grade / 4));
        const pool = SS_EMP_SCENARIOS.slice().sort(() => Math.random() - 0.5).slice(0, rounds);
        this.exam = { round: 0, total: pool.length, correct: 0, pool, locked: false };
        const main = document.getElementById('ss-main');
        main.innerHTML = `
        <div class="ss-panel" style="--accent:${s.accent}">
            <h2>${s.icon} ${SS_EXAMS[senseId].title}</h2>
            <p class="sub">${SS_EXAMS[senseId].protocol} · Pass at ${SS_reqExam(grade)} points.</p>
            <div id="ss-exam-stage"></div>
        </div>`;
        this._renderScenarioRound();
    }

    _renderScenarioRound() {
        const ex = this.exam;
        const stage = document.getElementById('ss-exam-stage');
        if (ex.round >= ex.total) return this._finishExam(Math.round(ex.correct / ex.total * 100));

        const item = ex.pool[ex.round];
        ex.locked = false;
        const order = item.o.map((text, idx) => ({ text, idx })).sort(() => Math.random() - 0.5);

        stage.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
                <strong>Situation ${ex.round + 1}/${ex.total}</strong>
                <span style="color:var(--ss-text-dim);font-size:13px">What is most empathic?</span>
            </div>
            <div class="ss-scenario">${this._esc(item.s)}</div>
            <div class="ss-options">
                ${order.map(op => `<button class="ss-option" data-idx="${op.idx}">${this._esc(op.text)}</button>`).join('')}
            </div>
            <div id="ss-scenario-feedback"></div>`;

        stage.querySelectorAll('.ss-option').forEach(btn => {
            btn.addEventListener('click', () => {
                if (ex.locked) return;
                ex.locked = true;
                const chosen = +btn.dataset.idx;
                const correct = item.a;
                const right = chosen === correct;
                stage.querySelectorAll('.ss-option').forEach(b => {
                    const i = +b.dataset.idx;
                    if (i === correct) b.classList.add('correct');
                    else if (i === chosen) b.classList.add('wrong');
                    b.disabled = true;
                });
                if (right) ex.correct++;

                const last = ex.round >= ex.total - 1;
                const fb = document.getElementById('ss-scenario-feedback');
                if (fb) {
                    fb.innerHTML = `
                    <div class="ss-scenario-why ${right ? 'right' : 'wrong'}">
                        <div class="head">${right ? '<i class="fas fa-check-circle"></i> Fein wahrgenommen' : '<i class="fas fa-lightbulb"></i> Schau genauer hin'}</div>
                        <p>${this._esc(item.w)}</p>
                    </div>
                    <button class="ss-btn ss-btn-primary" id="ss-scenario-next">${last ? '<i class="fas fa-flag-checkered"></i> Auswerten' : 'Weiter'} <i class="fas fa-arrow-right-long"></i></button>`;
                    const next = document.getElementById('ss-scenario-next');
                    next.addEventListener('click', () => { ex.round++; this._renderScenarioRound(); });
                    next.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            });
        });
    }

    // --- Farb-Prüfung (interaktiv, skaliert mit Grad) ---
    _examColor(senseId) {
        const s = SS_SENSE_MAP[senseId];
        const grade = this._grade(senseId);
        const rounds = Math.min(8 + Math.floor(grade / 2), 20);
        this.exam = { round: 0, total: rounds, correct: 0, grade };
        const main = document.getElementById('ss-main');
        main.innerHTML = `
        <div class="ss-panel" style="--accent:${s.accent}">
            <h2>${s.icon} ${SS_EXAMS[senseId].title}</h2>
            <p class="sub">${SS_EXAMS[senseId].protocol} · Pass at ${SS_reqExam(grade)} points.</p>
            <div id="ss-exam-stage"></div>
        </div>`;
        this._renderColorRound();
    }

    _renderColorRound() {
        const ex = this.exam;
        const stage = document.getElementById('ss-exam-stage');
        if (ex.round >= ex.total) return this._finishExam(Math.round(ex.correct / ex.total * 100));

        const count = 9;
        const hue = Math.floor(Math.random() * 360);
        const sat = 45 + Math.random() * 20;
        const light = 50 + Math.random() * 10;
        // wird mit Runde UND Grad feiner
        const delta = Math.max(2.2, 20 - ex.round * 2 - ex.grade * 0.6);
        const odd = Math.floor(Math.random() * count);
        const base = `hsl(${hue}, ${sat}%, ${light}%)`;
        const oddC = `hsl(${hue}, ${sat}%, ${light + delta}%)`;

        stage.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                <strong>Round ${ex.round + 1}/${ex.total}</strong>
                <span style="color:var(--ss-text-dim);font-size:13px">Which field differs?</span>
            </div>
            <div class="ss-swatch-grid">
                ${Array.from({ length: count }, (_, i) => `<div class="ss-swatch" data-i="${i}" style="background:${i === odd ? oddC : base}"></div>`).join('')}
            </div>`;
        stage.querySelectorAll('.ss-swatch').forEach(sw => {
            sw.addEventListener('click', () => {
                if (+sw.dataset.i === odd) ex.correct++;
                else sw.style.outline = '3px solid #ef4444';
                ex.round++;
                setTimeout(() => this._renderColorRound(), 180);
            });
        });
    }

    _examCount(senseId) {
        const s = SS_SENSE_MAP[senseId];
        const exam = SS_EXAMS[senseId];
        const grade = this._grade(senseId);
        const main = document.getElementById('ss-main');
        main.innerHTML = `
        <div class="ss-panel" style="--accent:${s.accent}">
            <h2>${s.icon} ${exam.title}</h2>
            <p class="sub">${exam.protocol} · Pass at ${SS_reqExam(grade)} points.</p>
            <div class="ss-field">
                <label>How many ${exam.unit} could you clearly distinguish / recognize?</label>
                <div class="ss-slider-row">
                    <input type="range" id="ss-count" min="0" max="${exam.target + 6}" value="0">
                    <span class="ss-slider-val" id="ss-count-val">0</span>
                </div>
                <p style="color:var(--ss-text-faint);font-size:13px;margin-top:6px">Benchmark for a full score: ${exam.target} ${exam.unit}. Be honest – only then do you measure real progress.</p>
            </div>
            <button class="ss-btn ss-btn-primary" id="ss-count-submit"><i class="fas fa-flag-checkered"></i> Finish exam</button>
        </div>`;
        const slider = main.querySelector('#ss-count');
        const val = main.querySelector('#ss-count-val');
        slider.addEventListener('input', () => val.textContent = slider.value);
        main.querySelector('#ss-count-submit').addEventListener('click', () => {
            const score = Math.min(100, Math.round((+slider.value / exam.target) * 100));
            this._finishExam(score);
        });
    }

    _examScale(senseId) {
        const s = SS_SENSE_MAP[senseId];
        const exam = SS_EXAMS[senseId];
        const grade = this._grade(senseId);
        const main = document.getElementById('ss-main');
        main.innerHTML = `
        <div class="ss-panel" style="--accent:${s.accent}">
            <h2>${s.icon} ${exam.title}</h2>
            <p class="sub">${exam.protocol} · Pass at ${SS_reqExam(grade)} points.</p>
            <div class="ss-field">
                <label>Clarity of your inner perception (0–10)</label>
                <div class="ss-slider-row">
                    <input type="range" id="ss-scale" min="0" max="10" value="5">
                    <span class="ss-slider-val" id="ss-scale-val">5</span>
                </div>
            </div>
            <button class="ss-btn ss-btn-primary" id="ss-scale-submit"><i class="fas fa-flag-checkered"></i> Finish exam</button>
        </div>`;
        const slider = main.querySelector('#ss-scale');
        const val = main.querySelector('#ss-scale-val');
        slider.addEventListener('input', () => val.textContent = slider.value);
        main.querySelector('#ss-scale-submit').addEventListener('click', () => this._finishExam(+slider.value * 10));
    }

    _finishExam(score) {
        const senseId = this.activeSense;
        const s = SS_SENSE_MAP[senseId];
        const st = this.state.senses[senseId];
        const before = this._grade(senseId);
        const req = SS_reqExam(before);

        st.examScores.push({ date: this._today(), grade: before, score });
        if (score > (st.bestExam || 0)) st.bestExam = score;

        const passed = score >= req;
        if (passed) st.doorGrade = Math.max(st.doorGrade || 0, before); // Tür von 'before' → 'before+1' geöffnet

        const xpGain = Math.round(score); // Prüfungen geben kräftig Schärfe
        st.xp += xpGain;

        const after = this._grade(senseId);
        this._save();
        this._chime(passed);
        if (passed) { this._haptic('level'); this._celebrate(); }
        else this._haptic('err');

        const deg = Math.round(score * 3.6);
        const main = document.getElementById('ss-main');
        main.innerHTML = `
        <div class="ss-panel" style="text-align:center;--accent:${s.accent}">
            <h2>${s.icon} Prüfungsergebnis</h2>
            <div class="ss-score-circle" style="--deg:${deg}deg"><span class="val">${score}</span></div>
            <p class="sub" style="text-align:center">${passed
                ? '<strong style="color:#34d399">Tür geöffnet!</strong> +' + xpGain + ' Schärfe'
                : `Noch nicht bestanden (≥ ${req} nötig). +${xpGain} Schärfe. Übe weiter – jeder Versuch zählt und wird festgehalten.`}</p>
            ${after > before ? `<p style="color:#e0b04a;font-weight:600">Aufstieg in Grad ${after}: ${SS_titleFor(after)}!</p>` : ''}
            <div class="ss-player-controls">
                <button class="ss-btn ss-btn-ghost" id="ss-exam-retry">Nochmal</button>
                <button class="ss-btn ss-btn-primary" id="ss-exam-back">Zur Übersicht</button>
            </div>
        </div>`;
        main.querySelector('#ss-exam-retry').addEventListener('click', () => this._startExam(senseId));
        main.querySelector('#ss-exam-back').addEventListener('click', () => this.go('dashboard'));
        if (after > before) setTimeout(() => this._showLevelUp(senseId, after), 400);
    }

    /* ===================== JOURNAL ===================== */
    _renderJournal() {
        const log = this.state.log || [];
        return `
        <div class="ss-hero">
            <div class="ss-kicker">Logbuch</div>
            <h1>Your perception journal</h1>
            <p>${log.length} entries. Each note is proof that you noticed something today that others would have missed.</p>
        </div>
        <div class="ss-panel">
            <div class="ss-field">
                <label>Free entry</label>
                <select class="ss-select" id="ss-j-sense" style="margin-bottom:10px">
                    ${SS_SENSES.map(s => `<option value="${s.id}">${s.icon} ${s.name}</option>`).join('')}
                </select>
                <textarea class="ss-textarea" id="ss-j-text" placeholder="What did you notice consciously today?"></textarea>
            </div>
            <button class="ss-btn ss-btn-primary" id="ss-j-save"><i class="fas fa-plus"></i> Add entry</button>
        </div>
        <div id="ss-journal-list">
            ${log.length === 0
                ? `<div class="ss-empty"><i class="fas fa-feather"></i>Noch keine Einträge. Beginne mit einer Übung im Dojo.</div>`
                : log.map(e => this._logEntry(e)).join('')}
        </div>`;
    }

    _logEntry(e) {
        const s = SS_SENSE_MAP[e.sense] || SS_SENSES[0];
        const stars = e.rating ? ' · ' + '★'.repeat(e.rating) : '';
        return `
        <div class="ss-log-entry" style="--accent:${s.accent};--accent-soft:${s.soft}">
            <div class="ss-log-meta">
                <span class="ss-log-tag">${s.icon} ${s.name}</span>
                <span>${this._fmtDate(e.date)}</span>
                ${e.exercise ? `<span>· ${e.exercise}</span>` : ''}
                <span style="color:#e0b04a">${stars}</span>
            </div>
            <div class="ss-log-text">${this._esc(e.text)}</div>
        </div>`;
    }

    _afterJournal() {
        const btn = document.getElementById('ss-j-save');
        if (!btn) return;
        btn.addEventListener('click', () => {
            const text = document.getElementById('ss-j-text').value.trim();
            if (!text) { this._toast('Please write something.'); return; }
            const sense = document.getElementById('ss-j-sense').value;
            this.state.log.unshift({ id: Date.now(), date: this._today(), sense, text, rating: 0 });
            this._save();
            this._toast('Eintrag gespeichert', 'success');
            this.render();
        });
    }

    /* ===================== JOURNEY (Timeline) ===================== */
    _renderJourney() {
        const startYear = new Date(this.state.startedAt).getFullYear();
        const thisYear = new Date().getFullYear();
        const years = [];
        for (let y = startYear; y <= thisYear; y++) years.push(y);
        const daySet = new Set(this.state.practiceDays || []);

        const yearRows = years.map(y => {
            const cells = [];
            for (let w = 0; w < 53; w++) {
                let lit = false;
                for (let d = 0; d < 7; d++) {
                    const dd = new Date(y, 0, 1 + w * 7 + d).toISOString().slice(0, 10);
                    if (daySet.has(dd)) { lit = true; break; }
                }
                cells.push(`<div class="ss-day-cell ${lit ? 'lit' : ''}"></div>`);
            }
            return `<div class="ss-year-row"><div class="ss-year-label">${y}</div><div class="ss-year-track">${cells.join('')}</div></div>`;
        }).join('');

        const masteryRows = SS_SENSES.map(s => {
            const grade = this._grade(s.id);
            const prog = this._gradeProgress(s.id);
            return `
            <div class="ss-mastery-row">
                <div class="name">${s.icon} ${s.name}</div>
                <div class="bar"><span style="width:${prog}%"></span></div>
                <div class="rank">Grad ${grade}</div>
            </div>`;
        }).join('');

        const days = (this.state.practiceDays || []).length;
        const yearsActive = years.length;

        return `
        <div class="ss-hero">
            <div class="ss-kicker">Your journey</div>
            <h1>A life of perception</h1>
            <p>Started ${this._fmtDate(this.state.startedAt)} · ${days} practice days over ${yearsActive} ${yearsActive === 1 ? 'Jahr' : 'Jahre'}. The path is not hurried – it is steady and without end.</p>
        </div>

        <div class="ss-panel">
            <h3><i class="fas fa-mountain-sun"></i> State of mastery</h3>
            <div class="ss-mastery-bar">${masteryRows}</div>
        </div>

        <div class="ss-panel">
            <h3><i class="fas fa-calendar-days"></i> Practice chronicle</h3>
            ${yearRows}
            <div class="ss-legend"><span>Less</span>
                <span class="ss-day-cell" style="width:11px;opacity:.5"></span>
                <span class="ss-day-cell lit" style="width:11px"></span>
                <span>More</span>
            </div>
        </div>

        <div class="ss-quote">„${SS_QUOTES[4].t}"<span class="who">— ${SS_QUOTES[4].w}</span></div>`;
    }

    /* ===================== ARENA (anonyme Rangliste) ===================== */
    _renderArena() {
        const total = this._totalXP();
        const loggedIn = this._isLoggedIn();

        const head = `
        <div class="ss-hero">
            <div class="ss-kicker">Arena · anonym</div>
            <h1>Who has the finest senses?</h1>
            <p>Measure yourself anonymously against all practitioners. What is compared is your <strong>Sharpness</strong> – the sum of practice and passed exams. Nobody sees who you are; only your chosen alias.</p>
        </div>`;

        const aliasPanel = `
        <div class="ss-panel">
            <h3><i class="fas fa-user-secret"></i> Dein Pseudonym</h3>
            <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap">
                <div style="font-size:22px;font-weight:800">${this._esc(this.state.alias)}</div>
                <button class="ss-btn ss-btn-ghost" id="ss-alias-reroll" style="padding:8px 14px;font-size:13px"><i class="fas fa-dice"></i> Neu würfeln</button>
            </div>
            <div style="margin-top:14px;display:flex;gap:20px;flex-wrap:wrap">
                <div><div style="font-size:24px;font-weight:800">${total.toLocaleString('de-DE')}</div><div style="color:var(--ss-text-dim);font-size:12px">Your sharpness</div></div>
                <div><div style="font-size:24px;font-weight:800;color:#e0b04a">${this._overallTitle()}</div><div style="color:var(--ss-text-dim);font-size:12px">Your title (level ${this._overallGrade()})</div></div>
            </div>
            ${loggedIn
                ? `<button class="ss-btn ss-btn-gold ss-btn-block" id="ss-arena-submit" style="margin-top:18px"><i class="fas fa-trophy"></i> In die Arena eintragen / aktualisieren</button>`
                : `<div style="margin-top:18px;background:rgba(99,102,241,.12);border:1px solid var(--ss-line);padding:14px 16px;border-radius:12px;color:var(--ss-text-dim);font-size:14px">
                     <i class="fas fa-lock"></i> Melde dich an, um anonym anzutreten – so bleibt dein Rang geräteübergreifend erhalten.
                     <button class="ss-btn ss-btn-primary" id="ss-arena-login" style="margin-top:10px;padding:9px 16px;font-size:14px">Anmelden</button>
                   </div>`}
        </div>`;

        const board = `
        <div class="ss-panel">
            <h3><i class="fas fa-ranking-star"></i> Ranking of the finest senses</h3>
            <div id="ss-lb-list"><div class="ss-empty"><i class="fas fa-circle-notch fa-spin"></i>Lade Rangliste …</div></div>
        </div>`;

        return head + aliasPanel + board;
    }

    _afterArena() {
        const reroll = document.getElementById('ss-alias-reroll');
        if (reroll) reroll.addEventListener('click', () => {
            this.state.alias = this._generateAlias();
            this._save();
            this.render();
        });
        const login = document.getElementById('ss-arena-login');
        if (login) login.addEventListener('click', () => this._openLogin());
        const submit = document.getElementById('ss-arena-submit');
        if (submit) submit.addEventListener('click', async () => {
            submit.disabled = true;
            submit.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Wird eingetragen …';
            await this._lbSubmit();
            await this._lbRefresh();
            this._toast('In der Arena eingetragen!', 'gold');
            this.render();
        });

        // Auto-Submit, wenn eingeloggt und Schärfe vorhanden – hält den Rang aktuell
        if (this._isLoggedIn() && this._totalXP() > 0) this._lbSubmit();
        this._lbRefresh();
    }

    _lbBase() {
        const base = (window.AWS_APP_CONFIG && window.AWS_APP_CONFIG.API_BASE) || 'https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1';
        return base.replace(/\/$/, '') + '/snowflake-highscores';
    }

    async _lbSubmit() {
        const id = this._identityId();
        if (!id) return;
        try {
            await fetch(this._lbBase(), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    game: 'sinnesschule',
                    userId: id,
                    name: this.state.alias,
                    title: this._overallTitle(),
                    score: this._totalXP()
                })
            });
        } catch (e) { console.warn('Arena-Submit fehlgeschlagen:', e); }
    }

    async _lbRefresh() {
        const listEl = document.getElementById('ss-lb-list');
        if (!listEl) return;
        try {
            const res = await fetch(this._lbBase() + '?game=sinnesschule&limit=25');
            const data = await res.json();
            this.leaderboard = (data && data.highscores) || [];
        } catch (e) {
            this.leaderboard = [];
            console.warn('Arena-Load fehlgeschlagen:', e);
        }
        this._renderLeaderboardList();
    }

    _renderLeaderboardList() {
        const listEl = document.getElementById('ss-lb-list');
        if (!listEl) return;
        const board = this.leaderboard || [];
        if (board.length === 0) {
            listEl.innerHTML = `<div class="ss-empty"><i class="fas fa-trophy"></i>Noch keine Einträge. Sei die / der Erste!</div>`;
            return;
        }
        const myAlias = this.state.alias;
        const medals = ['🥇', '🥈', '🥉'];
        listEl.innerHTML = `<div class="ss-lb">${board.map((e, i) => {
            const mine = e.name === myAlias;
            const rank = i < 3 ? medals[i] : (i + 1);
            return `
            <div class="ss-lb-row ${mine ? 'me' : ''}">
                <div class="ss-lb-rank">${rank}</div>
                <div class="ss-lb-name">${this._esc(e.name)}${e.title ? `<span class="ss-lb-title">${this._esc(e.title)}</span>` : ''}</div>
                <div class="ss-lb-score">${Number(e.score).toLocaleString('de-DE')}</div>
            </div>`;
        }).join('')}</div>`;
    }

    /* ===================== Utils ===================== */
    _stopTimer() {
        if (this.timer) { clearInterval(this.timer); this.timer = null; }
        if (this._breathStop) { this._breathStop(); this._breathStop = null; }
    }

    _wait(ms, abort) {
        return new Promise(res => {
            const start = Date.now();
            const tick = () => {
                if (abort && abort()) return res();
                if (Date.now() - start >= ms) return res();
                setTimeout(tick, 100);
            };
            tick();
        });
    }

    _mmss(sec) {
        const m = Math.floor(sec / 60), s = sec % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    _fmtDate(iso) {
        try { return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' }); }
        catch { return iso; }
    }

    _esc(str) {
        const d = document.createElement('div'); d.textContent = str == null ? '' : String(str); return d.innerHTML;
    }

    _toast(msg, type) {
        const t = document.getElementById('ss-toast');
        if (!t) return;
        t.textContent = msg;
        t.className = 'ss-toast show' + (type ? ' ' + type : '');
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => t.className = 'ss-toast', 2200);
    }

    _haptic(type) {
        try {
            if (!navigator.vibrate) return;
            const p = { light: 12, ok: [0, 22], err: [0, 45, 35, 45], level: [0, 30, 40, 30, 40, 70] }[type] || 12;
            navigator.vibrate(p);
        } catch (e) { /* ignore */ }
    }

    _celebrate() {
        try {
            if (!document.getElementById('ss-celebrate-style')) {
                const st = document.createElement('style');
                st.id = 'ss-celebrate-style';
                st.textContent = '@keyframes ssConfFall{0%{transform:translateY(0) rotate(0);opacity:1}100%{transform:translateY(110vh) rotate(var(--rot));opacity:.15}}.ss-conf{position:fixed;top:-16px;width:10px;height:14px;border-radius:2px;z-index:99999;pointer-events:none;will-change:transform;animation:ssConfFall var(--dur) cubic-bezier(.25,.6,.45,1) forwards}';
                document.head.appendChild(st);
            }
            const colors = ['#818cf8', '#22d3ee', '#34d399', '#fb923c', '#e0b04a', '#f472b6', '#a78bfa'];
            for (let i = 0; i < 44; i++) {
                const c = document.createElement('div');
                c.className = 'ss-conf';
                c.style.left = (Math.random() * 100) + 'vw';
                c.style.top = (-16 - Math.random() * 60) + 'px';
                c.style.background = colors[i % colors.length];
                c.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
                c.style.setProperty('--dur', (1.3 + Math.random() * 1.4) + 's');
                if (Math.random() < 0.4) c.style.borderRadius = '50%';
                document.body.appendChild(c);
                setTimeout(() => c.remove(), 2900);
            }
        } catch (e) { /* ignore */ }
    }

    _chime(big) {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const notes = big ? [523.25, 659.25, 783.99, 1046.5] : [659.25, 880];
            notes.forEach((f, i) => {
                const o = ctx.createOscillator(), g = ctx.createGain();
                o.connect(g); g.connect(ctx.destination);
                o.type = 'sine'; o.frequency.value = f;
                const t0 = ctx.currentTime + i * 0.12;
                g.gain.setValueAtTime(0.0001, t0);
                g.gain.exponentialRampToValueAtTime(0.25, t0 + 0.03);
                g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.5);
                o.start(t0); o.stop(t0 + 0.5);
            });
        } catch (e) { /* ignore */ }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.sinnesschule = new Sinnesschule();
    window.sinnesschule.init();
});
