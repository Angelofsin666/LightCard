// ─── EDITOR VISIVO ────────────────────────────────────────────────────────────
class LightCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
  }

  setConfig(config) {
    this._config = { ...config };
    if (this._form) {
      this._form.data = this._buildFormData();
    }
    this._renderLights(); // aggiorna UI correttamente
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._built) this._build();
    if (this._form) this._form.hass = hass;
  }

  _buildFormData() {
    return {
      name: this._config.name || '',
      subtitle: this._config.subtitle || '',
      floor_id: this._config.floor_id || '',
      color: this._config.color || '#f59e0b',
    };
  }

  _build() {
    this._built = true;
    const root = this.shadowRoot;

    root.innerHTML = `
      <style>
        :host { display: block; }
        .editor-wrap { display: flex; flex-direction: column; gap: 20px; padding: 4px 0; }
        .section-title {
          font-size: 11px; font-weight: 700; color: #9ca3af;
          text-transform: uppercase; letter-spacing: 0.1em;
          border-bottom: 1px solid #f3f4f6; padding-bottom: 6px;
        }
        .lights-section { display: flex; flex-direction: column; gap: 10px; }
        .light-row {
          background: #f9fafb; border-radius: 12px; padding: 12px;
          border: 1px solid #e5e7eb; display: flex; flex-direction: column; gap: 10px;
        }
        .light-row-header {
          display: flex; align-items: center; justify-content: space-between;
        }
        .light-num {
          font-size: 11px; font-weight: 700; color: #9ca3af;
        }
        .btn-remove {
          width: 28px; height: 28px; border-radius: 8px;
          background: #fee2e2; border: none; cursor: pointer;
        }
        .btn-add {
          padding: 10px; border-radius: 12px;
          background: #eff6ff; border: 1.5px dashed #93c5fd;
          cursor: pointer;
        }
      </style>

      <div class="editor-wrap">
        <div class="section-title">Generale</div>
        <ha-form id="ha-form-main"></ha-form>

        <div class="section-title">Luci</div>
        <div class="lights-section" id="lights-list"></div>
        <button class="btn-add" id="btn-add-light">+ Aggiungi luce</button>
      </div>
    `;

    const form = root.getElementById('ha-form-main');
    form.hass = this._hass;
    form.schema = [
      { name: 'name', selector: { text: {} }, label: 'Nome card' },
      { name: 'subtitle', selector: { text: {} }, label: 'Sottotitolo' },
      { name: 'floor_id', selector: { floor: {} }, label: 'Piano' },
    ];
    form.data = this._buildFormData();
    form.computeLabel = s => s.label;

    form.addEventListener('value-changed', e => {
      e.stopPropagation();
      this._config = { ...this._config, ...e.detail.value };
      this._fireChanged();
    });

    this._form = form;

    // ADD LIGHT
    root.getElementById('btn-add-light').addEventListener('click', () => {
      const lights = [...(this._config.lights || []), {
        entity: '',
        name: '',
        icon: 'mdi:lightbulb'
      }];

      this._config = { ...this._config, lights };
      this._fireChanged();
      // ❌ NIENTE render manuale
    });

    this._renderLights();
  }

  _renderLights() {
    const list = this.shadowRoot.getElementById('lights-list');
    if (!list) return;

    const lights = this._config.lights || [];

    // ✅ rebuild completo = niente bug
    list.innerHTML = '';

    lights.forEach((light, i) => {
      const row = document.createElement('div');
      row.className = 'light-row';

      const header = document.createElement('div');
      header.className = 'light-row-header';

      const num = document.createElement('span');
      num.className = 'light-num';
      num.textContent = `Luce ${i + 1}`;

      const btnRemove = document.createElement('button');
      btnRemove.className = 'btn-remove';
      btnRemove.innerHTML = '✕';

      btnRemove.addEventListener('click', () => {
        const newLights = [...lights];
        newLights.splice(i, 1);
        this._config = { ...this._config, lights: newLights };
        this._fireChanged();
      });

      header.appendChild(num);
      header.appendChild(btnRemove);

      const rowForm = document.createElement('ha-form');
      rowForm.hass = this._hass;
      rowForm.schema = [
        { name: 'entity', selector: { entity: { domain: 'light' } }, label: 'Entità' },
        { name: 'name', selector: { text: {} }, label: 'Nome' },
        { name: 'icon', selector: { icon: {} }, label: 'Icona' },
      ];

      rowForm.data = {
        entity: light.entity || '',
        name: light.name || '',
        icon: light.icon || 'mdi:lightbulb',
      };

      rowForm.computeLabel = s => s.label;

      rowForm.addEventListener('value-changed', e => {
        e.stopPropagation();

        const newLights = [...(this._config.lights || [])];
        newLights[i] = { ...newLights[i], ...e.detail.value };

        this._config = { ...this._config, lights: newLights };
        this._fireChanged();
      });

      row.appendChild(header);
      row.appendChild(rowForm);
      list.appendChild(row);
    });
  }

  _fireChanged() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this._config },
      bubbles: true,
      composed: true,
    }));
  }
}

customElements.define('light-card-editor', LightCardEditor);
