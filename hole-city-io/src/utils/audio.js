// Web Audio API
let audioCtx = null;

export function initAudio() {
  try {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
        console.log("AudioContext created");
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().then(() => {
        console.log("AudioContext resumed");
      });
    }
  } catch (e) {
    console.error("Audio init error:", e);
  }
}

export function playSound(freq = 400) {
  if (!audioCtx) {
    // Ses çalınmaya çalışılıyor ama context yoksa başlatmayı dene
    initAudio();
    if (!audioCtx) return;
  }

  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, audioCtx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.15);
  } catch (e) {
    console.error("PlaySound error:", e);
  }
}

// Patlama Sesi
export function playExplosion() {
  if (!audioCtx) return;

  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(10, audioCtx.currentTime + 0.5);

    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.5);
  } catch (e) {
    console.error("PlayExplosion error:", e);
  }
}
