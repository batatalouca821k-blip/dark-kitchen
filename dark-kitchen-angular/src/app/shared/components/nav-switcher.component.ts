import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-nav-switcher',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="nav-switcher" *ngIf="auth.isLoggedIn">
      <div class="brand">DARK KITCHEN</div>
      <div class="tabs">
        <button class="tab" routerLink="/client"   routerLinkActive="active" *ngIf="auth.role() === 'client'">🛍 Cardápio</button>
        <button class="tab" routerLink="/checkout" routerLinkActive="active" *ngIf="auth.role() === 'client'">🛒 Carrinho</button>
        <button class="tab" routerLink="/tracking" routerLinkActive="active" *ngIf="auth.role() === 'client'">📍 Pedido</button>
        <button class="tab" routerLink="/loyalty"  routerLinkActive="active" *ngIf="auth.role() === 'client'">⭐ Pontos</button>
        <button class="tab" routerLink="/admin"    routerLinkActive="active" *ngIf="auth.role() === 'admin'">🎛 Admin</button>
        <button class="tab" (click)="auth.logout()">🔑 Sair</button>
      </div>
    </nav>
  `,
  styles: [`
    .nav-switcher {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 20px;
      background: rgba(8,8,8,.92); backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--border);
    }
    .brand { font-family: 'Bebas Neue', cursive; font-size: 24px; letter-spacing: 3px; color: var(--accent); text-shadow: 0 0 20px rgba(255,69,0,.4); }
    .tabs { display: flex; gap: 4px; background: var(--surface2); border-radius: 50px; padding: 4px; }
    .tab { padding: 7px 18px; border-radius: 50px; border: none; background: transparent; color: var(--muted); font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; transition: all .25s; }
    .tab.active, .tab:hover { background: var(--accent); color: white; box-shadow: 0 0 20px rgba(255,69,0,.3); }
  `]
})
export class NavSwitcherComponent {
  auth = inject(AuthService);
}
