import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { DataService } from '../../../core/services/data.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
  <div class="checkout-shell">

    <!-- Header -->
    <div class="co-header">
      <button class="co-back" routerLink="/client">←</button>
      <div class="co-title-wrap">
        <div class="co-title">CARRINHO</div>
        <div class="co-subtitle">{{ cart.count() }} ite{{ cart.count() === 1 ? 'm' : 'ns' }}</div>
      </div>
    </div>

    <!-- Empty state -->
    <div class="empty-cart" *ngIf="cart.count() === 0">
      <div style="font-size:64px; margin-bottom:16px">🛒</div>
      <div style="font-size:18px; font-weight:600; margin-bottom:8px">Carrinho vazio</div>
      <div style="font-size:13px; color:var(--muted); margin-bottom:24px">Adicione itens do cardápio para continuar</div>
      <button class="btn-primary" routerLink="/client">Ver cardápio</button>
    </div>

    <ng-container *ngIf="cart.count() > 0">

      <!-- Cart Items -->
      <div class="co-section">
        <div class="co-section-header">
          <span class="co-section-title">Itens do pedido</span>
          <span class="co-section-edit" (click)="cart.clear()">Limpar</span>
        </div>
        <div class="co-section-body">
          <div class="co-cart-item" *ngFor="let item of cart.items()">
            <div class="co-item-emoji">{{ item.emoji }}</div>
            <div class="co-item-info">
              <div class="co-item-name">{{ item.name }}</div>
              <div class="co-item-addons" *ngIf="item.addons">{{ item.addons }}</div>
            </div>
            <div class="co-item-controls">
              <button class="co-qty-btn" (click)="cart.changeQty(item.id, -1)">−</button>
              <span class="co-qty-num">{{ item.qty }}</span>
              <button class="co-qty-btn" (click)="cart.changeQty(item.id, 1)">+</button>
            </div>
            <div class="co-item-price">{{ data.formatPrice(item.price * item.qty) }}</div>
          </div>
        </div>
      </div>

      <!-- Delivery -->
      <div class="co-section">
        <div class="co-section-header">
          <span class="co-section-title">Entrega</span>
        </div>
        <div class="co-section-body">
          <div class="co-delivery-opt" [class.selected]="delivery() === 'delivery'" (click)="delivery.set('delivery')">
            <div class="co-radio-dot"></div>
            <div class="co-delivery-icon">🛵</div>
            <div class="co-delivery-info">
              <div class="co-delivery-label">Delivery</div>
              <div class="co-delivery-sub">~30 min · Rua das Flores, 123</div>
            </div>
            <div class="co-delivery-price">R$ 6,90</div>
          </div>
          <div class="co-delivery-opt" [class.selected]="delivery() === 'retirada'" (click)="delivery.set('retirada')">
            <div class="co-radio-dot"></div>
            <div class="co-delivery-icon">🏪</div>
            <div class="co-delivery-info">
              <div class="co-delivery-label">Retirada</div>
              <div class="co-delivery-sub">~12 min · No local</div>
            </div>
            <div class="co-delivery-price" style="color:var(--green)">Grátis</div>
          </div>
        </div>
      </div>

      <!-- Payment -->
      <div class="co-section">
        <div class="co-section-header"><span class="co-section-title">Pagamento</span></div>
        <div class="co-section-body">
          <div class="pay-tabs">
            <div class="pay-tab" [class.active]="payMethod() === 'pix'" (click)="payMethod.set('pix')">
              <span class="pay-tab-icon">📱</span><span class="pay-tab-label">PIX</span>
            </div>
            <div class="pay-tab" [class.active]="payMethod() === 'card'" (click)="payMethod.set('card')">
              <span class="pay-tab-icon">💳</span><span class="pay-tab-label">CARTÃO</span>
            </div>
            <div class="pay-tab" [class.active]="payMethod() === 'cash'" (click)="payMethod.set('cash')">
              <span class="pay-tab-icon">💵</span><span class="pay-tab-label">DINHEIRO</span>
            </div>
          </div>
          <div class="pix-panel" *ngIf="payMethod() === 'pix'">
            <div style="font-size:12px;color:var(--muted)">Escaneie o QR Code ou copie a chave</div>
            <div class="pix-qr">📱</div>
            <div class="pix-key-row">
              <span class="pix-key">{{ pixKey() }}</span>
              <button class="pix-copy-btn" (click)="copyPixKey()">Copiar</button>
            </div>
          </div>
          <div *ngIf="payMethod() === 'card'" style="padding:8px 0">
            <div class="card-panel">
              <div class="card-item" *ngFor="let card of cardList()">
                <label>
                  <input type="radio" [value]="card.id" name="card" [checked]="selectedCardId() === card.id" (change)="selectedCardId.set(card.id)">
                  <span>{{ card.label }}</span>
                </label>
              </div>
              <button class="btn-secondary" type="button" (click)="addCard()">+ Adicionar cartão</button>
            </div>
          </div>
          <div *ngIf="payMethod() === 'cash'" style="padding:8px 0">
            <div class="cash-panel">
              <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:10px;">
                <span>Dinheiro disponível</span>
                <strong>{{ data.formatPriceR(cashAmount()) }}</strong>
              </div>
              <input type="number" class="cash-input" [value]="cashAmount()" (input)="setCashAmount($event)" min="0" />
              <div style="font-size:12px; color:var(--muted); margin-top:10px;">
                {{ cashChange() >= 0 ? 'Troco estimado: ' + data.formatPriceR(cashChange() / 100) : 'Faltam ' + data.formatPriceR(abs(cashChange()) / 100) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Summary -->
      <div class="co-section">
        <div class="co-section-header"><span class="co-section-title">Resumo</span></div>
        <div class="co-section-body">
          <div class="summary-rows">
            <div class="summary-row">
              <span>Subtotal</span>
              <span class="summary-val">{{ data.formatPrice(cart.total()) }}</span>
            </div>
            <div class="summary-row">
              <span>Entrega</span>
              <span class="summary-val">{{ delivery() === 'delivery' ? 'R$ 6,90' : 'Grátis' }}</span>
            </div>
            <div class="summary-row" style="color:var(--green)">
              <span>⭐ Pontos a ganhar</span>
              <span class="summary-val">+{{ pointsToEarn() }} pts</span>
            </div>
            <div class="summary-row total">
              <span>Total</span>
              <span class="summary-val">{{ data.formatPrice(grandTotal()) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Confirm -->
      <button class="co-confirm-btn" [disabled]="placing()" (click)="placeOrder()">
        {{ placing() ? '⏳ Processando...' : '🔥 Confirmar Pedido · ' + data.formatPrice(grandTotal()) }}
      </button>

    </ng-container>

  </div>
  `,
  styles: [`
    .checkout-shell { max-width: 480px; margin: 0 auto; padding: 80px 16px 120px; }

    .empty-cart { text-align: center; padding: 60px 20px; }

    .co-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
    .co-back { width: 38px; height: 38px; border-radius: 50%; border: 1px solid var(--border); background: var(--surface2); color: var(--muted); font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all .2s; flex-shrink: 0; }
    .co-back:hover { border-color: var(--accent); color: var(--accent); }
    .co-title-wrap { flex: 1; }
    .co-title { font-family: 'Bebas Neue', cursive; font-size: 28px; letter-spacing: 2px; line-height: 1; }
    .co-subtitle { font-size: 12px; color: var(--muted); margin-top: 2px; }

    .co-section { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r2); overflow: hidden; margin-bottom: 12px; }
    .co-section-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid var(--border); background: var(--surface2); }
    .co-section-title { font-size: 11px; color: var(--muted); letter-spacing: 2px; text-transform: uppercase; font-weight: 700; }
    .co-section-edit { font-size: 12px; color: var(--accent); font-weight: 600; cursor: pointer; }
    .co-section-body { padding: 12px 14px; }

    .co-cart-item { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--border); }
    .co-cart-item:last-child { border-bottom: none; }
    .co-item-emoji { font-size: 28px; flex-shrink: 0; }
    .co-item-info { flex: 1; }
    .co-item-name { font-size: 13px; font-weight: 600; }
    .co-item-addons { font-size: 11px; color: var(--muted); margin-top: 2px; }
    .co-item-controls { display: flex; align-items: center; gap: 8px; }
    .co-qty-btn { width: 26px; height: 26px; border-radius: 8px; border: 1px solid var(--border); background: var(--surface2); color: var(--text); font-size: 15px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all .15s; }
    .co-qty-btn:hover { border-color: var(--accent); color: var(--accent); }
    .co-qty-num { font-family: 'DM Mono', monospace; font-size: 14px; min-width: 18px; text-align: center; }
    .co-item-price { font-family: 'DM Mono', monospace; font-size: 13px; color: var(--accent2); min-width: 58px; text-align: right; flex-shrink: 0; }

    .co-delivery-opt { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: var(--r); border: 1px solid var(--border); cursor: pointer; transition: all .2s; margin-bottom: 8px; }
    .co-delivery-opt:last-child { margin-bottom: 0; }
    .co-delivery-opt.selected { border-color: var(--accent); background: rgba(255,69,0,.05); }
    .co-delivery-opt.selected .co-radio-dot { border-color: var(--accent); background: var(--accent); box-shadow: 0 0 8px rgba(255,69,0,.4); }
    .co-radio-dot { width: 18px; height: 18px; border-radius: 50%; border: 2px solid var(--muted2); flex-shrink: 0; transition: all .2s; }
    .co-delivery-icon { font-size: 24px; }
    .co-delivery-info { flex: 1; }
    .co-delivery-label { font-size: 13px; font-weight: 600; }
    .co-delivery-sub { font-size: 11px; color: var(--muted); margin-top: 2px; }
    .co-delivery-price { font-family: 'DM Mono', monospace; font-size: 13px; font-weight: 600; color: var(--accent2); flex-shrink: 0; }

    .pay-tabs { display: flex; gap: 6px; margin-bottom: 14px; }
    .pay-tab { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 10px 6px; border-radius: var(--r); border: 1px solid var(--border); background: var(--surface2); cursor: pointer; transition: all .2s; }
    .pay-tab.active { border-color: var(--accent); background: rgba(255,69,0,.07); }
    .pay-tab-icon { font-size: 20px; }
    .pay-tab-label { font-size: 10px; font-weight: 700; color: var(--muted); letter-spacing: .3px; }
    .pay-tab.active .pay-tab-label { color: var(--accent); }

    .pix-panel { background: var(--surface2); border-radius: var(--r); padding: 16px; text-align: center; }
    .pix-qr { width: 120px; height: 120px; margin: 12px auto; background: white; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 80px; }
    .pix-key-row { display: flex; align-items: center; gap: 8px; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 8px 12px; margin-top: 10px; }
    .pix-key { flex: 1; font-family: 'DM Mono', monospace; font-size: 12px; color: var(--muted); word-break: break-all; text-align: left; }
    .pix-copy-btn { padding: 5px 12px; border-radius: 6px; background: var(--accent); border: none; color: white; font-size: 11px; font-weight: 700; cursor: pointer; flex-shrink: 0; transition: all .2s; }
    .card-panel { display:flex; flex-direction:column; gap:12px; }
    .card-item { display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:12px; border:1px solid var(--border); background: var(--surface); }
    .card-item input { accent-color: var(--accent); }
    .card-item label { cursor:pointer; font-size:13px; color: var(--text); width:100%; }
    .cash-panel { display:flex; flex-direction:column; gap:10px; }
    .cash-input { width:100%; padding:12px 14px; border-radius:12px; border:1px solid var(--border); background: var(--surface); color: var(--text); font-size:14px; }

    .summary-rows { display: flex; flex-direction: column; gap: 10px; }
    .summary-row { display: flex; justify-content: space-between; font-size: 14px; color: var(--muted); }
    .summary-row.total { color: var(--text); font-weight: 600; font-size: 16px; padding-top: 10px; border-top: 1px solid var(--border); }
    .summary-val { font-family: 'DM Mono', monospace; }

    .co-confirm-btn { width: 100%; padding: 18px; background: var(--accent); color: white; border: none; border-radius: var(--r2); font-family: 'DM Sans', sans-serif; font-size: 16px; font-weight: 700; cursor: pointer; box-shadow: 0 8px 32px rgba(255,69,0,.4); transition: all .25s; margin-top: 20px; }
    .co-confirm-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(255,69,0,.5); }
    .co-confirm-btn:disabled { opacity: .6; cursor: not-allowed; }
  `]
})
export class CheckoutComponent {
  cart    = inject(CartService);
  data    = inject(DataService);
  toast   = inject(ToastService);
  router  = inject(Router);

  delivery   = signal<'delivery' | 'retirada'>('delivery');
  payMethod  = signal<'pix' | 'card' | 'cash'>('pix');
  placing    = signal(false);
  pixKey     = signal('00020126360014BR.GOV.BCB.PIX0114+5511999888777');
  cashAmount = signal(100);
  cardList   = signal([{
    id: 1,
    brand: 'Visa',
    last4: '4242',
    label: 'Visa •••• 4242'
  }]);
  selectedCardId = signal(1);

  cashChange = computed(() => {
    const change = this.cashAmount() * 100 - this.grandTotal();
    return change;
  });

  grandTotal() {
    const fee = this.delivery() === 'delivery' ? 690 : 0;
    return this.cart.total() + fee;
  }

  pointsToEarn() {
    return Math.floor(this.cart.total() / 100);
  }

  copyPixKey() {
    navigator.clipboard?.writeText(this.pixKey()).then(() => {
      this.toast.show('✅ Código PIX copiado!', 'success');
    }).catch(() => {
      this.toast.show('❌ Falha ao copiar o código PIX');
    });
  }

  addCard() {
    const last4 = prompt('Digite os 4 últimos dígitos do cartão:');
    if (!last4 || last4.length !== 4 || Number.isNaN(Number(last4))) {
      this.toast.show('Digite 4 dígitos válidos.', 'default');
      return;
    }
    const nextId = Math.max(...this.cardList().map(c => c.id), 1) + 1;
    const newCard = { id: nextId, brand: 'Visa', last4, label: `Visa •••• ${last4}` };
    this.cardList.update(list => [...list, newCard]);
    this.selectedCardId.set(nextId);
    this.toast.show('✅ Cartão adicionado!', 'success');
  }

  setCashAmount(event: Event) {
    const value = Number((event.target as HTMLInputElement).value);
    this.cashAmount.set(Math.max(0, isNaN(value) ? 0 : value));
  }

  abs(value: number) {
    return Math.abs(value);
  }

  placeOrder() {
    if (this.cart.count() === 0) return;
    if (this.payMethod() === 'cash' && this.cashAmount() * 100 < this.grandTotal()) {
      this.toast.show('💰 Valor em dinheiro insuficiente para este pedido.', 'default');
      return;
    }
    this.placing.set(true);
    setTimeout(() => {
      this.cart.clear();
      this.toast.show('🔥 Pedido #A024 criado! ETA: 23 min', 'success');
      this.placing.set(false);
      this.router.navigate(['/tracking']);
    }, 1400);
  }
}
