import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { DataService } from '../../../core/services/data.service';
import { ToastService } from '../../../core/services/toast.service';
import { AppUser, Order } from '../../../core/models';

@Component({
  selector: 'app-client-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
  <div class="profile-shell">
    <div class="profile-header">
      <button class="back-btn" routerLink="/client">← Voltar</button>
      <div style="flex:1">
        <div class="profile-title">Meu Perfil</div>
        <div class="profile-subtitle">Informações, pagamentos e histórico de pedidos</div>
      </div>
      <button class="back-btn" (click)="auth.logout()" title="Sair do aplicativo" style="background:rgba(244, 67, 54, .15);color:#f44336">🚪 Sair</button>
    </div>

    <div class="profile-card">
      <div class="profile-avatar" [style.background]="(profile()?.color || '#FF9800') + '22'" [style.color]="profile()?.color || '#FF9800'">
        {{ profile()?.avatar || auth.userName().slice(0,2).toUpperCase() }}
      </div>
      <div class="profile-info">
        <div class="profile-name">{{ auth.userName() }}</div>
        <div class="profile-email">{{ profile()?.email || 'cliente@email.com' }}</div>
        <div class="badge-row">
          <span class="profile-badge">{{ profile()?.tier?.toUpperCase() || 'OURO' }}</span>
          <span class="profile-status">{{ profile()?.status === 'blocked' ? 'Bloqueado' : 'Ativo' }}</span>
        </div>
      </div>
    </div>

    <div class="section-grid">
      <div class="section-panel">
        <div class="section-title">Saldo e Pagamentos</div>
        <div class="wallet-row">
          <div>
            <div class="wallet-label">Saldo disponível</div>
            <div class="wallet-amount">R$ {{ wallet() }},00</div>
          </div>
          <button class="btn-secondary" (click)="addBalance()">+ Adicionar</button>
        </div>
        <div class="payment-list">
          <div class="payment-item" *ngFor="let card of cards()">
            <div>
              <div class="payment-name">{{ card.label }}</div>
              <div class="payment-note">{{ card.brand }} •••• {{ card.last4 }}</div>
            </div>
            <button class="icon-btn" (click)="removeCard(card.id)">🗑</button>
          </div>
          <button class="btn-primary" (click)="addCard()">+ Novo cartão</button>
        </div>
      </div>

      <div class="section-panel">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
          <div class="section-title">Dados do Perfil</div>
          <span style="font-size:11px;color:var(--muted)">&#9998;︎ Clique para editar</span>
        </div>
        <label>👤 Nome completo</label>
        <input class="profile-input" [(ngModel)]="profileForm.name" placeholder="Seu nome completo" />
        <label>📧 Email</label>
        <input class="profile-input" [(ngModel)]="profileForm.email" type="email" placeholder="seu@email.com" />
        <label>📁 Telefone</label>
        <input class="profile-input" [(ngModel)]="profileForm.phone" placeholder="(11) 9 9999-9999" />
        <label>📍 Endereço</label>
        <input class="profile-input" [(ngModel)]="profileForm.address" placeholder="Rua, número, bairro" />
        <button class="btn-primary" (click)="saveProfile()">💾 Salvar alterações</button>
      </div>
    </div>

    <div class="section-panel order-history">
      <div class="section-title">Últimos pedidos</div>
      <div class="order-card" *ngFor="let order of recentOrders()">
        <div class="order-meta">
          <div class="order-token">{{ order.token }}</div>
          <div class="order-status">{{ order.status === 'done' ? 'Entregue' : order.status === 'preparing' ? 'Preparando' : 'Pendente' }}</div>
        </div>
        <div class="order-desc">{{ order.items }}</div>
        <div class="order-footer">
          <span>{{ order.time }}</span>
          <strong>{{ data.formatPrice(order.total) }}</strong>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .profile-shell { max-width: 520px; margin: 0 auto; padding: 28px 16px 90px; }
    .profile-header { display:flex; align-items:flex-start; gap:12px; margin-bottom:24px; }
    .back-btn { border:none; background:var(--surface); color:var(--text); padding:10px 14px; border-radius:14px; cursor:pointer; box-shadow:0 10px 30px rgba(0,0,0,.05); font-size:13px; font-weight:600; transition:all .2s; }
    .back-btn:hover { transform:translateY(-2px); box-shadow:0 14px 40px rgba(0,0,0,.1); }
    .profile-title { font-family:'Bebas Neue',cursive; font-size:34px; line-height:1; letter-spacing:2px; }
    .profile-subtitle { font-size:13px; color:var(--muted); margin-top:6px; }
    .profile-card { display:flex; align-items:center; gap:16px; background:var(--surface); border:1px solid var(--border); border-radius:24px; padding:18px; margin-bottom:22px; }
    .profile-avatar { width:72px; height:72px; border-radius:24px; display:flex; align-items:center; justify-content:center; font-size:28px; font-weight:800; border:1px solid var(--border); }
    .profile-info { flex:1; min-width:0; }
    .profile-name { font-size:18px; font-weight:700; margin-bottom:4px; }
    .profile-email { font-size:12px; color:var(--muted); margin-bottom:12px; }
    .badge-row { display:flex; gap:10px; flex-wrap:wrap; }
    .profile-badge, .profile-status { font-size:11px; font-weight:700; padding:6px 12px; border-radius:999px; border:1px solid var(--border); }
    .profile-badge { background:rgba(255,184,0,.08); color:var(--gold); }
    .profile-status { background:rgba(0,200,83,.08); color:var(--green); }
    .section-grid { display:grid; gap:18px; margin-bottom:18px; }
    .section-panel { background:var(--surface); border:1px solid var(--border); border-radius:24px; padding:18px; }
    .section-title { font-size:12px; color:var(--muted); letter-spacing:1px; text-transform:uppercase; font-weight:700; margin-bottom:14px; }
    .wallet-row { display:flex; align-items:center; justify-content:space-between; gap:14px; margin-bottom:18px; }
    .wallet-label { font-size:12px; color:var(--muted); margin-bottom:4px; }
    .wallet-amount { font-size:22px; font-weight:700; }
    .payment-list { display:flex; flex-direction:column; gap:12px; }
    .payment-item { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:14px 16px; border-radius:18px; background:var(--surface2); }
    .payment-name { font-size:13px; font-weight:700; }
    .payment-note { font-size:12px; color:var(--muted); margin-top:4px; }
    .section-panel label { font-size:11px; color:var(--muted); display:block; margin-top:12px; margin-bottom:6px; }
    .profile-input { width:100%; padding:12px 14px; border-radius:16px; border:1px solid var(--border); background:var(--surface2); color:var(--text); font-size:13px; }
    .btn-primary { width:100%; margin-top:16px; padding:14px; border:none; border-radius:16px; background:var(--accent); color:#fff; font-weight:700; cursor:pointer; }
    .btn-secondary { padding:12px 16px; border:none; border-radius:16px; background:rgba(255,255,255,.08); color:var(--text); cursor:pointer; }
    .icon-btn { width:38px; height:38px; border-radius:14px; border:none; background:rgba(255,255,255,.08); color:var(--text); cursor:pointer; }
    .order-history .order-card { border-bottom:1px solid var(--border); padding:16px 0; }
    .order-meta { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:6px; }
    .order-token { font-size:13px; font-weight:700; }
    .order-status { font-size:11px; color:var(--muted); }
    .order-desc { font-size:13px; color:var(--muted); margin-bottom:10px; }
    .order-footer { display:flex; align-items:center; justify-content:space-between; gap:12px; font-size:12px; color:var(--muted); }
    @media (min-width:768px) { .section-grid { grid-template-columns: 1fr 1fr; } }
  `]
})
export class ClientProfileComponent {
  auth = inject(AuthService);
  data = inject(DataService);
  toast = inject(ToastService);

  wallet = signal(120);
  cards = signal([{ id: 1, brand: 'Visa', last4: '4242', label: 'Visa •••• 4242' }]);
  profileForm = { name: this.auth.userName(), email: this.auth.userName().toLowerCase().replace(' ', '.') + '@email.com', phone: '(11) 9 0000-0000', address: 'Rua do Mercado, 123' };

  profile = computed<AppUser | undefined>(() =>
    this.data.users().find(user => user.name === this.auth.userName())
  );

  recentOrders = computed((): Order[] =>
    this.data.orders().filter(order => order.customer === this.auth.userName()).slice(0, 3)
  );

  addBalance() {
    const value = Number(prompt('Quanto deseja adicionar? R$') ?? '0');
    if (!value || value <= 0) { this.toast.show('Insira um valor válido.', 'default'); return; }
    this.wallet.update(current => current + value);
    this.toast.show(`✅ Adicionado R$ ${value.toFixed(2).replace('.', ',')} ao saldo!`, 'success');
  }

  addCard() {
    const last4 = prompt('Digite os 4 últimos dígitos do cartão:');
    if (!last4 || last4.length !== 4 || Number.isNaN(Number(last4))) {
      this.toast.show('Digite 4 dígitos válidos.', 'default');
      return;
    }
    const nextId = Math.max(...this.cards().map(c => c.id)) + 1;
    this.cards.update(list => [...list, { id: nextId, brand: 'Visa', last4, label: `Visa •••• ${last4}` }]);
    this.toast.show('✅ Cartão adicionado!', 'success');
  }

  removeCard(id: number) {
    this.cards.update(list => list.filter(card => card.id !== id));
    this.toast.show('🗑 Cartão removido.', 'default');
  }

  saveProfile() {
    this.toast.show('✅ Perfil salvo com sucesso!', 'success');
  }
}
