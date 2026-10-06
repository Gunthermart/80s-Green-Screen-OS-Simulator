import { marked } from 'marked';
import TurndownService from 'turndown';
import { gfm } from 'joplin-turndown-plugin-gfm';

/**
 * ==============================================================================
 * MICROSOFT WORD WEB CLONE - MOTEUR PRINCIPAL D'APPLICATION (VANILLA JS / POO)
 * Architecture orientée objet moderne, sans framework lourd.
 * ==============================================================================
 */

/**
 * ------------------------------------------------------------------------------
 * 1. GESTIONNAIRE DE NOTIFICATIONS (TOASTS)
 * ------------------------------------------------------------------------------
 */
class ToastManager {
  constructor(containerId = 'toast-container') {
    this.container = document.getElementById(containerId);
  }

  show(message, type = 'info', duration = 3500) {
    if (!this.container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    this.container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(15px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
}

/**
 * ------------------------------------------------------------------------------
 * 2. GESTIONNAIRE D'HISTORIQUE (UNDO / REDO AUTONOME)
 * ------------------------------------------------------------------------------
 */
class HistoryManager {
  constructor(editor, onStateChange) {
    this.editor = editor;
    this.onStateChange = onStateChange;
    this.undoStack = [];
    this.redoStack = [];
    this.maxStates = 40;
    this.debounceTimer = null;
    this.isApplying = false;

    // Snapshot initial
    this.pushState(true);
  }

  pushState(immediate = false) {
    if (this.isApplying) return;

    const capture = () => {
      const currentHtml = this.editor.innerHTML;
      if (this.undoStack.length > 0 && this.undoStack[this.undoStack.length - 1] === currentHtml) {
        return;
      }
      this.undoStack.push(currentHtml);
      if (this.undoStack.length > this.maxStates) {
        this.undoStack.shift();
      }
      // Vider la pile Redo lors d'une nouvelle modification
      this.redoStack = [];
      this.notify();
    };

    if (immediate) {
      if (this.debounceTimer) clearTimeout(this.debounceTimer);
      capture();
    } else {
      if (this.debounceTimer) clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(capture, 350);
    }
  }

  undo() {
    if (this.undoStack.length <= 1) return;
    this.isApplying = true;
    const currentState = this.undoStack.pop();
    this.redoStack.push(currentState);
    const prevState = this.undoStack[this.undoStack.length - 1];
    this.editor.innerHTML = prevState;
    this.isApplying = false;
    this.notify();
  }

  redo() {
    if (this.redoStack.length === 0) return;
    this.isApplying = true;
    const nextState = this.redoStack.pop();
    this.undoStack.push(nextState);
    this.editor.innerHTML = nextState;
    this.isApplying = false;
    this.notify();
  }

  canUndo() {
    return this.undoStack.length > 1;
  }

  canRedo() {
    return this.redoStack.length > 0;
  }

  notify() {
    if (typeof this.onStateChange === 'function') {
      this.onStateChange(this.canUndo(), this.canRedo());
    }
  }
}

/**
 * ------------------------------------------------------------------------------
 * 3. MOTEUR D'ÉDITION WYSIWYG & SÉLECTION (EDITOR ENGINE)
 * ------------------------------------------------------------------------------
 */
class EditorEngine {
  constructor(editorElement, historyManager) {
    this.editor = editorElement;
    this.history = historyManager;
    this.savedRange = null;

    this.initEvents();
  }

  initEvents() {
    // Sauvegarde de l'état lors de la frappe
    this.editor.addEventListener('input', () => {
      this.history.pushState(false);
    });

    // Mémoriser la sélection utilisateur pour les dialogues modaux
    document.addEventListener('selectionchange', () => {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && this.editor.contains(sel.anchorNode)) {
        this.savedRange = sel.getRangeAt(0).cloneRange();
      }
    });

    // Gestion de la touche TAB pour l'indentation et les cellules de tableau
    this.editor.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;
        const range = sel.getRangeAt(0);

        // Si on est dans un tableau, passer à la cellule suivante ou précédente
        const cell = range.startContainer.nodeType === Node.ELEMENT_NODE
          ? range.startContainer.closest('td, th')
          : range.startContainer.parentElement?.closest('td, th');

        if (cell) {
          this.handleTableTabNavigation(cell, e.shiftKey);
          return;
        }

        // Sinon, indentation normale de paragraphe
        if (e.shiftKey) {
          this.exec('outdent');
        } else {
          this.exec('indent');
        }
      }
    });
  }

  restoreSelection() {
    if (this.savedRange) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(this.savedRange);
    } else {
      this.editor.focus();
    }
  }

  exec(command, value = null) {
    this.editor.focus();
    document.execCommand(command, false, value);
    this.history.pushState(true);
  }

  // Formatage de bloc (Normal, Titre 1, Titre 2, Citation, Pre)
  formatBlock(tag) {
    this.editor.focus();
    if (tag === 'p') {
      document.execCommand('formatBlock', false, '<p>');
    } else if (tag === 'h1' || tag === 'h2' || tag === 'h3') {
      document.execCommand('formatBlock', false, `<${tag}>`);
    } else if (tag === 'blockquote') {
      document.execCommand('formatBlock', false, '<blockquote>');
    } else if (tag === 'pre') {
      document.execCommand('formatBlock', false, '<pre>');
    }
    this.history.pushState(true);
  }

  setFontFamily(fontName) {
    this.exec('fontName', fontName);
  }

  setFontSize(sizePt) {
    this.editor.focus();
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) {
      this.exec('fontSize', '3'); // fallback
      return;
    }
    // Application propre de la taille en pt via élément span
    const range = sel.getRangeAt(0);
    const span = document.createElement('span');
    span.style.fontSize = `${sizePt}pt`;
    span.appendChild(range.extractContents());
    range.insertNode(span);

    // Repositionner la sélection
    sel.removeAllRanges();
    const newRange = document.createRange();
    newRange.selectNodeContents(span);
    sel.addRange(newRange);

    this.history.pushState(true);
  }

  adjustFontSize(step) {
    this.editor.focus();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const sizeSelect = document.getElementById('font-size-select');
    if (sizeSelect) {
      let currentVal = parseInt(sizeSelect.value, 10) || 11;
      let newVal = Math.max(8, Math.min(72, currentVal + step));
      sizeSelect.value = String(newVal);
      this.setFontSize(newVal);
    }
  }

  setTextColor(colorHex) {
    this.exec('foreColor', colorHex);
  }

  setHighlightColor(colorHex) {
    if (colorHex === 'transparent') {
      this.exec('removeFormat');
    } else {
      this.exec('hiliteColor', colorHex);
    }
  }

  setLineHeight(multiplier) {
    this.editor.focus();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const node = sel.anchorNode;
    const block = node.nodeType === Node.ELEMENT_NODE ? node.closest('p, h1, h2, h3, blockquote, li') : node.parentElement?.closest('p, h1, h2, h3, blockquote, li');
    if (block) {
      block.style.lineHeight = multiplier;
      this.history.pushState(true);
    } else {
      this.editor.style.lineHeight = multiplier;
    }
  }

  insertPageBreak() {
    this.editor.focus();
    if (window.wordApp && window.wordApp.pagination) {
      window.wordApp.pagination.insertManualBreak();
    } else {
      const pageBreak = document.createElement('div');
      pageBreak.className = 'word-page-break';
      pageBreak.setAttribute('contenteditable', 'false');
      pageBreak.dataset.manual = 'true';
      pageBreak.innerHTML = `
        <div class="page-break-inner">
          <div class="page-break-end"><span class="page-break-end-label">Page 1</span></div>
          <div class="page-break-gap"><div class="page-break-line"></div><span class="page-break-badge">Page 2 (Saut manuel)</span><div class="page-break-line"></div></div>
          <div class="page-break-start"><span class="page-break-start-label">Microsoft Word</span></div>
        </div>`;

      const pAfter = document.createElement('p');
      pAfter.innerHTML = '<br>';

      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        range.collapse(false);
        range.insertNode(pAfter);
        range.insertNode(pageBreak);

        const newRange = document.createRange();
        newRange.setStart(pAfter, 0);
        newRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(newRange);
      } else {
        this.editor.appendChild(pageBreak);
        this.editor.appendChild(pAfter);
      }
      this.history.pushState(true);
    }
  }

  insertTable(cols, rows, withHeader = true) {
    this.restoreSelection();
    const table = document.createElement('table');
    table.style.width = '100%';

    let currentCellCount = 1;
    if (withHeader) {
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      for (let c = 0; c < cols; c++) {
        const th = document.createElement('th');
        th.innerHTML = `En-tête ${c + 1}`;
        headerRow.appendChild(th);
      }
      thead.appendChild(headerRow);
      table.appendChild(thead);
    }

    const tbody = document.createElement('tbody');
    const rowCount = withHeader ? rows - 1 : rows;
    for (let r = 0; r < Math.max(1, rowCount); r++) {
      const tr = document.createElement('tr');
      for (let c = 0; c < cols; c++) {
        const td = document.createElement('td');
        td.innerHTML = `Cellule ${currentCellCount++}`;
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);

    const pAfter = document.createElement('p');
    pAfter.innerHTML = '<br>';

    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      range.insertNode(pAfter);
      range.insertNode(table);
    } else {
      this.editor.appendChild(table);
      this.editor.appendChild(pAfter);
    }
    this.history.pushState(true);
  }

  handleTableTabNavigation(cell, isShift) {
    const table = cell.closest('table');
    if (!table) return;
    const allCells = Array.from(table.querySelectorAll('th, td'));
    const currentIndex = allCells.indexOf(cell);

    if (isShift) {
      if (currentIndex > 0) {
        this.selectCell(allCells[currentIndex - 1]);
      }
    } else {
      if (currentIndex < allCells.length - 1) {
        this.selectCell(allCells[currentIndex + 1]);
      } else {
        // Ajouter une nouvelle ligne à la fin du tableau
        const tbody = table.querySelector('tbody') || table;
        const newRow = document.createElement('tr');
        const colCount = table.querySelector('tr')?.children.length || 2;
        for (let i = 0; i < colCount; i++) {
          const td = document.createElement('td');
          td.innerHTML = '<br>';
          newRow.appendChild(td);
        }
        tbody.appendChild(newRow);
        this.selectCell(newRow.children[0]);
        this.history.pushState(true);
      }
    }
  }

  selectCell(cell) {
    const sel = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(cell);
    sel.removeAllRanges();
    sel.addRange(range);
  }

  insertImage(src) {
    this.restoreSelection();
    const img = document.createElement('img');
    img.src = src;
    img.style.maxWidth = '100%';
    img.style.height = 'auto';

    // Rendre l'image sélectionnable et redimensionnable
    img.addEventListener('click', (e) => {
      e.stopPropagation();
      this.editor.querySelectorAll('img').forEach((i) => i.classList.remove('selected'));
      img.classList.add('selected');
    });

    const p = document.createElement('p');
    p.appendChild(img);

    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      range.insertNode(p);
    } else {
      this.editor.appendChild(p);
    }
    this.history.pushState(true);
  }

  insertLink(url, text) {
    this.restoreSelection();
    const a = document.createElement('a');
    a.href = url;
    a.textContent = text || url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.style.color = '#185abd';
    a.style.textDecoration = 'underline';

    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      range.insertNode(a);
    } else {
      this.editor.appendChild(a);
    }
    this.history.pushState(true);
  }

  insertCallout() {
    this.restoreSelection();
    const callout = document.createElement('div');
    callout.style.borderLeft = '4px solid #185abd';
    callout.style.backgroundColor = '#f0f6ff';
    callout.style.padding = '12px 16px';
    callout.style.margin = '14px 0';
    callout.style.borderRadius = '0 4px 4px 0';
    callout.innerHTML = '<strong>Remarque importante :</strong> Votre texte explicatif ou note de synthèse ici.';

    const pAfter = document.createElement('p');
    pAfter.innerHTML = '<br>';

    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      range.insertNode(pAfter);
      range.insertNode(callout);
    } else {
      this.editor.appendChild(callout);
      this.editor.appendChild(pAfter);
    }
    this.history.pushState(true);
  }

  insertDateTime() {
    this.restoreSelection();
    const now = new Date();
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    const dateStr = now.toLocaleDateString('fr-FR', options);
    this.exec('insertText', dateStr);
  }

  insertSymbol(symbol = '©') {
    this.restoreSelection();
    this.exec('insertText', symbol);
  }
}

/**
 * ------------------------------------------------------------------------------
 * 4. RECHERCHER ET REMPLACER (SEARCH & REPLACE MANAGER)
 * ------------------------------------------------------------------------------
 */
class SearchReplaceManager {
  constructor(editor, onMatchUpdate) {
    this.editor = editor;
    this.onMatchUpdate = onMatchUpdate;
    this.panel = document.getElementById('search-replace-panel');
    this.findInput = document.getElementById('sr-find-input');
    this.replaceInput = document.getElementById('sr-replace-input');
    this.counterBadge = document.getElementById('sr-match-counter');
    this.replaceGroup = document.getElementById('sr-replace-group');
    this.currentIndex = -1;
    this.matches = [];

    this.initEvents();
  }

  initEvents() {
    this.findInput.addEventListener('input', () => {
      this.search(this.findInput.value);
    });

    this.findInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        if (e.shiftKey) this.prev();
        else this.next();
      } else if (e.key === 'Escape') {
        this.close();
      }
    });

    document.getElementById('btn-sr-next').addEventListener('click', () => this.next());
    document.getElementById('btn-sr-prev').addEventListener('click', () => this.prev());
    document.getElementById('btn-sr-replace').addEventListener('click', () => this.replaceCurrent());
    document.getElementById('btn-sr-replace-all').addEventListener('click', () => this.replaceAll());
    document.getElementById('btn-sr-close').addEventListener('click', () => this.close());
  }

  open(withReplace = false) {
    this.panel.classList.add('show');
    if (withReplace) {
      this.replaceGroup.style.display = 'block';
      document.getElementById('sr-title').textContent = 'Rechercher et remplacer';
    } else {
      this.replaceGroup.style.display = 'none';
      document.getElementById('sr-title').textContent = 'Rechercher';
    }
    this.findInput.focus();
    this.findInput.select();
    if (this.findInput.value) {
      this.search(this.findInput.value);
    }
  }

  close() {
    this.clearHighlights();
    this.panel.classList.remove('show');
    this.editor.focus();
  }

  clearHighlights() {
    const marks = this.editor.querySelectorAll('mark.search-highlight');
    marks.forEach((mark) => {
      const parent = mark.parentNode;
      parent.replaceChild(document.createTextNode(mark.textContent), mark);
      parent.normalize();
    });
    this.matches = [];
    this.currentIndex = -1;
    this.updateCounter();
  }

  search(term) {
    this.clearHighlights();
    if (!term || term.trim() === '') return;

    const walker = document.createTreeWalker(this.editor, NodeFilter.SHOW_TEXT, null, false);
    const textNodes = [];
    let currentNode = walker.nextNode();
    while (currentNode) {
      // Éviter les sauts de page et éléments non éditables
      if (!currentNode.parentElement.closest('.page-break')) {
        textNodes.push(currentNode);
      }
      currentNode = walker.nextNode();
    }

    const regex = new RegExp(this.escapeRegExp(term), 'gi');

    textNodes.forEach((node) => {
      const matchesInNode = [];
      let match;
      while ((match = regex.exec(node.nodeValue)) !== null) {
        matchesInNode.push({
          index: match.index,
          length: match[0].length,
        });
      }

      if (matchesInNode.length > 0) {
        const frag = document.createDocumentFragment();
        let lastIdx = 0;
        matchesInNode.forEach((m) => {
          // Texte avant
          frag.appendChild(document.createTextNode(node.nodeValue.substring(lastIdx, m.index)));
          // Surlignage
          const mark = document.createElement('mark');
          mark.className = 'search-highlight';
          mark.textContent = node.nodeValue.substring(m.index, m.index + m.length);
          frag.appendChild(mark);
          this.matches.push(mark);
          lastIdx = m.index + m.length;
        });
        frag.appendChild(document.createTextNode(node.nodeValue.substring(lastIdx)));
        node.parentNode.replaceChild(frag, node);
      }
    });

    if (this.matches.length > 0) {
      this.currentIndex = 0;
      this.highlightActive();
    }
    this.updateCounter();
  }

  highlightActive() {
    this.matches.forEach((m, idx) => {
      m.classList.toggle('active', idx === this.currentIndex);
    });
    if (this.matches[this.currentIndex]) {
      this.matches[this.currentIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    this.updateCounter();
  }

  next() {
    if (this.matches.length === 0) return;
    this.currentIndex = (this.currentIndex + 1) % this.matches.length;
    this.highlightActive();
  }

  prev() {
    if (this.matches.length === 0) return;
    this.currentIndex = (this.currentIndex - 1 + this.matches.length) % this.matches.length;
    this.highlightActive();
  }

  replaceCurrent() {
    if (this.matches.length === 0 || this.currentIndex === -1) return;
    const currentMark = this.matches[this.currentIndex];
    const replacementText = this.replaceInput.value;
    const textNode = document.createTextNode(replacementText);
    currentMark.parentNode.replaceChild(textNode, currentMark);

    this.search(this.findInput.value);
  }

  replaceAll() {
    if (this.matches.length === 0) return;
    const replacementText = this.replaceInput.value;
    this.matches.forEach((mark) => {
      const textNode = document.createTextNode(replacementText);
      mark.parentNode.replaceChild(textNode, mark);
    });
    this.clearHighlights();
  }

  updateCounter() {
    if (this.matches.length === 0) {
      this.counterBadge.textContent = '0/0';
    } else {
      this.counterBadge.textContent = `${this.currentIndex + 1}/${this.matches.length}`;
    }
  }

  escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

/**
 * ------------------------------------------------------------------------------
 * 5. GESTIONNAIRE DE LA RÈGLE GRADUÉE (RULER MANAGER)
 * ------------------------------------------------------------------------------
 */
class RulerManager {
  constructor(pageElement, leftMarker, rightMarker) {
    this.page = pageElement;
    this.leftMarker = leftMarker;
    this.rightMarker = rightMarker;
    this.topMarker = document.getElementById('ruler-top-marker');
    this.bottomMarker = document.getElementById('ruler-bottom-marker');

    this.ticksContainer = document.getElementById('ruler-ticks');
    this.rulerContainer = document.getElementById('ruler-container');
    this.rulerTrack = document.getElementById('ruler-track');

    this.rulerVerticalContainer = document.getElementById('ruler-vertical-container');
    this.rulerVerticalTrack = document.getElementById('ruler-vertical-track');
    this.rulerVerticalTicks = document.getElementById('ruler-vertical-ticks');

    this.trackerH = document.getElementById('ruler-caret-tracker-h');
    this.trackerV = document.getElementById('ruler-caret-tracker-v');

    this.cmInPixels = 37.8;
    this.pageHeight = 1056;
    this.pageWidth = 816;
    this.pageGap = 28;

    this.renderRulerTicks();
    this.renderVerticalTicks(1);
    this.initDraggableMarkers();
    this.initCaretTracking();
  }

  renderRulerTicks() {
    if (!this.ticksContainer) return;
    this.ticksContainer.innerHTML = '';
    const totalCm = 21;

    for (let i = 1; i <= totalCm; i++) {
      const pos = i * this.cmInPixels;
      if (pos > this.pageWidth - 10) break;
      const tickNum = document.createElement('div');
      tickNum.className = 'ruler-tick-num';
      tickNum.style.left = `${pos}px`;
      tickNum.textContent = String(i);
      this.ticksContainer.appendChild(tickNum);
    }
  }

  renderVerticalTicks(totalPages = 1) {
    if (!this.rulerVerticalTrack) return;
    this.rulerVerticalTrack.innerHTML = '';
    const cmInVerticalPixels = 35.55; // 1056px / 29.7cm
    const totalVerticalCm = 29;

    for (let p = 1; p <= totalPages; p++) {
      const pageSection = document.createElement('div');
      pageSection.className = 'ruler-vertical-page-section';
      pageSection.dataset.page = String(p);

      // Marge haute ombrée (76px)
      const topMarginDiv = document.createElement('div');
      topMarginDiv.className = 'ruler-vertical-margin-top';
      pageSection.appendChild(topMarginDiv);

      // Marge basse ombrée (76px)
      const bottomMarginDiv = document.createElement('div');
      bottomMarginDiv.className = 'ruler-vertical-margin-bottom';
      pageSection.appendChild(bottomMarginDiv);

      // Conteneur de graduations
      const ticks = document.createElement('div');
      ticks.className = 'ruler-vertical-ticks';

      for (let i = 1; i <= totalVerticalCm; i++) {
        const yPos = i * cmInVerticalPixels;
        if (yPos > this.pageHeight - 8) break;

        const tick = document.createElement('div');
        tick.className = 'ruler-vertical-tick';
        tick.style.top = `${yPos}px`;
        ticks.appendChild(tick);

        const subTick = document.createElement('div');
        subTick.className = 'ruler-vertical-tick sub';
        subTick.style.top = `${yPos - cmInVerticalPixels / 2}px`;
        ticks.appendChild(subTick);

        const num = document.createElement('div');
        num.className = 'ruler-vertical-tick-num';
        num.style.top = `${yPos}px`;
        num.textContent = String(i);
        ticks.appendChild(num);
      }

      pageSection.appendChild(ticks);

      // Placer les marqueurs sur la première page
      if (p === 1) {
        if (this.topMarker) pageSection.appendChild(this.topMarker);
        if (this.bottomMarker) pageSection.appendChild(this.bottomMarker);
        if (this.trackerV) pageSection.appendChild(this.trackerV);
      }

      this.rulerVerticalTrack.appendChild(pageSection);
    }
  }

  initDraggableMarkers() {
    let isDragging = null;

    if (this.leftMarker) {
      this.leftMarker.addEventListener('mousedown', (e) => {
        e.preventDefault();
        isDragging = 'left';
      });
    }

    if (this.rightMarker) {
      this.rightMarker.addEventListener('mousedown', (e) => {
        e.preventDefault();
        isDragging = 'right';
      });
    }

    if (this.topMarker) {
      this.topMarker.addEventListener('mousedown', (e) => {
        e.preventDefault();
        isDragging = 'top';
      });
    }

    if (this.bottomMarker) {
      this.bottomMarker.addEventListener('mousedown', (e) => {
        e.preventDefault();
        isDragging = 'bottom';
      });
    }

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;

      if (isDragging === 'left' && this.horizontalTrack) {
        const trackRect = this.horizontalTrack.getBoundingClientRect();
        const relativeX = e.clientX - trackRect.left;
        const clampedX = Math.max(20, Math.min(220, relativeX));
        this.leftMarker.style.left = `${clampedX}px`;
        this.page.style.setProperty('--page-margin-left', `${clampedX}px`);
      } else if (isDragging === 'right' && this.horizontalTrack) {
        const trackRect = this.horizontalTrack.getBoundingClientRect();
        const relativeX = e.clientX - trackRect.left;
        const fromRight = trackRect.width - relativeX;
        const clampedRight = Math.max(20, Math.min(220, fromRight));
        this.rightMarker.style.right = `${clampedRight}px`;
        this.page.style.setProperty('--page-margin-right', `${clampedRight}px`);
      } else if (isDragging === 'top' && this.rulerVerticalTrack) {
        const firstSection = this.rulerVerticalTrack.querySelector('.ruler-vertical-page-section');
        if (firstSection) {
          const rect = firstSection.getBoundingClientRect();
          const relativeY = e.clientY - rect.top;
          const clampedY = Math.max(25, Math.min(180, relativeY));
          if (this.topMarker) this.topMarker.style.top = `${clampedY}px`;
          this.page.style.setProperty('--page-margin-top', `${clampedY}px`);
          const topMarginDiv = firstSection.querySelector('.ruler-vertical-margin-top');
          if (topMarginDiv) topMarginDiv.style.height = `${clampedY}px`;
        }
      } else if (isDragging === 'bottom' && this.rulerVerticalTrack) {
        const firstSection = this.rulerVerticalTrack.querySelector('.ruler-vertical-page-section');
        if (firstSection) {
          const rect = firstSection.getBoundingClientRect();
          const relativeY = e.clientY - rect.top;
          const clampedY = Math.max(850, Math.min(1020, relativeY));
          if (this.bottomMarker) this.bottomMarker.style.top = `${clampedY}px`;
          const bottomMarginH = this.pageHeight - clampedY;
          this.page.style.setProperty('--page-margin-bottom', `${bottomMarginH}px`);
          const bottomMarginDiv = firstSection.querySelector('.ruler-vertical-margin-bottom');
          if (bottomMarginDiv) bottomMarginDiv.style.height = `${bottomMarginH}px`;
        }
      }
    });

    window.addEventListener('mouseup', () => {
      isDragging = null;
    });
  }

  initCaretTracking() {
    const editor = document.getElementById('word-editor');
    if (!editor) return;

    const updateTracker = () => {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0 || !editor.contains(sel.anchorNode)) {
        if (this.trackerH) this.trackerH.style.display = 'none';
        if (this.trackerV) this.trackerV.style.display = 'none';
        return;
      }

      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      // Tracker horizontal
      if (this.trackerH && this.horizontalTrack) {
        const trackRect = this.horizontalTrack.getBoundingClientRect();
        const relX = rect.left - trackRect.left;
        if (relX >= 0 && relX <= this.pageWidth) {
          this.trackerH.style.display = 'block';
          this.trackerH.style.left = `${relX}px`;
        } else {
          this.trackerH.style.display = 'none';
        }
      }

      // Tracker vertical
      if (this.trackerV && this.rulerVerticalTrack) {
        const trackRect = this.rulerVerticalTrack.getBoundingClientRect();
        const relY = rect.top - trackRect.top;
        if (relY >= 0) {
          this.trackerV.style.display = 'block';
          this.trackerV.style.top = `${relY}px`;
        } else {
          this.trackerV.style.display = 'none';
        }
      }
    };

    document.addEventListener('selectionchange', updateTracker);
    editor.addEventListener('input', updateTracker);
    editor.addEventListener('click', updateTracker);
    editor.addEventListener('keyup', updateTracker);
  }

  toggle(visible) {
    if (this.rulerContainer) {
      this.rulerContainer.style.display = visible ? 'flex' : 'none';
    }
    if (this.rulerVerticalContainer) {
      this.rulerVerticalContainer.style.display = visible ? 'block' : 'none';
    }
    if (this.rulerTrack) {
      this.rulerTrack.style.marginLeft = visible ? '34px' : '0';
    }
  }
}

/**
 * ------------------------------------------------------------------------------
 * 6. COMPATIBILITÉ FICHIERS (IMPORT / EXPORT DOCX, HTML, JSON & AUTO-SAVE)
 * ------------------------------------------------------------------------------
 */
class FileManager {
  constructor(editor, docTitleInput, toastManager) {
    this.editor = editor;
    this.titleInput = docTitleInput;
    this.toasts = toastManager;
    this.storageKey = 'ms_word_clone_autosave_v1';
    
    // Configuration du debounce pour l'enregistrement automatique
    this.debounceDelay = 1200; // Délai de 1.2 seconde après la frappe
    this.debounceTimer = null;
    this.isDirty = false;
    this.isSaving = false;

    this.initAutoSave();
  }

  getDocumentTitle() {
    let title = this.titleInput.value.trim();
    return title.replace(/\s*-\s*Word$/i, '') || 'Document';
  }

