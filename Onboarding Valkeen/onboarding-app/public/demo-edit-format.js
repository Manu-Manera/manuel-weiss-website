/**
 * Textformatierung für Tempus-Demo-Editoren (alle tempus-demo*.html).
 * Nutzung: initFormatToolbar({ onChange: markUnsaved });
 */
(function (global) {
  'use strict';

  const ALIGN_ATTR = 'data-demo-align';
  const ALIGN_VALUES = ['left', 'center', 'right'];
  const NUM_POS_ATTR = 'data-demo-num-pos';
  const NUM_POS_VALUES = ['left', 'above-left', 'above-center', 'above-right'];
  const NUM_POS_DEFAULT = 'above-center';

  const BLOCK_SELECTOR = [
    'h1',
    'h2',
    'h3',
    'h4',
    'p',
    'ul',
    'ol',
    '.box-body',
    '.story-hook-body',
    '.click-path',
    '.hero-title',
    '.hero-subtitle',
    '.hero-eyebrow',
    '.hero-meta-item',
    '.scene-title',
    '.scene-act',
    '.scene-subtitle',
    '.demo-macro-free-block',
    '.agenda-verbal-block',
  ].join(',');

  let alignButtons = [];
  let numPosButtons = [];
  let numPosGroup = null;
  let onChangeCallback = () => {};

  function demoLang() {
    return document.documentElement.classList.contains('lang-de') ? 'de' : 'en';
  }

  function getAlignTarget() {
    const sel = window.getSelection();
    let node = null;

    if (sel && sel.rangeCount > 0) {
      const r = sel.getRangeAt(0);
      if (!r.collapsed || sel.anchorNode) {
        node = sel.anchorNode || r.commonAncestorContainer;
      } else {
        node = r.commonAncestorContainer;
      }
    }

    if (node && node.nodeType === 3) node = node.parentElement;
    if (!node && document.activeElement && document.activeElement !== document.body) {
      node = document.activeElement;
    }
    if (!node) return null;

    const inAgenda = node.closest('.agenda-fullpage-block');
    if (inAgenda) {
      const h4 = node.closest('h4');
      if (h4) return h4;
      const list = node.closest('ul,ol');
      if (list) return list;
    }

    const block = node.closest(BLOCK_SELECTOR);
    if (block) return block;

    const editable = node.closest('[contenteditable]');
    if (editable) {
      const parentBlock = editable.closest(BLOCK_SELECTOR);
      if (parentBlock) return parentBlock;
      if (editable.matches('h1,h2,h3,h4,p,ul,ol')) return editable;
    }

    return null;
  }

  function getAlign(el) {
    if (!el) return null;
    const v = el.getAttribute(ALIGN_ATTR);
    return ALIGN_VALUES.includes(v) ? v : null;
  }

  function setAlign(el, align) {
    if (!el) return;
    if (!align || !ALIGN_VALUES.includes(align)) {
      el.removeAttribute(ALIGN_ATTR);
    } else {
      el.setAttribute(ALIGN_ATTR, align);
    }
    updateToolbarState();
    onChangeCallback();
  }

  function getAgendaBlock() {
    const sel = window.getSelection();
    let node = null;

    if (sel && sel.rangeCount > 0) {
      node = sel.anchorNode || sel.getRangeAt(0).commonAncestorContainer;
    }
    if (node && node.nodeType === 3) node = node.parentElement;
    if (!node && document.activeElement && document.activeElement !== document.body) {
      node = document.activeElement;
    }
    if (!node) return null;
    return node.closest('.agenda-fullpage-block');
  }

  function getNumPos(block) {
    if (!block) return NUM_POS_DEFAULT;
    const v = block.getAttribute(NUM_POS_ATTR);
    return NUM_POS_VALUES.includes(v) ? v : NUM_POS_DEFAULT;
  }

  function setNumPos(block, pos) {
    if (!block) return;
    if (!pos || pos === NUM_POS_DEFAULT) {
      block.removeAttribute(NUM_POS_ATTR);
    } else if (NUM_POS_VALUES.includes(pos)) {
      block.setAttribute(NUM_POS_ATTR, pos);
    }
    updateToolbarState();
    onChangeCallback();
  }

  function highlightAgendaBlock(block) {
    document.querySelectorAll('.agenda-fullpage-block.agenda-num-pos-active').forEach((el) => {
      el.classList.remove('agenda-num-pos-active');
    });
    if (block) block.classList.add('agenda-num-pos-active');
  }

  function updateAlignButtons() {
    const target = getAlignTarget();
    const current = getAlign(target);
    alignButtons.forEach(({ btn, value }) => {
      btn.classList.toggle('active', current === value);
    });
  }

  function updateNumPosButtons() {
    const block = getAgendaBlock();
    const current = getNumPos(block);
    numPosButtons.forEach(({ btn, value }) => {
      btn.classList.toggle('active', current === value);
    });
    if (numPosGroup) {
      numPosGroup.classList.toggle('is-active', !!block);
    }
    highlightAgendaBlock(block);
  }

  function updateToolbarState() {
    updateAlignButtons();
    updateNumPosButtons();
  }

  function initFormatToolbar(options) {
    if (options && typeof options.onChange === 'function') {
      onChangeCallback = options.onChange;
    }

    const bar = document.getElementById('edit-format-bar');
    if (!bar || bar.dataset.wired) return;
    bar.dataset.wired = '1';
    bar.innerHTML = '';
    alignButtons = [];

    const L = demoLang();

    const addBtn = (label, title, fn) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'edit-fmt-btn';
      b.textContent = label;
      b.title = title;
      b.addEventListener('mousedown', (e) => {
        e.preventDefault();
      });
      b.addEventListener('click', () => {
        fn();
        onChangeCallback();
      });
      bar.appendChild(b);
      return b;
    };

    const sep = () => {
      const s = document.createElement('span');
      s.className = 'edit-fmt-sep';
      s.setAttribute('aria-hidden', 'true');
      bar.appendChild(s);
    };

    addBtn(
      'B',
      L === 'de' ? 'Fett (Strg+B)' : 'Bold (Ctrl+B)',
      () => {
        document.execCommand('bold');
      }
    );
    addBtn(
      'K',
      L === 'de' ? 'Kursiv (Strg+I)' : 'Italic (Ctrl+I)',
      () => {
        document.execCommand('italic');
      }
    );
    addBtn(
      'N',
      L === 'de' ? 'Normal — Formatierung der Auswahl entfernen' : 'Normal — clear formatting',
      () => {
        document.execCommand('removeFormat');
        try {
          document.execCommand('unlink');
        } catch (e) {
          /* ignore */
        }
        const sel = window.getSelection();
        if (sel && sel.rangeCount) {
          const c = sel.getRangeAt(0).commonAncestorContainer;
          const editable = c.nodeType === 3 ? c.parentElement : c;
          const root = editable ? editable.closest('[contenteditable]') || editable : null;
          if (root) {
            root.querySelectorAll('font').forEach((f) => {
              while (f.firstChild) f.parentNode.insertBefore(f.firstChild, f);
              f.remove();
            });
            root.querySelectorAll('[style]').forEach((el) => {
              el.style.removeProperty('font-size');
              if (!el.getAttribute('style')?.trim()) el.removeAttribute('style');
            });
          }
        }
      }
    );

    sep();

    addBtn(
      'A+',
      L === 'de' ? 'Schrift grösser' : 'Larger text',
      () => {
        try {
          if (document.queryCommandSupported && document.queryCommandSupported('increaseFontSize')) {
            document.execCommand('increaseFontSize');
          } else {
            document.execCommand('fontSize', false, '4');
          }
        } catch (e) {
          document.execCommand('fontSize', false, '4');
        }
      }
    );
    addBtn(
      'A−',
      L === 'de' ? 'Schrift kleiner' : 'Smaller text',
      () => {
        try {
          if (document.queryCommandSupported && document.queryCommandSupported('decreaseFontSize')) {
            document.execCommand('decreaseFontSize');
          } else {
            document.execCommand('fontSize', false, '2');
          }
        } catch (e) {
          document.execCommand('fontSize', false, '2');
        }
      }
    );

    sep();

    const alignGroup = document.createElement('div');
    alignGroup.className = 'edit-fmt-align-group';
    alignGroup.setAttribute('role', 'group');
    alignGroup.setAttribute(
      'aria-label',
      L === 'de' ? 'Textausrichtung' : 'Text alignment'
    );
    bar.appendChild(alignGroup);

    const alignDefs = [
      ['⬅', 'left', L === 'de' ? 'Linksbündig' : 'Align left'],
      ['═', 'center', L === 'de' ? 'Zentriert' : 'Align center'],
      ['➡', 'right', L === 'de' ? 'Rechtsbündig' : 'Align right'],
    ];

    alignDefs.forEach(([label, value, title]) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'edit-fmt-btn edit-fmt-align-btn';
      b.textContent = label;
      b.title = title;
      b.dataset.align = value;
      b.addEventListener('mousedown', (e) => {
        e.preventDefault();
      });
      b.addEventListener('click', () => {
        const target = getAlignTarget();
        if (!target) return;
        const cur = getAlign(target);
        setAlign(target, cur === value ? null : value);
      });
      alignGroup.appendChild(b);
      alignButtons.push({ btn: b, value });
    });

    sep();

    const numLabel = document.createElement('span');
    numLabel.className = 'edit-fmt-group-label';
    numLabel.textContent = L === 'de' ? 'Nr.' : 'No.';
    bar.appendChild(numLabel);

    numPosGroup = document.createElement('div');
    numPosGroup.className = 'edit-fmt-num-group';
    numPosGroup.setAttribute('role', 'group');
    numPosGroup.setAttribute(
      'aria-label',
      L === 'de' ? 'Position der Agenda-Nummer' : 'Agenda number position'
    );
    bar.appendChild(numPosGroup);

    const numDefs = [
      ['1←', 'left', L === 'de' ? 'Nummer links neben dem Text' : 'Number left beside text'],
      ['1↖', 'above-left', L === 'de' ? 'Nummer oben links' : 'Number above, left'],
      ['1↑', 'above-center', L === 'de' ? 'Nummer oben mittig' : 'Number above, center'],
      ['1↗', 'above-right', L === 'de' ? 'Nummer oben rechts' : 'Number above, right'],
    ];

    numDefs.forEach(([label, value, title]) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'edit-fmt-btn edit-fmt-num-btn';
      b.textContent = label;
      b.title = title;
      b.dataset.numPos = value;
      b.addEventListener('mousedown', (e) => {
        e.preventDefault();
      });
      b.addEventListener('click', () => {
        const block = getAgendaBlock();
        if (!block) return;
        const cur = getNumPos(block);
        setNumPos(block, cur === value ? NUM_POS_DEFAULT : value);
      });
      numPosGroup.appendChild(b);
      numPosButtons.push({ btn: b, value });
    });

    sep();

    const hint = document.createElement('div');
    hint.className = 'edit-fmt-hint';
    hint.textContent =
      L === 'de'
        ? 'Text: ⬅ ═ ➡ · Agenda-Kachel anklicken: Nr.-Position (1← 1↖ 1↑ 1↗).'
        : 'Text: ⬅ ═ ➡ · Click agenda card: number position (1← 1↖ 1↑ 1↗).';
    bar.appendChild(hint);

    document.addEventListener('selectionchange', () => {
      if (!document.body.classList.contains('edit-mode-active')) return;
      updateToolbarState();
    });
    document.addEventListener(
      'focusin',
      (e) => {
        if (!document.body.classList.contains('edit-mode-active')) return;
        if (e.target.closest('[contenteditable], .agenda-fullpage-block, .agenda-fullpage-num')) {
          updateToolbarState();
        }
      },
      true
    );
    document.addEventListener(
      'click',
      (e) => {
        if (!document.body.classList.contains('edit-mode-active')) return;
        if (e.target.closest('.agenda-fullpage-block, .agenda-fullpage-num')) {
          updateToolbarState();
        }
      },
      true
    );
  }

  function refreshDemoFormatToolbarLang() {
    const bar = document.getElementById('edit-format-bar');
    if (!bar || !bar.dataset.wired) return;
    const L = demoLang();
    const hint = bar.querySelector('.edit-fmt-hint');
    if (hint) {
      hint.textContent =
        L === 'de'
          ? 'Text: ⬅ ═ ➡ · Agenda-Kachel anklicken: Nr.-Position (1← 1↖ 1↑ 1↗).'
          : 'Text: ⬅ ═ ➡ · Click agenda card: number position (1← 1↖ 1↑ 1↗).';
    }
    const alignTitles = {
      left: L === 'de' ? 'Linksbündig' : 'Align left',
      center: L === 'de' ? 'Zentriert' : 'Align center',
      right: L === 'de' ? 'Rechtsbündig' : 'Align right',
    };
    bar.querySelectorAll('.edit-fmt-align-btn').forEach((btn) => {
      const v = btn.dataset.align;
      if (alignTitles[v]) btn.title = alignTitles[v];
    });
    const numTitles = {
      left: L === 'de' ? 'Nummer links neben dem Text' : 'Number left beside text',
      'above-left': L === 'de' ? 'Nummer oben links' : 'Number above, left',
      'above-center': L === 'de' ? 'Nummer oben mittig' : 'Number above, center',
      'above-right': L === 'de' ? 'Nummer oben rechts' : 'Number above, right',
    };
    bar.querySelectorAll('.edit-fmt-num-btn').forEach((btn) => {
      const v = btn.dataset.numPos;
      if (numTitles[v]) btn.title = numTitles[v];
    });
    const alignGrp = bar.querySelector('.edit-fmt-align-group');
    if (alignGrp) {
      alignGrp.setAttribute('aria-label', L === 'de' ? 'Textausrichtung' : 'Text alignment');
    }
    const numGrp = bar.querySelector('.edit-fmt-num-group');
    if (numGrp) {
      numGrp.setAttribute('aria-label', L === 'de' ? 'Position der Agenda-Nummer' : 'Agenda number position');
    }
    const numLbl = bar.querySelector('.edit-fmt-group-label');
    if (numLbl) numLbl.textContent = L === 'de' ? 'Nr.' : 'No.';
  }

  global.initFormatToolbar = initFormatToolbar;
  global.refreshDemoFormatToolbarLang = refreshDemoFormatToolbarLang;
})(typeof window !== 'undefined' ? window : globalThis);
