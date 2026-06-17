import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService, Order } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { OrderApiService } from '../../core/services/order-api.service';

@Component({
  selector: 'app-kitchen',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="kitchen-shell">
    <header class="kitchen-header">
      <div>
        <div class="page-subtitle">Painel da cozinha</div>
        <h1>🍳 Cozinha em operação</h1>
        <p class="page-description">Visualize e controle os pedidos em tempo real, do pedido recebido até a entrega.</p>
      </div>
      <div class="header-actions">
        <div class="header-user">👤 {{ auth.userName() }}</div>
        <button class="btn-logout" (click)="logout()">Sair</button>
      </div>
    </header>

    <section class="kitchen-summary">
      <div class="summary-card summary-new">
        <span class="summary-label">Novos pedidos</span>
        <strong>{{ newOrders().length }}</strong>
      </div>
      <div class="summary-card summary-preparing">
        <span class="summary-label">Em preparo</span>
        <strong>{{ preparingOrders().length }}</strong>
      </div>
      <div class="summary-card summary-ready">
        <span class="summary-label">Prontos</span>
        <strong>{{ readyOrders().length }}</strong>
      </div>
      <div class="summary-card summary-sync">
        <span class="summary-label">Sync API</span>
        <strong>{{ orderService.useApi() ? 'Ativo' : 'Off' }}</strong>
      </div>
    </section>

    <section class="kitchen-grid">
      <div class="col">
        <div class="col-head">
          <h2>Pedidos novos</h2>
          <span>{{ newOrders().length }}</span>
        </div>
        <div *ngIf="newOrders().length; else emptyNew">
          <div *ngFor="let o of newOrders()" class="order-card">
            <div class="order-card-top">
              <div>
                <div class="order-id">#{{ o.id }}</div>
                <div class="order-table">Mesa {{ o.table }}</div>
              </div>
              <span class="pill pill-new">Novo</span>
            </div>
            <div class="order-items">
              <div *ngFor="let it of o.items">{{ it.qty }} × {{ it.name }}</div>
            </div>
            <div class="order-actions">
              <button class="btn btn-primary" (click)="setPreparing(o.id)">Iniciar preparo</button>
              <button class="btn btn-secondary" (click)="setReady(o.id)">Marcar pronto</button>
            </div>
          </div>
        </div>
        <ng-template #emptyNew><div class="empty-state">Nenhum pedido novo no momento.</div></ng-template>
      </div>

      <div class="col">
        <div class="col-head">
          <h2>Em preparo</h2>
          <span>{{ preparingOrders().length }}</span>
        </div>
        <div *ngIf="preparingOrders().length; else emptyPreparing">
          <div *ngFor="let o of preparingOrders()" class="order-card">
            <div class="order-card-top">
              <div>
                <div class="order-id">#{{ o.id }}</div>
                <div class="order-table">Mesa {{ o.table }}</div>
              </div>
              <span class="pill pill-preparing">Preparo</span>
            </div>
            <div class="order-items">
              <div *ngFor="let it of o.items">{{ it.qty }} × {{ it.name }}</div>
            </div>
            <div class="order-actions">
              <button class="btn btn-primary" (click)="setReady(o.id)">Pronto</button>
              <button class="btn btn-tertiary" (click)="setNew(o.id)">Retornar</button>
            </div>
          </div>
        </div>
        <ng-template #emptyPreparing><div class="empty-state">Nada em preparo agora.</div></ng-template>
      </div>

      <div class="col">
        <div class="col-head">
          <h2>Prontos</h2>
          <span>{{ readyOrders().length }}</span>
        </div>
        <div *ngIf="readyOrders().length; else emptyReady">
          <div *ngFor="let o of readyOrders()" class="order-card">
            <div class="order-card-top">
              <div>
                <div class="order-id">#{{ o.id }}</div>
                <div class="order-table">Mesa {{ o.table }}</div>
              </div>
              <span class="pill pill-ready">Pronto</span>
            </div>
            <div class="order-items">
              <div *ngFor="let it of o.items">{{ it.qty }} × {{ it.name }}</div>
            </div>
            <div class="order-actions">
              <button class="btn btn-danger" (click)="remove(o.id)">Entregue</button>
            </div>
          </div>
        </div>
        <ng-template #emptyReady><div class="empty-state">Nenhum pedido aguardando entrega.</div></ng-template>
      </div>
    </section>

    <section class="kitchen-footer">
      <div class="footer-panel">
        <h3>Adicionar pedido rápido</h3>
        <div class="form-row">
          <input placeholder="Mesa" [(ngModel)]="table">
          <input placeholder="Item" [(ngModel)]="itemName">
          <input placeholder="Qtd" type="number" [(ngModel)]="itemQty">
          <button class="btn btn-primary" (click)="addMock()">Adicionar</button>
        </div>
      </div>
      <div class="footer-panel sync-panel">
        <h3>Sincronização</h3>
        <div class="form-row">
          <input placeholder="API base URL" [(ngModel)]="apiBase">
          <button class="btn btn-secondary" (click)="startSync()">Iniciar</button>
          <button class="btn btn-tertiary" (click)="stopSync()">Parar</button>
        </div>
        <div class="sync-status" [class.active]="orderService.useApi()">
          {{ orderService.useApi() ? 'Sincronizando com API' : 'Sync offline' }}
        </div>
      </div>
    </section>
  </div>
  `,
  styles: [`
    .kitchen-shell {
      padding: 24px;
      max-width: 1280px;
      margin: 0 auto;
      font-family: 'DM Sans', sans-serif;
    }
    .kitchen-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 24px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }
    .page-subtitle {
      text-transform: uppercase;
      font-size: 12px;
      letter-spacing: 1.8px;
      color: var(--muted);
      margin-bottom: 8px;
    }
    .kitchen-header h1 {
      margin: 0;
      font-size: 42px;
      letter-spacing: 1px;
      line-height: 1.05;
    }
    .page-description {
      margin: 10px 0 0;
      max-width: 620px;
      color: var(--muted);
      line-height: 1.6;
    }
    .header-actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
      align-items: flex-end;
    }
    .header-user {
      font-weight: 700;
      color: var(--text);
      background: rgba(255,255,255,.06);
      border: 1px solid var(--border);
      padding: 12px 16px;
      border-radius: 16px;
    }
    .btn-logout {
      padding: 12px 18px;
      border: none;
      background: var(--accent);
      color: white;
      border-radius: 14px;
      cursor: pointer;
      font-weight: 700;
    }
    .kitchen-summary {
      display: grid;
      grid-template-columns: repeat(4, minmax(180px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .summary-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 22px;
      padding: 20px 22px;
      min-height: 120px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 10px;
    }
    .summary-label { text-transform: uppercase; font-size: 11px; letter-spacing: 1px; color: var(--muted); }
    .summary-card strong { font-size: 36px; line-height: 1; }
    .summary-new { background: rgba(76, 175, 80, .08); }
    .summary-preparing { background: rgba(255, 193, 7, .08); }
    .summary-ready { background: rgba(33, 150, 243, .08); }
    .summary-sync { background: rgba(103, 58, 183, .08); }
    .kitchen-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(240px, 1fr));
      gap: 18px;
      margin-bottom: 24px;
    }
    .col {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 24px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .col-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      margin-bottom: 6px;
    }
    .col-head h2 { margin: 0; font-size: 18px; }
    .col-head span { color: var(--muted); font-size: 13px; }
    .order-card {
      background: var(--surface2);
      border: 1px solid var(--border);
      border-radius: 18px;
      padding: 18px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      box-shadow: 0 18px 40px rgba(0,0,0,.06);
    }
    .order-card-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
    }
    .order-id { font-weight: 700; color: var(--text); margin-bottom: 6px; }
    .order-table { font-size: 13px; color: var(--muted); }
    .order-items { display: grid; gap: 8px; font-size: 14px; color: var(--text); }
    .pill {
      padding: 6px 12px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: .5px;
      text-transform: uppercase;
    }
    .pill-new { background: rgba(76, 175, 80, .14); color: #4caf50; }
    .pill-preparing { background: rgba(255, 193, 7, .14); color: #f9a825; }
    .pill-ready { background: rgba(33, 150, 243, .14); color: #1976d2; }
    .order-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    .btn { border: none; border-radius: 14px; padding: 11px 16px; font-weight: 700; cursor: pointer; transition: transform .2s ease, box-shadow .2s ease; }
    .btn:hover { transform: translateY(-1px); }
    .btn-primary { background: var(--accent); color: white; box-shadow: 0 16px 30px rgba(255,69,0,.15); }
    .btn-secondary { background: rgba(255,255,255,.08); color: var(--text); }
    .btn-tertiary { background: transparent; color: var(--accent); border: 1px solid var(--border); }
    .btn-danger { background: #f44336; color: white; }
    .empty-state {
      background: rgba(255,255,255,.05);
      border: 1px dashed var(--border);
      border-radius: 18px;
      padding: 26px;
      text-align: center;
      color: var(--muted);
      font-size: 14px;
    }
    .kitchen-footer {
      display: grid;
      grid-template-columns: 1.7fr 1fr;
      gap: 18px;
    }
    .footer-panel {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 24px;
      padding: 22px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .sync-panel { background: rgba(45, 55, 72, .05); }
    .footer-panel h3 { margin: 0; font-size: 18px; }
    .form-row {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
      align-items: end;
    }
    .form-row input { width: 100%; border-radius: 16px; border: 1px solid var(--border); padding: 14px 16px; background: var(--surface2); color: var(--text); }
    .form-row button { width: 100%; }
    .sync-status {
      padding: 14px 16px;
      border-radius: 16px;
      color: var(--muted);
      background: rgba(255,255,255,.04);
      border: 1px solid var(--border);
      font-size: 13px;
    }
    .sync-status.active { color: var(--accent); }
    @media(max-width:1100px) { .kitchen-grid, .kitchen-footer { grid-template-columns: 1fr; } }
    @media(max-width:680px) { .kitchen-summary { grid-template-columns: 1fr 1fr; } }
    @media(max-width:560px) {
      .kitchen-shell { padding: 16px; }
      .page-subtitle, .page-description { max-width: 100%; }
      .header-actions { width: 100%; align-items: stretch; }
      .form-row { grid-template-columns: 1fr; }
    }
  `]
})
export class KitchenComponent {
  orderService = inject(OrderService);
  auth = inject(AuthService);
  router = inject(Router);
  api = inject(OrderApiService);

  table = '';
  itemName = '';
  itemQty = 1;

  constructor() {
    const r = this.auth.role();
    if (r !== 'cozinha' && r !== 'admin') {
      this.router.navigate(['/login']);
    }
  }

  newOrders() { return this.orderService.orders().filter(o => o.status === 'new'); }
  preparingOrders() { return this.orderService.orders().filter(o => o.status === 'preparing'); }
  readyOrders() { return this.orderService.orders().filter(o => o.status === 'ready'); }

  setPreparing(id: string) { this.orderService.updateStatus(id, 'preparing'); }
  setReady(id: string) { this.orderService.updateStatus(id, 'ready'); }
  setNew(id: string) { this.orderService.updateStatus(id, 'new'); }
  remove(id: string) { this.orderService.removeOrder(id); }

  addMock() {
    const id = 'o' + Math.floor(Math.random() * 10000);
    const qty = Number(this.itemQty) || 1;
    this.orderService.addOrder({ id, table: this.table || 'T1', items: [{ name: this.itemName || 'Item', qty }], status: 'new' });
    this.table = ''; this.itemName = ''; this.itemQty = 1;
  }

  logout() { this.auth.logout(); }

  apiBase = '';

  startSync() {
    this.api.start(this.apiBase || '', 4000);
  }

  stopSync() {
    this.api.stop();
  }
}