  getCleanHtml() {
    const temp = document.createElement('div');
    temp.innerHTML = this.editor.innerHTML;
    // Nettoyer les balises de vérification orthographique pour préserver le texte pur
    temp.querySelectorAll('.spell-error').forEach((span) => {
      const textNode = document.createTextNode(span.textContent);
      span.parentNode.replaceChild(textNode, span);
    });
    // Nettoyer les surbrillances de recherche
    temp.querySelectorAll('mark.search-highlight').forEach((mark) => {
      const textNode = document.createTextNode(mark.textContent);
      mark.parentNode.replaceChild(textNode, mark);
    });
    // Nettoyer les éléments de pagination dynamiques et convertir les sauts de page
    temp.querySelectorAll('.page-last-spacer, .page-last-footer').forEach((el) => el.remove());
    temp.querySelectorAll('.word-page-break, .page-break').forEach((wb) => {
      const pb = document.createElement('div');
      pb.setAttribute('style', 'page-break-after: always; mso-break-type: page-break;');
      wb.parentNode.replaceChild(pb, wb);
    });
    return temp.innerHTML;
  }

  /**
   * Sauvegarde synchrone vers localStorage
   */
  saveToStorage() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    const data = {
      title: this.getDocumentTitle(),
      content: this.getCleanHtml(),
      savedAt: new Date().toISOString(),
      headerFooter: window.wordApp && window.wordApp.headerFooter ? window.wordApp.headerFooter.data : null,
    };

    try {
      this.isSaving = true;
      this.updateSaveIndicator('Enregistrement...', 'saving');
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      this.isDirty = false;
      this.isSaving = false;
      const timeStr = new Date().toLocaleTimeString('fr-FR');
      this.updateSaveIndicator(`Enregistré à ${timeStr}`, 'saved');
    } catch (e) {
      this.isSaving = false;
      console.warn('Erreur localStorage', e);
      if (e && (e.name === 'QuotaExceededError' || e.code === 22)) {
        this.updateSaveIndicator('Stockage saturé', 'error');
        this.toasts.show('Quota localStorage dépassé. Réduisez les images intégrées.', 'warning');
      } else {
        this.updateSaveIndicator("Erreur d'enregistrement", 'error');
      }
    }
  }

  /**
   * Planifie un enregistrement automatique avec debounce pour ne pas surcharger les ressources
   */
  scheduleDebouncedSave() {
    const toggle = document.getElementById('autosave-toggle');
    if (toggle && !toggle.checked) return;

    this.isDirty = true;
    this.updateSaveIndicator('Modifications...', 'pending');

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.saveToStorage();
    }, this.debounceDelay);
  }

  loadFromStorage() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) {
        const data = JSON.parse(raw);
        if (data.content && data.content.trim().length > 0) {
          const temp = document.createElement('div');
          temp.innerHTML = data.content;
          temp.querySelectorAll('.page-last-spacer, .page-last-footer, .page-break-spacer, .page-break-end, .page-break-start').forEach((el) => el.remove());
          this.editor.innerHTML = temp.innerHTML;
          if (data.title) {
            this.titleInput.value = `${data.title} - Word`;
          }
          if (data.headerFooter && window.wordApp && window.wordApp.headerFooter) {
            window.wordApp.headerFooter.data = Object.assign(window.wordApp.headerFooter.data, data.headerFooter);
          }
          this.toasts.show('Dernière session restaurée avec succès', 'success');
          if (data.savedAt) {
            const date = new Date(data.savedAt);
            this.updateSaveIndicator(`Restauré (${date.toLocaleTimeString('fr-FR')})`, 'saved');
          }
          return true;
        }
      }
    } catch (e) {
      console.warn('Impossible de charger depuis localStorage', e);
    }
    return false;
  }

  initAutoSave() {
    // Événement input avec debounce sur la zone d'édition .word-editor
    this.editor.addEventListener('input', () => {
      this.scheduleDebouncedSave();
    });

    // Événement input sur le champ de titre
    this.titleInput.addEventListener('input', () => {
      this.scheduleDebouncedSave();
    });

    // Bascule Enregistrement automatique dans la barre d'outils
    const toggle = document.getElementById('autosave-toggle');
    if (toggle) {
      toggle.addEventListener('change', (e) => {
        if (e.target.checked) {
          this.toasts.show('Enregistrement automatique activé', 'info');
          this.saveToStorage();
        } else {
          if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = null;
          }
          this.updateSaveIndicator('Enreg. auto désactivé', 'disabled');
          this.toasts.show('Enregistrement automatique désactivé', 'info');
        }
      });
    }

    // Sauvegarde immédiate garantie avant fermeture ou rechargement de l'onglet
    window.addEventListener('beforeunload', () => {
      if (this.isDirty && (!toggle || toggle.checked)) {
        try {
          const data = {
            title: this.getDocumentTitle(),
            content: this.getCleanHtml(),
            savedAt: new Date().toISOString(),
          };
          localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (e) {
          console.warn('Échec sauvegarde beforeunload', e);
        }
      }
    });
  }

  updateSaveIndicator(text, status = 'saved') {
    const indicator = document.getElementById('save-indicator');
    const textLabel = document.getElementById('save-status-text');
    const bsLabel = document.getElementById('bs-save-status');

    if (indicator) {
      indicator.classList.remove('saving', 'pending', 'disabled', 'error');
      if (status === 'saving') indicator.classList.add('saving');
      else if (status === 'pending') indicator.classList.add('pending');
      else if (status === 'disabled') indicator.classList.add('disabled');
      else if (status === 'error') indicator.classList.add('error');
    }
    if (textLabel) {
      textLabel.textContent = text;
    }
    if (bsLabel) {
      bsLabel.textContent = status === 'error' ? `⚠ ${text}` : `✓ ${text}`;
    }
  }

  // [CRUCIAL] IMPORT DOCX VIA MAMMOTH.JS
  importDocx(file) {
    if (!file) return;
    this.toasts.show(`Chargement de "${file.name}"...`, 'info');

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const arrayBuffer = loadEvent.target.result;

      if (window.mammoth) {
        window.mammoth
          .convertToHtml({ arrayBuffer: arrayBuffer })
          .then((result) => {
            const html = result.value;
            this.editor.innerHTML = html;

            const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
            this.titleInput.value = `${nameWithoutExt} - Word`;

            this.saveToStorage();
            this.toasts.show('Document .docx importé avec succès !', 'success');

            if (window.wordApp) {
              if (window.wordApp.history) window.wordApp.history.pushState(true);
              setTimeout(() => {
                if (window.wordApp.pagination) window.wordApp.pagination.updatePagination();
                if (window.wordApp.spellCheck) window.wordApp.spellCheck.scanEditor();
              }, 60);
            }

            if (result.messages.length > 0) {
              console.info('Mammoth info:', result.messages);
            }
          })
          .catch((err) => {
            console.error('Erreur Mammoth:', err);
            this.toasts.show('Erreur lors du décodage du fichier DOCX', 'error');
          });
      } else {
        this.toasts.show('Bibliothèque Mammoth non disponible. Vérifiez la connexion.', 'error');
      }
    };
    reader.readAsArrayBuffer(file);
  }

  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // [CRUCIAL] IMPORTATION ET CONVERSION DE FICHIER PDF VERS WORD
  async importPdf(file) {
    if (!file) return;
    this.toasts.show(`Conversion du document PDF "${file.name}" en cours...`, 'info', 3000);

    try {
      if (!window.pdfjsLib) {
        this.toasts.show('Chargement du convertisseur PDF...', 'info');
        await new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
          s.onload = resolve;
          s.onerror = reject;
          document.head.appendChild(s);
        });
      }

      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;

      let extractedHtml = '';

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const items = textContent.items;

        if (!items || items.length === 0) continue;

        // Tri vertical (haut en bas) puis horizontal (gauche à droite)
        items.sort((a, b) => {
          const yA = a.transform[5];
          const yB = b.transform[5];
          if (Math.abs(yA - yB) > 4) {
            return yB - yA;
          }
          return a.transform[4] - b.transform[4];
        });

        let currentLineY = null;
        let currentLineText = '';
        let pageLines = [];
        let maxFontSizeOnLine = 0;

        for (const item of items) {
          const text = item.str;
          if (!text) continue;

          const y = item.transform[5];
          const fontSize = Math.abs(item.transform[0] || item.transform[3] || 12);

          if (currentLineY === null || Math.abs(y - currentLineY) > 4) {
            if (currentLineText.trim().length > 0) {
              pageLines.push({ text: currentLineText.trim(), fontSize: maxFontSizeOnLine });
            }
            currentLineY = y;
            currentLineText = text;
            maxFontSizeOnLine = fontSize;
          } else {
            const needsSpace = !currentLineText.endsWith(' ') && !text.startsWith(' ');
            currentLineText += (needsSpace ? ' ' : '') + text;
            if (fontSize > maxFontSizeOnLine) maxFontSizeOnLine = fontSize;
          }
        }
        if (currentLineText.trim().length > 0) {
          pageLines.push({ text: currentLineText.trim(), fontSize: maxFontSizeOnLine });
        }

        // Générer la structure typographique du document Word
        let pageHtml = '';
        for (const line of pageLines) {
          const t = line.text;
          if (!t) continue;
          if (line.fontSize >= 18) {
            pageHtml += `<h1>${this.escapeHtml(t)}</h1>`;
          } else if (line.fontSize >= 14) {
            pageHtml += `<h2>${this.escapeHtml(t)}</h2>`;
          } else if (line.fontSize >= 12.5) {
            pageHtml += `<h3>${this.escapeHtml(t)}</h3>`;
          } else {
            pageHtml += `<p>${this.escapeHtml(t)}</p>`;
          }
        }

        if (pageNum > 1) {
          extractedHtml += `<div class="word-page-break" data-manual="true" data-page="${pageNum}"><div class="page-break-gap-visual"><div class="page-break-gap-line"></div><span class="page-break-badge">Page ${pageNum} (PDF)</span><div class="page-break-gap-line"></div></div></div>`;
        }
        extractedHtml += pageHtml;
      }

      if (!extractedHtml.trim()) {
        extractedHtml = '<p>Le document PDF a été importé mais ne contient aucun texte vectoriel sélectionnable (il s\'agit probablement d\'un document scanné sous forme d\'image pure).</p>';
      }

      this.editor.innerHTML = extractedHtml;
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      this.titleInput.value = `${nameWithoutExt} - Word`;

      this.saveToStorage();
      this.toasts.show(`PDF "${file.name}" converti avec succès (${numPages} page${numPages > 1 ? 's' : ''}) !`, 'success', 3500);

      if (window.wordApp) {
        if (window.wordApp.history) window.wordApp.history.pushState(true);
        setTimeout(() => {
          if (window.wordApp.pagination) window.wordApp.pagination.updatePagination();
          if (window.wordApp.spellCheck) window.wordApp.spellCheck.scanEditor();
        }, 120);
      }
    } catch (err) {
      console.error('Erreur importation PDF:', err);
      this.toasts.show('Erreur lors du décodage du fichier PDF.', 'error');
    }
  }

  // [CRUCIAL] EXPORT DOCX NATIF VIA HTML-DOCX-JS (OU OPENXML FALLBACK)
  exportDocx() {
    const filename = `${this.getDocumentTitle()}.docx`;
    this.toasts.show('Génération du fichier Word (.docx)...', 'info');

    // Préparer un document HTML complet avec en-têtes standard Word
    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${this.getDocumentTitle()}</title>
        <style>
          body {
            font-family: 'Calibri', 'Segoe UI', Arial, sans-serif;
            font-size: 11pt;
            line-height: 1.45;
            color: #242424;
          }
          h1 { color: #1f4e79; font-size: 20pt; border-bottom: 1px solid #bdd7ee; }
          h2 { color: #2e75b6; font-size: 15pt; }
          h3 { color: #1f4e79; font-size: 13pt; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #7f7f7f; padding: 6px; }
          th { background-color: #deecf9; font-weight: bold; }
          blockquote { border-left: 3px solid #2e75b6; padding-left: 10px; font-style: italic; color: #595959; }
        </style>
      </head>
      <body>
        ${this.getCleanHtml()}
      </body>
      </html>
    `;

    // Utilisation de la librairie htmlDocx si chargée
    if (window.htmlDocx && typeof window.htmlDocx.asBlob === 'function') {
      try {
        const converted = window.htmlDocx.asBlob(fullHtml, {
          orientation: 'portrait',
          margins: { top: 1440, right: 1440, bottom: 1440, left: 1440 }, // 1 pouce
        });
        if (window.saveAs) {
          window.saveAs(converted, filename);
        } else {
          this.triggerDownload(converted, filename);
        }
        this.toasts.show(`Fichier "${filename}" exporté !`, 'success');
        return;
      } catch (err) {
        console.warn('Erreur htmlDocx, bascule vers export OpenXML:', err);
      }
    }

    // Fallback hautement compatible : format MHTML/Word Document natif que Microsoft Word ouvre parfaitement
    const wordBlob = new Blob(
      [
        `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><title>${this.getDocumentTitle()}</title>
        <!--[if gte mso 9]>
        <xml>
        <w:WordDocument>
        <w:View>Print</w:View>
        <w:Zoom>100</w:Zoom>
        <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          @page WordSection1 { size:595.3pt 841.9pt; margin:70.85pt 70.85pt 70.85pt 70.85pt; mso-header-margin:35.4pt; mso-footer-margin:35.4pt; mso-paper-source:0; }
          div.WordSection1 { page:WordSection1; }
          body { font-family: 'Calibri', Arial; font-size: 11pt; }
        </style>
        </head>
        <body>
        <div class="WordSection1">
          ${this.getCleanHtml()}
        </div>
        </body>
        </html>`,
      ],
      { type: 'application/msword;charset=utf-8' }
    );

    this.triggerDownload(wordBlob, `${this.getDocumentTitle()}.doc`);
    this.toasts.show(`Fichier Word exporté !`, 'success');
  }

  exportHtml() {
    const filename = `${this.getDocumentTitle()}.html`;
    const htmlContent = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>${this.getDocumentTitle()}</title>
  <style>
    body { font-family: 'Calibri', Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.5; color: #242424; }
    h1 { color: #1f4e79; }
    h2 { color: #2e75b6; }
    table { border-collapse: collapse; width: 100%; margin: 15px 0; }
    th, td { border: 1px solid #999; padding: 8px; }
    th { background: #f0f4f8; }
    blockquote { border-left: 3px solid #2e75b6; margin: 15px 0; padding: 10px 15px; background: #f8fafc; font-style: italic; }
  </style>
</head>
<body>
${this.getCleanHtml()}
</body>
</html>`;
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    this.triggerDownload(blob, filename);
    this.toasts.show(`Fichier "${filename}" exporté !`, 'success');
  }

  exportJson() {
    const filename = `${this.getDocumentTitle()}.json`;
    const docData = {
      title: this.getDocumentTitle(),
      created: new Date().toISOString(),
      version: '1.0',
      htmlContent: this.getCleanHtml(),
    };
    const blob = new Blob([JSON.stringify(docData, null, 2)], { type: 'application/json' });
    this.triggerDownload(blob, filename);
    this.toasts.show(`Projet JSON exporté !`, 'success');
  }

  exportTxt() {
    const filename = `${this.getDocumentTitle()}.txt`;
    const temp = document.createElement('div');
    temp.innerHTML = this.getCleanHtml();
    const text = temp.innerText || temp.textContent;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    this.triggerDownload(blob, filename);
    this.toasts.show(`Fichier texte exporté !`, 'success');
  }

  // [CRUCIAL] EXPORTATION AU FORMAT MARKDOWN (.MD)
  exportMarkdown() {
    if (window.wordApp && window.wordApp.markdown) {
      window.wordApp.markdown.exportMarkdownFile();
    }
  }

  // [CRUCIAL] IMPORTATION D'UN FICHIER MARKDOWN (.MD)
  importMarkdown(file) {
    if (window.wordApp && window.wordApp.markdown) {
      window.wordApp.markdown.importMarkdownFile(file);
    }
  }

  triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
}

/**
 * ------------------------------------------------------------------------------
 * 6.5 GESTIONNAIRE DU MODE MARKDOWN & IMPORT/EXPORT (MARKDOWN MANAGER)
 * Permet l'édition directe en Markdown (GFM), la conversion bidirectionnelle
 * WYSIWYG <-> Markdown, l'aperçu temps réel et l'import/export de fichiers .md
 * ------------------------------------------------------------------------------
 */
class MarkdownManager {
  constructor(editorElement, docTitleInput, toastManager) {
    this.editor = editorElement;
    this.titleInput = docTitleInput;
    this.toasts = toastManager;
    this.isMarkdownMode = false;
    this.isSplitView = true;

    // Initialisation du parseur Markdown (marked)
    marked.setOptions({
      gfm: true,
      breaks: true
    });

    // Initialisation du convertisseur HTML vers Markdown (Turndown + GFM)
    this.turndown = new TurndownService({
      headingStyle: 'atx',
      hr: '---',
      bulletListMarker: '-',
      codeBlockStyle: 'fenced',
      emDelimiter: '*'
    });
    this.turndown.use(gfm);

    // Règles spécifiques pour préserver les composants Word
    this.turndown.addRule('wordCallout', {
      filter: (node) => node.classList && node.classList.contains('word-callout'),
      replacement: (content) => `\n\n> 💡 **NOTE :**\n> ${content.trim().replace(/\n/g, '\n> ')}\n\n`
    });

    this.turndown.addRule('cleanBreaks', {
      filter: (node) => node.classList && (node.classList.contains('word-page-break') || node.classList.contains('page-sheet-header') || node.classList.contains('page-sheet-footer')),
      replacement: () => '\n\n---\n\n'
    });

    // Éléments du DOM
    this.workspace = document.getElementById('markdown-workspace');
    this.textarea = document.getElementById('markdown-source-input');
    this.previewPane = document.getElementById('markdown-preview-pane');
    this.previewContent = document.getElementById('markdown-preview-content');
    this.panesContainer = document.getElementById('markdown-panes');
    this.statsBadge = document.getElementById('md-stats-badge');
    this.hiddenMdInput = document.getElementById('hidden-md-input');

    this.btnViewMarkdown = document.getElementById('btn-view-markdown');
    this.btnViewWysiwyg = document.getElementById('btn-view-multipage');
    this.sbToggleMode = document.getElementById('sb-toggle-mode');
    this.sbModeLabel = document.getElementById('sb-mode-label');
    this.sbModeIcon = document.getElementById('sb-mode-icon');

    this.initEvents();
  }

  getDocumentTitle() {
    let title = this.titleInput.value.trim();
    return title.replace(/\s*-\s*Word$/i, '') || 'Document';
  }

  htmlToMarkdown(html) {
    if (!html) return '';
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    // Supprimer les surbrillances orthographiques et décorations
    temp.querySelectorAll('.spell-error').forEach((s) => {
      const text = document.createTextNode(s.textContent);
      s.parentNode.replaceChild(text, s);
    });
    temp.querySelectorAll('mark.search-highlight').forEach((m) => {
      const text = document.createTextNode(m.textContent);
      m.parentNode.replaceChild(text, m);
    });
    temp.querySelectorAll('.page-last-spacer, .page-last-footer, .page-break-gap-visual').forEach((e) => e.remove());

    return this.turndown.turndown(temp.innerHTML).trim();
  }

  markdownToHtml(md) {
    if (!md) return '';
    return marked.parse(md);
  }

  toggleMarkdownMode(forceState = null) {
    const nextState = forceState !== null ? forceState : !this.isMarkdownMode;
    if (this.isMarkdownMode === nextState) return;

    if (nextState) {
      // Entrée dans le Mode Markdown
      this.isMarkdownMode = true;
      document.body.classList.add('markdown-mode-active');

      // Convertir le contenu WYSIWYG en Markdown
      const currentHtml = window.wordApp && window.wordApp.fileManager 
        ? window.wordApp.fileManager.getCleanHtml() 
        : this.editor.innerHTML;
      
      const mdContent = this.htmlToMarkdown(currentHtml);
      if (this.textarea) {
        this.textarea.value = mdContent;
      }

      this.updatePreview();
      this.updateStats();
      this.updateUI();

      if (this.textarea) {
        setTimeout(() => this.textarea.focus(), 80);
      }
      this.toasts.show('Mode Markdown activé (Code source .md)', 'info');
    } else {
      // Sortie du Mode Markdown -> retour vers Pages A4 WYSIWYG
      this.isMarkdownMode = false;
      document.body.classList.remove('markdown-mode-active');

      if (this.textarea) {
        const mdText = this.textarea.value;
        const html = this.markdownToHtml(mdText);
        this.editor.innerHTML = html;
      }

      this.updateUI();

      if (window.wordApp) {
        if (window.wordApp.pagination) window.wordApp.pagination.updatePagination();
        if (window.wordApp.spellCheck) window.wordApp.spellCheck.scanEditor();
        if (window.wordApp.history) window.wordApp.history.pushState(true);
        if (window.wordApp.fileManager) window.wordApp.fileManager.scheduleDebouncedSave();
      }

      this.toasts.show('Document synchronisé et converti en pages A4 !', 'success');
    }
  }

  updatePreview() {
    if (!this.textarea || !this.previewContent) return;
    const md = this.textarea.value;
    const html = this.markdownToHtml(md);
    this.previewContent.innerHTML = html;
  }

  updateStats() {
    if (!this.textarea || !this.statsBadge) return;
    const text = this.textarea.value;
    const lines = text ? text.split('\n').length : 0;
    const words = text ? (text.match(/[\w\u00C0-\u017F]+/g) || []).length : 0;
    const chars = text.length;

    this.statsBadge.textContent = `${lines} ligne${lines > 1 ? 's' : ''} | ${words} mot${words > 1 ? 's' : ''} | ${chars} car.`;
  }

  updateUI() {
    if (this.btnViewMarkdown && this.btnViewWysiwyg) {
      if (this.isMarkdownMode) {
        this.btnViewMarkdown.classList.add('active');
        this.btnViewWysiwyg.classList.remove('active');
      } else {
        this.btnViewMarkdown.classList.remove('active');
        this.btnViewWysiwyg.classList.add('active');
      }
    }

    if (this.sbModeLabel && this.sbModeIcon) {
      if (this.isMarkdownMode) {
        this.sbModeLabel.textContent = 'Mode Markdown';
        this.sbModeIcon.textContent = 'ℳ';
        if (this.sbToggleMode) this.sbToggleMode.style.backgroundColor = 'var(--btn-selected)';
      } else {
        this.sbModeLabel.textContent = 'Pages A4';
        this.sbModeIcon.textContent = '☷';
        if (this.sbToggleMode) this.sbToggleMode.style.backgroundColor = 'transparent';
      }
    }
  }

  exportMarkdownFile() {
    const filename = `${this.getDocumentTitle()}.md`;
    let md = '';

    if (this.isMarkdownMode && this.textarea) {
      md = this.textarea.value;
    } else {
      const cleanHtml = window.wordApp && window.wordApp.fileManager 
        ? window.wordApp.fileManager.getCleanHtml() 
        : this.editor.innerHTML;
      md = this.htmlToMarkdown(cleanHtml);
    }

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 2000);

    this.toasts.show(`Document Markdown "${filename}" exporté !`, 'success');
  }

  importMarkdownFile(file) {
    if (!file) return;
    this.toasts.show(`Chargement de "${file.name}"...`, 'info');

    const reader = new FileReader();
    reader.onload = (e) => {
      const mdContent = e.target.result;
      const html = this.markdownToHtml(mdContent);

      // Si on est en Mode Markdown, mettre à jour le textarea directement
      if (this.textarea) {
        this.textarea.value = mdContent;
        this.updatePreview();
        this.updateStats();
      }

      // Mettre à jour l'éditeur Word WYSIWYG
      this.editor.innerHTML = html;

      // Extraire le nom de fichier sans extension
      const nameWithoutExt = file.name.replace(/\.(md|markdown|txt)$/i, '');
      if (this.titleInput) {
        this.titleInput.value = `${nameWithoutExt} - Word`;
      }

      if (window.wordApp) {
        if (window.wordApp.history) window.wordApp.history.pushState(true);
        setTimeout(() => {
          if (window.wordApp.pagination) window.wordApp.pagination.updatePagination();
          if (window.wordApp.spellCheck) window.wordApp.spellCheck.scanEditor();
          if (window.wordApp.fileManager) window.wordApp.fileManager.saveToStorage();
        }, 100);
      }

      this.toasts.show(`Fichier Markdown "${file.name}" importé avec succès !`, 'success');
    };
    reader.readAsText(file);
  }

  initEvents() {
    // Boutons de bascule de mode
    this.btnViewMarkdown?.addEventListener('click', () => this.toggleMarkdownMode(true));
    this.btnViewWysiwyg?.addEventListener('click', () => this.toggleMarkdownMode(false));
    this.sbToggleMode?.addEventListener('click', () => this.toggleMarkdownMode());

    // Bouton retour dans la barre d'outils Markdown
    document.getElementById('md-btn-apply-exit')?.addEventListener('click', () => {
      this.toggleMarkdownMode(false);
    });

    // Bascule de la vue fractionnée (Aperçu en direct)
    document.getElementById('md-btn-toggle-split')?.addEventListener('click', () => {
      this.isSplitView = !this.isSplitView;
      if (this.panesContainer) {
        if (this.isSplitView) {
          this.panesContainer.classList.remove('single-pane');
        } else {
          this.panesContainer.classList.add('single-pane');
        }
      }
    });

    // Copier le Markdown
    document.getElementById('md-btn-copy')?.addEventListener('click', async () => {
      if (!this.textarea) return;
      try {
        await navigator.clipboard.writeText(this.textarea.value);
        this.toasts.show('Code Markdown copié dans le presse-papiers !', 'success');
      } catch (err) {
        this.textarea.select();
        document.execCommand('copy');
        this.toasts.show('Code Markdown copié !', 'success');
      }
    });

    // Exportation
    document.getElementById('md-btn-export')?.addEventListener('click', () => this.exportMarkdownFile());
    document.getElementById('btn-export-markdown')?.addEventListener('click', () => {
      const backstage = document.getElementById('backstage-overlay');
      if (backstage) backstage.classList.remove('active');
      this.exportMarkdownFile();
    });

    // Importation
    const triggerFileImport = () => {
      if (this.hiddenMdInput) {
        this.hiddenMdInput.value = '';
        this.hiddenMdInput.click();
      }
    };

    document.getElementById('md-btn-import')?.addEventListener('click', triggerFileImport);
    document.getElementById('btn-insert-markdown')?.addEventListener('click', triggerFileImport);
    document.getElementById('btn-browse-markdown')?.addEventListener('click', () => {
      const backstage = document.getElementById('backstage-overlay');
      if (backstage) backstage.classList.remove('active');
      triggerFileImport();
    });

    this.hiddenMdInput?.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        this.importMarkdownFile(e.target.files[0]);
      }
    });

    // Saisie en direct dans le textarea avec debounce pour l'aperçu
    let previewDebounce = null;
    this.textarea?.addEventListener('input', () => {
      this.updateStats();
      clearTimeout(previewDebounce);
      previewDebounce = setTimeout(() => this.updatePreview(), 100);
    });

    // Support de la touche Tab (indente de 2 espaces) et raccourcis clavier dans le textarea
    this.textarea?.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = this.textarea.selectionStart;
        const end = this.textarea.selectionEnd;
        this.textarea.value = this.textarea.value.substring(0, start) + '  ' + this.textarea.value.substring(end);
        this.textarea.selectionStart = this.textarea.selectionEnd = start + 2;
        this.updatePreview();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        this.exportMarkdownFile();
      }
    });

    // Raccourcis d'insertion dans la barre d'outils Markdown
    this.bindAction('md-action-bold', '**', '**', 'texte en gras');
    this.bindAction('md-action-italic', '*', '*', 'texte en italique');
    this.bindAction('md-action-h1', '# ', '', 'Titre 1');
    this.bindAction('md-action-h2', '## ', '', 'Titre 2');
    this.bindAction('md-action-list', '- ', '', 'Élément de liste');
    this.bindAction('md-action-quote', '> ', '', 'Citation');
    this.bindAction('md-action-code', '```\n', '\n```', 'code');
    this.bindAction('md-action-table', '\n| Colonne 1 | Colonne 2 |\n| --- | --- |\n| Donnée 1 | Donnée 2 |\n', '', '');
    this.bindAction('md-action-link', '[', '](https://exemple.com)', 'texte du lien');

    // Drag and drop universel de fichiers .md sur l'application
    window.addEventListener('dragover', (e) => e.preventDefault());
    window.addEventListener('drop', (e) => {
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        if (file.name.match(/\.(md|markdown)$/i)) {
          e.preventDefault();
          this.importMarkdownFile(file);
        }
      }
    });
  }

  bindAction(btnId, before, after, defaultText) {
    const btn = document.getElementById(btnId);
    if (!btn || !this.textarea) return;

    btn.addEventListener('click', () => {
      const start = this.textarea.selectionStart;
      const end = this.textarea.selectionEnd;
      const selected = this.textarea.value.substring(start, end) || defaultText;

      const replacement = before + selected + after;
      this.textarea.value = this.textarea.value.substring(0, start) + replacement + this.textarea.value.substring(end);

      this.textarea.selectionStart = start + before.length;
      this.textarea.selectionEnd = start + before.length + selected.length;
      this.textarea.focus();

      this.updatePreview();
      this.updateStats();
    });
  }
}

