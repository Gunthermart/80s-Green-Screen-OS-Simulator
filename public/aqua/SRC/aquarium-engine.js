/**
 * AquaLab 3D - Simulation d'Aquarium Vivant
 * Moteur de simulation 3D autonome (Three.js & Vanilla ES6+)
 */

// --- SYNTHÉTISEUR AUDIO WEB AUDIO API ---
class AquaAudio {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playBubble() {
    if (this.isMuted) return;
    this.init();
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(350 + Math.random() * 200, now);
      osc.frequency.exponentialRampToValueAtTime(800 + Math.random() * 300, now + 0.12);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {}
  }

  playTap() {
    if (this.isMuted) return;
    this.init();
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.25);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.26);
    } catch (e) {}
  }

  playChime() {
    if (this.isMuted) return;
    this.init();
    try {
      const now = this.ctx.currentTime;
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        gain.gain.setValueAtTime(0.1, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.35);
      });
    } catch (e) {}
  }

  playBassPulse() {
    if (this.isMuted) return;
    this.init();
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(70, now);
      osc.frequency.linearRampToValueAtTime(50, now + 0.6);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.65);
    } catch (e) {}
  }

  playSharkChomp() {
    if (this.isMuted) return;
    this.init();
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(32, now + 0.16);
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
      this.playBubble();
    } catch (e) {}
  }

  playMosasaurRoar() {
    if (this.isMuted) return;
    this.init();
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(95, now);
      osc.frequency.linearRampToValueAtTime(40, now + 0.55);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.58);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.62);
    } catch (e) {}
  }

  playKrakenPulse() {
    if (this.isMuted) return;
    this.init();
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.38);
      gain.gain.setValueAtTime(0.36, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    } catch (e) {}
  }

  playSonarPing() {
    if (this.isMuted) return;
    this.init();
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1450, now);
      osc.frequency.exponentialRampToValueAtTime(1380, now + 0.55);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.65);
    } catch (e) {}
  }

  playSubEngine() {
    if (this.isMuted) return;
    this.init();
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.linearRampToValueAtTime(105, now + 0.14);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    } catch (e) {}
  }

  playBaitLaunch() {
    if (this.isMuted) return;
    this.init();
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.16);
      this.playBubble();
    } catch (e) {}
  }

  playCameraShutter() {
    if (this.isMuted) return;
    this.init();
    try {
      const now = this.ctx.currentTime;
      // Premier clic mécanique
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(1200, now);
      osc1.frequency.exponentialRampToValueAtTime(180, now + 0.04);
      gain1.gain.setValueAtTime(0.45, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.05);

      // Second clic de fermeture du diaphragme
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(800, now + 0.06);
      osc2.frequency.exponentialRampToValueAtTime(240, now + 0.12);
      gain2.gain.setValueAtTime(0.35, now + 0.06);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now + 0.06);
      osc2.stop(now + 0.15);
    } catch (e) {}
  }

  playLaserScan() {
    if (this.isMuted) return;
    this.init();
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(2200, now);
      osc.frequency.linearRampToValueAtTime(3200, now + 0.12);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {}
  }

  playProximityAlert() {
    if (this.isMuted) return;
    this.init();
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(980, now);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {}
  }

  playBallastVent() {
    if (this.isMuted) return;
    this.init();
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.linearRampToValueAtTime(60, now + 0.35);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
      this.playBubble();
    } catch (e) {}
  }

  playTurboBoost() {
    if (this.isMuted) return;
    this.init();
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(90, now);
      osc.frequency.exponentialRampToValueAtTime(260, now + 0.28);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {}
  }
}

const audio = new AquaAudio();

// --- CONFIGURATION DE L'ENVIRONNEMENT & DES ESPÈCES ---
const TANK = { width: 520, height: 260, depth: 360 };

const SPECIES_CONFIG = {
  tetra: {
    name: 'Néon Tétra',
    type: 'prey',
    color: 0x06b6d4,
    accentColor: 0xec4899,
    count: 45,
    scale: 0.8,
    maxSpeed: 1.5,
    perceptionRadius: 45,
    fearRadius: 95,
    fertility: 0.025,
    bodyLength: 9,
    bodyWidth: 3
  },
  barbus: {
    name: 'Barbus Tigre',
    type: 'prey',
    color: 0xf97316,
    accentColor: 0x1e293b,
    count: 35,
    scale: 0.9,
    maxSpeed: 1.6,
    perceptionRadius: 50,
    fearRadius: 100,
    fertility: 0.03,
    bodyLength: 10,
    bodyWidth: 4
  },
  rasbora: {
    name: 'Rasbora Arlequin',
    type: 'prey',
    color: 0x10b981,
    accentColor: 0x0f172a,
    count: 40,
    scale: 0.75,
    maxSpeed: 1.45,
    perceptionRadius: 40,
    fearRadius: 85,
    fertility: 0.035,
    bodyLength: 8,
    bodyWidth: 3
  },
  angel: {
    name: 'Scalaire Majestueux',
    type: 'prey',
    color: 0xa855f7,
    accentColor: 0xf8fafc,
    count: 20,
    scale: 1.1,
    maxSpeed: 1.1,
    perceptionRadius: 55,
    fearRadius: 90,
    fertility: 0.02,
    bodyLength: 13,
    bodyWidth: 5
  },
  cichla: {
    name: 'Cichla Prédateur',
    type: 'predator',
    color: 0xef4444,
    accentColor: 0x7f1d1d,
    count: 4,
    scale: 1.5,
    maxSpeed: 2.1,
    perceptionRadius: 130,
    fearRadius: 0,
    fertility: 0.008,
    bodyLength: 18,
    bodyWidth: 6
  },
  mandarin: {
    name: 'Poisson-Mandarin Psychédélique',
    type: 'prey',
    color: 0x0284c7,
    accentColor: 0xf97316,
    count: 14,
    scale: 0.9,
    maxSpeed: 1.2,
    perceptionRadius: 45,
    fearRadius: 75,
    fertility: 0.022,
    bodyLength: 10,
    bodyWidth: 4.2
  },
  angler: {
    name: 'Poisson-Lanterne Abyssal',
    type: 'predator',
    color: 0x1e1b4b,
    accentColor: 0x38bdf8,
    count: 3,
    scale: 1.35,
    maxSpeed: 1.9,
    perceptionRadius: 150,
    fearRadius: 0,
    fertility: 0.007,
    bodyLength: 15,
    bodyWidth: 6.8
  }
};

// --- CONFIGURATION DES BIOMES MARINS & PALETTES DE COULEURS ---
const BIOMES = {
  tropical: {
    id: 'tropical',
    name: 'Récif Tropical (Grande Barrière)',
    badgeColor: '#f43f5e',
    waterColor: 0x030a16,
    fogColor: 0x041122,
    ambientLight: 0x0c2744,
    sandColor: 0x93c5fd,
    coralColors: [
      0xf43f5e, // Rose corail flamboyant
      0xec4899, // Magenta néon
      0x06b6d4, // Cyan lagon
      0xa855f7, // Pourpre améthyste
      0xf59e0b, // Ambre doré
      0x38bdf8, // Bleu azur
      0x10b981  // Vert émeraude
    ],
    rockColor: 0x94a3b8
  },
  amazon: {
    id: 'amazon',
    name: 'Forêt Fluviale & Lagune Immergée',
    badgeColor: '#10b981',
    waterColor: 0x02140e,
    fogColor: 0x032415,
    ambientLight: 0x073b22,
    sandColor: 0x78716c,
    coralColors: [
      0x10b981, // Vert mousse
      0x84cc16, // Lime chartreuse
      0x14b8a6, // Sarcelle aquatique
      0xca8a04, // Ocre boisé
      0x4d7c0f, // Vert saule
      0x059669  // Jade
    ],
    rockColor: 0x57534e
  },
  abyssal: {
    id: 'abyssal',
    name: 'Fosse Abyssale & Bioluminescence',
    badgeColor: '#a855f7',
    waterColor: 0x01040d,
    fogColor: 0x020718,
    ambientLight: 0x03112c,
    sandColor: 0x1e293b,
    coralColors: [
      0x6366f1, // Indigo électrique
      0xa855f7, // Violet phosphorescent
      0x06b6d4, // Cyan abyssal
      0x22c55e, // Vert krypton
      0xec4899, // Rose ultraviolet
      0x3b82f6  // Bleu cobalt
    ],
    rockColor: 0x334155
  },
  volcanic: {
    id: 'volcanic',
    name: 'Atoll Volcanique & Fumeurs Noirs',
    badgeColor: '#ef4444',
    waterColor: 0x0c0608,
    fogColor: 0x18090d,
    ambientLight: 0x24080f,
    sandColor: 0x262626,
    coralColors: [
      0xef4444, // Rouge lave incandescente
      0xf97316, // Orange magma
      0xd97706, // Ambre braise
      0xb91c1c, // Cramoisi sombre
      0xfbbf24, // Jaune feu
      0x7f1d1d  // Rouge basalte
    ],
    rockColor: 0x1c1917
  }
};

const SIM_SETTINGS = {
  flocking: { separation: 1.4, alignment: 0.6, cohesion: 0.4 },
  env: { rockCount: 16, plantCount: 50, coralCount: 26, currentSpeed: 0.2, biome: 'tropical' },
  speed: 1.0,
  maxPopulationCapacity: 240
};

// --- SYSTÈME DE CYCLE JOUR / NUIT & ÉCLAIRAGE CIRCADIEN ---
const DAY_NIGHT_CYCLE = {
  enabled: true,
  time: 13.0,          // 13:00 (Plein Jour par défaut)
  speed: 0.14,         // Progression des heures
  mode: 'auto',        // 'auto', 'day', 'sunset', 'night'
  currentPhase: 'day', // 'dawn', 'day', 'sunset', 'night'
  sunFactor: 1.0       // 0.0 (pleine nuit) à 1.0 (plein jour)
};

const STATS = {
  preyCount: 0,
  predatorCount: 0,
  births: 0,
  deaths: 0,
  preyEaten: 0,
  generations: { tetra: 1, barbus: 1, rasbora: 1, angel: 1, cichla: 1, mandarin: 1, angler: 1 }
};

// --- DICTIONNAIRE MULTILINGUE ---
const I18N = {
  fr: {
    prey: "Proies",
    predators: "Prédateurs",
    births: "Naissances",
    ratio: "Ratio",
    feed_notif: "Nourriture distribuée en surface.",
    glass_tap: "Onde de choc ! Les poissons s'éparpillent.",
    super_predator_on: "Le Léviathan sillonne les fonds !",
    super_predator_off: "Le Léviathan a quitté le bassin.",
    predator_eat: "{predator} a dévoré un {prey}.",
    super_eat: "Le Super-Prédateur a englouti un {species} !",
    megalodon_on: "Le Mégalodon fend les eaux d'un assaut fulgurant !",
    megalodon_off: "Le Mégalodon s'est retiré dans les grands fonds.",
    megalodon_eat: "Le Mégalodon a broyé un {species} !",
    mosasaur_on: "Le Mosasaure surgit des profondeurs rocheuses !",
    mosasaur_off: "Le Mosasaure a regagné sa faille sous-marine.",
    mosasaur_eat: "Le Mosasaure a englouti un {species} !",
    kraken_on: "Le Kraken Colossal déploie ses tentacules voraces !",
    kraken_off: "Le Kraken Colossal a disparu dans l'encre abyssale.",
    kraken_eat: "Le Kraken Colossal a capturé un {species} !",
    unleash_all: "Les 3 Super-Prédateurs Titans sont déchaînés !",
    recall_all: "Tous les Super-Prédateurs ont regagné les abysses.",
    birth_notif: "Naissance d'un nouvel alevin ({species}, G{gen}) !",
    disease_alert: "Alerte : Surpopulation ! L'épidémie s'étend...",
    saved: "Écosystème sauvegardé avec succès.",
    loaded: "Sauvegarde restaurée."
  },
  en: {
    prey: "Prey",
    predators: "Predators",
    births: "Births",
    ratio: "Ratio",
    feed_notif: "Nutritious flakes dropped.",
    glass_tap: "Glass tapped! Fish scatter in panic.",
    super_predator_on: "Leviathan prowls the seabed!",
    super_predator_off: "Leviathan retired from tank.",
    predator_eat: "{predator} devoured a {prey}.",
    super_eat: "Super-Predator swallowed a {species}!",
    megalodon_on: "Apex Megalodon patrols and charges prey!",
    megalodon_off: "Megalodon returned to the deep abyss.",
    megalodon_eat: "Megalodon crushed a {species} in its jaws!",
    mosasaur_on: "Titan Mosasaur surfaces from the rock reef!",
    mosasaur_off: "Mosasaur dove back into its submarine trench.",
    mosasaur_eat: "Mosasaur devoured a {species}!",
    kraken_on: "Colossal Kraken extends its deadly tentacles!",
    kraken_off: "Colossal Kraken vanished in an ink cloud.",
    kraken_eat: "Colossal Kraken seized a {species}!",
    unleash_all: "All 3 Apex Super-Predators unleashed into the tank!",
    recall_all: "All Super-Predators retired from the tank.",
    birth_notif: "New fry hatched ({species}, G{gen})!",
    disease_alert: "Alert: Overpopulation! Disease spreading...",
    saved: "Ecosystem saved to local storage.",
    loaded: "Backup restored successfully."
  },
  es: {
    prey: "Presas",
    predators: "Depredadores",
    births: "Nacimientos",
    ratio: "Relación",
    feed_notif: "Comida esparcida en la superficie.",
    glass_tap: "¡Golpe en el cristal! Los peces huyen.",
    super_predator_on: "¡El Leviatán merodea por el fondo!",
    super_predator_off: "El Leviatán se ha retirado.",
    predator_eat: "{predator} cazó a un {prey}.",
    super_eat: "¡El Superdepredador devoró a un {species}!",
    megalodon_on: "¡El Megalodón surca las aguas velozmente!",
    megalodon_off: "El Megalodón volvió a las profundidades.",
    megalodon_eat: "¡El Megalodón trituró a un {species}!",
    mosasaur_on: "¡El Mosasaurio emerge de las rocas abisales!",
    mosasaur_off: "El Mosasaurio regresó a su fosa marina.",
    mosasaur_eat: "¡El Mosasaurio devoró a un {species}!",
    kraken_on: "¡El Kraken Colosal despliega sus tentáculos voraces!",
    kraken_off: "El Kraken Colosal desapareció en tinta oscura.",
    kraken_eat: "¡El Kraken Colosal atrapó a un {species}!",
    unleash_all: "¡Los 3 Superdepredadores Titanes han sido liberados!",
    recall_all: "Todos los superdepredadores retirados del tanque.",
    birth_notif: "¡Nuevo alevín nacido ({species}, G{gen})!",
    disease_alert: "¡Alerta: Sobrepoblación y epidemia!",
    saved: "Ecosistema guardado con éxito.",
    loaded: "Estado restaurado con éxito."
  }
};
let currentLang = 'fr';

// --- GESTIONNAIRE D'ÉVÉNEMENTS & NOTIFICATIONS ---
function showToast(text, icon = '🌊') {
  const toast = document.getElementById('notification-toast');
  const toastText = document.getElementById('toast-text');
  const toastIcon = document.getElementById('toast-icon');
  if (!toast || !toastText) return;
  toastIcon.textContent = icon;
  toastText.textContent = text;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 3500);

  // Ajouter au journal
  const logList = document.getElementById('log-list');
  if (logList) {
    const entry = document.createElement('div');
    const time = new Date().toLocaleTimeString();
    entry.style.display = 'flex';
    entry.style.gap = '8px';
    entry.style.alignItems = 'baseline';
    entry.style.padding = '3px 0';
    entry.style.borderBottom = '1px solid rgba(255,255,255,0.06)';
    entry.innerHTML = `<span style="color:#64748b; font-size:10px;">[${time}]</span> <span>${icon}</span> <span style="color:#cbd5e1;">${text}</span>`;
    logList.insertBefore(entry, logList.firstChild);
    if (logList.children.length > 50) logList.removeChild(logList.lastChild);
  }
}

// --- GÉNÉRATEUR PROCÉDURAL DE RÉCIFS CORALLIENS 3D NATURELS (CORAL REEF ARCHITECTURE) ---
const CoralReef = {
  // Matériau PBR avec rugosité organique, caustiques animées et bioluminescence
  createCoralMaterial(colorHex, emissiveIntensity = 0.18, roughness = 0.55) {
    const causticsTex = (window.AquaGraphics && window.AquaGraphics.causticsTexture)
      ? window.AquaGraphics.causticsTexture
      : null;
    return new THREE.MeshStandardMaterial({
      color: colorHex,
      roughness: roughness,
      metalness: 0.08,
      emissiveMap: causticsTex,
      emissive: new THREE.Color(colorHex),
      emissiveIntensity: emissiveIntensity
    });
  },

  // 1. CORAIL BRANCHU / CORNES DE CERF (Acropora formosa)
  createStaghorn(colorHex, scale = 1.0, seed = 0) {
    const group = new THREE.Group();
    const branchMat = this.createCoralMaterial(colorHex, 0.16, 0.65);
    const tipColor = new THREE.Color(colorHex).offsetHSL(0.04, 0.25, 0.18);
    const tipMat = new THREE.MeshStandardMaterial({
      color: tipColor,
      emissive: tipColor,
      emissiveIntensity: 0.52,
      roughness: 0.28
    });

    // Socle / base d'ancrage rocheuse
    const baseGeom = new THREE.ConeGeometry(5 * scale, 5 * scale, 7);
    baseGeom.translate(0, 2.5 * scale, 0);
    const baseMesh = new THREE.Mesh(baseGeom, branchMat);
    group.add(baseMesh);

    // 4 à 7 branches arborescentes
    const branchCount = 4 + Math.floor((Math.sin(seed) * 0.5 + 0.5) * 3);
    for (let b = 0; b < branchCount; b++) {
      const angle = (b / branchCount) * Math.PI * 2 + (Math.sin(seed + b) * 0.3);
      const branchHeight = (18 + ((b * 37 + Math.floor(seed * 19)) % 15)) * scale;
      const radiusBot = (1.8 + Math.random() * 0.6) * scale;
      const radiusTop = radiusBot * 0.55;

      const branchGeom = new THREE.CylinderGeometry(radiusTop, radiusBot, branchHeight, 7);
      branchGeom.translate(0, branchHeight / 2, 0);

      const bMesh = new THREE.Mesh(branchGeom, branchMat);
      bMesh.position.set(Math.cos(angle) * 2 * scale, 1.5 * scale, Math.sin(angle) * 2 * scale);

      const tiltOut = 0.24 + (Math.sin(seed + b * 2) * 0.14);
      bMesh.rotation.z = Math.sin(angle) * tiltOut;
      bMesh.rotation.x = -Math.cos(angle) * tiltOut;
      bMesh.rotation.y = angle;

      // Sous-branche latérale (ramification)
      if (b % 2 === 0) {
        const subH = branchHeight * 0.52;
        const subGeom = new THREE.CylinderGeometry(radiusTop * 0.7, radiusTop, subH, 6);
        subGeom.translate(0, subH / 2, 0);
        const subMesh = new THREE.Mesh(subGeom, branchMat);
        subMesh.position.set(0, branchHeight * 0.45, 0);
        subMesh.rotation.z = 0.45;
        bMesh.add(subMesh);

        // Pointe de la sous-branche
        const subTip = new THREE.Mesh(new THREE.SphereGeometry(radiusTop * 0.85, 6, 6), tipMat);
        subTip.position.set(0, subH, 0);
        subMesh.add(subTip);
      }

      // Pointe bourgeonnante de croissance (fluorescente)
      const tipMesh = new THREE.Mesh(new THREE.SphereGeometry(radiusTop * 1.15, 7, 7), tipMat);
      tipMesh.position.set(0, branchHeight, 0);
      bMesh.add(tipMesh);

      group.add(bMesh);
    }
    return group;
  },

  // 2. CORAIL TABULAIRE / PLATEAU ÉTAGÉ (Montipora / Turbinaria)
  createPlate(colorHex, scale = 1.0, seed = 0) {
    const group = new THREE.Group();
    const plateMat = this.createCoralMaterial(colorHex, 0.22, 0.5);

    // Tronc d'attache central trapu
    const trunkH = 14 * scale;
    const trunkGeom = new THREE.CylinderGeometry(2.5 * scale, 4.5 * scale, trunkH, 8);
    trunkGeom.translate(0, trunkH / 2, 0);
    const trunk = new THREE.Mesh(trunkGeom, plateMat);
    group.add(trunk);

    // 2 à 4 plateaux superposés de tailles décroissantes
    const tierCount = 2 + Math.floor(Math.abs(seed % 3));
    for (let t = 0; t < tierCount; t++) {
      const tierH = (trunkH * 0.38) + t * (7 * scale);
      const radius = Math.max(8 * scale, (15 - t * 3.2 + (Math.sin(seed + t) * 2.5)) * scale);

      // Disque à bords ondulés / festonnés (lobes naturels)
      const plateGeom = new THREE.CylinderGeometry(radius, radius * 0.95, 1.4 * scale, 24);
      const pos = plateGeom.attributes.position.array;
      for (let i = 0; i < pos.length; i += 3) {
        const x = pos[i];
        const z = pos[i + 2];
        const dist = Math.sqrt(x * x + z * z);
        if (dist > radius * 0.55) {
          const theta = Math.atan2(z, x);
          const wave = Math.sin(theta * 6 + seed) * (1.2 * scale);
          pos[i + 1] += wave;
        }
      }
      plateGeom.computeVertexNormals();

      const plateMesh = new THREE.Mesh(plateGeom, plateMat);
      plateMesh.position.set(
        Math.sin(seed + t * 1.7) * (2 * scale),
        tierH,
        Math.cos(seed + t * 1.7) * (2 * scale)
      );
      plateMesh.rotation.x = Math.sin(seed + t) * 0.12;
      plateMesh.rotation.z = Math.cos(seed + t * 2) * 0.12;
      group.add(plateMesh);
    }
    return group;
  },

  // 3. CORAIL CERVEAU / DÔME CANNELÉ (Diploria strigosa)
  createBrain(colorHex, scale = 1.0, seed = 0) {
    const group = new THREE.Group();
    const brainMat = this.createCoralMaterial(colorHex, 0.16, 0.68);

    const radius = (12 + Math.abs(seed % 6)) * scale;
    const geom = new THREE.SphereGeometry(radius, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.58);
    const pos = geom.attributes.position.array;

    for (let i = 0; i < pos.length; i += 3) {
      const x = pos[i];
      const y = pos[i + 1];
      const z = pos[i + 2];
      const furrow = Math.sin(x * 0.35 + Math.cos(z * 0.35)) * Math.cos(z * 0.4 + y * 0.2);
      const bump = Math.sin(y * 0.4) * 0.6;
      pos[i] += (x / radius) * furrow * 1.4;
      pos[i + 1] += (y / radius) * furrow * 1.2 + bump;
      pos[i + 2] += (z / radius) * furrow * 1.4;
    }
    geom.computeVertexNormals();

    const mesh = new THREE.Mesh(geom, brainMat);
    mesh.scale.set(1.1, 0.78, 1.05);
    group.add(mesh);
    return group;
  },

  // 4. GORGONE / ÉVENTAIL DE MER DYNAMIQUE (Subergorgia)
  createSeaFan(colorHex, scale = 1.0, seed = 0) {
    const group = new THREE.Group();
    const fanMat = this.createCoralMaterial(colorHex, 0.28, 0.45);
    fanMat.side = THREE.DoubleSide;

    const fanH = (28 + Math.abs(seed % 12)) * scale;
    const fanW = (22 + Math.abs(seed % 10)) * scale;

    const baseGeom = new THREE.CylinderGeometry(1.2 * scale, 2.5 * scale, 6 * scale, 6);
    baseGeom.translate(0, 3 * scale, 0);
    const baseMesh = new THREE.Mesh(baseGeom, fanMat);
    group.add(baseMesh);

    const fanGroup = new THREE.Group();
    fanGroup.position.y = 5 * scale;

    const ribCount = 8;
    for (let r = 0; r < ribCount; r++) {
      const ratio = (r - (ribCount - 1) / 2) / ((ribCount - 1) / 2);
      const archX = ratio * (fanW * 0.5);
      const ribH = fanH - Math.abs(ratio) * (fanH * 0.35);

      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(archX * 0.4, ribH * 0.45, (Math.sin(r + seed) * 1.5) * scale),
        new THREE.Vector3(archX, ribH, (Math.cos(r + seed) * 1.5) * scale)
      ]);

      const tubeGeom = new THREE.TubeGeometry(curve, 10, 0.65 * scale, 5, false);
      fanGroup.add(new THREE.Mesh(tubeGeom, fanMat));

      if (r > 0) {
        const crossH = ribH * 0.65;
        const prevRatio = (r - 1 - (ribCount - 1) / 2) / ((ribCount - 1) / 2);
        const prevX = prevRatio * (fanW * 0.5);
        const crossCurve = new THREE.LineCurve3(
          new THREE.Vector3(prevX * 0.7, crossH, 0),
          new THREE.Vector3(archX * 0.7, crossH, 0)
        );
        const crossGeom = new THREE.TubeGeometry(crossCurve, 4, 0.4 * scale, 4, false);
        fanGroup.add(new THREE.Mesh(crossGeom, fanMat));
      }
    }

    group.add(fanGroup);
    group.userData.swayTarget = fanGroup;
    group.userData.dynamicSway = true;
    group.userData.swaySeed = seed;
    group.userData.baseRotZ = 0;

    return group;
  },

  // 5. ANÉMONE DE MER & CORAIL MOU VIVANT À TENTACULES (Heteractis magnifica)
  createAnemone(colorHex, scale = 1.0, seed = 0) {
    const group = new THREE.Group();
    const bodyMat = this.createCoralMaterial(colorHex, 0.32, 0.4);

    const columnH = 7 * scale;
    const colGeom = new THREE.CylinderGeometry(4.5 * scale, 5.5 * scale, columnH, 10);
    colGeom.translate(0, columnH / 2, 0);
    const colMesh = new THREE.Mesh(colGeom, bodyMat);
    group.add(colMesh);

    const tentacleMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      emissive: new THREE.Color(colorHex),
      emissiveIntensity: 0.4,
      roughness: 0.3,
      transparent: true,
      opacity: 0.92
    });

    const tentacleCount = 18;
    const tentacles = [];

    for (let i = 0; i < tentacleCount; i++) {
      const angle = (i / tentacleCount) * Math.PI * 2;
      const tLen = (14 + Math.sin(i * 1.5 + seed) * 4) * scale;
      const geom = new THREE.ConeGeometry(0.85 * scale, tLen, 5);
      geom.translate(0, tLen / 2, 0);

      const tentMesh = new THREE.Mesh(geom, tentacleMat);
      tentMesh.position.set(
        Math.cos(angle) * (3.8 * scale),
        columnH * 0.95,
        Math.sin(angle) * (3.8 * scale)
      );

      tentMesh.rotation.y = angle;
      tentMesh.rotation.z = -0.35 + (Math.sin(i * 2 + seed) * 0.12);
      tentMesh.userData.baseRotZ = tentMesh.rotation.z;
      tentMesh.userData.baseRotX = tentMesh.rotation.x;
      tentMesh.userData.seed = i * 0.45 + seed;

      group.add(tentMesh);
      tentacles.push(tentMesh);
    }

    group.userData.tentacles = tentacles;
    group.userData.isAnemone = true;
    group.userData.dynamicSway = true;

    return group;
  },

  // 6. ÉPONGES TUBULAIRES (Aplysina archeri)
  createPillarSponge(colorHex, scale = 1.0, seed = 0) {
    const group = new THREE.Group();
    const spongeMat = this.createCoralMaterial(colorHex, 0.2, 0.7);

    const pipeCount = 3 + Math.floor(Math.abs(seed % 3));
    for (let p = 0; p < pipeCount; p++) {
      const pH = (16 + (p * 7 + Math.floor(seed * 5)) % 22) * scale;
      const pRad = (2.2 + (p * 0.4)) * scale;

      const tubeGeom = new THREE.CylinderGeometry(pRad * 0.85, pRad, pH, 9, 1, true);
      tubeGeom.translate(0, pH / 2, 0);
      const tubeMesh = new THREE.Mesh(tubeGeom, spongeMat);

      const offsetX = (p - 1) * (2.8 * scale) + (Math.sin(p + seed) * scale);
      const offsetZ = Math.cos(p + seed) * (2.4 * scale);
      tubeMesh.position.set(offsetX, 0, offsetZ);
      tubeMesh.rotation.z = Math.sin(p + seed) * 0.08;
      tubeMesh.rotation.x = Math.cos(p + seed) * 0.08;

      const rimGeom = new THREE.TorusGeometry(pRad * 0.85, 0.35 * scale, 6, 12);
      rimGeom.rotateX(Math.PI / 2);
      const rimMesh = new THREE.Mesh(rimGeom, spongeMat);
      rimMesh.position.set(offsetX, pH, offsetZ);

      const innerMat = new THREE.MeshBasicMaterial({ color: 0x050508 });
      const innerGeom = new THREE.CircleGeometry(pRad * 0.75, 8);
      innerGeom.rotateX(-Math.PI / 2);
      const innerMesh = new THREE.Mesh(innerGeom, innerMat);
      innerMesh.position.set(offsetX, pH - 0.5 * scale, offsetZ);

      group.add(tubeMesh);
      group.add(rimMesh);
      group.add(innerMesh);
    }
    return group;
  }
};

