class LightCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._debounce = null;
    this._dragIndex = null;
  }

  setConfig(config) {
    this._config = { ...config };
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
  }

  // ── debounce update ──
  _emitChange() {
    clearTimeout(this._debounce);
    this._debounce = setTimeout(() => {
      this.dispatchEvent(new CustomEvent('config-changed', {
        detail: { config: this._config },
        bubbles: true,
        composed: true,
      }));
    }, 150);
  }

  // ── auto nome ──
  _getEntityName(entity) {
    if (!entity || !this._hass) return '';
    return this._hass.states[entity]?.attributes?.friendly_name || entity;
  }

  _addLight() {
    const lights = [...(this._config.lights || [])];
    lights.push({ entity: '', name: '', icon: 'mdi:lightbulb' });

    this._config.lights = lights;
    this._emitChange();
    this._render();
  }

  _removeLight(i) {
    const lights = [...this._config.lights];
    lights.splice(i, 1);
    this._config.lights = lights;
    this._emitChange();
    this._render();
  }

  _updateLight(i, key, value) {
    const lights = [...this._config.lights];

    // auto nome se vuoto
    if (key === 'entity' && !lights[i].name) {
      lights[i].name = this._getEntityName(value);
    }

    lights[i] = { ...lights[i], [key]: value };
    this._config.lights = lights;

    this._emitChange();
  }

  // ── drag & drop ──
  _onDragStart(e, i) {
    this._dragIndex = i;
    e.dataTransfer.effectAllowed = 'move';
  }

  _onDrop(e, i) {
    e.preventDefault();
    const lights = [...this._config.lights];
    const item = lights.splice(this._dragIndex, 1)[0];
    lights.splice(i, 0, item);

    this._config.lights = lights;
    this._emitChange();
    this._render();
  }

  _render() {
    const root = this.shadowRoot;
    const lights = this._config.lights || [];

    root.innerHTML = `
      <style>
        .wrap { display:flex; flex-direction:column; gap:12px; }
        .row {
          padding:10px;
          border-radius:12px;
          background:#f9fafb;
          border:1px solid #e5e7eb;
          display:flex;
          flex-direction:column;
          gap:8px;
          cursor:grab;
        }
        .row:active { cursor:grabbing; }
        .header {
          display:flex;
          justify-content:space-between;
          align-items:center;
          font-size:12px;
          color:#6b7280;
        }
        button {
          border:none;
          background:#fee2e2;
          border-radius:8px;
          cursor:pointer;
          padding:4px 8px;
        }
        .add {
          padding:10px;
          border-radius:12px;
          background:#eff6ff;
          border:1px dashed #93c5fd;
          cursor:pointer;
        }
      </style>

      <div class="wrap">
        ${lights.map((l,i)=>`
          <div class="row"
            draggable="true"
            data-index="${i}">
            
            <div class="header">
              <span>Luce ${i+1}</span>
              <button data-remove="${i}">✕</button>
            </div>

            <ha-selector
              .hass=${this._hass}
              .selector=${{ entity: { domain: 'light' }}}
              .value="${l.entity || ''}"
              data-key="entity"
              data-index="${i}">
            </ha-selector>

            <ha-selector
              .hass=${this._hass}
              .selector=${{ text: {} }}
              .value="${l.name || ''}"
              data-key="name"
              data-index="${i}">
            </ha-selector>

            <ha-selector
              .hass=${this._hass}
              .selector=${{ icon: {} }}
              .value="${l.icon || 'mdi:lightbulb'}"
              data-key="icon"
              data-index="${i}">
            </ha-selector>
          </div>
        `).join('')}

        <div class="add" id="add">+ Aggiungi luce</div>
      </div>
    `;

    // eventi
    root.querySelectorAll('ha-selector').forEach(el => {
      el.addEventListener('value-changed', e => {
        const i = Number(el.dataset.index);
        const key = el.dataset.key;
        this._updateLight(i, key, e.detail.value);
      });
    });

    root.querySelectorAll('[data-remove]').forEach(btn => {
      btn.onclick = () => this._removeLight(Number(btn.dataset.remove));
    });

    root.getElementById('add').onclick = () => this._addLight();

    // drag events
    root.querySelectorAll('.row').forEach(row => {
      const i = Number(row.dataset.index);

      row.ondragstart = e => this._onDragStart(e, i);
      row.ondragover = e => e.preventDefault();
      row.ondrop = e => this._onDrop(e, i);
    });
  }
}

customElements.define('light-card-editor', LightCardEditor);