/**
 * ------------------------------------------------------------------------------
 * 7. DICTÉE VOCALE VIA WEB SPEECH API (SPEECH RECOGNITION MANAGER)
 * ------------------------------------------------------------------------------
 */
class SpeechRecognitionManager {
  constructor(editorEngine, toastManager) {
    this.engine = editorEngine;
    this.toasts = toastManager;
    this.isListening = false;
    this.recognition = null;
    this.dictateBtn = document.getElementById('btn-dictate');
    this.dictateLabel = document.getElementById('dictate-btn-label');

    this.init();
  }

  init() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      if (this.dictateBtn) {
        this.dictateBtn.title = "La reconnaissance vocale n'est pas prise en charge par ce navigateur";
        this.dictateBtn.addEventListener('click', () => {
          this.toasts.show("L'API Web Speech n'est pas supportée dans votre navigateur (veuillez utiliser Google Chrome ou Microsoft Edge).", 'error');
        });
      }
      return;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'fr-FR';
      this.recognition.continuous = true;
      this.recognition.interimResults = false;

      this.recognition.onstart = () => {
        this.isListening = true;
        if (this.dictateBtn) this.dictateBtn.classList.add('dictating');
        if (this.dictateLabel) this.dictateLabel.textContent = 'Écoute...';
        this.toasts.show('Dictée vocale active : parlez en français...', 'info');
      };

      this.recognition.onresult = (event) => {
        const last = event.results.length - 1;
        const text = event.results[last][0].transcript;
        if (text) {
          this.engine.exec('insertText', text + ' ');
        }
      };

      this.recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          this.toasts.show('Accès au microphone refusé par le navigateur', 'error');
        } else if (event.error !== 'no-speech') {
          this.toasts.show(`Erreur dictée: ${event.error}`, 'error');
        }
        this.stop();
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (this.dictateBtn) this.dictateBtn.classList.remove('dictating');
        if (this.dictateLabel) this.dictateLabel.textContent = 'Dicter';
      };

      if (this.dictateBtn) {
        this.dictateBtn.addEventListener('click', () => this.toggle());
      }
    } catch (e) {
      console.warn('SpeechRecognition initialization error', e);
    }
  }

  toggle() {
    if (!this.recognition) {
      this.toasts.show("L'API Web Speech n'est pas supportée dans votre navigateur.", 'error');
      return;
    }
    if (this.isListening) {
      this.stop();
    } else {
      this.start();
    }
  }

  start() {
    try {
      this.recognition.start();
    } catch (e) {
      console.warn(e);
    }
  }

  stop() {
    try {
      this.recognition.stop();
    } catch (e) {
      console.warn(e);
    }
  }

  setLanguage(langCode) {
    if (this.recognition) {
      this.recognition.lang = langCode;
    }
  }
}

/**
 * ------------------------------------------------------------------------------
 * 8. VÉRIFICATEUR ORTHOGRAPHIQUE EN TEMPS RÉEL (SPELLCHECK ENGINE)
 * Dictionnaire français étendu, calcul de distance de Levenshtein,
 * soulignement ondulé rouge Microsoft Word et menu de suggestions interactif.
 * ------------------------------------------------------------------------------
 */
class SpellCheckEngine {
  constructor(editor, toastManager, historyManager) {
    this.editor = editor;
    this.toasts = toastManager;
    this.history = historyManager;

    this.isEnabled = true;
    this.currentLanguage = 'fr'; // 'fr' ou 'en'
    this.manualLanguageOverride = false;
    this.ignoredWords = new Set();
    this.customDictionary = this.loadCustomDictionary();
    this.activeErrorSpan = null;
    this.debounceTimer = null;
    this.isScanning = false;

    this.contextMenu = document.getElementById('spellcheck-context-menu');
    this.suggestionsContainer = document.getElementById('spellcheck-suggestions-container');
    this.spellPanel = document.getElementById('spellcheck-panel');
    this.spBody = document.getElementById('sp-body-content');
    this.statusItem = document.getElementById('status-spellcheck');
    this.statusIcon = document.getElementById('spellcheck-status-icon');
    this.statusText = document.getElementById('spellcheck-status-text');
    this.statusLang = document.getElementById('status-lang');

    this.buildDictionary();
    this.initEvents();
    this.loadFullDictionaries();
  }

  async loadFullDictionaries() {
    try {
      // 1. Charger le dictionnaire complet français de référence (~336 000 mots Gutenberg/OpenLexicon)
      const resFr = await fetch('/dict-fr.txt');
      if (resFr.ok) {
        const text = await resFr.text();
        const words = text.split('\n');
        for (let i = 0; i < words.length; i++) {
          const w = words[i].trim().toLowerCase();
          if (w) this.dictionary.add(w);
        }
        console.log(`Dictionnaire français complet chargé : ${this.dictionary.size} mots.`);
      }
    } catch (e) {
      console.warn('Impossible de charger /dict-fr.txt, dictionnaire interne utilisé.', e);
    }

    try {
      // 2. Charger le dictionnaire complet anglais (~370 000 mots)
      const resEn = await fetch('/dict-en.txt');
      if (resEn.ok) {
        const text = await resEn.text();
        const words = text.split('\n');
        for (let i = 0; i < words.length; i++) {
          const w = words[i].trim().toLowerCase();
          if (w) this.englishDictionary.add(w);
        }
        console.log(`Dictionnaire anglais complet chargé : ${this.englishDictionary.size} mots.`);
      }
    } catch (e) {
      console.warn('Impossible de charger /dict-en.txt, dictionnaire interne utilisé.', e);
    }

    this.isFullDictionaryLoaded = true;
    if (this.statusItem) {
      this.statusItem.title = `Vérification orthographique : Dictionnaire exhaustif de ${this.dictionary.size.toLocaleString('fr-FR')} mots actifs`;
    }
    this.scanEditor();
  }