// --- LOGIQUE DE CRÉATION DE GÉOMÉTRIE DE POISSON 3D NATURELLE & ARTICULÉE ---
// Convention hydrodynamique : Le poisson est orienté tête vers +Z, dos vers +Y, flancs selon X.
function createFishMesh(config, speciesKey = 'tetra') {
  const group = new THREE.Group();
  const len = config.bodyLength;
  const wid = config.bodyWidth;
  const isAngel = speciesKey === 'angel' || (config.name && config.name.toLowerCase().includes('scalaire'));
  const isMandarin = speciesKey === 'mandarin';
  const isAngler = speciesKey === 'angler';
  const isPredator = config.type === 'predator';

  // Facteurs d'échelle anatomiques selon morphologie de l'espèce
  let aspectX = 0.85;
  let aspectY = 0.95;
  if (isAngel) {
    aspectX = 0.35;
    aspectY = 1.6;
  } else if (isMandarin) {
    aspectX = 1.12;
    aspectY = 0.82;
  } else if (isAngler) {
    aspectX = 0.96;
    aspectY = 1.22;
  }

  const skinTexture = (window.AquaGraphics && window.AquaGraphics.getFishTexture)
    ? window.AquaGraphics.getFishTexture(speciesKey, config)
    : null;

  const finTexture = (window.AquaGraphics && window.AquaGraphics.getFinTexture)
    ? window.AquaGraphics.getFinTexture()
    : null;

  // Matériau PBR haute fidélité avec vernis humide (clearcoat) et iridescence
  const bodyMat = new THREE.MeshPhysicalMaterial({
    map: skinTexture,
    color: skinTexture ? 0xffffff : config.color,
    roughness: isMandarin ? 0.18 : 0.22,
    metalness: isMandarin ? 0.32 : 0.24,
    clearcoat: 0.95,
    clearcoatRoughness: 0.08,
    iridescence: isMandarin ? 0.85 : (isAngel ? 0.65 : 0.35),
    iridescenceIOR: 1.33,
    emissive: config.accentColor,
    emissiveIntensity: isAngler ? 0.35 : (skinTexture ? 0.14 : 0.22)
  });

  const finMat = new THREE.MeshPhysicalMaterial({
    map: finTexture,
    color: config.accentColor,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: isAngel ? 0.72 : (isAngler ? 0.88 : 0.8),
    roughness: 0.18,
    metalness: 0.12,
    clearcoat: 0.85,
    clearcoatRoughness: 0.1
  });

  // 1. Tronc principal profilé hydrodynamique
  const bodyGeom = new THREE.SphereGeometry(wid, 14, 12);
  bodyGeom.scale(aspectX, aspectY, (len * 0.4) / wid);
  const body = new THREE.Mesh(bodyGeom, bodyMat);
  body.position.set(0, 0, 0);
  group.add(body);

  // 2. Tête profilée avec museau en ogive vers +Z
  const headLen = len * (isAngler ? 0.38 : 0.32);
  const headGeom = new THREE.ConeGeometry(wid * (isAngel ? 0.9 : 0.96), headLen, 12);
  headGeom.rotateX(Math.PI / 2); // Pointe vers +Z
  headGeom.scale(aspectX, aspectY * 0.92, 1);
  const head = new THREE.Mesh(headGeom, bodyMat);
  head.position.set(0, 0, len * 0.28);
  group.add(head);

  // Yeux expressifs adaptés à l'espèce
  const eyeRadius = Math.max(0.65, wid * (isMandarin ? 0.28 : (isAngler ? 0.18 : 0.24)));
  const eyeGeom = new THREE.SphereGeometry(eyeRadius, 10, 8);
  const eyeMat = new THREE.MeshBasicMaterial({ color: isAngler ? 0x030712 : 0x090d16 });
  const eyeL = new THREE.Mesh(eyeGeom, eyeMat);
  const eyeR = new THREE.Mesh(eyeGeom, eyeMat);

  let eyeOffsetZ = len * 0.26;
  let eyeOffsetY = wid * 0.18;
  let eyeOffsetX = wid * aspectX * 0.85;

  if (isMandarin) {
    // Yeux surélevés en périscope comme les vrais dragonets
    eyeOffsetY = wid * aspectY * 0.85;
    eyeOffsetX = wid * aspectX * 0.55;
    eyeOffsetZ = len * 0.22;
  } else if (isAngler) {
    eyeOffsetY = wid * aspectY * 0.45;
    eyeOffsetX = wid * aspectX * 0.72;
    eyeOffsetZ = len * 0.24;
  }

  eyeL.position.set(-eyeOffsetX, eyeOffsetY, eyeOffsetZ);
  eyeR.position.set(eyeOffsetX, eyeOffsetY, eyeOffsetZ);
  group.add(eyeL);
  group.add(eyeR);

  // Pupille luisante / Iris
  const pupilGeom = new THREE.SphereGeometry(eyeRadius * 0.42, 6, 6);
  const pupilColor = isAngler ? 0x38bdf8 : (isMandarin ? 0x00f5ff : 0x38bdf8);
  const pupilMat = new THREE.MeshBasicMaterial({ color: pupilColor });
  const pupilL = new THREE.Mesh(pupilGeom, pupilMat);
  pupilL.position.set(-eyeOffsetX - eyeRadius * 0.18, eyeOffsetY + eyeRadius * 0.18, eyeOffsetZ + eyeRadius * 0.32);
  const pupilR = new THREE.Mesh(pupilGeom, pupilMat);
  pupilR.position.set(eyeOffsetX + eyeRadius * 0.18, eyeOffsetY + eyeRadius * 0.18, eyeOffsetZ + eyeRadius * 0.32);
  group.add(pupilL);
  group.add(pupilR);

  // Spécificités anatomiques du Poisson-Lanterne (Baudroie des Abysses)
  if (isAngler) {
    // Mâchoire inférieure prognathe avec rangée de dents acérées
    const jawGeom = new THREE.BoxGeometry(wid * 0.85, wid * 0.26, len * 0.24);
    const jaw = new THREE.Mesh(jawGeom, bodyMat);
    jaw.position.set(0, -wid * 0.22, len * 0.32);
    group.add(jaw);

    // Dents aiguilles translucides
    const fangMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc, transparent: true, opacity: 0.9 });
    for (let f = -3; f <= 3; f++) {
      const fang = new THREE.Mesh(new THREE.ConeGeometry(0.32, 2.0, 4), fangMat);
      fang.position.set(f * (wid * 0.12), -wid * 0.08, len * 0.41);
      fang.rotation.x = Math.PI * 0.22;
      group.add(fang);
    }

    // Illicium (Antenne arquée vers l'avant au-dessus de la bouche)
    const rodCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0, wid * aspectY * 0.7, len * 0.18),
      new THREE.Vector3(0, wid * aspectY * 2.1, len * 0.42),
      new THREE.Vector3(0, wid * aspectY * 1.5, len * 0.68)
    );
    const rodGeom = new THREE.TubeGeometry(rodCurve, 12, 0.32, 6, false);
    const rodMat = new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 0.4 });
    const rod = new THREE.Mesh(rodGeom, rodMat);
    group.add(rod);

    // Esca (Lanterne bioluminescente éclatante) avec vraie source de lumière Three.js
    const escaPos = new THREE.Vector3(0, wid * aspectY * 1.5, len * 0.68);
    const escaGeom = new THREE.SphereGeometry(1.4, 10, 8);
    const escaMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const esca = new THREE.Mesh(escaGeom, escaMat);
    esca.position.copy(escaPos);
    group.add(esca);

    const lanternLight = new THREE.PointLight(0x38bdf8, 1.6, 95);
    lanternLight.position.copy(escaPos);
    group.add(lanternLight);

    group.userData.lanternLight = lanternLight;
    group.userData.esca = esca;
  }

  // 3. Nageoires Pectorales Gauche & Droite articulées
  const pecLGroup = new THREE.Group();
  pecLGroup.position.set(-eyeOffsetX * 1.05, -wid * 0.15, len * 0.12);
  const pecRGroup = new THREE.Group();
  pecRGroup.position.set(eyeOffsetX * 1.05, -wid * 0.15, len * 0.12);

  const pecShape = new THREE.Shape();
  if (isMandarin) {
    // Nageoires pectorales larges en éventail de papillon
    pecShape.moveTo(0, 0);
    pecShape.quadraticCurveTo(-wid * 0.8, wid * 0.35, -wid * 1.35, 0);
    pecShape.quadraticCurveTo(-wid * 1.55, -wid * 0.7, -wid * 0.9, -wid * 1.25);
    pecShape.quadraticCurveTo(-wid * 0.3, -wid * 0.85, 0, -wid * 0.35);
  } else {
    pecShape.moveTo(0, 0);
    pecShape.lineTo(-wid * 0.3, -wid * 0.5);
    pecShape.lineTo(-wid * 0.8, -wid * 1.3);
    pecShape.lineTo(0, -wid * 0.8);
  }
  pecShape.closePath();
  const pecGeom = new THREE.ShapeGeometry(pecShape);
  const pecMeshL = new THREE.Mesh(pecGeom, finMat);
  pecMeshL.rotation.y = -Math.PI / 6;
  pecLGroup.add(pecMeshL);

  const pecMeshR = new THREE.Mesh(pecGeom, finMat);
  pecMeshR.scale.x = -1;
  pecMeshR.rotation.y = Math.PI / 6;
  pecRGroup.add(pecMeshR);

  group.add(pecLGroup);
  group.add(pecRGroup);

  // 4. Nageoire Dorsale (En haut sur l'axe +Y)
  const dorsalShape = new THREE.Shape();
  if (isAngel) {
    // Immense dorsale effilée vers l'arrière pour le Scalaire
    dorsalShape.moveTo(0, wid * aspectY * 0.8);
    dorsalShape.lineTo(0, wid * aspectY * 2.8);
    dorsalShape.lineTo(-len * 0.45, wid * aspectY * 1.2);
    dorsalShape.lineTo(-len * 0.3, wid * aspectY * 0.6);
  } else if (isMandarin) {
    // Première dorsale en grand voilier majestueux avec filament
    dorsalShape.moveTo(0, wid * aspectY * 0.8);
    dorsalShape.quadraticCurveTo(0, wid * aspectY * 2.9, -len * 0.14, wid * aspectY * 3.3);
    dorsalShape.quadraticCurveTo(-len * 0.32, wid * aspectY * 1.8, -len * 0.48, wid * aspectY * 0.7);
  } else if (isAngler) {
    // Dorsale en épines sombres de prédateur abyssal
    dorsalShape.moveTo(0, wid * aspectY * 0.75);
    dorsalShape.lineTo(-len * 0.15, wid * aspectY * 1.35);
    dorsalShape.lineTo(-len * 0.35, wid * aspectY * 0.65);
  } else {
    dorsalShape.moveTo(0, wid * aspectY * 0.7);
    dorsalShape.lineTo(-len * 0.12, wid * aspectY * 1.5);
    dorsalShape.lineTo(-len * 0.38, wid * aspectY * 0.6);
  }
  dorsalShape.closePath();
  const dorsal = new THREE.Mesh(new THREE.ShapeGeometry(dorsalShape), finMat);
  dorsal.position.z = len * 0.05;
  group.add(dorsal);

  // 5. Nageoire Anale / Pelvienne (Sous le ventre en -Y)
  const analShape = new THREE.Shape();
  if (isAngel) {
    // Longs filaments ventraux du scalaire
    analShape.moveTo(0, -wid * aspectY * 0.7);
    analShape.lineTo(-len * 0.1, -wid * aspectY * 3.0);
    analShape.lineTo(-len * 0.2, -wid * aspectY * 1.2);
    analShape.lineTo(-len * 0.3, -wid * aspectY * 0.5);
  } else if (isMandarin) {
    // Nageoires pelviennes étalées pour glisser sur les roches
    analShape.moveTo(0, -wid * aspectY * 0.65);
    analShape.quadraticCurveTo(-len * 0.15, -wid * aspectY * 1.45, -len * 0.35, -wid * aspectY * 0.45);
  } else {
    analShape.moveTo(0, -wid * aspectY * 0.6);
    analShape.lineTo(-len * 0.18, -wid * aspectY * 1.2);
    analShape.lineTo(-len * 0.32, -wid * aspectY * 0.4);
  }
  analShape.closePath();
  const analFin = new THREE.Mesh(new THREE.ShapeGeometry(analShape), finMat);
  analFin.position.z = -len * 0.05;
  group.add(analFin);

  // 6. Chaîne Caudale Articulée à Deux Segments (Pédoncule + Nageoire Caudale)
  // Joint 1: Pédoncule caudal (fléchit d'abord)
  const tailJoint1 = new THREE.Group();
  tailJoint1.position.set(0, 0, -len * 0.35);

  const peduncleGeom = new THREE.ConeGeometry(wid * aspectX * 0.7, len * 0.35, 8);
  peduncleGeom.rotateX(-Math.PI / 2); // Pointe vers -Z
  peduncleGeom.scale(1, aspectY * 0.8, 1);
  const peduncle = new THREE.Mesh(peduncleGeom, bodyMat);
  peduncle.position.set(0, 0, -len * 0.17);
  tailJoint1.add(peduncle);

  // Joint 2: Nageoire caudale (attachée au bout du pédoncule, ondule avec déphasage)
  const tailJoint2 = new THREE.Group();
  tailJoint2.position.set(0, 0, -len * 0.34);

  const caudalShape = new THREE.Shape();
  const finSpread = wid * (isAngel ? 2.2 : (isMandarin ? 1.8 : 1.35));
  const finBack = -len * (isAngel ? 0.7 : (isMandarin ? 0.55 : 0.5));

  if (isMandarin) {
    // Nageoire caudale en grand éventail arrondi avec ornement
    caudalShape.moveTo(0, 0);
    caudalShape.quadraticCurveTo(0, finSpread * 0.85, finBack * 0.7, finSpread);
    caudalShape.quadraticCurveTo(finBack * 1.1, 0, finBack * 0.7, -finSpread);
    caudalShape.quadraticCurveTo(0, -finSpread * 0.85, 0, 0);
  } else {
    caudalShape.moveTo(0, 0);
    caudalShape.lineTo(0, finSpread * 0.7);
    caudalShape.lineTo(finBack, finSpread);
    caudalShape.lineTo(finBack * 0.6, 0); // Échancrure centrale
    caudalShape.lineTo(finBack, -finSpread);
    caudalShape.lineTo(0, -finSpread * 0.7);
  }
  caudalShape.closePath();

  const caudalMesh = new THREE.Mesh(new THREE.ShapeGeometry(caudalShape), finMat);
  tailJoint2.add(caudalMesh);

  tailJoint1.add(tailJoint2);
  group.add(tailJoint1);

  // Références d'animation exposées dans userData
  group.userData.head = head;
  group.userData.bodyMesh = body;
  group.userData.dorsal = dorsal;
  group.userData.tailJoint1 = tailJoint1;
  group.userData.tailJoint2 = tailJoint2;
  group.userData.pectoralL = pecLGroup;
  group.userData.pectoralR = pecRGroup;

  return group;
}

// --- CLASSE BOID ULTRA-RÉALISTE (LOCOMOTION NATURELLE, BANKING & ESSAIM) ---
class Boid {
  constructor(speciesKey, isBaby = false, parentGen = 0) {
    this.species = speciesKey;
    this.config = SPECIES_CONFIG[speciesKey];
    this.isPredator = this.config.type === 'predator';
    this.isAngel = speciesKey === 'angel' || (this.config.name && this.config.name.toLowerCase().includes('scalaire'));
    this.isMandarin = speciesKey === 'mandarin';
    this.isAngler = speciesKey === 'angler';
    this.generation = isBaby ? parentGen + 1 : 1;
    this.age = isBaby ? 0 : Math.random() * 2000;
    this.maxAge = 5500 + Math.random() * 2000;
    this.isAdult = !isBaby;
    this.energy = 80 + Math.random() * 20;
    this.isMating = false;
    this.matingCooldown = 600 + Math.random() * 600;
    this.isDiseased = false;
    this.diseaseTimer = 0;
    this.isDead = false;
    this.isSleeping = false;
    this.wakeTimer = 0;

    // Position initiale aléatoire bien au cœur du volume d'eau
    this.position = new THREE.Vector3(
      (Math.random() - 0.5) * (TANK.width - 80),
      this.isMandarin ? Math.random() * 50 + 20 : (this.isAngler ? Math.random() * 70 + 25 : Math.random() * (TANK.height - 80) + 40),
      (Math.random() - 0.5) * (TANK.depth - 80)
    );

    // Vitesse initiale et direction
    const initialHeading = new THREE.Vector3(
      Math.random() * 2 - 1,
      (Math.random() * 2 - 1) * 0.25,
      Math.random() * 2 - 1
    ).normalize();

    this.velocity = initialHeading.clone().multiplyScalar(this.config.maxSpeed * (0.6 + Math.random() * 0.3));
    this.acceleration = new THREE.Vector3();
    this.currentForward = initialHeading.clone();

    // Paramètres cinématiques et biomécaniques
    this.currentRoll = 0;
    this.currentPitch = 0;
    this.yawRate = 0;
    this.swimPhase = Math.random() * Math.PI * 2;
    this.burstTimer = Math.random() * 60;
    this.isGliding = false;
    this.wanderAngle = Math.random() * Math.PI * 2;
    this.wanderSpeed = 0.05 + Math.random() * 0.05;
    this.buoyancyCycle = Math.random() * Math.PI * 2;
    this.fleeCooldown = 0;

    // Facteurs spécifiques à l'espèce pour l'agilité et le style de nage
    if (this.isAngel) {
      this.turnAgility = 2.4;
      this.bankingFactor = 0.25; // Nage plus verticale et majestueuse
      this.burstFrequency = 0.03; // Longues glisses
    } else if (this.isMandarin) {
      this.turnAgility = 4.2;
      this.bankingFactor = 0.32; // Nage avec petits ronds gracieux
      this.burstFrequency = 0.16; // Nage saccadée et curieuse de dragonet
    } else if (this.isAngler) {
      this.turnAgility = 3.4;
      this.bankingFactor = 0.28;
      this.burstFrequency = 0.04; // Glisse silencieuse à l'affût
    } else if (this.isPredator) {
      this.turnAgility = 4.5;
      this.bankingFactor = 0.45;
      this.burstFrequency = 0.07;
    } else {
      this.turnAgility = 5.2;
      this.bankingFactor = 0.55;
      this.burstFrequency = 0.09;
    }

    // Création graphique du mesh Three.js
    this.mesh = createFishMesh(this.config, this.species);
    const initialScale = isBaby ? this.config.scale * 0.4 : this.config.scale;
    this.mesh.scale.set(initialScale, initialScale, initialScale);
    this.mesh.position.copy(this.position);
    this.mesh.userData.boid = this;

    // Orientation initiale alignée sur la vélocité
    this.updateOrientation(0.016);
  }

  applyForce(f) {
    this.acceleration.add(f);
  }

  update(delta, boids, foods, ropefish, ripples, rocks = [], plants = [], corals = []) {
    if (this.isDead) return;

    // 1. Cycle biologique (Âge, Énergie, Maladies)
    this.age += delta * 60;
    this.energy -= delta * 0.7;
    if (this.matingCooldown > 0) this.matingCooldown -= delta * 60;
    if (this.fleeCooldown > 0) this.fleeCooldown -= delta;

    if (!this.isAdult && this.age > 600) {
      this.isAdult = true;
      this.mesh.scale.set(this.config.scale, this.config.scale, this.config.scale);
    }

    if (this.isDiseased) {
      this.diseaseTimer += delta * 60;
      if (this.mesh.userData.bodyMesh) {
        this.mesh.userData.bodyMesh.material.color.setHex(0x84cc16);
      }
      if (this.diseaseTimer > 850) {
        this.die("maladie");
        return;
      }
    }

    if (this.age > this.maxAge || this.energy <= 0) {
      this.die(this.energy <= 0 ? "famine" : "vieillesse");
      return;
    }

    // 1b. Cycle Circadien : Sommeil des proies diurnes et Éveil des créatures nocturnes
    const sunFactor = (typeof DAY_NIGHT_CYCLE !== 'undefined') ? DAY_NIGHT_CYCLE.sunFactor : 1.0;
    const isNight = sunFactor < 0.28;
    const isNocturnal = this.species === 'angler' || this.species === 'mandarin';

    if (this.wakeTimer > 0) {
      this.wakeTimer -= delta;
    }

    if (isNight && !this.isPredator && !isNocturnal && this.wakeTimer <= 0) {
      // Les proies diurnes dorment la nuit
      this.isSleeping = true;
      this.energy = Math.min(100, this.energy + delta * 0.55); // Récupération métabolique pendant le sommeil
      // Descente douce vers le substrat ou les herbiers pour trouver un abri tranquille
      if (this.position.y > 38) {
        this.applyForce(new THREE.Vector3(0, -0.16, 0));
      }
      // Regroupement passif et calme près des rochers pour protection nocturne
      if (rocks && rocks.length > 0 && Math.random() < 0.1) {
        let nearestRock = null;
        let minDist = 180;
        for (const r of rocks) {
          const dist = this.position.distanceTo(r.position);
          if (dist < minDist) {
            minDist = dist;
            nearestRock = r;
          }
        }
        if (nearestRock && minDist > 35) {
          const shelterDir = new THREE.Vector3().subVectors(nearestRock.position, this.position).normalize();
          this.applyForce(shelterDir.multiplyScalar(0.08));
        }
      }
    } else {
      this.isSleeping = false;
    }

    // 2. Événements impulsionnels (Ondes de choc / Tape sur la vitre)
    for (const rip of ripples) {
      const d = this.position.distanceTo(rip.position);
      if (d < rip.radius + 70 && d > Math.max(0, rip.radius - 50)) {
        const fleeVec = new THREE.Vector3().subVectors(this.position, rip.position).normalize();
        this.applyForce(fleeVec.multiplyScalar(this.isSleeping ? 6.2 : 4.5));
        this.isGliding = false;
        this.fleeCooldown = 2.2;
        // Réveil brutal en sursaut avec fuite réflexe
        if (this.isSleeping) {
          this.isSleeping = false;
          this.wakeTimer = 5.5; // Alerte post-choc avant de pouvoir se rendormir
        }
      }
    }

    // 3. Danger Super-Prédateurs Titans (Mégalodon, Mosasaure, Kraken, Léviathan)
    if (ropefish) {
      const preds = Array.isArray(ropefish) ? ropefish : [ropefish];
      for (let pIdx = 0; pIdx < preds.length; pIdx++) {
        const sp = preds[pIdx];
        if (!sp || !sp.active) continue;
        const sHead = sp.getHeadPosition();
        const d = this.position.distanceTo(sHead);
        const isAttacking = sp.state === 'STRIKE' || sp.state === 'CHARGE' || sp.state === 'TENTACLE_STRIKE';
        const panicRadius = isAttacking ? 240 : 160;
        if (d < panicRadius) {
          const fleeDir = new THREE.Vector3().subVectors(this.position, sHead).normalize();
          const urgency = Math.pow((panicRadius - d) / panicRadius, 1.4) * (isAttacking ? 6.2 : 3.8);
          this.applyForce(fleeDir.multiplyScalar(urgency));
          this.isGliding = false;
          this.fleeCooldown = 1.6;
          // Si le poisson dormait, il se réveille instantanément
          if (this.isSleeping) {
            this.isSleeping = false;
            this.wakeTimer = 4.0;
          }
        }
      }
    }

    // 4. Comportements spécifiques (Proies vs Prédateurs)
    if (this.isPredator) {
      this.hunt(boids);
    } else {
      this.flockAndSurvive(boids, foods, plants);
    }

    // 5. Flânerie naturelle et exploration (Wander)
    this.applyNaturalWander(delta);

    // 6. Évitement doux des parois de l'aquarium (Soft Boundary Cushion)
    this.applySoftBoundaries();

    // 7. Évitement des obstacles solides (Rochers)
    if (rocks && rocks.length > 0) {
      this.avoidObstacles(rocks);
    }

    // 7b. Évitement des récifs coralliens et exploration benthique
    if (corals && corals.length > 0) {
      for (const coral of corals) {
        const cPos = coral.position || (coral.mesh && coral.mesh.position);
        if (!cPos) continue;
        const rad = coral.radius || 18;
        const safeDist = rad + (this.isMandarin ? 5 : 12);
        const d = this.position.distanceTo(cPos);
        if (d < safeDist && d > 1) {
          const pushDir = new THREE.Vector3().subVectors(this.position, cPos).normalize();
          const force = ((safeDist - d) / safeDist) * 1.8;
          this.applyForce(pushDir.multiplyScalar(force));
        }
      }

      // Attirance gourmande du Mandarin pour fouiller les cavités coralliennes
      if (this.isMandarin && Math.random() < 0.08) {
        const cTarget = corals[Math.floor(Math.random() * corals.length)];
        const cPos = cTarget.position || (cTarget.mesh && cTarget.mesh.position);
        if (cPos && this.position.distanceTo(cPos) < 110) {
          const grazeVec = new THREE.Vector3().subVectors(cPos, this.position).normalize();
          this.applyForce(grazeVec.multiplyScalar(0.08));
        }
      }
    }

    // 8. Courant marin
    if (SIM_SETTINGS.env.currentSpeed > 0) {
      this.applyForce(new THREE.Vector3(SIM_SETTINGS.env.currentSpeed * 0.04, 0, 0));
    }

    // 8b. Préférence écologique de strate d'eau (Niche biologique)
    if (this.isMandarin) {
      // Le Mandarin benthique adore explorer les fonds rocheux et le sable
      if (this.position.y > 65) {
        this.applyForce(new THREE.Vector3(0, -0.09, 0));
      } else if (this.position.y < 12) {
        this.applyForce(new THREE.Vector3(0, 0.12, 0));
      }
    } else if (this.isAngler) {
      // La Baudroie des abysses rôde dans les profondeurs ténébreuses
      if (this.position.y > 95) {
        this.applyForce(new THREE.Vector3(0, -0.08, 0));
      } else if (this.position.y < 16) {
        this.applyForce(new THREE.Vector3(0, 0.1, 0));
      }
    }

    // 9. Intégration Dynamique & Traînée Hydrodynamique Réaliste
    const speedMult = SIM_SETTINGS.speed;
    this.velocity.addScaledVector(this.acceleration, delta * 60 * speedMult);

    // Traînée de frottement de l'eau (l'eau amortit la vitesse, surtout sur l'axe vertical)
    const dragCoeff = 0.018 * (this.isGliding ? 1.4 : 1.0);
    this.velocity.x *= (1 - dragCoeff);
    this.velocity.y *= (1 - dragCoeff * 1.8); // Stabilisation de profondeur
    this.velocity.z *= (1 - dragCoeff);

    // Respiration de flottabilité neutre
    this.buoyancyCycle += delta * 2.2;
    this.velocity.y += Math.sin(this.buoyancyCycle) * 0.015;

    // Bornage de vitesse adapté (ralenti la nuit si repos, vivacité nocturne accrue pour les chasseurs)
    let currentMaxSpeed = this.config.maxSpeed * (this.isDiseased ? 0.6 : 1.0);
    if (this.isSleeping) {
      currentMaxSpeed *= 0.35; // Nage très lente et apaisée pendant le sommeil
    } else if (isNight && isNocturnal) {
      currentMaxSpeed *= 1.25; // Vivacité accrue pour les créatures nocturnes
    }
    if (this.fleeCooldown > 0) currentMaxSpeed *= 1.45;
    this.velocity.clampLength(0.06, currentMaxSpeed);

    // Déplacement réel
    this.position.addScaledVector(this.velocity, delta * 60 * speedMult);
    this.acceleration.set(0, 0, 0);

    // 10. Calcul de l'Orientation 3D Réaliste avec Roulis (Banking) & Tangage (Pitch)
    this.updateOrientation(delta);

    // Scintillement caustique zénithal sur les écailles sous la surface de l'eau
    if (this.mesh && this.mesh.userData.bodyMesh && this.mesh.userData.bodyMesh.material) {
      if (this.position.y > 80) {
        const causticFlicker = Math.sin(Date.now() * 0.006 + this.position.x * 0.08) * 0.18 + 0.18;
        const depthRatio = Math.min(1.0, (this.position.y - 80) / 100);
        this.mesh.userData.bodyMesh.material.emissiveIntensity = 0.15 + causticFlicker * depthRatio;
      }
    }

    // 11. Animation Bio-Mécanique des Nageoires (Burst-and-Coast & Double-Joint Caudal)
    this.animateFinLocomotion(delta);
  }

  // Flânerie bio-inspirée créant des trajectoires vivantes et légèrement ondulantes
  applyNaturalWander(delta) {
    this.wanderAngle += (Math.random() - 0.5) * this.wanderSpeed;
    const forward = this.velocity.clone().normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const right = new THREE.Vector3().crossVectors(forward, up).normalize();

    // Petit écartement latéral sinusoïdal
    const wanderForce = right.multiplyScalar(Math.sin(this.wanderAngle) * 0.12);
    wanderForce.y += Math.cos(this.wanderAngle * 0.7) * 0.04;
    this.applyForce(wanderForce);
  }

  // Évitement doux et progressif des parois du réservoir
  applySoftBoundaries() {
    const margin = 55; // Zone de détection d'approche
    const pushStrength = 2.4;
    const halfW = TANK.width / 2;
    const halfD = TANK.depth / 2;

    // Vitres latérales X
    if (this.position.x < -halfW + margin) {
      const factor = (margin - (this.position.x - (-halfW))) / margin;
      this.applyForce(new THREE.Vector3(factor * factor * pushStrength, 0, 0));
    } else if (this.position.x > halfW - margin) {
      const factor = (margin - (halfW - this.position.x)) / margin;
      this.applyForce(new THREE.Vector3(-factor * factor * pushStrength, 0, 0));
    }

    // Fond et Surface Y
    if (this.position.y < 35) {
      const factor = Math.max(0, (35 - this.position.y) / 35);
      this.applyForce(new THREE.Vector3(0, factor * factor * pushStrength * 1.5, 0));
    } else if (this.position.y > TANK.height - margin) {
      const factor = (margin - (TANK.height - this.position.y)) / margin;
      this.applyForce(new THREE.Vector3(0, -factor * factor * pushStrength * 1.5, 0));
    }

    // Vitres avant / arrière Z
    if (this.position.z < -halfD + margin) {
      const factor = (margin - (this.position.z - (-halfD))) / margin;
      this.applyForce(new THREE.Vector3(0, 0, factor * factor * pushStrength));
    } else if (this.position.z > halfD - margin) {
      const factor = (margin - (halfD - this.position.z)) / margin;
      this.applyForce(new THREE.Vector3(0, 0, -factor * factor * pushStrength));
    }

    // Confinement strict de secours absolu
    const hardMargin = 12;
    this.position.x = THREE.MathUtils.clamp(this.position.x, -halfW + hardMargin, halfW - hardMargin);
    this.position.y = THREE.MathUtils.clamp(this.position.y, 22, TANK.height - hardMargin);
    this.position.z = THREE.MathUtils.clamp(this.position.z, -halfD + hardMargin, halfD - hardMargin);
  }

