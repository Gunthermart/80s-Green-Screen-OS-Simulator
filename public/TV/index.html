<!DOCTYPE html>
<html lang="fr" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OmniStream — Live Radio, TV, Pluto TV & Podcasts Pro</title>
  
  <!-- Hls.js pour la lecture des flux vidéo et audio HLS M3U8 -->
  <script src="https://cdn.jsdelivr.net/npm/hls.js@1.5.8/dist/hls.min.js"></script>
  <!-- Three.js pour le rendu des animations WebGL 3D -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>

  <style>
    :root {
      --bg-base: #090a0f;
      --bg-surface: #111420;
      --bg-surface-elevated: #181c2e;
      --bg-glass: rgba(17, 20, 32, 0.88);
      --border-glass: rgba(255, 255, 255, 0.08);
      --border-focus: rgba(99, 102, 241, 0.5);

      --text-primary: #f8fafc;
      --text-secondary: #94a3b8;
      --text-muted: #64748b;

      --accent-primary: #6366f1;
      --accent-primary-hover: #4f46e5;
      --accent-cyan: #06b6d4;
      --accent-podcast: #a855f7;
      --accent-live: #ef4444;
      --accent-green: #10b981;

      --sidebar-width: 280px;
      --player-height: 104px;
      --radius-sm: 8px;
      --radius-md: 12px;
      --radius-lg: 18px;
      --radius-full: 9999px;

      --shadow-subtle: 0 4px 20px rgba(0, 0, 0, 0.35);
      --shadow-glow: 0 0 25px rgba(99, 102, 241, 0.25);
      --transition-smooth: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }

    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: var(--bg-base);
      color: var(--text-primary);
      min-height: 100vh;
      display: flex;
      overflow: hidden;
    }

    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.15); border-radius: var(--radius-full); }
    ::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.3); }

    .live-badge {
      display: inline-flex; align-items: center; gap: 6px;
      font-size: 0.7rem; font-weight: 700; letter-spacing: 0.05em;
      color: var(--accent-live); text-transform: uppercase;
    }
    .live-badge.is-active { color: #10b981; }
    .live-badge.is-buffering { color: #f59e0b; }
    .live-badge.is-dead { color: #ef4444; }

    .live-dot {
      width: 7px; height: 7px; background: currentColor;
      border-radius: 50%; animation: pulse 1.5s infinite;
    }
    @keyframes pulse { 0%, 100% { transform: scale(0.95); opacity: 0.8; } 50% { transform: scale(1.2); opacity: 1; } }

    #app-container { display: flex; width: 100vw; height: 100vh; overflow: hidden; position: relative; }

    #sidebar {
      width: var(--sidebar-width); background: var(--bg-surface);
      border-right: 1px solid var(--border-glass); display: flex;
      flex-direction: column; flex-shrink: 0; z-index: 30; transition: transform 0.3s ease;
    }

    .brand-section { padding: 20px; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid var(--border-glass); }
    .brand-icon {
      width: 38px; height: 38px; background: linear-gradient(135deg, var(--accent-primary), var(--accent-podcast));
      border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center;
      box-shadow: var(--shadow-glow); flex-shrink: 0;
    }

    .nav-tabs { padding: 12px; display: flex; flex-direction: column; gap: 4px; }
    .nav-item {
      display: flex; align-items: center; gap: 12px; padding: 10px 14px;
      border-radius: var(--radius-md); color: var(--text-secondary); cursor: pointer;
      font-weight: 500; font-size: 0.88rem; border: 1px solid transparent;
      transition: var(--transition-smooth); user-select: none;
    }
    .nav-item:hover { background: var(--bg-surface-elevated); color: var(--text-primary); }
    .nav-item.active { background: rgba(99, 102, 241, 0.15); color: var(--text-primary); border-color: rgba(99, 102, 241, 0.3); }

    .badge-counter { margin-left: auto; font-size: 0.7rem; padding: 2px 8px; border-radius: 10px; font-weight: 700; }

    .sidebar-filters { flex: 1; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 14px; }
    .filter-group-title { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted); padding: 4px 8px; font-weight: 700; }
    .filter-chips { display: flex; flex-wrap: wrap; gap: 6px; }
    .chip {
      font-size: 0.78rem; padding: 5px 10px; background: var(--bg-surface-elevated);
      border: 1px solid var(--border-glass); border-radius: var(--radius-full);
      color: var(--text-secondary); cursor: pointer; transition: var(--transition-smooth); white-space: nowrap;
    }
    .chip:hover { border-color: var(--accent-primary); color: #fff; }
    .chip.active { background: var(--accent-primary); border-color: var(--accent-primary); color: #fff; }

    .card-fav-btn, .card-fs-btn {
      position: absolute; top: 8px; z-index: 6; width: 32px; height: 32px; border-radius: 50%;
      background: rgba(16, 19, 30, 0.82); backdrop-filter: blur(8px); border: 1px solid var(--border-glass);
      display: flex; align-items: center; justify-content: center; color: var(--text-secondary);
      cursor: pointer; transition: var(--transition-smooth);
    }
    .card-fav-btn { right: 8px; }
    .card-fs-btn { left: 8px; }
    .card-fav-btn:hover { transform: scale(1.12); color: #ef4444; background: rgba(16, 19, 30, 0.95); }
    .card-fav-btn.is-fav { color: #ef4444; background: rgba(239, 68, 68, 0.25); border-color: rgba(239, 68, 68, 0.6); }
    .card-fs-btn:hover { transform: scale(1.12); color: var(--accent-cyan); background: rgba(16, 19, 30, 0.95); border-color: var(--accent-cyan); }

    #main-wrapper {
      flex: 1; display: flex; flex-direction: column; height: 100vh; overflow: hidden;
      background: radial-gradient(circle at 80% 20%, rgba(99, 102, 241, 0.05), transparent 40%), var(--bg-base);
    }

    .top-header {
      height: 70px; padding: 0 24px; display: flex; align-items: center; justify-content: space-between; gap: 16px;
      border-bottom: 1px solid var(--border-glass); backdrop-filter: blur(12px); background: var(--bg-glass); z-index: 20;
    }
    .mobile-menu-btn { display: none; background: none; border: none; color: var(--text-primary); cursor: pointer; padding: 8px; }
    .search-box { flex: 1; max-width: 460px; position: relative; }
    .search-box svg { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); stroke: var(--text-muted); pointer-events: none; }
    .search-input {
      width: 100%; padding: 10px 14px 10px 42px; background: var(--bg-surface-elevated);
      border: 1px solid var(--border-glass); border-radius: var(--radius-full); color: var(--text-primary);
      font-size: 0.88rem; outline: none; transition: var(--transition-smooth);
    }
    .search-input:focus { border-color: var(--accent-primary); }

    .header-actions { display: flex; align-items: center; gap: 12px; }
    .btn-header-action {
      background: var(--bg-surface-elevated); border: 1px solid var(--border-glass); color: var(--text-primary);
      padding: 8px 14px; border-radius: var(--radius-full); cursor: pointer; font-size: 0.82rem;
      display: flex; align-items: center; gap: 8px; transition: var(--transition-smooth);
    }
    .btn-header-action:hover { border-color: var(--accent-primary); color: #fff; }

    #content-stage {
      flex: 1; overflow-y: auto; padding: 20px 24px calc(var(--player-height) + 20px) 24px;
      display: flex; flex-direction: column; gap: 20px;
    }

    #theater-stage {
      width: 100%; background: #000; border-radius: var(--radius-lg); border: 1px solid var(--border-glass);
      overflow: hidden; display: none; position: relative; z-index: 25;
      box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.8), var(--shadow-glow); backdrop-filter: blur(16px);
    }
    #theater-stage.active { display: block; }
    #theater-stage:fullscreen, #theater-stage:-webkit-full-screen {
      width: 100vw !important; height: 100vh !important; border-radius: 0 !important; border: none !important; margin: 0 !important; padding: 0 !important;
    }

    .stage-hud-top {
      position: absolute; top: 16px; left: 20px; right: 20px;
      display: flex; align-items: center; justify-content: space-between; z-index: 30;
    }
    .stage-title-hud { font-size: 1.05rem; font-weight: 700; color: #fff; text-shadow: 0 2px 8px rgba(0,0,0,0.8); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 40%; }
    .stage-controls-hud { display: flex; align-items: center; gap: 10px; }

    .stage-btn {
      background: rgba(0, 0, 0, 0.7); border: 1px solid var(--border-glass); color: #fff;
      padding: 8px 14px; border-radius: var(--radius-full); cursor: pointer; font-size: 0.82rem;
      backdrop-filter: blur(8px); display: flex; align-items: center; gap: 6px; outline: none; transition: var(--transition-smooth);
    }
    .stage-btn:hover { background: rgba(99, 102, 241, 0.5); border-color: var(--accent-primary); }

    .video-viewport {
      width: 100%; max-height: 480px; aspect-ratio: 16 / 9; position: relative; background: #000;
      display: flex; align-items: center; justify-content: center; cursor: pointer;
    }
    #theater-stage:fullscreen .video-viewport, #theater-stage:-webkit-full-screen .video-viewport { max-height: 100vh !important; height: 100vh !important; }

    video#unified-media { width: 100%; height: 100%; object-fit: contain; position: relative; z-index: 10; }

    .canvas-layer { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
    #visualizer-canvas-2d { z-index: 12; }
    #visualizer-canvas-3d { z-index: 10; }

    .audio-visualizer-overlay {
      position: absolute; inset: 0;
      background: radial-gradient(circle at center, rgba(17, 20, 32, 0.3) 0%, rgba(9, 10, 15, 0.9) 100%);
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; z-index: 3; pointer-events: none;
    }

    .audio-cover {
      width: 120px; height: 120px; border-radius: var(--radius-lg); background: var(--bg-surface-elevated);
      border: 2px solid var(--border-glass); overflow: hidden; display: flex; align-items: center; justify-content: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.6); z-index: 15; pointer-events: auto;
    }
    .audio-cover img { width: 100%; height: 100%; object-fit: cover; }

    .cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; }

    #sidebar-backdrop {
      display: none; position: fixed; inset: 0; background: rgba(0, 0, 0, 0.65);
      backdrop-filter: blur(4px); z-index: 28; opacity: 0; transition: opacity 0.3s ease;
    }
    #sidebar-backdrop.open { display: block; opacity: 1; }

    .station-card {
      background: var(--bg-surface); border: 1px solid var(--border-glass); border-radius: var(--radius-md);
      padding: 12px; cursor: pointer; display: flex; flex-direction: column; gap: 10px; transition: var(--transition-smooth); position: relative;
    }
    .station-card:hover { transform: translateY(-4px); background: var(--bg-surface-elevated); border-color: rgba(99, 102, 241, 0.4); }
    .station-card.is-playing { border-color: var(--accent-primary); background: rgba(99, 102, 241, 0.12); }

    .card-thumb-wrapper {
      width: 100%; aspect-ratio: 16 / 10; border-radius: var(--radius-sm); background: var(--bg-surface-elevated);
      display: flex; align-items: center; justify-content: center; overflow: hidden; border: 1px solid var(--border-glass); position: relative;
    }
    .card-thumb-wrapper img { width: 100%; height: 100%; object-fit: contain; background: #000; }

    .card-thumb-fallback-box {
      width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(6, 182, 212, 0.2)); color: var(--text-primary);
      font-weight: 700; font-size: 0.82rem; padding: 8px; text-align: center; gap: 4px;
    }
    .card-thumb-fallback-box span.initials { font-size: 1.15rem; letter-spacing: 0.05em; color: #fff; text-shadow: 0 2px 6px rgba(0,0,0,0.5); }

    .episodes-panel {
      background: var(--bg-surface); border: 1px solid var(--border-glass); border-radius: var(--radius-lg);
      padding: 20px; display: flex; flex-direction: column; gap: 16px; animation: fadeIn 0.3s ease;
    }

    .podcast-header-detail { display: flex; gap: 20px; align-items: flex-start; border-bottom: 1px solid var(--border-glass); padding-bottom: 16px; }
    .podcast-detail-cover { width: 110px; height: 110px; border-radius: var(--radius-md); object-fit: cover; flex-shrink: 0; box-shadow: 0 4px 15px rgba(0,0,0,0.4); }
    .podcast-header-info { flex: 1; display: flex; flex-direction: column; gap: 8px; }

    .btn-subscribe {
      background: rgba(168, 85, 247, 0.15); color: var(--accent-podcast); border: 1px solid rgba(168, 85, 247, 0.4);
      padding: 6px 14px; border-radius: var(--radius-full); font-size: 0.8rem; font-weight: 600; cursor: pointer;
      display: inline-flex; align-items: center; gap: 6px; transition: var(--transition-smooth); width: fit-content;
    }
    .btn-subscribe:hover, .btn-subscribe.is-subbed { background: var(--accent-podcast); color: #fff; }

    .episode-item {
      display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 12px 16px;
      background: var(--bg-surface-elevated); border: 1px solid var(--border-glass); border-radius: var(--radius-md);
      cursor: pointer; transition: var(--transition-smooth); position: relative; overflow: hidden;
    }
    .episode-item:hover { background: rgba(168, 85, 247, 0.12); border-color: rgba(168, 85, 247, 0.4); }
    .episode-progress-bar { position: absolute; bottom: 0; left: 0; height: 3px; background: linear-gradient(90deg, var(--accent-podcast), var(--accent-cyan)); transition: width 0.3s ease; }
    .episode-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

    .btn-action-sm {
      background: rgba(255, 255, 255, 0.06); border: 1px solid var(--border-glass); color: var(--text-secondary);
      padding: 6px 10px; border-radius: var(--radius-full); font-size: 0.75rem; cursor: pointer;
      display: flex; align-items: center; gap: 4px; transition: var(--transition-smooth);
    }
    .btn-action-sm:hover { color: #fff; border-color: var(--border-focus); background: rgba(255, 255, 255, 0.12); }

    #sticky-player {
      position: fixed; bottom: 0; left: 0; right: 0; height: var(--player-height);
      background: rgba(14, 17, 27, 0.96); backdrop-filter: blur(20px); border-top: 1px solid var(--border-glass);
      display: flex; flex-direction: column; justify-content: center; padding: 8px 24px; z-index: 50;
    }

    .player-scrub-container { width: 100%; display: flex; align-items: center; gap: 12px; margin-bottom: 6px; }
    .time-label { font-size: 0.72rem; font-weight: 600; color: var(--text-muted); font-variant-numeric: tabular-nums; min-width: 44px; }
    .time-label.right { text-align: right; }

    .scrub-slider {
      flex: 1; height: 4px; appearance: none; background: rgba(255, 255, 255, 0.15); border-radius: var(--radius-full); outline: none; cursor: pointer;
    }
    .scrub-slider::-webkit-slider-thumb { appearance: none; width: 12px; height: 12px; border-radius: 50%; background: var(--accent-primary); cursor: pointer; }

    .player-main-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
    .player-left { display: flex; align-items: center; gap: 12px; width: 280px; min-width: 200px; }
    .player-thumb { width: 44px; height: 44px; border-radius: var(--radius-sm); background: var(--bg-surface-elevated); overflow: hidden; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .player-thumb img { width: 100%; height: 100%; object-fit: cover; }

    .player-controls { display: flex; align-items: center; gap: 10px; }
    .ctrl-btn { background: none; border: none; color: var(--text-secondary); cursor: pointer; padding: 6px; border-radius: 50%; outline: none; transition: var(--transition-smooth); display: flex; align-items: center; justify-content: center; }
    .ctrl-btn:hover { color: var(--text-primary); transform: scale(1.08); }
    .ctrl-btn.play-main { width: 42px; height: 42px; background: var(--text-primary); color: var(--bg-base); }

    .jump-btn, .speed-btn {
      font-size: 0.72rem; font-weight: 700; padding: 4px 8px; border-radius: var(--radius-full); cursor: pointer; transition: var(--transition-smooth);
    }
    .jump-btn { color: var(--text-secondary); background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border-glass); }
    .speed-btn { color: var(--accent-cyan); background: rgba(6, 182, 212, 0.12); border: 1px solid rgba(6, 182, 212, 0.3); }

    .player-right { display: flex; align-items: center; gap: 14px; width: 280px; justify-content: flex-end; }
    .volume-group { display: flex; align-items: center; gap: 8px; }
    .volume-slider { width: 70px; height: 4px; accent-color: var(--accent-primary); cursor: pointer; }

    #queue-drawer {
      position: fixed; top: 70px; right: -360px; bottom: var(--player-height); width: 340px;
      background: rgba(17, 20, 32, 0.98); backdrop-filter: blur(20px); border-left: 1px solid var(--border-glass);
      z-index: 45; padding: 20px; display: flex; flex-direction: column; gap: 16px; transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    #queue-drawer.open { right: 0; }
    .queue-header { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-glass); padding-bottom: 12px; }
    .queue-list { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; }

    .loader-container { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 0; gap: 16px; color: var(--text-secondary); grid-column: 1 / -1; }
    .spinner { width: 36px; height: 36px; border: 3px solid rgba(255, 255, 255, 0.1); border-top-color: var(--accent-primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 920px) {
      #sidebar { position: fixed; top: 0; bottom: 0; left: 0; transform: translateX(-100%); width: 280px; max-width: 82vw; }
      #sidebar.open { transform: translateX(0); }
      .mobile-menu-btn { display: block; }
      .volume-group { display: none; }
      #content-stage { padding: 12px 12px calc(var(--player-height) + 16px) 12px; }
      .player-left { width: 150px; min-width: 0; }
      .player-right { width: auto; min-width: 0; }
      .jump-btn { display: none; }
    }
  </style>
</head>
<body>

  <div id="app-container">
    <div id="sidebar-backdrop"></div>
    <aside id="sidebar">
      <div class="brand-section">
        <div class="brand-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2"><circle cx="12" cy="12" r="2"/><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9M19.1 4.9C23 8.8 23 15.1 19.1 19"/></svg>
        </div>
        <div class="live-badge" id="live-badge-container">
          <span class="live-dot"></span>
          <span id="player-status-badge">STREAM DIRECT</span>
        </div>
      </div>

      <nav class="nav-tabs">
        <div class="nav-item active" id="tab-radio">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="2"/><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9M19.1 4.9C23 8.8 23 15.1 19.1 19"/></svg>
          <span>Radios du Monde</span>
        </div>
        <div class="nav-item" id="tab-radio-fav">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.72-8.72 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          <span>Favoris Radios</span>
          <span id="fav-radio-badge" class="badge-counter" style="background:rgba(239,68,68,0.2); color:#fca5a5;">0</span>
        </div>

        <div class="nav-item" id="tab-tv" style="margin-top:2px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>
          <span>Télévision TV (Direct TNT)</span>
        </div>

        <div class="nav-item" id="tab-pluto" style="margin-top:2px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <span>Pluto TV (Direct 24/7)</span>
          <span id="pluto-badge" class="badge-counter" style="background:rgba(245,158,11,0.2); color:#fde047;">100+</span>
        </div>

        <div class="nav-item" id="tab-tv-fav">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.72-8.72 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          <span>Favoris TV</span>
          <span id="fav-tv-badge" class="badge-counter" style="background:rgba(6,182,212,0.2); color:#67e8f9;">0</span>
        </div>

        <div class="nav-item" id="tab-podcasts" style="margin-top:2px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
          <span>Podcasts & Replays</span>
        </div>

        <div class="nav-item" id="tab-podcast-subs">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          <span>Podcasts Suivis</span>
          <span id="sub-podcast-badge" class="badge-counter" style="background:rgba(168,85,247,0.2); color:#d8b4fe;">0</span>
        </div>
      </nav>

      <div class="sidebar-filters">
        <div class="filter-group-title">Pays / Régions</div>
        <div class="filter-chips" id="country-filters">
          <button class="chip active" data-filter="FR">France</button>
          <button class="chip" data-filter="GLOBAL">Monde</button>
          <button class="chip" data-filter="US">États-Unis</button>
          <button class="chip" data-filter="GB">Royaume-Uni</button>
          <button class="chip" data-filter="CA">Canada</button>
          <button class="chip" data-filter="BE">Belgique</button>
          <button class="chip" data-filter="CH">Suisse</button>
        </div>

        <div class="filter-group-title" style="margin-top:8px;">Thématiques / Genres</div>
        <div class="filter-chips" id="genre-filters">
          <button class="chip active" data-genre="all">Tous</button>
          <button class="chip" data-genre="news">Info / Histoire</button>
          <button class="chip" data-genre="science">Science / Tech</button>
          <button class="chip" data-genre="crime">True Crime</button>
          <button class="chip" data-genre="culture">Culture / Art</button>
          <button class="chip" data-genre="humor">Humour</button>
        </div>
      </div>
    </aside>

    <div id="main-wrapper">
      <header class="top-header">
        <button class="mobile-menu-btn" id="mobile-toggle" aria-label="Menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>

        <div class="search-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" id="global-search" class="search-input" placeholder="Rechercher une radio, TV ou podcast...">
        </div>

        <div class="header-actions">
          <button class="btn-header-action" id="btn-toggle-queue" title="Ouvrir la file d'attente">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            <span>File d'Attente</span>
            <span id="queue-badge" style="background:var(--accent-primary); color:#fff; font-size:0.65rem; padding:1px 6px; border-radius:10px; font-weight:700;">0</span>
          </button>
        </div>
      </header>

      <main id="content-stage">
        <section id="theater-stage">
          <div class="stage-hud-top hud-element" id="stage-hud-top">
            <span class="stage-title-hud" id="stage-title">Sélectionnez un média</span>
            <div class="stage-controls-hud">
              <select id="anim-preset-select" class="stage-btn" title="Animation visuelle">
                <option value="cyber">⚡ Spectre Cyber (2D)</option>
                <option value="particles">✨ Particules Pulse (2D)</option>
                <option value="aurora">🌌 Aurore Floue (2D)</option>
                <option value="hyperdrive">🚀 Hyperdrive (3D)</option>
                <option value="sphere">🌐 Sphère Cyber (3D)</option>
                <option value="synthwave">🌅 Grille Synthwave (3D)</option>
                <option value="vortex">🌀 Vortex Quantique (3D)</option>
                <option value="matrix">🧊 Cubes Matrice (3D)</option>
                <option value="neon_tunnel">💠 Tunnel Néon (3D)</option>
                <option value="blackhole">🪐 Trou Noir Cosmique (3D)</option>
                <option value="dna">🧬 Double Hélice (3D)</option>
                <option value="fireworks">🎆 Feux d'Artifice (3D)</option>
                <option value="ocean">🌊 Océan Digital (3D)</option>
                <option value="cybercity">🏙️ Cité Cyberpunk (3D)</option>
                <option value="stargate">🌀 Porte des Étoiles (3D)</option>
                <option value="eclipse">☀️ Éclipse Solaire (3D)</option>
                <option value="tesseract">💎 Tesseract 4D (3D)</option>
                <option value="nebula">🌌 Nébuleuse & Pulsar (3D)</option>
              </select>
              <button class="stage-btn" id="btn-stage-fullscreen" title="Plein écran total [F]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
                Plein Écran
              </button>
            </div>
          </div>

          <div class="video-viewport" id="video-viewport-wrapper">
            <canvas id="visualizer-canvas-3d" class="canvas-layer"></canvas>
            <canvas id="visualizer-canvas-2d" class="canvas-layer"></canvas>
            <video id="unified-media" playsinline></video>

            <div id="audio-overlay" class="audio-visualizer-overlay hud-element">
              <div class="audio-cover">
                <img id="stage-cover-img" src="" alt="" style="display:none;">
                <svg id="stage-cover-fallback" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
              </div>
            </div>
          </div>
        </section>

        <h2 id="catalog-heading" style="font-size:1.15rem; font-weight:700;">Radios Populaires</h2>
        <div id="episodes-container"></div>
        <div id="stations-grid" class="cards-grid"></div>
      </main>

      <div id="queue-drawer">
        <div class="queue-header">
          <h3 style="font-size:1rem; font-weight:700;">File d'Attente ("À Suivre")</h3>
          <button class="btn-action-sm" id="btn-clear-queue">Vider</button>
        </div>
        <div class="queue-list" id="queue-items-list">
          <p style="color:var(--text-secondary); font-size:0.85rem;">Aucun épisode dans la file d'attente.</p>
        </div>
      </div>
    </div>

    <footer id="sticky-player">
      <div class="player-scrub-container">
        <span class="time-label" id="time-current">00:00</span>
        <input type="range" class="scrub-slider" id="scrub-range" min="0" max="100" value="0">
        <span class="time-label right" id="time-duration">00:00</span>
      </div>

      <div class="player-main-row">
        <div class="player-left">
          <div class="player-thumb">
            <img id="player-thumb-img" src="" style="display:none;">
            <svg id="player-thumb-fallback" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/></svg>
          </div>
          <div style="overflow:hidden;">
            <div id="player-title" style="font-weight:600; font-size:0.88rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">En attente</div>
            <div id="player-subtitle" style="font-size:0.75rem; color:var(--text-secondary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">Direct Stream</div>
          </div>
        </div>

        <div class="player-controls">
          <button class="jump-btn" id="btn-skip-back" title="Reculer de 10s">-10s</button>
          <button class="ctrl-btn play-main" id="btn-play-pause" title="Lecture / Pause">
            <svg id="icon-play" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            <svg id="icon-pause" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="display:none;"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
          </button>
          <button class="jump-btn" id="btn-skip-forward" title="Avancer de 30s">+30s</button>
          <button class="speed-btn" id="btn-speed-toggle" title="Vitesse de lecture">1×</button>
        </div>

        <div class="player-right">
          <div class="volume-group">
            <button class="ctrl-btn" id="btn-volume-toggle" title="Couper/Activer le son">
              <svg id="icon-vol-high" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
              <svg id="icon-vol-mute" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:none;"><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/></svg>
            </button>
            <input type="range" class="volume-slider" id="volume-range" min="0" max="1" step="0.01" value="0.8">
          </div>

          <button class="ctrl-btn" id="btn-fullscreen" title="Plein Écran Total [F]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
          </button>
        </div>
      </div>
    </footer>
  </div>

  <script>
    const BACKUP_STATIONS = {
      FR_RADIO: [
        { id: 'vibration', name: 'Vibration', url: 'https://vibration.ice.infomaniak.ch/vibration-high.mp3', logo: 'https://upload.wikimedia.org/wikipedia/fr/4/4e/Vibration_logo_2020.png', country: 'FR', tags: 'Pop, Hits, Régionale', type: 'audio' },
        { id: 'forum', name: 'Forum', url: 'https://forum.ice.infomaniak.ch/forum-high.mp3', logo: 'https://upload.wikimedia.org/wikipedia/fr/f/f6/Forum_logo_2020.png', country: 'FR', tags: 'Pop Rock, Gold, Régionale', type: 'audio' },
        { id: 'alouette', name: 'Alouette', url: 'https://alouette.ice.infomaniak.ch/alouette-high.mp3', logo: 'https://upload.wikimedia.org/wikipedia/fr/0/01/Alouette_logo_2020.png', country: 'FR', tags: 'Pop, Hits, Régionale', type: 'audio' },
        { id: 'hitwest', name: 'Hit West', url: 'https://hitwest.ice.infomaniak.ch/hitwest-high.mp3', logo: 'https://upload.wikimedia.org/wikipedia/fr/0/0e/Hit_West_logo.png', country: 'FR', tags: 'Pop, Hits, Ouest', type: 'audio' },
        { id: 'franceinter', name: 'France Inter', url: 'https://icecast.radiofrance.fr/franceinter-midfi.mp3', logo: 'https://www.radiofrance.fr/assets/images/brands/franceinter.svg', country: 'FR', tags: 'Généraliste, News, Talk', type: 'audio' },
        { id: 'franceinfo', name: 'France Info', url: 'https://icecast.radiofrance.fr/franceinfo-midfi.mp3', logo: 'https://www.radiofrance.fr/assets/images/brands/franceinfo.svg', country: 'FR', tags: 'News, Actualité, Info', type: 'audio' },
        { id: 'fip', name: 'FIP Radio', url: 'https://icecast.radiofrance.fr/fip-midfi.mp3', logo: 'https://www.radiofrance.fr/assets/images/brands/fip.svg', country: 'FR', tags: 'Éclectique, Culture, Jazz', type: 'audio' },
        { id: 'franceculture', name: 'France Culture', url: 'https://icecast.radiofrance.fr/franceculture-midfi.mp3', logo: 'https://www.radiofrance.fr/assets/images/brands/franceculture.svg', country: 'FR', tags: 'Culture, Débat, Histoire', type: 'audio' },
        { id: 'rtl', name: 'RTL France', url: 'https://icecast.rtl.fr/rtl-1-44-128?listen=webcMediaContainer', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/RTL_logo_2021.svg', country: 'FR', tags: 'Généraliste, Talk, News', type: 'audio' },
        { id: 'europe1', name: 'Europe 1', url: 'https://stream.europe1.fr/europe1.mp3', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c9/Europe_1_logo_2010.svg', country: 'FR', tags: 'Info, Talk, Actualité', type: 'audio' },
        { id: 'rmc', name: 'RMC Info Talk Sport', url: 'https://rmc.ice.infomaniak.ch/rmc-high.mp3', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/23/RMC_logo_2022.svg', country: 'FR', tags: 'Info, Sport, Talk', type: 'audio' },
        { id: 'nrj', name: 'NRJ France', url: 'https://cdn.nrjaudio.fm/audio/nrj/fr/30001/mp3_128.mp3', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e8/NRJ_logo.svg', country: 'FR', tags: 'Pop, Hits, Musique', type: 'audio' },
        { id: 'skyrock', name: 'Skyrock', url: 'https://icecast.skyrock.net/s/natio_mp3_128k', logo: 'https://upload.wikimedia.org/wikipedia/fr/5/52/Skyrock_logo.svg', country: 'FR', tags: 'Rap, Urban, Musique', type: 'audio' },
        { id: 'funradio', name: 'Fun Radio', url: 'https://icecast.funradio.fr/fun-1-44-128?listen=webcMediaContainer', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c3/Fun_Radio_logo_2020.svg', country: 'FR', tags: 'Dance, Electro, Humour', type: 'audio' },
        { id: 'radiofg', name: 'Radio FG', url: 'https://radiofg.ice.infomaniak.ch/radiofg-high.mp3', logo: 'https://upload.wikimedia.org/wikipedia/commons/3/36/Radio_FG_logo_2018.svg', country: 'FR', tags: 'Electro, House, Club', type: 'audio' },
        { id: 'tsfjazz', name: 'TSF Jazz', url: 'https://tsfjazz.ice.infomaniak.ch/tsfjazz-high.mp3', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c3/TSF_Jazz_logo.svg', country: 'FR', tags: 'Jazz, Blues, Culture', type: 'audio' },
        { id: 'radionova', name: 'Radio Nova', url: 'https://novazz.ice.infomaniak.ch/novazz-128.mp3', logo: 'https://upload.wikimedia.org/wikipedia/fr/1/1b/Radio_Nova_logo.svg', country: 'FR', tags: 'Indie, World, Musique', type: 'audio' },
        { id: 'ouifm', name: 'OUI FM', url: 'https://ouifm.ice.infomaniak.ch/ouifm-high.mp3', logo: 'https://upload.wikimedia.org/wikipedia/fr/6/6d/OU%C3%AF_FM_logo.png', country: 'FR', tags: 'Rock, Pop Rock', type: 'audio' }
      ],
      FR_TV: [
        { id: 'tv_france24', name: 'France 24 Direct (FR)', url: 'https://static.france24.com/live/F24_FR_LO_HLS/live_tv.m3u8', logo: 'https://upload.wikimedia.org/wikipedia/fr/4/4e/France_24_logo_2013.svg', country: 'FR', tags: 'News, Info, Actualité', type: 'video' },
        { id: 'tv_arte', name: 'ARTE Journal Live', url: 'https://artesimulcast.akamaized.net/hls/live/2031003/artelive_fr/index.m3u8', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/07/Logo_Arte.svg', country: 'FR', tags: 'Culture, Science, Documentaire', type: 'video' },
        { id: 'tv_bfmtv', name: 'BFM TV Live', url: 'https://bfmtv-live.bfmtv.biz/hls/live/2033626/bfmtv/index.m3u8', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/69/BFMTV_logo_2019.svg', country: 'FR', tags: 'News, Info, Actualité', type: 'video' },
        { id: 'tv_euronews', name: 'Euronews Français', url: 'https://euronews-euronews-french-1-fr.samsung.wurl.tv/playlist.m3u8', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/02/Euronews_2016_logo.svg', country: 'FR', tags: 'News, Europe, Info', type: 'video' },
        { id: 'tv_tv5monde', name: 'TV5Monde Info', url: 'https://ott.tv5monde.com/Content/HLS/Live/channel(info)/stream.m3u8', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/TV5Monde_logo.svg', country: 'FR', tags: 'Culture, News, Francophonie', type: 'video' },
        { id: 'tv_cnews', name: 'CNEWS Direct', url: 'https://cnews-hls.live.canalplus.com/live/hls/cnews-app/index.m3u8', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/9b/CNews_logo.svg', country: 'FR', tags: 'News, Info, Débat', type: 'video' },
        { id: 'tv_kto', name: 'KTO TV Direct', url: 'https://ktotv.akamaized.net/hls/live/2033507/ktotv/index.m3u8', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/Logo_KTO.svg', country: 'FR', tags: 'Culture, Histoire', type: 'video' }
      ]
    };

    class FavoritesStore {
      constructor(onChange) { this.onChange = onChange; this.radioFavs = new Map(); this.tvFavs = new Map(); this.loadLocal(); }
      loadLocal() {
        try {
          const storedRadio = localStorage.getItem('omni_favs_radio'); if (storedRadio) JSON.parse(storedRadio).forEach(i => this.radioFavs.set(i.id, i));
          const storedTv = localStorage.getItem('omni_favs_tv'); if (storedTv) JSON.parse(storedTv).forEach(i => this.tvFavs.set(i.id, i));
        } catch (e) {}
      }
      saveLocal() {
        try {
          localStorage.setItem('omni_favs_radio', JSON.stringify(Array.from(this.radioFavs.values())));
          localStorage.setItem('omni_favs_tv', JSON.stringify(Array.from(this.tvFavs.values())));
        } catch (e) {}
      }
      toggle(station) {
        if (!station || !station.id) return false;
        const isTv = station.type === 'video' || station.type === 'tv';
        const targetMap = isTv ? this.tvFavs : this.radioFavs;
        const exists = targetMap.has(station.id);
        if (exists) targetMap.delete(station.id); else targetMap.set(station.id, station);
        this.saveLocal(); if (this.onChange) this.onChange();
        return !exists;
      }
      isFav(id, type) { return (type === 'video' || type === 'tv') ? this.tvFavs.has(id) : this.radioFavs.has(id); }
      getRadioFavs() { return Array.from(this.radioFavs.values()); }
      getTvFavs() { return Array.from(this.tvFavs.values()); }
    }

    class PlutoTVService {
      constructor() { this.deviceId = this.getDeviceId(); }
      getDeviceId() {
        let id = localStorage.getItem('omni_pluto_device_id');
        if (!id) {
          id = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            let r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8); return v.toString(16);
          });
          localStorage.setItem('omni_pluto_device_id', id);
        }
        return id;
      }
      buildPlutoStreamUrl(rawStreamUrl) {
        if (!rawStreamUrl) return '';
        const sid = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : 'sid_' + Math.random().toString(36).substring(2);
        const sep = rawStreamUrl.includes('?') ? '&' : '?';
        return `${rawStreamUrl}${sep}sid=${sid}&deviceType=web&deviceMake=Chrome&deviceModel=web&deviceVersion=1.0.0`;
      }
      async getPlutoChannels(search = '', genre = 'all') {
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 4000);
          const m3uUrl = 'https://raw.githubusercontent.com/iptv-org/iptv/master/streams/fr_pluto.m3u';
          const res = await fetch(m3uUrl, { signal: controller.signal });
          clearTimeout(timer);
          if (res.ok) {
            const text = await res.text();
            const parsed = this.parsePlutoM3U(text);
            if (parsed && parsed.length > 0) {
              return parsed.filter(ch => {
                const matchSearch = !search || ch.name.toLowerCase().includes(search.toLowerCase()) || ch.tags.toLowerCase().includes(search.toLowerCase());
                const matchGenre = genre === 'all' || ch.category.includes(genre.toLowerCase()) || ch.tags.toLowerCase().includes(genre.toLowerCase());
                return matchSearch && matchGenre;
              });
            }
          }
        } catch (e) {}
        return this.getBackupPlutoChannels(search, genre);
      }
      parsePlutoM3U(content) {
        const lines = content.split('\n');
        const list = [];
        let item = null;
        for (let rawLine of lines) {
          const line = rawLine.trim();
          if (line.startsWith('#EXTINF:')) {
            const name = (line.match(/,(.+)$/) || [])[1] || 'Pluto TV';
            const logo = (line.match(/tvg-logo="([^"]*)"/) || [])[1] || '';
            const group = (line.match(/group-title="([^"]*)"/) || [])[1] || 'Pluto TV 24/7';
            const cleanId = `pluto_${name.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
            item = { id: cleanId, name: name.trim(), logo, country: 'FR', tags: group, type: 'video', category: group.toLowerCase() };
          } else if (line && !line.startsWith('#') && item) {
            item.url = line;
            item.rawStreamUrl = line;
            list.push(item);
            item = null;
          }
        }
        return list;
      }
      getBackupPlutoChannels(search = '', genre = 'all') {
        const backupPluto = [
          { id: 'pluto_daria', rawId: '5f9b177d8e37600007cdb3c8', rawStreamUrl: 'https://stitcher.pluto.tv/stitch/hls/channel/5f9b177d8e37600007cdb3c8/master.m3u8', name: 'Daria 24/7', logo: 'https://images.pluto.tv/channels/5f9b177d8e37600007cdb3c8/colorLogoPNG.png', country: 'FR', tags: 'Animation, Séries', type: 'video', category: 'humor' },
          { id: 'pluto_cine', rawId: '5d8b894ec4e3d3000969678c', rawStreamUrl: 'https://stitcher.pluto.tv/stitch/hls/channel/5d8b894ec4e3d3000969678c/master.m3u8', name: 'Pluto TV Ciné', logo: 'https://images.pluto.tv/channels/5d8b894ec4e3d3000969678c/colorLogoPNG.png', country: 'FR', tags: 'Films 24/7, Cinema', type: 'video', category: 'culture' },
          { id: 'pluto_southpark', rawId: '5fa016c68e37600007cdbf83', rawStreamUrl: 'https://stitcher.pluto.tv/stitch/hls/channel/5fa016c68e37600007cdbf83/master.m3u8', name: 'South Park 24/7', logo: 'https://images.pluto.tv/channels/5fa016c68e37600007cdbf83/colorLogoPNG.png', country: 'FR', tags: 'Séries, Humour', type: 'video', category: 'humor' },
          { id: 'pluto_anime', rawId: '5fa0165c8e37600007cdbf6e', rawStreamUrl: 'https://stitcher.pluto.tv/stitch/hls/channel/5fa0165c8e37600007cdbf6e/master.m3u8', name: 'Pluto TV Anime', logo: 'https://images.pluto.tv/channels/5fa0165c8e37600007cdbf6e/colorLogoPNG.png', country: 'FR', tags: 'Animation, Manga', type: 'video', category: 'culture' },
          { id: 'pluto_crime', rawId: '5d8b89cfc4e3d300096967be', rawStreamUrl: 'https://stitcher.pluto.tv/stitch/hls/channel/5d8b89cfc4e3d300096967be/master.m3u8', name: 'Pluto TV Crime', logo: 'https://images.pluto.tv/channels/5d8b89cfc4e3d300096967be/colorLogoPNG.png', country: 'FR', tags: 'True Crime, Investigation', type: 'video', category: 'crime' }
        ];
        return backupPluto.filter(ch => {
          const matchSearch = !search || ch.name.toLowerCase().includes(search.toLowerCase()) || ch.tags.toLowerCase().includes(search.toLowerCase());
          const matchGenre = genre === 'all' || ch.category === genre || ch.tags.toLowerCase().includes(genre.toLowerCase());
          return matchSearch && matchGenre;
        });
      }
    }

    class MediaFetcher {
      constructor() { this.pluto = new PlutoTVService(); }
      async getPlutoTV(search = '', genre = 'all') { return await this.pluto.getPlutoChannels(search, genre); }
      async getRadios(country = 'FR', genre = 'all', search = '') {
        const backups = BACKUP_STATIONS.FR_RADIO || [];
        let fetchedList = [];
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 3500);
          const countryParam = country === 'GLOBAL' ? '' : `bycountrycodeexact/${country.toLowerCase()}`;
          const apiUrl = `https://de1.api.radio-browser.info/json/stations/${countryParam}?order=clickcount&reverse=true&limit=60`;
          const res = await fetch(apiUrl, { signal: controller.signal });
          clearTimeout(timer);
          if (res.ok) {
            const data = await res.json();
            fetchedList = data
              .filter(st => st.url_resolved && (st.codec === 'MP3' || st.codec === 'AAC' || st.url_resolved.endsWith('.mp3')))
              .map(st => ({
                id: `rb_${st.stationuuid}`,
                name: st.name ? st.name.trim() : 'Radio',
                url: st.url_resolved.startsWith('http://') ? st.url_resolved.replace('http://', 'https://') : st.url_resolved,
                logo: st.favicon || '',
                country: country,
                tags: st.tags ? st.tags.split(',').slice(0, 3).join(', ') : 'Radio Live',
                type: 'audio'
              }));
          }
        } catch (e) {}

        const combined = [...backups, ...fetchedList];
        const uniqueMap = new Map();
        combined.forEach(st => {
          if (st && st.name) {
            const key = st.name.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (!uniqueMap.has(key)) uniqueMap.set(key, st);
          }
        });

        return Array.from(uniqueMap.values()).filter(st => {
          const matchSearch = !search || st.name.toLowerCase().includes(search.toLowerCase()) || st.tags.toLowerCase().includes(search.toLowerCase());
          let matchGenre = (genre === 'all');
          if (!matchGenre) {
            const tagLower = (st.tags || '').toLowerCase();
            const nameLower = (st.name || '').toLowerCase();
            matchGenre = tagLower.includes(genre.toLowerCase()) || nameLower.includes(genre.toLowerCase());
          }
          return matchSearch && matchGenre;
        });
      }

      async getTV(country = 'FR', genre = 'all', search = '') {
        const backups = BACKUP_STATIONS.FR_TV || [];
        let fetchedList = [];
        if (country === 'FR' || country === 'GLOBAL') {
          try {
            const countryM3uUrl = 'https://iptv-org.github.io/iptv/countries/fr.m3u';
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 3500);
            const res = await fetch(countryM3uUrl, { signal: controller.signal });
            clearTimeout(timer);
            if (res.ok) {
              const text = await res.text();
              fetchedList = this.parseM3U(text, search, country);
            }
          } catch (e) {}
        }

        const combined = [...fetchedList, ...backups];
        const uniqueMap = new Map();
        combined.forEach(item => {
          if (item && item.name) {
            const key = item.name.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (!uniqueMap.has(key)) uniqueMap.set(key, item);
          }
        });

        return Array.from(uniqueMap.values()).filter(st => {
          const matchSearch = !search || st.name.toLowerCase().includes(search.toLowerCase()) || st.tags.toLowerCase().includes(search.toLowerCase());
          let matchGenre = (genre === 'all');
          if (!matchGenre) {
            const tagLower = (st.tags || '').toLowerCase();
            const nameLower = (st.name || '').toLowerCase();
            matchGenre = tagLower.includes(genre.toLowerCase()) || nameLower.includes(genre.toLowerCase());
          }
          return matchSearch && matchGenre;
        });
      }

      parseM3U(content, search = '', country = 'FR') {
        const lines = content.split('\n');
        const list = [];
        let item = null;
        for (let rawLine of lines) {
          const line = rawLine.trim();
          if (line.startsWith('#EXTINF:')) {
            const name = (line.match(/,(.+)$/) || [])[1] || 'Chaîne TV';
            const logo = (line.match(/tvg-logo="([^"]*)"/) || [])[1] || '';
            const group = (line.match(/group-title="([^"]*)"/) || [])[1] || 'TV Direct';
            const cleanId = `tv_${name.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
            item = { id: cleanId, name, logo, country, tags: group, type: 'video' };
          } else if (line && !line.startsWith('#') && item) {
            item.url = line;
            if (!search || item.name.toLowerCase().includes(search.toLowerCase())) list.push(item);
            item = null;
          }
          if (list.length >= 120) break;
        }
        return list;
      }
    }

    class VisualizerEngine {
      constructor(canvas2D, canvas3D, audioElement) {
        this.c2d = canvas2D;
        this.ctx2d = canvas2D ? canvas2D.getContext('2d') : null;
        this.c3d = canvas3D;
        this.audioEl = audioElement;
        this.preset = 'cyber';
        this.isRunning = false;
        this.animFrameId = null;
        this.initThreeJS();
        this.resize();
        window.addEventListener('resize', () => this.resize());
      }

      getFrequencyData() {
        const isPlaying = this.audioEl && !this.audioEl.paused && !this.audioEl.ended;
        const fakeData = new Uint8Array(32);
        const time = Date.now() * 0.003;
        const mult = isPlaying ? 1.0 : 0.45;
        for (let i = 0; i < 32; i++) {
          const val = Math.sin(time * 2.5 + i * 0.35) * 0.5 + 0.5;
          const beat = Math.pow(Math.sin(time * 1.8), 4) * 0.5;
          fakeData[i] = Math.min(255, Math.floor((val * 0.5 + beat) * 220 * mult + (isPlaying ? 35 : 15)));
        }
        return fakeData;
      }

      resize() {
        const parent = this.c3d ? this.c3d.parentElement : null;
        let w = (parent && parent.offsetWidth) || window.innerWidth || 800;
        let h = (parent && parent.offsetHeight) || 450;
        if (w <= 0) w = 800;
        if (h <= 0) h = 450;

        if (this.c2d) { this.c2d.width = w; this.c2d.height = h; }
        if (this.renderer && this.c3d) {
          this.renderer.setSize(w, h, false);
          this.camera.aspect = w / h;
          this.camera.updateProjectionMatrix();
        }
      }

      initThreeJS() {
        try {
          if (typeof THREE === 'undefined' || !this.c3d) return;
          this.scene = new THREE.Scene();
          this.camera = new THREE.PerspectiveCamera(60, 16 / 9, 0.1, 1000);
          this.camera.position.z = 50;
          this.renderer = new THREE.WebGLRenderer({ canvas: this.c3d, alpha: true, antialias: true });
          this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

          this.meshGroups = {};

          const sphereGroup = new THREE.Group();
          const sphereGeo = new THREE.IcosahedronGeometry(14, 2);
          const sphereMat = new THREE.MeshBasicMaterial({ color: 0x6366f1, wireframe: true, transparent: true, opacity: 0.85 });
          this.sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
          sphereGroup.add(this.sphereMesh);
          this.meshGroups['sphere'] = sphereGroup;

          const hyperGroup = new THREE.Group();
          const starGeo = new THREE.BufferGeometry();
          const starCount = 800;
          const starPos = new Float32Array(starCount * 3);
          for (let i = 0; i < starCount * 3; i += 3) {
            starPos[i] = (Math.random() - 0.5) * 300;
            starPos[i + 1] = (Math.random() - 0.5) * 300;
            starPos[i + 2] = (Math.random() - 0.5) * 600;
          }
          starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
          const starMat = new THREE.PointsMaterial({ color: 0xa855f7, size: 2.2, transparent: true });
          this.starPoints = new THREE.Points(starGeo, starMat);
          hyperGroup.add(this.starPoints);
          this.meshGroups['hyperdrive'] = hyperGroup;

          Object.values(this.meshGroups).forEach(g => { g.visible = false; this.scene.add(g); });
          this.update3DVisibility();
        } catch (e) {}
      }

      setPreset(preset) {
        this.preset = preset;
        const is3D = ['hyperdrive', 'sphere'].includes(preset);
        if (this.c2d) this.c2d.style.display = is3D ? 'none' : 'block';
        if (this.c3d) this.c3d.style.display = is3D ? 'block' : 'none';
        this.update3DVisibility();
        this.resize();
      }

      update3DVisibility() {
        if (!this.meshGroups) return;
        Object.keys(this.meshGroups).forEach(k => { this.meshGroups[k].visible = (k === this.preset); });
      }

      start() {
        this.isRunning = true;
        this.setPreset(this.preset);
        this.resize();
        this.startLoop();
      }

      stop() {
        this.isRunning = false;
        if (this.animFrameId) {
          cancelAnimationFrame(this.animFrameId);
          this.animFrameId = null;
        }
      }

      startLoop() {
        if (this.animFrameId) { cancelAnimationFrame(this.animFrameId); }

        const animate = () => {
          if (!this.isRunning) return;
          this.animFrameId = requestAnimationFrame(animate);

          const freqs = this.getFrequencyData();
          const bass = (freqs[0] + freqs[1] + freqs[2]) / 3;
          const w = this.c2d ? this.c2d.width : 0;
          const h = this.c2d ? this.c2d.height : 0;

          if (this.c2d && this.c2d.style.display !== 'none' && w && h) {
            this.ctx2d.clearRect(0, 0, w, h);
            const bars = 28;
            const barW = (w / bars) - 4;
            for (let i = 0; i < bars; i++) {
              const fVal = freqs[i % freqs.length] / 255;
              const bh = fVal * (h * 0.55) + 12;
              const x = i * (barW + 4) + 2;
              const y = h - bh;
              this.ctx2d.fillStyle = '#6366f1';
              this.ctx2d.fillRect(x, y, barW, bh);
            }
          }

          if (this.scene && this.c3d && this.c3d.style.display !== 'none') {
            if (this.sphereMesh) {
              this.sphereMesh.rotation.y += 0.01;
              const scale = 1 + (bass / 255) * 0.4;
              this.sphereMesh.scale.set(scale, scale, scale);
            }
            this.renderer.render(this.scene, this.camera);
          }
        };
        animate();
      }
    }

    class AppController {
      constructor() {
        this.fetcher = new MediaFetcher();
        this.currentTab = 'radio';
        this.currentCountry = 'FR';
        this.currentGenre = 'all';
        this.stations = [];
        this.activeStationIndex = -1;

        this.favStore = new FavoritesStore(() => this.updateBadgesUI());

        this.initDOM();
        this.visualizer = new VisualizerEngine(this.canvas2D, this.canvas3D, this.media);
        this.bindEvents();
        this.initFullscreenAndHUD();
        this.updateBadgesUI();
        this.loadCatalog();
      }

      initDOM() {
        this.grid = document.getElementById('stations-grid');
        this.theater = document.getElementById('theater-stage');
        this.media = document.getElementById('unified-media');
        this.sidebar = document.getElementById('sidebar');
        this.audioOverlay = document.getElementById('audio-overlay');
        this.canvas2D = document.getElementById('visualizer-canvas-2d');
        this.canvas3D = document.getElementById('visualizer-canvas-3d');
      }

      unlockAudio() {
        if (!this.media) return;
        this.media.muted = false;
        if (!this.media.volume) this.media.volume = 0.8;
      }

      bindEvents() {
        const backdrop = document.getElementById('sidebar-backdrop');
        const closeSidebarMobile = () => {
          this.sidebar.classList.remove('open');
          if (backdrop) backdrop.classList.remove('open');
        };

        document.getElementById('mobile-toggle').onclick = () => {
          const isOpen = this.sidebar.classList.toggle('open');
          if (backdrop) backdrop.classList.toggle('open', isOpen);
        };
        if (backdrop) backdrop.onclick = closeSidebarMobile;

        ['radio', 'radio-fav', 'tv', 'pluto', 'tv-fav'].forEach(tabId => {
          const el = document.getElementById(`tab-${tabId}`);
          if (el) {
            el.addEventListener('click', () => {
              this.switchTab(tabId);
              if (window.innerWidth <= 920) closeSidebarMobile();
            });
          }
        });

        document.getElementById('btn-play-pause').onclick = () => {
          this.unlockAudio();
          if (this.media.paused) this.media.play(); else this.media.pause();
        };

        document.getElementById('volume-range').oninput = (e) => { this.media.volume = parseFloat(e.target.value); };
        document.getElementById('btn-volume-toggle').onclick = () => {
          this.media.muted = !this.media.muted;
          document.getElementById('icon-vol-high').style.display = this.media.muted ? 'none' : 'block';
          document.getElementById('icon-vol-mute').style.display = this.media.muted ? 'block' : 'none';
        };

        this.media.onplay = () => {
          document.getElementById('icon-play').style.display = 'none';
          document.getElementById('icon-pause').style.display = 'block';
        };
        this.media.onpause = () => {
          document.getElementById('icon-play').style.display = 'block';
          document.getElementById('icon-pause').style.display = 'none';
        };
      }

      updateMetadata(title, subtitle, logo) {
        document.getElementById('player-title').textContent = title || 'Sans titre';
        document.getElementById('player-subtitle').textContent = subtitle || 'Direct Stream';
        document.getElementById('stage-title').textContent = title || 'OmniStream';

        const stageImg = document.getElementById('stage-cover-img');
        const stageFallback = document.getElementById('stage-cover-fallback');
        const playerImg = document.getElementById('player-thumb-img');
        const playerFallback = document.getElementById('player-thumb-fallback');

        if (logo) {
          stageImg.src = logo; stageImg.style.display = 'block';
          if (stageFallback) stageFallback.style.display = 'none';
          playerImg.src = logo; playerImg.style.display = 'block';
          if (playerFallback) playerFallback.style.display = 'none';
        } else {
          stageImg.style.display = 'none'; if (stageFallback) stageFallback.style.display = 'block';
          playerImg.style.display = 'none'; if (playerFallback) playerFallback.style.display = 'block';
        }
      }

      switchTab(tab) {
        this.currentTab = tab;
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        document.getElementById(`tab-${tab}`).classList.add('active');

        const heading = document.getElementById('catalog-heading');
        if (tab === 'radio') heading.textContent = 'Radios Populaires';
        else if (tab === 'tv') heading.textContent = 'Télévision TV Direct (TNT)';
        else if (tab === 'pluto') heading.textContent = 'Pluto TV 24/7';

        this.loadCatalog();
      }

      async loadCatalog(search = '') {
        this.grid.style.display = 'grid';
        this.grid.innerHTML = '<div class="loader-container"><div class="spinner"></div><p>Chargement en cours...</p></div>';

        if (this.currentTab === 'radio') this.stations = await this.fetcher.getRadios(this.currentCountry, this.currentGenre, search);
        else if (this.currentTab === 'tv') this.stations = await this.fetcher.getTV(this.currentCountry, this.currentGenre, search);
        else if (this.currentTab === 'pluto') this.stations = await this.fetcher.getPlutoTV(search, this.currentGenre);
        else if (this.currentTab === 'radio-fav') this.stations = this.favStore.getRadioFavs();
        else if (this.currentTab === 'tv-fav') this.stations = this.favStore.getTvFavs();

        this.renderGrid();
      }

      renderGrid() {
        if (!this.stations || !this.stations.length) {
          this.grid.innerHTML = '<div class="loader-container"><p>Aucun contenu trouvé dans cette catégorie.</p></div>';
          return;
        }

        this.grid.innerHTML = this.stations.map((s, i) => {
          const isFav = this.favStore.isFav(s.id, s.type);
          const safeName = (s.name || 'Média').replace(/"/g, '&quot;');
          const initials = (s.name || 'TV').substring(0, 3).toUpperCase();

          return `
            <div class="station-card ${this.activeStationIndex === i ? 'is-playing' : ''}" onclick="app.handleCardClick(${i})">
              <button class="card-fav-btn ${isFav ? 'is-fav' : ''}" onclick="event.stopPropagation(); app.toggleFavByCard(${i})" title="Favori">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.72-8.72 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </button>
              <button class="card-fs-btn" onclick="event.stopPropagation(); app.playStationInFullscreen(${i})" title="Plein Écran Direct">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
              </button>
              <div class="card-thumb-wrapper">
                ${s.logo ? `<img src="${s.logo}" alt="${safeName}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` : ''}
                <div class="card-thumb-fallback-box" style="${s.logo ? 'display:none;' : 'display:flex;'}">
                  <span class="initials">${initials}</span>
                  <span style="font-size:0.7rem; opacity:0.8;">${s.name}</span>
                </div>
              </div>
              <div>
                <div style="font-weight:600; font-size:0.88rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${s.name}</div>
                <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:2px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${s.tags || s.country}</div>
              </div>
            </div>
          `;
        }).join('');
      }

      handleCardClick(index) {
        this.unlockAudio();
        const item = this.stations[index];
        if (!item) return;
        this.playStation(index);
      }

      playStationInFullscreen(index) {
        this.playStation(index);
        this.toggleFullscreen();
      }

      async playStation(index) {
        const s = this.stations[index];
        if (!s) return;
        this.activeStationIndex = index;
        this.renderGrid();
        this.theater.classList.add('active');

        if (this.theater.scrollIntoView) {
          this.theater.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        let streamUrl = s.url;
        if (s.id && s.id.startsWith('pluto_')) {
          const rawUrl = s.rawStreamUrl || s.url;
          streamUrl = this.fetcher.pluto.buildPlutoStreamUrl(rawUrl);
        }

        this.updateMetadata(s.name, s.tags || s.country, s.logo);
        const isVideo = s.type === 'video' || s.type === 'tv';

        if (isVideo) {
          this.audioOverlay.style.display = 'none';
          this.media.style.display = 'block';
          this.media.style.opacity = '1';
          this.media.style.pointerEvents = 'auto';
          this.visualizer.stop();
          this.playMediaStream(streamUrl, true);
        } else {
          this.media.style.display = 'block';
          this.media.style.opacity = '0';
          this.media.style.pointerEvents = 'none';
          this.audioOverlay.style.display = 'flex';
          this.visualizer.start();
          this.playMediaStream(streamUrl, false);
        }
      }

      playMediaStream(url, isVideo) {
        if (!url) return;
        if (this.hlsPlayer) {
          this.hlsPlayer.destroy();
          this.hlsPlayer = null;
        }

        this.unlockAudio();
        let cleanUrl = url.replace(/^http:\/\//i, 'https://');
        const isHls = cleanUrl.includes('.m3u8') || isVideo || cleanUrl.includes('pluto.tv');

        if (isHls && typeof Hls !== 'undefined' && Hls.isSupported()) {
          let currentRealUrl = cleanUrl;

          class CustomHlsLoader extends Hls.DefaultConfig.loader {
            load(context, config, callbacks) {
              let targetUrl = context.url;
              if (targetUrl.includes('/.netlify/functions/IPTV')) {
                try {
                  const uObj = new URL(targetUrl, window.location.origin);
                  const extracted = uObj.searchParams.get('url');
                  if (extracted) targetUrl = extracted;
                } catch(e) {}
              }

              if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
                currentRealUrl = targetUrl;
              }

              const useProxy = window.location.hostname !== 'localhost' && !context.isDirectRetry && (targetUrl.includes('pluto.tv') || targetUrl.includes('bfmtv'));
              if (useProxy) {
                context.url = `/.netlify/functions/IPTV?url=${encodeURIComponent(targetUrl)}`;
              } else {
                context.url = targetUrl;
              }

              const origSuccess = callbacks.onSuccess;
              callbacks.onSuccess = (response, stats, contextFunc, networkDetails) => {
                if (response) response.url = currentRealUrl;
                if (origSuccess) origSuccess(response, stats, contextFunc, networkDetails);
              };

              const origError = callbacks.onError;
              callbacks.onError = (error, contextFunc, networkDetails) => {
                if (!context.isDirectRetry) {
                  context.isDirectRetry = true;
                  context.url = currentRealUrl;
                  const fallbackLoader = new Hls.DefaultConfig.loader(config);
                  fallbackLoader.load(context, config, callbacks);
                  return;
                }
                if (origError) origError(error, contextFunc, networkDetails);
              };

              super.load(context, config, callbacks);
            }
          }

          this.hlsPlayer = new Hls({ enableWorker: true, lowLatencyMode: true, loader: CustomHlsLoader });
          this.hlsPlayer.loadSource(cleanUrl);
          this.hlsPlayer.attachMedia(this.media);
          this.hlsPlayer.on(Hls.Events.MANIFEST_PARSED, () => {
            this.media.play().catch(() => {});
          });
        } else {
          this.media.src = cleanUrl;
          this.media.play().catch(() => {});
        }
      }

      toggleFavByCard(index) {
        const s = this.stations[index];
        if (s) {
          this.favStore.toggle(s);
          this.updateBadgesUI();
          this.renderGrid();
        }
      }

      updateBadgesUI() {
        document.getElementById('fav-radio-badge').textContent = this.favStore.getRadioFavs().length;
        document.getElementById('fav-tv-badge').textContent = this.favStore.getTvFavs().length;
      }

      initFullscreenAndHUD() {
        const btnStageFs = document.getElementById('btn-stage-fullscreen');
        const btnPlayerFs = document.getElementById('btn-fullscreen');

        if (btnStageFs) btnStageFs.onclick = () => this.toggleFullscreen();
        if (btnPlayerFs) btnPlayerFs.onclick = () => this.toggleFullscreen();

        window.addEventListener('keydown', (e) => {
          if ((e.key === 'f' || e.key === 'F') && document.activeElement.tagName !== 'INPUT') {
            this.toggleFullscreen();
          }
        });
      }

      toggleFullscreen() {
        const target = this.theater || document.documentElement;
        if (!document.fullscreenElement && !document.webkitFullscreenElement) {
          if (target.requestFullscreen) target.requestFullscreen();
          else if (target.webkitRequestFullscreen) target.webkitRequestFullscreen();
          else if (this.media && this.media.webkitEnterFullscreen) this.media.webkitEnterFullscreen();
        } else {
          if (document.exitFullscreen) document.exitFullscreen();
          else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        }
        setTimeout(() => this.visualizer.resize(), 300);
      }
    }

    window.addEventListener('DOMContentLoaded', () => {
      window.app = new AppController();
    });
  </script>
</body>
</html>
