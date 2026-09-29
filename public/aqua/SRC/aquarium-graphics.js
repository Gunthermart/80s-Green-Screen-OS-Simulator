/**
 * AquaLab 3D - Système de Graphismes Réalistes & Aquascaping
 * Générateur de textures procédurales haute fidélité, caustiques animées,
 * éclairage cinématique et biomatériaux aquatiques.
 */

class AquaGraphics {
  constructor() {
    this.textureCache = new Map();
    this.causticsCanvas = document.createElement('canvas');
    this.causticsCanvas.width = 256;
    this.causticsCanvas.height = 256;
    this.causticsCtx = this.causticsCanvas.getContext('2d');
    this.causticsTexture = new THREE.CanvasTexture(this.causticsCanvas);
    this.causticsTexture.wrapS = THREE.RepeatWrapping;
    this.causticsTexture.wrapT = THREE.RepeatWrapping;
    this.causticsTexture.repeat.set(4, 3);
    this.causticsTime = 0;
  }

  // --- TEXTURES PROCÉDURALES DE PEAU DE POISSON PAR ESPÈCE ---
  getFishTexture(speciesKey, config) {
    if (this.textureCache.has(speciesKey)) {
      return this.textureCache.get(speciesKey);
    }

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    if (speciesKey === 'tetra') {
      // NÉON TÉTRA : Bande cyan électrique + bas ventre rouge rubis intense + ventre argenté
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#0a2540');
      bgGrad.addColorStop(0.35, '#1e3a5f');
      bgGrad.addColorStop(0.7, '#e2e8f0');
      bgGrad.addColorStop(1, '#94a3b8');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Bande bleue turquoise électrique ultra-luminescente sur la moitié supérieure
      ctx.save();
      ctx.shadowColor = '#00f5ff';
      ctx.shadowBlur = 18;
      const blueGrad = ctx.createLinearGradient(0, 0, w, 0);
      blueGrad.addColorStop(0, 'rgba(0, 245, 255, 0.2)');
      blueGrad.addColorStop(0.2, 'rgba(0, 245, 255, 0.95)');
      blueGrad.addColorStop(0.85, 'rgba(56, 189, 248, 1)');
      blueGrad.addColorStop(1, 'rgba(14, 165, 233, 0.4)');

      ctx.fillStyle = blueGrad;
      ctx.beginPath();
      ctx.ellipse(w * 0.45, h * 0.38, w * 0.48, h * 0.12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Bande rouge cramoisi éclatante sur les 2 tiers postérieurs inférieurs
      ctx.save();
      ctx.shadowColor = '#ff1744';
      ctx.shadowBlur = 14;
      const redGrad = ctx.createLinearGradient(w * 0.3, 0, w, 0);
      redGrad.addColorStop(0, 'rgba(255, 23, 68, 0)');
      redGrad.addColorStop(0.25, 'rgba(255, 23, 68, 0.9)');
      redGrad.addColorStop(0.85, 'rgba(244, 63, 94, 0.95)');
      redGrad.addColorStop(1, 'rgba(225, 29, 72, 0.3)');

      ctx.fillStyle = redGrad;
      ctx.beginPath();
      ctx.ellipse(w * 0.65, h * 0.65, w * 0.32, h * 0.16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

    } else if (speciesKey === 'barbus') {
      // BARBUS TIGRE : Fond cuivré doré avec 4 bandes verticales noir carbone
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#78350f');
      bgGrad.addColorStop(0.3, '#d97706');
      bgGrad.addColorStop(0.6, '#f59e0b');
      bgGrad.addColorStop(0.85, '#fef3c7');
      bgGrad.addColorStop(1, '#d97706');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Écailles miroitantes dorées
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      for (let x = 30; x < w - 30; x += 14) {
        for (let y = 30; y < h - 30; y += 10) {
          ctx.beginPath();
          ctx.arc(x + (y % 20 === 0 ? 7 : 0), y, 4, 0, Math.PI);
          ctx.fill();
        }
      }

      // 4 Bandes verticales tigrées noires
      ctx.fillStyle = '#0f172a';
      const stripePos = [0.22, 0.42, 0.64, 0.84];
      stripePos.forEach((pos, idx) => {
        ctx.beginPath();
        const sw = (idx === 1 || idx === 2) ? 28 : 20;
        ctx.ellipse(w * pos, h * 0.5, sw, h * 0.46, (idx % 2 === 0 ? 0.05 : -0.05), 0, Math.PI * 2);
        ctx.fill();
      });

    } else if (speciesKey === 'angel') {
      // SCALAIRE MAJESTUEUX : Rayures zébrées argentées & nacre opalescente
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#334155');
      bgGrad.addColorStop(0.2, '#94a3b8');
      bgGrad.addColorStop(0.5, '#f8fafc');
      bgGrad.addColorStop(0.8, '#cbd5e1');
      bgGrad.addColorStop(1, '#475569');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Reflets nacrés arc-en-ciel subtils
      const iridGrad = ctx.createLinearGradient(0, 0, w, h);
      iridGrad.addColorStop(0.2, 'rgba(168, 85, 247, 0.15)');
      iridGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.18)');
      iridGrad.addColorStop(0.8, 'rgba(52, 211, 153, 0.15)');
      ctx.fillStyle = iridGrad;
      ctx.fillRect(0, 0, w, h);

      // Barres verticales zébrées noires veloutées
      ctx.fillStyle = '#0f172a';
      [0.2, 0.38, 0.58, 0.78].forEach((p, i) => {
        ctx.beginPath();
        const thickness = i === 1 ? 26 : 18;
        ctx.ellipse(w * p, h * 0.5, thickness, h * 0.48, -0.05, 0, Math.PI * 2);
        ctx.fill();
      });

    } else if (speciesKey === 'rasbora') {
      // RASBORA ARLEQUIN : Tache triangulaire noire arrière + flancs cuivrés rose orangé
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#831843');
      bgGrad.addColorStop(0.3, '#f43f5e');
      bgGrad.addColorStop(0.6, '#fb923c');
      bgGrad.addColorStop(0.85, '#ffedd5');
      bgGrad.addColorStop(1, '#9f1239');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Triangle noir bleuté arrière caractéristique de l'Arlequin
      ctx.fillStyle = '#090d16';
      ctx.beginPath();
      ctx.moveTo(w * 0.45, h * 0.15);
      ctx.lineTo(w * 0.88, h * 0.5);
      ctx.lineTo(w * 0.45, h * 0.85);
      ctx.closePath();
      ctx.fill();

    } else if (speciesKey === 'cichla') {
      // CICHLA (PREDATEUR) : Marbrures vert bronze, ocelle caudal cerclé d'or
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#14532d');
      bgGrad.addColorStop(0.3, '#15803d');
      bgGrad.addColorStop(0.65, '#ca8a04');
      bgGrad.addColorStop(0.9, '#fef08a');
      bgGrad.addColorStop(1, '#854d0e');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Rayures sombres verticales de chasseur
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      [0.25, 0.45, 0.62].forEach((pos) => {
        ctx.beginPath();
        ctx.ellipse(w * pos, h * 0.45, 24, h * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      // Ocelle caudal légendaire (Eye-spot noir cerclé d'or éclatant)
      ctx.save();
      ctx.shadowColor = '#eab308';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.arc(w * 0.86, h * 0.45, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(w * 0.86, h * 0.45, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

    } else if (speciesKey === 'mandarin') {
      // POISSON-MANDARIN PSYCHÉDÉLIQUE : Labyrinthes sinueux d'orange mandarine, bleu cobalt électrique et vert émeraude
      const bgGrad = ctx.createLinearGradient(0, 0, w, h);
      bgGrad.addColorStop(0, '#0c4a6e');
      bgGrad.addColorStop(0.3, '#0284c7');
      bgGrad.addColorStop(0.7, '#ea580c');
      bgGrad.addColorStop(1, '#059669');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Tracé des arabesques psychédéliques caractéristiques du mandarin
      ctx.save();
      ctx.lineWidth = 10;
      ctx.strokeStyle = '#0284c7'; // Bleu cobalt électrique
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 14;

      // Volutes sinueuses avant
      ctx.beginPath();
      ctx.arc(w * 0.28, h * 0.45, 34, 0.4, Math.PI * 1.6);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(w * 0.28, h * 0.45, 16, Math.PI * 0.8, Math.PI * 2.2);
      ctx.stroke();

      // Bandes méandriques centrales
      ctx.beginPath();
      ctx.moveTo(w * 0.42, 20);
      ctx.bezierCurveTo(w * 0.52, h * 0.35, w * 0.38, h * 0.65, w * 0.48, h - 20);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(w * 0.60, 25);
      ctx.bezierCurveTo(w * 0.72, h * 0.4, w * 0.55, h * 0.7, w * 0.66, h - 25);
      ctx.stroke();

      // Anneaux concentriques arrière et liserés émeraude
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.arc(w * 0.78, h * 0.5, 26, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(w * 0.78, h * 0.5, 14, 0, Math.PI * 2);
      ctx.fill();

      // Liseré noir d'encadrement des motifs
      ctx.shadowBlur = 0;
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#090d16';
      ctx.stroke();
      ctx.restore();

    } else if (speciesKey === 'puffer') {
      // POISSON-GLOBE LÉOPARD (TETRAODON) : Dos vert lime / chartreuse électrique avec gros ocelles noirs léopard
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#4d7c0f');
      bgGrad.addColorStop(0.2, '#84cc16'); // Vert chartreuse vibrant
      bgGrad.addColorStop(0.55, '#a3e635');
      bgGrad.addColorStop(0.75, '#fef08a'); // Flancs dorés
      bgGrad.addColorStop(0.9, '#f8fafc');  // Ventre blanc immaculé perlé
      bgGrad.addColorStop(1, '#e2e8f0');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Gros ocelles noirs léopard cerclés de jaune éclatant
      const spots = [
        { x: 0.18, y: 0.28, r: 12 },
        { x: 0.32, y: 0.22, r: 16 },
        { x: 0.46, y: 0.32, r: 18 },
        { x: 0.62, y: 0.26, r: 15 },
        { x: 0.75, y: 0.34, r: 13 },
        { x: 0.24, y: 0.52, r: 14 },
        { x: 0.40, y: 0.56, r: 17 },
        { x: 0.56, y: 0.50, r: 19 },
        { x: 0.70, y: 0.58, r: 13 },
        { x: 0.85, y: 0.45, r: 10 }
      ];

      spots.forEach((sp) => {
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(w * sp.x, h * sp.y, sp.r + 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(w * sp.x, h * sp.y, sp.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Petits piquants ou papilles de peau
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for (let i = 0; i < 80; i++) {
        const px = Math.random() * w * 0.8 + w * 0.1;
        const py = Math.random() * h * 0.6 + h * 0.15;
        ctx.beginPath();
        ctx.arc(px, py, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

    } else if (speciesKey === 'angler') {
      // POISSON-LANTERNE ABYSSAL (MELANOCETUS) : Corps noir d'ébène abyssal velouté, photophores cyan bioluminescents
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#020617');
      bgGrad.addColorStop(0.3, '#0b0f19');
      bgGrad.addColorStop(0.6, '#0f172a');
      bgGrad.addColorStop(0.85, '#1e1b4b');
      bgGrad.addColorStop(1, '#020617');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Reflets violet sombre et indigo des profondeurs
      const abyssSheen = ctx.createLinearGradient(0, 0, w, 0);
      abyssSheen.addColorStop(0.1, 'rgba(168, 85, 247, 0.15)');
      abyssSheen.addColorStop(0.5, 'rgba(56, 189, 248, 0.12)');
      abyssSheen.addColorStop(0.9, 'rgba(15, 23, 42, 0.3)');
      ctx.fillStyle = abyssSheen;
      ctx.fillRect(0, 0, w, h);

      // Ligne latérale de photophores bioluminescents cyan éclatants
      ctx.save();
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#38bdf8';
      for (let x = w * 0.15; x < w * 0.85; x += 18) {
        const y = h * 0.48 + Math.sin(x * 0.02) * 12;
        ctx.beginPath();
        ctx.arc(x, y, 3.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#bae6fd';
        ctx.beginPath();
        ctx.arc(x, y, 1.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#38bdf8';
      }

      // Constellation de micro-organes lumineux sur les flancs
      ctx.fillStyle = 'rgba(56, 189, 248, 0.65)';
      for (let i = 0; i < 40; i++) {
        const px = w * 0.2 + Math.random() * w * 0.6;
        const py = h * 0.2 + Math.random() * h * 0.6;
        ctx.beginPath();
        ctx.arc(px, py, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Rangée de dents en aiguilles translucides sur la mâchoire
      ctx.fillStyle = 'rgba(241, 245, 249, 0.85)';
      for (let x = w * 0.04; x < w * 0.24; x += 6) {
        ctx.beginPath();
        ctx.moveTo(x, h * 0.62);
        ctx.lineTo(x + 2, h * 0.62 - 10 - (x % 4) * 2);
        ctx.lineTo(x + 4, h * 0.62);
        ctx.fill();
      }
    }

    // Micro-texture d'écailles translucides universelle
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    for (let i = 0; i < 300; i++) {
      const rx = Math.random() * w;
      const ry = Math.random() * h;
      ctx.fillRect(rx, ry, 2, 2);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    this.textureCache.set(speciesKey, texture);
    return texture;
  }

  // --- TEXTURE DE SUBSTRAT SABLEUX / AQUASOIL NATUREL ---
  getSandTexture() {
    if (this.textureCache.has('sand')) {
      return this.textureCache.get('sand');
    }
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Dégradé naturel de sable noir et siliceux
    ctx.fillStyle = '#091c33';
    ctx.fillRect(0, 0, 512, 512);

    // Grains de quartz et sédiment
    for (let i = 0; i < 8000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const brightness = Math.floor(Math.random() * 80 + 30);
      const isQuartz = Math.random() < 0.15;
      ctx.fillStyle = isQuartz ? `rgba(56, 189, 248, ${Math.random() * 0.3})` : `rgba(${brightness}, ${brightness + 15}, ${brightness + 30}, 0.6)`;
      ctx.fillRect(x, y, Math.random() * 2 + 1, Math.random() * 2 + 1);
    }

    // Rides de vagues douces dans le sable (Sand ripples)
    ctx.strokeStyle = 'rgba(15, 40, 70, 0.4)';
    ctx.lineWidth = 6;
    for (let y = 20; y < 512; y += 45) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x < 512; x += 30) {
        ctx.quadraticCurveTo(x + 15, y + Math.sin(x * 0.05) * 8, x + 30, y);
      }
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(6, 6);
    this.textureCache.set('sand', texture);
    return texture;
  }

  // --- TEXTURE GÉOLOGIQUE DE ROCHES (DRAGON STONES) ---
  getRockTexture() {
    if (this.textureCache.has('rock')) {
      return this.textureCache.get('rock');
    }
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 256, 256);

    // Strates géologiques et fissures
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.lineWidth = 3;
    for (let y = 10; y < 256; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x < 256; x += 20) {
        ctx.lineTo(x, y + (Math.random() - 0.5) * 8);
      }
      ctx.stroke();
    }

    // Patine de mousse végétale vert foncé
    ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
    for (let i = 0; i < 400; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * 256, Math.random() * 256, Math.random() * 8 + 2, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    this.textureCache.set('rock', texture);
    return texture;
  }

  getFinTexture() {
    if (this.textureCache.has('fin')) {
      return this.textureCache.get('fin');
    }
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, 128, 128);
    const grad = ctx.createLinearGradient(0, 0, 0, 128);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.75)');
    grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.45)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0.15)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 1.5;
    for (let x = 6; x < 128; x += 10) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.quadraticCurveTo(x + (x - 64) * 0.1, 64, x + (x - 64) * 0.25, 128);
      ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    this.textureCache.set('fin', tex);
    return tex;
  }

  // --- TEXTURE ÉPIDERMIQUE ÉLÉGANTE DU LÉVIATHAN DES ABYSSES (SUPER-PRÉDATEUR) ---
  getLeviathanTexture() {
    if (this.textureCache.has('leviathan')) {
      return this.textureCache.get('leviathan');
    }
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const w = 512;
    const h = 256;

    // Dégradé sombre titanesque : Noir d'encre abyssal vers vert émeraude ténébreux
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#02130e');
    bgGrad.addColorStop(0.3, '#064e3b');
    bgGrad.addColorStop(0.65, '#047857');
    bgGrad.addColorStop(0.85, '#0f291e');
    bgGrad.addColorStop(1, '#01120c');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Écailles reptiliennes rhombiques et carénées de grand prédateur aquatique
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
    ctx.lineWidth = 1.4;
    for (let x = 0; x < w; x += 16) {
      for (let y = 0; y < h; y += 12) {
        ctx.beginPath();
        const ox = (y % 24 === 0) ? 8 : 0;
        ctx.moveTo(x + ox, y);
        ctx.lineTo(x + ox + 8, y + 6);
        ctx.lineTo(x + ox, y + 12);
        ctx.lineTo(x + ox - 8, y + 6);
        ctx.closePath();
        ctx.stroke();
      }
    }

    // Ligne latérale carénée d'écailles dorées/bronze
    ctx.save();
    ctx.fillStyle = '#f59e0b';
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 10;
    for (let x = 16; x < w - 16; x += 20) {
      ctx.beginPath();
      ctx.arc(x, h * 0.5, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Bandes de camouflage d'embuscade sombres
    ctx.fillStyle = 'rgba(2, 20, 15, 0.6)';
    for (let x = 40; x < w - 40; x += 65) {
      ctx.beginPath();
      ctx.ellipse(x, h * 0.5, 20, h * 0.46, 0.1, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 1);
    this.textureCache.set('leviathan', tex);
    return tex;
  }

  // --- TEXTURE ÉPIDERMIQUE DU MÉGALODON (SUPER-PRÉDATEUR CARCHARODON) ---
  getMegalodonTexture() {
    if (this.textureCache.has('megalodon')) {
      return this.textureCache.get('megalodon');
    }
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const w = 512;
    const h = 256;

    // Dégradé pélagique sombre vers ardoise océanique
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#090d16');
    bgGrad.addColorStop(0.3, '#1e293b');
    bgGrad.addColorStop(0.55, '#334155');
    bgGrad.addColorStop(0.72, '#cbd5e1'); // Transition contre-ombrage
    bgGrad.addColorStop(0.85, '#f8fafc'); // Ventre blanc éclatant
    bgGrad.addColorStop(1, '#f1f5f9');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Denticules dermiques microscopiques de squale
    ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
    for (let i = 0; i < 400; i++) {
      const rx = Math.random() * w;
      const ry = Math.random() * h * 0.7;
      ctx.fillRect(rx, ry, 1.5, 1.5);
    }

    // 5 Fentes branchiales sombres
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 2.4;
    for (let i = 0; i < 5; i++) {
      const gx = w * 0.22 + i * 9;
      ctx.beginPath();
      ctx.moveTo(gx, h * 0.35);
      ctx.quadraticCurveTo(gx - 4, h * 0.5, gx, h * 0.65);
      ctx.stroke();
    }

    // Cicatrices de combat et rayures de morsure de titan
    ctx.strokeStyle = 'rgba(226, 232, 240, 0.45)';
    ctx.lineWidth = 1.2;
    for (let j = 0; j < 6; j++) {
      const sx = w * (0.35 + j * 0.08);
      const sy = h * (0.3 + Math.sin(j) * 0.2);
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + 18, sy + 8);
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    this.textureCache.set('megalodon', tex);
    return tex;
  }

  // --- TEXTURE ÉPIDERMIQUE DU MOSASAURE (SUPER-PRÉDATEUR DU CRÉTACÉ) ---
  getMosasaurTexture() {
    if (this.textureCache.has('mosasaur')) {
      return this.textureCache.get('mosasaur');
    }
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const w = 512;
    const h = 256;

    // Dégradé vert sarcelle sombre / basalte marin
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#021815');
    bgGrad.addColorStop(0.35, '#042f2e');
    bgGrad.addColorStop(0.65, '#0d9488');
    bgGrad.addColorStop(0.85, '#2dd4bf');
    bgGrad.addColorStop(1, '#e6fffa');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Écailles osseuses ostéodermes en mosaïque
    ctx.strokeStyle = 'rgba(20, 184, 166, 0.35)';
    ctx.lineWidth = 1.2;
    for (let x = 0; x < w; x += 14) {
      for (let y = 0; y < h; y += 10) {
        ctx.strokeRect(x + (y % 20 === 0 ? 7 : 0), y, 12, 8);
      }
    }

    // Ocelles prédateurs et bandes reptiliennes
    ctx.fillStyle = 'rgba(2, 44, 34, 0.55)';
    for (let x = 30; x < w - 30; x += 45) {
      ctx.beginPath();
      ctx.ellipse(x, h * 0.45, 14, h * 0.4, 0.15, 0, Math.PI * 2);
      ctx.fill();
    }

    // Photophores latéraux ambrés bioluminescents
    ctx.save();
    ctx.fillStyle = '#f59e0b';
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 8;
    for (let x = 20; x < w - 20; x += 22) {
      ctx.beginPath();
      ctx.arc(x, h * 0.52 + Math.sin(x * 0.03) * 6, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    this.textureCache.set('mosasaur', tex);
    return tex;
  }

  // --- TEXTURE ÉPIDERMIQUE DU KRAKEN COLOSSAL (SUPER-PRÉDATEUR CÉPHALOPODE) ---
  getKrakenTexture() {
    if (this.textureCache.has('kraken')) {
      return this.textureCache.get('kraken');
    }
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const w = 512;
    const h = 256;

    // Dégradé carmin abyssal / pourpre impérial / noir d'encre
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#26020c');
    bgGrad.addColorStop(0.3, '#4c0519');
    bgGrad.addColorStop(0.6, '#881337');
    bgGrad.addColorStop(0.85, '#581c87');
    bgGrad.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Chromatophores mouvants (milliers de micro-pigments cellulaires)
    for (let i = 0; i < 900; i++) {
      const cx = Math.random() * w;
      const cy = Math.random() * h;
      const r = Math.random() * 2.2 + 0.8;
      const colors = ['#f43f5e', '#fb7185', '#be123c', '#e11d48', '#38bdf8'];
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Veines bioluminescentes turquoise et indigo pulsantes
    ctx.save();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 10;
    for (let k = 0; k < 8; k++) {
      ctx.beginPath();
      ctx.moveTo(w * 0.1, h * (0.2 + k * 0.08));
      ctx.bezierCurveTo(w * 0.4, h * (0.15 + k * 0.09), w * 0.7, h * (0.25 + k * 0.07), w * 0.95, h * (0.2 + k * 0.08));
      ctx.stroke();
    }
    ctx.restore();

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    this.textureCache.set('kraken', tex);
    return tex;
  }

  // --- TEXTURE INDUSTRIELLE OCÉANOGRAPHIQUE DU ROV (SOUS-MARIN) ---
  getSubmarineTexture() {
    if (this.textureCache.has('submarine')) {
      return this.textureCache.get('submarine');
    }
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const w = 512;
    const h = 256;

    // Fond jaune sécurité océanographique profond
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#f59e0b');
    bgGrad.addColorStop(0.35, '#eab308');
    bgGrad.addColorStop(0.7, '#ca8a04');
    bgGrad.addColorStop(1, '#854d0e');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Panneaux en titane et joints étanches rivetés
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.65)';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(20, 20, w - 40, h - 40);

    // Lignes de séparation de panneaux
    ctx.beginPath();
    ctx.moveTo(w * 0.35, 20);
    ctx.lineTo(w * 0.35, h - 20);
    ctx.moveTo(w * 0.7, 20);
    ctx.lineTo(w * 0.7, h - 20);
    ctx.moveTo(20, h * 0.5);
    ctx.lineTo(w - 20, h * 0.5);
    ctx.stroke();

    // Rivets le long des joints
    ctx.fillStyle = '#475569';
    for (let x = 25; x < w - 20; x += 16) {
      ctx.beginPath();
      ctx.arc(x, 26, 2, 0, Math.PI * 2);
      ctx.arc(x, h - 26, 2, 0, Math.PI * 2);
      ctx.arc(x, h * 0.5, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Bande de sécurité carbone avec chevrons d'alerte jaunes/noirs
    ctx.save();
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(w * 0.05, h * 0.7, w * 0.9, 28);

    // Chevrons hachurés
    ctx.fillStyle = '#facc15';
    for (let x = w * 0.06; x < w * 0.92; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, h * 0.7);
      ctx.lineTo(x + 10, h * 0.7);
      ctx.lineTo(x + 2, h * 0.7 + 28);
      ctx.lineTo(x - 8, h * 0.7 + 28);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Lettrage scientifique et marquages techniques
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('AQUALAB EXPLORER // MK-IV', 40, 65);

    ctx.font = '11px monospace';
    ctx.fillStyle = '#1e293b';
    ctx.fillText('DEPTH RATING: 2000M  |  BIO-SONAR ACTIVE', 42, 85);
    ctx.fillText('AUTONOMOUS RESEARCH SUBMERSIBLE', 42, 102);

    // Logo scientifique stylisé (cercle sonar)
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(w * 0.85, 65, 24, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(w * 0.85, 65, 14, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(w * 0.85, 65, 5, 0, Math.PI * 2);
    ctx.fill();

    // Salissures d'eau et micro-rayures sous-marines
    ctx.fillStyle = 'rgba(255, 255, 255, 0.09)';
    for (let i = 0; i < 400; i++) {
      ctx.fillRect(Math.random() * w, Math.random() * h, Math.random() * 8 + 1, 1.5);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    this.textureCache.set('submarine', tex);
    return tex;
  }

  // --- TEXTURE POUR ÉCRANS DIGITAUX DU COCKPIT DU SOUS-MARIN ---
  getSubmarineConsoleTexture() {
    if (this.textureCache.has('sub_console')) {
      return this.textureCache.get('sub_console');
    }
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    const w = 256;
    const h = 128;

    // Fond console noir nuit océanique
    ctx.fillStyle = '#030a16';
    ctx.fillRect(0, 0, w, h);

    // Grille radar / télémétrie cyan
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= w; x += 16) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y <= h; y += 16) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Graphique de bathymétrie oscillant
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(10, 70);
    for (let x = 10; x < 120; x += 5) {
      const y = 65 + Math.sin(x * 0.1) * 12 + Math.cos(x * 0.25) * 6;
      ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Réticule horizon artificiel
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(180, 50, 26, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(160, 50);
    ctx.lineTo(200, 50);
    ctx.moveTo(180, 32);
    ctx.lineTo(180, 68);
    ctx.stroke();

    // Textes télémétriques
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('SYS: NOMINAL 99%', 10, 18);
    ctx.fillStyle = '#34d399';
    ctx.fillText('BAT: 96% [O2: 100%]', 10, 30);
    ctx.fillStyle = '#f59e0b';
    ctx.fillText('SONAR 360° ACTIF', 10, 110);
    ctx.fillStyle = '#c084fc';
    ctx.fillText('BIO-RADAR', 160, 95);

    const tex = new THREE.CanvasTexture(canvas);
    this.textureCache.set('sub_console', tex);
    return tex;
  }

  // --- MISE À JOUR CONTINUE DES CAUSTIQUES AQUATIQUES ANIMÉES ---
  updateCaustics(delta) {
    this.causticsTime += delta * 1.8;
    const t = this.causticsTime;
    const ctx = this.causticsCtx;
    const w = 256;
    const h = 256;

    // Fond marin sombre
    ctx.fillStyle = '#010814';
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.lineWidth = 3.2;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 10;

    // Premier jeu d'ondes harmoniques
    for (let y = 0; y < h; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x < w; x += 12) {
        const offset = Math.sin(x * 0.06 + t) * 9 + Math.cos((y + t * 18) * 0.05) * 7;
        ctx.lineTo(x, y + offset);
      }
      ctx.stroke();
    }

    // Deuxième jeu d'ondes croisées
    for (let x = 0; x < w; x += 22) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      for (let y = 0; y < h; y += 12) {
        const offset = Math.cos(y * 0.06 - t * 1.2) * 9 + Math.sin((x - t * 14) * 0.05) * 7;
        ctx.lineTo(x + offset, y);
      }
      ctx.stroke();
    }

    // Points de focalisation caustique intense (lumière concentrée)
    ctx.fillStyle = 'rgba(186, 230, 253, 0.85)';
    ctx.shadowColor = '#bae6fd';
    ctx.shadowBlur = 14;
    for (let i = 0; i < 16; i++) {
      const cx = (Math.sin(t * 0.7 + i * 1.7) * 0.45 + 0.5) * w;
      const cy = (Math.cos(t * 0.8 + i * 2.1) * 0.45 + 0.5) * h;
      ctx.beginPath();
      ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    this.causticsTexture.needsUpdate = true;
  }
}

// --- CLASSE COLONNE DE BULLES D'AIR (AQUARIUM AIR STONE) ---
class BubbleColumn {
  constructor(scene, tank) {
    this.scene = scene;
    this.tank = tank;
    this.bubbles = [];
    this.count = 70;
    this.origin = new THREE.Vector3(-tank.width * 0.42, 4, -tank.depth * 0.38);

    const geom = new THREE.SphereGeometry(1.2, 8, 8);
    const mat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.9,
      opacity: 0.85,
      transparent: true,
      roughness: 0.1,
      metalness: 0.1,
      clearcoat: 1.0,
      ior: 1.1
    });

    this.group = new THREE.Group();
    for (let i = 0; i < this.count; i++) {
      const mesh = new THREE.Mesh(geom, mat);
      const scale = 0.5 + Math.random() * 1.5;
      mesh.scale.set(scale, scale, scale);
      const bubble = {
        mesh: mesh,
        pos: this.origin.clone().add(new THREE.Vector3(
          (Math.random() - 0.5) * 12,
          Math.random() * tank.height,
          (Math.random() - 0.5) * 12
        )),
        speed: 0.8 + Math.random() * 1.2,
        wobbleSeed: Math.random() * 100,
        scale: scale
      };
      mesh.position.copy(bubble.pos);
      this.group.add(mesh);
      this.bubbles.push(bubble);
    }
    this.scene.add(this.group);
  }

  update(delta) {
    const time = Date.now() * 0.003;
    for (const b of this.bubbles) {
      b.pos.y += b.speed * delta * 60;
      b.pos.x = this.origin.x + Math.sin(time + b.wobbleSeed) * 6;
      b.pos.z = this.origin.z + Math.cos(time * 0.8 + b.wobbleSeed) * 6;

      // Éclatement en surface et renaissance au fond
      if (b.pos.y >= this.tank.height - 4) {
        b.pos.y = 4;
        b.pos.x = this.origin.x + (Math.random() - 0.5) * 8;
        b.pos.z = this.origin.z + (Math.random() - 0.5) * 8;
      }
      b.mesh.position.copy(b.pos);
    }
  }
}

// --- CLASSE SURFACE DE L'EAU VUE DU DESSOUS (WATER CEILING WITH WAVES & FRESNEL REFLECTION) ---
class WaterCeiling {
  constructor(scene, tank) {
    this.scene = scene;
    this.tank = tank;
    const geom = new THREE.PlaneGeometry(tank.width, tank.depth, 40, 40);
    geom.rotateX(Math.PI / 2); // Orienté vers le bas

    const causticsTex = (window.AquaGraphics && window.AquaGraphics.causticsTexture)
      ? window.AquaGraphics.causticsTexture
      : null;

    this.mat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transmission: 0.88,
      transparent: true,
      opacity: 0.72,
      roughness: 0.08,
      metalness: 0.25,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      emissiveMap: causticsTex,
      emissive: new THREE.Color(0x38bdf8),
      emissiveIntensity: 0.4,
      side: THREE.DoubleSide
    });

    this.mesh = new THREE.Mesh(geom, this.mat);
    this.mesh.position.set(0, tank.height, 0);
    this.scene.add(this.mesh);

    this.geom = geom;
  }

  update(delta, sunFactor = 1.0) {
    const pos = this.geom.attributes.position.array;
    const time = Date.now() * 0.0022;
    for (let i = 0; i < pos.length; i += 3) {
      const x = pos[i];
      const z = pos[i + 2];
      pos[i + 1] = Math.sin(x * 0.04 + time) * 2.4 
                 + Math.cos(z * 0.035 + time * 1.3) * 1.8 
                 + Math.sin((x + z) * 0.02 - time * 0.8) * 1.0;
    }
    this.geom.computeVertexNormals();
    this.geom.attributes.position.needsUpdate = true;
    if (this.mat) {
      this.mat.emissiveIntensity = 0.08 + 0.32 * sunFactor;
    }
  }
}

// --- FAISCEAUX DE LUMIÈRE VOLUMÉTRIQUES (GOD RAYS) ---
class UnderwaterGodRays {
  constructor(scene, tank) {
    this.scene = scene;
    this.group = new THREE.Group();

    const rayMat = new THREE.MeshBasicMaterial({
      color: 0xbae6fd,
      transparent: true,
      opacity: 0.09,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const positions = [
      new THREE.Vector3(-tank.width * 0.28, tank.height, -tank.depth * 0.18),
      new THREE.Vector3(tank.width * 0.08, tank.height, tank.depth * 0.12),
      new THREE.Vector3(tank.width * 0.32, tank.height, -tank.depth * 0.12),
      new THREE.Vector3(-tank.width * 0.08, tank.height, tank.depth * 0.22),
      new THREE.Vector3(tank.width * 0.22, tank.height, tank.depth * 0.28)
    ];

    this.rays = [];
    positions.forEach((p, idx) => {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(58 + idx * 7, tank.height, 14, 1, true), rayMat);
      cone.position.set(p.x, tank.height / 2, p.z);
      cone.rotation.z = (Math.random() - 0.5) * 0.15;
      cone.rotation.x = (Math.random() - 0.5) * 0.15;
      this.group.add(cone);
      this.rays.push({ 
        mesh: cone, 
        baseRotZ: cone.rotation.z, 
        baseRotX: cone.rotation.x, 
        seed: idx * 1.4 
      });
    });

    this.scene.add(this.group);
  }

  update(delta, sunFactor = 1.0) {
    const time = Date.now() * 0.0016;
    this.rays.forEach((r) => {
      r.mesh.material.opacity = (0.07 + Math.sin(time + r.seed) * 0.035) * sunFactor;
      r.mesh.rotation.z = r.baseRotZ + Math.sin(time * 0.6 + r.seed) * 0.04;
      r.mesh.rotation.x = r.baseRotX + Math.cos(time * 0.5 + r.seed) * 0.04;
    });
  }
}

window.AquaGraphics = new AquaGraphics();
window.BubbleColumn = BubbleColumn;
window.WaterCeiling = WaterCeiling;
window.UnderwaterGodRays = UnderwaterGodRays;