  // Évitement des rochers
  avoidObstacles(rocks) {
    for (const rock of rocks) {
      const rockRadius = (rock.geometry && rock.geometry.parameters && rock.geometry.parameters.radius) || 25;
      const safeDist = rockRadius + 18;
      const d = this.position.distanceTo(rock.position);
      if (d < safeDist) {
        const pushDir = new THREE.Vector3().subVectors(this.position, rock.position).normalize();
        const force = ((safeDist - d) / safeDist) * 2.2;
        this.applyForce(pushDir.multiplyScalar(force));
      }
    }
  }

  // Flocking bio-inspiré avec cône de vision réaliste (pas d'yeux derrière la queue !)
  flockAndSurvive(boids, foods, plants) {
    let sepSum = new THREE.Vector3();
    let aliSum = new THREE.Vector3();
    let cohSum = new THREE.Vector3();
    let fleeSum = new THREE.Vector3();
    let neighborCount = 0;
    let fleeCount = 0;

    const myDir = this.velocity.clone().normalize();

    // 1. Attraction vers la nourriture si faim
    if (foods && foods.length > 0 && this.energy < 85) {
      let nearestFood = null;
      let minDist = 130;
      for (const f of foods) {
        if (f.isEaten) continue;
        const d = this.position.distanceTo(f.position);
        if (d < minDist) {
          minDist = d;
          nearestFood = f;
        }
      }
      if (nearestFood) {
        const toFood = new THREE.Vector3().subVectors(nearestFood.position, this.position).normalize();
        this.applyForce(toFood.multiplyScalar(1.5));
        if (minDist < 8) {
          nearestFood.isEaten = true;
          this.energy = Math.min(100, this.energy + 35);
          audio.playBubble();
          // Coup de queue vif de satisfaction
          this.isGliding = false;
        }
      }
    }

    // 2. Interaction avec congénères et prédateurs
    for (let i = 0; i < boids.length; i++) {
      const other = boids[i];
      if (other === this || other.isDead) continue;
      const toOther = new THREE.Vector3().subVectors(other.position, this.position);
      const d = toOther.length();

      // Fuite d'urgence des prédateurs (priorité absolue)
      if (other.isPredator && d < this.config.fearRadius) {
        const fleeDir = toOther.clone().negate().normalize();
        const panic = Math.pow((this.config.fearRadius - d) / this.config.fearRadius, 1.6);
        fleeSum.add(fleeDir.multiplyScalar(panic));
        fleeCount++;
        continue;
      }

      // Interaction avec banc de même espèce
      if (other.species === this.species && d < this.config.perceptionRadius) {
        // Cône de vision réaliste : angle de vision d'environ 240 degrés (-0.5 en cosinus)
        const dirNorm = toOther.clone().normalize();
        if (myDir.dot(dirNorm) < -0.5) continue; // Hors champ de vision arrière

        // Séparation progressive non linéaire
        const personalSpace = this.config.bodyLength * 1.8;
        if (d < personalSpace) {
          const sep = toOther.clone().negate().normalize().multiplyScalar((personalSpace - d) / personalSpace);
          sepSum.add(sep);
        }

        aliSum.add(other.velocity);
        cohSum.add(other.position);
        neighborCount++;

        // Transmission contagion si infecté
        if (this.isDiseased && !other.isDiseased && d < 14 && Math.random() < 0.04) {
          other.isDiseased = true;
        }

        // Reproduction spontanée
        if (this.isAdult && other.isAdult && this.matingCooldown <= 0 && other.matingCooldown <= 0 && this.energy > 65 && Math.random() < this.config.fertility * 0.04) {
          this.layEgg();
          this.matingCooldown = 1200;
          other.matingCooldown = 1200;
        }
      }
    }

    // Application pondérée des forces de banc
    if (fleeCount > 0) {
      fleeSum.normalize().multiplyScalar(this.config.maxSpeed * 3.0);
      this.applyForce(fleeSum);
      this.isGliding = false;
      this.fleeCooldown = 1.4;
    } else if (neighborCount > 0) {
      sepSum.multiplyScalar(SIM_SETTINGS.flocking.separation * 1.6);
      aliSum.divideScalar(neighborCount).normalize().multiplyScalar(SIM_SETTINGS.flocking.alignment * 1.2);
      cohSum.divideScalar(neighborCount).sub(this.position).normalize().multiplyScalar(SIM_SETTINGS.flocking.cohesion * 0.9);

      this.applyForce(sepSum);
      this.applyForce(aliSum);
      this.applyForce(cohSum);
    }

    // 3. Affinité de refuge avec les plantes (herbiers)
    if (plants && plants.length > 0 && neighborCount < 3 && !this.isPredator) {
      let nearestPlant = null;
      let minPlantDist = 65;
      for (const p of plants) {
        const dist = this.position.distanceTo(p.position);
        if (dist < minPlantDist) {
          minPlantDist = dist;
          nearestPlant = p;
        }
      }
      if (nearestPlant) {
        const seekPlant = new THREE.Vector3().subVectors(nearestPlant.position, this.position).normalize();
        this.applyForce(seekPlant.multiplyScalar(0.25));
      }
    }
  }

  // Traque réaliste pour les prédateurs (Rôder puis Bondir)
  hunt(boids) {
    let closestPrey = null;
    let minDist = this.config.perceptionRadius;

    for (let i = 0; i < boids.length; i++) {
      const target = boids[i];
      if (target.isPredator || target.isDead) continue;
      const d = this.position.distanceTo(target.position);
      if (d < minDist) {
        minDist = d;
        closestPrey = target;
      }
    }

    if (closestPrey) {
      const toPrey = new THREE.Vector3().subVectors(closestPrey.position, this.position);
      const dist = toPrey.length();
      const chaseDir = toPrey.clone().normalize();

      // Si le prédateur est à distance d'attaque (< 45), il bondit à pleine puissance
      if (dist < 45) {
        this.applyForce(chaseDir.multiplyScalar(2.6));
        this.isGliding = false;
      } else {
        // Approche discrète à l'affût
        this.applyForce(chaseDir.multiplyScalar(1.2));
      }

      // Capture de la proie
      if (dist < 11) {
        closestPrey.die("dévoré");
        this.energy = 100;
        STATS.preyEaten++;
        audio.playBubble();
        showToast(I18N[currentLang].predator_eat.replace('{predator}', this.config.name).replace('{prey}', closestPrey.config.name), '🩸');
        this.isGliding = true; // Pause post-repas
      }
    }
  }

  layEgg() {
    if (aquarium) {
      aquarium.spawnEgg(this.species, this.position.clone(), this.generation);
    }
  }

  // Orientation 3D soignée par Quaternions avec Roulis dans les virages (Banking)
  updateOrientation(delta) {
    this.mesh.position.copy(this.position);

    if (this.velocity.lengthSq() < 0.0001) return;

    const newForward = this.velocity.clone().normalize();

    // 1. Calcul du taux de virage (yaw rate) sur le plan horizontal XZ
    const crossY = (this.currentForward.x * newForward.z - this.currentForward.z * newForward.x);
    this.yawRate = THREE.MathUtils.lerp(this.yawRate, crossY, 0.15);

    // 2. Roulis (Banking) : le dos du poisson s'incline vers l'intérieur du virage
    const targetRoll = THREE.MathUtils.clamp(-this.yawRate * 18.0 * this.bankingFactor, -0.65, 0.65);
    this.currentRoll = THREE.MathUtils.lerp(this.currentRoll, targetRoll, 0.12);

    // 3. Tangage (Pitch) : inclinaison du museau en montée / descente
    const targetPitch = Math.asin(THREE.MathUtils.clamp(newForward.y, -0.75, 0.75));
    this.currentPitch = THREE.MathUtils.lerp(this.currentPitch, targetPitch, 0.15);

    // 4. Calcul de l'angle de lacet (Yaw)
    const yaw = Math.atan2(newForward.x, newForward.z);

    // 5. Quaternion cible avec ordre aérodynamique YXZ
    const targetEuler = new THREE.Euler(-this.currentPitch, yaw, this.currentRoll, 'YXZ');
    const targetQuat = new THREE.Quaternion().setFromEuler(targetEuler);

    // Interpolation sphérique souple (slerp)
    const slerpFactor = THREE.MathUtils.clamp(delta * this.turnAgility * 3.8 * SIM_SETTINGS.speed, 0.05, 0.4);
    this.mesh.quaternion.slerp(targetQuat, slerpFactor);

    this.currentForward.copy(newForward);
  }

  // Animation biomécanique : Propulsion par battements de queue déphasés et nageoires pectorales
  animateFinLocomotion(delta) {
    const speed = this.velocity.length();
    const speedRatio = THREE.MathUtils.clamp(speed / this.config.maxSpeed, 0.1, 1.8);

    // Alternance "Burst-and-Coast" (propulsion active vs glisse hydrodynamique)
    this.burstTimer += delta;
    if (this.isGliding) {
      if (this.burstTimer > 1.2 || this.fleeCooldown > 0) {
        this.isGliding = false;
        this.burstTimer = 0;
      }
    } else {
      if (this.burstTimer > 1.8 && Math.random() < this.burstFrequency) {
        this.isGliding = true;
        this.burstTimer = 0;
      }
    }

    // Fréquence et amplitude adaptées
    let freq = (this.isGliding ? 4.0 : 10.0) * speedRatio * (this.isAngel ? 0.65 : 1.0);
    let ampBase = (this.isGliding ? 0.18 : 0.42) * (this.isAngel ? 0.7 : 1.0);

    if (this.isSleeping) {
      freq *= 0.35; // Mouvements très lents et apaisés pendant le sommeil
      ampBase *= 0.45;
    }

    this.swimPhase += delta * freq * SIM_SETTINGS.speed;

    const tail1 = this.mesh.userData.tailJoint1;
    const tail2 = this.mesh.userData.tailJoint2;
    const pecL = this.mesh.userData.pectoralL;
    const pecR = this.mesh.userData.pectoralR;
    const head = this.mesh.userData.head;

    if (tail1 && tail2) {
      // Onde de courbure subcarangiforme : Joint 1 ondule, Joint 2 amplifie avec retard de phase
      const angle1 = Math.sin(this.swimPhase) * ampBase;
      const angle2 = Math.sin(this.swimPhase - 0.75) * ampBase * 1.35;

      tail1.rotation.y = angle1;
      tail2.rotation.y = angle2;

      // Contre-mouvement naturel et subtil de la tête pour donner une consistance osseuse
      if (head) {
        head.rotation.y = -angle1 * 0.18;
      }
    }

    // Nageoires pectorales : rament doucement et s'écartent en position de freinage/stabilisation
    if (pecL && pecR) {
      if (this.isMandarin) {
        // Battements rapides d'éventails pectoraux de dragonet
        const flutter = Math.sin(this.swimPhase * 2.2) * 0.38;
        pecL.rotation.y = -0.35 - flutter;
        pecR.rotation.y = 0.35 + flutter;
      } else {
        const pecWave = Math.sin(this.swimPhase * 0.8) * 0.15;
        const glideSpread = this.isGliding ? 0.3 : 0.0;
        pecL.rotation.y = -0.25 - pecWave - glideSpread;
        pecR.rotation.y = 0.25 + pecWave + glideSpread;
      }
    }

    // Ondulation du grand voilier dorsal du mandarin
    if (this.isMandarin && this.mesh.userData.dorsal) {
      this.mesh.userData.dorsal.rotation.z = Math.sin(this.swimPhase * 1.3) * 0.12;
    }

    // Pulsation bioluminescente vivante de la lanterne abyssale (Poisson-Lanterne)
    if (this.isAngler && this.mesh.userData.lanternLight) {
      const pulseIntensity = 1.3 + Math.sin(this.swimPhase * 1.6) * 0.7;
      this.mesh.userData.lanternLight.intensity = pulseIntensity;
      if (this.mesh.userData.esca) {
        const s = 1.0 + Math.sin(this.swimPhase * 1.6) * 0.18;
        this.mesh.userData.esca.scale.set(s, s, s);
      }
    }
  }

  die(reason = "vieillesse") {
    this.isDead = true;
    STATS.deaths++;
    if (this.mesh.parent) {
      this.mesh.parent.remove(this.mesh);
    }
  }
}

// --- CLASSE DU SUPER-PRÉDATEUR (LÉVIATHAN DES ABYSSES / APEX TITAN) ---
class SuperPredator {
  constructor(scene) {
    this.scene = scene;
    this.active = false;
    this.group = new THREE.Group();
    this.segments = [];
    this.segmentCount = 28;
    this.spacing = 3.6;
    this.history = [];
    this.baseSpeed = 1.9;
    this.currentSpeed = 1.9;
    this.heading = new THREE.Vector3(1, 0, 0);
    this.state = 'PATROL'; // 'PATROL', 'LOCK', 'STRIKE', 'FEED'
    this.strikeCooldown = 0;
    this.swimPhase = 0;

    // Matériau PBR épidermique de grand reptile aquatique
    const skinTex = (window.AquaGraphics && window.AquaGraphics.getLeviathanTexture)
      ? window.AquaGraphics.getLeviathanTexture()
      : null;

    const bodyMat = new THREE.MeshPhysicalMaterial({
      map: skinTex,
      color: skinTex ? 0xffffff : 0x064e3b,
      roughness: 0.22,
      metalness: 0.32,
      clearcoat: 0.95,
      clearcoatRoughness: 0.08,
      iridescence: 0.65,
      iridescenceIOR: 1.33
    });

    const spineMat = new THREE.MeshPhysicalMaterial({
      color: 0xf59e0b,
      roughness: 0.28,
      metalness: 0.45,
      clearcoat: 0.85
    });

    const finMat = new THREE.MeshPhysicalMaterial({
      color: 0x047857,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      roughness: 0.2,
      metalness: 0.2,
      clearcoat: 0.8
    });

    // 1. Tête de Léviathan avec crâne profilé, mâchoires et yeux incandescents
    const headGroup = new THREE.Group();

    // Crâne supérieur profilé
    const skullGeom = new THREE.ConeGeometry(5.4, 15, 10);
    skullGeom.rotateX(Math.PI / 2);
    skullGeom.scale(1.15, 0.75, 1);
    const skullMesh = new THREE.Mesh(skullGeom, bodyMat);
    skullMesh.position.set(0, 0.4, 4);
    headGroup.add(skullMesh);

    // Mâchoire inférieure articulée
    const jawGeom = new THREE.BoxGeometry(4.6, 1.6, 10);
    const jawMesh = new THREE.Mesh(jawGeom, bodyMat);
    jawMesh.position.set(0, -1.8, 3.5);
    headGroup.add(jawMesh);
    this.jawMesh = jawMesh;

    // Dents acérées de carcharodon / léviathan
    const toothMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
    for (let f = -2; f <= 2; f++) {
      const tUp = new THREE.Mesh(new THREE.ConeGeometry(0.38, 2.2, 4), toothMat);
      tUp.position.set(f * 1.1, -0.6, 7.5);
      tUp.rotation.x = Math.PI;
      headGroup.add(tUp);

      const tDown = new THREE.Mesh(new THREE.ConeGeometry(0.38, 2.2, 4), toothMat);
      tDown.position.set(f * 1.0, 0.8, 3.5);
      jawMesh.add(tDown);
    }

    // Yeux rouges perçants incandescents
    const eyeGeom = new THREE.SphereGeometry(1.2, 8, 8);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const eyeL = new THREE.Mesh(eyeGeom, eyeMat);
    const eyeR = new THREE.Mesh(eyeGeom, eyeMat);
    eyeL.position.set(-2.8, 1.6, 5);
    eyeR.position.set(2.8, 1.6, 5);
    headGroup.add(eyeL);
    headGroup.add(eyeR);

    // Source de lumière volumétrique rougeoyante menaçante des abysses
    this.eyeLight = new THREE.PointLight(0xef4444, 2.4, 120);
    this.eyeLight.position.set(0, 1.5, 7);
    headGroup.add(this.eyeLight);

    // Nageoires pectorales géantes en ailes de dragon
    const pecShape = new THREE.Shape();
    pecShape.moveTo(0, 0);
    pecShape.lineTo(-12, -4);
    pecShape.lineTo(-19, -15);
    pecShape.lineTo(-8, -10);
    pecShape.closePath();
    const pecGeom = new THREE.ShapeGeometry(pecShape);

    const pecL = new THREE.Mesh(pecGeom, finMat);
    pecL.position.set(-3.5, -0.5, 0);
    pecL.rotation.y = -Math.PI / 8;
    headGroup.add(pecL);

    const pecR = new THREE.Mesh(pecGeom, finMat);
    pecR.scale.x = -1;
    pecR.position.set(3.5, -0.5, 0);
    pecR.rotation.y = Math.PI / 8;
    headGroup.add(pecR);
    this.pecL = pecL;
    this.pecR = pecR;

    this.head = headGroup;
    this.segments.push(headGroup);
    this.group.add(headGroup);

    // 2. Corps serpentine de 27 segments décroissants avec épines dorsales
    for (let i = 1; i < this.segmentCount; i++) {
      const segGroup = new THREE.Group();
      const progress = i / this.segmentCount;
      const radiusX = Math.max(1.8, 5.0 * (1 - progress * 0.65));
      const radiusY = Math.max(1.6, 4.4 * (1 - progress * 0.65));
      const radiusZ = 4.2;

      // Segment corporel ovoïde
      const geom = new THREE.SphereGeometry(1, 10, 8);
      geom.scale(radiusX, radiusY, radiusZ);
      const segMesh = new THREE.Mesh(geom, bodyMat);
      segGroup.add(segMesh);

      // Épines dorsales sculptées le long du dos
      if (i < 20) {
        const spineH = Math.max(1.5, 5.5 * (1 - progress * 0.6));
        const spineGeom = new THREE.ConeGeometry(0.65, spineH, 4);
        const spineMesh = new THREE.Mesh(spineGeom, spineMat);
        spineMesh.position.set(0, radiusY + spineH * 0.45, 0);
        spineMesh.rotation.x = -Math.PI / 7;
        segGroup.add(spineMesh);
      }

      // Nageoire caudale de Léviathan sur les 2 derniers segments
      if (i >= this.segmentCount - 2) {
        const tailShape = new THREE.Shape();
        tailShape.moveTo(0, 0);
        tailShape.lineTo(0, 10);
        tailShape.lineTo(-14, 16);
        tailShape.lineTo(-8, 0);
        tailShape.lineTo(-14, -16);
        tailShape.lineTo(0, -10);
        tailShape.closePath();
        const tailGeom = new THREE.ShapeGeometry(tailShape);
        const tailMesh = new THREE.Mesh(tailGeom, finMat);
        tailMesh.position.set(0, 0, -radiusZ);
        tailMesh.rotation.y = Math.PI / 2;
        segGroup.add(tailMesh);
      }

      this.segments.push(segGroup);
      this.group.add(segGroup);
    }

    this.scene.add(this.group);
    this.group.visible = false;
  }

  spawn() {
    this.active = true;
    this.group.visible = true;
    const startPos = new THREE.Vector3(0, 35, 0);
    this.history = Array(150).fill(0).map(() => startPos.clone());
    this.segments.forEach(s => s.position.copy(startPos));
    audio.playBassPulse();
    showToast(I18N[currentLang].super_predator_on, '🐉');
  }

  remove() {
    this.active = false;
    this.group.visible = false;
    showToast(I18N[currentLang].super_predator_off, '🌿');
  }

  getHeadPosition() {
    return this.head.position;
  }

  update(delta, boids) {
    if (!this.active) return;

    this.swimPhase += delta * 4.5 * SIM_SETTINGS.speed;
    const head = this.head;
    let target = null;
    let minDist = 260;

    for (const b of boids) {
      if (b.isDead) continue;
      const d = head.position.distanceTo(b.position);
      if (d < minDist) {
        minDist = d;
        target = b;
      }
    }

    if (target) {
      const desired = new THREE.Vector3().subVectors(target.position, head.position).normalize();
      
      // Transitions d'état d'IA prédatrice
      if (minDist < 65) {
        // ATTAQUE FULGURANTE (Apex Rush)
        this.state = 'STRIKE';
        this.currentSpeed = this.baseSpeed * 3.4;
        this.heading.lerp(desired, 0.16);
        // Mâchoire s'ouvre grand
        this.jawMesh.rotation.x = THREE.MathUtils.lerp(this.jawMesh.rotation.x, 0.65, 0.25);
        this.eyeLight.color.setHex(0xff0033);
        this.eyeLight.intensity = 3.6;

        if (this.strikeCooldown <= 0) {
          audio.playBassPulse();
          this.strikeCooldown = 2.5;
        }

        // Capture de la proie
        if (minDist < 14) {
          target.die("dévoré par le Léviathan");
          STATS.preyEaten++;
          audio.playBubble();
          showToast(I18N[currentLang].super_eat.replace('{species}', target.config.name), '🐉');
          this.state = 'FEED';
          this.currentSpeed = this.baseSpeed * 0.9;
        }
      } else {
        // VERROUILLAGE & APPROCHE
        this.state = 'LOCK';
        this.currentSpeed = this.baseSpeed * 1.8;
        this.heading.lerp(desired, 0.08);
        this.jawMesh.rotation.x = THREE.MathUtils.lerp(this.jawMesh.rotation.x, 0.1, 0.15);
        this.eyeLight.color.setHex(0xf59e0b);
        this.eyeLight.intensity = 2.2;
      }
    } else {
      // PATROUILLE SÉRAPHIQUE DANS LES FONDS
      this.state = 'PATROL';
      this.currentSpeed = this.baseSpeed;
      this.jawMesh.rotation.x = THREE.MathUtils.lerp(this.jawMesh.rotation.x, 0, 0.1);
      this.eyeLight.color.setHex(0xef4444);
      this.eyeLight.intensity = 1.8 + Math.sin(this.swimPhase * 0.8) * 0.6;

      this.heading.x += (Math.random() - 0.5) * 0.1;
      this.heading.y += (Math.random() - 0.5) * 0.05;
      this.heading.z += (Math.random() - 0.5) * 0.1;

      // Préférence de profondeur pour patrouiller près du fond rocheux
      if (head.position.y > 60) this.heading.y -= 0.05;
      if (head.position.y < 25) this.heading.y += 0.05;

      this.heading.normalize();
    }

    if (this.strikeCooldown > 0) this.strikeCooldown -= delta;

    // Déplacement de la tête
    head.position.addScaledVector(this.heading, this.currentSpeed * delta * 60 * SIM_SETTINGS.speed);

    // Orientation de la tête vers le cap
    const lookTarget = head.position.clone().add(this.heading);
    head.lookAt(lookTarget);

    // Nageoires pectorales battent au rythme de la nage
    const pecRoll = Math.sin(this.swimPhase) * 0.22;
    this.pecL.rotation.z = pecRoll;
    this.pecR.rotation.z = -pecRoll;

    // Frontières de l'aquarium avec rebond amorti
    const halfW = TANK.width / 2 - 25;
    const halfD = TANK.depth / 2 - 25;
    if (Math.abs(head.position.x) > halfW) this.heading.x *= -1;
    if (head.position.y < 16 || head.position.y > TANK.height - 25) this.heading.y *= -1;
    if (Math.abs(head.position.z) > halfD) this.heading.z *= -1;

    // Mise à jour de la chaîne serpentine fluide
    this.history.unshift(head.position.clone());
    if (this.history.length > 220) this.history.pop();

    for (let i = 1; i < this.segments.length; i++) {
      const idx = Math.min(Math.floor(i * this.spacing), this.history.length - 1);
      if (this.history[idx]) {
        // Ondulation latérale serpentine harmonique naturelle
        const waveOffset = Math.sin(this.swimPhase - i * 0.28) * (1.2 + i * 0.08);
        const lateralVec = new THREE.Vector3(-this.heading.z, 0, this.heading.x).normalize().multiplyScalar(waveOffset);
        
        const targetPos = this.history[idx].clone().add(lateralVec);
        this.segments[i].position.lerp(targetPos, 0.42);

        // Alignement d'orientation fluide vers le segment précédent
        const prevSeg = this.segments[i - 1];
        this.segments[i].lookAt(prevSeg.position);
      }
    }
  }
}

