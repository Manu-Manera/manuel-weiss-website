/**
 * Singing Trainer – Session Manager, Exercise Runner, Gamification
 */

const API_BASE = 'https://4wtia3o3a8.execute-api.eu-central-1.amazonaws.com/prod';

class SingingTrainer {
    constructor() {
        this.detector = null;
        this.state = {
            view: 'dashboard',
            userId: null,
            currentLevel: 1,
            totalXP: 0,
            streak: 0,
            lastSessionDate: null,
            sessionsCompleted: 0,
            calibration: null,
            levelProgress: {}
        };
        this.session = {
            exercises: [],
            currentIndex: -1,
            totalXP: 0,
            scores: [],
            startTime: null
        };
        this.exercise = {
            currentNoteIndex: 0,
            timer: null,
            elapsed: 0,
            hits: 0,
            total: 0,
            combo: 0,
            maxCombo: 0,
            pitchHistory: []
        };
        this.canvas = null;
        this.canvasCtx = null;
        this.animFrame = null;
    }

    async init() {
        this.state.userId = this._getUserId();
        await this._loadProgress();
        this._renderDashboard();
        this._bindEvents();
    }

    _getUserId() {
        let id = localStorage.getItem('st_userId');
        if (!id) {
            id = 'st_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
            localStorage.setItem('st_userId', id);
        }
        return id;
    }

    // ========================
    // Data persistence
    // ========================

    async _loadProgress() {
        try {
            const cached = localStorage.getItem('st_progress');
            if (cached) {
                Object.assign(this.state, JSON.parse(cached));
            }

            const res = await fetch(`${API_BASE}/singing-trainer/progress?userId=${this.state.userId}`);
            if (res.ok) {
                const data = await res.json();
                if (data.progress) {
                    Object.assign(this.state, data.progress);
                    localStorage.setItem('st_progress', JSON.stringify(this.state));
                }
            }
        } catch (e) {
            console.warn('Could not load remote progress, using local:', e);
        }
        this._updateStreak();
    }

