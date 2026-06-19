/**
 * Real-time pitch detection using the YIN algorithm via Web Audio API.
 */
class PitchDetector {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.mediaStream = null;
        this.source = null;
        this.buffer = null;
        this.running = false;
        this.onPitch = null;
        this.sampleRate = 44100;
        this.bufferSize = 2048;
        this.threshold = 0.15;
        this.minClarity = 0.5;
        this.rmsThreshold = 0.01;
        this.minFreq = 60;
        this.maxFreq = 1500;
        this._rafId = null;
    }

    async init(options) {
        options = options || {};
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.sampleRate = this.audioContext.sampleRate;
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = this.bufferSize * 2;
        this.buffer = new Float32Array(this.bufferSize);

        if (options.threshold != null) this.threshold = options.threshold;
        if (options.minClarity != null) this.minClarity = options.minClarity;
        if (options.rmsThreshold != null) this.rmsThreshold = options.rmsThreshold;
        if (options.minFreq != null) this.minFreq = options.minFreq;
        if (options.maxFreq != null) this.maxFreq = options.maxFreq;

        var voiceMode = !!options.forVoice;
        this.mediaStream = await navigator.mediaDevices.getUserMedia({
            audio: voiceMode ? {
                echoCancellation: false,
                noiseSuppression: false,
                autoGainControl: false,
                channelCount: 1
            } : {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            }
        });

        this.source = this.audioContext.createMediaStreamSource(this.mediaStream);
        this.source.connect(this.analyser);
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }

    start(callback) {
        this.onPitch = callback;
        this.running = true;
        this._detect();
    }

    stop() {
        this.running = false;
        if (this._rafId) {
            cancelAnimationFrame(this._rafId);
            this._rafId = null;
        }
    }

    destroy() {
        this.stop();
        if (this.source) this.source.disconnect();
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(t => t.stop());
        }
        if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close();
        }
    }

    _detect() {
        if (!this.running) return;
        this.analyser.getFloatTimeDomainData(this.buffer);

        const rms = Math.sqrt(this.buffer.reduce((s, v) => s + v * v, 0) / this.buffer.length);
        const volume = rms;

        if (rms < this.rmsThreshold) {
            if (this.onPitch) this.onPitch({ frequency: null, clarity: 0, volume, midi: null, noteName: null, cents: 0, tooQuiet: true });
            this._rafId = requestAnimationFrame(() => this._detect());
            return;
        }

        const result = this._yin(this.buffer);

        if (result && this.onPitch) {
            const midi = 69 + 12 * Math.log2(result.frequency / 440);
            const roundedMidi = Math.round(midi);
            const cents = Math.round((midi - roundedMidi) * 100);
            const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
            const octave = Math.floor(roundedMidi / 12) - 1;
            const noteName = noteNames[roundedMidi % 12] + octave;

            this.onPitch({
                frequency: result.frequency,
                clarity: result.clarity,
                volume,
                midi,
                roundedMidi,
                noteName,
                cents
            });
        } else if (this.onPitch) {
            this.onPitch({ frequency: null, clarity: 0, volume, midi: null, noteName: null, cents: 0 });
        }

        this._rafId = requestAnimationFrame(() => this._detect());
    }

    _yin(buf) {
        const halfLen = Math.floor(buf.length / 2);
        const minPeriod = Math.floor(this.sampleRate / this.maxFreq);
        const maxPeriod = Math.floor(this.sampleRate / this.minFreq);
        const yinBuf = new Float32Array(halfLen);

        // Step 2: Difference function
        for (let tau = 1; tau < halfLen; tau++) {
            let sum = 0;
            for (let i = 0; i < halfLen; i++) {
                const delta = buf[i] - buf[i + tau];
                sum += delta * delta;
            }
            yinBuf[tau] = sum;
        }

        // Step 3: Cumulative mean normalized difference
        yinBuf[0] = 1;
        let runningSum = 0;
        for (let tau = 1; tau < halfLen; tau++) {
            runningSum += yinBuf[tau];
            yinBuf[tau] *= tau / runningSum;
        }

        // Step 4: Absolute threshold
        let tau = minPeriod;
        while (tau < Math.min(maxPeriod, halfLen - 1)) {
            if (yinBuf[tau] < this.threshold) {
                while (tau + 1 < halfLen && yinBuf[tau + 1] < yinBuf[tau]) {
                    tau++;
                }
                break;
            }
            tau++;
        }

        if (tau >= Math.min(maxPeriod, halfLen - 1)) return null;

        // Step 5: Parabolic interpolation
        let betterTau;
        const x0 = tau < 1 ? tau : tau - 1;
        const x2 = tau + 1 < halfLen ? tau + 1 : tau;

        if (x0 === tau) {
            betterTau = yinBuf[tau] <= yinBuf[x2] ? tau : x2;
        } else if (x2 === tau) {
            betterTau = yinBuf[tau] <= yinBuf[x0] ? tau : x0;
        } else {
            const s0 = yinBuf[x0];
            const s1 = yinBuf[tau];
            const s2 = yinBuf[x2];
            betterTau = tau + (s2 - s0) / (2 * (2 * s1 - s2 - s0));
        }

        const frequency = this.sampleRate / betterTau;
        const clarity = 1 - yinBuf[tau];

        if (frequency < this.minFreq || frequency > this.maxFreq) return null;
        if (clarity < this.minClarity) return null;

        return { frequency, clarity };
    }

    async ensureContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.sampleRate = this.audioContext.sampleRate;
        }
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
        return this.audioContext;
    }

    playReferenceNote(midiNote, durationMs, volume) {
        var self = this;
        durationMs = durationMs || 700;
        volume = volume == null ? 0.15 : volume;
        this.ensureContext().then(function () {
            self._playOsc(midiNote, durationMs, volume, self.audioContext.currentTime + 0.02);
        }).catch(function () {});
    }

    _playOsc(midiNote, durationMs, volume, startAt) {
        if (!this.audioContext) return null;
        var freq = 440 * Math.pow(2, (midiNote - 69) / 12);
        var osc = this.audioContext.createOscillator();
        var gain = this.audioContext.createGain();
        var dur = durationMs / 1000;
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, startAt);
        gain.gain.linearRampToValueAtTime(volume, startAt + 0.04);
        gain.gain.setValueAtTime(volume, startAt + Math.max(0.05, dur - 0.12));
        gain.gain.linearRampToValueAtTime(0, startAt + dur);
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        osc.start(startAt);
        osc.stop(startAt + dur + 0.02);
        return osc;
    }

    /** Melodie als Vorhörton – gibt Startzeit (audioContext) zurück */
    playMelodySequence(notes, volume) {
        var self = this;
        volume = volume == null ? 0.14 : volume;
        return this.ensureContext().then(function () {
            var t = self.audioContext.currentTime + 0.08;
            var oscs = [];
            (notes || []).forEach(function (n) {
                var o = self._playOsc(n.midi, n.durationMs, volume, t);
                if (o) oscs.push(o);
                t += n.durationMs / 1000;
            });
            return { startTime: self.audioContext.currentTime + 0.08, oscs: oscs };
        });
    }
}

