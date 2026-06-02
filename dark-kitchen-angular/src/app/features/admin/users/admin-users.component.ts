import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../core/services/data.service';
import { ToastService } from '../../../core/services/toast.service';
import { AppUser } from '../../../core/models';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div>
    <div class="admin-page-title">CLIENTES</div>
    <div class="admin-subtitle">Gestão de clientes e administradores</div>

    <div class="toolbar" style="flex-wrap:wrap; gap:10px;">
      <div style="display:flex;gap:8px; align-items:center;">
        <button class="tab-btn" [class.active]="filterRole() === 'all'" (click)="filterRole.set('all')">Todos</button>
        <button class="tab-btn" [class.active]="filterRole() === 'client'" (click)="filterRole.set('client')">Clientes</button>
        <button class="tab-btn" [class.active]="filterRole() === 'admin'" (click)="filterRole.set('admin')">Admins</button>
      </div>
      <input class="search-input" [ngModel]="search()" (ngModelChange)="search.set($event)" placeholder="🔍 Buscar usuário...">
      <button class="btn-primary" (click)="openNew()">+ Novo Usuário</button>
    </div>

    <div class="users-list">
      <div class="user-row" *ngFor="let u of filtered()">
        <div class="user-avatar" [style.background]="u.color + '22'" [style.borderColor]="u.color + '44'">
          <span [style.color]="u.color">{{ u.avatar }}</span>
        </div>
        <div class="user-info">
          <div class="user-name">{{ u.name }}</div>
          <div class="user-email">{{ u.email }}</div>
        </div>
        <div class="user-meta">
          <div class="user-tier-badge" [class]="'user-tier-badge tier-' + u.tier">{{ tierIcon(u.tier) }} {{ u.tier | uppercase }}</div>
          <div style="font-size:11px;color:var(--muted);margin-top:3px">{{ u.pts }} pts · {{ u.orders }} pedidos</div>
        </div>
        <div>
          <span class="status-pill" [class.active]="u.status==='active'" [class.blocked]="u.status==='blocked'">
            {{ u.status === 'active' ? '● Ativo' : '✕ Bloqueado' }}
          </span>
        </div>
        <div style="display:flex;gap:6px">
          <button class="icon-btn" (click)="toggleStatus(u)" [title]="u.status==='active'?'Bloquear':'Ativar'">
            {{ u.status === 'active' ? '🚫' : '✓' }}
          </button>
          <button class="icon-btn danger" (click)="remove(u)" title="Remover">🗑</button>
        </div>
      </div>
    </div>

    <!-- New user modal -->
    <div class="confirm-overlay" [class.open]="adding()">
      <div class="confirm-modal" style="max-width:420px;text-align:left">
        <div style="font-family:'Bebas Neue',cursive;font-size:22px;letter-spacing:1px;margin-bottom:18px">NOVO USUÁRIO</div>
        <div style="margin-bottom:12px">
          <label class="auth-label">Nome</label>
          <input class="auth-input" [(ngModel)]="newUser.name" placeholder="Nome completo">
        </div>
        <div style="margin-bottom:12px">
          <label class="auth-label">Email</label>
          <input class="auth-input" [(ngModel)]="newUser.email" placeholder="email@exemplo.com">
        </div>
        <div style="margin-bottom:20px">
          <label class="auth-label">Perfil</label>
          <select class="auth-input" [(ngModel)]="newUser.role">
            <option value="client">Cliente</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn-secondary" style="flex:1" (click)="adding.set(false)">Cancelar</button>
          <button class="btn-primary" style="flex:1" (click)="saveUser()">Criar</button>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .toolbar { display:flex; gap:12px; margin-bottom:20px; }
    .tab-btn { border:1px solid var(--border); border-radius:999px; background: var(--surface2); color: var(--muted); font-size:11px; font-weight:700; padding:8px 12px; cursor:pointer; transition:all .2s; }
    .tab-btn.active { background: var(--accent); border-color: var(--accent); color: white; }
    .users-list { background:var(--surface); border:1px solid var(--border); border-radius:var(--r2); overflow:hidden; }
    .user-row { display:flex; align-items:center; gap:14px; padding:14px 16px; border-bottom:1px solid var(--border); transition:background .15s; }
    .user-row:last-child { border-bottom:none; }
    .user-row:hover { background:rgba(255,255,255,.02); }
    .user-avatar { width:44px; height:44px; border-radius:50%; border:1px solid; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:700; flex-shrink:0; }
    .user-info { flex:1; min-width:0; }
    .user-name { font-size:14px; font-weight:600; }
    .user-email { font-size:12px; color:var(--muted); margin-top:2px; }
    .user-meta { min-width:140px; }
    .user-tier-badge { font-size:10px; font-weight:700; padding:3px 10px; border-radius:50px; display:inline-block; }
    .tier-bronze  { background:rgba(205,127,50,.1);  color:#cd7f32; }
    .tier-silver  { background:rgba(176,176,176,.1); color:#b0b0b0; }
    .tier-gold    { background:rgba(255,184,0,.12);  color:var(--gold); }
    .tier-platinum{ background:rgba(100,200,255,.1); color:#64c8ff; }
  `]
})
export class AdminUsersComponent {
  data  = inject(DataService);
  toast = inject(ToastService);
  search = signal('');
  filterRole = signal<'all' | 'client' | 'admin'>('all');
  adding = signal(false);
  newUser: any = { name: '', email: '', role: 'client' };

  filtered = computed(() => {
    const t = this.search().toLowerCase();
    return this.data.users().filter(u =>
      (this.filterRole() === 'all' || u.role === this.filterRole()) &&
      (!t || u.name.toLowerCase().includes(t) || u.email.toLowerCase().includes(t))
    );
  });

  tierIcon(t: string) {
    return { bronze:'🥉', silver:'🥈', gold:'🥇', platinum:'💎' }[t] ?? '';
  }

  toggleStatus(u: AppUser) {
    const updated = { ...u, status: u.status === 'active' ? 'blocked' as const : 'active' as const };
    this.data.updateUser(updated);
    this.toast.show(`${updated.status === 'active' ? '✅' : '🚫'} ${u.name} ${updated.status === 'active' ? 'ativado' : 'bloqueado'}!`);
  }

  remove(u: AppUser) {
    this.data.deleteUser(u.id);
    this.toast.show(`🗑 ${u.name} removido!`);
  }

  openNew() {
    this.newUser = { name: '', email: '', role: 'client' };
    this.adding.set(true);
  }

  saveUser() {
    if (!this.newUser.name || !this.newUser.email) return;
    const colors = ['#FF4500','#9C27B0','#2196F3','#E91E63','#FF9800','#00BCD4'];
    const newId = Math.max(...this.data.users().map(u => u.id)) + 1;
    const initials = this.newUser.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    this.data.addUser({
      id: newId, name: this.newUser.name, email: this.newUser.email,
      role: this.newUser.role, status: 'active', pts: 0, orders: 0,
      tier: 'bronze', avatar: initials, color: colors[newId % colors.length]
    });
    this.toast.show(`✅ ${this.newUser.name} criado!`, 'success');
    this.adding.set(false);
  }
}