    async _saveProgress() {
        localStorage.setItem('st_progress', JSON.stringify(this.state));
        try {
            await fetch(`${API_BASE}/singing-trainer/progress`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: this.state.userId, ...this.state })
            });
        } catch (e) {
            console.warn('Could not save remote progress:', e);
        }
    }

    _updateStreak() {
        const today = new Date().toISOString().slice(0, 10);
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        if (this.state.lastSessionDate === today) return;
        if (this.state.lastSessionDate === yesterday) return;
        if (this.state.lastSessionDate && this.state.lastSessionDate < yesterday) {
            // ADHS-friendly: streak pauses instead of resetting
        }
    }

    // ========================
    // Dashboard
    // ========================

    _renderDashboard() {
        const main = document.getElementById('st-main');
        if (!main) return;

        const unlockedLevel = this._getUnlockedLevel();
        const exerciseList = getExercisesForLevel(this.state.currentLevel);

        main.innerHTML = `
            <div class="st-view">
                <div class="st-container">
                    <div class="st-stats-bar">
                        <div class="st-stat-card">
                            <span class="st-stat-value">${this.state.totalXP}</span>
                            <span class="st-stat-label">XP Gesamt</span>
                        </div>
                        <div class="st-stat-card">
                            <span class="st-stat-value">
                                ${this.state.streak > 0 ? '<span class="st-streak-flame">🔥</span> ' : ''}${this.state.streak}
                            </span>
                            <span class="st-stat-label">Tage Streak</span>
                        </div>
                        <div class="st-stat-card">
                            <span class="st-stat-value">${this.state.sessionsCompleted}</span>
                            <span class="st-stat-label">Sessions</span>
                        </div>
                        <div class="st-stat-card">
                            <span class="st-stat-value">${LEVEL_INFO[this.state.currentLevel].icon} ${this.state.currentLevel}</span>
                            <span class="st-stat-label">Level</span>
                        </div>
                    </div>

                    <div class="st-dashboard">
                        <div class="st-card">
                            <h3><i class="fas fa-layer-group"></i> Level-Fortschritt</h3>
                            <div class="st-level-track">
                                ${[1,2,3,4,5,6].map(l => `
                                    <div class="st-level-dot ${l <= unlockedLevel ? 'active' : 'locked'}"
                                         title="Level ${l}: ${LEVEL_INFO[l].name} ${l > unlockedLevel ? '(ab ' + LEVEL_INFO[l].xp_required + ' XP)' : ''}">
                                    </div>
                                `).join('')}
                            </div>
                            <div class="st-level-label">
                                Level ${this.state.currentLevel}: ${LEVEL_INFO[this.state.currentLevel].name}
                                ${unlockedLevel < 6 ? ` — ${LEVEL_INFO[unlockedLevel + 1].xp_required - this.state.totalXP} XP bis Level ${unlockedLevel + 1}` : ' — Maximum erreicht!'}
                            </div>
                        </div>

                        <div class="st-card">
                            <h3><i class="fas fa-clock"></i> Session starten</h3>
                            <div class="st-session-config">
                                <div class="st-slider-group">
                                    <label>Dauer: <span class="st-slider-value" id="duration-val">10</span> Min</label>
                                    <input type="range" class="st-slider" id="session-duration" min="5" max="60" step="5" value="10">
                                </div>
                                <button class="st-btn st-btn-primary st-btn-lg" id="btn-start-session">
                                    <i class="fas fa-play"></i> Training starten
                                </button>
                            </div>
                        </div>

                        <div class="st-card st-card-full">
                            <h3><i class="fas fa-list-music"></i> Übungen Level ${this.state.currentLevel}</h3>
                            <ul class="st-exercise-list">
                                ${exerciseList.map(ex => {
                                    const done = this._isExerciseDone(ex.id);
                                    return `
                                    <li class="st-exercise-item ${done ? 'completed' : ''}">
                                        <div class="icon">${done ? '✅' : this._exerciseIcon(ex.type)}</div>
                                        <div class="info">
                                            <div class="title">${ex.title}</div>
                                            <div class="subtitle">${ex.description.slice(0, 60)}…</div>
                                        </div>
                                        <div class="xp">+${ex.xp_reward} XP</div>
                                    </li>`;
                                }).join('')}
                            </ul>
                        </div>
                    </div>

                    ${!this.state.calibration ? `
                    <div style="text-align:center; margin: 2rem 0;">
                        <button class="st-btn st-btn-secondary" id="btn-calibrate">
                            <i class="fas fa-sliders"></i> Stimme kalibrieren
                        </button>
                    </div>` : ''}
                </div>
            </div>
        `;
    }

    _getUnlockedLevel() {
        for (let l = 6; l >= 1; l--) {
            if (this.state.totalXP >= LEVEL_INFO[l].xp_required) return l;
        }
        return 1;
    }

    _isExerciseDone(id) {
        const lp = this.state.levelProgress || {};
        const level = parseInt(id.split('_')[0].replace('l', ''));
        return lp[level] && lp[level].completed && lp[level].completed.includes(id);
    }

    _exerciseIcon(type) {
        const icons = {
            breathing: '🌬️', sustained_tone: '🎵', pitch_match: '🎯',
            glide: '〰️', scale: '🎹', interval: '↕️',
            melody: '🎶', sovt_exercise: '💨'
        };
        return icons[type] || '🎵';
    }

    _bindEvents() {
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('button') || e.target.closest('[id]');
            if (!btn) return;
            if (btn.id === 'btn-start-session') this._startSession();
            if (btn.id === 'btn-calibrate') this._startCalibration();
            if (btn.id === 'btn-next-exercise') this._nextExercise();
            if (btn.id === 'btn-skip') this._nextExercise();
            if (btn.id === 'btn-stop-session') this._endSession();
            if (btn.id === 'btn-back-dashboard') { this._renderDashboard(); }
            if (btn.id === 'btn-bonus-round') this._bonusRound();
        });

        document.addEventListener('input', (e) => {
            if (e.target.id === 'session-duration') {
                const val = document.getElementById('duration-val');
                if (val) val.textContent = e.target.value;
            }
        });
    }

    // ========================
    // Calibration
    // ========================

    async _startCalibration() {
        if (!this.detector) {
            this.detector = new PitchDetector();
            await this.detector.init();
        }

        const main = document.getElementById('st-main');
        main.innerHTML = `
            <div class="st-view">
                <div class="st-container" style="max-width:500px; margin:2rem auto;">
                    <div class="st-modal" style="position:relative;">
                        <h2>Stimmkalibrierung</h2>
                        <div id="cal-step-1" class="st-calibration-step active">
                            <p>Singe den <strong>tiefsten Ton</strong>, den du bequem halten kannst.</p>
                            <div class="st-listening-indicator">
                                <span class="st-listening-dot"></span> Mikrofon aktiv
                            </div>
                            <div class="st-calibration-note" id="cal-current-note">—</div>
                            <div class="st-calibration-timer" id="cal-timer-1">5</div>
                            <button class="st-btn st-btn-primary" id="cal-btn-low">Tiefsten Ton aufnehmen</button>
                        </div>
                        <div id="cal-step-2" class="st-calibration-step">
                            <p>Singe den <strong>höchsten Ton</strong>, den du bequem halten kannst.</p>
                            <div class="st-listening-indicator">
                                <span class="st-listening-dot"></span> Mikrofon aktiv
                            </div>
                            <div class="st-calibration-note" id="cal-current-note-2">—</div>
                            <div class="st-calibration-timer" id="cal-timer-2">5</div>
                            <button class="st-btn st-btn-primary" id="cal-btn-high">Höchsten Ton aufnehmen</button>
                        </div>
                        <div id="cal-step-3" class="st-calibration-step">
                            <div class="st-calibration-note">✅</div>
                            <p id="cal-result"></p>
                            <button class="st-btn st-btn-success" id="btn-back-dashboard">Fertig</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this._runCalibration();
    }

    async _runCalibration() {
        const pitches = [];
        let collecting = false;

        const updateDisplay = (noteEl, data) => {
            if (data.noteName) {
                noteEl.textContent = data.noteName;
            }
        };

        // Low note
        const lowBtn = document.getElementById('cal-btn-low');
        const noteEl1 = document.getElementById('cal-current-note');
        const timerEl1 = document.getElementById('cal-timer-1');

        this.detector.start((data) => {
            updateDisplay(noteEl1, data);
            if (collecting && data.midi) pitches.push(data.midi);
        });

        await new Promise(resolve => {
            lowBtn.addEventListener('click', async () => {
                lowBtn.disabled = true;
                collecting = true;
                pitches.length = 0;
                for (let i = 5; i > 0; i--) {
                    timerEl1.textContent = i;
                    await this._wait(1000);
                }
                collecting = false;
                resolve();
            });
        });

        const lowNotes = [...pitches];
        const lowMidi = lowNotes.length ? Math.round(lowNotes.reduce((a, b) => a + b) / lowNotes.length) : 40;

        // High note
        document.getElementById('cal-step-1').classList.remove('active');
        document.getElementById('cal-step-2').classList.add('active');

        const highBtn = document.getElementById('cal-btn-high');
        const noteEl2 = document.getElementById('cal-current-note-2');
        const timerEl2 = document.getElementById('cal-timer-2');

        this.detector.start((data) => {
            updateDisplay(noteEl2, data);
            if (collecting && data.midi) pitches.push(data.midi);
        });

        await new Promise(resolve => {
            highBtn.addEventListener('click', async () => {
                highBtn.disabled = true;
                collecting = true;
                pitches.length = 0;
                for (let i = 5; i > 0; i--) {
                    timerEl2.textContent = i;
                    await this._wait(1000);
                }
                collecting = false;
                resolve();
            });
        });

        const highNotes = [...pitches];
        const highMidi = highNotes.length ? Math.round(highNotes.reduce((a, b) => a + b) / highNotes.length) : 72;

        this.detector.stop();

        this.state.calibration = {
            lowNote: Math.min(lowMidi, highMidi),
            highNote: Math.max(lowMidi, highMidi),
            comfortLow: Math.min(lowMidi, highMidi) + 2,
            comfortHigh: Math.max(lowMidi, highMidi) - 2
        };

        await this._saveProgress();

        document.getElementById('cal-step-2').classList.remove('active');
        document.getElementById('cal-step-3').classList.add('active');
        document.getElementById('cal-result').textContent =
            `Dein Stimmumfang: ${midiToNoteName(this.state.calibration.lowNote)} bis ${midiToNoteName(this.state.calibration.highNote)} (${this.state.calibration.highNote - this.state.calibration.lowNote} Halbtöne)`;
    }

    // ========================
    // Session Management
    // ========================

    async _startSession() {
        const slider = document.getElementById('session-duration');
        const duration = slider ? parseInt(slider.value) : 10;

        if (!this.detector) {
            this.detector = new PitchDetector();
            await this.detector.init();
        }

        const exercises = buildSession(this.state.currentLevel, duration);
        if (this.state.calibration) {
            this.session.exercises = exercises.map(ex => adaptExerciseToRange(ex, this.state.calibration));
        } else {
            this.session.exercises = exercises;
        }

        this.session.currentIndex = -1;
        this.session.totalXP = 0;
        this.session.scores = [];
        this.session.startTime = Date.now();

        this._nextExercise();
    }

    _nextExercise() {
        this.session.currentIndex++;
        if (this.session.currentIndex >= this.session.exercises.length) {
            this._endSession();
            return;
        }
        this._runExercise(this.session.exercises[this.session.currentIndex]);
    }

    async _runExercise(ex) {
        this.exercise = {
            currentNoteIndex: 0,
            timer: null,
            elapsed: 0,
            hits: 0,
            total: 0,
            combo: 0,
            maxCombo: 0,
            pitchHistory: []
        };

        const main = document.getElementById('st-main');
        const progress = ((this.session.currentIndex) / this.session.exercises.length * 100).toFixed(0);

        main.innerHTML = `
            <div class="st-view">
                <div class="st-container">
                    <div class="st-exercise-header">
                        <div class="st-exercise-title">${ex.title}</div>
                        <div class="st-exercise-meta">
                            <span class="st-exercise-badge">${this.session.currentIndex + 1}/${this.session.exercises.length}</span>
                            <span class="st-exercise-badge">+${ex.xp_reward} XP</span>
                            <span class="st-exercise-timer" id="ex-timer">${ex.duration_s}</span>
                        </div>
                    </div>

                    <div class="st-progress-bar">
                        <div class="st-progress-fill" style="width:${progress}%"></div>
                    </div>

                    <div class="st-instructions">
                        <h4>${this._exerciseIcon(ex.type)} ${ex.category === 'warmup' ? 'Warm-Up' : ex.category === 'cooldown' ? 'Cool-Down' : 'Übung'}</h4>
                        <p>${ex.description}</p>
                    </div>

                    ${ex.type === 'breathing' ? `
                        <div style="text-align:center;">
                            <div class="st-breathing-circle" id="breathing-circle">Bereit</div>
                        </div>
                    ` : `
                        <div class="st-pitch-container">
                            <canvas class="st-pitch-canvas" id="pitch-canvas"></canvas>
                            <div class="st-pitch-info">
                                <div class="st-current-note" id="current-note">—</div>
                                <div class="st-cents-display">
                                    <div class="value" id="cents-display">0</div>
                                    <div class="label">Cents</div>
                                </div>
                                <div class="st-target-note">
                                    <div class="label">Zielton</div>
                                    <div class="note" id="target-note">—</div>
                                </div>
                            </div>
                        </div>
                    `}

                    <div class="st-exercise-controls">
                        <button class="st-btn st-btn-secondary" id="btn-skip">
                            <i class="fas fa-forward"></i> Überspringen
                        </button>
                        <button class="st-btn st-btn-secondary" id="btn-stop-session">
                            <i class="fas fa-stop"></i> Beenden
                        </button>
                    </div>
                </div>
            </div>
            <div class="st-combo" id="combo-display">
                <div class="combo-count" id="combo-count">0</div>
                <div class="combo-label">Combo</div>
            </div>
        `;

        if (ex.type === 'breathing') {
            await this._runBreathingExercise(ex);
        } else {
            this._initCanvas();
            await this._runPitchExercise(ex);
        }
    }

    // ========================
    // Breathing exercise
    // ========================

    async _runBreathingExercise(ex) {
        const circle = document.getElementById('breathing-circle');
        if (!circle) return;

        for (let r = 0; r < (ex.repeats || 3); r++) {
            for (const phase of ex.phases) {
                circle.className = 'st-breathing-circle ' + phase.action;
                circle.textContent = phase.label;
                for (let s = phase.duration_s; s > 0; s--) {
                    const timerEl = document.getElementById('ex-timer');
                    if (timerEl) timerEl.textContent = s;
                    await this._wait(1000);
                }
            }
        }

        this._completeExercise(ex, 100);
    }

    // ========================
    // Pitch exercise
    // ========================

    async _runPitchExercise(ex) {
        const notes = ex.notes || [];
        if (!notes.length && ex.type === 'glide') {
            await this._runGlideExercise(ex);
            return;
        }

        let noteIdx = 0;
        let noteStartTime = Date.now();
        const beatDurationMs = 500;
        let hitSamples = 0;
        let totalSamples = 0;
        let localCombo = 0;

        const targetEl = document.getElementById('target-note');
        const currentEl = document.getElementById('current-note');
        const centsEl = document.getElementById('cents-display');
        const timerEl = document.getElementById('ex-timer');

        if (notes.length > 0 && targetEl) {
            targetEl.textContent = midiToNoteName(notes[0].midi);
            this.detector.playReferenceNote(notes[0].midi, notes[0].duration_beats * beatDurationMs);
        }

        const exercisePromise = new Promise((resolve) => {
            let remaining = ex.duration_s;

            const timerInterval = setInterval(() => {
                remaining--;
                if (timerEl) timerEl.textContent = Math.max(0, remaining);
                if (remaining <= 0) {
                    clearInterval(timerInterval);
                    resolve();
                }
            }, 1000);

            this.exercise.timer = timerInterval;

            this.detector.start((data) => {
                if (!notes.length) return;
                const target = notes[noteIdx];
                if (!target) return;

                const elapsed = Date.now() - noteStartTime;
                const noteDuration = target.duration_beats * beatDurationMs;

                if (elapsed >= noteDuration) {
                    noteIdx++;
                    if (noteIdx >= notes.length) {
                        noteIdx = 0;
                    }
                    noteStartTime = Date.now();
                    if (targetEl) targetEl.textContent = midiToNoteName(notes[noteIdx].midi);
                    this.detector.playReferenceNote(notes[noteIdx].midi, notes[noteIdx].duration_beats * beatDurationMs);
                }

                if (data.midi) {
                    if (currentEl) currentEl.textContent = data.noteName;
                    const diffCents = Math.abs(data.midi - notes[noteIdx].midi) * 100;
                    if (centsEl) {
                        centsEl.textContent = Math.round(data.midi - notes[noteIdx].midi > 0 ? '+' : '') + Math.round(data.midi - notes[noteIdx].midi);
                        centsEl.className = 'value ' + (diffCents <= 50 ? 'pitch-perfect' : diffCents <= 100 ? 'pitch-close' : 'pitch-off');
                    }

                    totalSamples++;
                    if (diffCents <= (target.tolerance_cents || 100)) {
                        hitSamples++;
                        localCombo++;
                        if (localCombo > this.exercise.maxCombo) this.exercise.maxCombo = localCombo;
                        this._updateCombo(localCombo);
                    } else {
                        localCombo = 0;
                        this._updateCombo(0);
                    }

                    this._drawPitch(data, notes[noteIdx]);
                } else {
                    if (currentEl) currentEl.textContent = '—';
                    localCombo = 0;
                }
            });
        });

        await exercisePromise;
        this.detector.stop();
        if (this.exercise.timer) clearInterval(this.exercise.timer);

        const accuracy = totalSamples > 0 ? Math.round(hitSamples / totalSamples * 100) : 0;
        this._completeExercise(ex, accuracy);
    }

    async _runGlideExercise(ex) {
        const startMidi = ex.glide_start_midi;
        const endMidi = ex.glide_end_midi;
        const glideDur = ex.glide_duration_s || 5;
        const repeats = ex.repeats || 2;
        const tolerance = ex.tolerance_cents || 150;

        let hitSamples = 0;
        let totalSamples = 0;

        const targetEl = document.getElementById('target-note');
        const currentEl = document.getElementById('current-note');
        const timerEl = document.getElementById('ex-timer');

        let remaining = ex.duration_s;
        const timerInterval = setInterval(() => {
            remaining--;
            if (timerEl) timerEl.textContent = Math.max(0, remaining);
        }, 1000);

        for (let r = 0; r < repeats; r++) {
            const glideStart = Date.now();
            await new Promise(resolve => {
                this.detector.start((data) => {
                    const elapsed = (Date.now() - glideStart) / 1000;
                    const progress = Math.min(elapsed / glideDur, 1);
                    const targetMidi = startMidi + (endMidi - startMidi) * progress;

                    if (targetEl) targetEl.textContent = midiToNoteName(Math.round(targetMidi));
                    if (data.midi) {
                        if (currentEl) currentEl.textContent = data.noteName;
                        totalSamples++;
                        if (Math.abs(data.midi - targetMidi) * 100 <= tolerance) hitSamples++;
                        this._drawPitch(data, { midi: targetMidi });
                    }

                    if (progress >= 1) {
                        this.detector.stop();
                        resolve();
                    }
                });
            });
            await this._wait(500);
        }

        clearInterval(timerInterval);
        const accuracy = totalSamples > 0 ? Math.round(hitSamples / totalSamples * 100) : 0;
        this._completeExercise(this.session.exercises[this.session.currentIndex], accuracy);
    }

    // ========================
    // Canvas Pitch Visualization
    // ========================

    _initCanvas() {
        this.canvas = document.getElementById('pitch-canvas');
        if (!this.canvas) return;
        this.canvasCtx = this.canvas.getContext('2d');
        this.canvas.width = this.canvas.offsetWidth * 2;
        this.canvas.height = this.canvas.offsetHeight * 2;
        this.canvasCtx.scale(2, 2);
        this.exercise.pitchHistory = [];
    }

    _drawPitch(data, targetNote) {
        if (!this.canvas || !this.canvasCtx) return;
        const ctx = this.canvasCtx;
        const w = this.canvas.offsetWidth;
        const h = this.canvas.offsetHeight;

        this.exercise.pitchHistory.push({
            midi: data.midi,
            target: targetNote.midi,
            time: Date.now()
        });

        if (this.exercise.pitchHistory.length > 200) {
            this.exercise.pitchHistory.shift();
        }

        ctx.fillStyle = 'rgba(26, 26, 46, 0.3)';
        ctx.fillRect(0, 0, w, h);

        const midiRange = 24;
        const centerMidi = targetNote.midi;
        const midiToY = (m) => h - ((m - (centerMidi - midiRange / 2)) / midiRange) * h;

        // Target zone
        const tolerance = (targetNote.tolerance_cents || 100) / 100;
        const zoneTop = midiToY(centerMidi + tolerance);
        const zoneBot = midiToY(centerMidi - tolerance);
        ctx.fillStyle = 'rgba(16, 185, 129, 0.1)';
        ctx.fillRect(0, zoneTop, w, zoneBot - zoneTop);

        // Target line
        const targetY = midiToY(centerMidi);
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(0, targetY);
        ctx.lineTo(w, targetY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Pitch trail
        const history = this.exercise.pitchHistory;
        if (history.length > 1) {
            ctx.strokeStyle = '#667eea';
            ctx.lineWidth = 3;
            ctx.beginPath();
            const startIdx = Math.max(0, history.length - 100);
            for (let i = startIdx; i < history.length; i++) {
                if (!history[i].midi) continue;
                const x = ((i - startIdx) / Math.min(100, history.length)) * w;
                const y = midiToY(history[i].midi);
                if (i === startIdx) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();

            // Current position glow
            const last = history[history.length - 1];
            if (last.midi) {
                const cx = w - 10;
                const cy = midiToY(last.midi);
                const diff = Math.abs(last.midi - centerMidi);
                const color = diff <= 0.5 ? '#10b981' : diff <= 1 ? '#f59e0b' : '#ef4444';

                ctx.beginPath();
                ctx.arc(cx, cy, 8, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.fill();
                ctx.beginPath();
                ctx.arc(cx, cy, 14, 0, Math.PI * 2);
                ctx.strokeStyle = color;
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        }
    }

    // ========================
    // Gamification
    // ========================

    _updateCombo(count) {
        const el = document.getElementById('combo-display');
        const countEl = document.getElementById('combo-count');
        if (!el || !countEl) return;
        if (count >= 3) {
            el.classList.add('show');
            countEl.textContent = count;
        } else {
            el.classList.remove('show');
        }
    }

    _showXPPopup(xp, accuracy) {
        const existing = document.querySelector('.st-xp-popup');
        if (existing) existing.remove();

        const popup = document.createElement('div');
        popup.className = 'st-xp-popup';
        popup.innerHTML = `
            <span class="xp-amount">+${xp} XP</span>
            <span class="xp-label">Übung abgeschlossen!</span>
            <div class="accuracy">${accuracy}% Genauigkeit</div>
        `;
        document.body.appendChild(popup);

        requestAnimationFrame(() => popup.classList.add('show'));
        setTimeout(() => {
            popup.classList.remove('show');
            setTimeout(() => popup.remove(), 300);
        }, 1500);
    }

    _spawnHitIndicator(text, color) {
        const el = document.createElement('div');
        el.className = 'st-hit-indicator';
        el.style.color = color;
        el.textContent = text;
        el.style.left = (50 + Math.random() * 30 - 15) + '%';
        el.style.top = '40%';
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 800);
    }

    // ========================
    // Exercise completion
    // ========================

    _completeExercise(ex, accuracy) {
        const xpMultiplier = accuracy >= 90 ? 1.5 : accuracy >= 70 ? 1.2 : accuracy >= 50 ? 1.0 : 0.5;
        const xp = Math.round(ex.xp_reward * xpMultiplier);

        this.session.totalXP += xp;
        this.session.scores.push({ id: ex.id, accuracy, xp });

        this.state.totalXP += xp;
        if (!this.state.levelProgress[ex.level]) {
            this.state.levelProgress[ex.level] = { completed: [], bestScores: {} };
        }
        const lp = this.state.levelProgress[ex.level];
        if (!lp.completed.includes(ex.id)) lp.completed.push(ex.id);
        if (!lp.bestScores[ex.id] || accuracy > lp.bestScores[ex.id]) {
            lp.bestScores[ex.id] = accuracy;
        }

        const unlocked = this._getUnlockedLevel();
        if (unlocked > this.state.currentLevel) {
            this.state.currentLevel = unlocked;
        }

        this._showXPPopup(xp, accuracy);

        setTimeout(() => {
            this._nextExercise();
        }, 1800);
    }

    // ========================
    // Session end
    // ========================

    async _endSession() {
        if (this.detector) this.detector.stop();
        if (this.exercise.timer) clearInterval(this.exercise.timer);

        const today = new Date().toISOString().slice(0, 10);
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

        if (this.state.lastSessionDate !== today) {
            if (this.state.lastSessionDate === yesterday || !this.state.lastSessionDate) {
                this.state.streak++;
            }
            this.state.lastSessionDate = today;
        }
        this.state.sessionsCompleted++;

        await this._saveProgress();

        const avgAccuracy = this.session.scores.length
            ? Math.round(this.session.scores.reduce((s, sc) => s + sc.accuracy, 0) / this.session.scores.length)
            : 0;

        const elapsed = Math.round((Date.now() - this.session.startTime) / 1000 / 60);

        const main = document.getElementById('st-main');
        main.innerHTML = `
            <div class="st-view st-results active">
                <div class="st-container">
                    <div class="st-results-card">
                        <h2>Session abgeschlossen!</h2>
                        <div class="st-results-stats">
                            <div class="st-result-item">
                                <span class="value">${this.session.totalXP}</span>
                                <span class="label">XP verdient</span>
                            </div>
                            <div class="st-result-item">
                                <span class="value">${avgAccuracy}%</span>
                                <span class="label">Genauigkeit</span>
                            </div>
                            <div class="st-result-item">
                                <span class="value">${elapsed} min</span>
                                <span class="label">Dauer</span>
                            </div>
                        </div>
                        <div class="st-results-stats">
                            <div class="st-result-item">
                                <span class="value">${this.session.scores.length}</span>
                                <span class="label">Übungen</span>
                            </div>
                            <div class="st-result-item">
                                <span class="value">${this.state.streak} 🔥</span>
                                <span class="label">Streak</span>
                            </div>
                            <div class="st-result-item">
                                <span class="value">${this.state.totalXP}</span>
                                <span class="label">XP Gesamt</span>
                            </div>
                        </div>
                        <div class="st-results-actions">
                            <button class="st-btn st-btn-primary" id="btn-bonus-round">
                                <i class="fas fa-redo"></i> Noch eine Runde
                            </button>
                            <button class="st-btn st-btn-secondary" id="btn-back-dashboard">
                                <i class="fas fa-home"></i> Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    _bonusRound() {
        const available = (SINGING_EXERCISES[this.state.currentLevel] || []).filter(
            e => e.category !== 'warmup' && e.category !== 'cooldown'
        );
        const bonus = available[Math.floor(Math.random() * available.length)];
        if (bonus) {
            const adapted = this.state.calibration ? adaptExerciseToRange(bonus, this.state.calibration) : bonus;
            this.session.exercises.push(adapted);
            this.session.currentIndex = this.session.exercises.length - 2;
            this._nextExercise();
        }
    }

    // ========================
    // Utils
    // ========================

    _wait(ms) {
        return new Promise(r => setTimeout(r, ms));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new SingingTrainer();
    app.init();
});
