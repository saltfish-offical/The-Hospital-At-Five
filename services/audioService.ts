// Simple synth for procedural retro horror sounds
class AudioService {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.3; // Prevent ear bleeding
      this.masterGain.connect(this.ctx.destination);
    }
  }

  playBeep(freq = 440, type: OscillatorType = 'sine', duration = 0.1) {
    if (!this.ctx || !this.masterGain) return;
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

  playStaticBurst() {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * 0.2; // 0.2 seconds
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
    
    noise.connect(gain);
    gain.connect(this.masterGain);
    noise.start();
  }

  playDrone() {
     if (!this.ctx || !this.masterGain) return;
     // Low frequency hum
     const osc = this.ctx.createOscillator();
     osc.type = 'sawtooth';
     osc.frequency.setValueAtTime(50, this.ctx.currentTime);
     const gain = this.ctx.createGain();
     gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
     
     osc.connect(gain);
     gain.connect(this.masterGain);
     osc.start();
     osc.stop(this.ctx.currentTime + 2.0); // Short drone burst
  }

  playHeartbeat() {
    if (!this.ctx || !this.masterGain) return;
    this.playBeep(60, 'triangle', 0.1);
    setTimeout(() => this.playBeep(50, 'triangle', 0.1), 150);
  }

  playScream() {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.3);
    
    // Add jitter
    const lfo = this.ctx.createOscillator();
    lfo.type = 'square';
    lfo.frequency.value = 50;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 500;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    lfo.start();
    
    gain.gain.setValueAtTime(0.8, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
    lfo.stop(this.ctx.currentTime + 0.3);
  }
}

export const audio = new AudioService();