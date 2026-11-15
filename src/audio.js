/* ============================================================
   AUDIO — efeitos sintetizados via Web Audio API
   Nada é carregado de arquivo: drone grave nos avanços,
   impacto seco na escolha do personagem.
   Inicializado na primeira interação (política de autoplay).
   ============================================================ */

let ctx = null;
let master = null;

function ensure() {
  if (!ctx) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.6;
      master.connect(ctx.destination);
    } catch (_) {
      return null;
    }
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

/* Drone grave e curto — avanço de tela */
function drone() {
  if (!ensure()) return;
  const t = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(55, t);
  osc.frequency.exponentialRampToValueAtTime(38, t + 1.6);

  const sub = ctx.createOscillator();
  sub.type = "triangle";
  sub.frequency.setValueAtTime(110, t);
  sub.frequency.exponentialRampToValueAtTime(74, t + 1.6);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.22, t + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.7);

  const subGain = ctx.createGain();
  subGain.gain.value = 0.25;

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(240, t);
  filter.frequency.exponentialRampToValueAtTime(90, t + 1.5);

  osc.connect(gain);
  sub.connect(subGain).connect(gain);
  gain.connect(filter).connect(master);

  osc.start(t);
  sub.start(t);
  osc.stop(t + 1.8);
  sub.stop(t + 1.8);
}

/* Impacto seco — escolha do receptáculo */
function impact() {
  if (!ensure()) return;
  const t = ctx.currentTime;

  /* corpo grave do impacto */
  const thump = ctx.createOscillator();
  thump.type = "sine";
  thump.frequency.setValueAtTime(140, t);
  thump.frequency.exponentialRampToValueAtTime(34, t + 0.28);

  const thumpGain = ctx.createGain();
  thumpGain.gain.setValueAtTime(0.0001, t);
  thumpGain.gain.exponentialRampToValueAtTime(0.9, t + 0.012);
  thumpGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);

  thump.connect(thumpGain).connect(master);
  thump.start(t);
  thump.stop(t + 0.5);

  /* estalo de ruído, como porta de arquivo batendo */
  const dur = 0.22;
  const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2.2);
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = "lowpass";
  noiseFilter.frequency.setValueAtTime(1600, t);
  noiseFilter.frequency.exponentialRampToValueAtTime(220, t + dur);

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.35, t);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

  noise.connect(noiseFilter).connect(noiseGain).connect(master);
  noise.start(t);
}

export const AudioFX = { ensure, drone, impact };