  loadCustomDictionary() {
    try {
      const raw = localStorage.getItem('ms_word_custom_dict');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  saveCustomDictionary() {
    try {
      localStorage.setItem('ms_word_custom_dict', JSON.stringify(this.customDictionary));
    } catch (e) {
      console.warn('Erreur sauvegarde dictionnaire custom', e);
    }
  }

  buildDictionary() {
    // Dictionnaire de référence étendu de la langue française courante (~2000+ mots fréquents)
    const commonFrenchWords = [
      // --- Articles, Déterminants & Pronoms ---
      'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'en', 'ce', 'cet', 'cette', 'ces',
      'mon', 'ton', 'son', 'ma', 'ta', 'sa', 'mes', 'tes', 'ses', 'notre', 'votre', 'leur',
      'nos', 'vos', 'leurs', 'je', 'tu', 'il', 'elle', 'on', 'nous', 'vous', 'ils', 'elles',
      'me', 'te', 'se', 'lui', 'eux', 'moi', 'toi', 'soi', 'y', 'qui', 'que', 'quoi', 'dont',
      'où', 'lequel', 'laquelle', 'lesquels', 'lesquelles', 'auquel', 'auxquels', 'auxquelles',
      'duquel', 'desquels', 'desquelles', 'celui', 'celle', 'ceux', 'celles', 'ceci', 'cela', 'ça',
      'quel', 'quelle', 'quels', 'quelles', 'chacun', 'chacune', 'chaque', 'aucun', 'aucune',
      'nul', 'nulle', 'plusieurs', 'certain', 'certains', 'certaine', 'certaines', 'autre', 'autres',
      'même', 'mêmes', 'tout', 'tous', 'toute', 'toutes', 'rien', 'quelqu', 'quelque', 'quelques',
      'personne', 'tel', 'telle', 'tels', 'telles',

      // --- Prépositions & Conjonctions ---
      'à', 'au', 'aux', 'avec', 'sans', 'sous', 'sur', 'dans', 'par', 'pour', 'vers', 'chez',
      'après', 'avant', 'devant', 'derrière', 'entre', 'contre', 'depuis', 'pendant', 'durant',
      'selon', 'malgré', 'outre', 'parmi', 'sauf', 'hormis', 'vers', 'dès', 'envers', 'comme',
      'si', 'et', 'ou', 'mais', 'donc', 'car', 'ni', 'or', 'lorsque', 'quand', 'quoique', 'puisque',
      'parce', 'afin', 'tandis', 'alors', 'voici', 'voilà', 'afin', 'lors',

      // --- Adverbes & Mots de liaison ---
      'toujours', 'jamais', 'souvent', 'parfois', 'rarement', 'encore', 'déjà', 'aussi', 'bien',
      'mal', 'mieux', 'plus', 'moins', 'très', 'trop', 'peu', 'beaucoup', 'assez', 'tant',
      'autant', 'tellement', 'vraiment', 'ainsi', 'puis', 'ensuite', 'enfin', 'ici', 'là',
      'partout', 'ailleurs', 'ensemble', 'seulement', 'surtout', 'presque', 'environ', 'pourquoi',
      'comment', 'combien', 'oui', 'non', 'peut-être', 'certes', 'sans doute', 'volontiers',
      'cependant', 'néanmoins', 'toutefois', 'd\'ailleurs', 'plutôt', 'dorénavant', 'désormais',
      'longtemps', 'bientôt', 'aussitôt', 'tard', 'tôt', 'vite', 'lentement', 'facilement',
      'directement', 'parfaitement', 'exactement', 'actuellement', 'généralement', 'simplement',
      'naturellement', 'clairement', 'hautement', 'entièrement', 'continuellement',

      // --- Nombres & Chiffres ---
      'zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix',
      'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'vingt', 'trente', 'quarante',
      'cinquante', 'soixante', 'cent', 'mille', 'million', 'milliard', 'premier', 'première',
      'premiers', 'premières', 'deuxième', 'troisième', 'quatrième', 'cinquième', 'dernier',
      'dernière', 'derniers', 'dernières',

      // --- Verbes essentiels : Être & Avoir ---
      'être', 'suis', 'es', 'est', 'sommes', 'êtes', 'sont', 'étais', 'était', 'étions', 'étiez',
      'étaient', 'fus', 'fut', 'fûmes', 'fûtes', 'furent', 'serai', 'seras', 'sera', 'serons',
      'serez', 'seront', 'serais', 'serait', 'serions', 'seriez', 'seraient', 'été', 'étant',
      'sois', 'soit', 'soyons', 'soyez', 'soient',
      'avoir', 'ai', 'as', 'a', 'avons', 'avez', 'ont', 'avais', 'avait', 'avions', 'aviez',
      'avaient', 'eus', 'eut', 'eûmes', 'eûtes', 'eurent', 'aurai', 'auras', 'aura', 'aurons',
      'aurez', 'auront', 'aurais', 'aurait', 'aurions', 'auriez', 'auraient', 'eu', 'eue', 'eus',
      'eues', 'ayant', 'aie', 'ait', 'ayons', 'ayez', 'aient',

      // --- Verbes d'action & courants ---
      'faire', 'fais', 'fait', 'faisons', 'faites', 'font', 'faisais', 'faisait', 'faisions',
      'faisiez', 'faisaient', 'ferai', 'feras', 'fera', 'ferons', 'ferez', 'feront', 'ferais',
      'ferait', 'fassent', 'fasse',
      'aller', 'vais', 'vas', 'va', 'allons', 'allez', 'vont', 'allais', 'allait', 'allions',
      'alliez', 'allaient', 'irai', 'iras', 'ira', 'irons', 'irez', 'iront', 'irais', 'irait', 'allé',
      'pouvoir', 'peux', 'peut', 'pouvons', 'pouvez', 'peuvent', 'pouvais', 'pouvait', 'pouvions',
      'pouviez', 'pouvaient', 'pourrai', 'pourra', 'pourrons', 'pourrez', 'pourront', 'pourrais',
      'pourrait', 'pu', 'puisse', 'puissent',
      'vouloir', 'veux', 'veut', 'voulons', 'voulez', 'veulent', 'voulais', 'voulait', 'voulions',
      'vouliez', 'voulaient', 'voudrai', 'voudra', 'voudrons', 'voudrez', 'voudront', 'voudrais',
      'voudrait', 'voulu', 'veuille', 'veuillent',
      'devoir', 'dois', 'doit', 'devons', 'devez', 'doivent', 'devais', 'devait', 'devions',
      'deviez', 'devaient', 'devrai', 'devra', 'devrons', 'devrez', 'devront', 'devrais', 'devrait', 'dû',
      'savoir', 'sais', 'sait', 'savons', 'savez', 'savent', 'savais', 'savait', 'savions',
      'saviez', 'savaient', 'saurai', 'saura', 'saurons', 'saurez', 'sauront', 'saurais', 'saurait', 'su',
      'voir', 'vois', 'voit', 'voyons', 'voyez', 'voient', 'voyais', 'voyait', 'voyions', 'voyiez',
      'voyaient', 'verrai', 'verras', 'verra', 'verrons', 'verrez', 'verront', 'verrais', 'verrait', 'vu',
      'dire', 'dis', 'dit', 'disons', 'dites', 'disent', 'disais', 'disait', 'disions', 'disiez',
      'disaient', 'dirai', 'diras', 'dira', 'dirons', 'direz', 'diront', 'dirais', 'dirait',
      'falloir', 'faut', 'faudra', 'faudrait', 'fallait', 'fallu',
      'prendre', 'prends', 'prend', 'prenons', 'prenez', 'prennent', 'prenait', 'prendra', 'pris',
      'mettre', 'mets', 'met', 'mettons', 'mettez', 'mettent', 'mettait', 'mettra', 'mis',
      'tenir', 'tiens', 'tient', 'tenons', 'tenez', 'tiennent', 'tenait', 'tiendra', 'tenu',
      'venir', 'viens', 'vient', 'venons', 'venez', 'viennent', 'venait', 'viendra', 'venu',
      'donner', 'donne', 'donnes', 'donnons', 'donnez', 'donnent', 'donnait', 'donnera', 'donné',
      'trouver', 'trouve', 'trouves', 'trouvons', 'trouvez', 'trouvent', 'trouvait', 'trouvera', 'trouvé',
      'penser', 'pense', 'penses', 'pensons', 'pensez', 'pensent', 'pensait', 'pensera', 'pensé',
      'parler', 'parle', 'parles', 'parlons', 'parlez', 'parlent', 'parlait', 'parlera', 'parlé',
      'aimer', 'aime', 'aimes', 'aimons', 'aimez', 'aiment', 'aimait', 'aimera', 'aimé',
      'passer', 'passe', 'passes', 'passons', 'passez', 'passent', 'passait', 'passera', 'passé',
      'rester', 'reste', 'restes', 'restons', 'restez', 'restent', 'restait', 'restera', 'resté',
      'porter', 'porte', 'portes', 'portons', 'portez', 'portent', 'portait', 'portera', 'porté',
      'entendre', 'entends', 'entend', 'entendons', 'entendez', 'entendent', 'entendait', 'entendu',
      'comprendre', 'comprends', 'comprend', 'comprenons', 'comprenez', 'comprennent', 'compris',
      'rendre', 'rends', 'rend', 'rendons', 'rendez', 'rendent', 'rendait', 'rendu',
      'attendre', 'attends', 'attend', 'attendons', 'attendez', 'attendent', 'attendait', 'attendu',
      'permettre', 'permets', 'permet', 'permettons', 'permettez', 'permettent', 'permettait', 'permis',
      'commencer', 'commence', 'commences', 'commençons', 'commencez', 'commencent', 'commencé',
      'créer', 'crée', 'crées', 'créons', 'créez', 'créent', 'créé', 'créateur', 'création',
      'modifier', 'modifie', 'modifies', 'modifions', 'modifiez', 'modifient', 'modifié',
      'supprimer', 'supprime', 'supprimes', 'supprimons', 'supprimez', 'suppriment', 'supprimé',
      'ajouter', 'ajoute', 'ajoutes', 'ajoutons', 'ajoutez', 'ajoutent', 'ajouté',
      'utiliser', 'utilise', 'utilises', 'utilisons', 'utilisez', 'utilisent', 'utilisé',
      'ouvrir', 'ouvre', 'ouvres', 'ouvrons', 'ouvrez', 'ouvrent', 'ouvert',
      'enregistrer', 'enregistre', 'enregistres', 'enregistrons', 'enregistrez', 'enregistrent', 'enregistré',
      'imprimer', 'imprime', 'imprimes', 'imprimons', 'imprimez', 'impriment', 'imprimé', 'impression',
      'insérer', 'insère', 'insères', 'insérons', 'insérez', 'insèrent', 'inséré', 'insertion',
      'vérifier', 'vérifie', 'vérifies', 'vérifions', 'vérifiez', 'vérifient', 'vérifié', 'vérification',
      'afficher', 'affiche', 'affiches', 'affichons', 'affichez', 'affichent', 'affiché', 'affichage',
      'sauvegarder', 'sauvegarde', 'sauvegardes', 'sauvegardons', 'sauvegardez', 'sauvegardé',
      'rechercher', 'recherche', 'recherches', 'recherchons', 'recherchez', 'recherché',
      'remplacer', 'remplace', 'remplaces', 'remplaçons', 'remplacez', 'remplacé', 'remplacement',
      'sélectionner', 'sélectionne', 'sélectionnes', 'sélectionné', 'sélection', 'sélectionner',
      'choisir', 'choisit', 'choisissent', 'choisi', 'choix', 'lire', 'lis', 'lit', 'lisons', 'lisez', 'lisent', 'lu',
      'écrire', 'écris', 'écrit', 'écrivons', 'écrivez', 'écrivent', 'écrivait', 'écrira',
      'suivre', 'suis', 'suit', 'suivons', 'suivez', 'suivent', 'suivi', 'connaître', 'connais', 'connaît',
      'connaissons', 'connaissez', 'connaissent', 'connu', 'reconnaître', 'reconnais', 'reconnaît',
      'développer', 'développe', 'développent', 'développé', 'développement',

      // --- Vocabulaire de Microsoft Word & RIA & Bureau ---
      'microsoft', 'word', 'clone', 'web', 'navigateur', 'éditeur', 'édition', 'interface', 'application',
      'document', 'documents', 'page', 'pages', 'texte', 'textes', 'format', 'formats', 'formatage', 'style', 'styles',
      'police', 'polices', 'taille', 'tailles', 'titre', 'titres', 'sous-titre', 'paragraphe', 'paragraphes',
      'citation', 'citations', 'code', 'tableau', 'tableaux', 'cellule', 'cellules', 'colonne', 'colonnes',
      'ligne', 'lignes', 'en-tête', 'bordure', 'bordures', 'image', 'images', 'lien', 'liens', 'saut', 'sauts',
      'règle', 'règles', 'marge', 'marges', 'retrait', 'retraits', 'alignement', 'gauche', 'centre', 'droite',
      'justifié', 'justifier', 'centré', 'gras', 'italique', 'souligné', 'barré', 'indice', 'exposant',
      'couleur', 'couleurs', 'surbrillance', 'puces', 'numérotation', 'numéros', 'indentation', 'historique',
      'annuler', 'rétablir', 'sauvegarde', 'stockage', 'fichier', 'fichiers', 'import', 'importer', 'export',
      'exporter', 'téléchargement', 'télécharger', 'zoom', 'thème', 'sombre', 'clair', 'feuille', 'papier',
      'blanc', 'blanche', 'barre', 'état', 'statut', 'mot', 'mots', 'caractère', 'caractères', 'orthographe',
      'grammaire', 'dictée', 'vocale', 'voix', 'dictionnaire', 'suggestions', 'erreur', 'erreurs', 'correcteur',
      'correction', 'accueil', 'révision', 'aide', 'raccourcis', 'options', 'propriétés', 'rapport', 'lettre',
      'réunion', 'activité', 'compte-rendu', 'professionnel', 'professionnelle', 'fonctionnalité', 'fonctionnalités',
      'disponible', 'disponibles', 'complet', 'complète', 'natif', 'native', 'propre', 'haute', 'fidélité',
      'qualité', 'expérience', 'directement', 'facilement', 'simplicité', 'sophistication', 'suprême',
      'bienvenue', 'félicitations', 'recommandations', 'direction', 'générale', 'ressources', 'humaines',
      'candidature', 'poste', 'développeur', 'développeurs', 'expertise', 'ingénierie', 'logicielle',
      'normes', 'standards', 'industrie', 'synthèse', 'performance', 'résultats', 'indicateurs', 'validation',
      'étapes', 'décisions', 'livrables', 'équipe', 'projets', 'calibri', 'aptos', 'arial', 'segoe', 'times',
      'georgia', 'verdana', 'courier', 'consotas', 'wysiwyg', 'mammoth', 'html', 'docx', 'json', 'pdf',
      'plein', 'écran', 'raccourci', 'clavier', 'souris', 'curseur', 'sélection', 'presse-papiers', 'copier',
      'couper', 'coller', 'flottant', 'menu', 'contexte', 'modale', 'dialogue', 'panneau', 'volet',

      // --- Mots généraux fréquents ---
      'temps', 'moment', 'moments', 'jour', 'jours', 'nuit', 'nuits', 'matin', 'matins', 'soir', 'soirs',
      'année', 'années', 'mois', 'semaine', 'semaines', 'heure', 'heures', 'minute', 'minutes', 'seconde',
      'secondes', 'personne', 'personnes', 'homme', 'hommes', 'femme', 'femmes', 'enfant', 'enfants',
      'monde', 'vie', 'chose', 'choses', 'raison', 'raisons', 'forme', 'formes', 'moyen', 'moyens',
      'point', 'points', 'niveau', 'niveaux', 'groupe', 'groupes', 'problème', 'problèmes', 'solution',
      'solutions', 'valeur', 'valeurs', 'ordre', 'droit', 'droits', 'besoin', 'besoins', 'action', 'actions',
      'cas', 'part', 'partie', 'parties', 'place', 'places', 'côté', 'côtés', 'pays', 'ville', 'villes',
      'travail', 'travaux', 'maison', 'maisons', 'bureau', 'bureaux', 'entreprise', 'entreprises',
      'société', 'sociétés', 'service', 'services', 'produit', 'produits', 'système', 'systèmes',
      'exemple', 'exemples', 'début', 'fin', 'fond', 'suite', 'effet', 'effets', 'idée', 'idées',
      'sens', 'vue', 'voix', 'corps', 'main', 'mains', 'tête', 'yeux', 'regard', 'mot', 'parole',
      'lettre', 'chiffre', 'nombre', 'force', 'matière', 'mesure', 'prix', 'terme', 'termes',
      'espace', 'espaces', 'plan', 'plans', 'zone', 'zones', 'site', 'sites', 'centre', 'centres',
      'grand', 'grands', 'grande', 'grandes', 'petit', 'petits', 'petite', 'petites', 'nouveau',
      'nouveaux', 'nouvelle', 'nouvelles', 'bon', 'bons', 'bonne', 'bonnes', 'mauvais', 'mauvaise',
      'vrai', 'vraie', 'faux', 'fausse', 'haut', 'haute', 'hauts', 'hautes', 'bas', 'basse', 'bas',
      'long', 'longs', 'longue', 'longues', 'court', 'courts', 'courte', 'courtes', 'large', 'larges',
      'clair', 'claire', 'clairs', 'claires', 'possible', 'possibles', 'impossible', 'impossibles',
      'important', 'importante', 'importants', 'importantes', 'nécessaire', 'nécessaires', 'simple',
      'simples', 'facile', 'faciles', 'difficile', 'difficiles', 'actuel', 'actuelle', 'actuels',
      'actuelles', 'public', 'publique', 'publics', 'publiques', 'social', 'sociale', 'sociaux',
      'économique', 'économiques', 'stratégique', 'stratégiques', 'national', 'nationale', 'nationaux',
      'aujourd\'hui', 'bonjour', 'merci', 'salutations', 'distinguées', 'madame', 'monsieur', 'cher',
      'chère', 'chers', 'chères', 'direction', 'équipe', 'cadre', 'client', 'clients', 'responsable',
      'projet', 'réussi', 'succès', 'optimisation', 'déploiement', 'fonction', 'fonctions', 'accord',
      'sécurité', 'donnée', 'données', 'base', 'bases', 'gestion', 'outil', 'outils', 'élément', 'éléments',
      'contenu', 'contenus', 'structure', 'structures', 'modèle', 'modèles', 'information', 'informations',

      // --- Vocabulaire étendu supplémentaire (qualificatifs, actions, vie quotidienne, grammaire) ---
      'correct', 'corrects', 'correcte', 'correctes', 'correctement', 'correction', 'corrections',
      'correcteur', 'correctrice', 'correcteurs', 'correctrices', 'orthographe', 'orthographique',
      'orthographiques', 'grammaire', 'grammatical', 'grammaticale', 'grammaticaux', 'grammaticales',
      'faute', 'fautes', 'souligner', 'souligné', 'soulignée', 'soulignés', 'soulignées', 'soulignement',
      'soulignements', 'mot', 'mots', 'phrase', 'phrases', 'vocabulaire', 'langue', 'langues',
      'dictionnaire', 'dictionnaires', 'suggestion', 'suggestions', 'proposer', 'proposition', 'propositions',
      'souhaiter', 'souhaite', 'souhaites', 'souhaitons', 'souhaitez', 'souhaitent', 'souhaité',
      'écouter', 'écoute', 'regarder', 'regarde', 'chercher', 'cherche', 'trouver', 'trouve',
      'demander', 'demande', 'répondre', 'répond', 'répondu', 'réponse', 'réponses', 'question', 'questions',
      'expliquer', 'explique', 'explication', 'explications', 'comprendre', 'compris', 'compréhension',
      'apprendre', 'appris', 'apprentissage', 'enseigner', 'enseignant', 'formation', 'cours',
      'travailler', 'travaille', 'fonctionner', 'fonctionne', 'fonctionnement', 'opération', 'opérations',
      'changer', 'change', 'changement', 'changements', 'améliorer', 'améliore', 'amélioration', 'améliorations',
      'corriger', 'corrige', 'corrigé', 'corrigée', 'corrigés', 'corrigées', 'corrigent', 'corrigera',
      'ajuster', 'ajuste', 'ajustement', 'ajustements', 'régler', 'règle', 'règlement',
      'arriver', 'arrive', 'partir', 'part', 'parti', 'sortie', 'sortir', 'entre', 'entrer',
      'monter', 'descendre', 'tomber', 'vivre', 'vie', 'vécue', 'présent', 'présente', 'présents', 'présentes',
      'passé', 'passée', 'futur', 'future', 'futurs', 'futures', 'temps', 'période', 'périodes',
      'durée', 'délai', 'délais', 'date', 'dates', 'calendrier', 'calendriers', 'rendez-vous',
      'bon', 'bonne', 'bons', 'bonnes', 'mauvais', 'mauvaise', 'mauvaises', 'excellent', 'excellente',
      'excellents', 'excellentes', 'parfait', 'parfaite', 'parfaits', 'parfaites', 'juste', 'justes',
      'vrai', 'vraie', 'vrais', 'vraies', 'faux', 'fausse', 'fausses', 'vérité', 'réalité',
      'rapide', 'rapides', 'rapidement', 'lent', 'lente', 'lents', 'lentes', 'lentement',
      'lourd', 'lourde', 'lourds', 'lourdes', 'léger', 'légère', 'légers', 'légères', 'légèrement',
      'fort', 'forte', 'forts', 'fortes', 'faible', 'faibles', 'faiblesse', 'force',
      'chaud', 'chaude', 'chauds', 'chaudes', 'froid', 'froide', 'froids', 'froides',
      'beau', 'belle', 'beaux', 'belles', 'beauté', 'joli', 'jolie', 'jolis', 'jolies',
      'grand', 'grande', 'grands', 'grandes', 'grandeur', 'petit', 'petite', 'petits', 'petites',
      'nouveau', 'nouvelle', 'nouveaux', 'nouvelles', 'ancien', 'ancienne', 'anciens', 'anciennes',
      'jeune', 'jeunes', 'jeunesse', 'vieux', 'vieille', 'vieilles', 'âge', 'âgé',
      'heureux', 'heureuse', 'heureuses', 'malheureux', 'malheureuse', 'joie', 'tristesse',
      'content', 'contente', 'contents', 'contentes', 'satisfait', 'satisfaite', 'satisfaction',
      'calme', 'calmes', 'tranquille', 'tranquilles', 'serein', 'sereine', 'confiance',
      'sûr', 'sûre', 'sûrs', 'sûres', 'sûrement', 'certain', 'certaine', 'certains', 'certaines', 'certitude',
      'possible', 'possibles', 'possibilité', 'possibilités', 'impossible', 'impossibles',
      'probable', 'probables', 'probablement', 'improbable', 'capacité', 'capacités',
      'utile', 'utiles', 'utilité', 'inutile', 'inutiles', 'pratique', 'pratiques',
      'essentiel', 'essentielle', 'essentiels', 'essentielles', 'fondamental', 'fondamentale',
      'naturel', 'naturelle', 'naturels', 'naturelles', 'naturellement', 'général', 'générale', 'généraux',
      'spécial', 'spéciale', 'spéciaux', 'spéciales', 'particulier', 'particulière', 'particuliers',
      'principal', 'principale', 'principaux', 'principales', 'majeur', 'majeure', 'majeurs', 'majeures',
      'mineur', 'mineure', 'mineurs', 'mineures', 'unique', 'uniques', 'seul', 'seule', 'seuls', 'seules',
      'propre', 'propres', 'propreté', 'sale', 'sales', 'plein', 'pleine', 'pleins', 'pleines',
      'vide', 'vides', 'entier', 'entière', 'entiers', 'entières', 'entièrement', 'total', 'totale',
      'totaux', 'totales', 'totalement', 'partiel', 'partielle', 'partiels', 'partielles',
      'direct', 'directe', 'directs', 'directes', 'indirect', 'indirecte', 'indirects', 'indirectes',
      'personnel', 'personnelle', 'personnels', 'personnelles', 'professionnel', 'professionnelle',
      'collectif', 'collective', 'collectifs', 'collectives', 'commun', 'commune', 'communs', 'communes',
      'ami', 'amie', 'amis', 'amies', 'amitié', 'collègue', 'collègues', 'collaborateur', 'collaborateurs',
      'partenaire', 'partenaires', 'société', 'entreprise', 'organisation', 'association', 'fédération',
      'maison', 'maisons', 'appartement', 'appartements', 'bâtiment', 'bâtiments', 'immeuble', 'immeubles',
      'chambre', 'chambres', 'salle', 'salles', 'pièce', 'pièces', 'bureau', 'bureaux',
      'ville', 'villes', 'village', 'villages', 'pays', 'région', 'régions', 'territoire', 'territoires',
      'département', 'départements', 'monde', 'terre', 'ciel', 'mer', 'océan', 'fleuve', 'rivière',
      'nature', 'animal', 'animaux', 'arbre', 'arbres', 'plante', 'plantes', 'fleur', 'fleurs',
      'soleil', 'lune', 'étoile', 'étoiles', 'pluie', 'vent', 'neige', 'lumière', 'ombre',
      'couleur', 'rouge', 'bleu', 'vert', 'jaune', 'noir', 'blanc', 'gris', 'orange', 'rose', 'violet',
      'ordinateur', 'ordinateurs', 'clavier', 'claviers', 'souris', 'écran', 'écrans', 'fenêtre', 'fenêtres',
      'bouton', 'boutons', 'menu', 'menus', 'onglet', 'onglets', 'volet', 'volets', 'panneau', 'panneaux',
      'logiciel', 'logiciels', 'application', 'applications', 'navigateur', 'navigateurs', 'internet', 'web',
      'réseau', 'réseaux', 'serveur', 'serveurs', 'site', 'sites', 'lien', 'liens', 'adresse', 'adresses',
      'fichier', 'fichiers', 'dossier', 'dossiers', 'document', 'documents', 'page', 'pages', 'feuille',
      'titre', 'titres', 'sous-titre', 'chapitre', 'chapitres', 'section', 'sections', 'partie', 'parties',
      'paragraphe', 'paragraphes', 'ligne', 'lignes', 'colonne', 'colonnes', 'tableau', 'tableaux',
      'cellule', 'cellules', 'marge', 'marges', 'retrait', 'retraits', 'bordure', 'bordures', 'cadre',
      'police', 'polices', 'taille', 'tailles', 'style', 'styles', 'format', 'formats', 'formatage',
      'gras', 'italique', 'souligné', 'barré', 'indice', 'exposant', 'alignement', 'gauche', 'droite',
      'centre', 'justifié', 'interligne', 'espacement', 'puce', 'puces', 'numéro', 'numéros', 'numérotation',
      'recherche', 'rechercher', 'remplace', 'remplacer', 'sélection', 'sélectionner', 'copier', 'coller',
      'couper', 'annuler', 'rétablir', 'sauvegarder', 'enregistrer', 'ouvrir', 'fermer', 'imprimer', 'export',
      'aide', 'raccourci', 'raccourcis', 'option', 'options', 'paramètre', 'paramètres', 'préférence',
      'contact', 'contacts', 'message', 'messages', 'courriel', 'lettre', 'lettres', 'note', 'notes',
      'avis', 'opinion', 'remarque', 'remarques', 'commentaire', 'commentaires', 'critique', 'critiques',
      'conseil', 'conseils', 'recommandation', 'recommandations', 'décision', 'décisions', 'choix',
      'objectif', 'objectifs', 'but', 'buts', 'finalité', 'cible', 'cibles', 'stratégie', 'stratégies',
      'plan', 'plans', 'action', 'actions', 'étape', 'étapes', 'phase', 'phases', 'jalon', 'jalons',
      'résultat', 'résultats', 'succès', 'réussite', 'performance', 'performances', 'progrès',
      'erreur', 'erreurs', 'faute', 'fautes', 'défaut', 'défauts', 'anomalie', 'anomalies', 'problème',
      'solution', 'solutions', 'résolution', 'réponse', 'réponses', 'issue', 'issues',
      'terme', 'termes', 'notion', 'notions', 'concept', 'concepts', 'principe', 'principes',
      'règle', 'règles', 'loi', 'lois', 'norme', 'normes', 'standard', 'standards', 'critère', 'critères',
      'valeur', 'valeurs', 'quantité', 'quantités', 'mesure', 'mesures', 'taux', 'pourcentage', 'chiffre',
      'nombre', 'nombres', 'total', 'somme', 'différence', 'moyenne', 'maximum', 'minimum',
      'début', 'commencement', 'milieu', 'fin', 'terme', 'conclusion', 'introduction', 'sommaire'
    ];

    this.dictionary = new Set(commonFrenchWords.map((w) => w.toLowerCase()));

    // Dictionnaire étendu de la langue anglaise (~1200+ mots essentiels)
    const commonEnglishWords = [
      // Pronouns & Determiners
      'the', 'a', 'an', 'this', 'that', 'these', 'those', 'my', 'your', 'his', 'her', 'its', 'our', 'their',
      'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'us', 'them', 'who', 'whom', 'whose', 'which',
      'what', 'anyone', 'someone', 'everyone', 'no one', 'anything', 'something', 'everything', 'nothing',
      'some', 'any', 'every', 'each', 'all', 'both', 'either', 'neither', 'one', 'two', 'three', 'four', 'five',
      'six', 'seven', 'eight', 'nine', 'ten', 'hundred', 'thousand', 'million', 'first', 'second', 'third',

      // Prepositions & Conjunctions
      'and', 'but', 'or', 'so', 'yet', 'for', 'nor', 'because', 'although', 'though', 'since', 'unless', 'until',
      'while', 'in', 'on', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during',
      'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'out', 'off', 'over', 'under', 'again',
      'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how',

      // Adverbs & Common words
      'not', 'no', 'yes', 'very', 'too', 'quite', 'just', 'already', 'always', 'never', 'often', 'sometimes',
      'usually', 'really', 'almost', 'also', 'well', 'now', 'only', 'even', 'back', 'still', 'away', 'ever',
      'perhaps', 'probably', 'certainly', 'actually', 'today', 'tomorrow', 'yesterday', 'tonight',

      // Verbs (common forms)
      'be', 'am', 'is', 'are', 'was', 'were', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did',
      'done', 'doing', 'say', 'says', 'said', 'saying', 'go', 'goes', 'went', 'gone', 'going', 'get', 'gets', 'got',
      'getting', 'make', 'makes', 'made', 'making', 'know', 'knows', 'knew', 'known', 'knowing', 'think', 'thinks',
      'thought', 'thinking', 'take', 'takes', 'took', 'taken', 'taking', 'see', 'sees', 'saw', 'seen', 'seeing',
      'come', 'comes', 'came', 'coming', 'want', 'wants', 'wanted', 'wanting', 'look', 'looks', 'looked', 'looking',
      'use', 'uses', 'used', 'using', 'find', 'finds', 'found', 'finding', 'give', 'gives', 'gave', 'given', 'giving',
      'tell', 'tells', 'told', 'telling', 'work', 'works', 'worked', 'working', 'call', 'calls', 'called', 'calling',
      'try', 'tries', 'tried', 'trying', 'ask', 'asks', 'asked', 'asking', 'need', 'needs', 'needed', 'needing',
      'feel', 'feels', 'felt', 'feeling', 'become', 'becomes', 'became', 'becoming', 'leave', 'leaves', 'left',
      'leaving', 'put', 'puts', 'putting', 'mean', 'means', 'meant', 'meaning', 'keep', 'keeps', 'kept', 'keeping',
      'let', 'lets', 'letting', 'begin', 'begins', 'began', 'begun', 'beginning', 'seem', 'seems', 'seemed', 'seeming',
      'help', 'helps', 'helped', 'helping', 'talk', 'talks', 'talked', 'talking', 'turn', 'turns', 'turned', 'turning',
      'start', 'starts', 'started', 'starting', 'show', 'shows', 'showed', 'shown', 'showing', 'hear', 'hears',
      'heard', 'hearing', 'play', 'plays', 'played', 'playing', 'run', 'runs', 'ran', 'running', 'move', 'moves',
      'moved', 'moving', 'like', 'likes', 'liked', 'liking', 'live', 'lives', 'lived', 'living', 'believe', 'believes',
      'believed', 'believing', 'hold', 'holds', 'held', 'holding', 'bring', 'brings', 'brought', 'bringing', 'happen',
      'happens', 'happened', 'happening', 'write', 'writes', 'wrote', 'written', 'writing', 'provide', 'provides',
      'provided', 'providing', 'sit', 'sits', 'sat', 'sitting', 'stand', 'stands', 'stood', 'standing', 'lose',
      'loses', 'lost', 'losing', 'pay', 'pays', 'paid', 'paying', 'meet', 'meets', 'met', 'meeting', 'include',
      'includes', 'included', 'including', 'continue', 'continues', 'continued', 'continuing', 'set', 'sets', 'setting',
      'learn', 'learns', 'learned', 'learning', 'change', 'changes', 'changed', 'changing', 'lead', 'leads', 'led',
      'leading', 'understand', 'understands', 'understood', 'understanding', 'watch', 'watches', 'watched', 'watching',
      'follow', 'follows', 'followed', 'following', 'stop', 'stops', 'stopped', 'stopping', 'create', 'creates',
      'created', 'creating', 'speak', 'speaks', 'spoke', 'spoken', 'speaking', 'read', 'reads', 'reading', 'allow',
      'allows', 'allowed', 'allowing', 'add', 'adds', 'added', 'adding', 'spend', 'spends', 'spent', 'spending',
      'grow', 'grows', 'grew', 'grown', 'growing', 'open', 'opens', 'opened', 'opening', 'walk', 'walks', 'walked',
      'walking', 'win', 'wins', 'won', 'winning', 'offer', 'offers', 'offered', 'offering', 'remember', 'remembers',
      'remembered', 'remembering', 'love', 'loves', 'loved', 'loving', 'consider', 'considers', 'considered',
      'considering', 'appear', 'appears', 'appeared', 'appearing', 'buy', 'buys', 'bought', 'buying', 'wait', 'waits',
      'waited', 'waiting', 'serve', 'serves', 'served', 'serving', 'send', 'sends', 'sent', 'sending', 'expect',
      'expects', 'expected', 'expecting', 'build', 'builds', 'built', 'building', 'stay', 'stays', 'stayed', 'staying',
      'fall', 'falls', 'fell', 'fallen', 'falling', 'cut', 'cuts', 'cutting', 'reach', 'reaches', 'reached', 'reaching',
      'kill', 'kills', 'killed', 'killing', 'remain', 'remains', 'remained', 'remaining', 'suggest', 'suggests',
      'suggested', 'suggesting', 'raise', 'raises', 'raised', 'raising', 'pass', 'passes', 'passed', 'passing',
      'sell', 'sells', 'sold', 'selling', 'require', 'requires', 'required', 'requiring', 'report', 'reports',
      'reported', 'reporting', 'decide', 'decides', 'decided', 'deciding', 'pull', 'pulls', 'pulled', 'pulling',
      'can', 'could', 'will', 'would', 'shall', 'should', 'may', 'might', 'must',

      // Office & Word & Web
      'microsoft', 'word', 'clone', 'document', 'documents', 'text', 'texts', 'editor', 'page', 'pages', 'paragraph',
      'paragraphs', 'font', 'fonts', 'size', 'sizes', 'style', 'styles', 'format', 'formats', 'formatting', 'bold',
      'italic', 'underline', 'strikethrough', 'heading', 'title', 'subheading', 'quote', 'code', 'table', 'tables',
      'cell', 'cells', 'column', 'columns', 'row', 'rows', 'header', 'border', 'borders', 'image', 'images', 'link',
      'links', 'break', 'breaks', 'ruler', 'margin', 'margins', 'indent', 'outdent', 'alignment', 'left', 'right',
      'center', 'justify', 'color', 'colors', 'highlight', 'bullet', 'bullets', 'number', 'numbers', 'numbering',
      'history', 'undo', 'redo', 'save', 'saving', 'saved', 'auto', 'storage', 'file', 'files', 'open', 'export',
      'import', 'download', 'print', 'zoom', 'theme', 'dark', 'light', 'sheet', 'paper', 'white', 'status', 'bar',
      'character', 'characters', 'spelling', 'grammar', 'check', 'checker', 'dictate', 'dictation', 'speech',
      'voice', 'dictionary', 'suggestion', 'suggestions', 'error', 'errors', 'correct', 'correction', 'ignore',
      'home', 'insert', 'view', 'help', 'shortcuts', 'options', 'properties', 'report', 'letter', 'meeting',
      'activity', 'minutes', 'professional', 'feature', 'features', 'available', 'complete', 'native', 'clean',
      'high', 'fidelity', 'quality', 'experience', 'directly', 'easily', 'simplicity', 'supreme', 'welcome',
      'congratulations', 'recommendations', 'direction', 'human', 'resources', 'application', 'position', 'developer',
      'engineering', 'software', 'standards', 'industry', 'summary', 'performance', 'results', 'indicators',
      'validation', 'steps', 'decisions', 'deliverables', 'team', 'teams', 'project', 'projects', 'calibri', 'aptos',
      'arial', 'segoe', 'times', 'georgia', 'verdana', 'courier', 'wysiwyg', 'html', 'docx', 'json', 'pdf',
      'fullscreen', 'keyboard', 'mouse', 'cursor', 'selection', 'clipboard', 'copy', 'cut', 'paste',

      // Common Nouns & Adjectives
      'time', 'year', 'years', 'people', 'way', 'day', 'days', 'man', 'men', 'woman', 'women', 'child', 'children',
      'government', 'company', 'companies', 'number', 'group', 'groups', 'problem', 'problems', 'fact', 'facts',
      'hand', 'hands', 'part', 'parts', 'place', 'places', 'case', 'cases', 'week', 'weeks', 'system', 'systems',
      'program', 'programs', 'question', 'questions', 'work', 'night', 'nights', 'point', 'points', 'home',
      'water', 'room', 'rooms', 'mother', 'area', 'areas', 'money', 'story', 'stories', 'month', 'months', 'lot',
      'right', 'study', 'book', 'books', 'eye', 'eyes', 'job', 'jobs', 'business', 'issue', 'issues', 'side',
      'sides', 'kind', 'head', 'house', 'service', 'services', 'friend', 'friends', 'father', 'power', 'hour',
      'hours', 'game', 'line', 'end', 'member', 'members', 'law', 'car', 'cars', 'city', 'cities', 'community',
      'name', 'names', 'president', 'minute', 'minutes', 'idea', 'ideas', 'kid', 'body', 'back', 'parent',
      'parents', 'face', 'level', 'office', 'door', 'health', 'person', 'history', 'party', 'result', 'results',
      'change', 'changes', 'morning', 'reason', 'reasons', 'research', 'food', 'moment', 'air', 'teacher', 'force',
      'education', 'good', 'new', 'first', 'last', 'long', 'great', 'little', 'own', 'other', 'others', 'old',
      'big', 'high', 'different', 'small', 'large', 'next', 'early', 'young', 'important', 'few', 'public', 'bad',
      'same', 'able', 'free', 'real', 'best', 'full', 'easy', 'strong', 'special', 'clear', 'recent', 'certain',
      'personal', 'open', 'likely', 'short', 'single', 'medical', 'current', 'wrong', 'private', 'past', 'foreign',
      'fine', 'common', 'poor', 'natural', 'significant', 'similar', 'hot', 'dead', 'central', 'happy', 'serious',
      'ready', 'simple', 'left', 'physical', 'general', 'environmental', 'financial', 'blue', 'democratic', 'dark',
      'various', 'entire', 'close', 'legal', 'religious', 'cold', 'final', 'main', 'green', 'nice', 'huge',
      'popular', 'traditional', 'cultural'
    ];

    this.englishDictionary = new Set(commonEnglishWords.map((w) => w.toLowerCase()));

    // Mots d'arrêt (stopwords) distinctifs pour la détection automatique de la langue
    this.frenchStopwords = new Set([
      'le', 'la', 'les', 'des', 'du', 'de', 'un', 'une', 'est', 'sont', 'dans', 'pour', 'avec', 'sur', 'qui',
      'que', 'ce', 'cette', 'ces', 'nous', 'vous', 'ils', 'elles', 'pas', 'plus', 'mais', 'donc', 'car', 'ou',
      'aux', 'par', 'en', 'au', 'ne', 'se', 'ont', 'fait', 'être', 'avoir', 'très', 'comme', 'bien', 'tout',
      'aussi', 'été', 'votre', 'notre', 'leur', 'leurs', 'sans', 'sous', 'même', 'tous', 'toute', 'toutes',
      'et', 'il', 'elle', 'on', 'mon', 'ma', 'mes', 'son', 'sa', 'ses', 'ton', 'ta', 'tes'
    ]);

    this.englishStopwords = new Set([
      'the', 'is', 'are', 'was', 'were', 'with', 'this', 'that', 'these', 'those', 'from', 'have', 'has', 'had',
      'they', 'their', 'what', 'which', 'would', 'could', 'should', 'about', 'because', 'been', 'there', 'will',
      'you', 'your', 'we', 'our', 'not', 'but', 'for', 'and', 'can', 'them', 'when', 'where', 'who',
      'how', 'all', 'any', 'some', 'into', 'than', 'then', 'its', 'also', 'after', 'only', 'over', 'other',
      'to', 'of', 'in', 'on', 'at', 'by', 'as', 'it', 'an', 'be', 'do', 'does', 'did', 'so', 'if'
    ]);
  }

  initEvents() {
    // Événement onInput sur la zone d'édition .word-editor
    this.editor.addEventListener('input', (e) => this.handleInput(e));

    // Clic gauche sur un mot souligné pour ouvrir les suggestions
    this.editor.addEventListener('click', (e) => {
      const errorSpan = e.target.closest('.spell-error');
      if (errorSpan) {
        e.stopPropagation();
        this.openContextMenu(errorSpan, e.clientX, e.clientY);
      } else {
        this.closeContextMenu();
      }
    });

    // Clic droit (menu contextuel personnalisé) sur un mot souligné
    this.editor.addEventListener('contextmenu', (e) => {
      const errorSpan = e.target.closest('.spell-error');
      if (errorSpan) {
        e.preventDefault();
        e.stopPropagation();
        this.openContextMenu(errorSpan, e.clientX, e.clientY);
      } else {
        this.closeContextMenu();
      }
    });

    // Fermer le menu contextuel au clic extérieur
    window.addEventListener('click', () => this.closeContextMenu());

    // Actions du menu contextuel
    document.getElementById('spellcheck-ignore-once')?.addEventListener('click', () => this.ignoreOnce());
    document.getElementById('spellcheck-ignore-all')?.addEventListener('click', () => this.ignoreAll());
    document.getElementById('spellcheck-add-dict')?.addEventListener('click', () => this.addToDictionary());
    document.getElementById('spellcheck-manage-dict')?.addEventListener('click', () => {
      this.closeContextMenu();
      this.openUserDictModal();
    });

    // Bouton Dictionnaire dans le ruban
    document.getElementById('btn-open-user-dict')?.addEventListener('click', () => this.openUserDictModal());

    // Événements de la modale de dictionnaire utilisateur
    const addBtn = document.getElementById('btn-user-dict-add');
    const addInput = document.getElementById('user-dict-new-word');
    if (addBtn && addInput) {
      addBtn.addEventListener('click', () => {
        if (this.addCustomWord(addInput.value)) {
          addInput.value = '';
          addInput.focus();
        }
      });
      addInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (this.addCustomWord(addInput.value)) {
            addInput.value = '';
            addInput.focus();
          }
        }
      });
    }

    const searchInput = document.getElementById('user-dict-search');
    if (searchInput) {
      searchInput.addEventListener('input', () => this.renderUserDictModal(searchInput.value));
    }

    document.getElementById('btn-user-dict-clear')?.addEventListener('click', () => this.clearCustomDictionary());
    document.getElementById('btn-user-dict-export')?.addEventListener('click', () => this.exportCustomDictionary());

