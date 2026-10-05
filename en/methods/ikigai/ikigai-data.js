/* Ikigai · Inhalte (Kreise, Leitfragen, Schnittmengen, Reflexion, Links) */
window.IKIGAI_DATA = {
    CIRCLES: [
        {
            id: 'love', ask: 'What about it truly brings you joy – or how could you shape it so that it does?', short: 'Love', label: 'What you love', icon: '❤️', color: '#ef4444',
            lead: 'When do you lose track of time? What would you do even if nobody watched and nobody paid for it?',
            prompts: [
                { k: 'activities', l: 'Which activities bring you the most joy?', h: 'Think of moments full of energy and enthusiasm – regardless of whether you are good at it or someone pays for it.' },
                { k: 'interests', l: 'What are you interested in without anyone having to push you?', h: 'Topics you voluntarily read about, listen to podcasts on or seek conversations about.' },
                { k: 'energy', l: 'When do you feel most alive?', h: 'Flow moments: time flies, you are fully absorbed.' },
                { k: 'child', l: 'What did you love as a child – and what of it is still in you?', h: 'Childhood enthusiasm is often an unfiltered hint at what truly carries you.' }
            ],
            seeds: ['Accompanying people', 'Writing', 'Music', 'Nature', 'Understanding technology', 'Designing', 'Teaching', 'Travelling', 'Cooking', 'Movement', 'Reading', 'Tinkering']
        },
        {
            id: 'good', ask: 'Which skill would you need to build to become really good at it – and how long would that realistically take?', short: 'Skill', label: 'What you are good at', icon: '💪', color: '#3b82f6',
            lead: 'What comes easily to you, what do others admire you for – and what have you worked on for years?',
            prompts: [
                { k: 'talents', l: 'Which talents do you have naturally?', h: 'Things that work for you without much effort and that amaze others.' },
                { k: 'skills', l: 'Which skills have you acquired? Where do you have real expertise?', h: 'Competencies from education, work, projects or years of practice.' },
                { k: 'strengths', l: 'What makes you unique? Which combination hardly anyone else has?', h: 'Strength often lies in the combination: e.g. technical understanding + empathy.' },
                { k: 'asked', l: 'What do others ask you for help or advice on?', h: 'Others as a mirror: what do others trust you with that you take for granted?' }
            ],
            seeds: ['Listening', 'Structuring', 'Explaining', 'Analysing', 'Negotiating', 'Programming', 'Organising', 'Facilitating', 'Writing', 'Networking', 'Designing', 'Staying calm']
        },
        {
            id: 'world', ask: 'Who exactly benefits – and how would you describe the benefit in one sentence?', short: 'World', label: 'What the world needs', icon: '🌍', color: '#10b981',
            lead: 'The world can be your immediate surroundings: team, family, city – or society as a whole.',
            prompts: [
                { k: 'problems', l: 'Which problems occupy you the most?', h: 'Societal, ecological, social or very concrete everyday problems that won’t let you go.' },
                { k: 'people', l: 'For whom exactly do you want to change something?', h: 'The more specific the audience, the more tangible the contribution: “career starters without a network” instead of “everyone”.' },
                { k: 'contribution', l: 'How could you contribute to the solution?', h: 'Which role could you play – not the whole solution, but your part of it.' },
                { k: 'legacy', l: 'How do you want to be remembered?', h: 'Imagine someone describing in 30 years what you achieved.' }
            ],
            seeds: ['Giving orientation', 'Education', 'Health', 'Climate protection', 'Belonging', 'Fair work', 'Digital literacy', 'Mental health', 'Building bridges', 'Simplifying']
        },
        {
            id: 'paid', ask: 'Who would pay for it – and what would be the smallest sellable offer?', short: 'Pay', label: 'What you can be paid for', icon: '💰', color: '#f59e0b',
            lead: 'Not just today’s salary – everything people or organisations are willing to pay for.',
            prompts: [
                { k: 'proof', l: 'What have you been paid for before – even small amounts?', h: 'Jobs, side jobs, fees, tips, things you sold. These are proven willingness to pay.' },
                { k: 'market', l: 'Where are your skills needed? Where is value created?', h: 'Industries, roles, niches – including ones you don’t work in yet.' },
                { k: 'income', l: 'Which income models would be conceivable?', h: 'Employment, freelance, product, course, consulting, licence – several side by side is fine.' },
                { k: 'network', l: 'Who could hire you, recommend you or work with you?', h: 'Names, roles or organisations. Concrete beats vague.' }
            ],
            seeds: ['Consulting', 'Project management', 'Coaching', 'Software', 'Training', 'Writing', 'Design', 'Sales', 'HR', 'Analysis', 'Craft', 'Care']
        }
    ],

    INTERSECTIONS: [
        { id: 'passion', label: 'Passion', of: ['love', 'good'], desc: 'What you love and what you are good at. Fulfilling – but without relevance to the world and income it often stays “just” a hobby.', ask: 'Who benefits concretely, and would someone pay for it?' },
        { id: 'mission', label: 'Mission', of: ['love', 'world'], desc: 'What you love and what the world needs. Meaningful – but without skill and income it remains a wish or volunteer work.', ask: 'Which skill would you need to build, and who would pay for it?' },
        { id: 'vocation', label: 'Vocation', of: ['world', 'paid'], desc: 'What the world needs and what you are paid for. Useful and safe – but with the risk of inner emptiness.', ask: 'What do you truly love about it, and where are you strong in it?' },
        { id: 'profession', label: 'Profession', of: ['good', 'paid'], desc: 'What you are good at and what you are paid for. Comfortable – but often without meaning and joy.', ask: 'Who does it help – and do you still enjoy it?' }
    ],

    REFLECT: [
        { k: 'values', l: 'What are your most important life values?', h: 'What truly matters to you in life – regardless of others’ expectations?', hints: ['Family & relationships', 'Work & impact', 'Health', 'Freedom & autonomy', 'Creativity & expression', 'Meaning & spirituality', 'Security', 'Growth & learning'] },
        { k: 'experiences', l: 'Which experiences have shaped you the most?', h: 'Positive as well as difficult ones. Turning points often reveal what matters to you.', hints: ['Childhood & youth', 'Education', 'Professional successes & failures', 'Relationships', 'Crises overcome', 'Travel & cultures'] },
        { k: 'dreams', l: 'What are your biggest dreams – if money and other people’s opinions didn’t matter?', h: 'Think big. Realism comes later in the action plan.', hints: ['Professionally in 10 years', 'Place & lifestyle', 'Contribution to the world', 'What you want to learn', 'Adventure'] },
        { k: 'fears', l: 'What holds you back?', h: 'Naming fears is the first step to disempowering them.', hints: ['Fear of failure', 'Financial worries', 'Others’ expectations', 'Fear of change', 'Self-doubt', 'Too late, too old, too early'] }
    ],

    HORIZONS: [
        { id: 'short', label: 'Next 3 months', icon: '🌱', hint: 'Small, concrete, in your hands. A conversation, a test, a first offer.' },
        { id: 'mid', label: '6–12 months', icon: '🌿', hint: 'Visible changes: further training, a side project, a change of role.' },
        { id: 'long', label: '2–5 years', icon: '🌳', hint: 'The direction. Where do you stand when you live your ikigai?' }
    ],

    LINKS: [
        { m: 'VIA character strengths', l: '../via-strengths/via-strengths.html', for: 'good', why: 'Deepens “what you are good at” with a validated test.' },
        { m: 'Values clarification', l: '../values-clarification/values-clarification.html', for: 'love', why: 'Sharpens what truly matters to you.' },
        { m: 'RAISEC interests', l: '../raisec/index-raisec.html', for: 'paid', why: 'Shows career fields that match your interests.' },
        { m: 'SWOT analysis', l: '../swot-analysis/swot-analysis.html', for: 'good', why: 'Strengths, weaknesses, opportunities and threats, structured.' },
        { m: 'Vision board', l: '../vision-board/vision-board.html', why: 'Makes your ikigai vision visible.' },
        { m: 'SMART goals', l: '../goal-setting/goal-setting.html', why: 'Translates the action plan into measurable goals.' },
        { m: 'Building habits', l: '../habit-building/habit-building.html', why: 'Anchors first steps in everyday life.' },
        { m: 'How of Happiness', l: '../how-of-happiness/how-of-happiness.html', why: 'Happiness activities that suit you.' }
    ]
};
