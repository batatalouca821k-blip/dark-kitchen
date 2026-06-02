import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../core/services/data.service';
import { ToastService } from '../../../core/services/toast.service';
import { MarketProduct } from '../../../core/models';

@Component({
  selector: 'app-admin-market',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div>
    <div class="admin-page-title">MARKETPLACE</div>
    <div class="admin-subtitle">Compre insumos dos fornecedores</div>

    <!-- Cart summary -->
    <div class="mkt-cart-bar" *ngIf="cartCount() > 0">
      <span>🛒 {{ cartCount() }} ite{{ cartCount() === 1 ? 'm' : 'ns' }} no carrinho</span>
      <span class="mkt-cart-total">{{ data.formatPriceR(cartTotal()) }}</span>
      <button class="btn-primary" style="padding:8px 18px;font-size:13px" (click)="checkout()">Encomendar</button>
    </div>

    <!-- Search/filter -->
    <div class="toolbar" style="margin-bottom:16px">
      <input class="search-input" [ngModel]="search()" (ngModelChange)="search.set($event)" placeholder="🔍 Buscar produto...">
      <select class="search-input" [ngModel]="catFilter()" (ngModelChange)="catFilter.set($event)" style="flex:0 0 150px">
        <option value="">Todas categorias</option>
        <option *ngFor="let c of cats" [value]="c">{{ c }}</option>
      </select>
    </div>

    <!-- Products grid -->
    <div class="mkt-grid">
      <div class="mkt-card" *ngFor="let p of filtered()">
        <div class="mkt-tag" *ngIf="p.tag === 'offer'" style="background:rgba(255,69,0,.15);color:var(--accent)">🔥 OFERTA</div>
        <div class="mkt-tag" *ngIf="p.tag === 'low'"   style="background:rgba(244,67,54,.1);color:#f44336">⚠ ESTOQUE BAIXO</div>
        <div class="mkt-tag" *ngIf="p.tag === 'new'"   style="background:rgba(0,200,83,.1);color:var(--green)">🆕 NOVO</div>
        <div class="mkt-emoji">{{ p.emoji }}</div>
        <div class="mkt-name">{{ p.name }}</div>
        <div class="mkt-brand">{{ p.brand }}</div>
        <div class="mkt-price">R$ {{ p.price.toFixed(2).replace('.', ',') }}<span class="mkt-unit"> /{{ p.unit }}</span></div>
        <div class="mkt-qty-row">
          <button class="mkt-qty-btn" (click)="changeQty(p, -1)">−</button>
          <span class="mkt-qty-num">{{ getQty(p) }}</span>
          <button class="mkt-qty-btn" (click)="changeQty(p, 1)">+</button>
        </div>
        <button class="mkt-add-btn" (click)="addToCart(p)">
          {{ getQty(p) > 0 ? 'Atualizar' : 'Adicionar' }}
        </button>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .mkt-cart-bar { display:flex; align-items:center; gap:16px; background:var(--surface2); border:1px solid var(--border); border-radius:var(--r2); padding:14px 18px; margin-bottom:16px; }
    .mkt-cart-bar span:first-child { flex:1; font-size:14px; font-weight:600; }
    .mkt-cart-total { font-family:'DM Mono',monospace; color:var(--accent2); font-size:16px; font-weight:600; }
    .toolbar { display:flex; gap:12px; }
    .mkt-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(160px,1fr)); gap:12px; }
    .mkt-card { background:var(--surface); border:1px solid var(--border); border-radius:var(--r2); padding:14px; display:flex; flex-direction:column; align-items:center; text-align:center; gap:6px; position:relative; overflow:hidden; transition:all .2s; }
    .mkt-card:hover { border-color:rgba(255,69,0,.25); transform:translateY(-2px); }
    .mkt-tag { position:absolute; top:8px; left:8px; font-size:9px; font-weight:700; padding:2px 8px; border-radius:50px; letter-spacing:.3px; }
    .mkt-emoji { font-size:32px; margin:8px 0 4px; }
    .mkt-name { font-size:13px; font-weight:600; line-height:1.3; }
    .mkt-brand { font-size:11px; color:var(--muted); }
    .mkt-price { font-family:'DM Mono',monospace; font-size:15px; color:var(--accent2); font-weight:500; margin-top:4px; }
    .mkt-unit { font-size:11px; color:var(--muted); }
    .mkt-qty-row { display:flex; align-items:center; gap:10px; }
    .mkt-qty-btn { width:28px; height:28px; border-radius:8px; border:1px solid var(--border); background:var(--surface2); color:var(--text); font-size:16px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .15s; }
    .mkt-qty-btn:hover { border-color:var(--accent); color:var(--accent); }
    .mkt-qty-num { font-family:'DM Mono',monospace; font-size:15px; min-width:20px; text-align:center; }
    .mkt-add-btn { width:100%; padding:8px; border-radius:var(--r); border:none; background:rgba(255,69,0,.1); color:var(--accent); font-family:'DM Sans',sans-serif; font-size:12px; font-weight:700; cursor:pointer; transition:all .2s; margin-top:4px; }
    .mkt-add-btn:hover { background:var(--accent); color:white; }
  `]
})
export class AdminMarketComponent {
  data  = inject(DataService);
  toast = inject(ToastService);
  search    = signal('');
  catFilter = signal('');
  cats = ['carnes','laticinios','vegetais','graos','bebidas','embalagens'];

  cart = signal<Record<number, number>>({});

  filtered = computed(() => {
    const t = this.search().toLowerCase();
    return this.data.marketProducts().filter(p =>
      (!t || p.name.toLowerCase().includes(t) || p.brand.toLowerCase().includes(t)) &&
      (!this.catFilter() || p.cat === this.catFilter())
    );
  });

  getQty(p: MarketProduct) { return this.cart()[p.id] ?? 1; }

  changeQty(p: MarketProduct, d: number) {
    const cur = this.getQty(p);
    this.cart.update(c => ({ ...c, [p.id]: Math.max(1, cur + d) }));
  }

  addToCart(p: MarketProduct) {
    this.cart.update(c => ({ ...c, [p.id]: this.getQty(p) }));
    this.toast.show(`✅ ${p.name} adicionado ao carrinho!`, 'success');
  }

  cartCount = computed(() => Object.keys(this.cart()).length);
  cartTotal = computed(() => {
    let total = 0;
    const c = this.cart();
    Object.entries(c).forEach(([id, qty]) => {
      const p = this.data.marketProducts().find(x => x.id === +id);
      if (p) total += p.price * qty;
    });
    return total;
  });

  checkout() {
    this.toast.show(`📦 Pedido de ${this.cartCount()} iten(s) enviado aos fornecedores!`, 'success');
    this.cart.set({});
  }
}