    const importBtn = document.getElementById('btn-user-dict-import');
    const fileInput = document.getElementById('user-dict-file-input');
    if (importBtn && fileInput) {
      importBtn.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', () => {
        if (fileInput.files && fileInput.files[0]) {
          const file = fileInput.files[0];
          const reader = new FileReader();
          reader.onload = (e) => {
            this.importCustomWords(e.target.result);
            fileInput.value = '';
          };
          reader.readAsText(file);
        }
      });
    }

    // Bouton Fermer du volet latéral
    document.getElementById('btn-sp-close')?.addEventListener('click', () => this.closePanel());

    // Toggle vérification en direct dans le ruban
    const toggle = document.getElementById('toggle-realtime-spellcheck');
    if (toggle) {
      toggle.addEventListener('change', (e) => {
        this.isEnabled = e.target.checked;
        if (this.isEnabled) {
          this.scanEditor();
          this.toasts.show('Vérification orthographique en direct activée', 'info');
        } else {
          this.clearAllErrors();
          this.updateStatusBar(0);
          this.toasts.show('Vérification orthographique en direct désactivée', 'info');
        }
      });
    }

    // Clic sur l'indicateur orthographe dans la barre d'état ou bouton ruban (F7)
    document.getElementById('btn-spellcheck')?.addEventListener('click', () => this.togglePanel());
    this.statusItem?.addEventListener('click', () => this.togglePanel());

    // Clic sur l'indicateur de langue dans le pied de page (bascule manuelle / auto FR/EN)
    this.statusLang?.addEventListener('click', () => {
      if (this.manualLanguageOverride) {
        if (this.currentLanguage === 'fr') {
          this.setLanguage('en', true);
        } else {
          this.manualLanguageOverride = false;
          this.toasts.show('Détection automatique de la langue réactivée', 'info');
          const fullDocText = this.editor.innerText || this.editor.textContent || '';
          this.detectDocumentLanguage(fullDocText);
          this.scanEditor();
        }
      } else {
        const nextLang = this.currentLanguage === 'fr' ? 'en' : 'fr';
        this.setLanguage(nextLang, true);
      }
    });

    // Raccourci clavier F7 universel
    window.addEventListener('keydown', (e) => {
      if (e.key === 'F7') {
        e.preventDefault();
        this.togglePanel();
      }
    });

    // Lancer une première analyse silencieuse
    setTimeout(() => this.scanEditor(), 1000);
  }

  setLanguage(lang, isManual = false) {
    this.currentLanguage = lang;
    if (isManual) {
      this.manualLanguageOverride = true;
    }
    const label = lang === 'en' ? 'Anglais (États-Unis)' : 'Français (France)';
    if (this.statusLang) {
      this.statusLang.textContent = label;
      this.statusLang.title = `Langue : ${label} (${this.manualLanguageOverride ? 'Fixée manuellement' : 'Auto-détectée'} - Cliquer pour basculer)`;
    }
    // Mise à jour de la langue de dictée vocale
    if (window.wordApp && window.wordApp.speech) {
      window.wordApp.speech.setLanguage(lang === 'en' ? 'en-US' : 'fr-FR');
    }
    if (isManual) {
      this.toasts.show(`Langue définie sur : ${label}`, 'info');
      this.scanEditor();
    }
  }

  detectDocumentLanguage(fullText) {
    if (this.manualLanguageOverride) return this.currentLanguage;
    if (!fullText || fullText.trim().length < 8) return this.currentLanguage;

    const lower = fullText.toLowerCase();
    let frScore = 0;
    let enScore = 0;

    // 1. Caractères diacritiques français distinctifs (+3 par lettre)
    const frenchAccents = (lower.match(/[éèêëàâçùûôîïœæ]/g) || []).length;
    frScore += frenchAccents * 3;

    // 2. Élisions typiques françaises (l', d', qu', c', j', etc.) (+2.5)
    const elisions = (lower.match(/\b(d|l|qu|j|c|m|t|s|n)['’]/g) || []).length;
    frScore += elisions * 2.5;

    // 3. Fréquence des mots grammaticaux (stopwords / mots très courants)
    const tokens = lower.match(/[a-zà-öø-ÿ']+/g) || [];
    for (let i = 0; i < tokens.length; i++) {
      const raw = tokens[i];
      const t = raw.replace(/^[ldjcmtsn]['’]/, '');
      if (this.frenchStopwords.has(t) || this.frenchStopwords.has(raw)) frScore += 2;
      if (this.englishStopwords.has(t) || this.englishStopwords.has(raw)) enScore += 2;
    }

    // 4. Comparaison des fréquences dans les dictionnaires respectifs si le score est serré
    if (Math.abs(frScore - enScore) < 5 && tokens.length > 0) {
      const sampleSize = Math.min(tokens.length, 60);
      for (let i = 0; i < sampleSize; i++) {
        const t = tokens[i].replace(/^[ldjcmtsn]['’]/, '');
        if (this.dictionary.has(t)) frScore += 0.5;
        if (this.englishDictionary.has(t)) enScore += 0.5;
      }
    }

    const detected = enScore > frScore ? 'en' : 'fr';
    if (detected !== this.currentLanguage) {
      this.setLanguage(detected, false);
    }
    return this.currentLanguage;
  }

  handleInput(e) {
    if (!this.isEnabled) return;
    if (this.debounceTimer) clearTimeout(this.debounceTimer);

    // Si l'utilisateur tape un séparateur de mot (espace, ponctuation), analyse immédiate
    const inputChar = e && e.data ? e.data : '';
    const isWordBoundary = /[\s.,;:!?()—\n\r]/.test(inputChar);
    const delay = isWordBoundary ? 100 : 350;

    this.debounceTimer = setTimeout(() => {
      this.scanEditor();
    }, delay);
  }

  isWordCorrect(rawWord) {
    if (!rawWord) return true;
    const trimmedRaw = rawWord.trim();

    // 1. Acronymes, sigles et termes tout en majuscules (ex: PDF, HTML, CSS, TGV, SNCF, IA, ONU, FAQ)
    // Comme dans Microsoft Word, les mots entièrement en majuscules (2+ lettres) ne sont pas soulignés
    if (/^[A-ZÀ-ÖØ-ß0-9_-]{2,}$/.test(trimmedRaw)) {
      return true;
    }

    let word = trimmedRaw.toLowerCase();

    // Nettoyer les apostrophes aux extrémités
    word = word.replace(/^['’]+|['’]+$/g, '');

    // Mots trop courts (1 lettre autorisée selon la langue) ou nombres
    if (word.length <= 1) {
      if (this.currentLanguage === 'en') {
        return word === 'a' || word === 'i' || /^\d+$/.test(word);
      } else {
        return word === 'a' || word === 'à' || word === 'y' || word === 'ô' || /^\d+$/.test(word);
      }
    }
    if (/^\d+([.,]\d+)?%?$/.test(word)) return true;

    // Gestion des mots composés avec tirets (ex: "peut-être", "word-processing", "rendez-vous")
    if (word.includes('-')) {
      const parts = word.split('-');
      if (parts.every((p) => this.isWordCorrect(p))) return true;
    }

    // Vérifier les dictionnaires personnalisés et mots ignorés de session
    if (this.ignoredWords.has(word) || this.customDictionary.includes(word)) {
      return true;
    }

    if (this.currentLanguage === 'en') {
      return this.isEnglishWordCorrect(word);
    } else {
      return this.isFrenchWordCorrect(word);
    }
  }

  isFrenchWordCorrect(word) {
    // Nettoyer les élisions courantes (l', d', qu', j', c', m', t', s', n', jusqu', lorsqu', puisqu', quoiqu')
    const cleaned = word.replace(/^(d|l|qu|j|c|m|t|s|n|jusqu|lorsqu|puisqu|quoiqu)['’]/i, '');
    if (this.dictionary.has(cleaned) || this.dictionary.has(word)) return true;

    // Mots composés avec apostrophe spécifiques
    if (word === "aujourd'hui" || cleaned === "aujourd'hui") return true;
    if (word.startsWith("quelqu'")) return true;

    // 1. Pluriel régulier en 's' ou 'x'
    if (cleaned.endsWith('s') && (this.dictionary.has(cleaned.slice(0, -1)) || this.customDictionary.includes(cleaned.slice(0, -1)))) return true;
    if (cleaned.endsWith('x') && (this.dictionary.has(cleaned.slice(0, -1)) || this.customDictionary.includes(cleaned.slice(0, -1)))) return true;

    // 2. Pluriels en -aux (ex: national -> nationaux, journal -> journaux, cheval -> chevaux, travail -> travaux)
    if (cleaned.endsWith('aux')) {
      const stem = cleaned.slice(0, -3);
      if (this.dictionary.has(stem + 'al') || this.dictionary.has(stem + 'ail')) return true;
    }

    // 3. Féminin régulier en 'e' ou pluriel féminin en 'es' (ex: correct -> correcte, correctes ; grand -> grande, grandes)
    if (cleaned.endsWith('es')) {
      const stem = cleaned.slice(0, -2);
      if (this.dictionary.has(stem) || this.dictionary.has(stem + 'e')) return true;
    }
    if (cleaned.endsWith('e') && this.dictionary.has(cleaned.slice(0, -1))) return true;

    // 4. Adverbes réguliers en 'ment' (ex: directement, facilement, rapidement, grandement)
    if (cleaned.endsWith('ment')) {
      const stem = cleaned.slice(0, -4);
      if (this.dictionary.has(stem) || this.dictionary.has(stem + 'e') || this.dictionary.has(stem + 'é')) return true;
    }
    // Adverbes en -amment, -emment (ex: constamment -> constant, prudemment -> prudent)
    if (cleaned.endsWith('amment') && this.dictionary.has(cleaned.slice(0, -6) + 'ant')) return true;
    if (cleaned.endsWith('emment') && this.dictionary.has(cleaned.slice(0, -6) + 'ent')) return true;

    // 5. Féminins en -trice / -trices dérivés de -teur (ex: directeur -> directrice)
    if (cleaned.endsWith('trices') && this.dictionary.has(cleaned.slice(0, -6) + 'teur')) return true;
    if (cleaned.endsWith('trice') && this.dictionary.has(cleaned.slice(0, -5) + 'teur')) return true;

    // 6. Féminins en -euse / -euses dérivés de -eur (ex: chercheur -> chercheuse)
    if (cleaned.endsWith('euses') && this.dictionary.has(cleaned.slice(0, -5) + 'eur')) return true;
    if (cleaned.endsWith('euse') && this.dictionary.has(cleaned.slice(0, -4) + 'eur')) return true;

    // 7. Féminins en -ière / -ières dérivés de -ier (ex: premier -> première, dernier -> dernière)
    if (cleaned.endsWith('ières') && this.dictionary.has(cleaned.slice(0, -5) + 'ier')) return true;
    if (cleaned.endsWith('ière') && this.dictionary.has(cleaned.slice(0, -4) + 'ier')) return true;

    // 8. Féminins en -ienne / -iennes dérivés de -ien (ex: ancien -> ancienne, parisien -> parisienne)
    if (cleaned.endsWith('iennes') && this.dictionary.has(cleaned.slice(0, -6) + 'ien')) return true;
    if (cleaned.endsWith('ienne') && this.dictionary.has(cleaned.slice(0, -5) + 'ien')) return true;

    // 9. Conjugaison morphologique des verbes du 1er groupe (-er)
    // Associe les flexions verbales courantes au verbe infinitif présent dans le dictionnaire
    const erSuffixes = [
      { suffix: 'erons', len: 5 }, { suffix: 'erez', len: 4 }, { suffix: 'eront', len: 5 },
      { suffix: 'erais', len: 5 }, { suffix: 'erait', len: 5 }, { suffix: 'eriez', len: 5 }, { suffix: 'erions', len: 6 }, { suffix: 'eraient', len: 7 },
      { suffix: 'era', len: 3 }, { suffix: 'eras', len: 4 },
      { suffix: 'aient', len: 5 }, { suffix: 'ions', len: 4 }, { suffix: 'iez', len: 3 }, { suffix: 'ait', len: 3 }, { suffix: 'ais', len: 3 },
      { suffix: 'ons', len: 3 }, { suffix: 'ez', len: 2 }, { suffix: 'ent', len: 3 },
      { suffix: 'ant', len: 3 },
      { suffix: 'ées', len: 3 }, { suffix: 'ée', len: 2 }, { suffix: 'és', len: 2 }, { suffix: 'é', len: 1 }
    ];

    for (let i = 0; i < erSuffixes.length; i++) {
      const rule = erSuffixes[i];
      if (cleaned.endsWith(rule.suffix)) {
        const root = cleaned.slice(0, -rule.len);
        if (root.length >= 2) {
          if (this.dictionary.has(root + 'er')) return true;
          // Cas particuliers -cer (ex: commençons -> commencer) et -ger (ex: partageons -> partager)
          if (rule.suffix === 'ons') {
            if (cleaned.endsWith('çons') && this.dictionary.has(root.slice(0, -1) + 'cer')) return true;
            if (cleaned.endsWith('geons') && this.dictionary.has(root.slice(0, -1) + 'ger')) return true;
          }
        }
      }
    }

    // 10. Conjugaison morphologique des verbes du 2e groupe (-ir)
    // (ex: choisir -> choisis, choisit, choisissons, choisissez, choisissent, choisissant, choisi)
    const irSuffixes = [
      { suffix: 'issons', len: 6 }, { suffix: 'issez', len: 5 }, { suffix: 'issent', len: 6 },
      { suffix: 'issait', len: 6 }, { suffix: 'issaient', len: 8 }, { suffix: 'issiez', len: 6 }, { suffix: 'issions', len: 7 },
      { suffix: 'issant', len: 6 },
      { suffix: 'ira', len: 3 }, { suffix: 'irons', len: 5 }, { suffix: 'irez', len: 4 }, { suffix: 'iront', len: 5 },
      { suffix: 'irait', len: 5 }, { suffix: 'iraient', len: 7 },
      { suffix: 'is', len: 2 }, { suffix: 'it', len: 2 }, { suffix: 'ie', len: 2 }, { suffix: 'ies', len: 3 }, { suffix: 'i', len: 1 }
    ];

    for (let i = 0; i < irSuffixes.length; i++) {
      const rule = irSuffixes[i];
      if (cleaned.endsWith(rule.suffix)) {
        const root = cleaned.slice(0, -rule.len);
        if (root.length >= 2 && this.dictionary.has(root + 'ir')) return true;
      }
    }

    return false;
  }

  isEnglishWordCorrect(word) {
    // Nettoyer les possessifs courants (ex: "word's" -> "word")
    const cleaned = word.replace(/['’]s$/i, '');
    if (this.englishDictionary.has(cleaned) || this.englishDictionary.has(word)) return true;

    // Contractions courantes anglaises
    const contractions = ['don\'t', 'can\'t', 'won\'t', 'it\'s', 'i\'m', 'you\'re', 'we\'re', 'they\'re', 'didn\'t', 'hasn\'t', 'haven\'t', 'wouldn\'t', 'couldn\'t', 'shouldn\'t', 'isn\'t', 'aren\'t', 'wasn\'t', 'weren\'t', 'that\'s', 'there\'s', 'what\'s', 'let\'s'];
    if (contractions.includes(word)) return true;

    // 1. Pluriels et 3e personne du singulier en -s / -es
    if (cleaned.endsWith('es') && this.englishDictionary.has(cleaned.slice(0, -2))) return true;
    if (cleaned.endsWith('s') && this.englishDictionary.has(cleaned.slice(0, -1))) return true;

    // 2. Passé et participe passé régulier en -ed
    if (cleaned.endsWith('ed')) {
      const stem = cleaned.slice(0, -2);
      if (this.englishDictionary.has(stem) || this.englishDictionary.has(stem + 'e')) return true;
      if (stem.length > 2 && stem[stem.length - 1] === stem[stem.length - 2] && this.englishDictionary.has(stem.slice(0, -1))) return true;
    }

    // 3. Participe présent / gérondif en -ing
    if (cleaned.endsWith('ing')) {
      const stem = cleaned.slice(0, -3);
      if (this.englishDictionary.has(stem) || this.englishDictionary.has(stem + 'e')) return true;
      if (stem.length > 2 && stem[stem.length - 1] === stem[stem.length - 2] && this.englishDictionary.has(stem.slice(0, -1))) return true;
    }

    // 4. Adverbes en -ly
    if (cleaned.endsWith('ly')) {
      const stem = cleaned.slice(0, -2);
      if (this.englishDictionary.has(stem)) return true;
    }

    return false;
  }

  // Calcul de la distance de Levenshtein entre deux chaînes
  levenshtein(a, b) {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // suppression
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }

  getSuggestions(misspelled) {
    const isEn = this.currentLanguage === 'en';
    const target = isEn
      ? misspelled.toLowerCase().replace(/['’]s$/, '')
      : misspelled.toLowerCase().replace(/^(d|l|qu|j|c|m|t|s|n)['’]/i, '');

    const activeDict = isEn ? this.englishDictionary : this.dictionary;
    const candidates = [];
    const firstChar = target.charAt(0);

    // Chercher les correspondances proches dans le dictionnaire actif
    // Priorité aux mots ayant la même première lettre pour un temps de réponse instantané (<5ms)
    for (const dictWord of activeDict) {
      if (Math.abs(dictWord.length - target.length) > 2) continue;
      if (dictWord.charAt(0) !== firstChar && candidates.length >= 8) continue;

      const dist = this.levenshtein(target, dictWord);
      if (dist <= 2) {
        candidates.push({ word: dictWord, distance: dist });
        if (candidates.length >= 30) break;
      }
    }

    candidates.sort((a, b) => a.distance - b.distance);

    // Conserver la majuscule initiale si le mot source commence par une majuscule
    const isCapitalized = /^[A-ZÀ-ÖØ-ß]/.test(misspelled);
    return candidates.slice(0, 4).map((c) => {
      return isCapitalized ? c.word.charAt(0).toUpperCase() + c.word.slice(1) : c.word;
    });
  }

  // Sauvegarde et restauration robuste de la position du curseur
  getCaretOffset(element) {
    let caretOffset = 0;
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && element.contains(sel.anchorNode)) {
      const range = sel.getRangeAt(0);
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(element);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      caretOffset = preCaretRange.toString().length;
    }
    return caretOffset;
  }

  setCaretOffset(element, offset) {
    const sel = window.getSelection();
    const range = document.createRange();
    let current = 0;
    let found = false;

    function traverse(node) {
      if (found) return;
      if (node.nodeType === Node.TEXT_NODE) {
        const len = node.nodeValue.length;
        if (current + len >= offset) {
          range.setStart(node, Math.min(len, offset - current));
          range.collapse(true);
          found = true;
          return;
        }
        current += len;
      } else {
        for (let i = 0; i < node.childNodes.length; i++) {
          traverse(node.childNodes[i]);
          if (found) return;
        }
      }
    }

    traverse(element);
    if (found) {
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }

  clearAllErrors() {
    const errors = this.editor.querySelectorAll('.spell-error');
    errors.forEach((span) => {
      const parent = span.parentNode;
      if (!parent) return;
      while (span.firstChild) {
        parent.insertBefore(span.firstChild, span);
      }
      parent.removeChild(span);
      parent.normalize();
    });
  }

  // Détecte les paragraphes et blocs distincts pour ne jamais fusionner les mots à travers les ruptures
  getParagraphBlocks() {
    const selector = 'p, h1, h2, h3, h4, h5, h6, blockquote, pre, li, td, th, div';
    const all = Array.from(this.editor.querySelectorAll(selector));
    const blocks = [];

    all.forEach((b) => {
      // Exclure les conteneurs parents si leurs enfants sont déjà des blocs, et exclure les sauts de page
      const hasChildBlock = b.querySelector(selector);
      if (!hasChildBlock && !b.closest('.page-break') && !b.closest('.word-page-break')) {
        blocks.push(b);
      }
    });

    if (blocks.length === 0) {
      return [this.editor];
    }

    // Traiter les nœuds directs sous l'éditeur non enveloppés dans un bloc de paragraphe
    for (let c = this.editor.firstChild; c; c = c.nextSibling) {
      if (c.nodeType === Node.TEXT_NODE && c.nodeValue.trim().length > 0) {
        blocks.push(c);
      } else if (c.nodeType === Node.ELEMENT_NODE && !c.matches(selector) && !c.querySelector(selector) && !c.classList.contains('page-break') && !c.classList.contains('word-page-break')) {
        blocks.push(c);
      }
    }

    return blocks;
  }

  // Extrait le texte d'un paragraphe en ignorant les balises de mise en forme (b, i, u, span, etc.)
  // tout en conservant une correspondance exacte vers les nœuds DOM d'origine
  extractBlockTextAndMap(block) {
    const charMap = [];
    let fullText = '';

    const walk = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const val = node.nodeValue;
        for (let i = 0; i < val.length; i++) {
          charMap.push({ node: node, offset: i });
          fullText += val[i];
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.classList && (node.classList.contains('page-break') || node.classList.contains('word-page-break'))) {
          return;
        }
        // Les sauts de ligne <br> créent une frontière stricte entre les mots
        if (node.tagName === 'BR') {
          charMap.push(null);
          fullText += '\n';
          return;
        }
        // Traverser les enfants : les balises de formatage (b, i, u, span, font, strong, em, etc.) sont ignorées
        for (let child = node.firstChild; child; child = child.nextSibling) {
          walk(child);
        }
      }
    };

    walk(block);
    return { fullText, charMap };
  }

  scanEditor() {
    if (this.isScanning || !this.isEnabled) return;
    this.isScanning = true;

    const caretOffset = this.getCaretOffset(this.editor);

    // 1. Supprimer les balises de soulignement existantes en préservant le formatage (b, i, u)
    this.clearAllErrors();

    // 2. Détection automatique dynamique de la langue du document (FR vs EN) par analyse fréquentielle des mots
    const fullDocText = this.editor.innerText || this.editor.textContent || '';
    this.detectDocumentLanguage(fullDocText);

    // 3. Détecter les paragraphes et blocs distincts (empêche la fusion des mots à travers les ruptures)
    const blocks = this.getParagraphBlocks();
    let errorCount = 0;
    const wordRegex = /[a-zA-Zà-öø-ÿÀ-ÖØ-ß]+(?:['’][a-zA-Zà-öø-ÿÀ-ÖØ-ß]+)?/g;

    blocks.forEach((block) => {
      // 4. Extraire le texte continu du paragraphe en ignorant les balises de mise en forme (<b>, <i>, <u>)
      const { fullText, charMap } = this.extractBlockTextAndMap(block);
      if (!fullText || fullText.trim() === '') return;

      const blockErrors = [];
      let match;
      wordRegex.lastIndex = 0;

      while ((match = wordRegex.exec(fullText)) !== null) {
        const rawWord = match[0];
        const startIndex = match.index;
        const endIndex = startIndex + rawWord.length - 1;

        // Comparaison avec le dictionnaire sans interférence des balises de style
        if (!this.isWordCorrect(rawWord)) {
          const startMap = charMap[startIndex];
          const endMap = charMap[endIndex];

          if (startMap && endMap && startMap.node && endMap.node) {
            blockErrors.push({
              word: rawWord,
              startNode: startMap.node,
              startOffset: startMap.offset,
              endNode: endMap.node,
              endOffset: endMap.offset + 1,
            });
          }
        }
      }

      // 4. Appliquer le soulignement ondulé rouge dans l'ordre inverse pour préserver les décalages du DOM
      for (let i = blockErrors.length - 1; i >= 0; i--) {
        const err = blockErrors[i];
        try {
          const range = document.createRange();
          range.setStart(err.startNode, err.startOffset);
          range.setEnd(err.endNode, err.endOffset);

          const span = document.createElement('span');
          span.className = 'spell-error';
          span.dataset.word = err.word;
          span.title = `Erreur potentielle : "${err.word}" (Cliquer pour corriger)`;

          // extractContents préserve les sous-balises de style (b, i, u) à l'intérieur du mot
          span.appendChild(range.extractContents());
          range.insertNode(span);
          errorCount++;
        } catch (e) {
          console.warn('Erreur lors du soulignement orthographique:', e);
        }
      }
    });

    if (caretOffset > 0) {
      this.setCaretOffset(this.editor, caretOffset);
    }

    this.updateStatusBar(errorCount);
    this.updatePanelIfOpen();
    this.isScanning = false;
  }

  updateStatusBar(errorCount) {
    if (!this.statusItem) return;
    const totalWords = (this.dictionary ? this.dictionary.size : 0);
    const dictBadge = totalWords > 10000 ? ` (${Math.round(totalWords / 1000)}k)` : '';
    if (errorCount === 0) {
      this.statusIcon.textContent = '✓';
      this.statusIcon.style.color = '#ffffff';
      this.statusText.textContent = `Orthographe${dictBadge}`;
      this.statusItem.title = `Vérification orthographique : Aucune erreur (${totalWords.toLocaleString('fr-FR')} mots chargés dans le dictionnaire)`;
    } else {
      this.statusIcon.textContent = '⚠';
      this.statusIcon.style.color = '#ffdd57';
      this.statusText.textContent = `${errorCount} faute${errorCount > 1 ? 's' : ''}`;
      this.statusItem.title = `Vérification orthographique : ${errorCount} erreur(s) détectée(s) (${totalWords.toLocaleString('fr-FR')} mots dans le dictionnaire - F7 pour ouvrir le volet)`;
    }
  }

  openContextMenu(errorSpan, x, y) {
    this.activeErrorSpan = errorSpan;
    const word = errorSpan.dataset.word || errorSpan.textContent;
    const suggestions = this.getSuggestions(word);

    this.suggestionsContainer.innerHTML = '';
    if (suggestions.length === 0) {
      const noSugg = document.createElement('div');
      noSugg.style.padding = '6px 14px';
      noSugg.style.color = 'var(--text-muted)';
      noSugg.style.fontStyle = 'italic';
      noSugg.textContent = 'Aucune suggestion trouvée';
      this.suggestionsContainer.appendChild(noSugg);
    } else {
      suggestions.forEach((sugg) => {
        const item = document.createElement('div');
        item.className = 'spellcheck-suggestion-item';
        item.innerHTML = `<span>${sugg}</span><span style="font-size:10px; color:var(--text-muted);">Corriger</span>`;
        item.addEventListener('click', () => {
          this.replaceError(errorSpan, sugg);
          this.closeContextMenu();
        });
        this.suggestionsContainer.appendChild(item);
      });
    }

    this.contextMenu.style.left = `${Math.min(window.innerWidth - 220, Math.max(10, x))}px`;
    this.contextMenu.style.top = `${Math.min(window.innerHeight - 180, Math.max(10, y + 8))}px`;
    this.contextMenu.classList.add('show');
  }

  closeContextMenu() {
    if (this.contextMenu) this.contextMenu.classList.remove('show');
  }

  replaceError(span, newWord) {
    const textNode = document.createTextNode(newWord);
    span.parentNode.replaceChild(textNode, span);
    this.history.pushState(true);
    this.toasts.show(`Remplacé par "${newWord}"`, 'success');
    this.scanEditor();
  }

  ignoreOnce() {
    if (!this.activeErrorSpan) return;
    const textNode = document.createTextNode(this.activeErrorSpan.textContent);
    this.activeErrorSpan.parentNode.replaceChild(textNode, this.activeErrorSpan);
    this.closeContextMenu();
    this.scanEditor();
  }

  ignoreAll() {
    if (!this.activeErrorSpan) return;
    const word = (this.activeErrorSpan.dataset.word || this.activeErrorSpan.textContent).toLowerCase();
    this.ignoredWords.add(word);
    this.closeContextMenu();
    this.toasts.show(`"${word}" sera ignoré pour cette session`, 'info');
    this.scanEditor();
  }

  addToDictionary() {
    if (!this.activeErrorSpan) return;
    const word = (this.activeErrorSpan.dataset.word || this.activeErrorSpan.textContent).toLowerCase();
    this.closeContextMenu();
    this.addCustomWord(word, true);
  }

  addCustomWord(rawWord, notify = true) {
    if (!rawWord) return false;
    const word = rawWord.trim().toLowerCase().replace(/^['’.,;!?]+|['’.,;!?]+$/g, '');
    if (!word || word.length < 1) return false;

    if (this.customDictionary.includes(word)) {
      if (notify) this.toasts.show(`« ${word} » figure déjà dans votre dictionnaire personnel.`, 'info');
      return false;
    }

    this.customDictionary.push(word);
    this.customDictionary.sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' }));
    this.saveCustomDictionary();
    this.scanEditor();
    this.renderUserDictModal();

    if (notify) {
      this.toasts.show(`« ${word} » a été ajouté à votre dictionnaire personnel !`, 'success');
    }
    return true;
  }

  removeCustomWord(rawWord) {
    if (!rawWord) return false;
    const word = rawWord.trim().toLowerCase();
    const index = this.customDictionary.indexOf(word);
    if (index === -1) return false;

    this.customDictionary.splice(index, 1);
    this.saveCustomDictionary();
    this.scanEditor();
    this.renderUserDictModal();
    this.toasts.show(`« ${word} » a été retiré du dictionnaire personnel.`, 'info');
    return true;
  }

  clearCustomDictionary() {
    if (this.customDictionary.length === 0) {
      this.toasts.show('Votre dictionnaire personnel est déjà vide.', 'info');
      return;
    }
    const count = this.customDictionary.length;
    if (confirm(`Voulez-vous vraiment effacer la totalité des ${count} mot(s) de votre dictionnaire personnel ?`)) {
      this.customDictionary = [];
      this.saveCustomDictionary();
      this.scanEditor();
      this.renderUserDictModal();
      this.toasts.show('Le dictionnaire personnel a été réinitialisé.', 'info');
    }
  }

  importCustomWords(fileOrText) {
    if (!fileOrText || typeof fileOrText !== 'string') return;
    const tokens = fileOrText.split(/[\r\n,; \t]+/).map((w) => w.trim().toLowerCase().replace(/^['’.,;!?]+|['’.,;!?]+$/g, '')).filter((w) => w.length > 0);
    let added = 0;
    tokens.forEach((w) => {
      if (!this.customDictionary.includes(w)) {
        this.customDictionary.push(w);
        added++;
      }
    });

    if (added > 0) {
      this.customDictionary.sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' }));
      this.saveCustomDictionary();
      this.scanEditor();
      this.renderUserDictModal();
      this.toasts.show(`${added} mot(s) importé(s) dans votre dictionnaire personnel !`, 'success');
    } else {
      this.toasts.show('Aucun nouveau mot détecté à importer.', 'info');
    }
  }

  exportCustomDictionary() {
    if (this.customDictionary.length === 0) {
      this.toasts.show('Votre dictionnaire personnel est vide.', 'info');
      return;
    }
    const content = this.customDictionary.join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dictionnaire_personnel_word.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    this.toasts.show('Dictionnaire personnel exporté (.txt)', 'success');
  }

  openUserDictModal() {
    const modal = document.getElementById('modal-user-dict');
    if (modal) {
      modal.classList.add('active');
      const input = document.getElementById('user-dict-new-word');
      if (input) {
        input.value = '';
        setTimeout(() => input.focus(), 80);
      }
      const search = document.getElementById('user-dict-search');
      if (search) search.value = '';
      this.renderUserDictModal('');
    }
  }

  closeUserDictModal() {
    const modal = document.getElementById('modal-user-dict');
    if (modal) modal.classList.remove('active');
  }

  renderUserDictModal(searchFilter = '') {
    const listContainer = document.getElementById('user-dict-list');
    const badge = document.getElementById('user-dict-count-badge');
    if (!listContainer) return;

    const totalCount = this.customDictionary.length;
    if (badge) {
      badge.textContent = `${totalCount} mot${totalCount > 1 ? 's' : ''} enregistré${totalCount > 1 ? 's' : ''}`;
    }

    const q = (searchFilter || '').trim().toLowerCase();
    const filtered = q
      ? this.customDictionary.filter((w) => w.toLowerCase().includes(q))
      : this.customDictionary;

    listContainer.innerHTML = '';

    if (totalCount === 0) {
      listContainer.innerHTML = `
        <div class="user-dict-empty">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5" style="margin: 0 auto 8px auto; opacity: 0.6; display: block;"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
          <div>Votre dictionnaire personnel est actuellement vide.</div>
          <div style="font-size: 11px; margin-top: 4px; color: var(--text-muted);">Ajoutez des noms propres, termes métiers ou acronymes ci-dessus.</div>
        </div>
      `;
      return;
    }

    if (filtered.length === 0) {
      listContainer.innerHTML = `
        <div class="user-dict-empty">
          <div>Aucun mot ne correspond à votre recherche « ${searchFilter} ».</div>
        </div>
      `;
      return;
    }

    filtered.forEach((word) => {
      const item = document.createElement('div');
      item.className = 'user-dict-item';
      item.innerHTML = `
        <div class="user-dict-item-word">
          <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:var(--word-primary);"></span>
          <span>${word}</span>
        </div>
        <button class="user-dict-item-del" title="Supprimer « ${word} » du dictionnaire">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"></path></svg>
        </button>
      `;

      item.querySelector('.user-dict-item-del').addEventListener('click', (e) => {
        e.stopPropagation();
        this.removeCustomWord(word);
      });

      listContainer.appendChild(item);
    });
  }

  togglePanel() {
    if (!this.spellPanel) return;
    if (this.spellPanel.classList.contains('show')) {
      this.closePanel();
    } else {
      this.openPanel();
    }
  }

  openPanel() {
    this.spellPanel.classList.add('show');
    this.renderPanelContent();
  }

  closePanel() {
    if (this.spellPanel) this.spellPanel.classList.remove('show');
  }

  updatePanelIfOpen() {
    if (this.spellPanel && this.spellPanel.classList.contains('show')) {
      this.renderPanelContent();
    }
  }

  renderPanelContent() {
    if (!this.spBody) return;
    this.spBody.innerHTML = '';

    const errorSpans = Array.from(this.editor.querySelectorAll('.spell-error'));
    if (errorSpans.length === 0) {
      this.spBody.innerHTML = `
        <div style="text-align: center; padding: 30px 10px; color: var(--text-muted);">
          <svg viewBox="0 0 24 24" width="42" height="42" stroke="#107c41" fill="none" stroke-width="2" style="margin: 0 auto 10px auto; display: block;"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <div style="font-weight: 600; font-size: 14px; color: #107c41; margin-bottom: 4px;">Document impeccable !</div>
          <p style="font-size: 12px; margin-bottom: 16px;">Aucune faute d'orthographe n'a été détectée.</p>
          <button id="btn-sp-open-dict" class="btn-secondary" style="font-size: 12px; padding: 6px 12px;">📚 Dictionnaire personnel (${this.customDictionary.length})</button>
        </div>
      `;
      document.getElementById('btn-sp-open-dict')?.addEventListener('click', () => this.openUserDictModal());
      return;
    }

    const uniqueWords = new Map();
    errorSpans.forEach((span) => {
      const word = span.dataset.word || span.textContent;
      if (!uniqueWords.has(word)) {
        uniqueWords.set(word, []);
      }
      uniqueWords.get(word).push(span);
    });

    uniqueWords.forEach((spans, word) => {
      const card = document.createElement('div');
      card.className = 'sp-error-card';

      const wordTitle = document.createElement('div');
      wordTitle.className = 'sp-misspelled-word';
      wordTitle.textContent = `${word} (${spans.length} occurrence${spans.length > 1 ? 's' : ''})`;
      card.appendChild(wordTitle);

      const suggestions = this.getSuggestions(word);
      const suggList = document.createElement('div');
      suggList.className = 'sp-suggestions-list';

      if (suggestions.length === 0) {
        const noSugg = document.createElement('div');
        noSugg.style.fontSize = '11px';
        noSugg.style.color = 'var(--text-muted)';
        noSugg.textContent = 'Aucune suggestion automatique';
        suggList.appendChild(noSugg);
      } else {
        suggestions.forEach((sugg) => {
          const btn = document.createElement('button');
          btn.className = 'sp-sugg-btn';
          btn.textContent = `Corriger en "${sugg}"`;
          btn.addEventListener('click', () => {
            spans.forEach((s) => this.replaceError(s, sugg));
          });
          suggList.appendChild(btn);
        });
      }
      card.appendChild(suggList);

      const actionsRow = document.createElement('div');
      actionsRow.style.display = 'flex';
      actionsRow.style.gap = '6px';
      actionsRow.style.marginTop = '8px';

      const ignoreBtn = document.createElement('button');
      ignoreBtn.className = 'sr-btn';
      ignoreBtn.textContent = 'Ignorer tout';
      ignoreBtn.addEventListener('click', () => {
        this.ignoredWords.add(word.toLowerCase());
        this.scanEditor();
      });

      const addBtn = document.createElement('button');
      addBtn.className = 'sr-btn';
      addBtn.textContent = 'Ajouter au dict.';
      addBtn.addEventListener('click', () => {
        this.addCustomWord(word, true);
      });

      actionsRow.appendChild(ignoreBtn);
      actionsRow.appendChild(addBtn);
      card.appendChild(actionsRow);

      this.spBody.appendChild(card);
    });

    // Pied de page du volet latéral avec accès direct au dictionnaire personnel
    const panelFooter = document.createElement('div');
    panelFooter.style.marginTop = '16px';
    panelFooter.style.paddingTop = '12px';
    panelFooter.style.borderTop = '1px solid var(--border-subtle)';
    panelFooter.style.textAlign = 'center';

    const manageBtn = document.createElement('button');
    manageBtn.className = 'btn-secondary';
    manageBtn.style.fontSize = '12px';
    manageBtn.style.width = '100%';
    manageBtn.style.padding = '7px 10px';
    manageBtn.innerHTML = `📚 Gérer le dictionnaire personnel (${this.customDictionary.length})`;
    manageBtn.addEventListener('click', () => {
      this.openUserDictModal();
    });

    panelFooter.appendChild(manageBtn);
    this.spBody.appendChild(panelFooter);
  }
}

/**
 * ------------------------------------------------------------------------------
 * 8.5 GESTIONNAIRE D'EN-TÊTE ET PIED DE PAGE INTERACTIF (HEADER & FOOTER MANAGER)
 * Permet l'édition interactive par double-clic sur les marges haute et basse,
 * l'insertion de champs dynamiques et la gestion de la première page différente.
 * ------------------------------------------------------------------------------
 */
class HeaderFooterManager {
  constructor(editor, docPage, toastManager) {
    this.editor = editor;
    this.docPage = docPage;
    this.toasts = toastManager;

    this.isActive = false;
    this.activeType = 'header'; // 'header' ou 'footer'
    this.activePage = 1;
    this.activeField = null;

    // Modèle de données persisté
    this.data = {
      headerLeft: '',
      headerCenter: '',
      headerRight: 'Format A4',
      footerLeft: 'Microsoft Word',
      footerCenter: '',
      footerRight: 'Page {page} sur {total}',
      differentFirstPage: false
    };

    this.tabHeaderFooter = document.getElementById('tab-header-footer');
    this.panelHeaderFooter = document.getElementById('panel-header-footer');
    this.chkDifferentFirst = document.getElementById('chk-different-first-page');

    this.initEvents();
  }

  initEvents() {
    // 1. Détection du double-clic sur le document pour entrer en mode en-tête / pied de page
    this.docPage.addEventListener('dblclick', (e) => {
      const sheet = e.target.closest('.page-sheet');
      const pageNum = sheet ? parseInt(sheet.dataset.page || '1', 10) : 1;
      
      const docPageRect = this.docPage.getBoundingClientRect();
      const sheetRect = sheet ? sheet.getBoundingClientRect() : docPageRect;
      const relativeY = e.clientY - sheetRect.top;
      
      const pageMarginTop = parseInt(getComputedStyle(this.docPage).getPropertyValue('--page-margin-top') || '76', 10);
      const pageMarginBottom = parseInt(getComputedStyle(this.docPage).getPropertyValue('--page-margin-bottom') || '76', 10);
      const pageHeight = 1056;

      if (relativeY <= pageMarginTop + 14) {
        // Double-clic dans la marge supérieure (En-tête)
        e.preventDefault();
        e.stopPropagation();
        this.open('header', pageNum);
      } else if (relativeY >= pageHeight - pageMarginBottom - 14) {
        // Double-clic dans la marge inférieure (Pied de page)
        e.preventDefault();
        e.stopPropagation();
        this.open('footer', pageNum);
      } else if (this.isActive) {
        // Double-clic dans le corps de texte -> quitter l'en-tête/pied
        e.preventDefault();
        e.stopPropagation();
        this.close();
      }
    });

    // 2. Touche Échap pour quitter le mode
    window.addEventListener('keydown', (e) => {
      if (this.isActive && e.key === 'Escape') {
        this.close();
      }
    });

    // 3. Bouton Fermer du ruban
    const btnClose = document.getElementById('btn-hf-close');
    if (btnClose) {
      btnClose.addEventListener('click', () => this.close());
    }

    // 4. Bouton Basculer entre En-tête et Pied de page
    const btnToggle = document.getElementById('btn-hf-toggle-section');
    if (btnToggle) {
      btnToggle.addEventListener('click', () => {
        const nextType = this.activeType === 'header' ? 'footer' : 'header';
        this.open(nextType, this.activePage);
      });
    }

    // 5. Première page différente
    if (this.chkDifferentFirst) {
      this.chkDifferentFirst.addEventListener('change', (e) => {
        this.data.differentFirstPage = e.target.checked;
        if (window.wordApp && window.wordApp.pagination) {
          window.wordApp.pagination.renderPageSheets(window.wordApp.pagination.totalPages);
        }
        if (window.wordApp && window.wordApp.fileManager) {
          window.wordApp.fileManager.scheduleDebouncedSave();
        }
        this.toasts.show(this.data.differentFirstPage ? 'Première page différente activée' : 'Même en-tête sur toutes les pages', 'info', 2000);
      });
    }

    // 6. Insérer la date du jour
    const btnDate = document.getElementById('btn-hf-insert-date');
    if (btnDate) {
      btnDate.addEventListener('click', () => {
        const todayStr = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        this.insertIntoActiveField(todayStr);
      });
    }

    // 7. Insérer le numéro de page (ouvre la modale personnalisable)
    const btnPageNum = document.getElementById('btn-hf-insert-pagenum');
    if (btnPageNum) {
      btnPageNum.addEventListener('click', () => {
        this.openPageNumberModal();
      });
    }

    // 8. Insérer le titre du document
    const btnTitle = document.getElementById('btn-hf-insert-title');
    if (btnTitle) {
      btnTitle.addEventListener('click', () => {
        const title = window.wordApp ? window.wordApp.fileManager.getDocumentTitle() : 'Document';
        this.insertIntoActiveField(title);
      });
    }

    // 9. Alignements rapides
    const btnLeft = document.getElementById('btn-hf-align-left');
    const btnCenter = document.getElementById('btn-hf-align-center');
    const btnRight = document.getElementById('btn-hf-align-right');
    if (btnLeft) btnLeft.addEventListener('click', () => this.focusField(this.activeType, 'left'));
    if (btnCenter) btnCenter.addEventListener('click', () => this.focusField(this.activeType, 'center'));
    if (btnRight) btnRight.addEventListener('click', () => this.focusField(this.activeType, 'right'));

    // 10. Bouton Numéro de page dans le ruban Insertion
    document.getElementById('btn-insert-pagenumber')?.addEventListener('click', () => {
      this.openPageNumberModal();
    });

    // 11. Événements de la modale Numérotation de Pages
    document.querySelectorAll('input[name="pagenum-pos"]').forEach((radio) => {
      radio.addEventListener('change', () => this.updatePageNumPreview());
    });

    document.querySelectorAll('input[name="pagenum-align"]').forEach((radio) => {
      radio.addEventListener('change', () => this.updatePageNumPreview());
    });

    const formatSelect = document.getElementById('pagenum-format-select');
    const customFormatRow = document.getElementById('pagenum-custom-format-row');
    const customFormatInput = document.getElementById('pagenum-custom-format-input');

    if (formatSelect) {
      formatSelect.addEventListener('change', () => {
        if (customFormatRow) {
          customFormatRow.style.display = formatSelect.value === 'custom' ? 'block' : 'none';
        }
        this.updatePageNumPreview();
      });
    }

    if (customFormatInput) {
      customFormatInput.addEventListener('input', () => this.updatePageNumPreview());
    }

    document.getElementById('pagenum-show-first-page')?.addEventListener('change', () => {
      this.updatePageNumPreview();
    });

    // Bouton Appliquer de la modale
    document.getElementById('btn-pagenum-apply')?.addEventListener('click', () => {
      const position = document.querySelector('input[name="pagenum-pos"]:checked')?.value || 'footer';
      const alignment = document.querySelector('input[name="pagenum-align"]:checked')?.value || 'right';
      
      let format = formatSelect ? formatSelect.value : 'Page {page} sur {total}';
      if (format === 'custom') {
        format = (customFormatInput && customFormatInput.value.trim()) ? customFormatInput.value.trim() : '{page}';
      }
      
      const showOnFirstPage = document.getElementById('pagenum-show-first-page')?.checked ?? true;

      this.applyPageNumbering({ position, alignment, format, showOnFirstPage });
      this.closePageNumberModal();
    });

    // Bouton Supprimer les numéros
    document.getElementById('btn-pagenum-remove')?.addEventListener('click', () => {
      this.removePageNumbering();
      this.closePageNumberModal();
    });
  }

  insertIntoActiveField(text) {
    if (this.activeField) {
      this.activeField.focus();
      document.execCommand('insertText', false, text);
      this.syncFieldData(this.activeField);
    } else {
      const targetField = this.activeType === 'header' ? 'header-left' : 'footer-right';
      const el = document.querySelector(`.page-sheet[data-page="${this.activePage}"] [data-field="${targetField}"]`);
      if (el) {
        el.focus();
        el.textContent = text;
        this.syncFieldData(el);
      }
    }
  }

  syncFieldData(el) {
    const field = el.dataset.field;
    const val = el.textContent.trim();
    if (field === 'header-left') this.data.headerLeft = val;
    else if (field === 'header-center') this.data.headerCenter = val;
    else if (field === 'header-right') this.data.headerRight = val;
    else if (field === 'footer-left') this.data.footerLeft = val;
    else if (field === 'footer-center') this.data.footerCenter = val;
    else if (field === 'footer-right') this.data.footerRight = val;

    // Répercuter sur toutes les pages correspondantes
    if (window.wordApp && window.wordApp.pagination) {
      const totalPages = window.wordApp.pagination.totalPages;
      for (let p = 1; p <= totalPages; p++) {
        if (p === 1 && this.data.differentFirstPage) continue;
        if (p === this.activePage) continue;
        const otherEl = document.querySelector(`.page-sheet[data-page="${p}"] [data-field="${field}"]`);
        if (otherEl) {
          otherEl.textContent = this.formatFieldValue(field, val, p, totalPages);
        }
      }
    }

    if (window.wordApp && window.wordApp.fileManager) {
      window.wordApp.fileManager.scheduleDebouncedSave();
    }
  }

  formatFieldValue(field, rawVal, pageNum, totalPages) {
    if (!rawVal) return '';
    const title = window.wordApp ? window.wordApp.fileManager.getDocumentTitle() : 'Document';
    return rawVal
      .replace(/{page}/g, String(pageNum))
      .replace(/{total}/g, String(totalPages))
      .replace(/{title}/g, title);
  }

  open(type = 'header', pageNum = 1) {
    this.isActive = true;
    this.activeType = type;
    this.activePage = pageNum;
    document.body.classList.add('header-footer-active');

    // Afficher l'onglet contextuel du ruban
    if (this.tabHeaderFooter) {
      this.tabHeaderFooter.style.display = 'inline-block';
      this.tabHeaderFooter.click();
    }

    if (this.chkDifferentFirst) {
      this.chkDifferentFirst.checked = !!this.data.differentFirstPage;
    }

    // Activer visuellement la zone
    document.querySelectorAll('.page-sheet-header, .page-sheet-footer').forEach((el) => {
      el.classList.remove('hf-active');
    });

    const selector = type === 'header' ? '.page-sheet-header' : '.page-sheet-footer';
    const targetEl = document.querySelector(`.page-sheet[data-page="${pageNum}"] ${selector}`);
    if (targetEl) {
      targetEl.classList.add('hf-active');
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      // Rendre les champs éditables
      targetEl.querySelectorAll('.hf-editable').forEach((span) => {
        span.setAttribute('contenteditable', 'true');
        span.onblur = () => this.syncFieldData(span);
        span.onfocus = () => {
          this.activeField = span;
        };
      });

      // Mettre le focus
      const defaultField = type === 'header' 
        ? targetEl.querySelector('.hf-item-left .hf-editable')
        : targetEl.querySelector('.hf-item-right .hf-editable');
      if (defaultField) {
        defaultField.focus();
        this.activeField = defaultField;
      }
    }

    this.toasts.show(type === 'header' ? 'Édition de l\'en-tête (Échap pour fermer)' : 'Édition du pied de page (Échap pour fermer)', 'info', 2200);
  }

  close() {
    if (!this.isActive) return;
    this.isActive = false;
    document.body.classList.remove('header-footer-active');

    // Désactiver l'édition
    document.querySelectorAll('.hf-active').forEach((el) => el.classList.remove('hf-active'));
    document.querySelectorAll('.hf-editable').forEach((el) => el.removeAttribute('contenteditable'));

    // Masquer l'onglet contextuel et revenir sur Accueil
    if (this.tabHeaderFooter) {
      this.tabHeaderFooter.style.display = 'none';
      const homeTab = document.querySelector('.ribbon-tab[data-tab="panel-home"]');
      if (homeTab) homeTab.click();
    }

    // Rendre le focus à l'éditeur
    this.editor.focus();

    // Régénérer les affichages
    if (window.wordApp && window.wordApp.pagination) {
      window.wordApp.pagination.renderPageSheets(window.wordApp.pagination.totalPages);
    }

    this.toasts.show('En-têtes et pieds de page enregistrés', 'success', 1800);
  }

  focusField(type, align = 'left') {
    const selector = type === 'header' ? '.page-sheet-header' : '.page-sheet-footer';
    const alignClass = `.hf-item-${align} .hf-editable`;
    const target = document.querySelector(`.page-sheet[data-page="${this.activePage}"] ${selector} ${alignClass}`);
    if (target) {
      target.focus();
      this.activeField = target;
    }
  }

  openPageNumberModal() {
    const modal = document.getElementById('modal-pagenumber');
    if (!modal) return;

    // Détecter où se trouve actuellement une numérotation pour pré-remplir la modale
    let detectedPos = 'footer';
    let detectedAlign = 'right';
    let detectedFormat = 'Page {page} sur {total}';

    const checkSlot = (slotVal, pos, align) => {
      if (typeof slotVal === 'string' && slotVal.includes('{page}')) {
        detectedPos = pos;
        detectedAlign = align;
        detectedFormat = slotVal;
      }
    };

    checkSlot(this.data.headerLeft, 'header', 'left');
    checkSlot(this.data.headerCenter, 'header', 'center');
    checkSlot(this.data.headerRight, 'header', 'right');
    checkSlot(this.data.footerLeft, 'footer', 'left');
    checkSlot(this.data.footerCenter, 'footer', 'center');
    checkSlot(this.data.footerRight, 'footer', 'right');

    const radioPos = document.querySelector(`input[name="pagenum-pos"][value="${detectedPos}"]`);
    if (radioPos) radioPos.checked = true;

    const radioAlign = document.querySelector(`input[name="pagenum-align"][value="${detectedAlign}"]`);
    if (radioAlign) radioAlign.checked = true;

    const formatSelect = document.getElementById('pagenum-format-select');
    const customRow = document.getElementById('pagenum-custom-format-row');
    const customInput = document.getElementById('pagenum-custom-format-input');

    if (formatSelect) {
      let matched = false;
      for (let i = 0; i < formatSelect.options.length; i++) {
        if (formatSelect.options[i].value === detectedFormat) {
          formatSelect.selectedIndex = i;
          matched = true;
          break;
        }
      }
      if (!matched) {
        formatSelect.value = 'custom';
        if (customRow) customRow.style.display = 'block';
        if (customInput) customInput.value = detectedFormat;
      } else {
        if (customRow) customRow.style.display = 'none';
      }
    }

    const chkFirst = document.getElementById('pagenum-show-first-page');
    if (chkFirst) {
      chkFirst.checked = !this.data.differentFirstPage;
    }

    this.updatePageNumPreview();
    modal.classList.add('active');
  }

  closePageNumberModal() {
    const modal = document.getElementById('modal-pagenumber');
    if (modal) modal.classList.remove('active');
  }

  updatePageNumPreview() {
    const pos = document.querySelector('input[name="pagenum-pos"]:checked')?.value || 'footer';
    const align = document.querySelector('input[name="pagenum-align"]:checked')?.value || 'right';
    const formatSelect = document.getElementById('pagenum-format-select');
    let template = formatSelect ? formatSelect.value : 'Page {page} sur {total}';
    if (template === 'custom') {
      const customInput = document.getElementById('pagenum-custom-format-input');
      template = (customInput && customInput.value.trim()) ? customInput.value.trim() : '{page}';
    }

    const rendered = template.replace(/{page}/g, '1').replace(/{total}/g, '3');

    // Mettre à jour les emplacements de l'aperçu
    const hLeft = document.getElementById('prev-h-left');
    const hCenter = document.getElementById('prev-h-center');
    const hRight = document.getElementById('prev-h-right');
    const fLeft = document.getElementById('prev-f-left');
    const fCenter = document.getElementById('prev-f-center');
    const fRight = document.getElementById('prev-f-right');

    const slots = [hLeft, hCenter, hRight, fLeft, fCenter, fRight];
    slots.forEach((s) => {
      if (s) {
        s.textContent = '';
        s.className = 'preview-hf-slot';
      }
    });

    if (pos === 'header') {
      if (hLeft) hLeft.textContent = this.data.headerLeft ? this.formatFieldValue('header-left', this.data.headerLeft, 1, 3) : 'Document';
      if (hRight) hRight.textContent = (this.data.headerRight && !this.data.headerRight.includes('{page}')) ? this.data.headerRight : '';
      
      let activeTarget = hRight;
      if (align === 'left') activeTarget = hLeft;
      else if (align === 'center') activeTarget = hCenter;
      
      if (activeTarget) {
        activeTarget.textContent = rendered;
        activeTarget.className = 'preview-hf-slot preview-active-slot';
      }
      if (fLeft) fLeft.textContent = this.data.footerLeft || 'Microsoft Word';
      if (fRight) fRight.textContent = this.data.footerRight && !this.data.footerRight.includes('{page}') ? this.data.footerRight : '';
    } else {
      if (hLeft) hLeft.textContent = this.data.headerLeft || 'Document';
      if (hRight) hRight.textContent = this.data.headerRight || 'Format A4';
      if (fLeft) fLeft.textContent = this.data.footerLeft || 'Microsoft Word';
      
      let activeTarget = fRight;
      if (align === 'left') activeTarget = fLeft;
      else if (align === 'center') activeTarget = fCenter;

      if (activeTarget) {
        activeTarget.textContent = rendered;
        activeTarget.className = 'preview-hf-slot preview-active-slot';
      }
    }

    // Mise à jour visuelle des cartes de sélection
    const cardHeader = document.getElementById('card-pos-header');
    const cardFooter = document.getElementById('card-pos-footer');
    if (cardHeader && cardFooter) {
      if (pos === 'header') {
        cardHeader.style.borderColor = 'var(--word-primary)';
        cardHeader.style.backgroundColor = 'var(--btn-selected)';
        cardFooter.style.borderColor = 'var(--border-subtle)';
        cardFooter.style.backgroundColor = 'var(--bg-paper)';
      } else {
        cardFooter.style.borderColor = 'var(--word-primary)';
        cardFooter.style.backgroundColor = 'var(--btn-selected)';
        cardHeader.style.borderColor = 'var(--border-subtle)';
        cardHeader.style.backgroundColor = 'var(--bg-paper)';
      }
    }

    ['left', 'center', 'right'].forEach((a) => {
      const card = document.getElementById(`card-align-${a}`);
      if (card) {
        if (a === align) {
          card.style.borderColor = 'var(--word-primary)';
          card.style.backgroundColor = 'var(--btn-selected)';
        } else {
          card.style.borderColor = 'var(--border-subtle)';
          card.style.backgroundColor = 'var(--bg-paper)';
        }
      }
    });
  }

  applyPageNumbering(options) {
    const { position, alignment, format, showOnFirstPage } = options;

    // 1. Déterminer le champ cible
    let targetFieldKey = '';
    if (position === 'header') {
      targetFieldKey = alignment === 'left' ? 'headerLeft' : (alignment === 'center' ? 'headerCenter' : 'headerRight');
    } else {
      targetFieldKey = alignment === 'left' ? 'footerLeft' : (alignment === 'center' ? 'footerCenter' : 'footerRight');
    }

    // 2. Nettoyer les anciens champs de numérotation pour éviter les doublons accidentels
    const fieldKeys = ['headerLeft', 'headerCenter', 'headerRight', 'footerLeft', 'footerCenter', 'footerRight'];
    fieldKeys.forEach((k) => {
      if (k !== targetFieldKey && typeof this.data[k] === 'string' && this.data[k].includes('{page}')) {
        this.data[k] = '';
      }
    });

    // 3. Définir le nouveau modèle de champ dynamique
    this.data[targetFieldKey] = format;

    // 4. Gérer la première page différente
    this.data.differentFirstPage = !showOnFirstPage;
    if (this.chkDifferentFirst) {
      this.chkDifferentFirst.checked = this.data.differentFirstPage;
    }

    // 5. Mettre à jour l'affichage sur toutes les pages A4 du document
    if (window.wordApp && window.wordApp.pagination) {
      window.wordApp.pagination.renderPageSheets(window.wordApp.pagination.totalPages);
    }

    // 6. Sauvegarder
    if (window.wordApp && window.wordApp.fileManager) {
      window.wordApp.fileManager.scheduleDebouncedSave();
    }

    const posLabel = position === 'header' ? 'Haut de page (En-tête)' : 'Bas de page (Pied de page)';
    const alignLabel = alignment === 'left' ? 'Gauche' : (alignment === 'center' ? 'Centré' : 'Droite');
    this.toasts.show(`Numéros de page appliqués : ${posLabel}, alignement ${alignLabel}`, 'success');
  }

  removePageNumbering() {
    const fieldKeys = ['headerLeft', 'headerCenter', 'headerRight', 'footerLeft', 'footerCenter', 'footerRight'];
    let removed = false;
    fieldKeys.forEach((k) => {
      if (typeof this.data[k] === 'string' && this.data[k].includes('{page}')) {
        this.data[k] = '';
        removed = true;
      }
    });

    if (window.wordApp && window.wordApp.pagination) {
      window.wordApp.pagination.renderPageSheets(window.wordApp.pagination.totalPages);
    }
    if (window.wordApp && window.wordApp.fileManager) {
      window.wordApp.fileManager.scheduleDebouncedSave();
    }

    if (removed) {
      this.toasts.show('Numéros de page supprimés du document', 'info');
    } else {
      this.toasts.show('Aucun numéro de page à supprimer', 'info');
    }
  }

  renderHeader(sheet, pageNum, totalPages) {
    const docTitle = window.wordApp ? window.wordApp.fileManager.getDocumentTitle() : 'Document Word';
    const isFirst = pageNum === 1;

    if (isFirst && this.data.differentFirstPage) {
      sheet.innerHTML += `
        <div class="page-sheet-header" data-page="${pageNum}">
          <div class="page-sheet-header-content">
            <span class="hf-item-left"><span class="hf-editable" data-field="header-left"></span></span>
            <span class="hf-item-center"><span class="hf-editable" data-field="header-center"></span></span>
            <span class="hf-item-right"><span class="hf-editable" data-field="header-right"></span></span>
          </div>
          <div class="hf-tag-badge">Première page - En-tête</div>
        </div>
      `;
      return;
    }

    const left = (this.data.headerLeft !== undefined && this.data.headerLeft !== null)
      ? this.formatFieldValue('header-left', this.data.headerLeft, pageNum, totalPages)
      : docTitle;
    const center = this.formatFieldValue('header-center', this.data.headerCenter || '', pageNum, totalPages);
    const right = (this.data.headerRight !== undefined && this.data.headerRight !== null)
      ? this.formatFieldValue('header-right', this.data.headerRight, pageNum, totalPages)
      : 'Format A4';

    sheet.innerHTML += `
      <div class="page-sheet-header" data-page="${pageNum}">
        <div class="page-sheet-header-content">
          <span class="hf-item-left"><span class="hf-editable" data-field="header-left">${left}</span></span>
          <span class="hf-item-center"><span class="hf-editable" data-field="header-center">${center}</span></span>
          <span class="hf-item-right"><span class="hf-editable" data-field="header-right">${right}</span></span>
        </div>
        <div class="hf-tag-badge">En-tête - Page ${pageNum}</div>
      </div>
    `;
  }

  renderFooter(sheet, pageNum, totalPages) {
    const isFirst = pageNum === 1;

    if (isFirst && this.data.differentFirstPage) {
      sheet.innerHTML += `
        <div class="page-sheet-footer" data-page="${pageNum}">
          <div class="page-sheet-footer-content">
            <span class="hf-item-left"><span class="hf-editable" data-field="footer-left"></span></span>
            <span class="hf-item-center"><span class="hf-editable" data-field="footer-center"></span></span>
            <span class="hf-item-right"><span class="hf-editable" data-field="footer-right"></span></span>
          </div>
          <div class="hf-tag-badge">Première page - Pied</div>
        </div>
      `;
      return;
    }

    const left = (this.data.footerLeft !== undefined && this.data.footerLeft !== null)
      ? this.formatFieldValue('footer-left', this.data.footerLeft, pageNum, totalPages)
      : 'Microsoft Word';
    const center = this.formatFieldValue('footer-center', this.data.footerCenter || '', pageNum, totalPages);
    const right = (this.data.footerRight !== undefined && this.data.footerRight !== null)
      ? this.formatFieldValue('footer-right', this.data.footerRight, pageNum, totalPages)
      : `Page ${pageNum} sur ${totalPages}`;

    sheet.innerHTML += `
      <div class="page-sheet-footer" data-page="${pageNum}">
        <div class="page-sheet-footer-content">
          <span class="hf-item-left"><span class="hf-editable" data-field="footer-left">${left}</span></span>
          <span class="hf-item-center"><span class="hf-editable" data-field="footer-center">${center}</span></span>
          <span class="hf-item-right"><span class="hf-editable" data-field="footer-right">${right}</span></span>
        </div>
        <div class="hf-tag-badge">Pied de page - Page ${pageNum}</div>
      </div>
    `;
  }
}

/**
 * ------------------------------------------------------------------------------
 * 8.6 GESTIONNAIRE DE FILIGRANE DE DOCUMENT (WATERMARK MANAGER)
 * Permet l'application d'un filigrane textuel fantôme sur l'ensemble des pages A4
 * avec personnalisation du texte (ex: Confidentiel, Brouillon), de l'opacité et de l'angle.
 * ------------------------------------------------------------------------------
 */
class WatermarkManager {
  constructor(toasts) {
    this.toasts = toasts;
    this.storageKey = 'ms_word_watermark';

    // Configuration par défaut
    this.state = {
      enabled: false,
      text: 'CONFIDENTIEL',
      opacity: 0.15,
      angle: 'diagonal', // 'diagonal' (-45deg) ou 'horizontal' (0deg)
      color: '#6b7280'
    };

    this.modal = document.getElementById('modal-watermark');
    this.textInput = document.getElementById('watermark-text-input');
    this.opacitySlider = document.getElementById('watermark-opacity-slider');
    this.opacityVal = document.getElementById('watermark-opacity-val');
    this.colorSelect = document.getElementById('watermark-color-select');
    this.previewBox = document.getElementById('watermark-preview-box');
    this.previewText = document.getElementById('watermark-preview-text');
    this.applyBtn = document.getElementById('btn-watermark-apply');
    this.removeBtn = document.getElementById('btn-watermark-remove');

    this.loadState();
    this.initEvents();
    this.applyToDOM();
  }

  loadState() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.state = Object.assign(this.state, parsed);
      }
    } catch (e) {
      console.warn('Impossible de charger le filigrane', e);
    }
  }

  saveState() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (e) {
      console.warn('Impossible de sauvegarder le filigrane', e);
    }
  }

  initEvents() {
    // Bouton Insertion > Filigrane dans le ruban
    document.getElementById('btn-insert-watermark')?.addEventListener('click', () => {
      this.openModal();
    });

    // Modèles prédéfinis (Presets)
    document.querySelectorAll('.watermark-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset;
        if (preset && this.textInput) {
          this.textInput.value = preset;
          this.updatePreview();
        }
      });
    });

    // Mise à jour de l'aperçu en direct
    this.textInput?.addEventListener('input', () => this.updatePreview());
    this.opacitySlider?.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10) || 15;
      if (this.opacityVal) this.opacityVal.textContent = `${val} %`;
      this.updatePreview();
    });
    this.colorSelect?.addEventListener('change', () => this.updatePreview());

    document.querySelectorAll('input[name="watermark-angle"]').forEach((radio) => {
      radio.addEventListener('change', () => this.updatePreview());
    });

    // Bouton Appliquer
    this.applyBtn?.addEventListener('click', () => {
      const text = (this.textInput?.value || '').trim() || 'CONFIDENTIEL';
      const opacity = (parseInt(this.opacitySlider?.value, 10) || 15) / 100;
      const angle = document.querySelector('input[name="watermark-angle"]:checked')?.value || 'diagonal';
      const color = this.colorSelect?.value || '#6b7280';

      this.state = {
        enabled: true,
        text,
        opacity,
        angle,
        color
      };

      this.saveState();
      this.applyToDOM();
      this.closeModal();
      this.toasts.show(`Filigrane « ${text} » appliqué à toutes les pages`, 'success');
    });

    // Bouton Supprimer
    this.removeBtn?.addEventListener('click', () => {
      this.state.enabled = false;
      this.saveState();
      this.applyToDOM();
      this.closeModal();
      this.toasts.show('Le filigrane a été supprimé du document', 'info');
    });
  }

  openModal() {
    if (!this.modal) return;
    if (this.textInput) this.textInput.value = this.state.text || 'CONFIDENTIEL';
    if (this.opacitySlider) {
      const pct = Math.round((this.state.opacity || 0.15) * 100);
      this.opacitySlider.value = String(pct);
      if (this.opacityVal) this.opacityVal.textContent = `${pct} %`;
    }
    if (this.colorSelect) this.colorSelect.value = this.state.color || '#6b7280';

    const diagRadio = document.getElementById('wm-angle-diag');
    const horizRadio = document.getElementById('wm-angle-horiz');
    if (this.state.angle === 'horizontal') {
      if (horizRadio) horizRadio.checked = true;
    } else {
      if (diagRadio) diagRadio.checked = true;
    }

    if (this.removeBtn) {
      this.removeBtn.style.display = this.state.enabled ? 'inline-block' : 'none';
    }

    this.updatePreview();
    this.modal.classList.add('active');
    setTimeout(() => this.textInput?.focus(), 80);
  }

  closeModal() {
    if (this.modal) this.modal.classList.remove('active');
  }

  updatePreview() {
    if (!this.previewText) return;
    const text = (this.textInput?.value || '').trim() || 'CONFIDENTIEL';
    const pct = parseInt(this.opacitySlider?.value, 10) || 15;
    const color = this.colorSelect?.value || '#6b7280';
    const angle = document.querySelector('input[name="watermark-angle"]:checked')?.value || 'diagonal';

    this.previewText.textContent = text;
    this.previewText.style.opacity = String(pct / 100);
    this.previewText.style.color = color;
    this.previewText.style.transform = angle === 'horizontal' ? 'rotate(0deg)' : 'rotate(-25deg)';
  }

  applyToDOM() {
    // Mettre à jour les variables pour @media print
    if (this.state.enabled) {
      document.body.classList.add('has-watermark');
      document.body.style.setProperty('--print-watermark-text', `"${this.state.text.replace(/"/g, '\\"')}"`);
      document.body.style.setProperty('--print-watermark-opacity', String(this.state.opacity));
      document.body.style.setProperty('--print-watermark-angle', this.state.angle === 'horizontal' ? '0deg' : '-45deg');
      document.body.style.setProperty('--print-watermark-color', this.state.color);
    } else {
      document.body.classList.remove('has-watermark');
      document.body.style.removeProperty('--print-watermark-text');
      document.body.style.removeProperty('--print-watermark-opacity');
      document.body.style.removeProperty('--print-watermark-angle');
      document.body.style.removeProperty('--print-watermark-color');
    }

    // Mettre à jour chaque feuille A4 (.page-sheet)
    const sheets = document.querySelectorAll('.page-sheet');
    sheets.forEach((sheet) => this.renderSheetWatermark(sheet));

    // Mettre à jour l'apparence active du bouton dans le ruban
    const ribbonBtn = document.getElementById('btn-insert-watermark');
    if (ribbonBtn) {
      if (this.state.enabled) {
        ribbonBtn.classList.add('active');
        ribbonBtn.title = `Filigrane actif : « ${this.state.text} » (Cliquer pour modifier ou supprimer)`;
      } else {
        ribbonBtn.classList.remove('active');
        ribbonBtn.title = "Ajouter ou modifier un filigrane de page (ex: Confidentiel, Brouillon)";
      }
    }
  }

  renderSheetWatermark(sheet) {
    if (!sheet) return;
    let wm = sheet.querySelector('.page-sheet-watermark');

    if (!this.state.enabled) {
      if (wm) wm.remove();
      return;
    }

    if (!wm) {
      wm = document.createElement('div');
      wm.className = 'page-sheet-watermark';
      wm.setAttribute('aria-hidden', 'true');
      sheet.insertBefore(wm, sheet.firstChild);
    }

    const angleDeg = this.state.angle === 'horizontal' ? '0deg' : '-45deg';
    let fontSize = 76;
    if (this.state.text.length > 12) fontSize = 54;
    if (this.state.text.length > 20) fontSize = 38;

    wm.innerHTML = `
      <div class="watermark-content" style="opacity: ${this.state.opacity}; transform: rotate(${angleDeg}); color: ${this.state.color}; font-size: ${fontSize}px;">
        ${this.escapeHtml(this.state.text)}
      </div>
    `;
  }

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

/**
 * ------------------------------------------------------------------------------
 * 9. GESTIONNAIRE DE PAGINATION & AFFICHAGE MULTI-PAGES A4 (PAGINATION MANAGER)
 * Permet d'afficher correctement toutes les pages sous forme de feuilles A4
 * distinctes avec marges, en-têtes, pieds de page et espacement réaliste.
 * ------------------------------------------------------------------------------
 */
class PaginationManager {
  constructor(editor, pageElement, statusBarManager) {
    this.editor = editor;
    this.pageElement = pageElement;
    this.pagesLayer = document.getElementById('pages-layer');
    this.statusBar = statusBarManager;

    // Hauteur standard d'une page A4 (1056px à 96dpi, proportion 210mm x 297mm)
    this.pageHeight = 1056;
    this.pagePaddingY = 152; // 76px marge haute + 76px marge basse
    this.pageGap = 28; // Interstice réaliste entre pages A4 (28px de bureau gris)
    this.usablePageHeight = this.pageHeight - this.pagePaddingY; // 904px de hauteur imprimable utile

    this.totalPages = 1;
    this.currentPage = 1;
    this.debounceTimer = null;
    this.isUpdating = false;

    this.initEvents();
  }

  initEvents() {
    // Recalculer la pagination lors de la frappe (debounced)
    this.editor.addEventListener('input', () => {
      if (this.debounceTimer) clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => this.updatePagination(), 280);
    });

    // Détecter la page active au défilement
    const canvas = document.getElementById('canvas-wrapper');
    if (canvas) {
      canvas.addEventListener('scroll', () => this.detectCurrentPage());
    }

    // Gestion ergonomique de la suppression des sauts de page avec Backspace et Delete
    this.editor.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace') {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;
        const range = sel.getRangeAt(0);
        if (range.collapsed && range.startOffset === 0) {
          let node = range.startContainer;
          if (node.nodeType === Node.TEXT_NODE) node = node.parentNode;
          // Si le nœud précédent ou son parent est un saut de page
          const prev = node.previousElementSibling;
          if (prev && prev.classList.contains('word-page-break')) {
            e.preventDefault();
            prev.remove();
            this.updatePagination();
            return;
          }
        }
      } else if (e.key === 'Delete') {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;
        const range = sel.getRangeAt(0);
        if (range.collapsed) {
          let node = range.startContainer;
          if (node.nodeType === Node.TEXT_NODE) node = node.parentNode;
          const next = node.nextElementSibling;
          if (next && next.classList.contains('word-page-break')) {
            e.preventDefault();
            next.remove();
            this.updatePagination();
            return;
          }
        }
      }
    });

    // Mise à jour initiale après chargement
    setTimeout(() => this.updatePagination(), 400);
  }

  getDocumentTitle() {
    if (window.wordApp && window.wordApp.fileManager) {
      return window.wordApp.fileManager.getDocumentTitle();
    }
    const input = document.getElementById('doc-title-input');
    if (input && input.value) {
      return input.value.trim().replace(/\s*-\s*Word$/i, '') || 'Document Word';
    }
    return 'Document Word';
  }

  renderPageSheets(totalPages) {
    if (!this.pagesLayer) {
      this.pagesLayer = document.getElementById('pages-layer');
    }
    if (!this.pagesLayer) return;

    this.pagesLayer.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
      const sheet = document.createElement('div');
      sheet.className = 'page-sheet';
      sheet.dataset.page = String(i);

      if (window.wordApp && window.wordApp.headerFooter) {
        window.wordApp.headerFooter.renderHeader(sheet, i, totalPages);
        window.wordApp.headerFooter.renderFooter(sheet, i, totalPages);
      } else {
        const docTitle = this.getDocumentTitle();
        sheet.innerHTML = `
          <div class="page-sheet-header">
            <div class="page-sheet-header-content">
              <span class="hf-item-left"><span class="hf-editable" data-field="header-left">${docTitle}</span></span>
              <span class="hf-item-center"><span class="hf-editable" data-field="header-center"></span></span>
              <span class="hf-item-right"><span class="hf-editable" data-field="header-right">Format A4</span></span>
            </div>
            <div class="hf-tag-badge">En-tête - Page ${i}</div>
          </div>
          <div class="page-sheet-footer">
            <div class="page-sheet-footer-content">
              <span class="hf-item-left"><span class="hf-editable" data-field="footer-left">Microsoft Word</span></span>
              <span class="hf-item-center"><span class="hf-editable" data-field="footer-center"></span></span>
              <span class="hf-item-right"><span class="hf-editable" data-field="footer-right">Page ${i} sur ${totalPages}</span></span>
            </div>
            <div class="hf-tag-badge">Pied de page - Page ${i}</div>
          </div>
        `;
      }
      if (window.wordApp && window.wordApp.watermark) {
        window.wordApp.watermark.renderSheetWatermark(sheet);
      }
      this.pagesLayer.appendChild(sheet);
    }

    // Ajuster la hauteur globale du document
    const totalHeight = totalPages * this.pageHeight + (totalPages - 1) * this.pageGap;
    this.pageElement.style.minHeight = `${totalHeight}px`;

    // Mettre à jour la règle verticale si elle existe
    if (window.wordApp && window.wordApp.ruler) {
      window.wordApp.ruler.renderVerticalTicks(totalPages);
    }
  }

  createPageBreakElement(nextPageNum, isManual = false, breakHeight = 180, remaining = 0) {
    const pBreak = document.createElement('div');
    pBreak.className = 'word-page-break';
    pBreak.setAttribute('contenteditable', 'false');
    pBreak.dataset.manual = isManual ? 'true' : 'false';
    pBreak.dataset.page = String(nextPageNum);
    pBreak.style.height = `${Math.round(breakHeight)}px`;

    // L'indicateur visuel se positionne pile dans l'interstice gris de 28px
    const indicatorTop = Math.round(remaining + 76);

    pBreak.innerHTML = `
      <div class="page-break-gap-visual" style="top: ${indicatorTop}px;">
        <div class="page-break-gap-line"></div>
        <span class="page-break-badge">Page ${nextPageNum}${isManual ? ' (Saut manuel)' : ''}</span>
        <div class="page-break-gap-line"></div>
      </div>
    `;

    return pBreak;
  }

  insertManualBreak() {
    this.editor.focus();
    const sel = window.getSelection();
    const prevPage = this.currentPage || 1;
    const nextPage = prevPage + 1;

    // Hauteur par défaut d'un saut de page manuel
    const breakEl = this.createPageBreakElement(nextPage, true, 180, 0);
    const pAfter = document.createElement('p');
    pAfter.innerHTML = '<br>';

    if (sel && sel.rangeCount > 0 && this.editor.contains(sel.anchorNode)) {
      const range = sel.getRangeAt(0);
      range.collapse(false);
      range.insertNode(pAfter);
      range.insertNode(breakEl);

      const newRange = document.createRange();
      newRange.setStart(pAfter, 0);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);
    } else {
      this.editor.appendChild(breakEl);
      this.editor.appendChild(pAfter);
    }

    if (window.wordApp && window.wordApp.history) {
      window.wordApp.history.pushState(true);
    }
    this.updatePagination();
  }

  updatePagination() {
    if (this.isUpdating) return;
    this.isUpdating = true;

    try {
      // 1. Sauvegarder la sélection utilisateur
      const sel = window.getSelection();
      let activeRange = null;
      if (sel && sel.rangeCount > 0 && this.editor.contains(sel.anchorNode)) {
        activeRange = sel.getRangeAt(0).cloneRange();
      }

      // 2. Nettoyer les anciens sauts automatiques et anciens résidus de pagination
      const autoBreaks = this.editor.querySelectorAll('.word-page-break[data-manual="false"]');
      autoBreaks.forEach((b) => b.remove());

      const oldArtifacts = this.editor.querySelectorAll('.page-last-spacer, .page-last-footer, .page-break-spacer, .page-break-end, .page-break-start');
      oldArtifacts.forEach((el) => el.remove());

      // 3. Normaliser les nœuds texte racine orphelins éventuels
      Array.from(this.editor.childNodes).forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0) {
          const p = document.createElement('p');
          p.textContent = node.textContent;
          this.editor.replaceChild(p, node);
        }
      });

      // 4. Parcourir les éléments blocs enfants directs
      const children = Array.from(this.editor.children);
      let pageNum = 1;
      let currentHeight = 0;

      for (let i = 0; i < children.length; i++) {
        const child = children[i];

        // Si c'est un saut manuel
        if (child.classList && child.classList.contains('word-page-break') && child.dataset.manual === 'true') {
          const remaining = Math.max(0, this.usablePageHeight - currentHeight);
          const breakHeight = remaining + this.pagePaddingY + this.pageGap;
          child.style.height = `${Math.round(breakHeight)}px`;
          child.dataset.page = String(pageNum + 1);

          const visual = child.querySelector('.page-break-gap-visual');
          if (visual) {
            visual.style.top = `${Math.round(remaining + 76)}px`;
            const badge = visual.querySelector('.page-break-badge');
            if (badge) badge.textContent = `Page ${pageNum + 1} (Saut manuel)`;
          }

          pageNum++;
          currentHeight = 0;
          continue;
        }

        // Mesurer la hauteur du bloc
        const rect = child.getBoundingClientRect();
        const style = window.getComputedStyle(child);
        const marginY = parseFloat(style.marginTop || 0) + parseFloat(style.marginBottom || 0);
        const blockHeight = Math.max(20, (rect.height || child.offsetHeight || 24) + marginY);

        // Si le bloc fait déborder la page courante
        if (currentHeight > 0 && (currentHeight + blockHeight > this.usablePageHeight)) {
          const remaining = Math.max(0, this.usablePageHeight - currentHeight);
          const breakHeight = remaining + this.pagePaddingY + this.pageGap;
          pageNum++;
          const breakEl = this.createPageBreakElement(pageNum, false, breakHeight, remaining);
          this.editor.insertBefore(breakEl, child);
          currentHeight = blockHeight;
        } else {
          currentHeight += blockHeight;
        }
      }

      this.totalPages = Math.max(1, pageNum);

      // 5. Générer les feuilles A4 blanches d'arrière-plan avec leurs ombres portées
      this.renderPageSheets(this.totalPages);

      // 6. Mettre à jour les badges de page
      const allBreaks = this.editor.querySelectorAll('.word-page-break');
      allBreaks.forEach((br) => {
        const pNum = parseInt(br.dataset.page || '2', 10);
        const badgeLbl = br.querySelector('.page-break-badge');
        if (badgeLbl) {
          const isMan = br.dataset.manual === 'true';
          badgeLbl.textContent = `Page ${pNum}${isMan ? ' (Saut manuel)' : ''}`;
        }
      });

      // 7. Notifier la barre d'état
      if (this.statusBar) {
        this.statusBar.updatePageCount(this.currentPage, this.totalPages);
      }

      // 8. Restaurer la sélection si possible
      if (activeRange && sel) {
        try {
          sel.removeAllRanges();
          sel.addRange(activeRange);
        } catch (e) {
          // ignore
        }
      }
    } catch (e) {
      console.warn('Erreur mise à jour pagination', e);
    } finally {
      this.isUpdating = false;
    }
  }

  detectCurrentPage() {
    const canvas = document.getElementById('canvas-wrapper');
    if (!canvas) return;

    const scrollTop = canvas.scrollTop;
    const pagePitch = this.pageHeight + this.pageGap;
    const detected = Math.min(this.totalPages, Math.max(1, Math.floor((scrollTop + 280) / pagePitch) + 1));

    if (detected !== this.currentPage) {
      this.currentPage = detected;
      if (this.statusBar) {
        this.statusBar.updatePageCount(this.currentPage, this.totalPages);
      }
    }
  }

  scrollToPage(pageNum) {
    const canvas = document.getElementById('canvas-wrapper');
    if (!canvas) return;

    pageNum = Math.max(1, Math.min(this.totalPages, pageNum));
    this.currentPage = pageNum;

    const pagePitch = this.pageHeight + this.pageGap;
    canvas.scrollTo({ top: (pageNum - 1) * pagePitch, behavior: 'smooth' });

    if (this.statusBar) {
      this.statusBar.updatePageCount(this.currentPage, this.totalPages);
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.scrollToPage(this.currentPage + 1);
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.scrollToPage(this.currentPage - 1);
    }
  }
}

