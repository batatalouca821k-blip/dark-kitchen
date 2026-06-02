import { Component, inject, signal, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../../core/models';
import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../core/services/toast.service';
import { DataService } from '../../../core/services/data.service';

@Component({
  selector: 'app-product-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="modal-overlay" [class.open]="product" (click)="onOverlay($event)">
    <div class="modal-sheet" *ngIf="product">
      <div class="modal-handle"></div>

      <div style="display:flex; align-items:center; gap:14px; margin-bottom:16px">
        <div style="font-size:52px">{{ product.emoji }}</div>
        <div>
          <div class="modal-title">{{ product.name }}</div>
          <div class="modal-price">{{ data.formatPrice(product.price) }}</div>
        </div>
      </div>

      <div class="modal-desc">{{ product.desc }}</div>

      <!-- Size addons -->
      <div class="addon-group">
        <div class="addon-group-title">Tamanho</div>
        <div class="addon-options">
          <div class="addon-option" [class.selected]="selectedSize === 0" (click)="selectedSize = 0">🍟 P (+R$ 0)</div>
          <div class="addon-option" [class.selected]="selectedSize === 500" (click)="selectedSize = 500">🍟🍟 M (+R$ 5)</div>
          <div class="addon-option" [class.selected]="selectedSize === 1000" (click)="selectedSize = 1000">🍟🍟🍟 G (+R$ 10)</div>
        </div>
      </div>

      <!-- Extras -->
      <div class="addon-group">
        <div class="addon-group-title">Extras</div>
        <div class="addon-options">
          <div class="addon-option" *ngFor="let e of extras"
               [class.selected]="selectedExtras().includes(e.label)"
               (click)="toggleExtra(e)">
            {{ e.label }}
          </div>
        </div>
      </div>

      <!-- Qty -->
      <div class="qty-control">
        <div style="font-size:13px; font-weight:600">Quantidade</div>
        <div style="display:flex; align-items:center; gap:16px">
          <button class="qty-btn" (click)="changeQty(-1)">−</button>
          <span class="qty-num">{{ qty() }}</span>
          <button class="qty-btn" (click)="changeQty(1)">+</button>
        </div>
      </div>

      <button class="modal-add-btn" (click)="addToCart()">
        Adicionar ao carrinho · {{ data.formatPrice(totalPrice()) }}
      </button>
    </div>
  </div>
  `,
  styles: [`
    .modal-title { font-family: 'Bebas Neue', cursive; font-size: 24px; letter-spacing: 1px; }
    .modal-price { color: var(--accent2); font-family: 'DM Mono', monospace; font-size: 16px; font-weight: 500; margin-top: 4px; }
    .modal-desc  { font-size: 13px; color: var(--muted); margin-bottom: 20px; line-height: 1.6; }

    .addon-group { margin-bottom: 16px; }
    .addon-group-title { font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600; margin-bottom: 8px; }
    .addon-options { display: flex; flex-wrap: wrap; gap: 8px; }
    .addon-option {
      padding: 8px 14px; border-radius: 50px; font-size: 13px; font-weight: 500;
      border: 1px solid var(--border); background: var(--surface2); color: var(--muted);
      cursor: pointer; transition: all .2s;
    }
    .addon-option.selected, .addon-option:hover { border-color: var(--accent); color: var(--text); background: rgba(255,69,0,.1); }

    .qty-control { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; padding: 14px 0; border-top: 1px solid var(--border); }
    .qty-btn { width: 36px; height: 36px; border-radius: 50%; background: var(--surface2); border: 1px solid var(--border); color: var(--text); font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all .2s; }
    .qty-btn:hover { border-color: var(--accent); color: var(--accent); }
    .qty-num { font-family: 'DM Mono', monospace; font-size: 22px; font-weight: 500; min-width: 32px; text-align: center; }

    .modal-add-btn { width: 100%; padding: 16px; background: var(--accent); color: white; border: none; border-radius: var(--r2); font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 700; cursor: pointer; letter-spacing: .5px; box-shadow: 0 8px 32px rgba(255,69,0,.4); transition: all .25s; }
    .modal-add-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(255,69,0,.5); }
  `]
})
export class ProductModalComponent {
  @Input() product: Product | null = null;
  @Output() closed = new EventEmitter<void>();

  cart  = inject(CartService);
  toast = inject(ToastService);
  data  = inject(DataService);

  qty = signal(1);
  selectedSize = 0;
  selectedExtras = signal<string[]>([]);

  extras = [
    { label: '🥓 Bacon (+R$ 6)',   price: 600 },
    { label: '🧀 Cheddar (+R$ 4)', price: 400 },
    { label: '🥑 Guac (+R$ 8)',    price: 800 },
    { label: '🌶️ Jalapeño (+R$ 3)',price: 300 },
  ];

  totalPrice() {
    if (!this.product) return 0;
    let extra = this.selectedSize;
    this.selectedExtras().forEach(lbl => {
      const e = this.extras.find(x => x.label === lbl);
      if (e) extra += e.price;
    });
    return (this.product.price + extra) * this.qty();
  }

  changeQty(d: number) { this.qty.update(v => Math.max(1, Math.min(10, v + d))); }

  toggleExtra(e: { label: string; price: number }) {
    this.selectedExtras.update(list =>
      list.includes(e.label) ? list.filter(x => x !== e.label) : [...list, e.label]
    );
  }

  addToCart() {
    if (!this.product) return;
    this.cart.add({
      id: this.product.id,
      name: this.product.name,
      emoji: this.product.emoji,
      price: this.totalPrice() / this.qty(),
      qty: this.qty(),
      addons: this.selectedExtras().join(', ') || undefined,
    });
    this.toast.show(`✅ ${this.product.name} adicionado!`, 'success');
    this.close();
  }

  close() { this.closed.emit(); }
  onOverlay(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('modal-overlay')) this.close();
  }
}
