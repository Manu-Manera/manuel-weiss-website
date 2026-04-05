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
        this.minFreq = 60;
        this.maxFreq = 1500;
        this._rafId = null;
    }

    async init() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.sampleRate = this.audioContext.sampleRate;
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = this.bufferSize * 2;
        this.buffer = new Float32Array(this.bufferSize);

        this.mediaStream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            }
        });

        this.source = this.audioContext.createMediaStreamSource(this.mediaStream);
        this.source.connect(this.analyser);
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

        if (rms < 0.01) {
            if (this.onPitch) this.onPitch({ frequency: null, clarity: 0, volume, midi: null, noteName: null, cents: 0 });
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
        if (clarity < 0.5) return null;

        return { frequency, clarity };
    }

    playReferenceNote(midiNote, durationMs) {
        if (!this.audioContext) return;
        const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, this.audioContext.currentTime);
        gain.gain.linearRampToValueAtTime(0.15, this.audioContext.currentTime + 0.05);
        gain.gain.setValueAtTime(0.15, this.audioContext.currentTime + (durationMs / 1000) - 0.1);
        gain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + (durationMs / 1000));

        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        osc.start();
        osc.stop(this.audioContext.currentTime + durationMs / 1000);
    }
}
