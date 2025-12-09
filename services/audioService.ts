// Simple synth for procedural retro horror sounds
class AudioService {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ecgInterval: any = null;
  private _isMuted: boolean = false;

  get isMuted() { return this._isMuted; }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this._isMuted ? 0 : 0.3;
      this.masterGain.connect(this.ctx.destination);
    }
  }

  toggleMute() {
    this._isMuted = !this._isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this._isMuted ? 0 : 0.3, this.ctx.currentTime);
    }
    return this._isMuted;
  }

  resume() {
      if (this.ctx?.state === 'suspended') {
          this.ctx.resume();
      }
  }

  playBeep(freq = 440, type: OscillatorType = 'sine', duration = 0.1) {
    if (this._isMuted || !this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  // Subtle ambient horror sounds (Micro-horror)
  playAmbient() {
    if (this._isMuted || !this.ctx || !this.masterGain) return;
    
    const r = Math.random();
    if (r < 0.3) this.playDrone();
    else if (r < 0.6) this.playMetallicPing();
    else this.playWind();
  }

  playMetallicPing() {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    // Disharmonious frequencies for metallic feel
    osc.frequency.setValueAtTime(200 + Math.random() * 500, this.ctx.currentTime);
    osc.type = 'triangle';
    
    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 3);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 3);
  }

  playWind() {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 400;
    filter.Q.value = 1;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + 1);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 2);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start();
  }

  playDrone() {
     if (this._isMuted || !this.ctx || !this.masterGain) return;
     const osc = this.ctx.createOscillator();
     osc.type = 'sine';
     osc.frequency.setValueAtTime(50 + Math.random() * 20, this.ctx.currentTime);
     
     const gain = this.ctx.createGain();
     gain.gain.setValueAtTime(0, this.ctx.currentTime);
     gain.gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + 2);
     gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 6);
     
     osc.connect(gain);
     gain.connect(this.masterGain);
     osc.start();
     osc.stop(this.ctx.currentTime + 6.0); 
  }

  playECG(speed: 'slow' | 'fast' = 'slow') {
      if (this.ecgInterval) clearInterval(this.ecgInterval);
      const interval = speed === 'fast' ? 500 : 1500;
      
      const beat = () => {
          if (!this._isMuted) {
            this.playBeep(800, 'triangle', 0.05);
            setTimeout(() => this.playBeep(700, 'triangle', 0.05), 150);
          }
      };
      
      beat();
      this.ecgInterval = setInterval(beat, interval);
  }

  stopECG() {
      if (this.ecgInterval) {
          clearInterval(this.ecgInterval);
          this.ecgInterval = null;
      }
  }
}

export const audio = new AudioService();