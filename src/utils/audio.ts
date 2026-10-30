// Audio synthesizer using Web Audio API
// Provides crisp positive water drop chimes, negative toxic hazard cues,
// and soothing quiet ambient background music.

class SoundManager {
  private ctx: AudioContext | null = null;
  private musicGainNode: GainNode | null = null;
  private sfxGainNode: GainNode | null = null;
  private masterGainNode: GainNode | null = null;
  private isMusicPlaying = false;
  private isMuted = false;
  private musicIntervalId: number | null = null;
  private musicStep = 0;

  // Peaceful pentatonic ambient notes (frequencies in Hz)
  private readonly melodyNotes: number[] = [
    // Chord 1 (Cmaj9 vibe): C4, G4, E4, D5, G4, E4, C5, G4
    261.63, 392.00, 329.63, 587.33, 392.00, 329.63, 523.25, 392.00,
    // Chord 2 (Fmaj7 vibe): F3, C4, A4, E5, C4, A4, F4, C4
    174.61, 261.63, 440.00, 659.25, 261.63, 440.00, 349.23, 261.63,
    // Chord 3 (Am9 vibe): A3, E4, C5, G5, E4, C5, A4, E4
    220.00, 329.63, 523.25, 783.99, 329.63, 523.25, 440.00, 329.63,
    // Chord 4 (Gsus vibe): G3, D4, B4, D5, B4, G4, D5, B4
    196.00, 293.66, 493.88, 587.33, 493.88, 392.00, 587.33, 493.88,
  ];

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();

        this.masterGainNode = this.ctx.createGain();
        this.masterGainNode.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);
        this.masterGainNode.connect(this.ctx.destination);

        // Sound effects gain
        this.sfxGainNode = this.ctx.createGain();
        this.sfxGainNode.gain.setValueAtTime(0.35, this.ctx.currentTime);
        this.sfxGainNode.connect(this.masterGainNode);

        // Music gain - kept intentionally quiet and pleasant
        this.musicGainNode = this.ctx.createGain();
        this.musicGainNode.gain.setValueAtTime(0.06, this.ctx.currentTime);
        this.musicGainNode.connect(this.masterGainNode);
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.masterGainNode && this.ctx) {
      this.masterGainNode.gain.setValueAtTime(muted ? 0 : 1, this.ctx.currentTime);
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // Play positive clean water droplet sound: bright, resonant water "plink / chime"
  public playCleanCatch(): void {
    const ctx = this.getContext();
    if (!ctx || !this.sfxGainNode || this.isMuted) return;

    const now = ctx.currentTime;

    // Primary droplet bubble oscillator (sine wave sweeping up)
    const dropOsc = ctx.createOscillator();
    const dropGain = ctx.createGain();

    dropOsc.type = 'sine';
    // Frequency sweeps from ~500Hz up to 980Hz to mimic a water bubble sound
    dropOsc.frequency.setValueAtTime(480, now);
    dropOsc.frequency.exponentialRampToValueAtTime(1050, now + 0.08);

    dropGain.gain.setValueAtTime(0.4, now);
    dropGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    dropOsc.connect(dropGain);
    dropGain.connect(this.sfxGainNode);

    dropOsc.start(now);
    dropOsc.stop(now + 0.19);

    // Harmonic bell chime overtone (like pure crystal water)
    const chimeOsc = ctx.createOscillator();
    const chimeGain = ctx.createGain();

    chimeOsc.type = 'triangle';
    // High pentatonic E6 or G6 sparkle
    chimeOsc.frequency.setValueAtTime(1318.51, now + 0.02);

    chimeGain.gain.setValueAtTime(0.001, now);
    chimeGain.gain.setValueAtTime(0.2, now + 0.02);
    chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    chimeOsc.connect(chimeGain);
    chimeGain.connect(this.sfxGainNode);

    chimeOsc.start(now + 0.02);
    chimeOsc.stop(now + 0.3);
  }

  // Play negative toxic / hazard droplet sound: low, discordant warning thud
  public playHazardCatch(): void {
    const ctx = this.getContext();
    if (!ctx || !this.sfxGainNode || this.isMuted) return;

    const now = ctx.currentTime;

    // Filtered low sawtooth for toxic buzz
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gainNode = ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'triangle';

    // Dissonant interval: low root 180Hz dropping down to 75Hz with tritone detune
    osc1.frequency.setValueAtTime(185, now);
    osc1.frequency.exponentialRampToValueAtTime(75, now + 0.25);

    osc2.frequency.setValueAtTime(130, now);
    osc2.frequency.exponentialRampToValueAtTime(60, now + 0.25);

    // Low-pass filter to keep it subtle rather than harsh
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, now);
    filter.frequency.exponentialRampToValueAtTime(150, now + 0.25);

    gainNode.gain.setValueAtTime(0.35, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.sfxGainNode);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.27);
    osc2.stop(now + 0.27);
  }

  // Play victory chime sequence when completing 100 points
  public playVictoryFanfare(): void {
    const ctx = this.getContext();
    if (!ctx || !this.sfxGainNode || this.isMuted) return;

    const now = ctx.currentTime;
    const chords = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

    chords.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0.001, now + idx * 0.12);
      gain.gain.setValueAtTime(0.28, now + idx * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.45);

      osc.connect(gain);
      gain.connect(this.sfxGainNode!);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.48);
    });
  }

  // Soft single background note synthesis (marimba/music-box style)
  private playAmbientNote(freq: number): void {
    const ctx = this.getContext();
    if (!ctx || !this.musicGainNode || this.isMuted) return;

    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    // Warm filter for soft calming tone
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(650, now);

    // Soft attack and long gentle release
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGainNode);

    osc.start(now);
    osc.stop(now + 0.7);
  }

  // Start peaceful looping background music
  public startBackgroundMusic(): void {
    if (this.isMusicPlaying) return;
    this.getContext();
    this.isMusicPlaying = true;
    this.musicStep = 0;

    // Step every 450ms (~66 BPM, relaxed and gentle)
    this.musicIntervalId = window.setInterval(() => {
      if (!this.isMusicPlaying) return;
      const note = this.melodyNotes[this.musicStep % this.melodyNotes.length];
      this.playAmbientNote(note);
      this.musicStep++;
    }, 450);
  }

  // Stop or pause background music
  public stopBackgroundMusic(): void {
    this.isMusicPlaying = false;
    if (this.musicIntervalId !== null) {
      window.clearInterval(this.musicIntervalId);
      this.musicIntervalId = null;
    }
  }
}

export const soundManager = new SoundManager();
