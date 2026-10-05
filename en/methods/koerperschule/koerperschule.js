/* =========================================================
   The School of the Body
   Geist und Körper verbunden: vier Disziplinen (Bewegung,
   Ernährung, Yoga, Meditation/Atem) als kleine, tägliche
   Schritte. Architektur identisch zu den Schulen des
   Gedächtnisses und der Sinne (gleiches XP-/Grad-/Streak-
   System, gleiche Persistenz, gleiche ss-* CSS-Basis).
   ========================================================= */

const KS_METHOD = 'koerperschule';

/* ---------------- Graduierungs-System (→ ∞) ---------------- */
const KS_TITLES = [
    'Erwachen', 'Mobile', 'Rooted', 'Energized', 'In flow', 'Powerful',
    'Centered', 'Enduring', 'Supple', 'Vital', 'Balanced', 'Steadfast',
    'Connected', 'Harmony', 'Mastery', 'Vollendung'
];
function KS_gap(g) { return Math.round(110 * Math.pow(g, 1.42)); }
const _ksTcache = [0, 0];
function KS_T(g) {
    if (g < 1) return 0;
    for (let k = _ksTcache.length; k <= g; k++) _ksTcache[k] = _ksTcache[k - 1] + KS_gap(k - 1);
    return _ksTcache[g];
}
function KS_gradeFromXP(xp) {
    let g = 1;
    while (g < 2000 && xp >= KS_T(g + 1)) g++;
    return g;
}
function KS_titleFor(g) {
    if (g <= KS_TITLES.length) return KS_TITLES[g - 1];
    const cycle = Math.floor((g - 1) / KS_TITLES.length);
    const base = KS_TITLES[(g - 1) % KS_TITLES.length];
    const roman = ['', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][cycle] || ('×' + (cycle + 1));
    return `${base} ${roman}`.trim();
}
function KS_emblem(g) {
    if (g >= 40) return '🏆';
    if (g >= 28) return '🥇';
    if (g >= 18) return '🦅';
    if (g >= 12) return '💪';
    if (g >= 7) return '🧘';
    if (g >= 4) return '🤸';
    return '🌱';
}

/* ---------------- Dojo-Themes ---------------- */
const KS_THEMES = [
    { id: 'forest', name: 'Forest', a: '#34d399', a2: '#22d3ee' },
    { id: 'sunrise', name: 'Sunrise', a: '#fb923c', a2: '#f472b6' },
    { id: 'ocean', name: 'Ozean', a: '#22d3ee', a2: '#818cf8' },
    { id: 'lavender', name: 'Lavender', a: '#a78bfa', a2: '#f472b6' }
];

const KS_ALIAS_ADJ = ['Calm', 'Strong', 'Moving', 'Breathing', 'Awake', 'Supple', 'Vital', 'Centered'];
const KS_ALIAS_NOUN = ['Mountain goat', 'Crane', 'Oak', 'Wave', 'Flame', 'Breeze', 'Wurzel', 'Feder'];

/* ---------------- Die vier Disziplinen ---------------- */
const KS_DISCIPLINES = [
    { id: 'bewegung', name: 'Movement & strength', short: 'Movement', icon: '💪', accent: '#fb923c', soft: 'rgba(251,146,60,.16)', glow: 'rgba(251,146,60,.18)',
      tags: ['Micro-workout', 'Strength', 'Mobility'],
      blurb: 'Small daily movement and strength impulses. Consistency builds the body – not one big day.' },
    { id: 'ernaehrung', name: 'Nutrition', short: 'Nutrition', icon: '🥗', accent: '#34d399', soft: 'rgba(52,211,153,.16)', glow: 'rgba(52,211,153,.18)',
      tags: ['Daily check', 'Mindful eating', 'Hydration'],
      blurb: 'Healthy eating as the sum of small decisions – one check, one mindful meal at a time.' },
    { id: 'yoga', name: 'Yoga & mobility', short: 'Yoga', icon: '🧘', accent: '#a78bfa', soft: 'rgba(167,139,250,.16)', glow: 'rgba(167,139,250,.18)',
      tags: ['Sun salutation', 'Stretch', 'Balance'],
      blurb: 'Guided flows and stretches for mobility, posture and a calm, present body.' },
    { id: 'meditation', name: 'Meditation & breath', short: 'Meditation', icon: '🌬️', accent: '#22d3ee', soft: 'rgba(34,211,238,.16)', glow: 'rgba(34,211,238,.18)',
      tags: ['Box breathing', '4-7-8', 'Body-Scan'],
      blurb: 'Breath and mindfulness exercises lower stress and connect body and mind – the bridge to your other schools.' }
];
const KS_DISC_MAP = Object.fromEntries(KS_DISCIPLINES.map(d => [d.id, d]));

/* ---------------- Trainer / geführte Sessions ----------------
   type: 'guided' (getaktete Schritte mit Ring-Timer),
         'breath' (Atem-Orb), 'habit' (Mini-Checkliste). */
const KS_TRAINERS = {
    /* — Movement & strength — */
    mobility: { disc: 'bewegung', icon: '🤸', title: 'Joint mobility', xp: 16, type: 'guided',
        blurb: 'Gently waking every joint – perfect for starting the day.',
        steps: [
            { text: 'Stand easy, feet hip-width. Take 3 deep breaths.', sec: 15 },
            { text: 'Neck: slowly roll your head from shoulder to shoulder.', sec: 25 },
            { text: 'Circle your shoulders big, backwards.', sec: 25 },
            { text: 'Circle your arms wide – forward, then backward.', sec: 25 },
            { text: 'Circle your hips as if stirring a big pot.', sec: 25 },
            { text: 'Knees together, circle them gently.', sec: 20 },
            { text: 'Rock on your toes, loosen your ankles.', sec: 20 },
            { text: 'Shake out arms and legs. Done!', sec: 15 }
        ] },
    micro_move: { disc: 'bewegung', icon: '⚡', title: '5-minute energy', xp: 22, type: 'guided',
        blurb: 'A short energy boost that lifts circulation and mood right away.',
        steps: [
            { text: 'March in place, swing your arms.', sec: 30 },
            { text: 'Jumping jacks at an easy pace.', sec: 30 },
            { text: 'Pause: breathe deeply.', sec: 15 },
            { text: 'Squats – slow and controlled.', sec: 35 },
            { text: 'Arm circles forward and backward.', sec: 25 },
            { text: 'Knees alternating to the opposite hand.', sec: 30 },
            { text: 'Jog it out loosely in place.', sec: 20 },
            { text: 'Breathe in deep, raise your arms – breathe out, lower them.', sec: 20 }
        ] },
    kraft_basis: { disc: 'bewegung', icon: '🏋️', title: 'Strength basics', xp: 28, type: 'guided',
        blurb: 'Four foundational bodyweight moves – you can scale them.',
        steps: [
            { text: 'Warm-up: march in place for 20 seconds.', sec: 20 },
            { text: 'Squats: as many as you can do cleanly.', sec: 40 },
            { text: 'Short pause, shake out your legs.', sec: 15 },
            { text: 'Push-ups (wall or knees are fine too).', sec: 40 },
            { text: 'Pause, breathe easy.', sec: 15 },
            { text: 'Hold a plank – belly tight, back straight.', sec: 35 },
            { text: 'Lunges, alternating left/right.', sec: 40 },
            { text: 'You did it! Stretch your thighs briefly.', sec: 20 }
        ] },

    /* — Ernährung — */
    tages_check: { disc: 'ernaehrung', icon: '✅', title: 'Daily check', xp: 20, type: 'habit',
        blurb: 'Check off what you already managed today – small wins count.',
        habits: [
            '1.5–2 liters of water drunk',
            'Veg or fruit with at least two meals',
            'Ate a good protein source',
            'No sugary drink',
            'At least one meal slow & without a screen'
        ] },
    achtsam_essen: { disc: 'ernaehrung', icon: '🍵', title: 'Mindful eating', xp: 16, type: 'guided',
        blurb: 'Enjoy a small portion with full attention – feel fullness anew.',
        steps: [
            { text: 'Have a bite ready (e.g. fruit, a nut).', sec: 15 },
            { text: 'Look at it: color, shape, surface.', sec: 20 },
            { text: 'Smell it mindfully. What do you notice?', sec: 20 },
            { text: 'Take the first bite – chew very slowly.', sec: 30 },
            { text: 'Feel taste and texture, without hurry.', sec: 30 },
            { text: 'Swallow mindfully, take one calm breath.', sec: 20 },
            { text: 'Ask yourself: how full/satisfied do I feel?', sec: 15 }
        ] },
    wasser_ritual: { disc: 'ernaehrung', icon: '💧', title: 'Water ritual', xp: 8, type: 'guided',
        blurb: 'Drink a glass of water mindfully – a micro-habit with a big effect.',
        steps: [
            { text: 'Get yourself a large glass of water.', sec: 15 },
            { text: 'Drink half of it in calm sips.', sec: 20 },
            { text: 'Breathe, then finish the rest mindfully.', sec: 20 }
        ] },

    /* — Yoga & mobility — */
    sonnengruss: { disc: 'yoga', icon: '🌅', title: 'Sun salutation', xp: 26, type: 'guided',
        blurb: 'The classic flow – moving from pose to pose with the breath.',
        steps: [
            { text: 'Mountain pose: stand tall, hands at your heart.', sec: 20 },
            { text: 'Inhale: stretch your arms high.', sec: 15 },
            { text: 'Exhale: fold forward, hands toward the floor.', sec: 20 },
            { text: 'Halfway lift: long back, gaze forward.', sec: 15 },
            { text: 'Step back into a lunge, open the chest.', sec: 20 },
            { text: 'Plank: hold the body in one line.', sec: 20 },
            { text: 'Cobra: lift the chest gently, shoulders away from the ears.', sec: 20 },
            { text: 'Downward dog: hips high, heels sinking.', sec: 25 },
            { text: 'Step forward, roll up gently to stand.', sec: 20 },
            { text: 'Mountain pose, hands at your heart. Feel.', sec: 15 }
        ] },
    entspannung: { disc: 'yoga', icon: '🌙', title: 'Evening stretch', xp: 18, type: 'guided',
        blurb: 'Gentle stretches to wind down – ideal before sleep.',
        steps: [
            { text: 'Tabletop: cat-cow, vertebra by vertebra.', sec: 35 },
            { text: 'Child\'s pose: forehead to the floor, arms long.', sec: 30 },
            { text: 'Seated forward fold, knees may stay soft.', sec: 30 },
            { text: 'Gentle seated twist to the right.', sec: 25 },
            { text: 'Gentle seated twist to the left.', sec: 25 },
            { text: 'On your back: hug your knees, rock gently.', sec: 25 },
            { text: 'Stretch out, close your eyes, breathe calmly.', sec: 20 }
        ] },
    balance: { disc: 'yoga', icon: '🌳', title: 'Balance & stance', xp: 18, type: 'guided',
        blurb: 'Balance poses for stability, focus and strong feet.',
        steps: [
            { text: 'Steady stance, eyes on a fixed point.', sec: 15 },
            { text: 'Tree left: right foot at calf/thigh.', sec: 30 },
            { text: 'Release, shake it out briefly.', sec: 10 },
            { text: 'Tree right: left foot at calf/thigh.', sec: 30 },
            { text: 'Chair: bend the knees, arms forward/up.', sec: 25 },
            { text: 'On your toes, hold your balance.', sec: 20 },
            { text: 'Release, stand calmly and feel.', sec: 15 }
        ] },

    /* — Meditation & breath — */
    box_breath: { disc: 'meditation', icon: '🟦', title: 'Box breathing', xp: 18, type: 'breath',
        blurb: 'Breathe evenly 4-4-4-4 – calms the nervous system in minutes.',
        breath: { repeats: 6, phases: [
            { label: 'Inhale', action: 'inhale', sec: 4 },
            { label: 'Hold', action: 'hold', sec: 4 },
            { label: 'Exhale', action: 'exhale', sec: 4 },
            { label: 'Hold', action: 'hold', sec: 4 }
        ] } },
    breath_478: { disc: 'meditation', icon: '🌬️', title: '4-7-8 breath', xp: 16, type: 'breath',
        blurb: 'Inhale 4, hold 7, exhale 8 – the classic for falling asleep.',
        breath: { repeats: 4, phases: [
            { label: 'Inhale', action: 'inhale', sec: 4 },
            { label: 'Hold', action: 'hold', sec: 7 },
            { label: 'Exhale', action: 'exhale', sec: 8 }
        ] } },
    body_scan: { disc: 'meditation', icon: '🧠', title: 'Body-Scan', xp: 24, type: 'guided',
        blurb: 'Travel through the body with your attention – deep relaxation.',
        steps: [
            { text: 'Sit or lie down comfortably, eyes gently closed.', sec: 20 },
            { text: 'Feel your feet. Let every bit of tension go.', sec: 30 },
            { text: 'Travel to lower legs and knees.', sec: 30 },
            { text: 'Thighs and hips – growing heavy.', sec: 30 },
            { text: 'Belly and back – breath flowing calmly.', sec: 30 },
            { text: 'Chest, shoulders, arms all the way into the hands.', sec: 30 },
            { text: 'Neck, face, jaw – everything soft.', sec: 30 },
            { text: 'Feel the whole body as one.', sec: 25 },
            { text: 'Take a deep breath, move gently, open your eyes.', sec: 15 }
        ] },
    fokus_atem: { disc: 'meditation', icon: '🎯', title: 'Breath focus', xp: 20, type: 'guided',
        blurb: 'Silent meditation: just you and your breath. Thoughts drift by.',
        steps: [
            { text: 'Sit upright and relaxed, eyes gently closed.', sec: 20 },
            { text: 'Watch the breath without changing it.', sec: 45 },
            { text: 'Count silently: one (in), two (out) … up to ten.', sec: 60 },
            { text: 'Wandered off? Kindly come back to the breath.', sec: 60 },
            { text: 'Let the counting go, rest in the breath.', sec: 45 },
            { text: 'Widen again, slowly open your eyes.', sec: 20 }
        ] }
};

