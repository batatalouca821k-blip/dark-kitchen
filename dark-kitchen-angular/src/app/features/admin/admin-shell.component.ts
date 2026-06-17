import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
  <div class="admin-shell">

    <!-- SIDEBAR -->
    <aside class="admin-sidebar" [class.collapsed]="sidebarCollapsed()">
      <div class="sidebar-brand" (click)="toggleSidebar()">
        <span class="sb-logo">🔥</span>
        <span class="sb-title" *ngIf="!sidebarCollapsed()">DARK KITCHEN</span>
        <span class="sb-collapse-btn" *ngIf="!sidebarCollapsed()">‹</span>
      </div>

      <nav class="sidebar-nav">
        <a class="sidebar-link" routerLink="/admin/dashboard" routerLinkActive="active">
          <span class="sl-icon">📊</span>
          <span class="sl-label" *ngIf="!sidebarCollapsed()">Dashboard</span>
        </a>
        <a class="sidebar-link" routerLink="/admin/orders" routerLinkActive="active">
          <span class="sl-icon">📦</span>
          <span class="sl-label" *ngIf="!sidebarCollapsed()">Pedidos</span>
          <span class="sl-badge" *ngIf="!sidebarCollapsed()">2</span>
        </a>
        <a class="sidebar-link" routerLink="/admin/cozinha" routerLinkActive="active">
          <span class="sl-icon">🍳</span>
          <span class="sl-label" *ngIf="!sidebarCollapsed()">Cozinha</span>
        </a>
        <a class="sidebar-link" routerLink="/admin/products" routerLinkActive="active">
          <span class="sl-icon">🍔</span>
          <span class="sl-label" *ngIf="!sidebarCollapsed()">Produtos</span>
        </a>
        <a class="sidebar-link" routerLink="/admin/stock" routerLinkActive="active">
          <span class="sl-icon">📋</span>
          <span class="sl-label" *ngIf="!sidebarCollapsed()">Estoque</span>
        </a>
        <a class="sidebar-link" routerLink="/admin/users" routerLinkActive="active">
          <span class="sl-icon">👥</span>
          <span class="sl-label" *ngIf="!sidebarCollapsed()">Clientes</span>
        </a>
        <a class="sidebar-link" routerLink="/admin/delivery" routerLinkActive="active">
          <span class="sl-icon">🛵</span>
          <span class="sl-label" *ngIf="!sidebarCollapsed()">Entregadores</span>
        </a>
        <a class="sidebar-link" routerLink="/admin/loyalty" routerLinkActive="active">
          <span class="sl-icon">⭐</span>
          <span class="sl-label" *ngIf="!sidebarCollapsed()">Fidelidade</span>
        </a>
        <a class="sidebar-link" routerLink="/admin/market" routerLinkActive="active">
          <span class="sl-icon">🏪</span>
          <span class="sl-label" *ngIf="!sidebarCollapsed()">Marketplace</span>
        </a>
      </nav>

      <div class="sidebar-footer" *ngIf="!sidebarCollapsed()">
        <div class="sf-avatar">CA</div>
        <div class="sf-info">
          <div class="sf-name">Carlos Admin</div>
          <div class="sf-role">Administrador</div>
        </div>
        <button class="sf-logout" (click)="auth.logout()" title="Sair">⏻</button>
      </div>
    </aside>

    <!-- MAIN CONTENT -->
    <main class="admin-main">
      <router-outlet />
    </main>

  </div>
  `,
  styles: [`
    .admin-shell { display:flex; min-height:100vh; background:var(--bg); }

    /* Sidebar */
    .admin-sidebar {
      width: 240px; flex-shrink: 0;
      background: var(--surface);
      border-right: 1px solid var(--border);
      display: flex; flex-direction: column;
      transition: width .25s ease;
      position: sticky; top: 0; height: 100vh; overflow: hidden;
    }
    .admin-sidebar.collapsed { width: 64px; }

    .sidebar-brand { display:flex; align-items:center; gap:10px; padding:18px 16px; border-bottom:1px solid var(--border); cursor:pointer; min-height:62px; }
    .sb-logo { font-size:22px; flex-shrink:0; }
    .sb-title { font-family:'Bebas Neue',cursive; font-size:20px; letter-spacing:2px; color:var(--accent); flex:1; white-space:nowrap; }
    .sb-collapse-btn { color:var(--muted); font-size:18px; cursor:pointer; }

    .sidebar-nav { flex:1; padding:12px 8px; display:flex; flex-direction:column; gap:2px; overflow-y:auto; }
    .sidebar-link { display:flex; align-items:center; gap:10px; padding:10px 10px; border-radius:var(--r); color:var(--muted); text-decoration:none; font-size:13px; font-weight:500; transition:all .2s; position:relative; white-space:nowrap; }
    .sidebar-link:hover { background:rgba(255,255,255,.04); color:var(--text); }
    .sidebar-link.active { background:rgba(255,69,0,.1); color:var(--accent); border:1px solid rgba(255,69,0,.2); }
    .sl-icon { font-size:18px; flex-shrink:0; width:24px; text-align:center; }
    .sl-label { flex:1; }
    .sl-badge { background:var(--accent); color:white; font-size:10px; font-weight:700; padding:1px 6px; border-radius:50px; min-width:18px; text-align:center; }

    .sidebar-footer { padding:12px 10px; border-top:1px solid var(--border); display:flex; align-items:center; gap:10px; }
    .sf-avatar { width:34px; height:34px; border-radius:50%; background:rgba(255,69,0,.15); border:1px solid rgba(255,69,0,.3); color:var(--accent); font-size:11px; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .sf-info { flex:1; min-width:0; }
    .sf-name { font-size:12px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .sf-role { font-size:10px; color:var(--muted); }
    .sf-logout { background:none; border:none; color:var(--muted); font-size:16px; cursor:pointer; transition:color .2s; flex-shrink:0; }
    .sf-logout:hover { color:#f44336; }

    /* Main */
    .admin-main { flex:1; min-width:0; padding:32px; overflow-y:auto; }

    @media(max-width:768px) {
      .admin-sidebar { position:fixed; z-index:100; height:100vh; }
      .admin-main { padding:16px; margin-left:64px; }
    }
  `]
})
export class AdminShellComponent {
  auth = inject(AuthService);
  sidebarCollapsed = signal(false);
  toggleSidebar() { this.sidebarCollapsed.update(v => !v); }
}
