/**
 * Light Card — Custom card per Home Assistant
 * Versione: 1.0.0
 * Compatibile con HACS
 */

// ─── EDITOR VISIVO ────────────────────────────────────────────────────────────
class LightCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
  }

  setConfig(config) {
    this._config = { ...config };
    this._refresh();
  }

  set hass(hass) {
    this._hass = hass;
    this._refresh();
  }

  _refresh() {
    if (!this._hass || !this._config) return;
    const c = this._config;
    const root = this.shadowRoot;

    // Se _renderLights è in corso (selettore aperto), aggiorna solo i valori
    // senza toccare il DOM della lista luci
    if (this._updatingLight) {
      this._updateLightValues();
      return;
    }

    if (!root.querySelector('.form')) {
      root.innerHTML = `
        <style>
          :host { display: block; }
          .form { display: flex; flex-direction: column; gap: 20px; padding: 4px 0; }
          .section-title {
            font-size: 11px; font-weight: 700; color: #9ca3af;
            text-transform: uppercase; letter-spacing: 0.1em;
            border-bottom: 1px solid #f3f4f6; padding-bottom: 6px;
          }
          ha-selector { display: block; }
          .color-wrap { display: flex; flex-direction: column; gap: 8px; }
          .color-label { font-size: 12px; font-weight: 600; color: #374151; }
          .color-row { display: flex; align-items: center; gap: 12px; }
          input[type=color] {
            width: 44px; height: 44px; border-radius: 12px;
            border: 2px solid #e5e7eb; cursor: pointer; padding: 2px; background: none;
          }
          .color-hint { font-size: 12px; color: #9ca3af; }
          .lights-section { display: flex; flex-direction: column; gap: 12px; }
          .light-row {
            display: flex; align-items: center; gap: 8px;
            background: #f9fafb; border-radius: 12px; padding: 10px;
            border: 1px solid #e5e7eb;
          }
          .light-row ha-selector { flex: 1; }
          .light-row-inputs { display: flex; flex-direction: column; gap: 8px; flex: 1; }
          .btn-remove {
            width: 32px; height: 32px; border-radius: 8px;
            background: #fee2e2; border: none; cursor: pointer;
            color: #ef4444; font-size: 16px; display: flex;
            align-items: center; justify-content: center; flex-shrink: 0;
            transition: background 0.2s;
          }
          .btn-remove:hover { background: #fecaca; }
          .btn-add {
            display: flex; align-items: center; justify-content: center; gap: 6px;
            padding: 10px; border-radius: 12px;
            background: #eff6ff; border: 1.5px dashed #93c5fd;
            color: #3b82f6; font-size: 13px; font-weight: 600;
            cursor: pointer; transition: background 0.2s;
            font-family: inherit;
          }
          .btn-add:hover { background: #dbeafe; }
          .light-num {
            font-size: 11px; font-weight: 700; color: #9ca3af;
            width: 20px; flex-shrink: 0; text-align: center;
          }
        </style>
        <div class="form">
          <div class="section-title">Generale</div>
          <ha-selector id="sel-name"></ha-selector>
          <ha-selector id="sel-subtitle"></ha-selector>
          <ha-selector id="sel-floor"></ha-selector>

          <div class="section-title">Aspetto</div>
          <div class="color-wrap">
            <span class="color-label">Colore tema</span>
            <div class="color-row">
              <input type="color" id="color-input">
              <span class="color-hint">Colore luci accese, badge e icone</span>
            </div>
          </div>

          <div class="section-title">Luci</div>
          <div class="lights-section" id="lights-list"></div>
          <button class="btn-add" id="btn-add-light">+ Aggiungi luce</button>
        </div>
      `;

      // Selettori statici
      this._setupSelector('sel-name',     { text: {} },   'Nome card', 'name');
      this._setupSelector('sel-subtitle', { text: {} },   'Sottotitolo (es. Luci esterne)', 'subtitle');
      this._setupSelector('sel-floor',    { floor: {} },  'Piano / Area per toggle globale', 'floor_id');

      root.getElementById('color-input').addEventListener('input', e => {
        this._changed('color', e.target.value);
      });

      root.getElementById('btn-add-light').addEventListener('click', () => {
        const lights = [...(this._config.lights || []), { entity: '', name: '', icon: 'mdi:lightbulb' }];
        this._changed('lights', lights);
      });
    }

    // Aggiorna selettori statici
    this._updateSelector('sel-name',     { text: {} },  'Nome card',                          c.name     || '');
    this._updateSelector('sel-subtitle', { text: {} },  'Sottotitolo (es. Luci esterne)',     c.subtitle || '');
    this._updateSelector('sel-floor',    { floor: {} }, 'Piano / Area per toggle globale',    c.floor_id || '');

    const colorInput = root.getElementById('color-input');
    if (colorInput && document.activeElement !== colorInput) {
      colorInput.value = c.color || '#f59e0b';
    }

    // Salva scroll prima di ricostruire la lista
    const dialog = this.closest('ha-dialog, mwc-dialog, .mdc-dialog__content, hui-dialog-edit-card');
    const scrollEl = dialog ? dialog.querySelector('.content, .mdc-dialog__content') || dialog : null;
    const scrollTop = scrollEl ? scrollEl.scrollTop : 0;

    this._renderLights();

    // Ripristina scroll dopo il render
    if (scrollEl) requestAnimationFrame(() => { scrollEl.scrollTop = scrollTop; });
  }

  // Aggiorna solo hass e valori dei selettori già esistenti, senza ricostruire il DOM
  _updateLightValues() {
    const root = this.shadowRoot;
    const lights = this._config.lights || [];
    const rows = root.querySelectorAll('.light-row');
    rows.forEach((row, i) => {
      if (!lights[i]) return;
      const sels = row.querySelectorAll('ha-selector');
      if (sels[0]) { sels[0].hass = this._hass; sels[0].value = lights[i].entity || ''; }
      if (sels[1]) { sels[1].hass = this._hass; sels[1].value = lights[i].name   || ''; }
      if (sels[2]) { sels[2].hass = this._hass; sels[2].value = lights[i].icon   || 'mdi:lightbulb'; }
    });
  }

  _setupSelector(id, selector, label, key) {
    const el = this.shadowRoot.getElementById(id);
    if (!el) return;
    el.addEventListener('value-changed', e => {
      e.stopPropagation();
      this._changed(key, e.detail.value);
    });
  }

  _updateSelector(id, selector, label, value) {
    const el = this.shadowRoot.getElementById(id);
    if (!el) return;
    el.hass     = this._hass;
    el.selector = selector;
    el.label    = label;
    el.value    = value;
  }

  _renderLights() {
    const list = this.shadowRoot.getElementById('lights-list');
    if (!list) return;
    list.innerHTML = '';
    const lights = this._config.lights || [];

    lights.forEach((light, i) => {
      const row = document.createElement('div');
      row.className = 'light-row';

      const num = document.createElement('span');
      num.className = 'light-num';
      num.textContent = i + 1;

      const inputs = document.createElement('div');
      inputs.className = 'light-row-inputs';

      // Entity picker
      const selEntity = document.createElement('ha-selector');
      selEntity.hass     = this._hass;
      selEntity.selector = { entity: { domain: 'light' } };
      selEntity.label    = 'Entità luce';
      selEntity.value    = light.entity || '';
      selEntity.addEventListener('value-changed', e => {
        e.stopPropagation();
        this._updateLight(i, 'entity', e.detail.value);
      });

      // Nome
      const selName = document.createElement('ha-selector');
      selName.hass     = this._hass;
      selName.selector = { text: {} };
      selName.label    = 'Nome pulsante';
      selName.value    = light.name || '';
      selName.addEventListener('value-changed', e => {
        e.stopPropagation();
        this._updateLight(i, 'name', e.detail.value);
      });

      // Icona
      const selIcon = document.createElement('ha-selector');
      selIcon.hass     = this._hass;
      selIcon.selector = { icon: {} };
      selIcon.label    = 'Icona';
      selIcon.value    = light.icon || 'mdi:lightbulb';
      selIcon.addEventListener('value-changed', e => {
        e.stopPropagation();
        this._updateLight(i, 'icon', e.detail.value);
      });

      inputs.appendChild(selEntity);
      inputs.appendChild(selName);
      inputs.appendChild(selIcon);

      // Rimuovi
      const btnRemove = document.createElement('button');
      btnRemove.className = 'btn-remove';
      btnRemove.innerHTML = '✕';
      btnRemove.addEventListener('click', () => {
        const newLights = [...(this._config.lights || [])];
        newLights.splice(i, 1);
        this._changed('lights', newLights);
      });

      row.appendChild(num);
      row.appendChild(inputs);
      row.appendChild(btnRemove);
      list.appendChild(row);
    });
  }

  _updateLight(index, key, value) {
    this._updatingLight = true;
    const lights = [...(this._config.lights || [])];
    lights[index] = { ...lights[index], [key]: value };
    this._changed('lights', lights);
    // Reset flag dopo un tick, quando il selettore ha finito
    setTimeout(() => { this._updatingLight = false; }, 100);
  }

  _changed(key, value) {
    if (!this._config) return;
    this._config = { ...this._config, [key]: value };
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this._config },
      bubbles: true, composed: true,
    }));
  }
}