/**
 * ------------------------------------------------------------------------------
 * 10. BARRE D'ÉTAT & STATISTIQUES EN TEMPS RÉEL (STATUS BAR MANAGER)
 * ------------------------------------------------------------------------------
 */
class StatusBarManager {
  constructor(editor, zoomContainer, onStatsClick) {
    this.editor = editor;
    this.zoomContainer = zoomContainer;
    this.zoom = 100;
    this.currentPage = 1;
    this.totalPages = 1;

    this.lblWords = document.getElementById('status-words');
    this.lblChars = document.getElementById('status-chars');
    this.lblPages = document.getElementById('status-page-count');
    this.zoomSlider = document.getElementById('sb-zoom-slider');
    this.zoomVal = document.getElementById('sb-zoom-val');

    this.initEvents(onStatsClick);
    this.updateStats();
  }

  initEvents(onStatsClick) {
    this.editor.addEventListener('input', () => this.updateStats());

    // Contrôles de zoom
    this.zoomSlider.addEventListener('input', (e) => {
      this.setZoom(parseInt(e.target.value, 10));
    });

    document.getElementById('sb-zoom-in').addEventListener('click', () => this.setZoom(this.zoom + 10));
    document.getElementById('sb-zoom-out').addEventListener('click', () => this.setZoom(this.zoom - 10));
    this.zoomVal.addEventListener('click', () => this.setZoom(100));

    // Boutons du ruban pour le zoom
    const rzIn = document.getElementById('btn-ribbon-zoom-in');
    const rzOut = document.getElementById('btn-ribbon-zoom-out');
    const rz100 = document.getElementById('btn-zoom-100');
    if (rzIn) rzIn.addEventListener('click', () => this.setZoom(this.zoom + 10));
    if (rzOut) rzOut.addEventListener('click', () => this.setZoom(this.zoom - 10));
    if (rz100) rz100.addEventListener('click', () => this.setZoom(100));

    // Clic sur les mots pour afficher les statistiques détaillées
    if (this.lblWords && typeof onStatsClick === 'function') {
      this.lblWords.addEventListener('click', onStatsClick);
    }

    // Clic sur l'indicateur de page pour naviguer entre les pages
    if (this.lblPages) {
      this.lblPages.classList.add('clickable');
      this.lblPages.title = 'Page active (cliquer pour aller à la page suivante)';
      this.lblPages.addEventListener('click', () => {
        if (window.wordApp && window.wordApp.pagination) {
          const next = (window.wordApp.pagination.currentPage % window.wordApp.pagination.totalPages) + 1;
          window.wordApp.pagination.scrollToPage(next);
        }
      });
    }
  }