// --- CLASSE DU MÉGALODON (SUPER-PRÉDATEUR CARCHARODON / SQUALE TITAN) ---
class MegalodonSuperPredator {
  constructor(scene) {
    this.scene = scene;
    this.id = 'megalodon';
    this.name = 'Mégalodon Préhistorique';
    this.speciesName = 'Otodus megalodon';
    this.icon = '🦈';
    this.active = false;
    this.kills = 0;
    this.group = new THREE.Group();
    this.baseSpeed = 2.2;
    this.currentSpeed = 2.2;
    this.heading = new THREE.Vector3(1, 0, 0);
    this.state = 'PATROL'; // 'PATROL', 'LOCK', 'CHARGE', 'FEED'
    this.strikeCooldown = 0;
    this.swimPhase = 0;
    this.depthPreference = 120;

    const skinTex = (window.AquaGraphics && window.AquaGraphics.getMegalodonTexture)
      ? window.AquaGraphics.getMegalodonTexture()
      : null;

    const bodyMat = new THREE.MeshPhysicalMaterial({
      map: skinTex,
      color: skinTex ? 0xffffff : 0x1e293b,
      roughness: 0.28,
      metalness: 0.15,
      clearcoat: 0.85,
      clearcoatRoughness: 0.12
    });

    const darkFinMat = new THREE.MeshPhysicalMaterial({
      color: 0x0f172a,
      roughness: 0.35,
      metalness: 0.2,
      clearcoat: 0.7,
      side: THREE.DoubleSide
    });

    const toothMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.12,
      metalness: 0.1
    });

    this.root = new THREE.Group();
    this.group.add(this.root);

    // 1. Tête & Mâchoires
    this.head = new THREE.Group();
    this.root.add(this.head);

    const snoutGeom = new THREE.ConeGeometry(5.2, 16, 12);
    snoutGeom.rotateX(Math.PI / 2);
    snoutGeom.scale(1.2, 0.78, 1);
    const snoutMesh = new THREE.Mesh(snoutGeom, bodyMat);
    snoutMesh.position.set(0, 0.6, 5);
    this.head.add(snoutMesh);

    const jawGeom = new THREE.BoxGeometry(4.8, 1.8, 11);
    this.jawMesh = new THREE.Mesh(jawGeom, bodyMat);
    this.jawMesh.position.set(0, -1.8, 4.2);
    this.head.add(this.jawMesh);

    for (let f = -3; f <= 3; f++) {
      const tUp = new THREE.Mesh(new THREE.ConeGeometry(0.48, 2.4, 4), toothMat);
      tUp.position.set(f * 0.95, -0.7, 8.5 - Math.abs(f) * 0.4);
      tUp.rotation.x = Math.PI;
      this.head.add(tUp);

      const tDown = new THREE.Mesh(new THREE.ConeGeometry(0.48, 2.4, 4), toothMat);
      tDown.position.set(f * 0.85, 0.9, 4.8 - Math.abs(f) * 0.35);
      this.jawMesh.add(tDown);
    }

    const eyeGeom = new THREE.SphereGeometry(1.3, 10, 10);
    const eyeMat = new THREE.MeshPhysicalMaterial({ color: 0x020617, roughness: 0.05, clearcoat: 1 });
    const eyeL = new THREE.Mesh(eyeGeom, eyeMat);
    const eyeR = new THREE.Mesh(eyeGeom, eyeMat);
    eyeL.position.set(-3.2, 1.6, 6);
    eyeR.position.set(3.2, 1.6, 6);
    this.head.add(eyeL);
    this.head.add(eyeR);

    this.eyeLight = new THREE.PointLight(0x38bdf8, 2.0, 110);
    this.eyeLight.position.set(0, 1.8, 8);
    this.head.add(this.eyeLight);

    for (let g = 0; g < 5; g++) {
      const gillGeom = new THREE.BoxGeometry(0.2, 3.2, 0.35);
      const gillMat = new THREE.MeshBasicMaterial({ color: 0x020617 });
      const gL = new THREE.Mesh(gillGeom, gillMat);
      const gR = new THREE.Mesh(gillGeom, gillMat);
      gL.position.set(-3.3, 0.2, -1.0 - g * 1.1);
      gR.position.set(3.3, 0.2, -1.0 - g * 1.1);
      this.head.add(gL);
      this.head.add(gR);
    }

    const pecShape = new THREE.Shape();
    pecShape.moveTo(0, 0);
    pecShape.lineTo(-15, -4);
    pecShape.lineTo(-24, -18);
    pecShape.lineTo(-9, -12);
    pecShape.closePath();
    const pecGeom = new THREE.ShapeGeometry(pecShape);

    this.pecL = new THREE.Mesh(pecGeom, darkFinMat);
    this.pecL.position.set(-3.6, -0.6, -1);
    this.pecL.rotation.y = -Math.PI / 8;
    this.head.add(this.pecL);

    this.pecR = new THREE.Mesh(pecGeom, darkFinMat);
    this.pecR.scale.x = -1;
    this.pecR.position.set(3.6, -0.6, -1);
    this.pecR.rotation.y = Math.PI / 8;
    this.head.add(this.pecR);

    // 2. Tronc et Nageoire Dorsale
    this.torso = new THREE.Group();
    this.torso.position.set(0, 0, -6);
    this.root.add(this.torso);

    const torsoGeom = new THREE.CylinderGeometry(5.2, 4.2, 14, 12);
    torsoGeom.rotateX(Math.PI / 2);
    torsoGeom.scale(1.2, 0.95, 1);
    const torsoMesh = new THREE.Mesh(torsoGeom, bodyMat);
    this.torso.add(torsoMesh);

    const dorsalShape = new THREE.Shape();
    dorsalShape.moveTo(0, 0);
    dorsalShape.lineTo(0, 16);
    dorsalShape.lineTo(-14, 0);
    dorsalShape.closePath();
    const dorsalGeom = new THREE.ShapeGeometry(dorsalShape);
    const dorsalMesh = new THREE.Mesh(dorsalGeom, darkFinMat);
    dorsalMesh.position.set(0, 4.2, 2);
    dorsalMesh.rotation.y = Math.PI / 2;
    this.torso.add(dorsalMesh);

    // 3. Queue et Nageoire Caudale
    this.midTail = new THREE.Group();
    this.midTail.position.set(0, 0, -14);
    this.torso.add(this.midTail);

    const midGeom = new THREE.CylinderGeometry(4.2, 2.6, 12, 10);
    midGeom.rotateX(Math.PI / 2);
    midGeom.scale(1.0, 0.9, 1);
    this.midTail.add(new THREE.Mesh(midGeom, bodyMat));

    const pelvGeom = new THREE.ConeGeometry(2.2, 6, 4);
    pelvGeom.rotateZ(Math.PI / 3);
    const pelvL = new THREE.Mesh(pelvGeom, darkFinMat);
    pelvL.position.set(-2.8, -2.5, 0);
    const pelvR = new THREE.Mesh(pelvGeom, darkFinMat);
    pelvR.position.set(2.8, -2.5, 0);
    pelvR.scale.x = -1;
    this.midTail.add(pelvL);
    this.midTail.add(pelvR);

    this.rearTail = new THREE.Group();
    this.rearTail.position.set(0, 0, -11);
    this.midTail.add(this.rearTail);

    const peduncleGeom = new THREE.CylinderGeometry(2.6, 1.2, 10, 8);
    peduncleGeom.rotateX(Math.PI / 2);
    this.rearTail.add(new THREE.Mesh(peduncleGeom, bodyMat));

    const tailShape = new THREE.Shape();
    tailShape.moveTo(0, 0);
    tailShape.lineTo(0, 16);
    tailShape.lineTo(-12, 22);
    tailShape.lineTo(-6, 0);
    tailShape.lineTo(-11, -14);
    tailShape.lineTo(0, -9);
    tailShape.closePath();
    const tailGeom = new THREE.ShapeGeometry(tailShape);
    const tailMesh = new THREE.Mesh(tailGeom, darkFinMat);
    tailMesh.position.set(0, 0, -6);
    tailMesh.rotation.y = Math.PI / 2;
    this.rearTail.add(tailMesh);

    this.scene.add(this.group);
    this.group.visible = false;
  }

  spawn() {
    this.active = true;
    this.group.visible = true;
    this.root.position.set(0, this.depthPreference, 0);
    this.heading.set(1, 0, 0);
    audio.playSharkChomp();
    showToast(I18N[currentLang].megalodon_on, '🦈');
  }

  remove() {
    this.active = false;
    this.group.visible = false;
    showToast(I18N[currentLang].megalodon_off, '🌊');
  }

  getHeadPosition() {
    return this.root.position;
  }

  update(delta, boids) {
    if (!this.active) return;

    this.swimPhase += delta * 3.8 * SIM_SETTINGS.speed;
    const pos = this.root.position;
    let target = null;
    let minDist = 280;

    for (const b of boids) {
      if (b.isDead) continue;
      const d = pos.distanceTo(b.position);
      if (d < minDist) {
        minDist = d;
        target = b;
      }
    }

    if (target) {
      const desired = new THREE.Vector3().subVectors(target.position, pos).normalize();

      if (minDist < 75) {
        // CHARGE FULGURANTE (Apex Rush)
        this.state = 'CHARGE';
        this.currentSpeed = this.baseSpeed * 3.8;
        this.heading.lerp(desired, 0.18);
        this.jawMesh.rotation.x = THREE.MathUtils.lerp(this.jawMesh.rotation.x, 0.72, 0.28);
        this.eyeLight.color.setHex(0xef4444);
        this.eyeLight.intensity = 3.8;

        if (this.strikeCooldown <= 0) {
          audio.playSharkChomp();
          this.strikeCooldown = 2.4;
        }

        if (minDist < 16) {
          target.die("dévoré par le Mégalodon");
          STATS.preyEaten++;
          this.kills++;
          audio.playSharkChomp();
          showToast(I18N[currentLang].megalodon_eat.replace('{species}', target.config.name), '🦈');
          this.state = 'FEED';
          this.currentSpeed = this.baseSpeed * 0.9;
        }
      } else {
        // VERROUILLAGE
        this.state = 'LOCK';
        this.currentSpeed = this.baseSpeed * 1.9;
        this.heading.lerp(desired, 0.09);
        this.jawMesh.rotation.x = THREE.MathUtils.lerp(this.jawMesh.rotation.x, 0.12, 0.15);
        this.eyeLight.color.setHex(0x06b6d4);
        this.eyeLight.intensity = 2.4;
      }
    } else {
      // PATROUILLE PÉLAGIQUE
      this.state = 'PATROL';
      this.currentSpeed = this.baseSpeed;
      this.jawMesh.rotation.x = THREE.MathUtils.lerp(this.jawMesh.rotation.x, 0, 0.1);
      this.eyeLight.color.setHex(0x38bdf8);
      this.eyeLight.intensity = 1.6 + Math.sin(this.swimPhase * 0.9) * 0.5;

      this.heading.x += (Math.random() - 0.5) * 0.08;
      this.heading.y += (Math.random() - 0.5) * 0.04;
      this.heading.z += (Math.random() - 0.5) * 0.08;

      if (pos.y < 80) this.heading.y += 0.06;
      if (pos.y > TANK.height - 35) this.heading.y -= 0.06;
      this.heading.normalize();
    }

    if (this.strikeCooldown > 0) this.strikeCooldown -= delta;

    pos.addScaledVector(this.heading, this.currentSpeed * delta * 60 * SIM_SETTINGS.speed);
    const lookTarget = pos.clone().add(this.heading);
    this.root.lookAt(lookTarget);

    const tailSwing = Math.sin(this.swimPhase) * (this.state === 'CHARGE' ? 0.45 : 0.24);
    this.midTail.rotation.y = tailSwing * 0.65;
    this.rearTail.rotation.y = tailSwing * 1.1;

    const pecRoll = Math.sin(this.swimPhase * 0.8) * 0.16;
    this.pecL.rotation.z = pecRoll;
    this.pecR.rotation.z = -pecRoll;

    const halfW = TANK.width / 2 - 25;
    const halfD = TANK.depth / 2 - 25;
    if (Math.abs(pos.x) > halfW) this.heading.x *= -1;
    if (pos.y < 20 || pos.y > TANK.height - 20) this.heading.y *= -1;
    if (Math.abs(pos.z) > halfD) this.heading.z *= -1;
  }
}

// --- CLASSE DU MOSASAURE (SUPER-PRÉDATEUR DU CRÉTACÉ / REPTILE TITAN) ---
class MosasaurSuperPredator {
  constructor(scene) {
    this.scene = scene;
    this.id = 'mosasaur';
    this.name = 'Mosasaure Titanesque';
    this.speciesName = 'Mosasaurus hoffmannii';
    this.icon = '🐊';
    this.active = false;
    this.kills = 0;
    this.group = new THREE.Group();
    this.segments = [];
    this.segmentCount = 20;
    this.spacing = 3.8;
    this.history = [];
    this.baseSpeed = 2.0;
    this.currentSpeed = 2.0;
    this.heading = new THREE.Vector3(1, 0, 0);
    this.state = 'PATROL'; // 'PATROL', 'AMBUSH', 'STRIKE', 'FEED'
    this.strikeCooldown = 0;
    this.swimPhase = 0;

    const skinTex = (window.AquaGraphics && window.AquaGraphics.getMosasaurTexture)
      ? window.AquaGraphics.getMosasaurTexture()
      : null;

    const bodyMat = new THREE.MeshPhysicalMaterial({
      map: skinTex,
      color: skinTex ? 0xffffff : 0x0f766e,
      roughness: 0.32,
      metalness: 0.18,
      clearcoat: 0.75,
      iridescence: 0.4
    });

    const paddleMat = new THREE.MeshPhysicalMaterial({
      color: 0x115e59,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
      roughness: 0.25,
      metalness: 0.15,
      clearcoat: 0.7
    });

    const scuteMat = new THREE.MeshStandardMaterial({
      color: 0x14b8a6,
      roughness: 0.35,
      metalness: 0.2
    });

    const headGroup = new THREE.Group();

    const skullGeom = new THREE.ConeGeometry(5.0, 18, 10);
    skullGeom.rotateX(Math.PI / 2);
    skullGeom.scale(1.1, 0.65, 1);
    const skullMesh = new THREE.Mesh(skullGeom, bodyMat);
    skullMesh.position.set(0, 0.3, 5.5);
    headGroup.add(skullMesh);

    const jawGeom = new THREE.BoxGeometry(4.4, 1.5, 13);
    this.jawMesh = new THREE.Mesh(jawGeom, bodyMat);
    this.jawMesh.position.set(0, -1.6, 4.5);
    headGroup.add(this.jawMesh);

    const toothMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.1 });
    for (let f = -2; f <= 2; f++) {
      const tUp = new THREE.Mesh(new THREE.ConeGeometry(0.36, 2.0, 4), toothMat);
      tUp.position.set(f * 1.0, -0.6, 9.0 - Math.abs(f) * 0.6);
      tUp.rotation.x = Math.PI * 0.95;
      headGroup.add(tUp);

      const tDown = new THREE.Mesh(new THREE.ConeGeometry(0.36, 2.0, 4), toothMat);
      tDown.position.set(f * 0.95, 0.7, 4.5);
      this.jawMesh.add(tDown);
    }

    const eyeGeom = new THREE.SphereGeometry(1.2, 8, 8);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const eyeL = new THREE.Mesh(eyeGeom, eyeMat);
    const eyeR = new THREE.Mesh(eyeGeom, eyeMat);
    eyeL.position.set(-2.8, 1.5, 4.5);
    eyeR.position.set(2.8, 1.5, 4.5);
    headGroup.add(eyeL);
    headGroup.add(eyeR);

    this.eyeLight = new THREE.PointLight(0xf59e0b, 2.5, 120);
    this.eyeLight.position.set(0, 1.5, 6);
    headGroup.add(this.eyeLight);

    const flipperShape = new THREE.Shape();
    flipperShape.moveTo(0, 0);
    flipperShape.lineTo(-9, -3);
    flipperShape.lineTo(-16, -14);
    flipperShape.lineTo(-6, -10);
    flipperShape.closePath();
    const flipperGeom = new THREE.ShapeGeometry(flipperShape);

    this.flipFrontL = new THREE.Mesh(flipperGeom, paddleMat);
    this.flipFrontL.position.set(-3.5, -0.8, -1);
    this.flipFrontL.rotation.y = -Math.PI / 7;
    headGroup.add(this.flipFrontL);

    this.flipFrontR = new THREE.Mesh(flipperGeom, paddleMat);
    this.flipFrontR.scale.x = -1;
    this.flipFrontR.position.set(3.5, -0.8, -1);
    this.flipFrontR.rotation.y = Math.PI / 7;
    headGroup.add(this.flipFrontR);

    this.head = headGroup;
    this.segments.push(headGroup);
    this.group.add(headGroup);

    for (let i = 1; i < this.segmentCount; i++) {
      const segGroup = new THREE.Group();
      const progress = i / this.segmentCount;
      const radiusX = Math.max(1.8, 4.8 * (1 - progress * 0.6));
      const radiusY = Math.max(1.5, 4.0 * (1 - progress * 0.6));
      const radiusZ = 4.0;

      const geom = new THREE.SphereGeometry(1, 10, 8);
      geom.scale(radiusX, radiusY, radiusZ);
      const segMesh = new THREE.Mesh(geom, bodyMat);
      segGroup.add(segMesh);

      if (i < 16) {
        const scuteGeom = new THREE.ConeGeometry(0.55, 3.5 * (1 - progress * 0.5), 4);
        const scuteMesh = new THREE.Mesh(scuteGeom, scuteMat);
        scuteMesh.position.set(0, radiusY + 1.2, 0);
        scuteMesh.rotation.x = -Math.PI / 6;
        segGroup.add(scuteMesh);
      }

      if (i === 7) {
        const rearFlipGeom = new THREE.ShapeGeometry(flipperShape);
        this.flipRearL = new THREE.Mesh(rearFlipGeom, paddleMat);
        this.flipRearL.scale.set(0.75, 0.75, 0.75);
        this.flipRearL.position.set(-radiusX, -0.5, 0);
        segGroup.add(this.flipRearL);

        this.flipRearR = new THREE.Mesh(rearFlipGeom, paddleMat);
        this.flipRearR.scale.set(-0.75, 0.75, 0.75);
        this.flipRearR.position.set(radiusX, -0.5, 0);
        segGroup.add(this.flipRearR);
      }

      if (i >= this.segmentCount - 2) {
        const caudalShape = new THREE.Shape();
        caudalShape.moveTo(0, 0);
        caudalShape.lineTo(0, 11);
        caudalShape.lineTo(-14, 12);
        caudalShape.lineTo(-8, 0);
        caudalShape.lineTo(-12, -14);
        caudalShape.lineTo(0, -9);
        caudalShape.closePath();
        const caudalGeom = new THREE.ShapeGeometry(caudalShape);
        const caudalMesh = new THREE.Mesh(caudalGeom, paddleMat);
        caudalMesh.position.set(0, 0, -radiusZ);
        caudalMesh.rotation.y = Math.PI / 2;
        segGroup.add(caudalMesh);
      }

      this.segments.push(segGroup);
      this.group.add(segGroup);
    }

    this.scene.add(this.group);
    this.group.visible = false;
  }

  spawn() {
    this.active = true;
    this.group.visible = true;
    const startPos = new THREE.Vector3(40, 28, -20);
    this.history = Array(120).fill(0).map(() => startPos.clone());
    this.segments.forEach(s => s.position.copy(startPos));
    audio.playMosasaurRoar();
    showToast(I18N[currentLang].mosasaur_on, '🐊');
  }

  remove() {
    this.active = false;
    this.group.visible = false;
    showToast(I18N[currentLang].mosasaur_off, '🌊');
  }

  getHeadPosition() {
    return this.head.position;
  }

  update(delta, boids) {
    if (!this.active) return;

    this.swimPhase += delta * 4.0 * SIM_SETTINGS.speed;
    const head = this.head;
    let target = null;
    let minDist = 270;

    for (const b of boids) {
      if (b.isDead) continue;
      const d = head.position.distanceTo(b.position);
      if (d < minDist) {
        minDist = d;
        target = b;
      }
    }

    if (target) {
      const desired = new THREE.Vector3().subVectors(target.position, head.position).normalize();

      if (minDist < 60) {
        this.state = 'STRIKE';
        this.currentSpeed = this.baseSpeed * 3.5;
        this.heading.lerp(desired, 0.17);
        this.jawMesh.rotation.x = THREE.MathUtils.lerp(this.jawMesh.rotation.x, 0.68, 0.25);
        this.eyeLight.color.setHex(0xef4444);
        this.eyeLight.intensity = 3.6;

        if (this.strikeCooldown <= 0) {
          audio.playMosasaurRoar();
          this.strikeCooldown = 2.5;
        }

        if (minDist < 15) {
          target.die("happé par le Mosasaure");
          STATS.preyEaten++;
          this.kills++;
          audio.playBubble();
          showToast(I18N[currentLang].mosasaur_eat.replace('{species}', target.config.name), '🐊');
          this.state = 'FEED';
          this.currentSpeed = this.baseSpeed * 0.9;
        }
      } else {
        this.state = 'AMBUSH';
        this.currentSpeed = this.baseSpeed * 2.0;
        this.heading.lerp(desired, 0.08);
        this.jawMesh.rotation.x = THREE.MathUtils.lerp(this.jawMesh.rotation.x, 0.15, 0.15);
        this.eyeLight.color.setHex(0xf59e0b);
        this.eyeLight.intensity = 2.5;
      }
    } else {
      this.state = 'PATROL';
      this.currentSpeed = this.baseSpeed;
      this.jawMesh.rotation.x = THREE.MathUtils.lerp(this.jawMesh.rotation.x, 0, 0.1);
      this.eyeLight.color.setHex(0x10b981);
      this.eyeLight.intensity = 1.8 + Math.sin(this.swimPhase * 0.7) * 0.5;

      this.heading.x += (Math.random() - 0.5) * 0.09;
      this.heading.y += (Math.random() - 0.5) * 0.05;
      this.heading.z += (Math.random() - 0.5) * 0.09;

      if (head.position.y > 65) this.heading.y -= 0.05;
      if (head.position.y < 22) this.heading.y += 0.05;
      this.heading.normalize();
    }

    if (this.strikeCooldown > 0) this.strikeCooldown -= delta;

    head.position.addScaledVector(this.heading, this.currentSpeed * delta * 60 * SIM_SETTINGS.speed);
    const lookTarget = head.position.clone().add(this.heading);
    head.lookAt(lookTarget);

    const paddleRoll = Math.sin(this.swimPhase) * 0.28;
    this.flipFrontL.rotation.z = paddleRoll;
    this.flipFrontR.rotation.z = -paddleRoll;
    if (this.flipRearL && this.flipRearR) {
      this.flipRearL.rotation.z = -paddleRoll * 0.8;
      this.flipRearR.rotation.z = paddleRoll * 0.8;
    }

    const halfW = TANK.width / 2 - 25;
    const halfD = TANK.depth / 2 - 25;
    if (Math.abs(head.position.x) > halfW) this.heading.x *= -1;
    if (head.position.y < 16 || head.position.y > TANK.height - 25) this.heading.y *= -1;
    if (Math.abs(head.position.z) > halfD) this.heading.z *= -1;

    this.history.unshift(head.position.clone());
    if (this.history.length > 180) this.history.pop();

    for (let i = 1; i < this.segments.length; i++) {
      const idx = Math.min(Math.floor(i * this.spacing), this.history.length - 1);
      if (this.history[idx]) {
        const waveOffset = Math.sin(this.swimPhase - i * 0.32) * (1.1 + i * 0.07);
        const lateralVec = new THREE.Vector3(-this.heading.z, 0, this.heading.x).normalize().multiplyScalar(waveOffset);
        const targetPos = this.history[idx].clone().add(lateralVec);
        this.segments[i].position.lerp(targetPos, 0.44);
        const prevSeg = this.segments[i - 1];
        this.segments[i].lookAt(prevSeg.position);
      }
    }
  }
}

// --- CLASSE DU KRAKEN COLOSSAL (SUPER-PRÉDATEUR CÉPHALOPODE DES ABYSSES) ---
class KrakenSuperPredator {
  constructor(scene) {
    this.scene = scene;
    this.id = 'kraken';
    this.name = 'Kraken Colossal des Abysses';
    this.speciesName = 'Architeuthis dux';
    this.icon = '🦑';
    this.active = false;
    this.kills = 0;
    this.group = new THREE.Group();
    this.baseSpeed = 1.8;
    this.currentSpeed = 1.8;
    this.heading = new THREE.Vector3(1, 0, 0);
    this.state = 'DRIFT'; // 'DRIFT', 'STALK', 'TENTACLE_STRIKE', 'FEED'
    this.strikeCooldown = 0;
    this.pulsePhase = 0;
    this.tentacleExtension = 0;

    const skinTex = (window.AquaGraphics && window.AquaGraphics.getKrakenTexture)
      ? window.AquaGraphics.getKrakenTexture()
      : null;

    const mantleMat = new THREE.MeshPhysicalMaterial({
      map: skinTex,
      color: skinTex ? 0xffffff : 0x881337,
      roughness: 0.18,
      metalness: 0.22,
      clearcoat: 0.95,
      transmission: 0.12,
      iridescence: 0.75
    });

    const finMat = new THREE.MeshPhysicalMaterial({
      color: 0xbe123c,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.82,
      roughness: 0.2,
      metalness: 0.1
    });

    const armMat = new THREE.MeshPhysicalMaterial({
      color: 0x9f1239,
      roughness: 0.25,
      metalness: 0.2,
      clearcoat: 0.8
    });

    const suckerMat = new THREE.MeshStandardMaterial({
      color: 0xfecdd3,
      roughness: 0.3
    });

    this.root = new THREE.Group();
    this.group.add(this.root);

    // 1. Manteau fuselé et nageoires stabilisatrices
    this.mantle = new THREE.Group();
    this.mantle.position.set(0, 0, -6);
    this.root.add(this.mantle);

    const mantleGeom = new THREE.ConeGeometry(5.4, 20, 14);
    mantleGeom.rotateX(-Math.PI / 2);
    mantleGeom.scale(1.15, 0.85, 1);
    this.mantleMesh = new THREE.Mesh(mantleGeom, mantleMat);
    this.mantle.add(this.mantleMesh);

    const finShape = new THREE.Shape();
    finShape.moveTo(0, 0);
    finShape.lineTo(-14, -6);
    finShape.lineTo(-18, -16);
    finShape.lineTo(0, -12);
    finShape.closePath();
    const finGeom = new THREE.ShapeGeometry(finShape);

    this.finL = new THREE.Mesh(finGeom, finMat);
    this.finL.position.set(-2.5, 0, -4);
    this.finL.rotation.y = -Math.PI / 12;
    this.mantle.add(this.finL);

    this.finR = new THREE.Mesh(finGeom, finMat);
    this.finR.scale.x = -1;
    this.finR.position.set(2.5, 0, -4);
    this.finR.rotation.y = Math.PI / 12;
    this.mantle.add(this.finR);

    // 2. Tête céphalopode & Yeux
    this.head = new THREE.Group();
    this.head.position.set(0, 0, 5);
    this.root.add(this.head);

    const headGeom = new THREE.SphereGeometry(4.8, 12, 10);
    headGeom.scale(1.0, 0.8, 1.1);
    this.head.add(new THREE.Mesh(headGeom, mantleMat));

    const eyeGeom = new THREE.SphereGeometry(1.6, 12, 12);
    const eyeMat = new THREE.MeshPhysicalMaterial({ color: 0x0f172a, roughness: 0.05, clearcoat: 1 });
    const eyeL = new THREE.Mesh(eyeGeom, eyeMat);
    const eyeR = new THREE.Mesh(eyeGeom, eyeMat);
    eyeL.position.set(-4.2, 0.8, 1.5);
    eyeR.position.set(4.2, 0.8, 1.5);

    const irisGeom = new THREE.RingGeometry(0.5, 1.3, 12);
    const irisMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide });
    const irisL = new THREE.Mesh(irisGeom, irisMat);
    irisL.position.set(-4.6, 0.8, 2.8);
    irisL.rotation.y = -Math.PI / 4;
    const irisR = new THREE.Mesh(irisGeom, irisMat);
    irisR.position.set(4.6, 0.8, 2.8);
    irisR.rotation.y = Math.PI / 4;
    this.head.add(eyeL);
    this.head.add(eyeR);
    this.head.add(irisL);
    this.head.add(irisR);

    this.eyeLight = new THREE.PointLight(0xa855f7, 2.6, 110);
    this.eyeLight.position.set(0, 1.2, 4);
    this.head.add(this.eyeLight);

    const siphonGeom = new THREE.CylinderGeometry(1.0, 1.5, 5, 8);
    siphonGeom.rotateX(Math.PI / 4);
    const siphon = new THREE.Mesh(siphonGeom, mantleMat);
    siphon.position.set(0, -3.2, 0);
    this.head.add(siphon);

    // 3. Couronne de 8 Bras articulés
    this.arms = [];
    for (let a = 0; a < 8; a++) {
      const armAngle = (a / 8) * Math.PI * 2;
      const armGroup = new THREE.Group();
      armGroup.position.set(Math.cos(armAngle) * 3.2, Math.sin(armAngle) * 2.4, 4.5);
      armGroup.userData.angle = armAngle;
      armGroup.userData.seed = a * 0.78;

      let prevSeg = armGroup;
      const segList = [];
      for (let s = 0; s < 5; s++) {
        const seg = new THREE.Group();
        seg.position.set(0, 0, 3.8);
        const radius = Math.max(0.6, 1.4 * (1 - s * 0.18));
        const segGeom = new THREE.ConeGeometry(radius, 4.2, 6);
        segGeom.rotateX(Math.PI / 2);
        seg.add(new THREE.Mesh(segGeom, armMat));

        const sGeom = new THREE.CylinderGeometry(0.3, 0.35, 0.3, 6);
        const sucker = new THREE.Mesh(sGeom, suckerMat);
        sucker.position.set(0, -radius * 0.8, 1.2);
        seg.add(sucker);

        prevSeg.add(seg);
        segList.push(seg);
        prevSeg = seg;
      }

      armGroup.userData.segments = segList;
      this.head.add(armGroup);
      this.arms.push(armGroup);
    }

    // 4. Deux Tentacules Préhenseurs
    this.tentacles = [];
    for (let t = 0; t < 2; t++) {
      const sign = t === 0 ? -1 : 1;
      const tGroup = new THREE.Group();
      tGroup.position.set(sign * 2.2, -1.2, 5.0);
      tGroup.userData.sign = sign;

      const shaftGeom = new THREE.CylinderGeometry(0.7, 0.5, 24, 6);
      shaftGeom.rotateX(Math.PI / 2);
      const shaftMesh = new THREE.Mesh(shaftGeom, armMat);
      shaftMesh.position.set(0, 0, 12);
      tGroup.add(shaftMesh);

      const clubGeom = new THREE.ConeGeometry(1.6, 9, 8);
      clubGeom.rotateX(Math.PI / 2);
      const clubMesh = new THREE.Mesh(clubGeom, armMat);
      clubMesh.position.set(0, 0, 26);
      tGroup.add(clubMesh);
      tGroup.userData.clubMesh = clubMesh;
      tGroup.userData.shaftMesh = shaftMesh;

      this.head.add(tGroup);
      this.tentacles.push(tGroup);
    }

    const inkGeom = new THREE.BufferGeometry();
    const inkCount = 80;
    const inkPos = new Float32Array(inkCount * 3);
    for (let i = 0; i < inkCount * 3; i += 3) {
      inkPos[i] = (Math.random() - 0.5) * 12;
      inkPos[i + 1] = (Math.random() - 0.5) * 12;
      inkPos[i + 2] = (Math.random() - 0.5) * 12;
    }
    inkGeom.setAttribute('position', new THREE.BufferAttribute(inkPos, 3));
    this.inkCloud = new THREE.Points(inkGeom, new THREE.PointsMaterial({
      color: 0x020617,
      size: 5.5,
      transparent: true,
      opacity: 0,
      blending: THREE.NormalBlending
    }));
    this.inkCloud.position.set(0, 0, -12);
    this.root.add(this.inkCloud);
    this.inkTimer = 0;

    this.scene.add(this.group);
    this.group.visible = false;
  }

  spawn() {
    this.active = true;
    this.group.visible = true;
    this.root.position.set(-50, 90, 30);
    this.heading.set(1, 0, 0);
    audio.playKrakenPulse();
    showToast(I18N[currentLang].kraken_on, '🦑');
  }

  remove() {
    this.active = false;
    this.group.visible = false;
    showToast(I18N[currentLang].kraken_off, '🌊');
  }

  getHeadPosition() {
    return this.root.position;
  }

  triggerInk() {
    this.inkTimer = 2.5;
    this.inkCloud.material.opacity = 0.85;
    this.inkCloud.scale.set(1, 1, 1);
  }

  update(delta, boids) {
    if (!this.active) return;

    this.pulsePhase += delta * 2.8 * SIM_SETTINGS.speed;
    const pos = this.root.position;
    let target = null;
    let minDist = 260;

    for (const b of boids) {
      if (b.isDead) continue;
      const d = pos.distanceTo(b.position);
      if (d < minDist) {
        minDist = d;
        target = b;
      }
    }

    if (target) {
      const desired = new THREE.Vector3().subVectors(target.position, pos).normalize();

      if (minDist < 80) {
        this.state = 'TENTACLE_STRIKE';
        this.currentSpeed = this.baseSpeed * 3.2;
        this.heading.lerp(desired, 0.16);
        this.tentacleExtension = THREE.MathUtils.lerp(this.tentacleExtension, 1.8, 0.22);
        this.eyeLight.color.setHex(0xf43f5e);
        this.eyeLight.intensity = 3.8;

        if (this.strikeCooldown <= 0) {
          audio.playKrakenPulse();
          this.triggerInk();
          this.strikeCooldown = 2.6;
        }

        if (minDist < 18) {
          target.die("capturé par le Kraken Colossal");
          STATS.preyEaten++;
          this.kills++;
          audio.playBubble();
          showToast(I18N[currentLang].kraken_eat.replace('{species}', target.config.name), '🦑');
          this.state = 'FEED';
          this.currentSpeed = this.baseSpeed * 0.8;
          this.triggerInk();
        }
      } else {
        this.state = 'STALK';
        this.currentSpeed = this.baseSpeed * 1.7;
        this.heading.lerp(desired, 0.08);
        this.tentacleExtension = THREE.MathUtils.lerp(this.tentacleExtension, 0.5, 0.1);
        this.eyeLight.color.setHex(0xa855f7);
        this.eyeLight.intensity = 2.4;
      }
    } else {
      this.state = 'DRIFT';
      this.currentSpeed = this.baseSpeed;
      this.tentacleExtension = THREE.MathUtils.lerp(this.tentacleExtension, 0, 0.08);
      this.eyeLight.color.setHex(0x6366f1);
      this.eyeLight.intensity = 1.8 + Math.sin(this.pulsePhase * 0.8) * 0.6;

      this.heading.x += (Math.random() - 0.5) * 0.07;
      this.heading.y += (Math.random() - 0.5) * 0.04;
      this.heading.z += (Math.random() - 0.5) * 0.07;

      if (pos.y < 35) this.heading.y += 0.05;
      if (pos.y > TANK.height - 35) this.heading.y -= 0.05;
      this.heading.normalize();
    }

    if (this.strikeCooldown > 0) this.strikeCooldown -= delta;

    pos.addScaledVector(this.heading, this.currentSpeed * delta * 60 * SIM_SETTINGS.speed);
    const lookTarget = pos.clone().add(this.heading);
    this.root.lookAt(lookTarget);

    const pulseFactor = 1.0 + Math.sin(this.pulsePhase) * 0.08;
    this.mantleMesh.scale.set(1.15 * pulseFactor, 0.85 * pulseFactor, 1.0);

    const finWave = Math.sin(this.pulsePhase * 1.4) * 0.22;
    this.finL.rotation.z = finWave;
    this.finR.rotation.z = -finWave;

    for (const arm of this.arms) {
      const segs = arm.userData.segments;
      const seed = arm.userData.seed;
      for (let s = 0; s < segs.length; s++) {
        const seg = segs[s];
        const wave = Math.sin(this.pulsePhase * 1.2 + seed + s * 0.4) * 0.16;
        seg.rotation.x = wave;
        seg.rotation.y = Math.cos(this.pulsePhase + seed) * 0.12;
      }
    }

    for (const t of this.tentacles) {
      t.scale.z = 1.0 + this.tentacleExtension * 1.5;
      t.rotation.x = Math.sin(this.pulsePhase + t.userData.sign) * 0.14;
    }

    if (this.inkTimer > 0) {
      this.inkTimer -= delta;
      this.inkCloud.scale.addScalar(delta * 2.2);
      this.inkCloud.material.opacity = Math.max(0, this.inkTimer / 2.5) * 0.85;
    } else {
      this.inkCloud.material.opacity = 0;
    }

    const halfW = TANK.width / 2 - 25;
    const halfD = TANK.depth / 2 - 25;
    if (Math.abs(pos.x) > halfW) this.heading.x *= -1;
    if (pos.y < 20 || pos.y > TANK.height - 20) this.heading.y *= -1;
    if (Math.abs(pos.z) > halfD) this.heading.z *= -1;
  }
}