/** Leichter Vorhörton ohne Mikrofon – für «Vorhörton» vor Übungsstart */
class ReferenceTonePlayer {
    constructor() {
        this.ctx = null;
    }

    async ensureContext() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            await this.ctx.resume();
        }
        return this.ctx;
    }

    playNote(midiNote, durationMs, volume) {
        var self = this;
        durationMs = durationMs || 700;
        volume = volume == null ? 0.18 : volume;
        return this.ensureContext().then(function () {
            var freq = 440 * Math.pow(2, (midiNote - 69) / 12);
            var osc = self.ctx.createOscillator();
            var gain = self.ctx.createGain();
            var t0 = self.ctx.currentTime;
            var dur = durationMs / 1000;
            osc.type = 'triangle';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0, t0);
            gain.gain.linearRampToValueAtTime(volume, t0 + 0.04);
            gain.gain.setValueAtTime(volume, t0 + Math.max(0.05, dur - 0.1));
            gain.gain.linearRampToValueAtTime(0, t0 + dur);
            osc.connect(gain);
            gain.connect(self.ctx.destination);
            osc.start(t0);
            osc.stop(t0 + dur + 0.02);
        });
    }

    playMelody(notes, volume) {
        var self = this;
        volume = volume == null ? 0.14 : volume;
        return this.ensureContext().then(function () {
            var t = self.ctx.currentTime + 0.05;
            (notes || []).forEach(function (n) {
                var freq = 440 * Math.pow(2, (n.midi - 69) / 12);
                var osc = self.ctx.createOscillator();
                var gain = self.ctx.createGain();
                var dur = n.durationMs / 1000;
                osc.type = 'triangle';
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0, t);
                gain.gain.linearRampToValueAtTime(volume, t + 0.03);
                gain.gain.setValueAtTime(volume, t + Math.max(0.04, dur - 0.1));
                gain.gain.linearRampToValueAtTime(0, t + dur);
                osc.connect(gain);
                gain.connect(self.ctx.destination);
                osc.start(t);
                osc.stop(t + dur + 0.02);
                t += dur;
            });
            return t - self.ctx.currentTime;
        });
    }
}

window.ReferenceTonePlayer = ReferenceTonePlayer;