/* ---------------- Equipment-Trainer (Coach nutzt verfügbares Material) ---------------- */
Object.assign(KS_TRAINERS, {
    db_kraft: { disc: 'bewegung', icon: '🏋️', title: 'Dumbbell strength', xp: 30, type: 'guided',
        blurb: 'Full-body strength circuit with dumbbells – functional and scalable.',
        steps: [
            { text: 'Warm-up: light dumbbells, circle the arms.', sec: 25 },
            { text: 'Goblet squats: dumbbell at the chest, sit deep.', sec: 40 },
            { text: 'Short pause, breathe easy.', sec: 15 },
            { text: 'Shoulder press: press the dumbbells overhead.', sec: 40 },
            { text: 'Bent-over row: back straight, pull the dumbbells.', sec: 40 },
            { text: 'Pause, shake out your arms.', sec: 15 },
            { text: 'Lunges with dumbbells, alternating.', sec: 40 },
            { text: 'Bicep curls, slow and controlled.', sec: 35 },
            { text: 'You did it! Stretch shoulders and arms.', sec: 20 }
        ] },
    kb_flow: { disc: 'bewegung', icon: '⚙️', title: 'Kettlebell flow', xp: 32, type: 'guided',
        blurb: 'A swinging kettlebell flow for strength and conditioning at once.',
        steps: [
            { text: 'Warm-up: circle the hips, loosen the shoulders.', sec: 25 },
            { text: 'Kettlebell swings: drive from the hips.', sec: 40 },
            { text: 'Pause, breathe deeply.', sec: 15 },
            { text: 'Goblet squats with the kettlebell.', sec: 40 },
            { text: 'One-arm row left.', sec: 30 },
            { text: 'One-arm row right.', sec: 30 },
            { text: 'Russian twists seated.', sec: 35 },
            { text: 'Cool down, shake out the arms.', sec: 20 }
        ] },
    band_kraft: { disc: 'bewegung', icon: '🎗️', title: 'Band workout', xp: 24, type: 'guided',
        blurb: 'Joint-friendly strength with a resistance band – doable anywhere.',
        steps: [
            { text: 'Test the band, loosen the shoulders.', sec: 20 },
            { text: 'Band squats: stand on the band, pull & sit.', sec: 40 },
            { text: 'Rows: band around the feet, pull to the chest.', sec: 40 },
            { text: 'Shoulder press against the band.', sec: 35 },
            { text: 'Lateral raises with the band.', sec: 30 },
            { text: 'Glute bridge with the band above the knees.', sec: 35 },
            { text: 'Stretch briefly after. Done!', sec: 20 }
        ] },
    pullup_basis: { disc: 'bewegung', icon: '🆙', title: 'Pull strength (bar)', xp: 28, type: 'guided',
        blurb: 'Pull patterns on the pull-up bar – back and grip.',
        steps: [
            { text: 'Activate the shoulders: hang from the bar.', sec: 25 },
            { text: 'Negative pull-ups: lower yourself slowly.', sec: 40 },
            { text: 'Pause, loosen your hands.', sec: 20 },
            { text: 'Pull-ups or Australian pull-ups.', sec: 40 },
            { text: 'Hold a dead hang – grip strength.', sec: 30 },
            { text: 'Stretch forearms and lats. Strong!', sec: 20 }
        ] },
    rope_cardio: { disc: 'bewegung', icon: '🪢', title: 'Rope intervals', xp: 26, type: 'guided',
        blurb: 'Jump-rope intervals – efficient cardio in between.',
        steps: [
            { text: 'Ease in, find your tempo.', sec: 30 },
            { text: 'Interval 1: jump at a brisk pace.', sec: 40 },
            { text: 'Active rest: walk in place.', sec: 25 },
            { text: 'Interval 2: jump at a brisk pace.', sec: 40 },
            { text: 'Active rest.', sec: 25 },
            { text: 'Interval 3: your tempo.', sec: 40 },
            { text: 'Cool down, breathe deeply.', sec: 20 }
        ] }
});

/* ---------------- Equipment, Ziele, Level ---------------- */
const KS_EQUIPMENT = [
    { id: 'none', icon: '🤸', name: 'Bodyweight', hint: 'Always with you' },
    { id: 'mat', icon: '🧘', name: 'Mat' },
    { id: 'dumbbells', icon: '🏋️', name: 'Dumbbells' },
    { id: 'kettlebell', icon: '⚙️', name: 'Kettlebell' },
    { id: 'band', icon: '🎗️', name: 'Resistance band' },
    { id: 'pullup', icon: '🆙', name: 'Pull-up bar' },
    { id: 'rope', icon: '🪢', name: 'Jump rope' }
];
const KS_GOALS = [
    { id: 'kraft', icon: '💪', name: 'Build strength' },
    { id: 'abnehmen', icon: '🔥', name: 'Fit & lean' },
    { id: 'beweglichkeit', icon: '🤸', name: 'Mobility' },
    { id: 'entspannung', icon: '🌙', name: 'Stress & sleep' },
    { id: 'allgemein', icon: '✨', name: 'General fitness' }
];
const KS_LEVELS = [
    { id: 'einsteiger', name: 'Beginner', factor: 0.8 },
    { id: 'fortgeschritten', name: 'Intermediate', factor: 1.0 },
    { id: 'profi', name: 'Pro', factor: 1.25 }
];

/* Trainer-Metadaten: Equipment, Ziele, Tageszeit, Intensität (1–3). */
const KS_TRAINER_META = {
    mobility:       { equip: ['none'], goals: ['beweglichkeit', 'allgemein'], time: 'morning', intensity: 1 },
    micro_move:     { equip: ['none'], goals: ['abnehmen', 'allgemein'], time: 'any', intensity: 2 },
    kraft_basis:    { equip: ['none'], goals: ['kraft', 'allgemein'], time: 'any', intensity: 3 },
    tages_check:    { equip: ['none'], goals: ['abnehmen', 'allgemein'], time: 'any', intensity: 1 },
    achtsam_essen:  { equip: ['none'], goals: ['entspannung', 'allgemein'], time: 'any', intensity: 1 },
    wasser_ritual:  { equip: ['none'], goals: ['allgemein'], time: 'any', intensity: 1 },
    sonnengruss:    { equip: ['mat', 'none'], goals: ['beweglichkeit', 'allgemein'], time: 'morning', intensity: 2 },
    entspannung:    { equip: ['mat', 'none'], goals: ['beweglichkeit', 'entspannung'], time: 'evening', intensity: 1 },
    balance:        { equip: ['none'], goals: ['beweglichkeit', 'allgemein'], time: 'any', intensity: 2 },
    box_breath:     { equip: ['none'], goals: ['entspannung'], time: 'any', intensity: 1 },
    breath_478:     { equip: ['none'], goals: ['entspannung'], time: 'evening', intensity: 1 },
    body_scan:      { equip: ['mat', 'none'], goals: ['entspannung'], time: 'evening', intensity: 2 },
    fokus_atem:     { equip: ['none'], goals: ['entspannung', 'allgemein'], time: 'any', intensity: 1 },
    db_kraft:       { equip: ['dumbbells'], goals: ['kraft', 'allgemein'], time: 'any', intensity: 3 },
    kb_flow:        { equip: ['kettlebell'], goals: ['kraft', 'abnehmen'], time: 'any', intensity: 3 },
    band_kraft:     { equip: ['band'], goals: ['kraft', 'beweglichkeit'], time: 'any', intensity: 2 },
    pullup_basis:   { equip: ['pullup'], goals: ['kraft'], time: 'any', intensity: 3 },
    rope_cardio:    { equip: ['rope'], goals: ['abnehmen'], time: 'any', intensity: 3 }
};
Object.keys(KS_TRAINERS).forEach(id => {
    const m = KS_TRAINER_META[id] || {};
    Object.assign(KS_TRAINERS[id], {
        equip: m.equip || ['none'],
        goals: m.goals || ['allgemein'],
        time: m.time || 'any',
        intensity: m.intensity || 2
    });
});

/* ---------------- Veränderungs-Reise (Verhaltensänderung lernen) ----------------
   Acht Phasen, die zusammen den vollständigen Kreislauf gelingender
   Veränderung lehren – nach den Prinzipien von Tiny Habits (BJ Fogg),
   Atomic Habits (James Clear), Wenn-Dann-Vorsätzen und identitätsbasierten
   Gewohnheiten. Statt eines starren Plans lernt man, sich zu ändern und es
   in den Alltag zu integrieren. */
const KS_JOURNEY = [
    { id: 'tiny', icon: '🌱', title: 'Tiny start', req: 'action',
      principle: 'Make it so small you can\'t say no.',
      lesson: 'Motivation swings – habits don\'t. The biggest mistake is starting too big. Shrink the action you want until it works in under 60 seconds even on a bad day: <strong>one</strong> squat, <strong>one</strong> glass of water, <strong>two</strong> minutes of stretching. Size comes later on its own – what counts first is that you do it <em>every</em> day.',
      task: 'In the workshop, set a habit with one tiny action.',
      examples: ['1 squat after getting up', '1 glass of water before coffee', '2 minutes of stretching before the shower'] },
    { id: 'anchor', icon: '⚓', title: 'Anchor the trigger', req: 'cue',
      principle: 'Hang the new action on a fixed routine.',
      lesson: 'New habits need a reliable trigger. Instead of “sometime during the day” use an <strong>If-then intention</strong>: „<em>Nachdem</em> I [have finished an existing routine], <em>will</em> I [do the tiny action].” Existing routines like brushing your teeth, coffee or lunch break are your anchor – they happen reliably anyway.',
      task: 'Add a concrete trigger (anchor) to your habit.',
      examples: ['After brushing your teeth → 5 squats', 'After the first coffee → 1 glass of water', 'After lunch → 3 min walk'] },
    { id: 'celebrate', icon: '🎉', title: 'Celebrate immediately', req: 'reward',
      principle: 'A small celebration anchors the habit in the brain.',
      lesson: 'What feels good gets repeated. Right after the action, give yourself a <strong>mini-celebration</strong>: a “Yes!”, a fist pump, a smile in the mirror. This instant positive emotion – not the result weeks later – tells your brain: “We’ll do this again.”',
      task: 'Set an instant reward or celebration for your habit.',
      examples: ['Pump your fist and think “Strong!”', 'Breathe deeply and smile', 'Tick the box on purpose'] },
    { id: 'environment', icon: '🏠', title: 'Shape the environment', req: 'env',
      principle: 'Make the good easy and the bad hard.',
      lesson: 'Willpower loses to the environment in the long run. Shape your space so the good action is the <strong>path of least resistance</strong> : lay workout clothes out in sight, water bottle on the desk, fruit within view – and sweets out of reach.',
      task: 'Describe one change to your environment that makes the action easier.',
      examples: ['Put running shoes by the door', 'Water bottle on the desk', 'Move sweets to the basement'] },
    { id: 'stack', icon: '🧱', title: 'Stack habits', req: 'stack',
      principle: 'Grow by chaining the new to what already works.',
      lesson: 'Once a tiny habit sticks, build on it. <strong>Habit-Stacking</strong> chains actions into a routine: “After [habit 1] I do [habit 2].” Over time one squat becomes a short morning workout – without it feeling like a struggle.',
      task: 'Add a second habit or a stack step.',
      examples: ['After 5 squats → 5 push-ups', 'After the water → 1 piece of fruit', 'After stretching → 3 deep breaths'] },
    { id: 'identity', icon: '🪞', title: 'Identität', req: 'identity',
      principle: 'Become the person who lives this habit.',
      lesson: 'The strongest habits belong to your <strong>Identität</strong>. Shift the focus from the goal to the person: not “I want to lose weight”, but “I am someone who moves every day.” Every small action is a vote for this new identity. Phrase it as “I am someone who …”.',
      task: 'Write an identity statement for your habit.',
      examples: ['“I am someone who takes care of their body.”', '“I am a person who moves.”', '“I am someone who eats mindfully.”'] },
    { id: 'relapse', icon: '🛟', title: 'Handle slip-ups', req: 'reflect',
      principle: 'Never miss twice in a row.',
      lesson: 'Slip-ups are part of it – they are not failure, they are part of the path. The masters’ rule: “<strong>Never miss twice</strong>.” One missed day is an accident, two are the start of a new bad habit. Plan your restart <em>in advance</em> and meet yourself with kindness instead of hardness.',
      task: 'Write down your restart plan in the reflection.',
      examples: ['“If I miss a day, I do the mini version tomorrow.”', '“I start again right away – no drama.”'] },
    { id: 'mastery', icon: '🏔️', title: 'Integration & mastery', req: 'none',
      principle: 'The habit is now part of your life.',
      lesson: 'You have walked the full cycle of change once: start small, anchor, celebrate, shape the environment, stack, identity, handle slip-ups. Now change becomes a routine of your life. Keep tending your habits, scale gently – and start the circle again for the next habit.',
      task: 'Keep living your habits and start a new journey when you need one.',
      examples: ['Add a new tiny habit', 'Gently grow an existing one', 'Inspire others in everyday life'] }
];