  setZoom(val) {
    this.zoom = Math.max(50, Math.min(200, val));
    this.zoomSlider.value = String(this.zoom);
    this.zoomVal.textContent = `${this.zoom} %`;
    this.zoomContainer.style.transform = `scale(${this.zoom / 100})`;
  }

  getDetailedStats() {
    const rawText = this.editor.innerText || '';
    const cleanText = rawText.trim();
    const words = cleanText ? cleanText.split(/\s+/).filter(Boolean).length : 0;
    const charsWithSpaces = rawText.length;
    const charsNoSpaces = rawText.replace(/\s/g, '').length;
    const paragraphs = rawText.split(/\n+/).filter((p) => p.trim().length > 0).length;

    return { words, charsWithSpaces, charsNoSpaces, paragraphs, pages: this.totalPages || 1 };
  }

  updatePageCount(current, total) {
    this.currentPage = current;
    this.totalPages = total;
    if (this.lblPages) {
      this.lblPages.textContent = `Page ${current} sur ${total}`;
    }
    const infoPages = document.getElementById('info-doc-pages');
    if (infoPages) infoPages.textContent = String(total);
  }

  updateStats() {
    const stats = this.getDetailedStats();
    if (this.lblWords) this.lblWords.textContent = `${stats.words} mot${stats.words > 1 ? 's' : ''}`;
    if (this.lblChars) this.lblChars.textContent = `${stats.charsWithSpaces} caractères`;
    if (this.lblPages && !this.lblPages.textContent.includes('sur')) {
      this.lblPages.textContent = `Page ${this.currentPage} sur ${stats.pages}`;
    }

    // Mise à jour de la vue informations Backstage
    const infoWords = document.getElementById('info-doc-words');
    const infoChars = document.getElementById('info-doc-chars');
    const infoPages = document.getElementById('info-doc-pages');
    if (infoWords) infoWords.textContent = String(stats.words);
    if (infoChars) infoChars.textContent = String(stats.charsWithSpaces);
    if (infoPages) infoPages.textContent = String(stats.pages);
  }
}

/**
 * ------------------------------------------------------------------------------
 * 8. GESTIONNAIRE DU RUBAN (RIBBON MANAGER)
 * ------------------------------------------------------------------------------
 */
class RibbonManager {
  constructor(editorEngine) {
    this.engine = editorEngine;
    this.activeTab = 'panel-home';

    this.initTabs();
    this.initCommandBindings();
    this.initColorPalettes();
    this.initTableGridPicker();
    this.initStyleBoxes();
    this.initSelectionSync();
  }