// --- CLASSE AVANCÉE DU SOUS-MARIN ROV (DRONE OCÉANOGRAPHIQUE HAUTE FIDÉLITÉ) ---
class SubmarineROV {
  constructor(scene, tank = TANK) {
    this.scene = scene;
    this.tank = tank;
    this.active = false;
    this.controlMode = 'auto'; // 'auto' (patrouille), 'manual' (pilotage direct), 'escort' (suivi titan)
    this.cameraView = 'firstPerson'; // 'firstPerson' (cockpit) ou 'thirdPerson' (vue extérieure chasseur)
    this.lightMode = 'normal'; // 'normal' (LED 5600K), 'uv' (ultraviolet fluo), 'red' (rouge furtif), 'off'
    
    // Position et cinématique physique réaliste
    this.position = new THREE.Vector3(0, tank.height * 0.55, 0);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.heading = new THREE.Vector3(1, 0, 0);
    this.yaw = 0;
    this.pitch = 0;
    this.roll = 0;
    this.speed = 0;
    this.baseMaxSpeed = 2.5;
    this.maxSpeed = 2.5;
    this.turnSpeed = 1.9;
    this.propellerSpeed = 0;
    this.vertPropellerSpeed = 0;
    
    // Turbo Boost
    this.isTurbo = false;
    this.turboTimer = 0;
    this.cameraShake = 0;

    // Touches pressées
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      up: false,
      down: false,
      turbo: false
    };

    // Télémétrie Sonar & Cible
    this.sonarActive = false;
    this.sonarPingTimer = 0;
    this.sonarRange = 120; // 60, 120, 240
    this.nearestTarget = null;
    this.nearestDist = Infinity;
    this.escortTarget = null; // 'megalodon', 'mosasaur', 'kraken', 'leviathan' ou boid
    this.escortDistance = 48;
    this.proximityWarning = false;
    this.proximityDist = Infinity;
    this.clawAnimation = 0;

    // Données environnementales
    this.waterTemp = 24.2;
    this.waterPressure = 1.0;

    this.mesh = new THREE.Group();
    this.buildSubmarineModel();

