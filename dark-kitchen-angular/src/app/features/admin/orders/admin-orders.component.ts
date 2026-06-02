import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../../core/services/data.service';
import { ToastService } from '../../../core/services/toast.service';
import { Order } from '../../../core/models';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div>
    <div class="admin-page-title">PEDIDOS</div>
    <div class="admin-subtitle">Kanban em tempo real</div>

    <div class="orders-board">

      <!-- PENDING -->
      <div class="board-col col-pending">
        <div class="board-col-header">
          <div class="board-col-dot"></div>
          <div class="board-col-title">Aguardando</div>
          <div class="board-col-count">{{ pending().length }}</div>
        </div>
        <div class="board-col-body">
          <div class="order-card" *ngFor="let o of pending()">
            <div class="oc-header">
              <span class="oc-token">{{ o.token }}</span>
              <span class="oc-time">{{ o.time }}</span>
            </div>
            <div class="oc-customer">{{ o.customer }}</div>
            <div class="oc-items">{{ o.items }}</div>
            <div class="oc-footer">
              <span class="oc-total">{{ data.formatPrice(o.total) }}</span>
              <span class="oc-eta">⏱ {{ o.eta }}</span>
            </div>
            <button class="status-btn" (click)="advance(o)">✓ Aceitar Pedido</button>
          </div>
          <div class="board-empty" *ngIf="pending().length === 0">Nenhum pedido aguardando</div>
        </div>
      </div>

      <!-- PREPARING -->
      <div class="board-col col-preparing">
        <div class="board-col-header">
          <div class="board-col-dot"></div>
          <div class="board-col-title">Em Preparo</div>
          <div class="board-col-count">{{ preparing().length }}</div>
        </div>
        <div class="board-col-body">
          <div class="order-card" *ngFor="let o of preparing()">
            <div class="oc-header">
              <span class="oc-token">{{ o.token }}</span>
              <span class="oc-time">{{ o.time }}</span>
            </div>
            <div class="oc-customer">{{ o.customer }}</div>
            <div class="oc-items">{{ o.items }}</div>
            <div class="oc-footer">
              <span class="oc-total">{{ data.formatPrice(o.total) }}</span>
              <span class="oc-eta">⏱ {{ o.eta }}</span>
            </div>
            <button class="status-btn" (click)="advance(o)">📦 Finalizar</button>
          </div>
          <div class="board-empty" *ngIf="preparing().length === 0">Nenhum pedido em preparo</div>
        </div>
      </div>

      <!-- DONE -->
      <div class="board-col col-done">
        <div class="board-col-header">
          <div class="board-col-dot"></div>
          <div class="board-col-title">Prontos</div>
          <div class="board-col-count">{{ done().length }}</div>
        </div>
        <div class="board-col-body">
          <div class="order-card" style="border-color:rgba(0,200,83,.2)" *ngFor="let o of done()">
            <div class="oc-header">
              <span class="oc-token" style="color:var(--green)">{{ o.token }}</span>
              <span class="oc-time">{{ o.time }}</span>
            </div>
            <div class="oc-customer">{{ o.customer }}</div>
            <div class="oc-footer">
              <span class="oc-total">{{ data.formatPrice(o.total) }}</span>
              <span class="oc-eta" style="color:var(--green)">✅ Pronto</span>
            </div>
          </div>
          <div class="board-empty" *ngIf="done().length === 0">Nenhum pedido finalizado</div>
        </div>
      </div>

    </div>
  </div>
  `,
  styles: [`
    .orders-board { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
    @media(max-width:900px) { .orders-board { grid-template-columns: 1fr; } }
    .board-col { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r2); overflow: hidden; }
    .board-col-header { padding: 14px 16px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 8px; }
    .board-col-dot { width: 8px; height: 8px; border-radius: 50%; }
    .col-pending  .board-col-dot { background: var(--gold);  box-shadow: 0 0 8px rgba(255,184,0,.5); }
    .col-preparing .board-col-dot { background: var(--accent); box-shadow: 0 0 8px rgba(255,69,0,.5); animation: pulse-tiny 1.5s infinite; }
    .col-done     .board-col-dot { background: var(--green); box-shadow: 0 0 8px rgba(0,200,83,.5); }
    .board-col-title { font-size: 13px; font-weight: 600; }
    .board-col-count { margin-left: auto; font-family: 'DM Mono', monospace; font-size: 12px; color: var(--muted); }
    .board-col-body { padding: 10px; display: flex; flex-direction: column; gap: 8px; min-height: 300px; }
    .board-empty { font-size: 12px; color: var(--muted); text-align: center; padding: 24px 0; }
    .order-card { background: var(--surface2); border: 1px solid var(--border); border-radius: var(--r); padding: 12px; cursor: pointer; transition: all .2s; }
    .order-card:hover { border-color: rgba(255,69,0,.3); transform: translateY(-1px); }
    .oc-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
    .oc-token { font-family: 'DM Mono', monospace; font-size: 14px; font-weight: 500; color: var(--accent); }
    .oc-time { font-size: 11px; color: var(--muted); }
    .oc-customer { font-size: 13px; font-weight: 500; margin-bottom: 4px; }
    .oc-items { font-size: 12px; color: var(--muted); margin-bottom: 10px; }
    .oc-footer { display: flex; align-items: center; justify-content: space-between; }
    .oc-total { font-family: 'DM Mono', monospace; font-size: 13px; color: var(--accent2); }
    .oc-eta { font-size: 11px; color: var(--muted); }
    .status-btn { width: 100%; padding: 8px; border-radius: 8px; border: 1px solid var(--border); background: rgba(255,69,0,.08); color: var(--accent); font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600; cursor: pointer; margin-top: 8px; transition: all .2s; }
    .status-btn:hover { background: var(--accent); color: white; border-color: var(--accent); }
  `]
})
export class AdminOrdersComponent {
  data  = inject(DataService);
  toast = inject(ToastService);

  pending    = computed(() => this.data.orders().filter(o => o.status === 'pending'));
  preparing  = computed(() => this.data.orders().filter(o => o.status === 'preparing'));
  done       = computed(() => this.data.orders().filter(o => o.status === 'done'));

  advance(o: Order) {
    this.data.advanceOrder(o.id);
    const msg = o.status === 'pending' ? `✅ ${o.token} aceito e em preparo!` : `📦 ${o.token} finalizado!`;
    this.toast.show(msg, 'success');
  }
}
