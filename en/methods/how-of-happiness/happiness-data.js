/* =====================================================================
   The How of Happiness · Datenbasis
   Nach Sonja Lyubomirsky, "The How of Happiness" (dt. "Being happy").
   Enthält: Glückskuchen, Subjective Happiness Scale, Fit-Diagnostik-
   Dimensionen, die 12 Glücksaktivitäten mit je 4–6 konkreten Übungen
   (Dauer, Dosierung, Prompts, Timer), die "Five Hows" und Querverweise
   auf bestehende Methoden der Persönlichkeitsentwicklung.
   ===================================================================== */
(function (global) {
    'use strict';

    const PIE = [
        { id: 'setpoint', label: 'Genetic setpoint', pct: 50, color: '#cbd5e1', d: 'Your innate happiness level – twin studies show: about half the differences between people are inherited. Little you can change here.' },
        { id: 'circ', label: 'Life circumstances', pct: 10, color: '#94a3b8', d: 'Income, place, looks, marital status – surprisingly small, because we adapt to almost everything (hedonic adaptation).' },
        { id: 'activity', label: 'Intentional activity', pct: 40, color: '#f59e0b', d: 'What you think and do each day. This piece is changeable – this method starts right here.' }
    ];

    /* Subjective Happiness Scale (Lyubomirsky & Lepper, 1999) · 4 Items, 1–7 */
    const SHS = [
        { id: 'shs1', q: 'In general, I consider myself …', lo: 'not a very happy person', hi: 'a very happy person', rev: false },
        { id: 'shs2', q: 'Compared with most people around me, I consider myself …', lo: 'less happy', hi: 'glücklicher', rev: false },
        { id: 'shs3', q: 'Some people are generally very happy. They enjoy life no matter what happens and get the most out of everything. How much does this apply to you?', lo: 'not at all', hi: 'very much', rev: false },
        { id: 'shs4', q: 'Some people are generally not very happy. They are not depressed, but never seem as happy as they could be. How much does this apply to you?', lo: 'not at all', hi: 'very much', rev: true }
    ];

    /* Person-Activity-Fit · 5 Dimensionen, 1–7 */
    const FIT_DIMS = [
        { id: 'nat', label: 'Natural', sign: 1, q: 'I will stick with it because this activity feels natural to me.' },
        { id: 'enj', label: 'Joy', sign: 1, q: 'I will stick with it because I enjoy it – I find it interesting and challenging.' },
        { id: 'val', label: 'Value', sign: 1, q: 'I will stick with it because I value it and identify with it – even when it isn\'t fun.' },
        { id: 'gui', label: 'Guilt', sign: -1, q: 'I will stick with it because otherwise I would feel guilty, ashamed, or anxious – I would have to force myself.' },
        { id: 'sit', label: 'Situation', sign: -1, q: 'I will stick with it because someone else wants it or my situation forces me to.' }
    ];

    /* Die 12 Glücksaktivitäten */
    const ACTIVITIES = [
        {
            id: 'gratitude', n: 1, ic: '🙏', title: 'Expressing gratitude', color: '#f59e0b',
            short: 'Notice the good on purpose – and say it out loud.',
            why: 'Gratitude deepens the savoring of positive experiences, strengthens self-worth, helps with stress, encourages moral behavior, builds relationships, dampens envy, and counters hedonic adaptation.',
            research: 'Emmons & McCullough (2003): people who write down five things they are grateful for each week are more optimistic, more satisfied, and even physically healthier after 10 weeks. Seligman (2005): a gratitude visit lifted mood for a month.',
            dose: 'Journal: 1× per week works better than 3× (habituation!). Letter/visit: every few weeks. Say it directly: small, daily.',
            links: [{ m: 'journaling', l: 'Journaling method' }],
            exercises: [
                { id: 'gr_journal', title: 'Gratitude journal', min: 10, timer: 0, dose: '1× per week', intro: 'Think back over the past week. Note five things you are grateful for – big or small. Important: don\'t just check them off; feel them briefly and say why.', prompts: [
                    { l: '1. What am I grateful for – and why?', p: 'e.g. “For the conversation with Lena – because she really listened to me”' },
                    { l: '2.', p: '' }, { l: '3.', p: '' }, { l: '4.', p: '' }, { l: '5.', p: '' }
                ], tip: 'Vary the life areas (relationships, body, work, nature, small things) so the exercise stays fresh.' },
                { id: 'gr_letter', title: 'Gratitude letter', min: 30, timer: 0, dose: 'every 4–6 weeks', intro: 'Choose someone you have never properly thanked. Write a concrete letter: what did this person do, what did it change in your life, where do you still feel it today?', prompts: [
                    { l: 'To whom?', p: 'Name' },
                    { l: 'What did this person specifically do for me?', p: '' },
                    { l: 'How did it change my life? Where does it still show today?', p: '' },
                    { l: 'The letter', p: 'Dear …' }
                ], tip: 'Whether you send the letter is up to you. The writing alone lifts mood measurably.' },
                { id: 'gr_visit', title: 'Gratitude visit', min: 60, timer: 0, dose: '1× per quarter', intro: 'The strongest gratitude exercise we know: read your letter to the person in person. Plan the time and place – and reflect afterward.', prompts: [
                    { l: 'Whom will I read to? When and where?', p: '' },
                    { l: 'How did the person react?', p: '' },
                    { l: 'How did I feel afterward?', p: '' }
                ], tip: 'Announce only a meeting, not the purpose – the surprise is part of it.' },
                { id: 'gr_say', title: 'Say gratitude out loud', min: 2, timer: 0, dose: 'täglich', intro: 'Today, thank someone specifically – not the polite automatic kind, but for something definite.', prompts: [
                    { l: 'Whom did I thank today, and for what?', p: '' },
                    { l: 'How was the reaction?', p: '' }
                ], tip: 'Formula: “Thank you for … – for me that meant …”' },
                { id: 'gr_subtract', title: 'What if it never happened? (mental subtraction)', min: 10, timer: 0, dose: 'every 2 weeks', intro: 'Choose something good in your life (a person, a skill, a circumstance). Vividly imagine it had never happened. What would your life look like? Then come back – with fresh eyes.', prompts: [
                    { l: 'Which good thing am I taking?', p: '' },
                    { l: 'What would my life be like without it?', p: '' },
                    { l: 'What do I feel now that I have it?', p: '' }
                ], tip: 'Works more strongly than mere “being grateful” because it breaks habituation (Koo et al., 2008).' }
            ]
        },
        {
            id: 'optimism', n: 2, ic: '🌅', title: 'Cultivating optimism', color: '#f97316',
            short: 'See the future in a way that makes you want to act.',
            why: 'Optimism is not sugarcoating; it is the expectation that effort pays off. Optimists pursue goals more persistently, handle setbacks better, and are healthier.',
            research: 'King (2001): 20 minutes of “Best Possible Self” writing on 4 days lifts mood and well-being for weeks. Seligman: optimism can be learned (explanatory style).',
            dose: 'Best Possible Self: 20 min on 4 consecutive days, then refresh 1× per week. Barrier thoughts: as needed.',
            links: [{ m: 'vision-board', l: 'Vision board' }, { m: 'goal-setting', l: 'Goal setting' }],
            exercises: [
                { id: 'op_bps', title: 'My best possible self (Best Possible Self)', min: 20, timer: 20, dose: '4 days in a row, then weekly', intro: 'Imagine your life in 5–10 years. You have worked hard; everything has gone as well as was realistically possible. Write for 20 minutes without stopping – in the present tense, concrete, sensory.', prompts: [
                    { l: 'Which life area today? (work, relationship, health, home, …)', p: '' },
                    { l: 'My best possible self in this area', p: 'It is 2031. I wake up and …' },
                    { l: 'Which of my strengths make this possible?', p: '' }
                ], tip: 'This is not about daydreams; it is about clarifying goals and priorities. One area per session.' },
                { id: 'op_paths', title: 'Goal & pathway thinking', min: 10, timer: 0, dose: 'wöchentlich', intro: 'Hope = goal + several paths + confidence (Snyder). Take a goal and deliberately find three different paths there – and what you do if path 1 is blocked.', prompts: [
                    { l: 'My goal', p: '' },
                    { l: 'Path 1 / Path 2 / Path 3', p: '' },
                    { l: 'If the first path fails, then …', p: '' }
                ], tip: 'Knowing several paths turns obstacles into detours instead of dead ends.' },
                { id: 'op_dispute', title: 'Questioning barrier thoughts', min: 10, timer: 0, dose: 'as needed', intro: 'Pessimistic thoughts are hypotheses, not facts. Treat them like a lawyer: evidence for, evidence against, alternative explanation.', prompts: [
                    { l: 'The pessimistic thought', p: '“I\'ll never manage this because …”' },
                    { l: 'Evidence that supports it', p: '' },
                    { l: 'Evidence that speaks against it', p: '' },
                    { l: 'A more realistic, helpful view', p: '' }
                ], tip: 'Watch for the three P\'s of pessimism: permanent (“always”), pervasive (“everything”), personal (“only me”).' },
                { id: 'op_silver', title: 'Looking for the silver lining', min: 5, timer: 0, dose: 'after setbacks', intro: 'Not everything is good – but almost everything holds something useful. Find the silver lining in today\'s annoyance.', prompts: [
                    { l: 'What went wrong today?', p: '' },
                    { l: 'What is good about it anyway / what did I learn?', p: '' },
                    { l: 'Which door does this open?', p: '' }
                ], tip: 'Say it out loud: “This is annoying – and at the same time …”' }
            ]
        },
        {
            id: 'overthinking', n: 3, ic: '🌀', title: 'Avoiding rumination & comparisons', color: '#64748b',
            short: 'Step out of the thought loop.',
            why: 'Rumination deepens sadness, distorts thinking, freezes problem-solving, and drives supporters away. Upward social comparisons make you dissatisfied – no matter how well you are doing.',
            research: 'Nolen-Hoeksema: ruminators are more prone to depression and solve problems less well. Lyubomirsky: happy people barely use social comparisons as a yardstick.',
            dose: 'Distraction immediately when rumination starts. Rumination appointment max. 1× daily, 30 min. Comparison detox: briefly, daily.',
            links: [{ m: 'mindfulness', l: 'Mindfulness & meditation' }, { m: 'stress-management', l: 'Stress management' }],
            exercises: [
                { id: 'ov_distract', title: 'Distraction toolbox', min: 15, timer: 15, dose: 'when rumination starts', intro: 'You cannot think rumination away, but you can interrupt it. Choose an absorbing activity (movement, music, tidying, a call, a puzzle) and stay with it for 15 minutes.', prompts: [
                    { l: 'What am I circling on right now?', p: '' },
                    { l: 'My distraction for the next 15 min', p: '' },
                    { l: 'Rumination intensity afterward (1–10)', p: '' }
                ], tip: 'TV and scrolling don\'t count – they don\'t absorb enough.' },
                { id: 'ov_stop', title: '“Stop!” technique', min: 1, timer: 0, dose: 'jederzeit', intro: 'As soon as you catch yourself ruminating: say inwardly (or out loud) “Stop!”, picture a red stop sign, take three deep breaths – and deliberately shift attention to something concrete in the room.', prompts: [
                    { l: 'How often used today? What helped?', p: '' }
                ], tip: 'A rubber band on the wrist can serve as a physical anchor.' },
                { id: 'ov_appointment', title: 'Rumination appointment', min: 30, timer: 30, dose: 'max. 1× daily', intro: 'Give rumination a fixed slot: 30 minutes in which you write down all your worries. If a worry appears outside that: “Not now – at 6 p.m.”', prompts: [
                    { l: 'All worries, unfiltered', p: '' },
                    { l: 'Which of these can I influence?', p: '' },
                    { l: 'First small step for one of them', p: '' }
                ], tip: 'End the appointment on time – even mid-sentence.' },
                { id: 'ov_step', title: 'Smallest first step', min: 10, timer: 0, dose: 'when problems arise', intro: 'Rumination feels like problem-solving, but it isn\'t. The way out: a tiny action. What can you do in the next 10 minutes that makes the problem 1% smaller?', prompts: [
                    { l: 'The problem in one sentence', p: '' },
                    { l: 'My 10-minute step', p: 'e.g. “Write an email draft”' },
                    { l: 'Done? How does it feel?', p: '' }
                ], tip: 'Action beats analysis – almost always.' },
                { id: 'ov_compare', title: 'Comparison detox', min: 5, timer: 0, dose: 'daily in the evening', intro: 'Where did you compare yourself with others today (social media, colleagues, friends)? Replace the outside yardstick with your own.', prompts: [
                    { l: 'Where did I compare myself today?', p: '' },
                    { l: 'Which trigger could I reduce?', p: 'e.g. Instagram before sleep' },
                    { l: 'My own yardstick: Did I get further today than yesterday?', p: '' }
                ], tip: 'Compare yourself with your earlier self – that is the only fair comparison.' }
            ]
        },
        {
            id: 'kindness', n: 4, ic: '💛', title: 'Practicing kindness', color: '#eab308',
            short: 'Do good – on purpose, with variety, and in a cluster.',
            why: 'Good deeds let you experience yourself as generous and capable, build relationships, trigger gratitude and reciprocity, and pull attention off your own problems.',
            research: 'Lyubomirsky et al. (2005): five good deeds on a single day per week raise happiness clearly – spread across the week, the effect fizzles. Variety in the deeds prevents habituation.',
            dose: 'Kindness Day: 5 deeds on one day, 1× per week. Change the type of deeds every few weeks.',
            links: [{ m: 'values-clarification', l: 'Values clarification' }],
            exercises: [
                { id: 'ki_day', title: 'Kindness Day – 5 good deeds', min: 60, timer: 0, dose: '1× per week', intro: 'Pick a day. Do five things for others that go beyond your usual behavior – big or small, for people you know or strangers.', prompts: [
                    { l: '1. good deed', p: 'e.g. coffee for the person behind me' },
                    { l: '2.', p: '' }, { l: '3.', p: '' }, { l: '4.', p: '' }, { l: '5.', p: '' },
                    { l: 'How did I feel afterward?', p: '' }
                ], tip: 'Five on one day – not one per day. The clustering makes the difference.' },
                { id: 'ki_random', title: 'Random act of kindness', min: 5, timer: 0, dose: 'spontaneous', intro: 'An unexpected kindness for someone who cannot give it back or does not expect it.', prompts: [
                    { l: 'What did I do, for whom?', p: '' },
                    { l: 'Reaction / how I felt', p: '' }
                ], tip: 'Anonymous deeds often work most strongly on you yourself.' },
                { id: 'ki_chain', title: 'Kindness chain (Pay it forward)', min: 10, timer: 0, dose: 'monatlich', intro: 'Has someone helped you recently? Pass it on to a third person – and tell them why.', prompts: [
                    { l: 'What kindness was done for me?', p: '' },
                    { l: 'Whom do I pass it on to – how?', p: '' }
                ], tip: 'Kindness is contagious: recipients become more generous themselves (Fowler & Christakis).' },
                { id: 'ki_volunteer', title: 'Giving time (volunteering)', min: 120, timer: 0, dose: 'monthly or more often', intro: 'Regular engagement is one of the most stable sources of happiness – especially when it fits your strengths. Plan it concretely.', prompts: [
                    { l: 'Where / for whom do I want to get involved?', p: '' },
                    { l: 'Which of my strengths will I use?', p: '' },
                    { l: 'Next concrete step (appointment, call)', p: '' }
                ], tip: 'From about 100 hours per year, studies show clear well-being effects.' },
                { id: 'ki_reflect', title: 'Compassion reflection', min: 5, timer: 0, dose: 'after good deeds', intro: 'Look back at your good deeds this week. What did they do to you? What to the others?', prompts: [
                    { l: 'Which deed moved me the most?', p: '' },
                    { l: 'How do I see myself after this week?', p: '' }
                ], tip: 'Reflecting anchors the identity “I am a generous person.”' }
            ]
        },
        {
            id: 'relationships', n: 5, ic: '🤝', title: 'Nurturing social relationships', color: '#ec4899',
            short: 'Invest on purpose in the strongest source of happiness.',
            why: 'All very happy people have one thing in common: close, reliable relationships. Relationships buffer stress and are a source of meaning, joy, and health.',
            research: 'Diener & Seligman (2002): the happiest 10% differ mainly through rich, fulfilling relationships. Gable (2004): active-constructive responding to good news strengthens partnerships more than comfort during bad news.',
            dose: 'At least 5 hours per week of deliberate relationship time (Gottman). ACR: at every piece of good news. Appreciation: daily.',
            links: [{ m: 'nonviolent-communication', l: 'Nonviolent communication' }, { m: 'communication', l: 'Communication' }],
            exercises: [
                { id: 're_time', title: 'Plan a relationship date', min: 10, timer: 0, dose: 'wöchentlich', intro: 'Relationships grow with time. This week, deliberately plan uninterrupted time with someone who matters to you – no phone, no agenda.', prompts: [
                    { l: 'With whom? When? What?', p: '' },
                    { l: 'Afterward: what was the loveliest moment?', p: '' }
                ], tip: 'Gottman\'s “magic 5 hours”: daily goodbye/hello, appreciation, affection, weekly date.' },
                { id: 're_acr', title: 'Respond actively and constructively', min: 5, timer: 0, dose: 'when good news arrives', intro: 'When someone tells you something good: don\'t say “nice” and move on – ask eagerly, share the joy, ask for details. Reflect on one situation today.', prompts: [
                    { l: 'Who told me good news today?', p: '' },
                    { l: 'How did I react?', p: '' },
                    { l: 'How could I have responded actively and constructively / did I respond?', p: '“Tell me – what was the moment like when you found out?”' }
                ], tip: 'The four styles: active-constructive (good), passive-constructive, active-destructive, passive-destructive.' },
                { id: 're_appreciate', title: 'Admiration, appreciation, affection', min: 5, timer: 0, dose: 'täglich', intro: 'Express three things today: something you admire in a person, something you appreciate them for, and a sign of affection.', prompts: [
                    { l: 'Admiration – whom, what?', p: '' },
                    { l: 'Appreciation – whom, for what?', p: '' },
                    { l: 'Affection – how shown?', p: '' }
                ], tip: 'Gottman: stable couples have a ratio of 5 positive to 1 negative interaction.' },
                { id: 're_share', title: 'Sharing your inner world', min: 15, timer: 0, dose: 'wöchentlich', intro: 'Closeness grows through self-disclosure. This week, share with someone you trust something you normally keep to yourself – a wish, a worry, a joy.', prompts: [
                    { l: 'What am I sharing – with whom?', p: '' },
                    { l: 'How did it feel? What came back?', p: '' }
                ], tip: 'Reciprocity: also ask about the other person\'s inner world.' },
                { id: 're_hug', title: 'Hug exercise', min: 2, timer: 0, dose: 'daily, 5 hugs', intro: 'Physical contact releases oxytocin. Goal: five real hugs today (at least 6 seconds) – partner, children, friends, parents.', prompts: [
                    { l: 'How many today? With whom?', p: '' }
                ], tip: 'Study (Lyubomirsky): students with 5 hugs a day over 4 weeks were clearly happier.' },
                { id: 're_conflict', title: 'Fighting fairly', min: 15, timer: 0, dose: 'as needed', intro: 'Conflict is normal – what matters is the how. Avoid the “four horsemen”: criticism, contempt, defensiveness, stonewalling. Prepare a difficult conversation.', prompts: [
                    { l: 'What is this really about (the need behind the anger)?', p: '' },
                    { l: 'Soft startup: “I feel … when … I need …”', p: '' },
                    { l: 'What do I appreciate about the person despite everything?', p: '' }
                ], tip: 'Use nonviolent communication for this too (link above).' }
            ]
        },
        {
            id: 'coping', n: 6, ic: '🛡️', title: 'Developing coping strategies', color: '#0ea5e9',
            short: 'Deal constructively with stress, loss, and trauma.',
            why: 'No one is immune to crises. Happy people differ in how they cope: problem-focused where something can change; emotion-focused where it cannot; and by finding meaning.',
            research: 'Pennebaker: expressive writing about stressful experiences (15–20 min, 3–4 days) improves health, mood, and immune function. Benefit-finding after crises fosters post-traumatic growth.',
            dose: 'Expressive writing: 15–20 min on 3–4 consecutive days. Benefit-finding: once you have enough distance. ABCDE: in the moment.',
            links: [{ m: 'stress-management', l: 'Stress management' }, { m: 'resource-analysis', l: 'Resource analysis' }],
            exercises: [
                { id: 'co_write', title: 'Expressive writing', min: 20, timer: 20, dose: '3–4 days in a row', intro: 'Write for 20 minutes about a stressful experience – your deepest thoughts and feelings about it. Spelling doesn\'t matter, censorship off. Nobody reads it.', prompts: [
                    { l: 'My text', p: 'Just start writing …' },
                    { l: 'After writing: what has become clearer?', p: '' }
                ], tip: 'If it gets too heavy, change the topic. Feeling sad for a short time is normal – the effect arrives with a delay.' },
                { id: 'co_benefit', title: 'Finding meaning & benefit (Benefit-Finding)', min: 10, timer: 0, dose: 'once you have distance', intro: 'Without downplaying the hard part: what did this experience give you – in strength, closeness, priorities, perspective?', prompts: [
                    { l: 'The experience', p: '' },
                    { l: 'What did I learn about myself?', p: '' },
                    { l: 'Which relationships grew from it?', p: '' },
                    { l: 'What has mattered more to me since?', p: '' }
                ], tip: 'This exercise needs timing – not in the middle of an acute crisis.' },
                { id: 'co_choose', title: 'Problem-focused or emotion-focused?', min: 10, timer: 0, dose: 'when stressed', intro: 'The core question: can I change the situation? If yes: solve the problem (plan, steps, help). If no: work with the feeling (acceptance, reframe, distraction, comfort).', prompts: [
                    { l: 'The stressor', p: '' },
                    { l: 'Changeable? What exactly is in my hands?', p: '' },
                    { l: 'My strategy (problem or emotion focus)', p: '' },
                    { l: 'First step today', p: '' }
                ], tip: 'The most common mistakes: ruminating about what cannot change, avoiding what can.' },
                { id: 'co_abcde', title: 'ABCDE disputation', min: 10, timer: 0, dose: 'akut', intro: 'After Ellis/Seligman: A = Adversity (event), B = Belief, C = Consequence (feeling/behavior), D = Disputation (challenge), E = Energization (new energy).', prompts: [
                    { l: 'A – What happened?', p: '' },
                    { l: 'B – What did I tell myself about it?', p: '' },
                    { l: 'C – How did I feel / act?', p: '' },
                    { l: 'D – What evidence speaks against B? Alternative explanation?', p: '' },
                    { l: 'E – How do I feel with the new view?', p: '' }
                ], tip: 'It is not the event that determines the feeling, but the interpretation.' },
                { id: 'co_support', title: 'Activating support', min: 10, timer: 0, dose: 'when under strain', intro: 'Social support is the most effective buffer. Whom do you call today? What exactly do you need – listening, advice, practical help?', prompts: [
                    { l: 'Whom am I contacting?', p: '' },
                    { l: 'What do I need, specifically?', p: '“I don\'t need advice, just a listening ear.”' },
                    { l: 'Done? How was it?', p: '' }
                ], tip: 'Say clearly which kind of support you want – that makes it easier for both.' }
            ]
        },
        {
            id: 'forgiveness', n: 7, ic: '🕊️', title: 'Learning to forgive', color: '#8b5cf6',
            short: 'Let go of the resentment – for you, not for the others.',
            why: 'Forgiveness does not mean forgetting, excusing, or reconciling. It means letting go of your own revenge and avoidance thoughts. People who forgive are less anxious, hostile, and depressed – and physically healthier.',
            research: 'Worthington (REACH model): structured forgiveness interventions measurably lower resentment and stress. McCullough: forgiveness correlates with life satisfaction and better relationships.',
            dose: 'Deep resentment: forgiveness letter + REACH over 2–3 weeks. Small slights: empathy exercise immediately.',
            links: [{ m: 'nonviolent-communication', l: 'Nonviolent communication' }, { m: 'emotional-intelligence', l: 'Emotional intelligence' }],
            exercises: [
                { id: 'fo_received', title: 'Remembering how I was forgiven', min: 10, timer: 0, dose: 'to start', intro: 'Think of a situation where you hurt someone and were forgiven. How did it feel? What did it make possible?', prompts: [
                    { l: 'The situation', p: '' },
                    { l: 'How did the forgiveness feel?', p: '' },
                    { l: 'What do I take from that for my own forgiving?', p: '' }
                ], tip: 'This makes forgiveness something you have already experienced – not an abstract ideal.' },
                { id: 'fo_letter', title: 'Forgiveness letter (do not send)', min: 20, timer: 0, dose: 'for deep resentment', intro: 'Write to the person who hurt you. Describe what happened and how it hit you. Then: one sentence of understanding, and the decision to let go of the resentment.', prompts: [
                    { l: 'To whom? What happened?', p: '' },
                    { l: 'How did it hit me – then and now?', p: '' },
                    { l: 'What do I understand (not: condone) about their behavior?', p: '' },
                    { l: 'My decision', p: '“I choose to let go of the resentment because …”' }
                ], tip: 'Do not send it. The letter is for you.' },
                { id: 'fo_empathy', title: 'Perspective shift', min: 10, timer: 0, dose: 'for slights', intro: 'Put yourself in the other person\'s place: what pressure, what fear, what history did they have? What explanation besides malice is possible?', prompts: [
                    { l: 'The slight', p: '' },
                    { l: 'How might the situation have looked from their side?', p: '' },
                    { l: 'A generous explanation', p: '' }
                ], tip: 'Understanding is not agreeing. It mainly lightens your load.' },
                { id: 'fo_reach', title: 'Working through the REACH model', min: 25, timer: 0, dose: 'for deep resentment', intro: 'Worthington\'s five steps: Recall, Empathize, Altruistic gift (forgiveness as a gift), Commit (state it publicly), Hold (stick with it).', prompts: [
                    { l: 'R – Recall, as factually as you can', p: '' },
                    { l: 'E – Empathize: why might they have acted that way?', p: '' },
                    { l: 'A – Altruistic gift: when was I forgiven? Can I pass that gift on?', p: '' },
                    { l: 'C – Commit: my forgiveness sentence', p: '“I have forgiven … for …”' },
                    { l: 'H – Hold: what do I do when the resentment comes back?', p: '' }
                ], tip: 'Forgiveness is a process, not an event. Returning resentment does not mean you failed.' },
                { id: 'fo_hold', title: 'Forgiveness reminder', min: 3, timer: 0, dose: 'when resentment returns', intro: 'Resentment thoughts come back. Remember your decision – read your forgiveness sentence, breathe, let the thought pass.', prompts: [
                    { l: 'What triggered the resentment?', p: '' },
                    { l: 'My forgiveness sentence (again)', p: '' }
                ], tip: 'Feeling resentment is not a relapse. Feeding it would be.' }
            ]
        },
        {
            id: 'flow', n: 8, ic: '🌊', title: 'Increasing flow experiences', color: '#06b6d4',
            short: 'Become fully absorbed in an activity.',
            why: 'Flow (Csikszentmihalyi) is the state of complete immersion in which time and self disappear. It arises when challenge and skill are both high and in balance. Flow-rich lives are more fulfilling – not during flow, but because of it.',
            research: 'Csikszentmihalyi (ESM studies): people experience more flow at work than in leisure – and in leisure they are often apathetic (TV). Active leisure raises well-being.',
            dose: 'Daily at least one flow block (25–45 min) without interruption. Weekly: replace one passive leisure activity with an active one.',
            links: [{ m: 'time-management', l: 'Time management' }, { m: 'gallup-strengths', l: 'Strengths analysis' }],
            exercises: [
                { id: 'fl_inventory', title: 'Flow inventory', min: 10, timer: 0, dose: 'to start', intro: 'When were you last so absorbed that you forgot the time? Find three situations – and their common thread.', prompts: [
                    { l: 'Flow situation 1 / 2 / 3', p: '' },
                    { l: 'Common thread (activity, setting, people, time of day)?', p: '' },
                    { l: 'How do I bring more of this into my week?', p: '' }
                ], tip: 'Flow tells you what truly grips you – often a clue to your strengths.' },
                { id: 'fl_calibrate', title: 'Calibrating challenge ↔ skill', min: 10, timer: 0, dose: 'when bored/overwhelmed', intro: 'Boredom = skill > challenge. Anxiety = challenge > skill. Flow = both high & in balance. Adjust a current task.', prompts: [
                    { l: 'The task', p: '' },
                    { l: 'Too easy or too hard?', p: '' },
                    { l: 'How do I raise the challenge (time limit, quality, complexity) or build skill (learning, help, smaller steps)?', p: '' }
                ], tip: 'Small adjustments are enough: a time limit, a quality bar, a rule you set yourself.' },
                { id: 'fl_transform', title: 'Turning a routine task into flow', min: 10, timer: 0, dose: 'wöchentlich', intro: 'Ironing, commuting, dishes, emails: turn a routine into a game – with micro-goals, clear rules, and immediate feedback.', prompts: [
                    { l: 'The routine', p: '' },
                    { l: 'Micro-goal / rule / feedback', p: 'e.g. “All emails in 20 min, each under 3 sentences”' },
                    { l: 'Tried it? How was it?', p: '' }
                ], tip: 'The activity does not change – your attention does.' },
                { id: 'fl_block', title: 'Flow block', min: 45, timer: 45, dose: 'täglich', intro: 'A block of undisturbed immersion: one task, a clear goal, all notifications off, timer on. Then rate it briefly.', prompts: [
                    { l: 'Task & goal for this block', p: '' },
                    { l: 'Did you experience flow? (1–10) What got in the way / helped?', p: '' }
                ], tip: 'Flow needs about 15 minutes of ramp-up. Every interruption resets the clock.' },
                { id: 'fl_leisure', title: 'Smarter leisure', min: 10, timer: 0, dose: 'wöchentlich', intro: 'Passive leisure (TV, scrolling) feels restful but produces apathy. This week, replace one passive hour with an active one: making music, sport, cooking, reading, making things, playing.', prompts: [
                    { l: 'Which passive hour am I replacing?', p: '' },
                    { l: 'With what?', p: '' },
                    { l: 'How was the difference?', p: '' }
                ], tip: 'Active leisure costs start-up energy – so plan it, don\'t decide on the spot.' }
            ]
        },
        {
            id: 'savoring', n: 9, ic: '🍯', title: 'Savoring joys', color: '#d97706',
            short: 'Lengthen, deepen, and share the positive on purpose.',
            why: 'Savoring is the ability to notice, amplify, and extend positive experiences – in the past (remembering), the present (enjoying), and the future (anticipation). It is the antidote to hedonic adaptation.',
            research: 'Bryant & Veroff: people who deliberately savor everyday joys are happier and less depressed. Reminiscence exercises (positive memories 10 min/day, 1 week) lift mood.',
            dose: 'Savor the ordinary: daily 1× on purpose. Memory journey: 10 min, several times a week. Anticipation: plan weekly.',
            links: [{ m: 'mindfulness', l: 'Mindfulness & meditation' }, { m: 'sinnesschule', l: 'Sensory school' }],
            exercises: [
                { id: 'sa_ordinary', title: 'Savoring the ordinary', min: 5, timer: 5, dose: 'täglich', intro: 'Choose an everyday joy – the first coffee, the shower, the way to work. Live it for 5 minutes with all your senses, slower than usual. Nothing on the side.', prompts: [
                    { l: 'What did I savor?', p: '' },
                    { l: 'What did I notice that I usually miss?', p: '' }
                ], tip: 'Tell yourself inwardly what you notice: “Warmth of the cup. Aroma. First sip.”' },
                { id: 'sa_album', title: 'Savoring album', min: 5, timer: 0, dose: 'one entry daily', intro: 'Capture a beautiful moment of the day – as a photo, a sentence, or a sketch. Not for others, for you. Flip back through it weekly.', prompts: [
                    { l: 'The moment of the day', p: '' },
                    { l: 'Why was it beautiful?', p: '' }
                ], tip: 'Capturing it on purpose changes the experience itself – you actively look for beauty.' },
                { id: 'sa_reminisce', title: 'Memory journey', min: 10, timer: 10, dose: '3× per week', intro: 'Close your eyes. Go back to one of the happiest moments of your life. Where are you? Who is there? What do you see, hear, smell? Stay there for 10 minutes.', prompts: [
                    { l: 'Which memory?', p: '' },
                    { l: 'Which details surfaced?', p: '' }
                ], tip: 'Don\'t analyze (“Why was it so beautiful?”) – that kills the effect. Just experience it.' },
                { id: 'sa_celebrate', title: 'Celebrating & sharing good news', min: 10, timer: 0, dose: 'when you succeed', intro: 'Something good happened? Don\'t just check it off. Tell someone in detail, celebrate it concretely – a meal, a call, a glass. Sharing doubles the joy.', prompts: [
                    { l: 'The good news', p: '' },
                    { l: 'Shared with whom, celebrated how?', p: '' }
                ], tip: 'Gable: experiences you share are remembered better and felt more strongly.' },
                { id: 'sa_anticipate', title: 'Planning anticipation', min: 10, timer: 0, dose: 'wöchentlich', intro: 'Anticipation is often more intense than the event. Plan something nice for the coming week and picture it in detail.', prompts: [
                    { l: 'What am I looking forward to – when?', p: '' },
                    { l: 'How do I picture it, specifically?', p: '' }
                ], tip: 'Small, frequent joys beat rare big ones – better to plan three small ones than one huge one.' },
                { id: 'sa_bittersweet', title: 'Bittersweet: the last time', min: 5, timer: 0, dose: 'gelegentlich', intro: 'Imagine you are experiencing something familiar for the last time today – a conversation, a walk, an evening. How does that change your attention?', prompts: [
                    { l: 'What did I imagine as a “last time”?', p: '' },
                    { l: 'What became more precious because of that?', p: '' }
                ], tip: 'Kurtz (2008): students who consciously treated their last weeks of college as finite were happier.' }
            ]
        },
        {
            id: 'goals', n: 10, ic: '🎯', title: 'Committing to goals', color: '#10b981',
            short: 'The right goals – and sticking with them.',
            why: 'People with meaningful goals are happier – not only when they arrive, but along the way. Goals give structure, meaning, self-efficacy. But: only certain kinds of goals make you happy.',
            research: 'Sheldon & Lyubomirsky: happiness-promoting goals are intrinsic (not money/status), authentic (your own values), approach rather than avoidance goals, harmonious with each other, and activity-based (not circumstances). Gollwitzer: if-then plans double the follow-through rate.',
            dose: 'Goal check: for each new goal. If-then plans: for each sub-goal. Progress sentence: weekly.',
            links: [{ m: 'goal-setting', l: 'Goal setting (SMART)' }, { m: 'ikigai', l: 'Ikigai' }, { m: 'values-clarification', l: 'Values clarification' }],
            exercises: [
                { id: 'go_check', title: 'Goal check: does this goal make you happy?', min: 10, timer: 0, dose: 'per goal', intro: 'Check a current goal against the five criteria for happiness-promoting goals. The more yeses, the more it is worth it.', prompts: [
                    { l: 'The goal', p: '' },
                    { l: 'Intrinsic? (growth, relationship, contribution instead of money, status, looks)', p: 'Yes / No – because …' },
                    { l: 'Authentic? (mine, not expected of me)', p: '' },
                    { l: 'Approach instead of avoidance? (“Get fit” instead of “don\'t get fat”)', p: '' },
                    { l: 'Harmonious with my other goals?', p: '' },
                    { l: 'Activity instead of circumstance? (“Run three times a week” instead of “10 kg less”)', p: '' }
                ], tip: 'You can almost always rephrase avoidance goals as approach goals.' },
                { id: 'go_sub', title: 'Sub-goals & milestones', min: 15, timer: 0, dose: 'per goal', intro: 'Big goals paralyze. Break your goal into sub-goals you can reach in 1–2 weeks – each one a small win.', prompts: [
                    { l: 'The goal', p: '' },
                    { l: 'Sub-goal 1 (this week)', p: '' },
                    { l: 'Sub-goal 2 / 3 / 4', p: '' },
                    { l: 'How will I notice progress?', p: '' }
                ], tip: 'A sense of progress is the strongest motivator (Amabile: “Progress Principle”).' },
                { id: 'go_ifthen', title: 'If-then plans', min: 10, timer: 0, dose: 'per sub-goal', intro: 'Implementation intentions (Gollwitzer): “If [situation], then [action].” Also plan obstacles: “If I don\'t feel like it, then …”', prompts: [
                    { l: 'If … (concrete situation, time, place)', p: 'e.g. “When I get home on Tuesday at 6 p.m.”' },
                    { l: '… then … (concrete action)', p: 'e.g. “I put on my running shoes right away”' },
                    { l: 'Obstacle plan: If [obstacle], then …', p: '' }
                ], tip: 'The more concrete the trigger, the more automatic the action.' },
                { id: 'go_progress', title: 'Weekly progress sentence', min: 5, timer: 0, dose: 'wöchentlich', intro: 'One sentence per goal: what happened this week? What is the next step? No judgment, just movement.', prompts: [
                    { l: 'Goal → progress this week', p: '' },
                    { l: 'Next step', p: '' },
                    { l: 'Do I need to adjust the goal?', p: '' }
                ], tip: 'Flexibility belongs here: goals may change when you change.' }
            ]
        },
        {
            id: 'spirituality', n: 11, ic: '✨', title: 'Spirituality & meaning', color: '#a855f7',
            short: 'Being connected to something larger.',
            why: 'Religious and spiritual people are on average happier, healthier, and cope better with crises – probably through meaning, community, rituals, gratitude, and awe. It also works without a denomination: it is about the sacred in everyday life.',
            research: 'Pargament: “Sanctification” – experiencing the everyday as sacred – correlates with well-being. Keltner: awe makes people more generous, humbler, and more content.',
            dose: 'Silence/meditation/prayer: daily 10 min. Meaning reflection: weekly. Awe-walk: weekly.',
            links: [{ m: 'ikigai', l: 'Ikigai' }, { m: 'values-clarification', l: 'Values clarification' }, { m: 'mindfulness', l: 'Mindfulness & meditation' }],
            exercises: [
                { id: 'sp_meaning', title: 'Meaning reflection', min: 10, timer: 0, dose: 'wöchentlich', intro: 'Three questions that make meaning visible – without forcing big answers.', prompts: [
                    { l: 'What am I here for? (What would not be here if I were not?)', p: '' },
                    { l: 'When did I sense meaning this week?', p: '' },
                    { l: 'What is larger than me that I belong to?', p: '' }
                ], tip: 'Meaning is more something you discover than something you invent.' },
                { id: 'sp_still', title: 'Silence · Meditation · Prayer', min: 10, timer: 10, dose: 'täglich', intro: 'Ten minutes of doing nothing – in your tradition: pray, meditate, or simply sit still and breathe. Timer on, eyes closed.', prompts: [
                    { l: 'What surfaced in the silence?', p: '' }
                ], tip: 'There is no right way. Thoughts come – let them pass and return to the breath.' },
                { id: 'sp_read', title: 'Spiritual reading', min: 10, timer: 0, dose: 'wöchentlich', intro: 'Read for ten minutes in a text that connects you to something larger – sacred writings, philosophy, poetry, wisdom literature. Take one thought with you.', prompts: [
                    { l: 'What did I read?', p: '' },
                    { l: 'The thought I am taking with me', p: '' }
                ], tip: 'One sentence that lands is worth more than ten pages.' },
                { id: 'sp_sanctify', title: 'Sanctifying the everyday', min: 5, timer: 0, dose: 'täglich', intro: 'Choose an ordinary action – cooking, putting the kids to bed, work – and do it today as if it were meaningful, a service, a ritual.', prompts: [
                    { l: 'Which action?', p: '' },
                    { l: 'How did the experience change?', p: '' }
                ], tip: 'The action is not sacred – the attitude makes it so.' },
                { id: 'sp_awe', title: 'Awe-walk (awe in nature)', min: 15, timer: 15, dose: 'wöchentlich', intro: 'Go outside for 15 minutes with the intention to wonder: sky, trees, expanse, details. Like a child seeing everything for the first time.', prompts: [
                    { l: 'What made me wonder?', p: '' },
                    { l: 'How do I feel compared with before?', p: '' }
                ], tip: 'Sturm et al. (2020): weekly awe-walks over 8 weeks raise positive emotions and lower stress.' },
                { id: 'sp_community', title: 'Seeking community', min: 60, timer: 0, dose: 'monatlich', intro: 'Spirituality works more strongly in community – a service, a meditation group, a choir, a philosophy circle. Plan a visit.', prompts: [
                    { l: 'Which community fits me?', p: '' },
                    { l: 'When am I going?', p: '' },
                    { l: 'How was it?', p: '' }
                ], tip: 'The social component explains a large part of religion\'s happiness effect.' }
            ]
        },
        {
            id: 'body', n: 12, ic: '🧘', title: 'Taking care of the body', color: '#22c55e',
            short: 'Meditate, move, act like a happy person.',
            why: 'The body is the fastest path to mood. Meditation demonstrably changes the brain, movement works as well as medication for mild depression, and physical “as-if” behavior (smiling, posture) colors the experience.',
            research: 'Davidson & Kabat-Zinn (2003): 8 weeks of mindfulness increase left-prefrontal activity (positive emotions) and immune response. Babyak (2000): 30 min of movement 3×/week as effective as antidepressants – with a lower relapse rate.',
            dose: 'Meditation: daily 10–20 min. Movement: 30 min, 3× per week (daily is better). As-if: anytime.',
            links: [{ m: 'koerperschule', l: 'Body school' }, { m: 'mindfulness', l: 'Mindfulness & meditation' }],
            exercises: [
                { id: 'bo_meditate', title: 'Meditation', min: 10, timer: 10, dose: 'täglich', intro: 'Sit upright, close your eyes, attention on the breath. When thoughts come (they will), return kindly. 10 minutes.', prompts: [
                    { l: 'How was it? How often did you drift? Doesn\'t matter – what changed?', p: '' }
                ], tip: 'Consistency beats duration: 10 minutes daily works more than 60 minutes once a week.' },
                { id: 'bo_move', title: 'Movement (30 minutes)', min: 30, timer: 30, dose: '3× per week or more', intro: 'Any movement that raises your pulse counts: brisk walking, running, bike, swimming, dancing. Outdoors works twice.', prompts: [
                    { l: 'What did I do?', p: '' },
                    { l: 'Mood before → after (1–10)', p: '' }
                ], tip: 'The mood lift comes immediately – use it as the reward, not the fitness three months from now.' },
                { id: 'bo_actasif', title: 'Acting like a happy person', min: 2, timer: 2, dose: 'jederzeit', intro: 'Facial feedback: smile for 60 seconds (even without a reason), stand tall, walk with energy, speak with warmth. Your body tells your brain how you are.', prompts: [
                    { l: 'What did I try? Did something change?', p: '' }
                ], tip: 'It works best quietly and often – not as a one-off experiment.' },
                { id: 'bo_laugh', title: 'Laughing (on purpose)', min: 5, timer: 0, dose: 'täglich', intro: 'Today, actively look for something to laugh at: a video, a comic, a call to someone who makes you laugh. Laughing lowers stress hormones and connects people.', prompts: [
                    { l: 'What did I laugh about today?', p: '' }
                ], tip: 'Laughing is 30× more likely in company – use it socially.' },
                { id: 'bo_sleep', title: 'Sleep check', min: 5, timer: 0, dose: 'wöchentlich', intro: 'Too little sleep is a quiet happiness killer. How were the last nights? What stands in the way of a better night?', prompts: [
                    { l: 'Avg. hours of sleep this week', p: '' },
                    { l: 'Biggest disruptor', p: 'e.g. screen late, caffeine, rumination' },
                    { l: 'One change for this week', p: '' }
                ], tip: 'A consistent bedtime works more strongly than sleep duration.' }
            ]
        }
    ];

    /* The five hows nachhaltigen Glücks */
    const HOWS = [
        { id: 'emotion', ic: '😊', title: 'Positive emotions', q: 'After the exercises, do I actually feel more joy, calm, gratitude, curiosity? (Only what feels good lasts.)', d: 'Positive emotions are the mechanism: they broaden thinking and action and build resources (Fredrickson). Your mood deltas in the log show it.' },
        { id: 'timing', ic: '⏱️', title: 'Timing & variety', q: 'Do I vary exercises and times – or do I always do the same thing at the same time?', d: 'Hedonic adaptation is the enemy. Antidote: the right dose (e.g. gratitude 1× instead of 3×/week) and variety in type, place, and form.' },
        { id: 'social', ic: '👥', title: 'Social support', q: 'Does anyone know about my intention? Do I have someone I exchange with?', d: 'People who share their intention or practice together stick with it far more. Tell someone what you are doing – or invite someone to join.' },
        { id: 'effort', ic: '🔥', title: 'Motivation, effort, commitment', q: 'Is it clear to me why I am doing this? Am I willing to practice even on days when I don\'t feel like it?', d: 'Happiness is work – in the sense of a musical instrument: those who practice get better. The decision to want to become happier is itself already a predictor.' },
        { id: 'habit', ic: '🔁', title: 'Gewohnheit', q: 'Is the exercise tied to a fixed trigger so I don\'t have to decide anew each time?', d: 'Automate the decision (“after brushing my teeth”), but not the execution – that should stay conscious and fresh. Use the “Habit building” method for this.' }
    ];

    /* Pfade zu bestehenden Methoden (relativ zum Ordner methods/how-of-happiness/) */
    const METHOD_PATHS = {
        'journaling': '../journaling/journaling.html',
        'vision-board': '../vision-board/vision-board.html',
        'goal-setting': '../goal-setting/goal-setting.html',
        'mindfulness': '../mindfulness/mindfulness.html',
        'stress-management': '../stress-management/stress-management.html',
        'values-clarification': '../values-clarification/values-clarification.html',
        'nonviolent-communication': '../nonviolent-communication/nonviolent-communication.html',
        'communication': '../communication/communication.html',
        'resource-analysis': '../resource-analysis/resource-analysis.html',
        'emotional-intelligence': '../emotional-intelligence/emotional-intelligence.html',
        'time-management': '../time-management/time-management.html',
        'gallup-strengths': '../gallup-strengths/gallup-strengths.html',
        'sinnesschule': '../sinnesschule/index-sinnesschule.html',
        'koerperschule': '../koerperschule/index-koerperschule.html',
        'ikigai': '../ikigai/index-ikigai.html',
        'habit-building': '../habit-building/habit-building.html'
    };

    global.HOH_DATA = { PIE, SHS, FIT_DIMS, ACTIVITIES, HOWS, METHOD_PATHS };
})(window);
