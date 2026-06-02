import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../core/services/data.service';
import { ToastService } from '../../../core/services/toast.service';
import { RawMaterial } from '../../../core/models';

@Component({
  selector: 'app-admin-stock',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div>
    <div class="admin-page-title">ESTOQUE</div>
    <div class="admin-subtitle">Matérias-primas e insumos</div>

    <!-- KPIs -->
    <div class="stock-kpis">
      <div class="sk-card">
        <div class="sk-val">{{ totalItems() }}</div>
        <div class="sk-label">Total de itens</div>
      </div>
      <div class="sk-card" style="border-color:rgba(244,67,54,.2)">
        <div class="sk-val" style="color:#f44336">{{ criticalCount() }}</div>
        <div class="sk-label">Críticos / Zerados</div>
      </div>
      <div class="sk-card" style="border-color:rgba(255,184,0,.2)">
        <div class="sk-val" style="color:var(--gold)">{{ lowCount() }}</div>
        <div class="sk-label">Estoque baixo</div>
      </div>
      <div class="sk-card" style="border-color:rgba(0,200,83,.2)">
        <div class="sk-val" style="color:var(--green)">{{ okCount() }}</div>
        <div class="sk-label">Ok</div>
      </div>
    </div>

    <!-- Filter -->
    <div class="toolbar" style="margin-bottom:16px">
      <input class="search-input" [ngModel]="search()" (ngModelChange)="search.set($event)" placeholder="🔍 Buscar insumo...">
      <select class="search-input" [ngModel]="catFilter()" (ngModelChange)="catFilter.set($event)" style="flex:0 0 140px">
        <option value="">Todas categorias</option>
        <option *ngFor="let c of cats" [value]="c">{{ c }}</option>
      </select>
    </div>

    <!-- Table -->
    <div class="products-table-wrap">
      <table class="products-table">
        <thead>
          <tr>
            <th>Insumo</th>
            <th>Estoque</th>
            <th>Progresso</th>
            <th>Status</th>
            <th>Custo unit.</th>
            <th>Ação</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let m of filtered()">
            <td>
              <div class="pt-product-cell">
                <span style="font-size:20px">{{ m.emoji }}</span>
                <div>
                  <div class="pt-name">{{ m.name }}</div>
                  <div class="pt-desc">{{ m.supplier }}</div>
                </div>
              </div>
            </td>
            <td>
              <span class="pt-price">{{ m.qty }} {{ m.unit }}</span>
              <span style="font-size:11px;color:var(--muted);display:block">mín: {{ m.min }}</span>
            </td>
            <td style="min-width:100px">
              <div class="stock-bar-bg">
                <div class="stock-bar-fill"
                     [style.width.%]="data.mpPct(m)"
                     [style.background]="barColor(m)"></div>
              </div>
            </td>
            <td>
              <span class="status-pill"
                    [class.active]="data.mpStatus(m) === 'ok'"
                    [class.inactive]="data.mpStatus(m) === 'critical'"
                    [style.background]="data.mpStatus(m) === 'low' ? 'rgba(255,184,0,.1)' : ''"
                    [style.color]="data.mpStatus(m) === 'low' ? 'var(--gold)' : ''">
                {{ statusLabel(m) }}
              </span>
            </td>
            <td><span class="pt-time">R$ {{ m.cost.toFixed(2) }}</span></td>
            <td>
              <button class="icon-btn" (click)="replenish(m)" title="Repor estoque">+</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  `,
  styles: [`
    .stock-kpis { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:20px; }
    @media(max-width:700px){ .stock-kpis { grid-template-columns:repeat(2,1fr); } }
    .sk-card { background:var(--surface); border:1px solid var(--border); border-radius:var(--r2); padding:16px; text-align:center; }
    .sk-val { font-family:'Bebas Neue',cursive; font-size:36px; letter-spacing:1px; line-height:1; }
    .sk-label { font-size:11px; color:var(--muted); margin-top:4px; }
    .toolbar { display:flex; gap:12px; }
    .products-table-wrap { background:var(--surface); border:1px solid var(--border); border-radius:var(--r2); overflow:hidden; }
    .products-table { width:100%; border-collapse:collapse; }
    .products-table th { padding:12px 16px; text-align:left; font-size:11px; color:var(--muted); letter-spacing:1.5px; text-transform:uppercase; background:var(--surface2); border-bottom:1px solid var(--border); }
    .products-table td { padding:12px 16px; border-bottom:1px solid var(--border); font-size:13px; vertical-align:middle; }
    .products-table tr:last-child td { border-bottom:none; }
    .pt-product-cell { display:flex; align-items:center; gap:10px; }
    .pt-name { font-size:13px; font-weight:600; }
    .pt-desc { font-size:11px; color:var(--muted); margin-top:2px; }
    .pt-price { font-family:'DM Mono',monospace; color:var(--accent2); }
    .pt-time { color:var(--muted); font-family:'DM Mono',monospace; }
    .stock-bar-bg { height:6px; background:var(--border); border-radius:3px; overflow:hidden; }
    .stock-bar-fill { height:100%; border-radius:3px; transition:width .4s; }
  `]
})
export class AdminStockComponent {
  data  = inject(DataService);
  toast = inject(ToastService);
  search    = signal('');
  catFilter = signal('');
  cats = ['carnes','laticinios','vegetais','graos','condimentos','bebidas','embalagens'];

  totalItems  = () => this.data.rawMaterials().length;
  criticalCount = () => this.data.rawMaterials().filter(m => this.data.mpStatus(m) === 'critical').length;
  lowCount      = () => this.data.rawMaterials().filter(m => this.data.mpStatus(m) === 'low').length;
  okCount       = () => this.data.rawMaterials().filter(m => this.data.mpStatus(m) === 'ok').length;

  filtered = computed(() => {
    const t = this.search().toLowerCase();
    return this.data.rawMaterials().filter(m =>
      (!t || m.name.toLowerCase().includes(t)) &&
      (!this.catFilter() || m.cat === this.catFilter())
    );
  });

  barColor(m: RawMaterial) {
    const s = this.data.mpStatus(m);
    if (s === 'critical') return '#f44336';
    if (s === 'low') return 'var(--gold)';
    return 'var(--green)';
  }

  statusLabel(m: RawMaterial) {
    const s = this.data.mpStatus(m);
    if (s === 'critical') return m.qty === 0 ? '✕ Zerado' : '🚨 Crítico';
    if (s === 'low') return '⚠ Baixo';
    return '✓ Ok';
  }

  replenish(m: RawMaterial) {
    this.data.updateMP({ ...m, qty: m.min * 3 });
    this.toast.show(`📦 ${m.name} reposto!`, 'success');
  }
}
