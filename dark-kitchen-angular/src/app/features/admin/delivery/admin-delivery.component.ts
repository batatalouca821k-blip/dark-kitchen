import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../core/services/data.service';
import { ToastService } from '../../../core/services/toast.service';
import { DeliveryPerson } from '../../../core/models';

@Component({
  selector: 'app-admin-delivery',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div>
    <div class="admin-page-title">ENTREGADORES</div>
    <div class="admin-subtitle">Gerencie rotas, status e entregadores em campo</div>

    <div class="toolbar">
      <input class="search-input" [ngModel]="search()" (ngModelChange)="search.set($event)" placeholder="🔍 Buscar entregador...">
      <button class="btn-primary" (click)="openNew()">+ Novo Entregador</button>
    </div>

    <div class="users-list">
      <div class="user-row" *ngFor="let rider of filtered()">
        <div class="user-avatar" [style.background]="rider.color + '22'" [style.borderColor]="rider.color + '44'">
          <span [style.color]="rider.color">{{ rider.avatar }}</span>
        </div>
        <div class="user-info">
          <div class="user-name">{{ rider.name }}</div>
          <div class="user-email">{{ rider.email }}</div>
        </div>
        <div class="user-meta">
          <div class="user-tier-badge">🚴‍♂️ {{ rider.vehicles }}</div>
          <div style="font-size:11px;color:var(--muted);margin-top:3px">{{ rider.deliveries }} entregas · {{ rider.status === 'active' ? 'Online' : 'Offline' }}</div>
        </div>
        <div>
          <span class="status-pill" [class.active]="rider.status==='active'" [class.blocked]="rider.status==='offline'">
            {{ rider.status === 'active' ? '● Online' : '● Offline' }}
          </span>
        </div>
        <div style="display:flex;gap:6px">
          <button class="icon-btn" (click)="toggleStatus(rider)" [title]="rider.status==='active' ? 'Desativar' : 'Ativar'">
            {{ rider.status === 'active' ? '🚫' : '✓' }}
          </button>
          <button class="icon-btn danger" (click)="remove(rider)" title="Remover">🗑</button>
        </div>
      </div>
    </div>

    <div class="confirm-overlay" [class.open]="adding()">
      <div class="confirm-modal" style="max-width:420px;text-align:left">
        <div style="font-family:'Bebas Neue',cursive;font-size:22px;letter-spacing:1px;margin-bottom:18px">NOVO ENTREGADOR</div>
        <div style="margin-bottom:12px">
          <label class="auth-label">Nome</label>
          <input class="auth-input" [(ngModel)]="newRider.name" placeholder="Nome completo">
        </div>
        <div style="margin-bottom:12px">
          <label class="auth-label">Email</label>
          <input class="auth-input" [(ngModel)]="newRider.email" placeholder="email@exemplo.com">
        </div>
        <div style="margin-bottom:12px">
          <label class="auth-label">Veículos</label>
          <input class="auth-input" [(ngModel)]="newRider.vehicles" placeholder="Ex: Moto, Bike" />
        </div>
        <div style="margin-bottom:20px">
          <label class="auth-label">Status</label>
          <select class="auth-input" [(ngModel)]="newRider.status">
            <option value="active">Online</option>
            <option value="offline">Offline</option>
          </select>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn-secondary" style="flex:1" (click)="adding.set(false)">Cancelar</button>
          <button class="btn-primary" style="flex:1" (click)="saveRider()">Criar</button>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .toolbar { display:flex; gap:12px; margin-bottom:20px; }
    .users-list { background:var(--surface); border:1px solid var(--border); border-radius:var(--r2); overflow:hidden; }
    .user-row { display:flex; align-items:center; gap:14px; padding:14px 16px; border-bottom:1px solid var(--border); transition:background .15s; }
    .user-row:last-child { border-bottom:none; }
    .user-row:hover { background:rgba(255,255,255,.02); }
    .user-avatar { width:44px; height:44px; border-radius:50%; border:1px solid; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:700; flex-shrink:0; }
    .user-info { flex:1; min-width:0; }
    .user-name { font-size:14px; font-weight:600; }
    .user-email { font-size:12px; color:var(--muted); margin-top:2px; }
    .user-meta { min-width:140px; }
    .user-tier-badge { font-size:10px; font-weight:700; padding:3px 10px; border-radius:50px; display:inline-block; background:rgba(255,152,0,.1); color:var(--accent); }
    .status-pill { padding:4px 10px; border-radius:999px; font-size:10px; font-weight:700; letter-spacing:.3px; border:1px solid var(--border); }
    .status-pill.active { color:var(--green); border-color:rgba(0,200,83,.15); }
    .status-pill.blocked { color:var(--muted); border-color:rgba(255,255,255,.08); }
  `]
})
export class AdminDeliveryComponent {
  data  = inject(DataService);
  toast = inject(ToastService);
  search = signal('');
  adding = signal(false);
  newRider: Partial<DeliveryPerson> = { name: '', email: '', status: 'active', vehicles: 'Moto', deliveries: 0 };

  filtered = computed(() => {
    const term = this.search().toLowerCase().trim();
    return this.data.deliveryPeople().filter(rider =>
      !term || rider.name.toLowerCase().includes(term) || rider.email.toLowerCase().includes(term)
    );
  });

  openNew() {
    this.newRider = { name: '', email: '', status: 'active', vehicles: 'Moto', deliveries: 0 };
    this.adding.set(true);
  }

  saveRider() {
    if (!this.newRider.name || !this.newRider.email) return;
    const colors = ['#FF4500','#9C27B0','#2196F3','#E91E63','#FF9800','#00BCD4'];
    const newId = Math.max(...this.data.deliveryPeople().map(r => r.id)) + 1;
    const avatar = this.newRider.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);
    this.data.addDeliveryPerson({
      id: newId,
      name: this.newRider.name,
      email: this.newRider.email,
      status: this.newRider.status as 'active' | 'offline',
      deliveries: this.newRider.deliveries ?? 0,
      vehicles: this.newRider.vehicles ?? 'Moto',
      avatar,
      color: colors[newId % colors.length]
    });
    this.toast.show(`✅ ${this.newRider.name} criado!`, 'success');
    this.adding.set(false);
  }

  toggleStatus(rider: DeliveryPerson) {
    const updated: DeliveryPerson = { ...rider, status: rider.status === 'active' ? 'offline' : 'active' };
    this.data.updateDeliveryPerson(updated);
    this.toast.show(`${updated.name} ${updated.status === 'active' ? 'online' : 'offline'}`);
  }

  remove(rider: DeliveryPerson) {
    this.data.deleteDeliveryPerson(rider.id);
    this.toast.show(`🗑 ${rider.name} removido!`);
  }
}