/* ---------------- Verbundene Pläne & Schwester-Schulen ---------------- */
const KS_LINKS = [
    { icon: '🏋️', title: 'Training plan generator', desc: 'Create your personal weekly training plan.', href: '../../personal-training.html', disc: 'bewegung' },
    { icon: '🥗', title: 'Nutrition plan', desc: 'Have a personal nutrition and meal plan created for you.', href: '../../ernaehrungsberatung.html', disc: 'ernaehrung' },
    { icon: '🧠', title: 'Memory school', desc: 'Train your mind – part of your daily ritual.', href: '../gedaechtnisschule/index-gedaechtnisschule.html', disc: 'meditation' },
    { icon: '✋', title: 'Schule der Sinne', desc: 'Sharpen your perception – body and mind connected.', href: '../sinnesschule/index-sinnesschule.html', disc: 'yoga' }
];

class KoerperSchule {
    constructor() {
        this.view = 'dashboard';
        this.activeDisc = 'bewegung';
        this.timer = null;
        this.currentTrainer = null;
        this.journeyTab = 'reise';
        this.editingHabitId = null;
        this.state = this._defaultState();
    }

    _defaultState() {
        const disc = {};
        KS_DISCIPLINES.forEach(d => { disc[d.id] = { xp: 0, sessions: 0, best: {} }; });
        return {
            startedAt: new Date().toISOString().slice(0, 10),
            alias: null,
            disc,
            streak: 0,
            lastPracticeDate: null,
            totalSessions: 0,
            totalMinutes: 0,
            log: [],
            practiceDays: [],
            habitsToday: { date: null, checks: {} },
            journey: { phase: 0, ack: {}, habits: [], reflections: [] },
            profile: {
                onboarded: false,
                goal: 'allgemein',
                level: 'einsteiger',
                equipment: ['none'],
                daysPerWeek: 3,
                sessionLength: 10,
                reminderTime: '',
                voice: true
            },
            coach: { week: null, days: {}, adjust: {}, feedback: [] },
            theme: 'forest'
        };
    }

    _applyTheme() {
        const t = KS_THEMES.find(x => x.id === this.state.theme) || KS_THEMES[0];
        const r = document.documentElement.style;
        r.setProperty('--ss-accent', t.a);
        r.setProperty('--ss-accent-2', t.a2);
    }
    _rankEmblem() { return KS_emblem(this._overallGrade()); }

    _handleDeepLink() {
        try {
            const sp = new URLSearchParams(window.location.search);
            const start = sp.get('start');
            if (!start) return;
            if (KS_TRAINERS[start]) { this.activeDisc = KS_TRAINERS[start].disc; this.go('practice'); this._startTrainer(start); }
            else if (['plan', 'journal', 'practice', 'coach', 'dashboard'].includes(start)) { this.go(start); }
        } catch (e) { /* ignore */ }
    }

    async init() {
        await this._load();
        if (!this.state.alias) this.state.alias = this._generateAlias();
        if (!this.state.theme) this.state.theme = 'forest';
        if (!this.state.habitsToday) this.state.habitsToday = { date: null, checks: {} };
        this._profile();
        this._coach();
        this._journey();
        this._applyTheme();
        this._bindNav();
        this.render();
        this._handleDeepLink();
        this._scheduleReminder();
    }

    _profile() {
        const def = { onboarded: false, goal: 'allgemein', level: 'einsteiger', equipment: ['none'], daysPerWeek: 3, sessionLength: 10, reminderTime: '', voice: true };
        if (!this.state.profile || typeof this.state.profile !== 'object') this.state.profile = def;
        else this.state.profile = Object.assign({}, def, this.state.profile);
        if (!Array.isArray(this.state.profile.equipment) || !this.state.profile.equipment.length) this.state.profile.equipment = ['none'];
        if (!this.state.profile.equipment.includes('none')) this.state.profile.equipment.unshift('none');
        return this.state.profile;
    }
    _coach() {
        if (!this.state.coach || typeof this.state.coach !== 'object') this.state.coach = { week: null, days: {}, adjust: {}, feedback: [] };
        const c = this.state.coach;
        if (!c.days || typeof c.days !== 'object') c.days = {};
        if (!c.adjust || typeof c.adjust !== 'object') c.adjust = {};
        if (!Array.isArray(c.feedback)) c.feedback = [];
        return c;
    }