  initTabs() {
    const tabs = document.querySelectorAll('.ribbon-tab[data-tab]');
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach((t) => t.classList.remove('active'));
        document.querySelectorAll('.ribbon-panel').forEach((p) => p.classList.remove('active'));

        tab.classList.add('active');
        const targetPanelId = tab.getAttribute('data-tab');
        const targetPanel = document.getElementById(targetPanelId);
        if (targetPanel) targetPanel.classList.add('active');
        this.activeTab = targetPanelId;
      });
    });
  }

  initCommandBindings() {
    // Presse-papiers
    document.getElementById('btn-cut').addEventListener('click', () => this.engine.exec('cut'));
    document.getElementById('btn-copy').addEventListener('click', () => this.engine.exec('copy'));
    document.getElementById('btn-paste').addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        this.engine.exec('insertText', text);
      } catch {
        this.engine.exec('paste');
      }
    });

    // Format de police
    document.getElementById('btn-bold').addEventListener('click', () => this.engine.exec('bold'));
    document.getElementById('btn-italic').addEventListener('click', () => this.engine.exec('italic'));
    document.getElementById('btn-underline').addEventListener('click', () => this.engine.exec('underline'));
    document.getElementById('btn-strikethrough').addEventListener('click', () => this.engine.exec('strikeThrough'));
    document.getElementById('btn-subscript').addEventListener('click', () => this.engine.exec('subscript'));
    document.getElementById('btn-superscript').addEventListener('click', () => this.engine.exec('superscript'));
    document.getElementById('btn-clear-format').addEventListener('click', () => this.engine.exec('removeFormat'));

    document.getElementById('btn-font-grow').addEventListener('click', () => this.engine.adjustFontSize(2));
    document.getElementById('btn-font-shrink').addEventListener('click', () => this.engine.adjustFontSize(-2));

    document.getElementById('font-family-select').addEventListener('change', (e) => {
      this.engine.setFontFamily(e.target.value);
    });

    document.getElementById('font-size-select').addEventListener('change', (e) => {
      this.engine.setFontSize(parseInt(e.target.value, 10));
    });

    // Paragraphe & Alignements
    document.getElementById('btn-align-left').addEventListener('click', () => this.engine.exec('justifyLeft'));
    document.getElementById('btn-align-center').addEventListener('click', () => this.engine.exec('justifyCenter'));
    document.getElementById('btn-align-right').addEventListener('click', () => this.engine.exec('justifyRight'));
    document.getElementById('btn-align-justify').addEventListener('click', () => this.engine.exec('justifyFull'));

    document.getElementById('btn-bullet-list').addEventListener('click', () => this.engine.exec('insertUnorderedList'));
    document.getElementById('btn-number-list').addEventListener('click', () => this.engine.exec('insertOrderedList'));
    document.getElementById('btn-indent').addEventListener('click', () => this.engine.exec('indent'));
    document.getElementById('btn-outdent').addEventListener('click', () => this.engine.exec('outdent'));

    document.getElementById('line-height-select').addEventListener('change', (e) => {
      this.engine.setLineHeight(e.target.value);
    });

    // Insertion
    document.getElementById('btn-insert-pagebreak').addEventListener('click', () => this.engine.insertPageBreak());
    document.getElementById('btn-insert-hr').addEventListener('click', () => this.engine.exec('insertHorizontalRule'));
    document.getElementById('btn-insert-callout').addEventListener('click', () => this.engine.insertCallout());
    document.getElementById('btn-insert-datetime').addEventListener('click', () => this.engine.insertDateTime());
    document.getElementById('btn-insert-symbol').addEventListener('click', () => this.engine.insertSymbol('©'));

    const btnHeader = document.getElementById('btn-insert-header');
    if (btnHeader) {
      btnHeader.addEventListener('click', () => {
        if (window.wordApp && window.wordApp.headerFooter) {
          window.wordApp.headerFooter.open('header', 1);
        }
      });
    }

    const btnFooter = document.getElementById('btn-insert-footer');
    if (btnFooter) {
      btnFooter.addEventListener('click', () => {
        if (window.wordApp && window.wordApp.headerFooter) {
          window.wordApp.headerFooter.open('footer', 1);
        }
      });
    }

    // Affichage des pages A4
    const btnMulti = document.getElementById('btn-view-multipage');
    if (btnMulti) {
      btnMulti.addEventListener('click', () => {
        if (window.wordApp && window.wordApp.pagination) {
          window.wordApp.pagination.updatePagination();
          window.wordApp.toasts.show('Affichage de toutes les pages A4 actif', 'info');
        }
      });
    }

    const btnPrev = document.getElementById('btn-page-prev');
    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        if (window.wordApp && window.wordApp.pagination) {
          window.wordApp.pagination.prevPage();
        }
      });
    }

    const btnNext = document.getElementById('btn-page-next');
    if (btnNext) {
      btnNext.addEventListener('click', () => {
        if (window.wordApp && window.wordApp.pagination) {
          window.wordApp.pagination.nextPage();
        }
      });
    }
  }

  initColorPalettes() {
    // Génération de la palette Word Thématique
    const themeGrid = document.getElementById('theme-colors-grid');
    if (themeGrid) {
      const baseColors = ['#ffffff', '#000000', '#eeece1', '#1f497d', '#4f81bd', '#c0504d', '#9bbb59', '#8064a2', '#4bacc6', '#f79646'];
      // Variations de teintes
      baseColors.forEach((hex) => {
        const swatch = document.createElement('div');
        swatch.className = 'color-swatch';
        swatch.style.backgroundColor = hex;
        swatch.dataset.color = hex;
        themeGrid.appendChild(swatch);
      });
    }

    // Gestion du menu couleur de police
    const fontColorBtn = document.getElementById('btn-font-color');
    const fontColorMenu = document.getElementById('font-color-palette');
    fontColorBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      fontColorMenu.classList.toggle('show');
      document.getElementById('highlight-palette').classList.remove('show');
    });

    fontColorMenu.addEventListener('click', (e) => {
      const swatch = e.target.closest('.color-swatch');
      if (swatch) {
        const color = swatch.dataset.color;
        this.engine.setTextColor(color);
        document.getElementById('font-color-bar').style.backgroundColor = color;
        fontColorMenu.classList.remove('show');
      }
    });

    // Gestion du menu couleur de surbrillance
    const hlBtn = document.getElementById('btn-highlight-color');
    const hlMenu = document.getElementById('highlight-palette');
    hlBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      hlMenu.classList.toggle('show');
      fontColorMenu.classList.remove('show');
    });

    hlMenu.addEventListener('click', (e) => {
      const swatch = e.target.closest('.color-swatch');
      if (swatch) {
        const color = swatch.dataset.color;
        this.engine.setHighlightColor(color);
        document.getElementById('highlight-bar').style.backgroundColor = color === 'transparent' ? '#ccc' : color;
        hlMenu.classList.remove('show');
      }
    });

    // Fermer les palettes au clic extérieur
    window.addEventListener('click', () => {
      fontColorMenu.classList.remove('show');
      hlMenu.classList.remove('show');
      const tablePicker = document.getElementById('table-grid-picker');
      if (tablePicker) tablePicker.classList.remove('show');
    });
  }

  initTableGridPicker() {
    const btnTableMenu = document.getElementById('btn-table-menu');
    const tablePicker = document.getElementById('table-grid-picker');
    const cellsContainer = document.getElementById('table-grid-cells');
    const statusLabel = document.getElementById('table-grid-status');

    if (!btnTableMenu || !cellsContainer) return;

    btnTableMenu.addEventListener('click', (e) => {
      e.stopPropagation();
      tablePicker.classList.toggle('show');
    });

    // Générer 8x8 = 64 cellules
    for (let r = 1; r <= 8; r++) {
      for (let c = 1; c <= 8; c++) {
        const cell = document.createElement('div');
        cell.className = 'table-cell-choice';
        cell.dataset.row = String(r);
        cell.dataset.col = String(c);

        cell.addEventListener('mouseenter', () => {
          statusLabel.textContent = `Insérer un tableau (${c} × ${r})`;
          document.querySelectorAll('.table-cell-choice').forEach((el) => {
            const elR = parseInt(el.dataset.row, 10);
            const elC = parseInt(el.dataset.col, 10);
            el.classList.toggle('highlight', elR <= r && elC <= c);
          });
        });

        cell.addEventListener('click', () => {
          this.engine.insertTable(c, r, true);
          tablePicker.classList.remove('show');
        });

        cellsContainer.appendChild(cell);
      }
    }
  }

  initStyleBoxes() {
    const boxes = document.querySelectorAll('.style-box');
    boxes.forEach((box) => {
      box.addEventListener('click', () => {
        boxes.forEach((b) => b.classList.remove('active'));
        box.classList.add('active');
        const styleTag = box.dataset.style;
        this.engine.formatBlock(styleTag);
      });
    });
  }

  initSelectionSync() {
    // Met à jour l'état actif des boutons B, I, U, etc. selon la position du curseur
    const syncButtons = () => {
      const isBold = document.queryCommandState('bold');
      const isItalic = document.queryCommandState('italic');
      const isUnderline = document.queryCommandState('underline');
      const isStrike = document.queryCommandState('strikeThrough');
      const isLeft = document.queryCommandState('justifyLeft');
      const isCenter = document.queryCommandState('justifyCenter');
      const isRight = document.queryCommandState('justifyRight');
      const isJustify = document.queryCommandState('justifyFull');

      document.getElementById('btn-bold')?.classList.toggle('active', isBold);
      document.getElementById('btn-italic')?.classList.toggle('active', isItalic);
      document.getElementById('btn-underline')?.classList.toggle('active', isUnderline);
      document.getElementById('btn-strikethrough')?.classList.toggle('active', isStrike);

      document.getElementById('btn-align-left')?.classList.toggle('active', isLeft);
      document.getElementById('btn-align-center')?.classList.toggle('active', isCenter);
      document.getElementById('btn-align-right')?.classList.toggle('active', isRight);
      document.getElementById('btn-align-justify')?.classList.toggle('active', isJustify);
    };

    document.addEventListener('selectionchange', syncButtons);
    this.engine.editor.addEventListener('keyup', syncButtons);
    this.engine.editor.addEventListener('mouseup', syncButtons);
  }
}

/**
 * ------------------------------------------------------------------------------
 * 9. ORCHESTRATEUR PRINCIPAL DE L'APPLICATION (WORD APP)
 * ------------------------------------------------------------------------------
 */
class WordApp {
  constructor() {
    this.editorElement = document.getElementById('word-editor');
    this.docPageElement = document.getElementById('document-page');
    this.docTitleInput = document.getElementById('doc-title-input');
    this.zoomContainer = document.getElementById('zoom-container');

    this.toasts = new ToastManager();
    this.history = new HistoryManager(this.editorElement, (canUndo, canRedo) => {
      const uBtn = document.getElementById('qa-undo');
      const rBtn = document.getElementById('qa-redo');
      if (uBtn) uBtn.disabled = !canUndo;
      if (rBtn) rBtn.disabled = !canRedo;
    });

    this.engine = new EditorEngine(this.editorElement, this.history);
    this.speech = new SpeechRecognitionManager(this.engine, this.toasts);
    this.spellCheck = new SpellCheckEngine(this.editorElement, this.toasts, this.history);
    this.ribbon = new RibbonManager(this.engine);
    this.fileManager = new FileManager(this.editorElement, this.docTitleInput, this.toasts);
    this.searchReplace = new SearchReplaceManager(this.editorElement);
    this.ruler = new RulerManager(
      this.docPageElement,
      document.getElementById('ruler-left-marker'),
      document.getElementById('ruler-right-marker')
    );
    this.statusBar = new StatusBarManager(this.editorElement, this.zoomContainer, () => this.showStatsModal());
    this.headerFooter = new HeaderFooterManager(this.editorElement, this.docPageElement, this.toasts);
    this.watermark = new WatermarkManager(this.toasts);
    this.pagination = new PaginationManager(this.editorElement, this.docPageElement, this.statusBar);
    window.wordApp = this;

    this.initGlobalEvents();
    this.initBackstageMenu();
    this.initModals();
    this.initThemeToggle();

    // Restauration de la session précédente si disponible
    this.fileManager.loadFromStorage();
    // Analyse orthographique et pagination initiales
    setTimeout(() => {
      this.pagination.updatePagination();
      this.spellCheck.scanEditor();
    }, 600);
  }

  initGlobalEvents() {
    // Accès Rapide
    document.getElementById('qa-save').addEventListener('click', () => {
      this.fileManager.saveToStorage();
      this.toasts.show('Document enregistré avec succès', 'success');
    });

    document.getElementById('qa-undo').addEventListener('click', () => this.history.undo());
    document.getElementById('qa-redo').addEventListener('click', () => this.history.redo());
    document.getElementById('qa-print').addEventListener('click', () => window.print());

    // Raccourcis clavier universels
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && !e.altKey) {
        const key = e.key.toLowerCase();
        if (key === 's') {
          e.preventDefault();
          this.fileManager.saveToStorage();
          this.toasts.show('Document enregistré avec succès', 'success');
        } else if (key === 'z' && !e.shiftKey) {
          e.preventDefault();
          this.history.undo();
        } else if (key === 'y' || (key === 'z' && e.shiftKey)) {
          e.preventDefault();
          this.history.redo();
        } else if (key === 'p') {
          e.preventDefault();
          window.print();
        } else if (key === 'b') {
          e.preventDefault();
          this.engine.exec('bold');
        } else if (key === 'i') {
          e.preventDefault();
          this.engine.exec('italic');
        } else if (key === 'u') {
          e.preventDefault();
          this.engine.exec('underline');
        } else if (key === 'f') {
          e.preventDefault();
          this.searchReplace.open(false);
        } else if (key === 'h') {
          e.preventDefault();
          this.searchReplace.open(true);
        } else if (key === 'k') {
          e.preventDefault();
          this.openModal('modal-link');
        } else if (e.key === 'Enter') {
          e.preventDefault();
          this.engine.insertPageBreak();
        }
      }

      // Raccourcis de navigation entre pages
      if (e.altKey && e.key === 'PageDown') {
        e.preventDefault();
        this.pagination.nextPage();
      } else if (e.altKey && e.key === 'PageUp') {
        e.preventDefault();
        this.pagination.prevPage();
      }
    });

    // Synchroniser le titre du document dans l'en-tête HTML et sur les en-têtes de pages
    this.docTitleInput.addEventListener('input', () => {
      document.title = `${this.fileManager.getDocumentTitle()} - Microsoft Word`;
      const infoTitle = document.getElementById('info-doc-title');
      if (infoTitle) infoTitle.textContent = this.fileManager.getDocumentTitle();
      this.pagination.updatePagination();
    });

    // Boutons de recherche dans le ruban
    document.getElementById('btn-open-search').addEventListener('click', () => this.searchReplace.open(false));
    document.getElementById('btn-open-replace').addEventListener('click', () => this.searchReplace.open(true));

    // Bascule règle graduée
    const toggleRuler = document.getElementById('toggle-ruler');
    if (toggleRuler) {
      toggleRuler.addEventListener('change', (e) => this.ruler.toggle(e.target.checked));
    }

    // Plein écran
    document.getElementById('btn-fullscreen').addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    });
  }

  initBackstageMenu() {
    const tabFileBtn = document.getElementById('tab-file-btn');
    const backstage = document.getElementById('backstage-overlay');
    const backBtn = document.getElementById('btn-backstage-back');

    tabFileBtn.addEventListener('click', () => {
      backstage.classList.add('active');
    });

    backBtn.addEventListener('click', () => {
      backstage.classList.remove('active');
    });

    // Navigation dans le backstage
    const menuItems = document.querySelectorAll('.backstage-menu-item[data-view]');
    menuItems.forEach((item) => {
      item.addEventListener('click', () => {
        menuItems.forEach((m) => m.classList.remove('active'));
        document.querySelectorAll('.backstage-view').forEach((v) => v.classList.remove('active'));

        item.classList.add('active');
        const viewId = item.dataset.view;
        const targetView = document.getElementById(viewId);
        if (targetView) targetView.classList.add('active');
      });
    });

    // Modèles prédéfinis
    document.getElementById('tmpl-blank').addEventListener('click', () => {
      this.editorElement.innerHTML = '<p><br></p>';
      this.docTitleInput.value = 'Nouveau Document - Word';
      this.history.pushState(true);
      backstage.classList.remove('active');
      this.toasts.show('Nouveau document vierge créé', 'info');
      this.pagination.updatePagination();
      this.spellCheck.scanEditor();
    });

    document.getElementById('tmpl-report').addEventListener('click', () => {
      this.editorElement.innerHTML = `
        <h1>RAPPORT D'ACTIVITÉ STRATÉGIQUE</h1>
        <p><strong>Date :</strong> 29 Septembre 2026 | <strong>Auteur :</strong> Direction Générale</p>
        <hr>
        <h2>1. Synthèse exécutive</h2>
        <p>Ce rapport présente les accomplissements majeurs et les résultats de performance obtenus au cours de la période écoulée.</p>
        <h2>2. Indicateurs clés de performance</h2>
        <table>
          <thead>
            <tr><th>Indicateur</th><th>Cible</th><th>Résultat Réalisé</th><th>Statut</th></tr>
          </thead>
          <tbody>
            <tr><td>Disponibilité système</td><td>99.9%</td><td>99.98%</td><td>Atteint</td></tr>
            <tr><td>Satisfaction utilisateurs</td><td>90%</td><td>95%</td><td>Dépassé</td></tr>
            <tr><td>Temps de réponse</td><td>&lt; 150ms</td><td>85ms</td><td>Excellent</td></tr>
          </tbody>
        </table>
        <h2>3. Conclusion et recommandations</h2>
        <blockquote>Poursuivre l'optimisation continue et le déploiement des fonctionnalités RIA de nouvelle génération.</blockquote>
      `;
      this.docTitleInput.value = "Rapport d'activité - Word";
      this.history.pushState(true);
      backstage.classList.remove('active');
      this.toasts.show('Modèle de rapport chargé', 'info');
      this.pagination.updatePagination();
      this.spellCheck.scanEditor();
    });

    document.getElementById('tmpl-letter').addEventListener('click', () => {
      this.editorElement.innerHTML = `
        <p style="text-align: right;">Paris, le 29 septembre 2026</p>
        <p><strong>Expéditeur :</strong><br>Jean Dupont<br>75008 Paris</p>
        <p style="margin-top: 20px;"><strong>Destinataire :</strong><br>Direction des Ressources Humaines</p>
        <p style="margin-top: 24px;"><strong>Objet : Candidature au poste de Développeur RIA Senior</strong></p>
        <p>Madame, Monsieur,</p>
        <p>Vivement intéressé par les perspectives de votre entreprise, je vous soumets ma candidature pour intégrer votre équipe de développement d'applications éditoriales de pointe.</p>
        <p>Fort d'une solide expertise en ingénierie logicielle web moderne, je maîtrise les architectures orientées objet et la conception d'interfaces haute fidélité conformes aux standards de l'industrie.</p>
        <p>Restant à votre entière disposition pour tout entretien, je vous prie d'agréer mes salutations distinguées.</p>
        <p style="margin-top: 30px;"><em>Jean Dupont</em></p>
      `;
      this.docTitleInput.value = 'Lettre formelle - Word';
      this.history.pushState(true);
      backstage.classList.remove('active');
      this.toasts.show('Modèle de lettre chargé', 'info');
      this.pagination.updatePagination();
      this.spellCheck.scanEditor();
    });

    document.getElementById('tmpl-meeting').addEventListener('click', () => {
      this.editorElement.innerHTML = `
        <h1>COMPTE-RENDU DE RÉUNION</h1>
        <p><strong>Projet :</strong> Déploiement Microsoft Word Clone | <strong>Date :</strong> 29 Septembre 2026</p>
        <h2>Ordre du jour</h2>
        <ul>
          <li>Validation de l'import et de l'export des fichiers .docx (Mammoth.js)</li>
          <li>Contrôle de l'ergonomie du Ruban Fluent et de la barre d'accès rapide</li>
          <li>Revue du moteur d'historique et de la persistance locale</li>
        </ul>
        <h2>Décisions & Plan d'actions</h2>
        <table>
          <thead><tr><th>Action</th><th>Responsable</th><th>Échéance</th></tr></thead>
          <tbody>
            <tr><td>Finaliser l'export natif</td><td>Équipe Core</td><td>Immédiat</td></tr>
            <tr><td>Recette utilisateur</td><td>QA Lead</td><td>Cette semaine</td></tr>
          </tbody>
        </table>
      `;
      this.docTitleInput.value = 'Compte-rendu - Word';
      this.history.pushState(true);
      backstage.classList.remove('active');
      this.toasts.show('Modèle de compte-rendu chargé', 'info');
      this.pagination.updatePagination();
      this.spellCheck.scanEditor();
    });

    // Actions d'export & d'import
    document.getElementById('btn-export-docx').addEventListener('click', () => this.fileManager.exportDocx());
    document.getElementById('btn-export-html').addEventListener('click', () => this.fileManager.exportHtml());
    document.getElementById('btn-export-json').addEventListener('click', () => this.fileManager.exportJson());
    document.getElementById('btn-export-txt').addEventListener('click', () => this.fileManager.exportTxt());

    document.getElementById('btn-force-save').addEventListener('click', () => {
      this.fileManager.saveToStorage();
      this.toasts.show('Enregistrement forcé effectué', 'success');
    });

    document.getElementById('btn-backstage-print').addEventListener('click', () => {
      backstage.classList.remove('active');
      window.print();
    });

    // Parcourir DOCX
    const hiddenDocxInput = document.getElementById('hidden-docx-input');
    const docxDropZone = document.getElementById('docx-drop-zone');
    const browseDocxBtn = document.getElementById('btn-browse-docx');

    browseDocxBtn.addEventListener('click', () => hiddenDocxInput.click());
    hiddenDocxInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        this.fileManager.importDocx(file);
        backstage.classList.remove('active');
      }
    });

    // Glisser-déposer sur la zone de drop DOCX
    docxDropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      docxDropZone.style.borderColor = '#185abd';
      docxDropZone.style.backgroundColor = '#f0f6ff';
    });

    docxDropZone.addEventListener('dragleave', () => {
      docxDropZone.style.borderColor = 'var(--border-strong)';
      docxDropZone.style.backgroundColor = 'var(--bg-paper)';
    });

    docxDropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      docxDropZone.style.borderColor = 'var(--border-strong)';
      docxDropZone.style.backgroundColor = 'var(--bg-paper)';
      const file = e.dataTransfer.files[0];
      if (file) {
        this.fileManager.importDocx(file);
        backstage.classList.remove('active');
      }
    });

    // Imports alternatifs HTML / JSON
    const hiddenHtmlInput = document.getElementById('hidden-html-input');
    const hiddenJsonInput = document.getElementById('hidden-json-input');

    document.getElementById('btn-browse-html').addEventListener('click', () => hiddenHtmlInput.click());
    hiddenHtmlInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          this.editorElement.innerHTML = ev.target.result;
          this.docTitleInput.value = `${file.name.replace(/\.[^/.]+$/, '')} - Word`;
          this.history.pushState(true);
          backstage.classList.remove('active');
          this.toasts.show('Fichier HTML importé', 'success');
          setTimeout(() => {
            this.pagination.updatePagination();
            this.spellCheck.scanEditor();
          }, 60);
        };
        reader.readAsText(file);
      }
    });

    document.getElementById('btn-browse-json').addEventListener('click', () => hiddenJsonInput.click());
    hiddenJsonInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          try {
            const data = JSON.parse(ev.target.result);
            if (data.htmlContent) {
              this.editorElement.innerHTML = data.htmlContent;
              if (data.title) this.docTitleInput.value = `${data.title} - Word`;
              this.history.pushState(true);
              backstage.classList.remove('active');
              this.toasts.show('Projet JSON restauré', 'success');
              setTimeout(() => {
                this.pagination.updatePagination();
                this.spellCheck.scanEditor();
              }, 60);
            }
          } catch {
            this.toasts.show('Fichier JSON invalide', 'error');
          }
        };
        reader.readAsText(file);
      }
    });
  }

  initModals() {
    // Boutons de fermeture
    document.querySelectorAll('[data-close]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const modalId = btn.dataset.close;
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.remove('active');
      });
    });

    // Modale Image
    document.getElementById('btn-insert-image').addEventListener('click', () => {
      this.openModal('modal-image');
    });

    document.getElementById('btn-confirm-insert-img').addEventListener('click', () => {
      const fileInput = document.getElementById('modal-img-file');
      const urlInput = document.getElementById('modal-img-url');

      if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.engine.insertImage(e.target.result);
          this.closeModal('modal-image');
          fileInput.value = '';
        };
        reader.readAsDataURL(fileInput.files[0]);
      } else if (urlInput.value.trim()) {
        this.engine.insertImage(urlInput.value.trim());
        this.closeModal('modal-image');
        urlInput.value = '';
      } else {
        this.toasts.show('Veuillez sélectionner un fichier ou saisir une URL', 'error');
      }
    });

    // Modale Lien
    document.getElementById('btn-insert-link').addEventListener('click', () => {
      const sel = window.getSelection();
      const selectedText = sel ? sel.toString() : '';
      const textInput = document.getElementById('modal-link-text');
      if (textInput) textInput.value = selectedText;
      this.openModal('modal-link');
    });

    document.getElementById('btn-confirm-insert-link').addEventListener('click', () => {
      const urlInput = document.getElementById('modal-link-url');
      const textInput = document.getElementById('modal-link-text');
      const url = urlInput.value.trim();
      const text = textInput.value.trim();

      if (url) {
        this.engine.insertLink(url, text);
        this.closeModal('modal-link');
        urlInput.value = '';
        textInput.value = '';
      } else {
        this.toasts.show('Veuillez spécifier une URL cible valide', 'error');
      }
    });

    // Modale Tableau Personnalisé
    document.getElementById('btn-custom-table-modal').addEventListener('click', () => {
      document.getElementById('table-grid-picker').classList.remove('show');
      this.openModal('modal-table');
    });

    document.getElementById('btn-confirm-insert-table').addEventListener('click', () => {
      const cols = parseInt(document.getElementById('modal-table-cols').value, 10) || 3;
      const rows = parseInt(document.getElementById('modal-table-rows').value, 10) || 3;
      const withHeader = document.getElementById('modal-table-header').checked;

      this.engine.insertTable(cols, rows, withHeader);
      this.closeModal('modal-table');
    });

    // Modale Raccourcis
    document.getElementById('btn-shortcuts').addEventListener('click', () => {
      this.openModal('modal-shortcuts');
    });
  }

  showStatsModal() {
    const stats = this.statusBar.getDetailedStats();
    const content = document.getElementById('modal-stats-content');
    if (content) {
      content.innerHTML = `
        <table style="width:100%; border-collapse: collapse; font-size:13px;">
          <tr style="border-bottom:1px solid var(--border-subtle);"><td style="padding:8px 0;">Pages estimées :</td><td style="text-align:right; font-weight:bold;">${stats.pages}</td></tr>
          <tr style="border-bottom:1px solid var(--border-subtle);"><td style="padding:8px 0;">Mots :</td><td style="text-align:right; font-weight:bold;">${stats.words}</td></tr>
          <tr style="border-bottom:1px solid var(--border-subtle);"><td style="padding:8px 0;">Caractères (sans espaces) :</td><td style="text-align:right; font-weight:bold;">${stats.charsNoSpaces}</td></tr>
          <tr style="border-bottom:1px solid var(--border-subtle);"><td style="padding:8px 0;">Caractères (avec espaces) :</td><td style="text-align:right; font-weight:bold;">${stats.charsWithSpaces}</td></tr>
          <tr><td style="padding:8px 0;">Paragraphes :</td><td style="text-align:right; font-weight:bold;">${stats.paragraphs}</td></tr>
        </table>
      `;
    }
    this.openModal('modal-stats');
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  }

  initThemeToggle() {
    const darkBtn = document.getElementById('btn-toggle-dark');
    const toggleWhiteSheet = document.getElementById('toggle-white-sheet');

    darkBtn.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      const isDark = document.body.classList.contains('dark-mode');
      this.toasts.show(isDark ? 'Mode sombre activé' : 'Mode classique activé', 'info', 2000);
    });

    if (toggleWhiteSheet) {
      toggleWhiteSheet.addEventListener('change', (e) => {
        document.body.classList.toggle('white-sheet-preserved', e.target.checked);
      });
    }
  }
}

// Initialisation au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
  window.wordApp = new WordApp();
});