customElements.define('light-card-editor', LightCardEditor);


// ─── CARD PRINCIPALE ──────────────────────────────────────────────────────────
class LightCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
  }

  static getConfigElement() {
    return document.createElement('light-card-editor');
  }

  static getStubConfig() {
    return {
      name: 'Esterni',
      subtitle: 'Luci esterne',
      floor_id: '',
      color: '#f59e0b',
      lights: [
        { entity: '', name: 'Luce 1', icon: 'mdi:lightbulb' },
      ],
    };
  }

  setConfig(config) {
    this._config = config;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._updateState();
  }

  // ── Helpers colore ──
  _hexToRgb(hex) {
    const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return r ? `${parseInt(r[1],16)},${parseInt(r[2],16)},${parseInt(r[3],16)}` : '245,158,11';
  }
  _lighten(hex, amt = 0.85) {
    const parts = (hex.replace('#','').match(/.{2}/g)||[]);
    const [r,g,b] = parts.map(x => parseInt(x,16));
    const mix = v => Math.round(v + (255 - v) * amt);
    return `#${[mix(r),mix(g),mix(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}`;
  }

  // ── SVG lampadina ──
  _buildBulbSvg(isOn, onCount, total, accent, light) {
    const bulbFill     = isOn ? '#fde68a' : '#bfdbfe';
    const bulbStroke   = isOn ? '#fbbf24' : '#93c5fd';
    const glowFill     = isOn ? '#fef08a' : '#dbeafe';
    const filament     = isOn ? accent    : '#93c5fd';
    const base1        = isOn ? '#fbbf24' : '#93c5fd';
    const base2        = isOn ? accent    : '#60a5fa';
    const base3        = isOn ? '#d97706' : '#3b82f6';

    const glow = isOn
      ? `<animate attributeName="opacity" values="0.4;0.8;0.4" dur="2s" repeatCount="indefinite"/>`
      : '';
    const rays = isOn
      ? `<line x1="22" y1="4" x2="22" y2="1" stroke="#fbbf24" stroke-width="1.5" stroke-linecap="round"><animate attributeName="opacity" values="0.4;1;0.4" dur="1.8s" repeatCount="indefinite"/></line>`
      + `<line x1="32" y1="6" x2="34" y2="4" stroke="#fbbf24" stroke-width="1.5" stroke-linecap="round"><animate attributeName="opacity" values="0.3;1;0.3" dur="2.1s" repeatCount="indefinite"/></line>`
      + `<line x1="12" y1="6" x2="10" y2="4" stroke="#fbbf24" stroke-width="1.5" stroke-linecap="round"><animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite"/></line>`
      : '';

    return `<svg width="44" height="60" viewBox="0 0 44 60" fill="none" style="flex-shrink:0;margin-right:4px">
      ${rays}
      <path d="M8 22 C8 14 14 8 22 8 C30 8 36 14 36 22 C36 29 32 33 30 37 L14 37 C12 33 8 29 8 22Z"
        fill="${bulbFill}" stroke="${bulbStroke}" stroke-width="1.5"/>
      <ellipse cx="22" cy="21" rx="8" ry="7" fill="${glowFill}" opacity="0.6">${glow}</ellipse>
      <path d="M17 28 Q20 24 22 27 Q24 30 27 26" stroke="${filament}" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.8"/>
      <rect x="14" y="37" width="16" height="3" rx="1.5" fill="${base1}"/>
      <rect x="15" y="40" width="14" height="3" rx="1.5" fill="${base2}"/>
      <rect x="16" y="43" width="12" height="3" rx="1.5" fill="${base3}"/>
    </svg>`;
  }

  _render() {
    const c      = this._config;
    const accent = c.color || '#f59e0b';
    const light  = this._lighten(accent);
    const rgb    = this._hexToRgb(accent);
    const lights = c.lights || [];

    // Calcola colonne bottoni (2 per riga)
    const buttonRows = [];
    for (let i = 0; i < lights.length; i += 2) {
      buttonRows.push(lights.slice(i, i + 2));
    }

    const buttonsHTML = buttonRows.map(row => `
      <div class="btn-row">
        ${row.map(l => `
          <div class="light-btn ${l.entity ? '' : 'disabled'}"
               data-entity="${l.entity || ''}"
               id="btn-${(l.entity || '').replace(/\./g,'-')}">
            <ha-icon icon="${l.icon || 'mdi:lightbulb'}"></ha-icon>
            <span>${l.name || l.entity || '—'}</span>
          </div>
        `).join('')}
        ${row.length === 1 ? '<div class="light-btn-placeholder"></div>' : ''}
      </div>
    `).join('');

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        ha-card {
          border-radius: 28px;
          background: #ffffff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06), 0 12px 40px rgba(0,0,0,0.08);
          padding: 4px 4px 8px;
          font-family: var(--primary-font-family, sans-serif);
        }

        /* ── Header ── */
        .header {
          display: flex; align-items: center; gap: 12px;
          padding: 14px 16px 10px; cursor: pointer;
        }
        .header:hover .icon-wrap { filter: brightness(0.95); }
        .icon-wrap {
          width: 42px; height: 42px; border-radius: 13px;
          background: ${light};
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          transition: filter 0.2s;
        }
        .icon-wrap ha-icon { --mdc-icon-size: 22px; color: ${accent}; }
        .header-text { flex: 1; min-width: 0; }
        .card-name { font-size: 18px; font-weight: 600; color: #111827; }
        .card-subtitle { font-size: 12px; color: ${accent}; font-weight: 500; margin-top: 2px; }

        /* ── Pannello visivo ── */
        .visual-panel {
          background: ${light};
          border-radius: 20px; margin: 0 4px; padding: 14px 16px;
          display: flex; align-items: center; gap: 8px;
        }
        .count-block { flex: 1; }
        .count-number {
          font-size: 48px; font-weight: 300; color: ${accent};
          line-height: 1; letter-spacing: -2px;
        }
        .count-number .count-total {
          font-size: 18px; font-weight: 400; letter-spacing: 0;
        }
        .count-label { font-size: 11px; color: #7b8094; margin-top: 4px; }
        .status-badge {
          display: inline-flex; align-items: center; margin-top: 8px;
          padding: 4px 12px; border-radius: 12px;
          background: rgba(${rgb},0.15); color: ${accent};
          font-size: 11px; font-weight: 700;
        }

        /* ── Bottoni luci ── */
        .buttons-wrap { padding: 8px 4px 4px; display: flex; flex-direction: column; gap: 6px; }
        .btn-row { display: flex; gap: 6px; }
        .light-btn {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 5px;
          padding: 12px 4px; border-radius: 14px;
          border: 1.5px solid #dbeafe;
          background: #eff6ff; color: #60a5fa;
          cursor: pointer; font-size: 10px; font-weight: 600;
          transition: all 0.18s cubic-bezier(.4,0,.2,1);
          user-select: none;
        }
        .light-btn ha-icon { --mdc-icon-size: 20px; color: #93c5fd; transition: color 0.18s; }
        .light-btn.on {
          background: ${light}; color: ${accent};
          border-color: rgba(${rgb},0.35);
        }
        .light-btn.on ha-icon { color: ${accent}; }
        .light-btn:hover:not(.disabled) {
          transform: scale(1.03);
          box-shadow: 0 3px 12px rgba(${rgb},0.25);
        }
        .light-btn.disabled { opacity: 0.35; cursor: default; }
        .light-btn-placeholder { flex: 1; }
      </style>

      <ha-card>
        <div class="header" id="header-toggle">
          <div class="icon-wrap">
            <ha-icon icon="mdi:outdoor-lamp"></ha-icon>
          </div>
          <div class="header-text">
            <div class="card-name">${c.name || 'Esterni'}</div>
            <div class="card-subtitle">${c.subtitle || 'Luci esterne'}</div>
          </div>
        </div>

        <div class="visual-panel">
          <div id="bulb-svg"></div>
          <div class="count-block">
            <div class="count-number" id="count-number">
              0<span class="count-total">/${lights.length}</span>
            </div>
            <div class="count-label">luci accese</div>
            <div class="status-badge" id="status-badge">🌙 Spento</div>
          </div>
        </div>

        <div class="buttons-wrap">
          ${buttonsHTML}
        </div>
      </ha-card>
    `;

    this._bindEvents();
  }

  _bindEvents() {
    const root = this.shadowRoot;

    // Toggle globale header
    root.getElementById('header-toggle')?.addEventListener('click', () => {
      if (!this._hass || !this._config.floor_id) return;
      this._hass.callService('light', 'toggle', {}, { floor_id: this._config.floor_id });
    });

    // Bottoni singole luci
    root.querySelectorAll('.light-btn:not(.disabled)').forEach(btn => {
      btn.addEventListener('click', () => {
        const entityId = btn.dataset.entity;
        if (!entityId || !this._hass) return;
        this._hass.callService('light', 'toggle', { entity_id: entityId });
      });
    });
  }

  _updateState() {
    if (!this._hass || !this._config) return;
    const root = this.shadowRoot;
    if (!root.getElementById('count-number')) return;

    const accent = this._config.color || '#f59e0b';
    const light  = this._lighten(accent);
    const lights = this._config.lights || [];

    const states   = lights.map(l => this._hass.states[l.entity]);
    const onCount  = states.filter(s => s?.state === 'on').length;
    const total    = lights.length;
    const isOn     = onCount > 0;
    const allOn    = onCount === total && total > 0;

    // Contatore
    const countEl = root.getElementById('count-number');
    if (countEl) countEl.innerHTML = `${onCount}<span class="count-total">/${total}</span>`;

    // Badge
    const badgeEl = root.getElementById('status-badge');
    if (badgeEl) {
      badgeEl.textContent = allOn ? '🌟 Tutto acceso' : onCount === 0 ? '🌙 Spento' : '✨ Parziale';
    }

    // SVG lampadina
    const bulbEl = root.getElementById('bulb-svg');
    if (bulbEl) bulbEl.innerHTML = this._buildBulbSvg(isOn, onCount, total, accent, light);

    // Stato bottoni
    lights.forEach(l => {
      if (!l.entity) return;
      const btnId = 'btn-' + l.entity.replace(/\./g, '-');
      const btn   = root.getElementById(btnId);
      if (!btn) return;
      const state = this._hass.states[l.entity];
      btn.classList.toggle('on', state?.state === 'on');
    });
  }

  getCardSize() { return 4; }
}

customElements.define('light-card', LightCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'light-card',
  name: 'Light Card',
  description: 'Card per il controllo delle luci esterne con lampadina SVG animata, contatore e toggle globale per piano/area.',
  preview: true,
  documentationURL: 'https://github.com/Angelofsin666/light-card',
});