    /* ---------------- Persistenz ---------------- */
    _merge(base, incoming) {
        const out = JSON.parse(JSON.stringify(base));
        if (!incoming) return out;
        Object.keys(incoming).forEach(k => {
            if (k === 'disc' && incoming.disc) {
                KS_DISCIPLINES.forEach(d => { out.disc[d.id] = Object.assign({}, out.disc[d.id], incoming.disc[d.id] || {}); });
            } else {
                out[k] = incoming[k];
            }
        });
        return out;
    }
    async _load() {
        try {
            const local = JSON.parse(localStorage.getItem('ks_state'));
            if (local && local.startedAt) this.state = this._merge(this._defaultState(), local);
        } catch (e) { /* ignore */ }
        try {
            if (window.workflowAPI) {
                const res = await window.workflowAPI.getWorkflowResults(KS_METHOD);
                const remote = res && (res.results || res.state || (res.startedAt ? res : null));
                if (remote && remote.startedAt) {
                    this.state = this._merge(this._defaultState(), remote);
                    localStorage.setItem('ks_state', JSON.stringify(this.state));
                }
            }
        } catch (e) { console.warn('Cloud-Load fehlgeschlagen:', e); }
    }
    async _save() {
        localStorage.setItem('ks_state', JSON.stringify(this.state));
        let synced = false;
        try {
            if (window.workflowAPI) {
                const loggedIn = this._isLoggedIn();
                await window.workflowAPI.saveWorkflowResults(KS_METHOD, this.state);
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

    /* ---------------- Identität ---------------- */
    _isLoggedIn() {
        try { return !!(window.realUserAuth && window.realUserAuth.isLoggedIn && window.realUserAuth.isLoggedIn()); }
        catch (e) { return false; }
    }
    _generateAlias() {
        const a = KS_ALIAS_ADJ[Math.floor(Math.random() * KS_ALIAS_ADJ.length)];
        const n = KS_ALIAS_NOUN[Math.floor(Math.random() * KS_ALIAS_NOUN.length)];
        const num = Math.floor(100 + Math.random() * 900);
        return `${a} ${n} #${num}`;
    }

    /* ---------------- Praxis-Tage / Streak ---------------- */
    _registerPracticeDay(minutes) {
        const today = this._today();
        const yest = this._dayOffset(-1);
        if (this.state.lastPracticeDate !== today) {
            if (this.state.lastPracticeDate === yest || !this.state.lastPracticeDate) this.state.streak = (this.state.streak || 0) + 1;
            else this.state.streak = 1;
            this.state.lastPracticeDate = today;
        }
        if (!this.state.practiceDays.includes(today)) this.state.practiceDays.push(today);
        this.state.totalSessions++;
        this.state.totalMinutes += minutes;
    }
    _today() { return new Date().toISOString().slice(0, 10); }
    _dayOffset(d) { return new Date(Date.now() + d * 86400000).toISOString().slice(0, 10); }

    /* ---------------- Graduierung ---------------- */
    _grade(id) { return KS_gradeFromXP(this.state.disc[id].xp); }
    _gradeProgress(id) {
        const g = this._grade(id);
        const base = KS_T(g), next = KS_T(g + 1);
        const xp = this.state.disc[id].xp;
        return Math.max(0, Math.min(100, Math.round(((xp - base) / (next - base)) * 100)));
    }
    _totalXP() { return KS_DISCIPLINES.reduce((a, d) => a + (this.state.disc[d.id].xp || 0), 0); }
    _overallGrade() { return KS_gradeFromXP(Math.round(this._totalXP() / KS_DISCIPLINES.length)); }
    _overallTitle() { return KS_titleFor(this._overallGrade()); }

    /* ---------------- Navigation / Router ---------------- */
    _bindNav() {
        document.querySelectorAll('.ss-nav-btn').forEach(btn => btn.addEventListener('click', () => this.go(btn.dataset.view)));
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
            if (this.timer) return;
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
        this.view = view;
        this._stopTimer();
        this._coachActive = false; this._coachQueue = null;
        document.querySelectorAll('.ss-nav-btn').forEach(b => b.classList.toggle('active', b.dataset.view === view));
        this.render();
    }
    render() {
        const main = document.getElementById('ss-main');
        if (!main) return;
        if (!this.state.profile.onboarded) { main.innerHTML = this._renderOnboarding(); this._afterOnboarding(); return; }
        switch (this.view) {
            case 'dashboard': main.innerHTML = this._renderDashboard(); this._afterDashboard(); break;
            case 'coach':     main.innerHTML = this._renderCoach(); this._afterCoach(); break;
            case 'practice':  main.innerHTML = this._renderPractice(); this._afterPractice(); break;
            case 'plan':      main.innerHTML = this._renderPlan(); this._afterPlan(); break;
            case 'journal':   main.innerHTML = this._renderJournal(); this._afterJournal(); break;
            default:          main.innerHTML = this._renderDashboard(); this._afterDashboard();
        }
        window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    }

    /* ---------------- Tagesempfehlung ---------------- */
    _todaysTrainer() {
        const ids = Object.keys(KS_TRAINERS);
        const doy = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
        return ids[doy % ids.length];
    }

    /* ===================== DASHBOARD ===================== */
    _renderDashboard() {
        const total = this._totalXP();
        this._buildCoachWeek();
        const todayPlan = this.state.coach.days[this._today()];
        const isRest = todayPlan && todayPlan.rest;
        const coachDone = todayPlan && todayPlan.done;
        const session = (todayPlan && !isRest && todayPlan.session) ? todayPlan.session.map(id => KS_TRAINERS[id]).filter(Boolean) : [];
        const tt = session[0] || KS_TRAINERS[this._todaysTrainer()];
        const td = KS_DISC_MAP[tt.disc];
        const trainedToday = this.state.lastPracticeDate === this._today();
        return `
        <div class="ss-hero gm-hero-id">
            <div class="gm-hero-emblem" title="Dein Rang wächst mit deinem Grad">${this._rankEmblem()}</div>
            <div class="gm-hero-body">
                <div class="ss-kicker">Your body dojo · ${this._overallTitle()}</div>
                <h1>Train your body – in small steps</h1>
                <p>Four disciplines: movement &amp; strength, nutrition, yoga and meditation &amp; breath. A small session every day – that is how vitality grows, and body and mind become one daily ritual.</p>
            </div>
        </div>

        <div class="gm-theme-row">
            <span class="gm-theme-label"><i class="fas fa-palette"></i> Dojo-Stil</span>
            ${KS_THEMES.map(t => `<button class="gm-theme-dot ${this.state.theme === t.id ? 'active' : ''}" data-theme="${t.id}" title="${t.name}" style="background:linear-gradient(135deg,${t.a2},${t.a})"></button>`).join('')}
        </div>

        <div class="ss-stats">
            <div class="ss-stat"><div class="ss-stat-num">${total.toLocaleString('de-DE')}</div><div class="ss-stat-label">Vitality</div></div>
            <div class="ss-stat"><div class="ss-stat-num">${this._overallTitle()}</div><div class="ss-stat-label">Titel · Grad ${this._overallGrade()}</div></div>
            <div class="ss-stat"><div class="ss-stat-num">${this.state.streak || 0}🔥</div><div class="ss-stat-label">Tage in Folge</div></div>
            <div class="ss-stat"><div class="ss-stat-num">${this.state.totalSessions || 0}</div><div class="ss-stat-label">Sessions</div></div>
        </div>

        <div class="ss-panel ks-today" style="--accent:${td.accent};--accent-soft:${td.soft}">
            <div class="ks-today-head">
                <div>
                    <div class="ss-kicker">${isRest ? 'Heute · Erholungstag' : coachDone ? 'Done today ✓ · stark!' : 'Dein Coach-Training für heute'}</div>
                    <h3 style="margin:4px 0 2px">${isRest ? '🌙 Aktive Erholung' : (session.length > 1 ? '🔥 Kombi-Training' : tt.icon + ' ' + tt.title)}</h3>
                    <p class="sub" style="margin:0">${isRest ? 'Regeneration gehört dazu' : (session.length ? session.map(s => s.icon).join(' ') + ' · ' + this._fmtDur(session.reduce((a, s) => a + this._sessionDur(s), 0)) : td.name)}</p>
                </div>
                <button class="ss-btn ss-btn-primary" id="ks-start-today"><i class="fas fa-${isRest ? 'wind' : 'play'}"></i> ${isRest ? 'Coach' : coachDone ? 'Nochmal' : 'Starten'}</button>
            </div>
        </div>

        <h2 style="margin:8px 0 14px;font-size:20px">Deine Disziplinen</h2>
        <div class="ss-grid">
            ${KS_DISCIPLINES.map(d => this._discCard(d)).join('')}
        </div>

        ${this._ritualPanel()}

        <div class="ss-panel ks-bridge">
            <h3 style="margin:0 0 4px"><i class="fas fa-link"></i> Connect body &amp; mind</h3>
            <p class="sub" style="margin:0 0 12px">Your daily ritual goes beyond the body. Train memory and the senses too.</p>
            <div class="ks-bridge-row">
                <a class="ss-btn ss-btn-ghost" href="../gedaechtnisschule/index-gedaechtnisschule.html">🧠 Memory</a>
                <a class="ss-btn ss-btn-ghost" href="../sinnesschule/index-sinnesschule.html">✋ Senses</a>
                <button class="ss-btn ss-btn-ghost" id="ks-goto-plan"><i class="fas fa-clipboard-list"></i> Plans &amp; programs</button>
            </div>
        </div>`;
    }

    _ritualPanel() {
        const today = this._today();
        const schools = [
            { key: 'ks_state', icon: '体', name: 'Body', here: true },
            { key: 'gs_state', icon: '🧠', name: 'Gedächtnis', href: '../gedaechtnisschule/index-gedaechtnisschule.html' },
            { key: 'ss_state', icon: '✋', name: 'Senses', href: '../sinnesschule/index-sinnesschule.html' }
        ];
        const status = schools.map(s => {
            let done = false;
            try { const st = JSON.parse(localStorage.getItem(s.key) || 'null'); done = !!(st && st.lastPracticeDate === today); } catch (e) { /* ignore */ }
            return Object.assign({}, s, { done });
        });
        const doneCount = status.filter(s => s.done).length;
        return `
        <div class="ss-panel ks-ritual">
            <div class="ks-ritual-head">
                <h3 style="margin:0"><i class="fas fa-circle-nodes"></i> Daily ritual</h3>
                <span class="ks-ritual-count">${doneCount}/3 today</span>
            </div>
            <p class="sub" style="margin:4px 0 12px">One small session in each school – body, mind and senses as one connected ritual.</p>
            <div class="ks-ritual-row">
                ${status.map(s => `
                    <${s.here ? 'button' : 'a'} class="ks-ritual-item ${s.done ? 'done' : ''}" ${s.here ? `data-ritual="coach"` : `href="${s.href}"`}>
                        <span class="ic">${s.icon}</span>
                        <span class="nm">${s.name}</span>
                        <span class="st">${s.done ? '<i class="fas fa-circle-check"></i> done' : 'offen'}</span>
                    </${s.here ? 'button' : 'a'}>`).join('')}
            </div>
        </div>`;
    }
    _afterRitual() {
        document.querySelectorAll('[data-ritual="coach"]').forEach(b => b.addEventListener('click', () => this.go('coach')));
    }

    _discCard(d) {
        const grade = this._grade(d.id);
        const prog = this._gradeProgress(d.id);
        const st = this.state.disc[d.id];
        return `
        <div class="ss-sense-card" data-disc="${d.id}" style="--accent:${d.accent};--accent-soft:${d.soft};--accent-glow:${d.glow}">
            <div class="ss-sense-head">
                <div class="ss-sense-icon">${d.icon}</div>
                <div>
                    <div class="ss-sense-name">${d.name}</div>
                    <div class="ss-sense-grade-name">Grad ${grade} · ${KS_titleFor(grade)}</div>
                </div>
                <div class="ss-sense-rank">${(st.xp || 0).toLocaleString('de-DE')}</div>
            </div>
            <p class="ss-sense-meta" style="margin:8px 0 0">${d.blurb}</p>
            <div class="gm-disc-tags">${d.tags.map(t => `<span class="gm-tag">${t}</span>`).join('')}</div>
            <div class="ss-prog"><div class="ss-prog-bar"><div class="ss-prog-fill" style="width:${prog}%"></div></div></div>
        </div>`;
    }

    _afterDashboard() {
        document.querySelectorAll('.ss-sense-card').forEach(card => card.addEventListener('click', () => { this.activeDisc = card.dataset.disc; this.go('practice'); }));
        const today = document.getElementById('ks-start-today');
        if (today) today.addEventListener('click', () => {
            const plan = this.state.coach.days[this._today()];
            if (plan && !plan.rest && plan.session && plan.session.length) { this.view = 'coach'; this._startCoachSession(); }
            else this.go('coach');
        });
        const plan = document.getElementById('ks-goto-plan');
        if (plan) plan.addEventListener('click', () => this.go('plan'));
        document.querySelectorAll('.gm-theme-dot').forEach(dot => dot.addEventListener('click', () => {
            this.state.theme = dot.dataset.theme;
            this._save();
            this._applyTheme();
            this.render();
        }));
        this._afterRitual();
    }

    /* ===================== ONBOARDING (Coach-Setup) ===================== */
    _renderOnboarding() {
        const p = this.state.profile;
        return `
        <div class="ss-hero">
            <div class="ss-kicker">Your personal coach</div>
            <h1>Let's set up your path</h1>
            <p>Answer a few questions – your coach will then put together the right training every day. You can change everything later.</p>
        </div>
        <div class="ss-panel ks-onb">
            <div class="ks-onb-block">
                <h3>1 · What’s your goal?</h3>
                <div class="ks-opt-grid" id="onb-goal">
                    ${KS_GOALS.map(g => `<button class="ks-opt ${p.goal === g.id ? 'active' : ''}" data-goal="${g.id}"><span class="ic">${g.icon}</span><span>${g.name}</span></button>`).join('')}
                </div>
            </div>
            <div class="ks-onb-block">
                <h3>2 · How fit are you right now?</h3>
                <div class="ks-opt-grid cols-3" id="onb-level">
                    ${KS_LEVELS.map(l => `<button class="ks-opt ${p.level === l.id ? 'active' : ''}" data-level="${l.id}"><span>${l.name}</span></button>`).join('')}
                </div>
            </div>
            <div class="ks-onb-block">
                <h3>3 · What equipment do you have?</h3>
                <p class="sub" style="margin:0 0 10px">Bodyweight is always with you. Pick what you can use on top.</p>
                <div class="ks-opt-grid" id="onb-equip">
                    ${KS_EQUIPMENT.map(e => `<button class="ks-opt ${p.equipment.includes(e.id) ? 'active' : ''} ${e.id === 'none' ? 'locked' : ''}" data-equip="${e.id}"><span class="ic">${e.icon}</span><span>${e.name}</span></button>`).join('')}
                </div>
            </div>
            <div class="ks-onb-block ks-onb-row">
                <div>
                    <h3>4 · Days per week</h3>
                    <div class="ks-stepper" id="onb-days">
                        <button data-days="dec">−</button><span class="val" id="onb-days-val">${p.daysPerWeek}</span><button data-days="inc">+</button>
                    </div>
                </div>
                <div>
                    <h3>5 · Minutes per session</h3>
                    <div class="ks-opt-grid cols-3" id="onb-len">
                        ${[5, 10, 20].map(m => `<button class="ks-opt ${p.sessionLength === m ? 'active' : ''}" data-len="${m}"><span>${m} Min</span></button>`).join('')}
                    </div>
                </div>
            </div>
            <div class="ks-onb-block">
                <h3>6 · Daily reminder <span class="sub" style="font-weight:400">(optional)</span></h3>
                <input type="time" id="onb-reminder" class="ks-time-input" value="${p.reminderTime || ''}">
            </div>
            <button class="ss-btn ss-btn-primary ss-btn-block" id="onb-finish"><i class="fas fa-flag-checkered"></i> Start coaching</button>
        </div>`;
    }
    _afterOnboarding() {
        const p = this.state.profile;
        const main = document.getElementById('ss-main');
        main.querySelectorAll('#onb-goal [data-goal]').forEach(b => b.addEventListener('click', () => { p.goal = b.dataset.goal; main.querySelectorAll('#onb-goal .ks-opt').forEach(x => x.classList.toggle('active', x === b)); }));
        main.querySelectorAll('#onb-level [data-level]').forEach(b => b.addEventListener('click', () => { p.level = b.dataset.level; main.querySelectorAll('#onb-level .ks-opt').forEach(x => x.classList.toggle('active', x === b)); }));
        main.querySelectorAll('#onb-equip [data-equip]').forEach(b => b.addEventListener('click', () => {
            const id = b.dataset.equip;
            if (id === 'none') return;
            const i = p.equipment.indexOf(id);
            if (i >= 0) p.equipment.splice(i, 1); else p.equipment.push(id);
            b.classList.toggle('active');
        }));
        main.querySelectorAll('#onb-len [data-len]').forEach(b => b.addEventListener('click', () => { p.sessionLength = +b.dataset.len; main.querySelectorAll('#onb-len .ks-opt').forEach(x => x.classList.toggle('active', x === b)); }));
        main.querySelectorAll('#onb-days [data-days]').forEach(b => b.addEventListener('click', () => {
            p.daysPerWeek = Math.max(1, Math.min(7, p.daysPerWeek + (b.dataset.days === 'inc' ? 1 : -1)));
            document.getElementById('onb-days-val').textContent = p.daysPerWeek;
        }));
        const finish = document.getElementById('onb-finish');
        if (finish) finish.addEventListener('click', () => {
            const rt = document.getElementById('onb-reminder');
            p.reminderTime = rt ? rt.value : '';
            p.onboarded = true;
            this.state.coach.week = null;
            this._buildCoachWeek();
            this._save();
            this._scheduleReminder();
            this._celebrate();
            this._toast('Your coach is ready! 🎉', 'gold');
            this.go('coach');
        });
    }

    /* ===================== COACH (Freeletics-Stil) ===================== */
    _renderCoach() {
        const p = this.state.profile;
        const week = this._buildCoachWeek();
        const todayKey = this._today();
        const todayPlan = this.state.coach.days[todayKey];
        const goal = KS_GOALS.find(g => g.id === p.goal) || KS_GOALS[4];
        const lvl = KS_LEVELS.find(l => l.id === p.level) || KS_LEVELS[0];
        const doneToday = todayPlan && todayPlan.done;
        const sessIds = (todayPlan && !todayPlan.rest && Array.isArray(todayPlan.session)) ? todayPlan.session.filter(id => KS_TRAINERS[id]) : [];
        const session = sessIds.map(id => KS_TRAINERS[id]);
        const exDur = id => Math.round(this._sessionDur(KS_TRAINERS[id]) * this._intensity(id));
        const totalSec = sessIds.reduce((a, id) => a + exDur(id), 0);
        return `
        <div class="ss-hero ks-coach-hero">
            <div class="ss-kicker">Your coach · ${goal.icon} ${goal.name} · ${lvl.name}</div>
            <h1>${doneToday ? 'Done today – stark! 🎉' : (todayPlan && todayPlan.rest) ? 'Today is a rest day' : 'Dein Training für heute'}</h1>
            <p>Your coach adapts training to your goal, your equipment and your feedback. One doable session every day – that is the Freeletics path in your dojo.</p>
            <button class="ss-btn ss-btn-ghost ks-coach-edit" id="ks-coach-settings"><i class="fas fa-sliders"></i> Adjust coach</button>
        </div>

        ${(todayPlan && todayPlan.rest)
            ? `<div class="ss-panel ks-rest"><span class="ic">🌙</span><div><h3 style="margin:0 0 4px">Aktive Erholung</h3><p class="sub" style="margin:0">Regeneration ist Teil des Fortschritts. Optional: eine kurze Atem- oder Dehn-Einheit.</p><div class="ks-bridge-row" style="margin-top:12px"><button class="ss-btn ss-btn-ghost" data-quick="breath_478">🌬️ 4-7-8-Atem</button><button class="ss-btn ss-btn-ghost" data-quick="entspannung">🌙 Abend-Dehnung</button></div></div></div>`
            : `<div class="ss-panel ks-coach-session">
                <div class="ks-coach-session-head">
                    <div><div class="ss-kicker">Heutige Einheit · ${this._fmtDur(totalSec)} · Intensity ${this._intensityLabel()}</div><h2 style="margin:4px 0 0">${session.length > 1 ? 'Combo training' : (session[0] ? session[0].title : 'Training')}</h2></div>
                    ${doneToday ? `<span class="ks-done-badge"><i class="fas fa-circle-check"></i> Erledigt</span>` : ''}
                </div>
                <div class="ks-coach-steps">
                    ${sessIds.map((id, i) => { const t = KS_TRAINERS[id]; return `<div class="ks-coach-ex"><span class="n">${i + 1}</span><span class="ic">${t.icon}</span><div class="b"><div class="t">${t.title}</div><div class="s">${KS_DISC_MAP[t.disc].name} · ${this._fmtDur(exDur(id))}</div></div></div>`; }).join('')}
                </div>
                ${doneToday
                    ? `<button class="ss-btn ss-btn-ghost ss-btn-block" id="ks-coach-redo"><i class="fas fa-rotate-right"></i> One more round</button>`
                    : `<button class="ss-btn ss-btn-primary ss-btn-block" id="ks-coach-start"><i class="fas fa-play"></i> Start session</button>`}
            </div>`}

        <div class="ss-panel">
            <h3 style="margin:0 0 12px"><i class="fas fa-calendar-week"></i> Your week</h3>
            <div class="ks-week">
                ${week.map(d => {
                    const pl = this.state.coach.days[d.key];
                    const cls = d.key === todayKey ? 'today' : '';
                    const state = pl && pl.done ? 'done' : pl && pl.rest ? 'rest' : pl ? 'planned' : 'empty';
                    const icon = state === 'done' ? '<i class="fas fa-check"></i>' : state === 'rest' ? '🌙' : state === 'planned' ? (KS_DISC_MAP[(pl.session[0] && KS_TRAINERS[pl.session[0]].disc) || 'bewegung'].icon) : '·';
                    return `<div class="ks-week-day ${cls} ${state}"><span class="dow">${d.dow}</span><span class="cell">${icon}</span></div>`;
                }).join('')}
            </div>
            <p class="sub" style="margin:12px 0 0">${p.daysPerWeek} Training days/week · The rest adapts if you do more or less on a given day.</p>
        </div>`;
    }
    _afterCoach() {
        const start = document.getElementById('ks-coach-start');
        if (start) start.addEventListener('click', () => this._startCoachSession());
        const redo = document.getElementById('ks-coach-redo');
        if (redo) redo.addEventListener('click', () => this._startCoachSession());
        const settings = document.getElementById('ks-coach-settings');
        if (settings) settings.addEventListener('click', () => { this.state.profile.onboarded = false; this.render(); });
        document.querySelectorAll('[data-quick]').forEach(b => b.addEventListener('click', () => { const id = b.dataset.quick; this.activeDisc = KS_TRAINERS[id].disc; this.go('practice'); this._startTrainer(id); }));
    }

    /* ---------------- Coach-Logik ---------------- */
    _hasEquip(t) { const eq = this.state.profile.equipment || ['none']; return (t.equip || ['none']).some(e => eq.includes(e)); }
    _availableTrainerIds() { return Object.keys(KS_TRAINERS).filter(id => this._hasEquip(KS_TRAINERS[id])); }
    _timeOfDay() { const h = new Date().getHours(); return h < 11 ? 'morning' : h >= 18 ? 'evening' : 'midday'; }

    _intensity(trainerId) {
        const lvl = KS_LEVELS.find(l => l.id === this.state.profile.level) || KS_LEVELS[0];
        const adj = (this.state.coach.adjust && this.state.coach.adjust[trainerId]) || 0;
        return Math.max(0.6, Math.min(1.6, lvl.factor + adj));
    }
    _intensityLabel() {
        const lvl = KS_LEVELS.find(l => l.id === this.state.profile.level) || KS_LEVELS[0];
        return lvl.name;
    }

    /* Wählt eine Session (1–3 Trainer) passend zu Ziel, Equipment, Tageszeit und Länge. */
    _pickSessionFor(dateKey, seedExtra) {
        const p = this.state.profile;
        const avail = this._availableTrainerIds().map(id => ({ id, ...KS_TRAINERS[id] }));
        const tod = this._timeOfDay();
        const seed = this._dateSeed(dateKey) + (seedExtra || 0);
        const rnd = this._seeded(seed);
        // Bewertung: Zielpassung + Tageszeit + schwächste Disziplin fördern
        const grades = {}; KS_DISCIPLINES.forEach(d => grades[d.id] = this._grade(d.id));
        const minGrade = Math.min(...Object.values(grades));
        const score = t => {
            let s = 0;
            if ((t.goals || []).includes(p.goal)) s += 5;
            if ((t.goals || []).includes('allgemein')) s += 1;
            if (t.time === tod) s += 2;
            if (t.time === 'any') s += 1;
            if (grades[t.disc] === minGrade) s += 2;
            if (t.type === 'habit') s -= 2;
            return s + rnd() * 2;
        };
        // Hauptübung: beste bewegungs-/zielnahe Einheit, die nicht 'habit' ist
        const ranked = avail.filter(t => t.type !== 'habit').sort((a, b) => score(b) - score(a));
        const main = ranked[0] || avail[0];
        const session = [main.id];
        let budget = (p.sessionLength * 60) - this._sessionDur(main) * this._intensity(main.id);
        // Fülle mit ergänzenden Einheiten anderer Disziplinen
        const used = new Set([main.id]); const usedDisc = new Set([main.disc]);
        const allowSameDisc = p.sessionLength >= 20;
        for (const t of ranked) {
            if (session.length >= 3 || budget <= 30) break;
            if (used.has(t.id)) continue;
            if (usedDisc.has(t.disc) && !allowSameDisc) continue;
            const dur = this._sessionDur(t) * this._intensity(t.id);
            if (dur <= budget + 40) { session.push(t.id); used.add(t.id); usedDisc.add(t.disc); budget -= dur; }
        }
        // Abschluss bei längeren Einheiten: kurze Atem-/Dehn-Einheit
        if (p.sessionLength >= 10 && !session.some(id => KS_TRAINERS[id].disc === 'meditation')) {
            const cool = avail.find(t => t.disc === 'meditation' && t.type !== 'habit');
            if (cool && session.length < 3) session.push(cool.id);
        }
        return session;
    }

    _buildCoachWeek() {
        const c = this.state.coach;
        const monday = this._weekStart();
        if (c.week === monday && c.days && Object.keys(c.days).some(k => k >= monday)) {
            // Sorge dafür, dass heute existiert
            const tk = this._today();
            if (!c.days[tk]) c.days[tk] = this._planForDay(tk);
            return this._weekDays();
        }
        c.week = monday;
        const p = this.state.profile;
        // Trainingstage gleichmäßig über die Woche verteilen
        const trainIdx = this._spreadDays(p.daysPerWeek);
        const days = this._weekDays();
        const oldDays = c.days || {};
        c.days = {};
        days.forEach((d, i) => {
            const existing = oldDays[d.key];
            if (existing && existing.done) { c.days[d.key] = existing; return; }
            if (trainIdx.includes(i)) c.days[d.key] = { session: this._pickSessionFor(d.key), done: false, rest: false };
            else c.days[d.key] = { session: [], done: false, rest: true };
        });
        return days;
    }
    _planForDay(key) {
        const idx = (new Date(key).getDay() + 6) % 7;
        const trainIdx = this._spreadDays(this.state.profile.daysPerWeek);
        return trainIdx.includes(idx)
            ? { session: this._pickSessionFor(key), done: false, rest: false }
            : { session: [], done: false, rest: true };
    }
    _spreadDays(n) {
        n = Math.max(1, Math.min(7, n));
        const out = [];
        for (let i = 0; i < n; i++) out.push(Math.round(i * 7 / n) % 7);
        return [...new Set(out)];
    }
    _weekStart() {
        const d = new Date(); const day = (d.getDay() + 6) % 7;
        d.setDate(d.getDate() - day); return d.toISOString().slice(0, 10);
    }
    _weekDays() {
        const start = new Date(this._weekStart());
        const dows = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
        return dows.map((dow, i) => { const dt = new Date(start.getTime() + i * 86400000); return { key: dt.toISOString().slice(0, 10), dow }; });
    }
    _dateSeed(key) { return key.split('-').reduce((a, n) => a + parseInt(n, 10), 0); }
    _seeded(seed) { let s = seed % 2147483647; if (s <= 0) s += 2147483646; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }

    _startCoachSession() {
        const tk = this._today();
        const plan = this.state.coach.days[tk];
        if (!plan || !plan.session || !plan.session.length) { this._toast('Today is a rest day', 'success'); return; }
        this._coachQueue = plan.session.slice();
        this._coachActive = true;
        this._runCoachNext();
    }
    _runCoachNext() {
        if (!this._coachQueue || !this._coachQueue.length) { this._finishCoachDay(); return; }
        const id = this._coachQueue.shift();
        if (!KS_TRAINERS[id]) return this._runCoachNext();
        this.activeDisc = KS_TRAINERS[id].disc;
        this._startTrainer(id);
    }
    _finishCoachDay() {
        this._coachActive = false;
        const tk = this._today();
        if (this.state.coach.days[tk]) this.state.coach.days[tk].done = true;
        this._save();
        this._haptic('level');
        this._celebrate();
        this.view = 'coach';
        this._renderCoachFeedback();
    }
    _renderCoachFeedback() {
        const main = document.getElementById('ss-main');
        if (!main) return;
        main.innerHTML = `
        <div class="ss-panel ks-feedback" style="text-align:center">
            <h2>🎉 Session complete!</h2>
            <p class="sub">How did the training feel? Your coach will adapt the next session.</p>
            <div class="ks-feedback-opts">
                <button class="ss-btn ss-btn-ghost" data-fb="easy">😎 Too easy</button>
                <button class="ss-btn ss-btn-primary" data-fb="ok">👍 Just right</button>
                <button class="ss-btn ss-btn-ghost" data-fb="hard">🥵 Too hard</button>
            </div>
        </div>`;
        main.querySelectorAll('[data-fb]').forEach(b => b.addEventListener('click', () => this._applyCoachFeedback(b.dataset.fb)));
    }
    _applyCoachFeedback(fb) {
        const tk = this._today();
        const plan = this.state.coach.days[tk];
        const delta = fb === 'easy' ? 0.1 : fb === 'hard' ? -0.1 : 0;
        if (plan && plan.session) plan.session.forEach(id => {
            const cur = this.state.coach.adjust[id] || 0;
            this.state.coach.adjust[id] = Math.max(-0.3, Math.min(0.4, cur + delta));
        });
        this.state.coach.feedback.unshift({ date: tk, fb });
        this.state.coach.feedback = this.state.coach.feedback.slice(0, 60);
        this._save();
        this._toast(fb === 'ok' ? 'Strong – keep going!' : 'Coach updated ✓', 'success');
        this.go('coach');
    }

    /* ---------------- Erinnerung ---------------- */
    _scheduleReminder() {
        try {
            if (this._reminderTimer) { clearTimeout(this._reminderTimer); this._reminderTimer = null; }
            const rt = this.state.profile.reminderTime;
            if (!rt || !/^\d{2}:\d{2}$/.test(rt)) return;
            if (!('Notification' in window)) return;
            if (Notification.permission === 'default') Notification.requestPermission().catch(() => {});
            const [h, m] = rt.split(':').map(Number);
            const now = new Date();
            const target = new Date(); target.setHours(h, m, 0, 0);
            if (target <= now) return; // nur für heute, sonst beim nächsten Öffnen
            const ms = target - now;
            if (ms > 6 * 3600 * 1000) return;
            this._reminderTimer = setTimeout(() => {
                const tk = this._today();
                const plan = this.state.coach.days[tk];
                if (plan && plan.done) return;
                try { if (Notification.permission === 'granted') new Notification('The School of the Body', { body: 'Time for your small session today 💪', icon: '/favicon.ico' }); } catch (e) { /* ignore */ }
                this._toast('Time for your training today 💪', 'gold');
            }, ms);
        } catch (e) { /* ignore */ }
    }

    /* ===================== PRACTICE ===================== */
    _renderPractice() {
        const d = KS_DISC_MAP[this.activeDisc];
        const grade = this._grade(this.activeDisc);
        const all = Object.keys(KS_TRAINERS).filter(id => KS_TRAINERS[id].disc === this.activeDisc).map(id => ({ id, ...KS_TRAINERS[id] }));
        const avail = all.filter(t => this._hasEquip(t));
        const locked = all.filter(t => !this._hasEquip(t));
        const equipName = ids => (ids || []).filter(e => e !== 'none').map(e => { const x = KS_EQUIPMENT.find(q => q.id === e); return x ? x.name : e; }).join(', ');
        const equipBadge = t => { const need = (t.equip || ['none']).filter(e => e !== 'none'); return need.length ? `<span class="ks-equip-badge">${equipName(t.equip)}</span>` : ''; };
        return `
        <div class="ss-sense-picker">
            ${KS_DISCIPLINES.map(x => `<button class="ss-chip ${x.id === this.activeDisc ? 'active' : ''}" data-disc="${x.id}">${x.icon} ${x.short}</button>`).join('')}
        </div>
        <div class="ss-panel" style="--accent:${d.accent};--accent-soft:${d.soft}">
            <h2>${d.icon} ${d.name} — ${KS_titleFor(grade)} (Grad ${grade})</h2>
            <p class="sub">${d.blurb}</p>
            <div class="ss-exercise-list">
                ${avail.map(t => `
                    <div class="ss-exercise-item" data-trainer="${t.id}">
                        <div class="ic">${t.icon}</div>
                        <div class="body">
                            <div class="title">${t.title} ${equipBadge(t)}</div>
                            <div class="desc">${t.blurb}</div>
                        </div>
                        <div class="dur">${t.type === 'habit' ? '+' + t.xp : this._fmtDur(this._sessionDur(t))}</div>
                    </div>`).join('')}
            </div>
            ${locked.length ? `<div class="ks-locked-hint"><i class="fas fa-lock"></i> ${locked.length} weitere Übung${locked.length > 1 ? 'en' : ''} mit zusätzlichem Equipment (${[...new Set(locked.flatMap(t => (t.equip || []).filter(e => e !== 'none')))].map(e => { const x = KS_EQUIPMENT.find(q => q.id === e); return x ? x.name : e; }).join(', ')}). <button class="ks-link-btn" id="ks-edit-equip">Equipment anpassen</button></div>` : ''}
        </div>`;
    }
    _afterPractice() {
        document.querySelectorAll('.ss-chip').forEach(c => c.addEventListener('click', () => { this.activeDisc = c.dataset.disc; this.render(); }));
        document.querySelectorAll('.ss-exercise-item').forEach(item => item.addEventListener('click', () => this._startTrainer(item.dataset.trainer)));
        const ee = document.getElementById('ks-edit-equip');
        if (ee) ee.addEventListener('click', () => { this.state.profile.onboarded = false; this.render(); });
    }

    /* ===================== VERÄNDERUNGS-REISE ===================== */
    _renderPlan() {
        const tab = this.journeyTab || 'reise';
        return `
        <div class="ss-hero">
            <div class="ss-kicker">Change journey</div>
            <h1>Learn how to change – and how to live it</h1>
            <p>Not a rigid plan, but a path: in small phases you understand how change really works – and you anchor it step by step in your everyday life until it belongs to you.</p>
        </div>
        <div class="ss-sense-picker ks-journey-tabs">
            <button class="ss-chip ${tab === 'reise' ? 'active' : ''}" data-jtab="reise">🧭 Journey</button>
            <button class="ss-chip ${tab === 'werkstatt' ? 'active' : ''}" data-jtab="werkstatt">🛠️ Workshop</button>
            <button class="ss-chip ${tab === 'werkzeuge' ? 'active' : ''}" data-jtab="werkzeuge">📋 Tools</button>
        </div>
        ${tab === 'reise' ? this._journeyReise() : tab === 'werkstatt' ? this._journeyWerkstatt() : this._journeyWerkzeuge()}`;
    }
    _afterPlan() {
        document.querySelectorAll('[data-jtab]').forEach(b => b.addEventListener('click', () => { this.journeyTab = b.dataset.jtab; this.editingHabitId = null; this.render(); }));
        const tab = this.journeyTab || 'reise';
        if (tab === 'reise') this._afterJourneyReise();
        else if (tab === 'werkstatt') this._afterJourneyWerkstatt();
        else this._afterJourneyWerkzeuge();
    }

    _journeyReise() {
        const j = this._journey();
        const idx = Math.min(j.phase || 0, KS_JOURNEY.length - 1);
        const ph = KS_JOURNEY[idx];
        const reqMet = this._reqMet(ph.req);
        const acked = !!j.ack[idx];
        const isLast = idx >= KS_JOURNEY.length - 1;
        const canAdvance = acked && reqMet && !isLast;
        const habits = j.habits || [];
        const today = this._today();
        return `
        <div class="ss-stats">
            <div class="ss-stat"><div class="ss-stat-num">${idx + 1}/${KS_JOURNEY.length}</div><div class="ss-stat-label">Phase</div></div>
            <div class="ss-stat"><div class="ss-stat-num">${this._integrationDays()}</div><div class="ss-stat-label">Integration days</div></div>
            <div class="ss-stat"><div class="ss-stat-num">${habits.length}</div><div class="ss-stat-label">Gewohnheiten</div></div>
        </div>
        <div class="ks-phase-path">
            ${KS_JOURNEY.map((p, i) => `<div class="ks-phase-dot ${i < idx ? 'done' : i === idx ? 'current' : 'locked'}" title="${this._esc(p.title)}"><span class="ic">${i < idx ? '✓' : p.icon}</span><span class="lbl">${this._esc(p.title)}</span></div>`).join('')}
        </div>
        <div class="ss-panel ks-phase-card">
            <div class="ks-phase-head"><span class="ic">${ph.icon}</span><div><div class="ss-kicker">Phase ${idx + 1} · ${isLast ? 'Dauerphase' : 'Lernschritt'}</div><h2 style="margin:2px 0">${ph.title}</h2><p class="ks-phase-principle">${this._esc(ph.principle)}</p></div></div>
            <div class="ks-phase-lesson">${ph.lesson}</div>
            <div class="ks-phase-examples"><span class="lbl">Examples:</span> ${ph.examples.map(e => `<span>${this._esc(e)}</span>`).join('')}</div>
            <div class="ks-phase-task ${reqMet ? 'met' : ''}">
                <i class="fas ${reqMet ? 'fa-circle-check' : 'fa-circle-dot'}"></i>
                <div class="body"><strong>Your task</strong><div>${this._esc(ph.task)}</div></div>
                ${ph.req !== 'none' && ph.req !== 'reflect' ? `<button class="ss-btn ss-btn-ghost" id="ks-go-werkstatt">Zur Werkstatt</button>` : ''}
                ${ph.req === 'reflect' ? `<button class="ss-btn ss-btn-ghost" id="ks-go-reflect">Reflexion schreiben</button>` : ''}
            </div>
            <label class="ks-ack"><input type="checkbox" id="ks-ack" ${acked ? 'checked' : ''}> I have understood this phase and am starting to live it.</label>
            ${isLast
                ? `<p class="sub" style="margin-top:8px"><i class="fas fa-infinity"></i> Du hast den Kreislauf der Veränderung gemeistert. Pflege deine Gewohnheiten – oder starte eine neue Reise.</p>`
                : `<button class="ss-btn ss-btn-primary" id="ks-advance" ${canAdvance ? '' : 'disabled'}>Phase abschließen <i class="fas fa-arrow-right"></i></button>
                   ${!reqMet ? `<p class="sub" style="margin-top:8px">Finish the task first to unlock the next phase.</p>` : ''}`}
        </div>
        ${habits.length ? `
        <div class="ss-panel">
            <h3 style="margin:0 0 4px"><i class="fas fa-list-check"></i> Heute leben</h3>
            <p class="sub" style="margin:0 0 12px">Hake deine Mikro-Gewohnheiten ab – jeder Tag zählt für deine Integration.</p>
            <div class="ks-habit-today">
                ${habits.map(h => { const done = (h.days || []).includes(today); return `<button class="ks-today-habit ${done ? 'done' : ''}" data-hid="${h.id}"><span class="chk"><i class="fas ${done ? 'fa-circle-check' : 'fa-circle'}"></i></span><span class="tbody"><span class="t">${this._esc(h.title || h.action || 'Gewohnheit')}</span><span class="s">${h.cue ? 'Nach: ' + this._esc(h.cue) : this._esc(h.action || '')}</span></span><span class="streak">${this._habitStreak(h)}🔥</span></button>`; }).join('')}
            </div>
        </div>` : `<div class="ss-panel ks-plan-hint"><i class="fas fa-seedling"></i> Noch keine Gewohnheit. Lege in der <strong>Werkstatt</strong> deine erste winzige Gewohnheit an.</div>`}`;
    }
    _afterJourneyReise() {
        const ack = document.getElementById('ks-ack');
        if (ack) ack.addEventListener('change', () => { const j = this._journey(); const idx = Math.min(j.phase || 0, KS_JOURNEY.length - 1); j.ack[idx] = ack.checked; this._save(); this.render(); });
        const adv = document.getElementById('ks-advance');
        if (adv) adv.addEventListener('click', () => this._advancePhase());
        const gw = document.getElementById('ks-go-werkstatt');
        if (gw) gw.addEventListener('click', () => { this.journeyTab = 'werkstatt'; this.render(); });
        const gr = document.getElementById('ks-go-reflect');
        if (gr) gr.addEventListener('click', () => this._reflectPrompt());
        document.querySelectorAll('.ks-today-habit').forEach(b => b.addEventListener('click', () => this._toggleHabitToday(b.dataset.hid)));
    }

    _journeyWerkstatt() {
        const j = this._journey();
        const editing = this.editingHabitId ? (j.habits || []).find(h => h.id === this.editingHabitId) : null;
        const h = editing || {};
        const domains = [['bewegung', '💪 Movement'], ['ernaehrung', '🥗 Nutrition'], ['yoga', '🧘 Yoga'], ['meditation', '🌬️ Meditation'], ['allgemein', '✨ General']];
        return `
        <div class="ss-panel">
            <h2 style="margin:0 0 4px">🛠️ Habit workshop</h2>
            <p class="sub" style="margin:0 0 14px">Design your habit step by step. You don’t have to fill every field at once – each phase adds one.</p>
            <div class="ks-form">
                <label>Habit (title)<input id="kf-title" value="${this._esc(h.title || '')}" placeholder="e.g. morning squats"></label>
                <label>Area<select id="kf-domain">${domains.map(d => `<option value="${d[0]}" ${(h.domain || 'bewegung') === d[0] ? 'selected' : ''}>${d[1]}</option>`).join('')}</select></label>
                <label>🌱 Tiny action<input id="kf-action" value="${this._esc(h.action || '')}" placeholder="e.g. 1 squat"></label>
                <label>⚓ Trigger (after which routine?)<input id="kf-cue" value="${this._esc(h.cue || '')}" placeholder="e.g. after brushing your teeth"></label>
                <label>🎉 Instant reward<input id="kf-reward" value="${this._esc(h.reward || '')}" placeholder="e.g. fist pump and smile"></label>
                <label>🏠 Shape the environment<input id="kf-env" value="${this._esc(h.env || '')}" placeholder="e.g. lay out workout shoes"></label>
                <label>🧱 Stack step (what follows?)<input id="kf-stack" value="${this._esc(h.stack || '')}" placeholder="e.g. then 5 push-ups"></label>
                <label>🪞 Identity<input id="kf-identity" value="${this._esc(h.identity || '')}" placeholder="I am someone who …"></label>
            </div>
            <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:6px">
                <button class="ss-btn ss-btn-primary" id="kf-save"><i class="fas fa-check"></i> ${editing ? 'Änderungen speichern' : 'Gewohnheit anlegen'}</button>
                ${editing ? `<button class="ss-btn ss-btn-ghost" id="kf-cancel">Abbrechen</button>` : ''}
            </div>
        </div>
        ${(j.habits || []).length ? `
        <div class="ss-panel">
            <h3 style="margin:0 0 12px"><i class="fas fa-seedling"></i> Deine Gewohnheiten</h3>
            <div class="ks-habit-list">
                ${j.habits.map(hb => { const dm = KS_DISC_MAP[hb.domain]; const acc = dm ? dm.accent : '#34d399'; const done = (hb.days || []).includes(this._today()); return `
                <div class="ks-habit-row" style="--accent:${acc}">
                    <button class="chk ${done ? 'done' : ''}" data-hid="${hb.id}" title="Done today"><i class="fas ${done ? 'fa-circle-check' : 'fa-circle'}"></i></button>
                    <div class="hbody">
                        <div class="t">${this._esc(hb.title || hb.action || 'Gewohnheit')} <span class="streak">${this._habitStreak(hb)}🔥</span></div>
                        <div class="s">${hb.cue ? '<i class="fas fa-anchor"></i> ' + this._esc(hb.cue) + ' → ' : ''}${this._esc(hb.action || '')}</div>
                        ${hb.identity ? `<div class="idn">${this._esc(hb.identity)}</div>` : ''}
                    </div>
                    <div class="acts">
                        <button class="ic-btn" data-edit="${hb.id}" title="Edit"><i class="fas fa-pen"></i></button>
                        <button class="ic-btn" data-del="${hb.id}" title="Delete"><i class="fas fa-trash"></i></button>
                    </div>
                </div>`; }).join('')}
            </div>
        </div>` : ''}`;
    }
    _afterJourneyWerkstatt() {
        const save = document.getElementById('kf-save');
        if (save) save.addEventListener('click', () => this._saveHabit());
        const cancel = document.getElementById('kf-cancel');
        if (cancel) cancel.addEventListener('click', () => { this.editingHabitId = null; this.render(); });
        document.querySelectorAll('.ks-habit-row .chk').forEach(b => b.addEventListener('click', () => this._toggleHabitToday(b.dataset.hid)));
        document.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => { this.editingHabitId = b.dataset.edit; this.render(); window.scrollTo({ top: 0 }); }));
        document.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => this._deleteHabit(b.dataset.del)));
    }

    _journeyWerkzeuge() {
        return `
        <div class="ss-panel ks-plan-hint" style="margin-bottom:16px"><i class="fas fa-lightbulb"></i> Tools support your journey: a training or nutrition plan supplies <em>content</em>, which you then apply the change method to. The change itself comes from your small daily steps.</div>
        <div id="ks-plan-live" class="ks-plan-live"></div>
        <h3 style="margin:8px 0 12px"><i class="fas fa-toolbox"></i> Programs &amp; sister schools</h3>
        <div class="ss-grid">
            ${KS_LINKS.map(l => { const d = KS_DISC_MAP[l.disc]; return `<a class="ss-sense-card ks-link-card" href="${l.href}" style="--accent:${d.accent};--accent-soft:${d.soft};--accent-glow:${d.glow}"><div class="ss-sense-head"><div class="ss-sense-icon">${l.icon}</div><div><div class="ss-sense-name">${l.title}</div></div><i class="fas fa-arrow-up-right-from-square ss-sense-rank" style="font-size:15px"></i></div><p class="ss-sense-meta" style="margin:8px 0 0">${l.desc}</p></a>`; }).join('')}
        </div>`;
    }
    async _afterJourneyWerkzeuge() {
        const wrap = document.getElementById('ks-plan-live');
        if (!wrap) return;
        if (!this._isLoggedIn()) {
            wrap.innerHTML = `<div class="ss-panel ks-plan-hint"><i class="fas fa-cloud"></i> Sign in so training and nutrition plans you create show up here.</div>`;
            return;
        }
        wrap.innerHTML = `<div class="ss-panel ks-plan-hint"><i class="fas fa-circle-notch fa-spin"></i> Loading your active plans …</div>`;
        const panels = [];
        try { if (window.awsTrainingAPI) { const plan = await window.awsTrainingAPI.getCurrentPlan().catch(() => null); if (plan) panels.push(this._trainingPlanPanel(plan)); } } catch (e) { /* ignore */ }
        try { if (window.awsNutritionAPI) { const np = await window.awsNutritionAPI.getCurrentPlan().catch(() => null); let s = null; try { s = await window.awsNutritionAPI.getTodaysSummary(); } catch (e) { /* ignore */ } if (np || s) panels.push(this._nutritionPlanPanel(np, s)); } } catch (e) { /* ignore */ }
        wrap.innerHTML = panels.length ? panels.join('') : `<div class="ss-panel ks-plan-hint"><i class="fas fa-seedling"></i> No active plan created yet.</div>`;
    }

    /* ---------------- Reise-Logik ---------------- */
    _journey() {
        if (!this.state.journey) this.state.journey = { phase: 0, ack: {}, habits: [], reflections: [] };
        const j = this.state.journey;
        if (!j.ack) j.ack = {};
        if (!Array.isArray(j.habits)) j.habits = [];
        if (!Array.isArray(j.reflections)) j.reflections = [];
        if (typeof j.phase !== 'number') j.phase = 0;
        return j;
    }
    _reqMet(req) {
        const j = this._journey();
        const H = j.habits;
        switch (req) {
            case 'action': return H.some(h => h.action);
            case 'cue': return H.some(h => h.cue);
            case 'reward': return H.some(h => h.reward);
            case 'env': return H.some(h => h.env);
            case 'stack': return H.length >= 2 || H.some(h => h.stack);
            case 'identity': return H.some(h => h.identity);
            case 'reflect': return j.reflections.some(r => (r.phase || 0) >= 6);
            case 'none': return true;
            default: return true;
        }
    }
    _integrationDays() {
        const j = this._journey();
        const set = new Set();
        j.habits.forEach(h => (h.days || []).forEach(d => set.add(d)));
        return set.size;
    }
    _habitStreak(h) {
        const setd = new Set(h.days || []);
        if (!setd.size) return 0;
        let cur = this._today();
        if (!setd.has(cur)) cur = this._dayOffset(-1);
        let streak = 0;
        while (setd.has(cur)) { streak++; cur = new Date(new Date(cur).getTime() - 86400000).toISOString().slice(0, 10); }
        return streak;
    }
    _saveHabit() {
        const g = id => document.getElementById(id);
        const get = id => (g(id) ? g(id).value.trim() : '');
        const title = get('kf-title');
        const action = get('kf-action');
        if (!title && !action) { this._toast('Please enter at least a title or an action', 'error'); return; }
        const j = this._journey();
        const data = { title, domain: (g('kf-domain') ? g('kf-domain').value : 'bewegung'), action, cue: get('kf-cue'), reward: get('kf-reward'), env: get('kf-env'), stack: get('kf-stack'), identity: get('kf-identity') };
        if (this.editingHabitId) {
            const h = j.habits.find(x => x.id === this.editingHabitId);
            if (h) Object.assign(h, data);
            this.editingHabitId = null;
            this._toast('Habit updated', 'success');
        } else {
            j.habits.push(Object.assign({ id: 'h' + Date.now(), createdAt: this._today(), days: [] }, data));
            this._toast('Habit created', 'success');
        }
        this._save();
        this.render();
    }
    _deleteHabit(id) {
        const j = this._journey();
        j.habits = j.habits.filter(h => h.id !== id);
        if (this.editingHabitId === id) this.editingHabitId = null;
        this._save();
        this.render();
    }
    _toggleHabitToday(id) {
        const j = this._journey();
        const h = j.habits.find(x => x.id === id);
        if (!h) return;
        if (!Array.isArray(h.days)) h.days = [];
        const today = this._today();
        const i = h.days.indexOf(today);
        if (i >= 0) {
            h.days.splice(i, 1);
        } else {
            h.days.push(today);
            h.lastDone = today;
            const dm = KS_DISC_MAP[h.domain];
            if (dm) {
                this._registerPracticeDay(1);
                this.state.disc[h.domain].xp += 6;
                this.state.log.unshift({ id: Date.now(), date: today, disc: h.domain, trainer: 'Habit: ' + (h.title || h.action || ''), score: 100, detail: 'Change journey', xp: 6 });
                this.state.log = this.state.log.slice(0, 120);
            }
            this._haptic('ok');
            this._chime(false);
        }
        this._save();
        this.render();
    }
    _advancePhase() {
        const j = this._journey();
        const idx = Math.min(j.phase || 0, KS_JOURNEY.length - 1);
        if (idx >= KS_JOURNEY.length - 1) return;
        if (!j.ack[idx] || !this._reqMet(KS_JOURNEY[idx].req)) { this._toast('Finish the task and confirmation first', 'error'); return; }
        j.phase = idx + 1;
        this._save();
        this._haptic('level');
        this._celebrate();
        this._toast('New phase: ' + KS_JOURNEY[j.phase].title, 'gold');
        this.render();
    }
    _reflectPrompt() {
        this._modal({
            title: 'Your restart plan',
            label: 'How do you start again after a missed day?',
            placeholder: 'e.g. “If I miss a day, I do the mini version tomorrow – no drama.”',
            confirm: 'Save',
            onConfirm: (txt) => {
                if (txt && txt.trim()) {
                    const j = this._journey();
                    j.reflections.unshift({ id: Date.now(), date: this._today(), phase: Math.min(j.phase || 0, KS_JOURNEY.length - 1), text: txt.trim() });
                    this._save();
                    this._toast('Reflection saved', 'success');
                    this.render();
                }
            }
        });
    }
    _modal({ title, label, placeholder, confirm, onConfirm }) {
        const prev = document.getElementById('ks-modal');
        if (prev) prev.remove();
        const wrap = document.createElement('div');
        wrap.id = 'ks-modal';
        wrap.className = 'ks-modal-overlay';
        wrap.innerHTML = `
        <div class="ks-modal" role="dialog" aria-modal="true" aria-label="${this._esc(title)}">
            <h3>${this._esc(title)}</h3>
            ${label ? `<label class="ks-modal-label">${this._esc(label)}</label>` : ''}
            <textarea class="ks-modal-input" rows="4" placeholder="${this._esc(placeholder || '')}"></textarea>
            <div class="ks-modal-actions">
                <button class="ss-btn ss-btn-ghost" data-act="cancel">Abbrechen</button>
                <button class="ss-btn ss-btn-primary" data-act="ok">${this._esc(confirm || 'OK')}</button>
            </div>
        </div>`;
        document.body.appendChild(wrap);
        const ta = wrap.querySelector('.ks-modal-input');
        setTimeout(() => ta && ta.focus(), 50);
        const close = () => wrap.remove();
        wrap.addEventListener('click', e => { if (e.target === wrap) close(); });
        wrap.querySelector('[data-act="cancel"]').addEventListener('click', close);
        wrap.querySelector('[data-act="ok"]').addEventListener('click', () => { const v = ta ? ta.value : ''; close(); if (onConfirm) onConfirm(v); });
    }
    _trainingPlanPanel(plan) {
        const d = KS_DISC_MAP.bewegung;
        const goals = Array.isArray(plan.goals) ? plan.goals.slice(0, 3).join(', ') : '';
        const weeks = Array.isArray(plan.weeks) ? plan.weeks.length : null;
        return `
        <div class="ss-panel ks-plan-card" style="--accent:${d.accent};--accent-soft:${d.soft}">
            <div class="ks-plan-card-head"><span class="ic">🏋️</span><div><div class="t">${this._esc(plan.title || 'Dein Trainingsplan')}</div><div class="s">Active training plan</div></div></div>
            <div class="ks-plan-meta">
                ${plan.level ? `<span><i class="fas fa-signal"></i> ${this._esc(plan.level)}</span>` : ''}
                ${plan.frequency ? `<span><i class="fas fa-calendar-week"></i> ${this._esc(plan.frequency)}×/Woche</span>` : ''}
                ${plan.timePerSession ? `<span><i class="fas fa-clock"></i> ${this._esc(plan.timePerSession)} Min</span>` : ''}
                ${weeks ? `<span><i class="fas fa-layer-group"></i> ${weeks} Wochen</span>` : ''}
            </div>
            ${goals ? `<p class="sub" style="margin:10px 0 0"><i class="fas fa-bullseye"></i> ${this._esc(goals)}</p>` : ''}
            <a class="ss-btn ss-btn-ghost" style="margin-top:14px" href="../../personal-training-dashboard.html">Open training plan</a>
        </div>`;
    }
    _nutritionPlanPanel(plan, summary) {
        const d = KS_DISC_MAP.ernaehrung;
        const goal = (summary && summary.goal) || (plan && plan.dailyCalories) || null;
        const today = summary ? summary.calories : null;
        const meals = plan && plan.mealsPerDay;
        const pct = (goal && today != null) ? Math.min(100, Math.round(today / goal * 100)) : null;
        return `
        <div class="ss-panel ks-plan-card" style="--accent:${d.accent};--accent-soft:${d.soft}">
            <div class="ks-plan-card-head"><span class="ic">🥗</span><div><div class="t">Your nutrition plan</div><div class="s">Active plan</div></div></div>
            <div class="ks-plan-meta">
                ${goal ? `<span><i class="fas fa-fire"></i> Ziel ${goal} kcal/Tag</span>` : ''}
                ${meals ? `<span><i class="fas fa-utensils"></i> ${this._esc(meals)} Mahlzeiten/Tag</span>` : ''}
            </div>
            ${pct != null ? `<div class="ss-prog" style="margin-top:12px"><div class="ss-prog-bar"><div class="ss-prog-fill" style="width:${pct}%"></div></div></div><p class="sub" style="margin:6px 0 0">Heute: ${today} / ${goal} kcal</p>` : ''}
            <a class="ss-btn ss-btn-ghost" style="margin-top:14px" href="../../ernaehrungsberatung.html">Open nutrition plan</a>
        </div>`;
    }

    /* ===================== JOURNAL & INSIGHTS ===================== */
    _renderJournal() {
        const log = this.state.log || [];
        return `
        <div class="ss-hero">
            <div class="ss-kicker">Logbook &amp; progress</div>
            <h1>Your body journal</h1>
            <p>${log.length} entries. Every small session is a step toward more vitality.</p>
        </div>
        ${this._insightsBlock()}
        <h3 style="margin:18px 0 12px"><i class="fas fa-feather"></i> Verlauf</h3>
        <div id="ks-journal-list">
            ${log.length === 0
                ? `<div class="ss-empty"><i class="fas fa-feather"></i>Noch keine Einträge. Beginne im Dojo mit deiner Tageseinheit.</div>`
                : log.map(e => {
                    const d = KS_DISC_MAP[e.disc] || KS_DISCIPLINES[0];
                    return `<div class="ss-log-entry" style="--accent:${d.accent};--accent-soft:${d.soft}">
                        <div class="ss-log-meta">
                            <span class="ss-log-tag">${d.icon} ${d.short}</span>
                            <span>${this._fmtDate(e.date)}</span>
                            ${e.trainer ? `<span>· ${this._esc(e.trainer)}</span>` : ''}
                            <span style="color:#e0b04a">· ${e.score}%</span>
                            <span style="color:var(--ss-green)">+${e.xp}</span>
                        </div>
                        ${e.detail ? `<div class="ss-log-text">${this._esc(e.detail)}</div>` : ''}
                    </div>`;
                }).join('')}
        </div>`;
    }
    _afterJournal() { /* statische Insights, keine Bindings nötig */ }

    _insightsBlock() {
        const week = this._weekDays().map(d => d.key);
        const log = this.state.log || [];
        const weekLogs = log.filter(e => week.includes(e.date));
        const perDisc = {}; KS_DISCIPLINES.forEach(d => perDisc[d.id] = 0);
        weekLogs.forEach(e => { if (perDisc[e.disc] != null) perDisc[e.disc]++; });
        const weekSessions = weekLogs.length;
        const weekDaysActive = new Set(weekLogs.map(e => e.date)).size;
        return `
        <div class="ss-panel ks-insights">
            <div class="ks-insights-grid">
                <div class="ks-insight-radar">
                    <h3 style="margin:0 0 8px"><i class="fas fa-chart-area"></i> Balance</h3>
                    ${this._radarSVG()}
                </div>
                <div class="ks-insight-side">
                    <h3 style="margin:0 0 8px"><i class="fas fa-bolt"></i> This week</h3>
                    <div class="ks-week-stats">
                        <div><span class="n">${weekSessions}</span><span class="l">Sessions</span></div>
                        <div><span class="n">${weekDaysActive}</span><span class="l">aktive Tage</span></div>
                        <div><span class="n">${this.state.streak || 0}🔥</span><span class="l">Streak</span></div>
                    </div>
                    <div class="ks-disc-bars">
                        ${KS_DISCIPLINES.map(d => { const max = Math.max(1, ...Object.values(perDisc)); const w = Math.round((perDisc[d.id] / max) * 100); return `<div class="ks-disc-bar" style="--accent:${d.accent}"><span class="lbl">${d.icon}</span><div class="track"><div class="fill" style="width:${perDisc[d.id] ? Math.max(8, w) : 0}%"></div></div><span class="v">${perDisc[d.id]}</span></div>`; }).join('')}
                    </div>
                </div>
            </div>
            <h3 style="margin:18px 0 8px"><i class="fas fa-calendar-days"></i> Your recent weeks</h3>
            ${this._heatmap()}
        </div>`;
    }
    _radarSVG() {
        const cx = 120, cy = 110, R = 84;
        const grades = KS_DISCIPLINES.map(d => this._grade(d.id));
        const maxG = Math.max(1, ...grades);
        const angles = [-90, 0, 90, 180]; // oben, rechts, unten, links
        const pt = (i, r) => { const a = angles[i] * Math.PI / 180; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; };
        const rings = [0.25, 0.5, 0.75, 1].map(f => `<polygon points="${angles.map((_, i) => pt(i, R * f).join(',')).join(' ')}" class="ks-radar-ring"/>`).join('');
        const dataPts = grades.map((g, i) => pt(i, R * (g / maxG)).join(',')).join(' ');
        const labels = KS_DISCIPLINES.map((d, i) => { const [x, y] = pt(i, R + 16); return `<text x="${x}" y="${y}" class="ks-radar-lbl" text-anchor="middle" dominant-baseline="middle">${d.icon}</text>`; }).join('');
        return `
        <svg viewBox="0 0 240 240" class="ks-radar" role="img" aria-label="Balance of the four disciplines">
            ${rings}
            ${angles.map((_, i) => { const [x, y] = pt(i, R); return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" class="ks-radar-axis"/>`; }).join('')}
            <polygon points="${dataPts}" class="ks-radar-data"/>
            ${grades.map((g, i) => { const [x, y] = pt(i, R * (g / maxG)); return `<circle cx="${x}" cy="${y}" r="3.5" class="ks-radar-dot"/>`; }).join('')}
            ${labels}
        </svg>
        <div class="ks-radar-legend">${KS_DISCIPLINES.map((d, i) => `<span style="--accent:${d.accent}">${d.icon} ${d.short} · G${grades[i]}</span>`).join('')}</div>`;
    }
    _heatmap() {
        const weeks = 12;
        const days = new Set(this.state.practiceDays || []);
        const logByDay = {}; (this.state.log || []).forEach(e => { logByDay[e.date] = (logByDay[e.date] || 0) + 1; });
        const today = new Date(); const todayDow = (today.getDay() + 6) % 7;
        const start = new Date(today.getTime() - (todayDow + (weeks - 1) * 7) * 86400000);
        const cols = [];
        for (let w = 0; w < weeks; w++) {
            const cells = [];
            for (let dow = 0; dow < 7; dow++) {
                const dt = new Date(start.getTime() + (w * 7 + dow) * 86400000);
                const key = dt.toISOString().slice(0, 10);
                const future = dt > today;
                const cnt = logByDay[key] || 0;
                const lvl = future ? 'future' : days.has(key) || cnt > 0 ? (cnt >= 3 ? 'l3' : cnt === 2 ? 'l2' : 'l1') : 'l0';
                cells.push(`<span class="ks-hm-cell ${lvl}" title="${key}${cnt ? ' · ' + cnt + ' Einheit(en)' : ''}"></span>`);
            }
            cols.push(`<div class="ks-hm-col">${cells.join('')}</div>`);
        }
        return `<div class="ks-heatmap">${cols.join('')}</div>
        <div class="ks-hm-legend"><span>less</span><span class="ks-hm-cell l0"></span><span class="ks-hm-cell l1"></span><span class="ks-hm-cell l2"></span><span class="ks-hm-cell l3"></span><span>more</span></div>`;
    }

    /* ===================== SESSION-RUNNER ===================== */
    _startTrainer(trainerId) {
        const t = KS_TRAINERS[trainerId];
        if (!t) return;
        this._stopTimer();
        this.currentTrainer = trainerId;
        this.activeDisc = t.disc;
        if (t.type === 'habit') return this._runHabits(t);
        if (t.type === 'breath') return this._runBreath(t);
        return this._runGuided(t);
    }

    _playerShell(t, innerHtml) {
        const d = KS_DISC_MAP[t.disc];
        const main = document.getElementById('ss-main');
        main.innerHTML = `
        <div class="ss-panel ss-player" style="--accent:${d.accent};--accent-soft:${d.soft}">
            <h2>${t.icon} ${t.title}</h2>
            ${t.blurb ? `<p class="sub">${this._esc(t.blurb)}</p>` : ''}
            ${innerHtml}
            <div class="ss-player-controls" style="margin-top:14px">
                <button class="ss-btn ss-btn-ghost" id="ks-stop"><i class="fas fa-xmark"></i> Beenden</button>
            </div>
        </div>`;
        document.getElementById('ks-stop').addEventListener('click', () => { this._stopTimer(); this.go('practice'); });
    }

    _runGuided(t) {
        const R = 110, C = 2 * Math.PI * R;
        const factor = this._intensity(this.currentTrainer);
        const steps = t.steps.map(s => ({ text: s.text, sec: Math.max(5, Math.round(s.sec * factor)) }));
        const total = steps.reduce((a, s) => a + s.sec, 0);
        this._playerShell(t, `
            <div class="ss-ring-wrap">
                <svg width="240" height="240" role="img" aria-label="Timer">
                    <circle class="ss-ring-bg" cx="120" cy="120" r="${R}"></circle>
                    <circle class="ss-ring-fg" id="ks-ring" cx="120" cy="120" r="${R}" stroke-dasharray="${C}" stroke-dashoffset="0"></circle>
                </svg>
                <div class="ss-ring-time" id="ks-time" aria-live="off">${this._mmss(total)}</div>
            </div>
            <div class="ss-instruction" id="ks-instr" aria-live="polite">${this._esc(steps[0].text)}</div>
            <div class="ks-step-count" id="ks-stepc">Step 1 / ${steps.length}</div>`);
        let elapsed = 0, stepIdx = 0, stepEnd = steps[0].sec;
        const ring = document.getElementById('ks-ring');
        const timeEl = document.getElementById('ks-time');
        const instr = document.getElementById('ks-instr');
        const stepc = document.getElementById('ks-stepc');
        this._speak(steps[0].text);
        this.timer = setInterval(() => {
            elapsed++;
            if (timeEl) timeEl.textContent = this._mmss(Math.max(0, total - elapsed));
            if (ring) ring.style.strokeDashoffset = C * (elapsed / total);
            if (elapsed >= stepEnd && stepIdx < steps.length - 1) {
                stepIdx++;
                stepEnd += steps[stepIdx].sec;
                this._haptic('light');
                this._beep();
                this._speak(steps[stepIdx].text);
                if (instr) { instr.style.opacity = 0; setTimeout(() => { instr.textContent = steps[stepIdx].text; instr.style.opacity = 1; }, 320); }
                if (stepc) stepc.textContent = `Step ${stepIdx + 1} / ${steps.length}`;
            }
            if (elapsed >= total) { this._stopTimer(); this._finishSession(t, 100, `${this._fmtDur(total)} guided`); }
        }, 1000);
    }

    async _runBreath(t) {
        this._playerShell(t, `
            <div class="ss-breath-orb" id="ks-orb">Ready</div>
            <div class="ss-instruction" id="ks-instr">Follow the rhythm of the circle.</div>`);
        const orb = document.getElementById('ks-orb');
        const instr = document.getElementById('ks-instr');
        let stopped = false;
        this._breathStop = () => { stopped = true; };
        await this._wait(800, () => stopped);
        for (let r = 0; r < t.breath.repeats && !stopped; r++) {
            for (const ph of t.breath.phases) {
                if (stopped) break;
                if (orb) { orb.className = 'ss-breath-orb ' + ph.action; orb.textContent = `${ph.label} · ${ph.sec}s`; }
                if (instr) instr.textContent = `Round ${r + 1} / ${t.breath.repeats}`;
                this._haptic('light');
                if (ph.action !== 'hold') this._speak(ph.label);
                await this._wait(ph.sec * 1000, () => stopped);
            }
        }
        if (!stopped) this._finishSession(t, 100, `${t.breath.repeats} Breath rounds`);
    }

    _runHabits(t) {
        const today = this._today();
        if (!this.state.habitsToday || this.state.habitsToday.date !== today) this.state.habitsToday = { date: today, checks: {} };
        const saved = this.state.habitsToday.checks[this.currentTrainer] || [];
        this._playerShell(t, `
            <div class="ks-habits" id="ks-habits">
                ${t.habits.map((h, i) => `
                    <label class="ks-habit ${saved[i] ? 'checked' : ''}">
                        <input type="checkbox" data-i="${i}" ${saved[i] ? 'checked' : ''}>
                        <span class="box"><i class="fas fa-check"></i></span>
                        <span class="txt">${this._esc(h)}</span>
                    </label>`).join('')}
            </div>
            <button class="ss-btn ss-btn-primary ss-btn-block" id="ks-habit-save" style="margin-top:16px"><i class="fas fa-check-circle"></i> Enter</button>`);
        const wrap = document.getElementById('ks-habits');
        wrap.querySelectorAll('input').forEach(inp => inp.addEventListener('change', () => inp.closest('.ks-habit').classList.toggle('checked', inp.checked)));
        document.getElementById('ks-habit-save').addEventListener('click', () => {
            const checks = [...wrap.querySelectorAll('input')].map(i => i.checked);
            const done = checks.filter(Boolean).length;
            const pct = Math.round(done / checks.length * 100);
            this.state.habitsToday.checks[this.currentTrainer] = checks;
            this._finishSession(t, pct, `${done}/${checks.length} Gewohnheiten`);
        });
    }

    /* ---------------- Abschluss ---------------- */
    _finishSession(t, pct, detail) {
        pct = Math.max(0, Math.min(100, Math.round(pct)));
        const id = t.disc;
        const base = t.xp || 20;
        const xp = Math.max(4, Math.round(base * (0.5 + pct / 200)));
        const before = this._grade(id);
        const minutes = Math.max(1, Math.round(this._sessionDur(t) / 60));
        this._registerPracticeDay(minutes);
        this.state.disc[id].xp += xp;
        this.state.disc[id].sessions++;
        if (!this.state.disc[id].best) this.state.disc[id].best = {};
        if (!this.state.disc[id].best[this.currentTrainer] || pct > this.state.disc[id].best[this.currentTrainer]) this.state.disc[id].best[this.currentTrainer] = pct;
        const after = this._grade(id);
        this.state.log.unshift({ id: Date.now(), date: this._today(), disc: id, trainer: t.title, score: pct, detail: detail || '', xp });
        this.state.log = this.state.log.slice(0, 120);
        this._save();
        this._chime(after > before);
        if (after > before) { this._haptic('level'); this._celebrate(); } else this._haptic('ok');
        this._showResult(t, pct, xp, detail, after > before, after);
    }

    _showResult(t, score, xp, detail, levelUp, grade) {
        const d = KS_DISC_MAP[t.disc];
        const deg = Math.round(score * 3.6);
        const main = document.getElementById('ss-main');
        const coachMode = !!this._coachActive;
        const remaining = coachMode && this._coachQueue ? this._coachQueue.length : 0;
        main.innerHTML = `
        <div class="ss-panel" style="text-align:center;--accent:${d.accent}">
            <h2>${d.icon} Done</h2>
            <div class="ss-score-circle" style="--deg:${deg}deg"><span class="val">${score}</span></div>
            <p class="sub" style="text-align:center">+${xp} Vitality${detail ? ' · ' + this._esc(detail) : ''}</p>
            ${levelUp ? `<p style="color:#e0b04a;font-weight:600">Aufstieg in Grad ${grade}: ${KS_titleFor(grade)}!</p>` : ''}
            ${coachMode && remaining > 0 ? `<p class="sub">Noch ${remaining} Übung${remaining > 1 ? 'en' : ''} in dieser Einheit.</p>` : ''}
            <div class="ss-player-controls">
                ${coachMode
                    ? `<button class="ss-btn ss-btn-primary" id="ks-coach-cont">${remaining > 0 ? 'Next exercise' : 'Finish session'} <i class="fas fa-arrow-right"></i></button>`
                    : `<button class="ss-btn ss-btn-ghost" id="ks-again">Nochmal</button>
                       <button class="ss-btn ss-btn-primary" id="ks-back">Weiter</button>`}
            </div>
        </div>`;
        if (coachMode) {
            main.querySelector('#ks-coach-cont').addEventListener('click', () => this._runCoachNext());
        } else {
            main.querySelector('#ks-again').addEventListener('click', () => this._startTrainer(this.currentTrainer));
            main.querySelector('#ks-back').addEventListener('click', () => this.go('practice'));
        }
        if (levelUp) this._toast(`Grad ${grade}: ${KS_titleFor(grade)}!`, 'gold');
    }

    /* ===================== HELPERS ===================== */
    _sessionDur(t) {
        if (t.type === 'guided') return t.steps.reduce((a, s) => a + s.sec, 0);
        if (t.type === 'breath') return t.breath.repeats * t.breath.phases.reduce((a, p) => a + p.sec, 0);
        return 60;
    }
    _fmtDur(sec) {
        const m = Math.round(sec / 60);
        return m >= 1 ? `${m} Min` : `${sec} sec`;
    }
    _stopTimer() {
        if (this.timer) { clearInterval(this.timer); this.timer = null; }
        if (this._breathStop) { this._breathStop(); this._breathStop = null; }
        try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) { /* ignore */ }
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
    _norm(s) { return (s == null ? '' : String(s)).trim().toLowerCase().replace(/\s+/g, ' '); }
    _esc(s) { const d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; }
    _mmss(sec) { const m = Math.floor(sec / 60), s = sec % 60; return `${m}:${s.toString().padStart(2, '0')}`; }
    _fmtDate(d) { try { return new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: 'short' }); } catch (e) { return d; } }
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
            if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
            if (!document.getElementById('ks-celebrate-style')) {
                const st = document.createElement('style');
                st.id = 'ks-celebrate-style';
                st.textContent = '@keyframes ksConfFall{0%{transform:translateY(0) rotate(0);opacity:1}100%{transform:translateY(110vh) rotate(var(--rot));opacity:.15}}.ks-conf{position:fixed;top:-16px;width:10px;height:14px;border-radius:2px;z-index:99999;pointer-events:none;will-change:transform;animation:ksConfFall var(--dur) cubic-bezier(.25,.6,.45,1) forwards}';
                document.head.appendChild(st);
            }
            const colors = ['#34d399', '#22d3ee', '#fb923c', '#a78bfa', '#f472b6', '#e0b04a'];
            for (let i = 0; i < 44; i++) {
                const c = document.createElement('div');
                c.className = 'ks-conf';
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
    _speak(text) {
        try {
            if (!this.state.profile || !this.state.profile.voice) return;
            if (!('speechSynthesis' in window)) return;
            speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(String(text).replace(/<[^>]*>/g, ''));
            u.lang = 'de-DE'; u.rate = 1.0; u.pitch = 1.0; u.volume = 0.9;
            speechSynthesis.speak(u);
        } catch (e) { /* ignore */ }
    }
    _beep() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const o = ctx.createOscillator(), g = ctx.createGain();
            o.connect(g); g.connect(ctx.destination);
            o.type = 'sine'; o.frequency.value = 880;
            const t0 = ctx.currentTime;
            g.gain.setValueAtTime(0.0001, t0);
            g.gain.exponentialRampToValueAtTime(0.18, t0 + 0.02);
            g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.18);
            o.start(t0); o.stop(t0 + 0.2);
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
    window.koerperschule = new KoerperSchule();
    window.koerperschule.init();
});