    // Caméra Cockpit Intérieur (1ère personne panoramique dans le dôme acrylique)
    this.cockpitCamera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 1800);
    this.cockpitCamera.position.set(13.8, 1.3, 0);
    this.mesh.add(this.cockpitCamera);

    // Caméra Chasseur Extérieure (3ème personne vue d'ensemble cinéma)
    this.chaseCamera = new THREE.PerspectiveCamera(68, window.innerWidth / window.innerHeight, 0.1, 1800);
    this.chaseCamera.position.set(-38, 14, 0);
    this.chaseCamera.lookAt(new THREE.Vector3(15, 0, 0));
    this.mesh.add(this.chaseCamera);

    // Caméra active par défaut
    this.camera = this.cockpitCamera;

    this.mesh.position.copy(this.position);
    this.scene.add(this.mesh);

    this.bindKeyboardControls();
  }

  buildSubmarineModel() {
    // 1. Textures & Matériaux PBR réalistes
    const subTex = (window.AquaGraphics && window.AquaGraphics.getSubmarineTexture)
      ? window.AquaGraphics.getSubmarineTexture()
      : null;

    const consoleTex = (window.AquaGraphics && window.AquaGraphics.getSubmarineConsoleTexture)
      ? window.AquaGraphics.getSubmarineConsoleTexture()
      : null;

    const hullMat = new THREE.MeshPhysicalMaterial({
      map: subTex,
      color: subTex ? 0xffffff : 0xf59e0b,
      metalness: 0.54,
      roughness: 0.26,
      clearcoat: 0.85,
      clearcoatRoughness: 0.1
    });

    const titaniumMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.88,
      roughness: 0.22
    });

    const darkAlloyMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.85,
      roughness: 0.3
    });

    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.92,
      roughness: 0.18
    });

    const acrylicMat = new THREE.MeshPhysicalMaterial({
      color: 0xdbeafe,
      transmission: 0.94,
      roughness: 0.03,
      metalness: 0.04,
      clearcoat: 1.0,
      ior: 1.49,
      transparent: true,
      opacity: 0.42
    });

    const consoleMat = new THREE.MeshBasicMaterial({
      map: consoleTex,
      color: consoleTex ? 0xffffff : 0x06b6d4
    });

    // 2. Coque Principale Océanographique & Sphère de Pression
    // Sphère de pression centrale en titane
    const sphereHull = new THREE.Mesh(new THREE.SphereGeometry(6.2, 20, 16), titaniumMat);
    sphereHull.position.set(4, 0, 0);
    this.mesh.add(sphereHull);

    // Fuselage hydrodynamique enveloppant (flotteurs de mousse syntactique)
    const hullGeom = new THREE.CylinderGeometry(5.8, 5.8, 25, 18);
    hullGeom.rotateZ(Math.PI / 2);
    const hullMesh = new THREE.Mesh(hullGeom, hullMat);
    hullMesh.position.set(0, 0, 0);
    this.mesh.add(hullMesh);

    // Calotte arrière arrondie avec grille de ventilation
    const sternCapGeom = new THREE.SphereGeometry(5.8, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    sternCapGeom.rotateZ(-Math.PI / 2);
    const sternCap = new THREE.Mesh(sternCapGeom, titaniumMat);
    sternCap.position.set(-12.5, 0, 0);
    this.mesh.add(sternCap);

    // Cônes d'échappement hydrodynamiques arrière
    const sternCone = new THREE.Mesh(new THREE.ConeGeometry(3.5, 6, 14), darkAlloyMat);
    sternCone.rotation.z = Math.PI / 2;
    sternCone.position.set(-15.5, 0, 0);
    this.mesh.add(sternCone);

    // Caissons de ballast latéraux avec évents
    [-1, 1].forEach(side => {
      const ballastGeom = new THREE.CylinderGeometry(2.2, 2.2, 18, 12);
      ballastGeom.rotateZ(Math.PI / 2);
      const ballast = new THREE.Mesh(ballastGeom, hullMat);
      ballast.position.set(0, -1.8, side * 5.6);
      this.mesh.add(ballast);

      // Grilles d'inondation de ballast
      for (let gx = -6; gx <= 6; gx += 3) {
        const grate = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.4, 0.2), darkAlloyMat);
        grate.position.set(gx, -3.2, side * 6.5);
        this.mesh.add(grate);
      }
    });

    // Patins d'atterrissage / rails de protection de fond avec amortisseurs
    const skidGeom = new THREE.BoxGeometry(26, 0.9, 1.2);
    const skidL = new THREE.Mesh(skidGeom, titaniumMat);
    skidL.position.set(0, -6.4, -4.5);
    const skidR = new THREE.Mesh(skidGeom, titaniumMat);
    skidR.position.set(0, -6.4, 4.5);
    this.mesh.add(skidL);
    this.mesh.add(skidR);

    // 6 Jambes d'amortisseurs avec vérins
    for (let x = -8; x <= 8; x += 8) {
      const pL = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 3.2, 8), darkAlloyMat);
      pL.position.set(x, -5.0, -4.5);
      const pR = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 3.2, 8), darkAlloyMat);
      pR.position.set(x, -5.0, 4.5);
      this.mesh.add(pL);
      this.mesh.add(pR);

      // Ressorts amortisseurs dorés
      const springL = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 1.5, 8), brassMat);
      springL.position.set(x, -4.6, -4.5);
      const springR = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 1.5, 8), brassMat);
      springR.position.set(x, -4.6, 4.5);
      this.mesh.add(springL);
      this.mesh.add(springR);
    }

    // 3. Kiosque Supérieur & Mât de Télémétrie
    const towerGeom = new THREE.CylinderGeometry(2.4, 3.2, 5.5, 12);
    towerGeom.scale(1.3, 1, 0.9);
    const tower = new THREE.Mesh(towerGeom, titaniumMat);
    tower.position.set(-2, 6.2, 0);
    this.mesh.add(tower);

    // Mât d'antenne avec balise stroboscopique
    const mastGeom = new THREE.CylinderGeometry(0.2, 0.35, 6.5, 8);
    const mast = new THREE.Mesh(mastGeom, titaniumMat);
    mast.position.set(-2, 10.8, 0);
    this.mesh.add(mast);

    // Dôme satellite Satcom radome
    const satcomGeom = new THREE.SphereGeometry(1.2, 12, 10);
    const satcom = new THREE.Mesh(satcomGeom, new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 }));
    satcom.position.set(-3.5, 9.2, 0);
    this.mesh.add(satcom);

    // Strobe blanc éclatant au sommet du mât
    const strobeGeom = new THREE.SphereGeometry(0.5, 10, 8);
    const strobeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.strobeMesh = new THREE.Mesh(strobeGeom, strobeMat);
    this.strobeMesh.position.set(-2, 14.1, 0);
    this.mesh.add(this.strobeMesh);

    this.strobeLight = new THREE.PointLight(0xffffff, 1.5, 55);
    this.strobeLight.position.set(-2, 14.1, 0);
    this.mesh.add(this.strobeLight);

    // Feux de navigation réglementaires IMO : Bâbord (rouge Z-), Tribord (vert Z+), Poupe (ambre X-)
    const navPort = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
    navPort.position.set(-2, 8.2, -3.2);
    const navStarboard = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), new THREE.MeshBasicMaterial({ color: 0x22c55e }));
    navStarboard.position.set(-2, 8.2, 3.2);
    const navStern = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), new THREE.MeshBasicMaterial({ color: 0xf59e0b }));
    navStern.position.set(-13, 3.2, 0);
    this.mesh.add(navPort);
    this.mesh.add(navStarboard);
    this.mesh.add(navStern);

    // Tourelle Caméra Scientifique 4K PTZ (Pan-Tilt)
    this.cameraTurret = new THREE.Group();
    this.cameraTurret.position.set(3.2, 7.2, 0);
    const turretBase = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 0.8, 10), titaniumMat);
    this.cameraTurret.add(turretBase);

    this.turretHead = new THREE.Group();
    this.turretHead.position.set(0, 0.8, 0);
    const camHousing = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 1.4), darkAlloyMat);
    this.turretHead.add(camHousing);

    const lensGeom = new THREE.CylinderGeometry(0.45, 0.55, 0.8, 12);
    lensGeom.rotateZ(Math.PI / 2);
    const lensMesh = new THREE.Mesh(lensGeom, new THREE.MeshPhysicalMaterial({ color: 0x0284c7, transmission: 0.8, roughness: 0.1 }));
    lensMesh.position.set(0.9, 0, 0);
    this.turretHead.add(lensMesh);

    // Voyant REC clignotant rouge
    this.recTallyLight = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
    this.recTallyLight.position.set(0.7, 0.45, 0.5);
    this.turretHead.add(this.recTallyLight);

    this.cameraTurret.add(this.turretHead);
    this.mesh.add(this.cameraTurret);

    // 4. Cockpit Acrylique Hémisphérique Panoramique
    const domeGeom = new THREE.SphereGeometry(5.8, 24, 20, 0, Math.PI * 2, 0, Math.PI / 2);
    domeGeom.rotateZ(Math.PI / 2);
    const dome = new THREE.Mesh(domeGeom, acrylicMat);
    dome.position.set(12.5, 0, 0);
    this.mesh.add(dome);

    // Cerclage de fixation en titane avec boulons
    const ringGeom = new THREE.TorusGeometry(5.8, 0.45, 10, 28);
    ringGeom.rotateY(Math.PI / 2);
    const ring = new THREE.Mesh(ringGeom, titaniumMat);
    ring.position.set(12.5, 0, 0);
    this.mesh.add(ring);

    // Intérieur du Cockpit : Sièges pilotes, Console digitale et Joysticks
    // Sièges ergonomiques pilote & copilote
    [-1.2, 1.2].forEach(zPos => {
      const seat = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.2, 1.4), new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 }));
      seat.position.set(8.5, -0.6, zPos);
      this.mesh.add(seat);
    });

    // Console digitale panoramique en arc
    const consoleGeom = new THREE.BoxGeometry(2.4, 2.0, 4.8);
    const consoleMesh = new THREE.Mesh(consoleGeom, titaniumMat);
    consoleMesh.position.set(10.6, -1.1, 0);
    this.mesh.add(consoleMesh);

    // 3 Écrans d'instruments haute technologie
    [-1.4, 0, 1.4].forEach((zPos, idx) => {
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.85), consoleMat);
      screen.position.set(11.9, -0.5, zPos);
      screen.rotation.y = Math.PI / 2 + (idx - 1) * 0.15;
      screen.rotation.x = -Math.PI / 9;
      this.mesh.add(screen);
    });

    // Lumière d'ambiance cockpit douce
    this.cockpitGlow = new THREE.PointLight(0x06b6d4, 0.45, 14);
    this.cockpitGlow.position.set(10.5, 0.8, 0);
    this.mesh.add(this.cockpitGlow);

    // 5. Quatre Propulseurs Vectoriels Carénés (2 Principaux Arrière + 2 Verticaux)
    this.propellers = [];
    this.rudders = [];

    // Propulseurs arrière bâbord et tribord Kort Nozzles avec safrans de direction
    const thrusterShape = (side) => {
      const tg = new THREE.Group();
      tg.position.set(-11, 0, side * 7.5);

      // Pylône profilé
      const pylon = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 2.5, 8), titaniumMat);
      pylon.rotation.x = Math.PI / 2;
      pylon.position.set(0, 0, -side * 1.0);
      tg.add(pylon);

      // Tuyère carénée Kort Nozzle
      const ductGeom = new THREE.CylinderGeometry(2.3, 2.5, 4.2, 16, 1, true);
      ductGeom.rotateZ(Math.PI / 2);
      const duct = new THREE.Mesh(ductGeom, titaniumMat);
      tg.add(duct);

      // Moyeu d'hélice
      const hub = new THREE.Mesh(new THREE.SphereGeometry(0.75, 10, 8), brassMat);
      tg.add(hub);

      // 4 Pales d'hélice en laiton marin
      const propGroup = new THREE.Group();
      for (let b = 0; b < 4; b++) {
        const bladeGeom = new THREE.BoxGeometry(0.16, 1.9, 0.65);
        const blade = new THREE.Mesh(bladeGeom, brassMat);
        blade.position.y = 0.95;
        blade.rotation.x = 0.38;
        const bHolder = new THREE.Group();
        bHolder.rotation.x = (b / 4) * Math.PI * 2;
        bHolder.add(blade);
        propGroup.add(bHolder);
      }
      tg.add(propGroup);
      this.propellers.push(propGroup);

      // Safran de gouvernail hydrodynamique articulé
      const rudderHolder = new THREE.Group();
      rudderHolder.position.set(-2.4, 0, 0);
      const rudderMesh = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.2, 1.4), darkAlloyMat);
      rudderMesh.position.set(-0.7, 0, 0);
      rudderHolder.add(rudderMesh);
      tg.add(rudderHolder);
      this.rudders.push(rudderHolder);

      return tg;
    };

    this.thrusterL = thrusterShape(-1);
    this.thrusterR = thrusterShape(1);
    this.mesh.add(this.thrusterL);
    this.mesh.add(this.thrusterR);

    // Propulseurs verticaux intégrés (tunnel thrusters) avec hélices intérieures
    this.vertPropellers = [];
    [-4.6, 4.6].forEach(sideZ => {
      const vertTunnel = new THREE.Mesh(new THREE.CylinderGeometry(1.65, 1.65, 4.6, 14, 1, true), titaniumMat);
      vertTunnel.position.set(4, 0, sideZ);
      this.mesh.add(vertTunnel);

      // Hélice verticale intérieure
      const vProp = new THREE.Group();
      vProp.position.set(4, 0, sideZ);
      for (let vb = 0; vb < 3; vb++) {
        const vBlade = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.4, 0.45), brassMat);
        vBlade.position.x = 0.7;
        vBlade.rotation.y = 0.3;
        const vHolder = new THREE.Group();
        vHolder.rotation.y = (vb / 3) * Math.PI * 2;
        vHolder.add(vBlade);
        vProp.add(vHolder);
      }
      this.mesh.add(vProp);
      this.vertPropellers.push(vProp);
    });

    // 6. Deux Bras Manipulateurs Scientifiques Robotisés (Bâbord Échantillonneur + Tribord Sonde CTD)
    // Bras Bâbord : Bras de prélèvement avec pince hydraulique 3-mors
    this.armGroup = new THREE.Group();
    this.armGroup.position.set(8.8, -3.6, -3.8);

    const armBase = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.2, 1.2, 8), titaniumMat);
    this.armGroup.add(armBase);

    this.armShoulder = new THREE.Group();
    this.armShoulder.position.set(0, 0.8, 0);
    this.armGroup.add(this.armShoulder);

    const bicep = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 4.6, 8), titaniumMat);
    bicep.position.set(1.6, 1.3, 0);
    bicep.rotation.z = -Math.PI / 4;
    this.armShoulder.add(bicep);

    this.armElbow = new THREE.Group();
    this.armElbow.position.set(3.2, 2.6, 0);
    this.armShoulder.add(this.armElbow);

    const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 4.2, 8), titaniumMat);
    forearm.position.set(1.9, -0.8, 0);
    forearm.rotation.z = Math.PI / 5;
    this.armElbow.add(forearm);

    // Pince hydraulique 3-doigts
    this.claw = new THREE.Group();
    this.claw.position.set(3.6, -1.8, 0);
    this.armElbow.add(this.claw);

    this.clawFingers = [];
    for (let c = 0; c < 3; c++) {
      const finger = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.25, 0.35), titaniumMat);
      finger.position.set(0.65, 0, 0);
      const fHolder = new THREE.Group();
      fHolder.rotation.x = (c / 3) * Math.PI * 2;
      fHolder.rotation.z = 0.25;
      fHolder.add(finger);
      this.claw.add(fHolder);
      this.clawFingers.push(fHolder);
    }
    this.mesh.add(this.armGroup);

    // Bras Tribord : Sonde Scientifique CTD & Laser de Mesure
    this.sensorArm = new THREE.Group();
    this.sensorArm.position.set(8.8, -3.6, 3.8);
    const sBase = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 1.0, 8), titaniumMat);
    this.sensorArm.add(sBase);

    const sPylon = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 4.0, 8), darkAlloyMat);
    sPylon.position.set(1.5, 0.8, 0);
    sPylon.rotation.z = -Math.PI / 3;
    this.sensorArm.add(sPylon);

    // Tête de capteurs CTD multispectrale
    const ctdHead = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 1.6, 10), titaniumMat);
    ctdHead.position.set(3.2, 1.8, 0);
    ctdHead.rotation.z = Math.PI / 2;
    this.sensorArm.add(ctdHead);

    const ctdGlow = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
    ctdGlow.position.set(4.1, 1.8, 0);
    this.sensorArm.add(ctdGlow);

    this.mesh.add(this.sensorArm);

    // 7. Télémètre Laser Océanographique Vert (Dual Parallel Laser Scaler - 10cm NOAA Standard)
    const laserMat = new THREE.MeshBasicMaterial({
      color: 0x22c55e,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });

    const laserGeom = new THREE.CylinderGeometry(0.04, 0.04, 85, 6);
    laserGeom.rotateZ(Math.PI / 2);
    laserGeom.translate(42.5, 0, 0);

    this.laserBeamL = new THREE.Mesh(laserGeom, laserMat);
    this.laserBeamL.position.set(13.2, 0.2, -1.8);
    this.laserBeamR = new THREE.Mesh(laserGeom, laserMat);
    this.laserBeamR.position.set(13.2, 0.2, 1.8);
    this.mesh.add(this.laserBeamL);
    this.mesh.add(this.laserBeamR);

    // 8. Projecteurs LED Subaquatiques Doubles Haute Puissance + Cônes Volumétriques
    this.spotL = new THREE.SpotLight(0xa5f3fc, 3.5, 380, Math.PI / 4.2, 0.35, 1.0);
    this.spotL.position.set(13.5, 2.2, -4.4);
    this.spotLTarget = new THREE.Object3D();
    this.spotLTarget.position.set(75, 0, -4.4);
    this.mesh.add(this.spotL);
    this.mesh.add(this.spotLTarget);
    this.spotL.target = this.spotLTarget;

    this.spotR = new THREE.SpotLight(0xa5f3fc, 3.5, 380, Math.PI / 4.2, 0.35, 1.0);
    this.spotR.position.set(13.5, 2.2, 4.4);
    this.spotRTarget = new THREE.Object3D();
    this.spotRTarget.position.set(75, 0, 4.4);
    this.mesh.add(this.spotR);
    this.mesh.add(this.spotRTarget);
    this.spotR.target = this.spotRTarget;

    // Rétrocompatibilité this.light
    this.light = this.spotL;
    this.lightTarget = this.spotLTarget;

    // Faisceaux lumineux volumétriques semi-transparents
    const beamGeom = new THREE.ConeGeometry(22, 105, 16, 1, true);
    beamGeom.rotateX(-Math.PI / 2);
    beamGeom.translate(0, 0, 52);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x7dd3fc,
      transparent: true,
      opacity: 0.14,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.beamMeshL = new THREE.Mesh(beamGeom, beamMat);
    this.beamMeshL.position.set(13.5, 2.2, -4.4);
    this.mesh.add(this.beamMeshL);

    this.beamMeshR = new THREE.Mesh(beamGeom, beamMat.clone());
    this.beamMeshR.position.set(13.5, 2.2, 4.4);
    this.mesh.add(this.beamMeshR);

    // Strobe Flash Photo Scientifique (Xénon 100ms)
    this.photoFlashLight = new THREE.PointLight(0xffffff, 0, 280);
    this.photoFlashLight.position.set(15, 2, 0);
    this.mesh.add(this.photoFlashLight);

    // 9. Onde Sonar Visuelle 3D Réactive (Anneaux concentriques acoustiques)
    const waveRingGeom = new THREE.RingGeometry(0.5, 2.5, 32);
    waveRingGeom.rotateY(Math.PI / 2);
    this.sonarRingMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.sonarWaveMesh = new THREE.Mesh(waveRingGeom, this.sonarRingMat);
    this.sonarWaveMesh.position.set(15, 0, 0);
    this.mesh.add(this.sonarWaveMesh);

    // 10. Sillage de Bulles d'Hélice & Cavitation
    const bubbleCount = 70;
    const bPos = new Float32Array(bubbleCount * 3);
    for (let b = 0; b < bubbleCount * 3; b += 3) {
      bPos[b] = -12 - Math.random() * 12;
      bPos[b + 1] = (Math.random() - 0.5) * 4;
      bPos[b + 2] = (Math.random() - 0.5) * 10;
    }
    const bGeom = new THREE.BufferGeometry();
    bGeom.setAttribute('position', new THREE.BufferAttribute(bPos, 3));
    this.bubbleWake = new THREE.Points(bGeom, new THREE.PointsMaterial({
      color: 0xe0f2fe,
      size: 2.4,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    }));
    this.mesh.add(this.bubbleWake);
  }

  bindKeyboardControls() {
    window.addEventListener('keydown', (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      const key = e.key.toLowerCase();

      // Pilotage direct (WASD / ZQSD / Flèches)
      if (key === 'w' || key === 'z' || key === 'arrowup') {
        this.keys.forward = true;
        this.controlMode = 'manual';
      }
      if (key === 's' || key === 'arrowdown') {
        this.keys.backward = true;
        this.controlMode = 'manual';
      }
      if (key === 'a' || key === 'q' || key === 'arrowleft') {
        this.keys.left = true;
        this.controlMode = 'manual';
      }
      if (key === 'd' || key === 'arrowright') {
        this.keys.right = true;
        this.controlMode = 'manual';
      }
      if (e.code === 'Space' || key === 'pageup') {
        this.keys.up = true;
        this.controlMode = 'manual';
      }
      if (key === 'shift' || key === 'pagedown') {
        this.keys.down = true;
        this.controlMode = 'manual';
      }

      // Actions spéciales sous-marines
      if (key === 't') this.triggerTurbo();
      if (key === 'f' || key === 'l') this.cycleLights();
      if (key === 'c' || key === 'r') this.triggerSonar();
      if (key === 'p') this.captureScientificPhoto();
      if (key === 'e') this.launchBait();
      if (key === 'v') this.toggleCameraView();
      if (key === 'm') this.toggleAutoPilot();
    });

    window.addEventListener('keyup', (e) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'z' || key === 'arrowup') this.keys.forward = false;
      if (key === 's' || key === 'arrowdown') this.keys.backward = false;
      if (key === 'a' || key === 'q' || key === 'arrowleft') this.keys.left = false;
      if (key === 'd' || key === 'arrowright') this.keys.right = false;
      if (e.code === 'Space' || key === 'pageup') this.keys.up = false;
      if (key === 'shift' || key === 'pagedown') this.keys.down = false;
    });
  }

  triggerTurbo() {
    this.isTurbo = true;
    this.turboTimer = 2.4;
    this.cameraShake = 0.8;
    audio.playTurboBoost();
    showToast("Propulseurs Turbo Boost engagés à pleine puissance !", '⚡');
  }

  toggleAutoPilot() {
    if (this.controlMode === 'auto') {
      this.controlMode = 'manual';
      showToast("Mode ROV : Pilotage Manuel (WASD / Flèches, Espace/Shift)", '🕹️');
    } else {
      this.controlMode = 'auto';
      this.escortTarget = null;
      showToast("Mode ROV : Pilote Automatique d'Exploration", '🧭');
    }
    this.updateHUDControls();
  }

  setEscortTarget(targetKey) {
    this.escortTarget = targetKey;
    if (targetKey) {
      this.controlMode = 'escort';
      const names = {
        megalodon: "Mégalodon Préhistorique",
        mosasaur: "Mosasaure Titanesque",
        kraken: "Kraken Colossal",
        leviathan: "Léviathan Originel",
        nearest: "Cible la plus proche"
      };
      const label = names[targetKey] || "Organisme cible";
      showToast(`Escorte scientifique : Verrouillage sur ${label} !`, '🎯');
    } else {
      this.controlMode = 'auto';
      showToast("Escorte annulée : Retour en patrouille d'exploration", '🧭');
    }
    this.updateHUDControls();
  }

  cycleLights() {
    if (this.lightMode === 'normal') {
      // Passer en mode UV Abyssal (395nm)
      this.lightMode = 'uv';
      this.spotL.color.setHex(0xa855f7);
      this.spotR.color.setHex(0xa855f7);
      this.spotL.intensity = 4.2;
      this.spotR.intensity = 4.2;
      this.beamMeshL.material.color.setHex(0xa855f7);
      this.beamMeshR.material.color.setHex(0xa855f7);
      this.beamMeshL.visible = true;
      this.beamMeshR.visible = true;
      showToast("Phares ROV : Faisceau UV 395nm (Fluorescence Abyssale) 🟣", '💡');
    } else if (this.lightMode === 'uv') {
      // Passer en mode Rouge Furtif Abyssal (660nm)
      this.lightMode = 'red';
      this.spotL.color.setHex(0xef4444);
      this.spotR.color.setHex(0xef4444);
      this.spotL.intensity = 3.6;
      this.spotR.intensity = 3.6;
      this.beamMeshL.material.color.setHex(0xf87171);
      this.beamMeshR.material.color.setHex(0xf87171);
      this.beamMeshL.visible = true;
      this.beamMeshR.visible = true;
      showToast("Phares ROV : Faisceau Rouge 660nm (Observation Furtive) 🔴", '💡');
    } else if (this.lightMode === 'red') {
      // Éteindre les phares
      this.lightMode = 'off';
      this.spotL.intensity = 0;
      this.spotR.intensity = 0;
      this.beamMeshL.visible = false;
      this.beamMeshR.visible = false;
      showToast("Phares ROV : Éteints (Furtivité totale) 🌑", '💡');
    } else {
      // Mode Normal LED 5600K
      this.lightMode = 'normal';
      this.spotL.color.setHex(0xa5f3fc);
      this.spotR.color.setHex(0xa5f3fc);
      this.spotL.intensity = 3.5;
      this.spotR.intensity = 3.5;
      this.beamMeshL.material.color.setHex(0x7dd3fc);
      this.beamMeshR.material.color.setHex(0x7dd3fc);
      this.beamMeshL.visible = true;
      this.beamMeshR.visible = true;
      showToast("Phares ROV : LED 5600K Plein Faisceau (Jour Abyssal) ☀️", '💡');
    }
    this.updateHUDControls();
  }

  // Rétrocompatibilité
  toggleLights() {
    this.cycleLights();
  }

  toggleCameraView() {
    this.cameraView = this.cameraView === 'firstPerson' ? 'thirdPerson' : 'firstPerson';
    this.camera = this.cameraView === 'firstPerson' ? this.cockpitCamera : this.chaseCamera;
    const viewLabel = this.cameraView === 'firstPerson' ? 'Vue Cockpit Intérieur (1P)' : 'Vue Extérieure Chasseur (3P)';
    showToast(`Caméra ROV : ${viewLabel}`, '🎥');
    this.updateHUDControls();
  }

  getActiveCamera() {
    return this.cameraView === 'firstPerson' ? this.cockpitCamera : this.chaseCamera;
  }

  triggerSonar() {
    this.sonarActive = true;
    this.sonarPingTimer = 1.8;
    this.sonarWaveMesh.scale.set(1, 1, 1);
    this.sonarRingMat.opacity = 0.9;
    audio.playSonarPing();

    if (this.nearestTarget) {
      showToast(`Sonar 360° : Écho [${this.nearestTarget.config.name}] détecté à ${Math.round(this.nearestDist)}m !`, '📡');
    } else {
      showToast("Sonar actif : Balayage acoustique 360° en cours...", '📡');
    }
  }

  launchBait() {
    if (window.aquarium) {
      window.aquarium.spawnFood(14);
      audio.playBaitLaunch();
      this.clawAnimation = 1.0;
      showToast("Capsule d'appâts scientifiques éjectée par le bras robotique !", '🍪');
    }
  }

  captureScientificPhoto() {
    if (!window.aquarium || !window.aquarium.renderer) return;

    // Flash xénon haute intensité
    if (this.photoFlashLight) {
      this.photoFlashLight.intensity = 8.0;
      setTimeout(() => {
        if (this.photoFlashLight) this.photoFlashLight.intensity = 0;
      }, 110);
    }

    // Flash CSS plein écran
    const flashEl = document.getElementById('camera-flash-overlay');
    if (flashEl) {
      flashEl.classList.add('flash');
      setTimeout(() => flashEl.classList.remove('flash'), 200);
    }

    // Son de l'obturateur photo
    audio.playCameraShutter();

    // Capture d'image depuis le canvas WebGL
    try {
      const dataUrl = window.aquarium.renderer.domElement.toDataURL('image/jpeg', 0.82);
      const targetName = (this.nearestTarget && this.nearestDist < 95)
        ? this.nearestTarget.config.name
        : "Fond marin & Coraux";

      const photoRecord = {
        id: Date.now(),
        image: dataUrl,
        timestamp: new Date().toLocaleTimeString(),
        depth: Math.round(this.tank.height - this.position.y),
        heading: Math.round(((this.yaw * 180 / Math.PI) % 360 + 360) % 360),
        target: targetName,
        biome: window.aquarium.currentBiome || 'tropical',
        lightMode: this.lightMode
      };

      window.AQUALAB_PHOTOS = window.AQUALAB_PHOTOS || [];
      window.AQUALAB_PHOTOS.unshift(photoRecord);
      if (window.AQUALAB_PHOTOS.length > 20) window.AQUALAB_PHOTOS.pop();

      // Mettre à jour badge photo
      const badge = document.getElementById('rov-photos-count');
      if (badge) badge.textContent = window.AQUALAB_PHOTOS.length;

      showToast(`Cliché scientifique enregistré : [${targetName}] !`, '📸');
    } catch (e) {
      console.warn("Capture photo impossible:", e);
    }
  }

  update(delta, boids = []) {
    const time = Date.now() * 0.001;

    // 1. Clignotement de la balise stroboscopique de mât et REC caméra
    const strobeOn = (Date.now() % 1100) < 120;
    this.strobeMesh.material.color.setHex(strobeOn ? 0xffffff : 0x334155);
    this.strobeLight.intensity = strobeOn ? 2.8 : 0;

    const recOn = (Date.now() % 900) < 550;
    if (this.recTallyLight) {
      this.recTallyLight.material.color.setHex(recOn ? 0xef4444 : 0x450a0a);
    }

    // 2. Gestion du Turbo Boost
    if (this.isTurbo) {
      this.turboTimer -= delta;
      this.maxSpeed = this.baseMaxSpeed * 2.2;
      this.cameraShake = Math.max(0, this.turboTimer / 2.4) * 0.7;
      if (this.turboTimer <= 0) {
        this.isTurbo = false;
        this.maxSpeed = this.baseMaxSpeed;
      }
    } else {
      this.maxSpeed = this.baseMaxSpeed;
      this.cameraShake = THREE.MathUtils.lerp(this.cameraShake, 0, 0.1);
    }

    // 3. Navigation selon le mode
    if (this.controlMode === 'manual') {
      let thrust = 0;
      let yawDelta = 0;
      let vertDelta = 0;

      if (this.keys.forward) thrust += this.maxSpeed;
      if (this.keys.backward) thrust -= this.maxSpeed * 0.65;
      if (this.keys.left) yawDelta += this.turnSpeed * delta;
      if (this.keys.right) yawDelta -= this.turnSpeed * delta;
      if (this.keys.up) vertDelta += (this.isTurbo ? 2.8 : 1.8);
      if (this.keys.down) vertDelta -= (this.isTurbo ? 2.8 : 1.8);

      this.yaw += yawDelta;
      this.speed = THREE.MathUtils.lerp(this.speed, thrust, 0.12);

      const forwardVec = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw)).normalize();
      this.velocity.x = forwardVec.x * this.speed;
      this.velocity.z = forwardVec.z * this.speed;
      this.velocity.y = THREE.MathUtils.lerp(this.velocity.y, vertDelta, 0.14);

      // Roulis (banking) réaliste dans les virages
      const targetRoll = -yawDelta * 7.5;
      this.roll = THREE.MathUtils.lerp(this.roll, targetRoll, 0.14);

      // Tangage (pitch) en montée / descente
      const targetPitch = vertDelta * 0.14;
      this.pitch = THREE.MathUtils.lerp(this.pitch, targetPitch, 0.14);

      // Orientation des safrans arrière de gouvernail
      for (const r of this.rudders) {
        r.rotation.y = THREE.MathUtils.lerp(r.rotation.y, yawDelta * 12, 0.2);
      }

      // Bruit moteur électrique proportionnel à la vitesse
      if (Math.abs(this.speed) > 0.3 && Math.random() < 0.16) {
        audio.playSubEngine();
      }
    } else if (this.controlMode === 'escort' && this.escortTarget) {
      // Mode Escorte Automatique : Traquer le titan sélectionné
      let targetObj = null;
      if (window.aquarium) {
        if (this.escortTarget === 'megalodon' && window.aquarium.megalodon && window.aquarium.megalodon.active) {
          targetObj = window.aquarium.megalodon;
        } else if (this.escortTarget === 'mosasaur' && window.aquarium.mosasaur && window.aquarium.mosasaur.active) {
          targetObj = window.aquarium.mosasaur;
        } else if (this.escortTarget === 'kraken' && window.aquarium.kraken && window.aquarium.kraken.active) {
          targetObj = window.aquarium.kraken;
        } else if (this.escortTarget === 'leviathan' && window.aquarium.ropefish && window.aquarium.ropefish.active) {
          targetObj = window.aquarium.ropefish;
        } else if (this.escortTarget === 'nearest' && this.nearestTarget) {
          targetObj = this.nearestTarget;
        }
      }

      if (targetObj) {
        const targetPos = targetObj.getHeadPosition ? targetObj.getHeadPosition() : targetObj.position;
        // Se placer légèrement en retrait et au-dessus de la cible
        const toTarget = new THREE.Vector3().subVectors(targetPos, this.position);
        const dist = toTarget.length();

        // Calculer l'angle vers la cible
        const targetYaw = Math.atan2(-toTarget.z, toTarget.x);
        let diffYaw = targetYaw - this.yaw;
        while (diffYaw < -Math.PI) diffYaw += Math.PI * 2;
        while (diffYaw > Math.PI) diffYaw -= Math.PI * 2;
        this.yaw += diffYaw * delta * 2.2;

        const desiredDist = this.escortDistance;
        const forwardSpeed = (dist > desiredDist) ? Math.min(this.maxSpeed, (dist - desiredDist) * 0.08) : -0.5;
        this.speed = THREE.MathUtils.lerp(this.speed, forwardSpeed, 0.1);

        const forwardVec = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw)).normalize();
        this.velocity.x = forwardVec.x * this.speed;
        this.velocity.z = forwardVec.z * this.speed;

        // Suivi en profondeur avec décalage de +8m au-dessus
        const desiredY = THREE.MathUtils.clamp(targetPos.y + 8, 30, this.tank.height - 30);
        this.velocity.y = (desiredY - this.position.y) * 0.04;

        this.pitch = THREE.MathUtils.lerp(this.pitch, this.velocity.y * 0.1, 0.1);
        this.roll = THREE.MathUtils.lerp(this.roll, 0, 0.1);

        // Faire pivoter la tourelle caméra PTZ directement vers la cible
        if (this.turretHead) {
          this.turretHead.lookAt(targetPos);
        }
      } else {
        // Cible perdue ou inactive : repasser en auto
        this.controlMode = 'auto';
      }
    } else {
      // Navigation autonome scientifique (Patrouille d'exploration fluide)
      const autoSpeed = 1.1;
      this.yaw = Math.sin(time * 0.07) * 0.8 + time * 0.045;
      const forwardVec = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw)).normalize();
      this.velocity.x = forwardVec.x * autoSpeed;
      this.velocity.z = forwardVec.z * autoSpeed;
      this.velocity.y = Math.sin(time * 0.45) * 0.5;
      this.roll = Math.sin(time * 0.35) * 0.05;
      this.pitch = Math.sin(time * 0.28) * 0.06;

      // Balayage doux de la tourelle caméra
      if (this.turretHead) {
        this.turretHead.rotation.y = Math.sin(time * 0.8) * 0.4;
        this.turretHead.rotation.x = Math.sin(time * 0.5) * 0.15;
      }
    }

    // Intégration de position
    this.position.addScaledVector(this.velocity, delta * 60 * SIM_SETTINGS.speed);

    // Frontières de sécurité douces de l'aquarium
    const halfW = this.tank.width / 2 - 25;
    const halfD = this.tank.depth / 2 - 25;
    this.position.x = THREE.MathUtils.clamp(this.position.x, -halfW, halfW);
    this.position.z = THREE.MathUtils.clamp(this.position.z, -halfD, halfD);
    this.position.y = THREE.MathUtils.clamp(this.position.y, 22, this.tank.height - 22);

    // Calcul de la distance au plus proche obstacle (parois ou sol)
    const distToX = halfW - Math.abs(this.position.x);
    const distToZ = halfD - Math.abs(this.position.z);
    const distToFloor = this.position.y - 22;
    this.proximityDist = Math.min(distToX, distToZ, distToFloor);
    this.proximityWarning = this.proximityDist < 18;

    // Alerte sonore de proximité
    if (this.proximityWarning && Math.random() < 0.06) {
      audio.playProximityAlert();
    }

    // Orientation et secousses cockpit
    this.mesh.position.copy(this.position);
    this.mesh.rotation.set(0, 0, 0);
    this.mesh.rotation.y = this.yaw;
    this.mesh.rotation.z = this.pitch + (Math.random() - 0.5) * this.cameraShake * 0.03;
    this.mesh.rotation.x = this.roll + (Math.random() - 0.5) * this.cameraShake * 0.03;

    // Rotation active des hélices de propulsion Kort Nozzle
    const propThrust = Math.abs(this.velocity.length());
    this.propellerSpeed += delta * (8 + propThrust * 20);
    for (const prop of this.propellers) {
      prop.rotation.x = this.propellerSpeed;
    }

    // Rotation des hélices verticales intérieures
    const vertThrust = Math.abs(this.velocity.y);
    this.vertPropellerSpeed += delta * (4 + vertThrust * 24);
    for (const vProp of this.vertPropellers) {
      vProp.rotation.y = this.vertPropellerSpeed;
    }

    // Animation du sillage de bulles et cavitation
    if (this.bubbleWake) {
      this.bubbleWake.material.opacity = this.isTurbo ? 0.95 : (propThrust > 0.4 ? 0.65 : 0.25);
      this.bubbleWake.material.size = this.isTurbo ? 3.8 : 2.4;
      const bAttr = this.bubbleWake.geometry.attributes.position;
      const bArray = bAttr.array;
      for (let i = 0; i < bArray.length; i += 3) {
        bArray[i] -= (this.isTurbo ? 1.4 : 0.65) * delta * 60;
        bArray[i + 1] += 0.22 * delta * 60;
        if (bArray[i] < -32) {
          bArray[i] = -12;
          bArray[i + 1] = (Math.random() - 0.5) * 4;
          bArray[i + 2] = (Math.random() - 0.5) * 10;
        }
      }
      bAttr.needsUpdate = true;
    }

    // Animation de l'onde Sonar 3D
    if (this.sonarPingTimer > 0) {
      this.sonarPingTimer -= delta;
      this.sonarWaveMesh.scale.addScalar(delta * 24);
      this.sonarRingMat.opacity = Math.max(0, this.sonarPingTimer / 1.8) * 0.9;
    } else {
      this.sonarRingMat.opacity = 0;
    }

    // Animation mécanique du bras et pince
    if (this.clawAnimation > 0) {
      this.clawAnimation -= delta * 1.5;
      const tClaw = Math.max(0, this.clawAnimation);
      for (const finger of this.clawFingers) {
        finger.rotation.z = 0.25 + Math.sin(tClaw * Math.PI) * 0.5;
      }
      if (this.armShoulder) {
        this.armShoulder.rotation.z = -Math.PI / 10 + Math.sin(tClaw * Math.PI) * 0.25;
      }
    } else if (this.armShoulder && this.armElbow) {
      this.armShoulder.rotation.z = -Math.PI / 10 + Math.sin(time * 0.55) * 0.07;
      this.armElbow.rotation.z = Math.PI / 8 + Math.cos(time * 0.45) * 0.05;
    }

    // Détection Radar de la cible la plus proche
    this.detectNearestTarget(boids);

    // Mettre à jour télémétrie du Cockpit HUD
    this.updateCockpitHUD();
  }

  detectNearestTarget(boids) {
    let nearest = null;
    let minDist = Infinity;

    // Chercher d'abord parmi les titans actifs
    if (window.aquarium && window.aquarium.superPredatorList) {
      for (const titan of window.aquarium.superPredatorList) {
        if (!titan || !titan.active) continue;
        const titanHead = titan.getHeadPosition ? titan.getHeadPosition() : titan.position;
        const d = this.position.distanceTo(titanHead);
        if (d < minDist) {
          minDist = d;
          nearest = {
            isTitan: true,
            titanKey: titan.key || titan.id,
            config: { name: titan.name, type: 'titan', species: titan.species },
            position: titanHead,
            velocity: titan.velocity || new THREE.Vector3(0, 0, 0),
            isPredator: true
          };
        }
      }
    }

    // Chercher ensuite parmi les boids normaux
    for (const b of boids) {
      if (b.isDead) continue;
      const d = this.position.distanceTo(b.position);
      if (d < minDist) {
        minDist = d;
        nearest = b;
      }
    }

    this.nearestTarget = nearest;
    this.nearestDist = minDist;
  }

  updateCockpitHUD() {
    const depthEl = document.getElementById('rov-depth');
    const headingEl = document.getElementById('rov-heading');
    const speedEl = document.getElementById('rov-speed');
    const pressureEl = document.getElementById('rov-pressure');
    const tempEl = document.getElementById('rov-temp');
    const targetEl = document.getElementById('rov-target');
    const modeEl = document.getElementById('rov-mode-badge');
    const lightEl = document.getElementById('rov-lights-badge');
    const proxAlert = document.getElementById('rov-proximity-alert');

    const depthMeters = Math.round(this.tank.height - this.position.y);
    if (depthEl) depthEl.textContent = depthMeters;

    if (headingEl) {
      const deg = Math.round(((this.yaw * 180 / Math.PI) % 360 + 360) % 360);
      let cardinal = 'N';
      if (deg >= 22 && deg < 67) cardinal = 'NE';
      else if (deg >= 67 && deg < 112) cardinal = 'E';
      else if (deg >= 112 && deg < 157) cardinal = 'SE';
      else if (deg >= 157 && deg < 202) cardinal = 'S';
      else if (deg >= 202 && deg < 247) cardinal = 'SO';
      else if (deg >= 247 && deg < 292) cardinal = 'O';
      else if (deg >= 292 && deg < 337) cardinal = 'NO';
      headingEl.textContent = `${deg}° [${cardinal}]`;
    }

    if (speedEl) {
      const knotSpeed = (this.velocity.length() * 1.94).toFixed(1);
      speedEl.textContent = `${knotSpeed} kts`;
      if (this.isTurbo) speedEl.style.color = '#f59e0b';
      else speedEl.style.color = '#38bdf8';
    }

    if (pressureEl) {
      // 1 bar atmosphérique + ~0.1 bar tous les 10m
      const bar = (1.0 + depthMeters * 0.012).toFixed(2);
      pressureEl.textContent = `${bar} bar`;
    }

    if (tempEl) {
      // Eau plus chaude en surface, plus fraîche au fond
      const temp = (26.5 - depthMeters * 0.02).toFixed(1);
      tempEl.textContent = `${temp}°C`;
    }

    if (targetEl) {
      if (this.nearestTarget && this.nearestDist < 110) {
        const isTitan = this.nearestTarget.isTitan;
        const prefix = isTitan ? "TITAN: " : "";
        targetEl.textContent = `${prefix}${this.nearestTarget.config.name} (${Math.round(this.nearestDist)}m)`;
        targetEl.style.color = isTitan ? '#ef4444' : (this.nearestTarget.isPredator ? '#f43f5e' : '#38bdf8');
      } else {
        targetEl.textContent = "Aucune cible à portée";
        targetEl.style.color = '#94a3b8';
      }
    }

    if (modeEl) {
      if (this.controlMode === 'manual') {
        modeEl.textContent = "MANUEL [WASD]";
        modeEl.style.color = "#f59e0b";
      } else if (this.controlMode === 'escort') {
        modeEl.textContent = "ESCORTE TITAN 🎯";
        modeEl.style.color = "#ef4444";
      } else {
        modeEl.textContent = "AUTONOME 🧭";
        modeEl.style.color = "#10b981";
      }
    }

    if (lightEl) {
      const lightLabels = {
        normal: 'LED 5600K ☀️',
        uv: 'UV FLUO 395nm 🟣',
        red: 'ROUGE FURTIF 🔴',
        off: 'ÉTEINTS 🌑'
      };
      lightEl.textContent = lightLabels[this.lightMode] || 'NORMAL';
      const colors = { normal: '#38bdf8', uv: '#c084fc', red: '#f87171', off: '#64748b' };
      lightEl.style.color = colors[this.lightMode] || '#38bdf8';
    }

    if (proxAlert) {
      proxAlert.style.display = this.proximityWarning ? 'flex' : 'none';
      const proxDistEl = document.getElementById('rov-prox-dist');
      if (proxDistEl) proxDistEl.textContent = Math.round(this.proximityDist);
    }

    // Mettre à jour carte Bio-Scanner latérale
    this.updateBioScannerCard();

    // Dessin en temps réel sur le mini-radar sonar canvas
    this.drawSonarRadar();
  }

  updateBioScannerCard() {
    const card = document.getElementById('rov-bio-card');
    if (!card) return;

    if (this.nearestTarget && this.nearestDist < 95) {
      card.style.display = 'block';
      const nameEl = document.getElementById('rov-bio-name');
      const scNameEl = document.getElementById('rov-bio-scientific');
      const typeEl = document.getElementById('rov-bio-type');
      const distEl = document.getElementById('rov-bio-dist');
      const speedEl = document.getElementById('rov-bio-speed');
      const stateEl = document.getElementById('rov-bio-state');

      if (nameEl) nameEl.textContent = this.nearestTarget.config.name;
      if (scNameEl) {
        scNameEl.textContent = this.nearestTarget.config.species || (this.nearestTarget.isTitan ? "Titanidae Apex" : "Actinopterygii");
      }
      if (typeEl) {
        if (this.nearestTarget.isTitan) {
          typeEl.textContent = "SUPER-PRÉDATEUR APEX";
          typeEl.style.color = "#ef4444";
        } else if (this.nearestTarget.isPredator) {
          typeEl.textContent = "PRÉDATEUR CARNASSIER";
          typeEl.style.color = "#f43f5e";
        } else {
          typeEl.textContent = "PROIE D'ESSAIM";
          typeEl.style.color = "#34d399";
        }
      }
      if (distEl) distEl.textContent = `${Math.round(this.nearestDist)} m`;
      if (speedEl) {
        const spd = this.nearestTarget.velocity ? (this.nearestTarget.velocity.length() * 1.9).toFixed(1) : "1.8";
        speedEl.textContent = `${spd} kts`;
      }
      if (stateEl) {
        stateEl.textContent = this.nearestTarget.state || (this.nearestTarget.isTitan ? "Chasse active" : "Banc coordonné");
      }
    } else {
      card.style.display = 'none';
    }
  }

  drawSonarRadar() {
    const canvas = document.getElementById('rov-radar-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const radius = w * 0.44;

    ctx.clearRect(0, 0, w, h);

    // Fond radar sombre avec bordure circulaire
    ctx.fillStyle = 'rgba(2, 6, 23, 0.85)';
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    // Cercles concentriques de portée
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.28)';
    ctx.lineWidth = 1;
    [0.33, 0.66, 1.0].forEach(r => {
      ctx.beginPath();
      ctx.arc(cx, cy, radius * r, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Réticule en croix
    ctx.beginPath();
    ctx.moveTo(cx, cy - radius);
    ctx.lineTo(cx, cy + radius);
    ctx.moveTo(cx - radius, cy);
    ctx.lineTo(cx + radius, cy);
    ctx.stroke();

    // Repères cardinaux N, E, S, O
    ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('N', cx, cy - radius + 10);
    ctx.fillText('S', cx, cy + radius - 4);
    ctx.fillText('E', cx + radius - 8, cy + 3);
    ctx.fillText('O', cx - radius + 8, cy + 3);

    // Faisceau de balayage sonar rotatif
    const sweepAngle = (Date.now() * 0.0035) % (Math.PI * 2);
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    grad.addColorStop(0, 'rgba(6, 182, 212, 0.45)');
    grad.addColorStop(1, 'rgba(6, 182, 212, 0.0)');

    ctx.save();
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, sweepAngle, sweepAngle + 0.55);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Écho propre du ROV au centre (flèche de cap)
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fill();

    const maxRadarRange = this.sonarRange || 120;

    // 1. Échos des Titans Super-Prédateurs
    if (window.aquarium && window.aquarium.superPredatorList) {
      for (const titan of window.aquarium.superPredatorList) {
        if (!titan || !titan.active) continue;
        const tHead = titan.getHeadPosition ? titan.getHeadPosition() : titan.position;
        const dx = tHead.x - this.position.x;
        const dz = tHead.z - this.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < maxRadarRange) {
          const angle = Math.atan2(dz, dx) - this.yaw;
          const rDist = (dist / maxRadarRange) * radius;
          const px = cx + Math.cos(angle) * rDist;
          const py = cy + Math.sin(angle) * rDist;

          // Écho titan pulsant rouge/violet
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(px, py, 4.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#fca5a5';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(px, py, 6.5, 0, Math.PI * 2);
          ctx.stroke();

          // Étiquette Titan
          ctx.fillStyle = '#fca5a5';
          ctx.font = 'bold 8px monospace';
          ctx.fillText(titan.key ? titan.key.substring(0, 3).toUpperCase() : 'TIT', px + 7, py + 3);
        }
      }
    }

    // 2. Échos des poissons boids à proximité
    if (window.aquarium && window.aquarium.boids) {
      for (const b of window.aquarium.boids) {
        if (b.isDead) continue;
        const dx = b.position.x - this.position.x;
        const dz = b.position.z - this.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < maxRadarRange) {
          const angle = Math.atan2(dz, dx) - this.yaw;
          const rDist = (dist / maxRadarRange) * radius;
          const px = cx + Math.cos(angle) * rDist;
          const py = cy + Math.sin(angle) * rDist;

          ctx.fillStyle = b.isPredator ? '#f43f5e' : (b.isDiseased ? '#84cc16' : '#38bdf8');
          ctx.beginPath();
          ctx.arc(px, py, b.isPredator ? 2.5 : 1.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // 3. Échos de la nourriture / appâts
    if (window.aquarium && window.aquarium.foods) {
      ctx.fillStyle = '#f59e0b';
      for (const f of window.aquarium.foods) {
        if (!f.active) continue;
        const dx = f.position.x - this.position.x;
        const dz = f.position.z - this.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < maxRadarRange) {
          const angle = Math.atan2(dz, dx) - this.yaw;
          const rDist = (dist / maxRadarRange) * radius;
          const px = cx + Math.cos(angle) * rDist;
          const py = cy + Math.sin(angle) * rDist;
          ctx.fillRect(px - 1, py - 1, 2, 2);
        }
      }
    }
  }

  updateHUDControls() {
    const camLabel = document.getElementById('rov-view-btn-label');
    if (camLabel) {
      camLabel.textContent = this.cameraView === 'firstPerson' ? "Vue Cockpit (1P)" : "Vue Poursuite (3P)";
    }
    const autoBtn = document.getElementById('rov-autopilot-btn');
    if (autoBtn) {
      autoBtn.classList.toggle('active', this.controlMode === 'auto');
    }
    const pilotBtn = document.getElementById('btn-sub-pilot-mode');
    if (pilotBtn) {
      const modeLabels = { manual: "Manuel [WASD]", auto: "Auto", escort: "Escorte" };
      pilotBtn.querySelector('span').textContent = modeLabels[this.controlMode] || "Auto";
    }
  }
}

// --- GESTIONNAIRE PRINCIPAL D'AQUARIUM ---
class AquariumApp {
  constructor() {
    this.boids = [];
    this.foods = [];
    this.eggs = [];
    this.ripples = [];
    this.rocks = [];
    this.plants = [];
    this.corals = [];
    this.currentBiome = 'tropical';
    this.inspectedBoid = null;
    this.followCamera = false;
    this.isRovView = false;

    this.initThree();
    this.initEcosystem();
    this.bindUI();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initThree() {
    this.canvas = document.getElementById('simulation-canvas');
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x030a16);
    this.scene.fog = new THREE.FogExp2(0x041122, 0.0018);

    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
    this.camera.position.set(0, 135, 470);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxDistance = 850;
    this.controls.minDistance = 60;
    this.controls.target.set(0, TANK.height / 2, 0);

    // 1. Éclairage cinématique d'aquascaping de compétition & Cycle Circadien
    // Ambiance sous-marine douce cyan/bleu profond
    this.ambientLight = new THREE.AmbientLight(0x0c2744, 1.2);
    this.scene.add(this.ambientLight);

    // Rampe LED supérieure chaude (Lumière solaire zénithale horticole)
    this.sunLight = new THREE.DirectionalLight(0xfff7ed, 1.6);
    this.sunLight.position.set(40, 380, 60);
    this.scene.add(this.sunLight);

    // Lumière actinique cyan/marine (provoque l'iridescence des écailles)
    this.actinicLight = new THREE.DirectionalLight(0x38bdf8, 1.3);
    this.actinicLight.position.set(-80, 320, -50);
    this.scene.add(this.actinicLight);

    // Rim-light arrière pour détacher les silhouettes
    this.rimLight = new THREE.DirectionalLight(0x7dd3fc, 0.9);
    this.rimLight.position.set(0, -60, -220);
    this.scene.add(this.rimLight);

    // Lueur tamisée du fond
    this.bottomGlow = new THREE.PointLight(0x0284c7, 0.9, 450);
    this.bottomGlow.position.set(0, 20, 0);
    this.scene.add(this.bottomGlow);

    // Lumière lunaire nocturne (douce, bleutée / argentée)
    this.moonLight = new THREE.DirectionalLight(0x60a5fa, 0.0);
    this.moonLight.position.set(-60, 360, 40);
    this.scene.add(this.moonLight);

    // 2. Cuve en verre d'aquarium extra-clair (Optiwhite rimless tank)
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xbae6fd,
      transmission: 0.94,
      transparent: true,
      opacity: 0.25,
      roughness: 0.05,
      metalness: 0.1,
      clearcoat: 1.0,
      ior: 1.5,
      side: THREE.BackSide
    });
    const tankGeom = new THREE.BoxGeometry(TANK.width, TANK.height, TANK.depth);
    const glassTank = new THREE.Mesh(tankGeom, glassMat);
    glassTank.position.y = TANK.height / 2;
    this.scene.add(glassTank);

    // Bords et joints d'angle subtils
    const edges = new THREE.EdgesGeometry(tankGeom);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.35 });
    const wireframe = new THREE.LineSegments(edges, lineMat);
    wireframe.position.y = TANK.height / 2;
    this.scene.add(wireframe);

    // 3. Fond de substrat sableux naturel avec caustiques
    const sandTexture = (window.AquaGraphics && window.AquaGraphics.getSandTexture)
      ? window.AquaGraphics.getSandTexture()
      : null;

    const causticsTexture = (window.AquaGraphics && window.AquaGraphics.causticsTexture)
      ? window.AquaGraphics.causticsTexture
      : null;

    const sandGeom = new THREE.PlaneGeometry(TANK.width + 10, TANK.depth + 10, 32, 32);
    sandGeom.rotateX(-Math.PI / 2);
    // Légère ondulation des crêtes de sable
    const sandPos = sandGeom.attributes.position.array;
    for (let i = 0; i < sandPos.length; i += 3) {
      sandPos[i + 1] = Math.sin(sandPos[i] * 0.04) * 2.5 + Math.cos(sandPos[i + 2] * 0.04) * 2.0;
    }
    sandGeom.computeVertexNormals();

    const sandMat = new THREE.MeshStandardMaterial({
      map: sandTexture,
      emissiveMap: causticsTexture,
      emissive: new THREE.Color(0x38bdf8),
      emissiveIntensity: 0.38,
      color: 0x93c5fd,
      roughness: 0.82,
      metalness: 0.05
    });
    this.sandMesh = new THREE.Mesh(sandGeom, sandMat);
    this.sandMesh.position.y = 0;
    this.scene.add(this.sandMesh);

    // 4. Surface de l'eau supérieure animée vue d'en dessous
    if (window.WaterCeiling) {
      this.waterCeiling = new window.WaterCeiling(this.scene, TANK);
    }

    // 5. Faisceaux lumineux volumétriques (God Rays)
    if (window.UnderwaterGodRays) {
      this.godRays = new window.UnderwaterGodRays(this.scene, TANK);
    }

    // 6. Diffuseur de micro-bulles d'air (Air Stone Bubbler)
    if (window.BubbleColumn) {
      this.bubbleColumn = new window.BubbleColumn(this.scene, TANK);
    }

    // 7. Plancton & neige marine flottante avec étincelles
    const particleGeom = new THREE.BufferGeometry();
    const count = 480;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * (TANK.width - 20);
      positions[i + 1] = Math.random() * (TANK.height - 20) + 10;
      positions[i + 2] = (Math.random() - 0.5) * (TANK.depth - 20);
    }
    particleGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x7dd3fc,
      size: 2.8,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending
    });
    this.plankton = new THREE.Points(particleGeom, particleMat);
    this.scene.add(this.plankton);

    // Les 3 Super-Prédateurs Titans + Léviathan Originel
    this.megalodon = new MegalodonSuperPredator(this.scene);
    this.mosasaur = new MosasaurSuperPredator(this.scene);
    this.kraken = new KrakenSuperPredator(this.scene);
    this.ropefish = new SuperPredator(this.scene); // Léviathan des Abysses original

    this.superPredators = {
      megalodon: this.megalodon,
      mosasaur: this.mosasaur,
      kraken: this.kraken,
      leviathan: this.ropefish
    };
    this.superPredatorList = [this.megalodon, this.mosasaur, this.kraken, this.ropefish];
    this.followedTitan = null;

    this.submarine = new SubmarineROV(this.scene);

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      if (this.submarine && this.submarine.camera) {
        this.submarine.camera.aspect = window.innerWidth / window.innerHeight;
        this.submarine.camera.updateProjectionMatrix();
      }
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Raycaster pour interaction clic poisson / nourriture
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.canvas.addEventListener('click', (e) => this.onCanvasClick(e));
    this.canvas.addEventListener('dblclick', (e) => this.onCanvasDblClick(e));
  }

  initEcosystem() {
    this.buildDecor();
    this.spawnAllBoids();
  }

  buildDecor() {
    const biomeKey = SIM_SETTINGS.env.biome || 'tropical';
    const biome = BIOMES[biomeKey] || BIOMES.tropical;

    // Nettoyer rochers, plantes & coraux
    this.rocks.forEach(r => this.scene.remove(r));
    this.plants.forEach(p => this.scene.remove(p));
    if (this.corals && this.corals.length > 0) {
      this.corals.forEach(c => {
        if (c.mesh && c.mesh.parent) c.mesh.parent.remove(c.mesh);
      });
    }
    this.rocks = [];
    this.plants = [];
    this.corals = [];

    // 1. Rochers géologiques "Dragon Stones" sculptés adaptés au biome
    const rockTexture = (window.AquaGraphics && window.AquaGraphics.getRockTexture)
      ? window.AquaGraphics.getRockTexture()
      : null;

    const causticsTexture = (window.AquaGraphics && window.AquaGraphics.causticsTexture)
      ? window.AquaGraphics.causticsTexture
      : null;

    const rockMat = new THREE.MeshStandardMaterial({
      map: rockTexture,
      emissiveMap: causticsTexture,
      emissive: new THREE.Color(0x38bdf8),
      emissiveIntensity: 0.22,
      color: biome.rockColor,
      roughness: 0.78,
      metalness: 0.12
    });

    for (let i = 0; i < SIM_SETTINGS.env.rockCount; i++) {
      const radius = 14 + Math.random() * 26;
      // Géométrie sculptée avec facettes et déformation géologique
      const geom = new THREE.DodecahedronGeometry(radius, 1);
      const pos = geom.attributes.position.array;
      for (let k = 0; k < pos.length; k += 3) {
        const noise = 1 + (Math.sin(pos[k] * 0.2) + Math.cos(pos[k + 1] * 0.2)) * 0.18;
        pos[k] *= noise;
        pos[k + 1] *= noise * 1.15; // Éléments rocheux plus élancés
        pos[k + 2] *= noise;
      }
      geom.computeVertexNormals();

      const rock = new THREE.Mesh(geom, rockMat);
      rock.position.set(
        (Math.random() - 0.5) * (TANK.width - 60),
        radius * 0.55,
        (Math.random() - 0.5) * (TANK.depth - 60)
      );
      rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      this.scene.add(rock);
      this.rocks.push(rock);
    }

    // 2. Plantes aquatiques réalistes (Bouquets de Vallisneria ondulante)
    const plantColor = biomeKey === 'amazon' ? 0x22c55e : (biomeKey === 'volcanic' ? 0xd97706 : (biomeKey === 'abyssal' ? 0x06b6d4 : 0x10b981));
    const plantMat = new THREE.MeshStandardMaterial({
      color: plantColor,
      emissive: biomeKey === 'abyssal' ? 0x06b6d4 : 0x064e3b,
      emissiveIntensity: biomeKey === 'abyssal' ? 0.35 : 0.2,
      roughness: 0.35,
      metalness: 0.1,
      side: THREE.DoubleSide
    });

    for (let i = 0; i < SIM_SETTINGS.env.plantCount; i++) {
      const plantGroup = new THREE.Group();
      const plantX = (Math.random() - 0.5) * (TANK.width - 40);
      const plantZ = (Math.random() - 0.5) * (TANK.depth - 40);
      plantGroup.position.set(plantX, 0, plantZ);

      // Bouquet de 3 à 5 rubans foliaires
      const leafCount = 3 + Math.floor(Math.random() * 3);
      for (let j = 0; j < leafCount; j++) {
        const leafH = 45 + Math.random() * 85;
        const leafW = 2.4 + Math.random() * 1.8;
        const leafGeom = new THREE.PlaneGeometry(leafW, leafH, 3, 10);
        leafGeom.translate(0, leafH / 2, 0);

        // Courbure naturelle arquée
        const lpos = leafGeom.attributes.position.array;
        for (let k = 0; k < lpos.length; k += 3) {
          const ratio = lpos[k + 1] / leafH;
          lpos[k + 2] += Math.pow(ratio, 2) * 12;
        }
        leafGeom.computeVertexNormals();

        const leaf = new THREE.Mesh(leafGeom, plantMat);
        leaf.rotation.y = (j / leafCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
        leaf.userData.originalRotZ = (Math.random() - 0.5) * 0.25;
        leaf.rotation.z = leaf.userData.originalRotZ;
        leaf.userData.seed = Math.random() * 10;
        plantGroup.add(leaf);
      }

      this.scene.add(plantGroup);
      this.plants.push(plantGroup);
    }

    // 3. Génération procédurale du récif corallien dynamique
    this.buildCoralReef();
  }

  // --- GÉNÉRATION PROCÉDURALE DU RÉCIF CORALLIEN DYNAMIQUE ---
  buildCoralReef() {
    if (this.corals && this.corals.length > 0) {
      for (const c of this.corals) {
        if (c.mesh && c.mesh.parent) {
          c.mesh.parent.remove(c.mesh);
        }
      }
    }
    this.corals = [];

    const biomeKey = SIM_SETTINGS.env.biome || 'tropical';
    const biome = BIOMES[biomeKey] || BIOMES.tropical;
    const coralCount = SIM_SETTINGS.env.coralCount || 26;
    const colors = biome.coralColors;

    const generatorTypes = ['staghorn', 'plate', 'brain', 'fan', 'anemone', 'sponge'];

    // 5 Foyers / Atolls de massifs coralliens naturels au sol
    const reefCenters = [
      new THREE.Vector3(-TANK.width * 0.26, 0, -TANK.depth * 0.16),
      new THREE.Vector3(TANK.width * 0.28, 0, -TANK.depth * 0.14),
      new THREE.Vector3(-TANK.width * 0.12, 0, TANK.depth * 0.20),
      new THREE.Vector3(TANK.width * 0.14, 0, TANK.depth * 0.22),
      new THREE.Vector3(0, 0, -TANK.depth * 0.28)
    ];

    for (let i = 0; i < coralCount; i++) {
      const type = generatorTypes[i % generatorTypes.length];
      const color = colors[i % colors.length];
      const scale = 0.8 + Math.random() * 0.65;
      const seed = i * 19.7 + Math.random() * 100;

      let coralMesh = null;
      let radius = 16 * scale;

      if (type === 'staghorn') {
        coralMesh = CoralReef.createStaghorn(color, scale, seed);
        radius = 18 * scale;
      } else if (type === 'plate') {
        coralMesh = CoralReef.createPlate(color, scale, seed);
        radius = 20 * scale;
      } else if (type === 'brain') {
        coralMesh = CoralReef.createBrain(color, scale, seed);
        radius = 15 * scale;
      } else if (type === 'fan') {
        coralMesh = CoralReef.createSeaFan(color, scale, seed);
        radius = 16 * scale;
      } else if (type === 'anemone') {
        coralMesh = CoralReef.createAnemone(color, scale, seed);
        radius = 14 * scale;
      } else if (type === 'sponge') {
        coralMesh = CoralReef.createPillarSponge(color, scale, seed);
        radius = 14 * scale;
      }

      if (!coralMesh) continue;

      // Distribution en grappes réalistes
      const center = reefCenters[i % reefCenters.length];
      const spreadX = (Math.random() - 0.5) * (TANK.width * 0.24);
      const spreadZ = (Math.random() - 0.5) * (TANK.depth * 0.22);

      const posX = THREE.MathUtils.clamp(center.x + spreadX, -TANK.width * 0.44, TANK.width * 0.44);
      const posZ = THREE.MathUtils.clamp(center.z + spreadZ, -TANK.depth * 0.42, TANK.depth * 0.42);

      coralMesh.position.set(posX, 0, posZ);
      coralMesh.rotation.y = Math.random() * Math.PI * 2;

      this.scene.add(coralMesh);

      this.corals.push({
        mesh: coralMesh,
        position: coralMesh.position.clone(),
        type: type,
        radius: radius,
        color: color,
        scale: scale,
        seed: seed,
        dynamicSway: coralMesh.userData.dynamicSway || false,
        swayTarget: coralMesh.userData.swayTarget,
        tentacles: coralMesh.userData.tentacles
      });
    }
  }

  setBiome(biomeKey) {
    if (!BIOMES[biomeKey]) return;
    SIM_SETTINGS.env.biome = biomeKey;
    this.currentBiome = biomeKey;
    const biome = BIOMES[biomeKey];

    // Mise à jour de l'UI des boutons du panneau
    document.querySelectorAll('.biome-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.biome === biomeKey);
    });

    // Mise à jour du widget de biome dans le HUD supérieur
    const hudBiomeName = document.getElementById('hud-biome-name');
    const hudBiomeIcon = document.getElementById('hud-biome-icon');
    const hudBiomeWidget = document.getElementById('hud-biome-widget');
    if (hudBiomeName) {
      const shortNames = {
        tropical: 'Tropical',
        amazon: 'Amazone',
        abyssal: 'Abyssal',
        volcanic: 'Volcanique'
      };
      hudBiomeName.textContent = shortNames[biomeKey] || biome.name;
    }
    if (hudBiomeIcon) {
      const icons = {
        tropical: 'fa-sun',
        amazon: 'fa-leaf',
        abyssal: 'fa-gem',
        volcanic: 'fa-fire-flame-curved'
      };
      hudBiomeIcon.className = `fa-solid ${icons[biomeKey] || 'fa-shapes'}`;
      hudBiomeIcon.style.color = biome.badgeColor;
    }
    if (hudBiomeWidget) {
      hudBiomeWidget.style.borderColor = `${biome.badgeColor}55`;
    }

    // Teinte du sable
    if (this.sandMesh && this.sandMesh.material) {
      this.sandMesh.material.color.setHex(biome.sandColor);
    }

    // Régénérer les coraux et les rochers avec la nouvelle palette
    this.buildDecor();

    const toastMap = {
      tropical: "Biome activé : Récif Corallien Tropical (Grande Barrière).",
      amazon: "Biome activé : Forêt Fluviale & Lagune Immergée.",
      abyssal: "Biome activé : Fosse Abyssale & Bioluminescence.",
      volcanic: "Biome activé : Atoll Volcanique & Coraux de Feu."
    };
    showToast(toastMap[biomeKey] || `Biome [${biome.name}] activé.`, '🪸');
  }

  spawnAllBoids() {
    this.boids.forEach(b => { if (b.mesh.parent) b.mesh.parent.remove(b.mesh); });
    this.boids = [];

    for (const [key, conf] of Object.entries(SPECIES_CONFIG)) {
      for (let i = 0; i < conf.count; i++) {
        const b = new Boid(key, false, 0);
        this.scene.add(b.mesh);
        this.boids.push(b);
      }
    }
    this.updateStatsUI();
  }

  spawnFood(count = 25) {
    audio.playBubble();
    for (let i = 0; i < count; i++) {
      const pos = new THREE.Vector3(
        (Math.random() - 0.5) * (TANK.width - 40),
        TANK.height - 5,
        (Math.random() - 0.5) * (TANK.depth - 40)
      );
      const geom = new THREE.SphereGeometry(1.5, 6, 6);
      const mat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.copy(pos);
      this.scene.add(mesh);
      this.foods.push({
        position: pos,
        mesh: mesh,
        vy: -0.25 - Math.random() * 0.2,
        isEaten: false
      });
    }
    showToast(I18N[currentLang].feed_notif, '🍪');
  }

  spawnEgg(speciesKey, position, generation) {
    const geom = new THREE.SphereGeometry(2.2, 8, 8);
    const conf = SPECIES_CONFIG[speciesKey];
    const mat = new THREE.MeshStandardMaterial({
      color: conf.color,
      emissive: conf.color,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.85
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.copy(position);
    this.scene.add(mesh);

    this.eggs.push({
      species: speciesKey,
      generation: generation,
      mesh: mesh,
      position: position,
      age: 0,
      hatchAge: 450 + Math.random() * 200
    });
  }

  tapGlass() {
    audio.playTap();
    const ripple = {
      position: new THREE.Vector3(0, TANK.height / 2, TANK.depth / 2 - 10),
      radius: 0,
      maxRadius: 280
    };
    this.ripples.push(ripple);
    showToast(I18N[currentLang].glass_tap, '💥');
  }

  onCanvasClick(e) {
    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.isRovView ? this.submarine.camera : this.camera);

    const meshes = this.boids.map(b => b.mesh);
    const intersects = this.raycaster.intersectObjects(meshes, true);
    if (intersects.length > 0) {
      let top = intersects[0].object;
      while (top.parent && !top.userData.boid) {
        top = top.parent;
      }
      if (top.userData.boid) {
        this.selectFish(top.userData.boid);
      }
    }
  }

  onCanvasDblClick(e) {
    this.spawnFood(15);
  }

  selectFish(boid) {
    this.inspectedBoid = boid;
    const inspector = document.getElementById('fish-inspector');
    if (!inspector) return;
    inspector.style.display = 'block';

    document.getElementById('inspector-species').textContent = boid.config.name;
    document.getElementById('inspector-dot').style.backgroundColor = '#' + boid.config.color.toString(16).padStart(6, '0');
    document.getElementById('inspector-dot').style.color = '#' + boid.config.color.toString(16).padStart(6, '0');
  }

  toggleSuperPredator(key) {
    const sp = this.superPredators[key];
    if (!sp) return;
    if (sp.active) {
      sp.remove();
    } else {
      sp.spawn();
    }
    this.updateSuperPredatorsUI();
  }

  spawnAllTitans() {
    this.megalodon.spawn();
    this.mosasaur.spawn();
    this.kraken.spawn();
    this.updateSuperPredatorsUI();
    showToast(I18N[currentLang].unleash_all, '⚡');
  }

  removeAllTitans() {
    this.megalodon.remove();
    this.mosasaur.remove();
    this.kraken.remove();
    if (this.ropefish && this.ropefish.active) this.ropefish.remove();
    if (this.followedTitan) this.followedTitan = null;
    this.updateSuperPredatorsUI();
    showToast(I18N[currentLang].recall_all, '🌊');
  }

  followTitan(key) {
    const sp = this.superPredators[key];
    if (!sp || !sp.active) {
      this.followedTitan = null;
      this.updateSuperPredatorsUI();
      return;
    }
    this.followedTitan = (this.followedTitan === sp) ? null : sp;
    this.updateSuperPredatorsUI();
    if (this.followedTitan) {
      showToast(`Caméra verrouillée sur : ${sp.name}`, sp.icon);
    }
  }

  getActiveSuperPredators() {
    return this.superPredatorList.filter(sp => sp && sp.active);
  }

  updateSuperPredatorsUI() {
    const activeTitans = this.getActiveSuperPredators();
    const activeCount = activeTitans.length;

    const titanBtn = document.getElementById('ropefish-btn');
    const titanLabel = document.getElementById('ropefish-label');
    const titanBadge = document.getElementById('superpredator-count-badge');
    if (titanBtn) {
      titanBtn.classList.toggle('active', activeCount > 0);
    }
    if (titanLabel) {
      if (activeCount === 0) titanLabel.textContent = "Super-Prédateurs";
      else if (activeCount === 1) titanLabel.textContent = activeTitans[0].name.split(' ')[0];
      else titanLabel.textContent = `${activeCount} Titans`;
    }
    if (titanBadge) {
      titanBadge.textContent = `${activeCount}/3`;
      titanBadge.style.display = activeCount > 0 ? 'inline-block' : 'none';
    }

    ['megalodon', 'mosasaur', 'kraken'].forEach(key => {
      const sp = this.superPredators[key];
      if (!sp) return;
      const toggleBtn = document.getElementById(`btn-toggle-${key}`);
      const statusBadge = document.getElementById(`status-badge-${key}`);
      const killBadge = document.getElementById(`kills-${key}`);
      const followBtn = document.getElementById(`follow-${key}-btn`);

      if (toggleBtn) {
        toggleBtn.classList.toggle('active', sp.active);
        toggleBtn.textContent = sp.active ? 'Retirer' : 'Déchaîner';
        toggleBtn.style.background = sp.active ? 'rgba(239, 68, 68, 0.35)' : 'rgba(14, 165, 233, 0.2)';
      }
      if (statusBadge) {
        const stateLabels = {
          PATROL: 'Patrouille',
          LOCK: 'Verrouillage',
          CHARGE: 'Charge Éclair ⚡',
          STRIKE: 'Attaque Fulgurante 💥',
          AMBUSH: 'Embuscade Surgissante ⚠️',
          DRIFT: 'Dérive Abyssale',
          STALK: 'Traque Silencieuse',
          TENTACLE_STRIKE: 'Projection Tentaculaire 🦑',
          FEED: 'Festin 🩸'
        };
        statusBadge.textContent = sp.active ? (stateLabels[sp.state] || sp.state) : 'En sommeil';
        statusBadge.style.color = sp.active ? '#f43f5e' : '#64748b';
      }
      if (killBadge) {
        killBadge.textContent = `${sp.kills} proie${sp.kills > 1 ? 's' : ''}`;
      }
      if (followBtn) {
        const isFollowing = this.followedTitan === sp;
        followBtn.classList.toggle('active', isFollowing);
        followBtn.style.color = isFollowing ? '#38bdf8' : '#94a3b8';
      }
    });
  }

  updateStatsUI() {
    let prey = 0;
    let pred = 0;
    for (const b of this.boids) {
      if (b.isDead) continue;
      if (b.isPredator) pred++;
      else prey++;
    }
    STATS.preyCount = prey;
    STATS.predatorCount = pred;

    const elPrey = document.getElementById('stat-prey');
    const elPred = document.getElementById('stat-predators');
    const elBirths = document.getElementById('stat-births');
    const elRatio = document.getElementById('stat-ratio');
    if (elPrey) elPrey.textContent = prey;
    if (elPred) elPred.textContent = pred;
    if (elBirths) elBirths.textContent = STATS.births;
    if (elRatio) elRatio.textContent = pred > 0 ? (prey / pred).toFixed(1) : '∞';

    this.updateSuperPredatorsUI();

    // Dispatch telemetry event for Recharts Data Visualization Dashboard
    const now = Date.now();
    if (!this.lastTelemetryTime || now - this.lastTelemetryTime >= 1000) {
      this.lastTelemetryTime = now;
      const activeTitans = this.getActiveSuperPredators();
      window.dispatchEvent(new CustomEvent('aqualab:telemetry', {
        detail: {
          prey: prey,
          predators: pred,
          births: STATS.births,
          deaths: STATS.deaths,
          preyEaten: STATS.preyEaten,
          superPredator: activeTitans.length > 0,
          activeSuperPredatorsCount: activeTitans.length
        }
      }));
    }

    // Détection d'épidémie si surpopulation
    if (this.boids.length > SIM_SETTINGS.maxPopulationCapacity && Math.random() < 0.05) {
      const healthy = this.boids.filter(b => !b.isDiseased && !b.isDead);
      if (healthy.length > 0) {
        healthy[Math.floor(Math.random() * healthy.length)].isDiseased = true;
        showToast(I18N[currentLang].disease_alert, '☣️');
      }
    }
  }

  // --- SYSTÈME DYNAMIQUE DE CYCLE JOUR / NUIT & ÉCLAIRAGE AMBIANT ---
  updateDayNight(delta) {
    if (!DAY_NIGHT_CYCLE.enabled) return;

    // Progression du temps en mode automatique
    if (DAY_NIGHT_CYCLE.mode === 'auto') {
      DAY_NIGHT_CYCLE.time = (DAY_NIGHT_CYCLE.time + delta * DAY_NIGHT_CYCLE.speed) % 24;
    }

    const time = DAY_NIGHT_CYCLE.time;
    let phase = 'day';
    let sunFactor = 1.0;
    let moonFactor = 0.0;
    let twilightFactor = 0.0;

    // 4 phases circadiennes principales :
    // 05h00 - 08h00 : Aube (Dawn)
    // 08h00 - 18h00 : Plein Jour (Day)
    // 18h00 - 21h30 : Crépuscule (Sunset)
    // 21h30 - 05h00 : Nuit noire / Clair de lune (Night)
    if (time >= 5.0 && time < 8.0) {
      phase = 'dawn';
      const t = (time - 5.0) / 3.0;
      sunFactor = THREE.MathUtils.smoothstep(t, 0.0, 1.0);
      moonFactor = 1.0 - sunFactor;
      twilightFactor = Math.sin(t * Math.PI);
    } else if (time >= 8.0 && time < 18.0) {
      phase = 'day';
      sunFactor = 1.0;
      moonFactor = 0.0;
      twilightFactor = 0.0;
    } else if (time >= 18.0 && time < 21.5) {
      phase = 'sunset';
      const t = (time - 18.0) / 3.5;
      sunFactor = 1.0 - THREE.MathUtils.smoothstep(t, 0.0, 1.0);
      moonFactor = 1.0 - sunFactor;
      twilightFactor = Math.sin(t * Math.PI);
    } else {
      phase = 'night';
      sunFactor = 0.0;
      moonFactor = 1.0;
      twilightFactor = 0.0;
    }

    // Détection du changement de phase pour notification immersive
    if (DAY_NIGHT_CYCLE.currentPhase !== phase) {
      DAY_NIGHT_CYCLE.currentPhase = phase;

      const phaseToasts = {
        dawn: { text: "L'aube se lève sur l'aquarium : les poissons s'éveillent doucement.", icon: "🌅" },
        day: { text: "Plein jour : activité maximale des bancs et photosynthèse.", icon: "☀️" },
        sunset: { text: "Le crépuscule descend : l'heure de chasse des prédateurs d'affût.", icon: "🌇" },
        night: { text: "La nuit tombe : sommeil réparateur des proies, veille des lanternes abyssales.", icon: "🌙" }
      };
      if (phaseToasts[phase]) {
        showToast(phaseToasts[phase].text, phaseToasts[phase].icon);
      }
    }

    DAY_NIGHT_CYCLE.sunFactor = sunFactor;

    // Biome courant pour teinter les lumières
    const biomeKey = SIM_SETTINGS.env.biome || 'tropical';
    const biome = BIOMES[biomeKey] || BIOMES.tropical;

    // --- MODULATION CINÉMATIQUE DES COULEURS ET DES SOURCES LUMINEUSES ---
    // 1. Teinte du fond d'eau (Scene Background) & Fog
    const dayBg = new THREE.Color(biome.waterColor);
    const nightBg = new THREE.Color(0x01050e);
    const dawnSunsetBg = phase === 'dawn' ? new THREE.Color(0x130b22) : new THREE.Color(0x1a091c);

    const targetBg = new THREE.Color();
    targetBg.lerpColors(nightBg, dayBg, sunFactor);
    if (twilightFactor > 0.01) {
      targetBg.lerp(dawnSunsetBg, twilightFactor * 0.7);
    }
    this.scene.background.lerp(targetBg, 0.06);

    const dayFog = new THREE.Color(biome.fogColor);
    const nightFog = new THREE.Color(0x010714);
    const dawnSunsetFog = phase === 'dawn' ? new THREE.Color(0x150d26) : new THREE.Color(0x1c0b1f);
    const targetFog = new THREE.Color();
    targetFog.lerpColors(nightFog, dayFog, sunFactor);
    if (twilightFactor > 0.01) {
      targetFog.lerp(dawnSunsetFog, twilightFactor * 0.7);
    }
    this.scene.fog.color.lerp(targetFog, 0.06);

    // 2. Lumière Ambiante
    const dayAmbient = new THREE.Color(biome.ambientLight);
    const nightAmbient = new THREE.Color(0x030d22);
    const twilightAmbient = phase === 'dawn' ? new THREE.Color(0x1a153a) : new THREE.Color(0x2d142c);
    const targetAmbient = new THREE.Color();
    targetAmbient.lerpColors(nightAmbient, dayAmbient, sunFactor);
    if (twilightFactor > 0.01) {
      targetAmbient.lerp(twilightAmbient, twilightFactor * 0.65);
    }
    if (this.ambientLight) {
      this.ambientLight.color.lerp(targetAmbient, 0.08);
      const targetAmbIntensity = 0.38 + 0.82 * sunFactor;
      this.ambientLight.intensity = THREE.MathUtils.lerp(this.ambientLight.intensity, targetAmbIntensity, 0.08);
    }

    // 3. Rampe Solaire Zénithale (Sun Light)
    if (this.sunLight) {
      const daySunCol = new THREE.Color(0xfff7ed);
      const dawnSunCol = new THREE.Color(0xfbbf24);
      const sunsetSunCol = new THREE.Color(0xf43f5e);
      let targetSunCol = daySunCol;
      if (phase === 'dawn') targetSunCol = dawnSunCol;
      else if (phase === 'sunset') targetSunCol = sunsetSunCol;

      this.sunLight.color.lerp(targetSunCol, 0.08);
      const targetSunIntensity = sunFactor * 1.65;
      this.sunLight.intensity = THREE.MathUtils.lerp(this.sunLight.intensity, targetSunIntensity, 0.08);

      const sunAngle = ((time - 6) / 12) * Math.PI;
      const sunX = Math.cos(sunAngle) * -120;
      const sunY = Math.max(80, Math.sin(sunAngle) * 380);
      this.sunLight.position.set(sunX, sunY, 60);
    }

    // 4. Lumière de Lune Nocturne (Moon Light)
    if (this.moonLight) {
      const targetMoonIntensity = moonFactor * 0.85;
      this.moonLight.intensity = THREE.MathUtils.lerp(this.moonLight.intensity, targetMoonIntensity, 0.08);
      this.moonLight.color.setHex(0x60a5fa);
    }

    // 5. Lumière Actinique
    if (this.actinicLight) {
      const targetActIntensity = 0.25 + 1.05 * sunFactor;
      this.actinicLight.intensity = THREE.MathUtils.lerp(this.actinicLight.intensity, targetActIntensity, 0.08);
    }

    // 6. Lueur du fond (Bottom Glow)
    if (this.bottomGlow) {
      const targetGlowIntensity = 0.22 + 0.68 * sunFactor;
      this.bottomGlow.intensity = THREE.MathUtils.lerp(this.bottomGlow.intensity, targetGlowIntensity, 0.08);
    }

    // 7. Caustiques et reflets sur le sable, les rochers et coraux
    if (this.sandMesh && this.sandMesh.material) {
      const targetCaustics = 0.06 + 0.34 * sunFactor;
      this.sandMesh.material.emissiveIntensity = THREE.MathUtils.lerp(this.sandMesh.material.emissiveIntensity, targetCaustics, 0.08);
    }
    if (this.rocks) {
      const targetRockCaustics = 0.04 + 0.22 * sunFactor;
      for (const rock of this.rocks) {
        if (rock.material) {
          rock.material.emissiveIntensity = targetRockCaustics;
        }
      }
    }

    // 8. Faisceaux de lumière sous-marine (God Rays)
    if (this.godRays && this.godRays.update) {
      this.godRays.update(delta, sunFactor);
    }

    // 9. Surface de l'eau (Water Ceiling)
    if (this.waterCeiling && this.waterCeiling.update) {
      this.waterCeiling.update(delta, sunFactor);
    }

    // --- MISE À JOUR DE L'INTERFACE UTILISATEUR DU CYCLE ---
    const hours = Math.floor(time);
    const minutes = Math.floor((time % 1) * 60);
    const timeFormatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    const clockEl = document.getElementById('daynight-clock');
    if (clockEl) clockEl.textContent = timeFormatted;

    const phaseEl = document.getElementById('daynight-phase');
    const iconEl = document.getElementById('daynight-icon');
    if (phaseEl && iconEl) {
      if (phase === 'dawn') {
        phaseEl.textContent = 'Aube';
        phaseEl.style.background = 'rgba(245, 158, 11, 0.25)';
        phaseEl.style.color = '#fbbf24';
        iconEl.className = 'fa-solid fa-mountain-sun';
        iconEl.style.color = '#fbbf24';
      } else if (phase === 'day') {
        phaseEl.textContent = 'Plein Jour';
        phaseEl.style.background = 'rgba(14, 165, 233, 0.25)';
        phaseEl.style.color = '#38bdf8';
        iconEl.className = 'fa-solid fa-sun';
        iconEl.style.color = '#38bdf8';
      } else if (phase === 'sunset') {
        phaseEl.textContent = 'Crépuscule';
        phaseEl.style.background = 'rgba(244, 63, 94, 0.25)';
        phaseEl.style.color = '#fb7185';
        iconEl.className = 'fa-solid fa-cloud-sun';
        iconEl.style.color = '#f43f5e';
      } else {
        phaseEl.textContent = 'Nuit';
        phaseEl.style.background = 'rgba(99, 102, 241, 0.25)';
        phaseEl.style.color = '#a5b4fc';
        iconEl.className = 'fa-solid fa-moon';
        iconEl.style.color = '#818cf8';
      }
    }

    const sliderTime = document.getElementById('slider-daynight-time');
    const valTime = document.getElementById('val-daynight-time');
    if (sliderTime && document.activeElement !== sliderTime) {
      sliderTime.value = time.toFixed(2);
    }
    if (valTime) valTime.textContent = timeFormatted;
  }

  setDayNightPhase(phase) {
    document.querySelectorAll('.daynight-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.phase === phase);
    });

    if (phase === 'auto') {
      DAY_NIGHT_CYCLE.mode = 'auto';
      showToast("Cycle circadien automatique réactivé.", '🔄');
    } else if (phase === 'day') {
      DAY_NIGHT_CYCLE.mode = 'manual';
      DAY_NIGHT_CYCLE.time = 12.0;
      showToast("Mode Plein Jour activé.", '☀️');
    } else if (phase === 'sunset') {
      DAY_NIGHT_CYCLE.mode = 'manual';
      DAY_NIGHT_CYCLE.time = 19.5;
      showToast("Mode Crépuscule activé.", '🌇');
    } else if (phase === 'night') {
      DAY_NIGHT_CYCLE.mode = 'manual';
      DAY_NIGHT_CYCLE.time = 23.5;
      showToast("Mode Nuit Noire activé (repos des poissons).", '🌙');
    } else if (phase === 'dawn') {
      DAY_NIGHT_CYCLE.mode = 'manual';
      DAY_NIGHT_CYCLE.time = 6.5;
      showToast("Mode Aube matinale activé.", '🌅');
    }
  }

  animate() {
    requestAnimationFrame(this.animate);
    const now = performance.now();
    if (!this.lastFrameTime) this.lastFrameTime = now;
    const rawDelta = (now - this.lastFrameTime) / 1000;
    this.lastFrameTime = now;
    const delta = THREE.MathUtils.clamp(rawDelta, 0.008, 0.035);

    // 0. Simulation dynamique du Cycle Jour / Nuit & Éclairage ambiant immersif
    this.updateDayNight(delta);

    // Mise à jour des poissons avec physique environnementale complète (rochers, herbiers, récifs coralliens)
    for (let i = this.boids.length - 1; i >= 0; i--) {
      const b = this.boids[i];
      if (b.isDead) {
        this.boids.splice(i, 1);
        continue;
      }
      b.update(delta, this.boids, this.foods, this.superPredatorList, this.ripples, this.rocks, this.plants, this.corals);
    }

    // Mise à jour de la nourriture
    for (let i = this.foods.length - 1; i >= 0; i--) {
      const f = this.foods[i];
      if (f.isEaten || f.position.y <= 2) {
        this.scene.remove(f.mesh);
        this.foods.splice(i, 1);
      } else {
        f.position.y += f.vy * delta * 60 * SIM_SETTINGS.speed;
        f.mesh.position.copy(f.position);
      }
    }

    // Mise à jour des œufs
    for (let i = this.eggs.length - 1; i >= 0; i--) {
      const egg = this.eggs[i];
      egg.age += delta * 60 * SIM_SETTINGS.speed;
      if (egg.position.y > 4) {
        egg.position.y -= 0.6;
        egg.mesh.position.y = egg.position.y;
      }
      if (egg.age >= egg.hatchAge) {
        // Éclosion !
        this.scene.remove(egg.mesh);
        this.eggs.splice(i, 1);
        const baby = new Boid(egg.species, true, egg.generation);
        baby.position.copy(egg.position);
        this.scene.add(baby.mesh);
        this.boids.push(baby);
        STATS.births++;
        audio.playChime();
        showToast(I18N[currentLang].birth_notif.replace('{species}', baby.config.name).replace('{gen}', baby.generation), '🐣');
      }
    }

    // Mise à jour des ondes de choc
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const rip = this.ripples[i];
      rip.radius += 8 * delta * 60;
      if (rip.radius > rip.maxRadius) {
        this.ripples.splice(i, 1);
      }
    }

    // 1. Mise à jour des caustiques, surface d'eau, rayons de lumière et bulles
    if (window.AquaGraphics && window.AquaGraphics.updateCaustics) {
      window.AquaGraphics.updateCaustics(delta);
    }
    if (this.waterCeiling) this.waterCeiling.update(delta, DAY_NIGHT_CYCLE.sunFactor);
    if (this.godRays) this.godRays.update(delta, DAY_NIGHT_CYCLE.sunFactor);
    if (this.bubbleColumn) this.bubbleColumn.update(delta);

    // 2. Dérive naturelle et scintillement de la neige marine / plancton
    if (this.plankton) {
      const pPositions = this.plankton.geometry.attributes.position.array;
      const timeSec = Date.now() * 0.001;
      for (let k = 0; k < pPositions.length; k += 3) {
        pPositions[k + 1] -= 0.15 * delta * 60;
        pPositions[k] += Math.sin(timeSec + k) * 0.08 * delta * 60;
        if (pPositions[k + 1] < 5) {
          pPositions[k + 1] = TANK.height - 10;
        }
      }
      this.plankton.geometry.attributes.position.needsUpdate = true;
    }

    // 3. Balancement gracieux des bouquets de plantes aquatiques
    const timePlant = Date.now() * 0.0022;
    for (const pGroup of this.plants) {
      if (pGroup.children && pGroup.children.length > 0) {
        for (const leaf of pGroup.children) {
          const seed = leaf.userData.seed || 0;
          leaf.rotation.z = (leaf.userData.originalRotZ || 0) + Math.sin(timePlant + pGroup.position.x * 0.05 + seed) * 0.14;
        }
      } else {
        pGroup.rotation.z = (pGroup.userData.originalRot || 0) + Math.sin(timePlant + pGroup.position.x * 0.05) * 0.1;
      }
    }

    // 4. Ondulation dynamique des gorgones et anémones du récif corallien
    if (this.corals && this.corals.length > 0) {
      const timeReef = Date.now() * 0.0024;
      const currentForce = (SIM_SETTINGS.env.currentSpeed || 0.2);

      for (const coral of this.corals) {
        if (!coral.dynamicSway) continue;

        // Gorgones / Éventails de mer
        if (coral.swayTarget) {
          coral.swayTarget.rotation.z = Math.sin(timeReef + coral.seed) * (0.05 + currentForce * 0.12);
        }

        // Anémones de mer / tentacules souples
        if (coral.tentacles && coral.tentacles.length > 0) {
          for (const tMesh of coral.tentacles) {
            const seed = tMesh.userData.seed || 0;
            const wave = Math.sin(timeReef * 1.5 + seed) * (0.18 + currentForce * 0.25);
            tMesh.rotation.z = (tMesh.userData.baseRotZ || 0) + wave;
            tMesh.rotation.x = (tMesh.userData.baseRotX || 0) + Math.cos(timeReef * 1.3 + seed) * 0.08;
          }
        }
      }

      // 4b. Pulsation bioluminescente féerique des coraux la nuit ou dans les biomes abyssaux / volcaniques
      const isNight = DAY_NIGHT_CYCLE.sunFactor < 0.35;
      const isAbyssal = this.currentBiome === 'abyssal';
      const isVolcanic = this.currentBiome === 'volcanic';
      if (isNight || isAbyssal || isVolcanic) {
        const glowPulse = 0.28 + Math.sin(timeReef * 1.8) * 0.14;
        for (const coral of this.corals) {
          if (coral.mesh) {
            coral.mesh.traverse(child => {
              if (child.isMesh && child.material && child.material.emissiveIntensity !== undefined) {
                child.material.emissiveIntensity = glowPulse;
              }
            });
          }
        }
      }
    }

    // Super-Prédateurs Titans & ROV
    for (let sIdx = 0; sIdx < this.superPredatorList.length; sIdx++) {
      const sp = this.superPredatorList[sIdx];
      if (sp && sp.active) {
        sp.update(delta, this.boids);
      }
    }
    this.submarine.update(delta, this.boids);

    // Suivi de caméra sur Titan ou sur poisson inspecté
    if (this.followedTitan && this.followedTitan.active) {
      this.controls.target.lerp(this.followedTitan.getHeadPosition(), 0.08);
    } else if (this.followCamera && this.inspectedBoid && !this.inspectedBoid.isDead) {
      this.controls.target.lerp(this.inspectedBoid.position, 0.08);
    }

    // Inspecteur live refresh
    if (this.inspectedBoid && !this.inspectedBoid.isDead) {
      document.getElementById('inspector-age').textContent = Math.round(this.inspectedBoid.age / 60) + 's';
      document.getElementById('inspector-energy').textContent = Math.round(this.inspectedBoid.energy) + '%';
      document.getElementById('inspector-gen').textContent = 'G' + this.inspectedBoid.generation;
      
      let statusText = 'Banc';
      let statusColor = '#38bdf8';
      if (this.inspectedBoid.isDiseased) {
        statusText = 'Infecté';
        statusColor = '#84cc16';
      } else if (this.inspectedBoid.isSleeping) {
        statusText = '💤 Sommeil (repos au fond)';
        statusColor = '#818cf8';
      } else if (this.inspectedBoid.wakeTimer > 0) {
        statusText = '⚡ Réveillé en sursaut !';
        statusColor = '#f43f5e';
      } else if (this.inspectedBoid.isPredator) {
        const isNight = DAY_NIGHT_CYCLE.sunFactor < 0.28;
        statusText = isNight ? '🌙 Chasse nocturne active' : 'Chasse';
        statusColor = '#fb7185';
      } else if (this.inspectedBoid.species === 'angler') {
        statusText = '🏮 Lanterne déployée';
        statusColor = '#38bdf8';
      } else if (this.inspectedBoid.isGliding) {
        statusText = 'Glisse hydrodynamique';
        statusColor = '#38bdf8';
      }
      const elStatus = document.getElementById('inspector-status');
      if (elStatus) {
        elStatus.textContent = statusText;
        elStatus.style.color = statusColor;
      }
    }

    this.updateStatsUI();

    const activeCam = this.isRovView ? this.submarine.getActiveCamera() : this.camera;
    if (!this.isRovView) this.controls.update();
    this.renderer.render(this.scene, activeCam);
  }

  bindUI() {
    // Menu latéral
    const sidebar = document.getElementById('controls-sidebar');
    document.getElementById('toggle-sidebar-btn').onclick = () => sidebar.classList.toggle('open');
    document.getElementById('close-sidebar-btn').onclick = () => sidebar.classList.remove('open');

    // Accordéons
    document.querySelectorAll('.accordion-header').forEach(header => {
      header.onclick = () => {
        const targetId = header.dataset.target;
        const body = document.getElementById(targetId);
        header.classList.toggle('active');
        body.classList.toggle('open');
      };
    });

    // Remplir la section Espèces
    const speciesContainer = document.getElementById('species-controls-container');
    if (speciesContainer) {
      speciesContainer.innerHTML = '';
      for (const [key, conf] of Object.entries(SPECIES_CONFIG)) {
        const hex = '#' + conf.color.toString(16).padStart(6, '0');
        const card = document.createElement('div');
        card.style.background = 'rgba(15, 23, 42, 0.4)';
        card.style.padding = '10px';
        card.style.borderRadius = '10px';
        card.style.marginBottom = '8px';
        card.style.borderLeft = `3px solid ${hex}`;
        card.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <strong style="font-size:12px; color:${hex};">${conf.name}</strong>
            <span id="badge-count-${key}" class="mono" style="font-size:11px; color:#94a3b8;">${conf.count} ex.</span>
          </div>
          <div style="display:flex; flex-direction:column; gap:6px;">
            <div>
              <div style="display:flex; justify-content:space-between; font-size:10px; color:#cbd5e1;">
                <span>Effectif initial</span>
                <span id="lbl-${key}-count" class="mono">${conf.count}</span>
              </div>
              <input type="range" class="species-slider" data-species="${key}" data-prop="count" min="0" max="80" step="1" value="${conf.count}" />
            </div>
            <div>
              <div style="display:flex; justify-content:space-between; font-size:10px; color:#cbd5e1;">
                <span>Vitesse de nage</span>
                <span id="lbl-${key}-speed" class="mono">${conf.maxSpeed}</span>
              </div>
              <input type="range" class="species-slider" data-species="${key}" data-prop="maxSpeed" min="0.5" max="3.0" step="0.1" value="${conf.maxSpeed}" />
            </div>
          </div>
        `;
        speciesContainer.appendChild(card);
      }

      document.querySelectorAll('.species-slider').forEach(sl => {
        sl.oninput = (e) => {
          const sp = e.target.dataset.species;
          const prop = e.target.dataset.prop;
          const val = parseFloat(e.target.value);
          SPECIES_CONFIG[sp][prop] = val;
          const label = document.getElementById(`lbl-${sp}-${prop}`);
          if (label) label.textContent = val;
          if (prop === 'count') {
            document.getElementById(`badge-count-${sp}`).textContent = val + ' ex.';
          }
        };
      });
    }

    // Sliders Flocking
    const sep = document.getElementById('slider-sep');
    const ali = document.getElementById('slider-ali');
    const coh = document.getElementById('slider-coh');
    sep.oninput = (e) => { SIM_SETTINGS.flocking.separation = parseFloat(e.target.value); document.getElementById('val-sep').textContent = e.target.value; };
    ali.oninput = (e) => { SIM_SETTINGS.flocking.alignment = parseFloat(e.target.value); document.getElementById('val-ali').textContent = e.target.value; };
    coh.oninput = (e) => { SIM_SETTINGS.flocking.cohesion = parseFloat(e.target.value); document.getElementById('val-coh').textContent = e.target.value; };

    // Sliders Environnement
    document.getElementById('slider-rocks').oninput = (e) => {
      SIM_SETTINGS.env.rockCount = parseInt(e.target.value);
      document.getElementById('val-rocks').textContent = e.target.value;
      this.buildDecor();
    };
    document.getElementById('slider-plants').oninput = (e) => {
      SIM_SETTINGS.env.plantCount = parseInt(e.target.value);
      document.getElementById('val-plants').textContent = e.target.value;
      this.buildDecor();
    };
    document.getElementById('slider-current').oninput = (e) => {
      SIM_SETTINGS.env.currentSpeed = parseFloat(e.target.value);
      document.getElementById('val-current').textContent = e.target.value;
    };

    // Contrôles du Cycle Jour / Nuit
    const dayNightWidget = document.getElementById('daynight-widget');
    if (dayNightWidget) {
      dayNightWidget.onclick = () => {
        if (DAY_NIGHT_CYCLE.mode === 'auto') {
          if (DAY_NIGHT_CYCLE.currentPhase === 'day') {
            this.setDayNightPhase('sunset');
          } else if (DAY_NIGHT_CYCLE.currentPhase === 'sunset') {
            this.setDayNightPhase('night');
          } else if (DAY_NIGHT_CYCLE.currentPhase === 'night') {
            this.setDayNightPhase('dawn');
          } else {
            this.setDayNightPhase('day');
          }
        } else {
          this.setDayNightPhase('auto');
        }
      };
    }

    document.querySelectorAll('.daynight-btn').forEach(btn => {
      btn.onclick = () => {
        this.setDayNightPhase(btn.dataset.phase);
      };
    });

    const sliderDayTime = document.getElementById('slider-daynight-time');
    if (sliderDayTime) {
      sliderDayTime.oninput = (e) => {
        DAY_NIGHT_CYCLE.time = parseFloat(e.target.value);
        DAY_NIGHT_CYCLE.mode = 'manual';
        document.querySelectorAll('.daynight-btn').forEach(b => b.classList.remove('active'));
      };
    }

    const sliderDaySpeed = document.getElementById('slider-daynight-speed');
    const valDaySpeed = document.getElementById('val-daynight-speed');
    if (sliderDaySpeed) {
      sliderDaySpeed.oninput = (e) => {
        const spd = parseFloat(e.target.value);
        DAY_NIGHT_CYCLE.speed = spd;
        if (valDaySpeed) {
          if (spd === 0) valDaySpeed.textContent = "Pause";
          else if (spd < 0.1) valDaySpeed.textContent = "Lente";
          else if (spd <= 0.25) valDaySpeed.textContent = "Normale";
          else valDaySpeed.textContent = "Accélérée";
        }
      };
    }

    // Contrôles des Biomes & Récifs Coralliens
    const hudBiomeWidget = document.getElementById('hud-biome-widget');
    if (hudBiomeWidget) {
      hudBiomeWidget.onclick = () => {
        const biomesList = ['tropical', 'amazon', 'abyssal', 'volcanic'];
        const currentIdx = biomesList.indexOf(this.currentBiome || 'tropical');
        const nextBiome = biomesList[(currentIdx + 1) % biomesList.length];
        this.setBiome(nextBiome);
      };
    }

    document.querySelectorAll('.biome-btn').forEach(btn => {
      btn.onclick = () => {
        this.setBiome(btn.dataset.biome);
      };
    });

    const sliderCoralDensity = document.getElementById('slider-coral-density');
    const valCoralDensity = document.getElementById('val-coral-density');
    if (sliderCoralDensity) {
      sliderCoralDensity.oninput = (e) => {
        const count = parseInt(e.target.value);
        SIM_SETTINGS.env.coralCount = count;
        if (valCoralDensity) valCoralDensity.textContent = count;
        this.buildCoralReef();
      };
    }

    const regenCoralsBtn = document.getElementById('regen-corals-btn');
    if (regenCoralsBtn) {
      regenCoralsBtn.onclick = () => {
        this.buildCoralReef();
        showToast("Récif corallien régénéré procéduralement !", '🪸');
      };
    }

    const bottomCoralBtn = document.getElementById('bottom-coral-btn');
    if (bottomCoralBtn) {
      bottomCoralBtn.onclick = () => {
        this.buildCoralReef();
        showToast("Récif corallien régénéré !", '🪸');
      };
    }

    // Boutons d'action
    document.getElementById('feed-action-btn').onclick = () => this.spawnFood(20);
    document.getElementById('tap-glass-btn').onclick = () => this.tapGlass();

    const toggleChartBtn = document.getElementById('toggle-chart-btn');
    if (toggleChartBtn) {
      toggleChartBtn.onclick = () => {
        window.dispatchEvent(new CustomEvent('aqualab:toggle-chart'));
      };
    }
    const bottomChartBtn = document.getElementById('bottom-chart-btn');
    if (bottomChartBtn) {
      bottomChartBtn.onclick = () => {
        window.dispatchEvent(new CustomEvent('aqualab:toggle-chart'));
      };
    }

    const ropeBtn = document.getElementById('ropefish-btn');
    if (ropeBtn) {
      ropeBtn.onclick = () => {
        const activeTitans = this.getActiveSuperPredators();
        if (activeTitans.length > 0) {
          this.removeAllTitans();
        } else {
          this.spawnAllTitans();
        }
      };
    }

    // Boutons d'actions globales des Titans
    const btnSpawnAllTitans = document.getElementById('btn-spawn-all-titans');
    if (btnSpawnAllTitans) {
      btnSpawnAllTitans.onclick = () => this.spawnAllTitans();
    }
    const btnRecallAllTitans = document.getElementById('btn-recall-all-titans');
    if (btnRecallAllTitans) {
      btnRecallAllTitans.onclick = () => this.removeAllTitans();
    }

    // Boutons individuels de chaque Super-Prédateur
    ['megalodon', 'mosasaur', 'kraken'].forEach(key => {
      const toggleBtn = document.getElementById(`btn-toggle-${key}`);
      if (toggleBtn) {
        toggleBtn.onclick = () => this.toggleSuperPredator(key);
      }
      const followBtn = document.getElementById(`follow-${key}-btn`);
      if (followBtn) {
        followBtn.onclick = () => this.followTitan(key);
      }
    });

    // Mode Caméra ROV
    const camBtn = document.getElementById('camera-mode-btn');
    const cockpit = document.getElementById('cockpit-hud');
    camBtn.onclick = () => {
      this.isRovView = !this.isRovView;
      camBtn.classList.toggle('active', this.isRovView);
      cockpit.classList.toggle('active', this.isRovView);
      document.getElementById('cam-mode-label').textContent = this.isRovView ? "Vue Orbitale" : "Vue ROV";
      if (!this.isRovView) this.controls.enabled = true;
    };

    // Vitesses
    document.querySelectorAll('.speed-btn').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        SIM_SETTINGS.speed = parseFloat(btn.dataset.speed);
      };
    });

    // Préréglages
    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.onclick = () => {
        this.applyPreset(btn.dataset.preset);
      };
    });

    // Boutons Utilitaires
    document.getElementById('sound-btn').onclick = (e) => {
      audio.isMuted = !audio.isMuted;
      e.currentTarget.innerHTML = audio.isMuted ? '<i class="fa-solid fa-volume-xmark"></i>' : '<i class="fa-solid fa-volume-high"></i>';
    };

    const logDrawer = document.getElementById('event-log-drawer');
    document.getElementById('toggle-log-btn').onclick = () => logDrawer.classList.toggle('open');
    document.getElementById('close-log-btn').onclick = () => logDrawer.classList.remove('open');

    // Modal
    const modal = document.getElementById('welcome-modal');
    document.getElementById('help-btn').onclick = () => modal.classList.add('active');
    document.getElementById('modal-close-icon').onclick = () => modal.classList.remove('active');
    document.getElementById('modal-start-btn').onclick = () => {
      audio.init();
      modal.classList.remove('active');
      showToast("Simulation prête ! Double-cliquez pour nourrir.", '✨');
    };

    // Inspecteur
    document.getElementById('close-inspector-btn').onclick = () => {
      document.getElementById('fish-inspector').style.display = 'none';
      this.inspectedBoid = null;
      this.followCamera = false;
    };
    document.getElementById('follow-fish-btn').onclick = (e) => {
      this.followCamera = !this.followCamera;
      e.currentTarget.classList.toggle('active', this.followCamera);
    };

    // Langues
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentLang = btn.dataset.lang;
        showToast(I18N[currentLang].saved, '🌐');
      };
    });

    // Sauvegarde & Export JSON
    document.getElementById('save-local-btn').onclick = () => this.saveToLocal();
    document.getElementById('load-local-btn').onclick = () => this.loadFromLocal();
    document.getElementById('export-json-btn').onclick = () => this.exportJSON();
    document.getElementById('import-json-input').onchange = (e) => this.importJSON(e);
    document.getElementById('reset-sim-btn').onclick = () => {
      this.spawnAllBoids();
      showToast("Écosystème réinitialisé à l'état neuf.", '🔄');
    };
  }

  applyPreset(type) {
    if (type === 'balanced') {
      SPECIES_CONFIG.tetra.count = 45;
      SPECIES_CONFIG.barbus.count = 35;
      SPECIES_CONFIG.rasbora.count = 40;
      SPECIES_CONFIG.angel.count = 20;
      SPECIES_CONFIG.cichla.count = 4;
      SPECIES_CONFIG.mandarin.count = 14;
      SPECIES_CONFIG.angler.count = 3;
      SIM_SETTINGS.env.plantCount = 50;
      SIM_SETTINGS.env.coralCount = 26;
      this.setBiome('tropical');
      this.setDayNightPhase('auto');
    } else if (type === 'amazon') {
      SPECIES_CONFIG.tetra.count = 70;
      SPECIES_CONFIG.barbus.count = 50;
      SPECIES_CONFIG.rasbora.count = 60;
      SPECIES_CONFIG.angel.count = 30;
      SPECIES_CONFIG.cichla.count = 2;
      SPECIES_CONFIG.mandarin.count = 25;
      SPECIES_CONFIG.angler.count = 1;
      SIM_SETTINGS.env.plantCount = 90;
      SIM_SETTINGS.env.coralCount = 18;
      this.setBiome('amazon');
      this.setDayNightPhase('day');
    } else if (type === 'frenzy') {
      SPECIES_CONFIG.tetra.count = 50;
      SPECIES_CONFIG.barbus.count = 40;
      SPECIES_CONFIG.cichla.count = 10;
      SPECIES_CONFIG.mandarin.count = 8;
      SPECIES_CONFIG.angler.count = 6;
      SIM_SETTINGS.env.coralCount = 22;
      this.setBiome('volcanic');
      this.setDayNightPhase('sunset');
      this.ropefish.spawn();
    } else if (type === 'deep') {
      SPECIES_CONFIG.tetra.count = 20;
      SPECIES_CONFIG.angel.count = 30;
      SPECIES_CONFIG.cichla.count = 1;
      SPECIES_CONFIG.mandarin.count = 6;
      SPECIES_CONFIG.angler.count = 6;
      SIM_SETTINGS.env.rockCount = 30;
      SIM_SETTINGS.env.plantCount = 15;
      SIM_SETTINGS.env.coralCount = 28;
      this.setBiome('abyssal');
      this.setDayNightPhase('night');
    }
    this.buildDecor();
    this.spawnAllBoids();
    showToast(`Préréglage [${type.toUpperCase()}] appliqué.`, '🎨');
  }

  saveToLocal() {
    const data = {
      species: SPECIES_CONFIG,
      flocking: SIM_SETTINGS.flocking,
      env: SIM_SETTINGS.env,
      stats: STATS
    };
    try {
      localStorage.setItem('aqualab_save', JSON.stringify(data));
      showToast(I18N[currentLang].saved, '💾');
    } catch (e) {
      alert("Erreur de stockage local.");
    }
  }

  loadFromLocal() {
    try {
      const raw = localStorage.getItem('aqualab_save');
      if (!raw) {
        alert("Aucune sauvegarde trouvée.");
        return;
      }
      const data = JSON.parse(raw);
      Object.assign(SPECIES_CONFIG, data.species);
      Object.assign(SIM_SETTINGS.flocking, data.flocking);
      Object.assign(SIM_SETTINGS.env, data.env);
      this.buildDecor();
      this.spawnAllBoids();
      showToast(I18N[currentLang].loaded, '📂');
    } catch (e) {
      alert("Sauvegarde corrompue.");
    }
  }

  exportJSON() {
    const data = {
      version: "4.2",
      date: new Date().toISOString(),
      species: SPECIES_CONFIG,
      flocking: SIM_SETTINGS.flocking,
      env: SIM_SETTINGS.env,
      stats: STATS
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aqualab-ecosystem-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Fichier JSON exporté.", '📤');
  }

  importJSON(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.species) Object.assign(SPECIES_CONFIG, data.species);
        if (data.flocking) Object.assign(SIM_SETTINGS.flocking, data.flocking);
        if (data.env) Object.assign(SIM_SETTINGS.env, data.env);
        this.buildDecor();
        this.spawnAllBoids();
        showToast("Écosystème restauré depuis le fichier JSON !", '📥');
      } catch (err) {
        alert("Fichier JSON invalide.");
      }
    };
    reader.readAsText(file);
  }
}

// Lancement au chargement du DOM
let aquarium = null;
window.addEventListener('DOMContentLoaded', () => {
  aquarium = new AquariumApp();
  window.aquarium = aquarium;
  window.AQUALAB = {
    getStats: () => ({
      prey: STATS.preyCount,
      predators: STATS.predatorCount,
      births: STATS.births,
      deaths: STATS.deaths,
      preyEaten: STATS.preyEaten,
      superPredatorActive: aquarium && aquarium.getActiveSuperPredators ? aquarium.getActiveSuperPredators().length > 0 : (aquarium && aquarium.ropefish ? aquarium.ropefish.active : false),
      activeSuperPredatorsCount: aquarium && aquarium.getActiveSuperPredators ? aquarium.getActiveSuperPredators().length : 0,
      activeSuperPredators: aquarium && aquarium.getActiveSuperPredators ? aquarium.getActiveSuperPredators().map(s => s.name) : [],
      species: aquarium && aquarium.boids ? aquarium.boids.reduce((acc, b) => {
        if (!b.isDead) acc[b.species] = (acc[b.species] || 0) + 1;
        return acc;
      }, {}) : {}
    }),
    toggleChart: () => {
      window.dispatchEvent(new CustomEvent('aqualab:toggle-chart'));
    }
  };
});
