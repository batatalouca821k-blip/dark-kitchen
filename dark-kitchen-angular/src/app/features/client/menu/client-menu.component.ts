import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../core/services/data.service';
import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import { Product } from '../../../core/models';
import { ProductModalComponent } from './product-modal.component';

@Component({
  selector: 'app-client-menu',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule, ProductModalComponent],
  template: `
  <div class="client-shell">

    <!-- HERO -->
    <div class="client-hero">
      <div class="hero-content">
        <div class="hero-greeting">BOA TARDE</div>
        <div class="hero-title">DARK<br>KITCHEN</div>
        <div class="hero-subtitle">🔥 Pedido mínimo R$ 25 · Entrega em ~30 min</div>
      </div>
      <div class="hero-badge">🟢 Aberto agora</div>
    </div>

    <div class="profile-card">
      <div class="profile-main">
        <div class="profile-avatar" [style.background]="(profileUser()?.color || '#FF9800') + '22'" [style.color]="profileUser()?.color || '#FF9800'">
          {{ profileUser()?.avatar || auth.userName().slice(0,2).toUpperCase() }}
        </div>
        <div class="profile-details">
          <div class="profile-name">{{ auth.userName() }}</div>
          <div class="profile-email">{{ profileUser()?.email || (auth.userName().toLowerCase().replace(' ', '.') + '@email.com') }}</div>
          <div class="profile-row">
            <span>Saldo disponível</span>
            <strong>R$ {{ availableCash() }} ,00</strong>
          </div>
          <div class="profile-row">
            <span>Pontos</span>
            <strong>{{ profileUser()?.pts ?? 0 }} pts</strong>
          </div>
        </div>
      </div>
      <button class="profile-edit-btn" routerLink="/profile" type="button">✏️ Editar</button>
    </div>

    <!-- POINTS BAR -->
    <div class="points-bar">
      <div class="points-icon">⭐</div>
      <div class="points-info">
        <div class="points-label">SEUS PONTOS</div>
        <div class="points-value">1.240 pts</div>
      </div>
      <div class="points-tier">🥇 OURO</div>
    </div>

    <!-- PROMOS -->
    <div class="promo-strip">
      <div class="promo-card promo-fire"><div class="promo-emoji">🔥</div><div><div class="promo-title">Smash da Sexta</div><div class="promo-sub">20% OFF · Código: <b>SMASH6</b></div></div></div>
      <div class="promo-card promo-pts"><div class="promo-emoji">⭐</div><div><div class="promo-title">2x Pontos Hoje!</div><div class="promo-sub">Pedido acima de R$ 50</div></div></div>
      <div class="promo-card promo-new"><div class="promo-emoji">🆕</div><div><div class="promo-title">Birria Tacos</div><div class="promo-sub">Edição limitada · Só esta semana</div></div></div>
    </div>

    <!-- SEARCH -->
    <div class="client-search-wrap">
      <input class="client-search" placeholder="🔍 Buscar no cardápio..." [(ngModel)]="searchTerm">
    </div>

    <!-- CATEGORIES -->
    <div class="categories-section">
      <div class="section-label">Categorias</div>
      <div class="category-pills">
        <div class="pill" [class.active]="activeCategory() === 'all'" (click)="activeCategory.set('all')">🍽️ Todos</div>
        <div class="pill" [class.active]="activeCategory() === 'destaque'" (click)="activeCategory.set('destaque')">⭐ Destaques</div>
        <div class="pill" [class.active]="activeCategory() === 'burger'" (click)="activeCategory.set('burger')">🍔 Burgers</div>
        <div class="pill" [class.active]="activeCategory() === 'pizza'" (click)="activeCategory.set('pizza')">🍕 Pizza</div>
        <div class="pill" [class.active]="activeCategory() === 'bowl'" (click)="activeCategory.set('bowl')">🥗 Bowls</div>
        <div class="pill" [class.active]="activeCategory() === 'tacos'" (click)="activeCategory.set('tacos')">🌮 Tacos</div>
        <div class="pill" [class.active]="activeCategory() === 'pasta'" (click)="activeCategory.set('pasta')">🍝 Massas</div>
        <div class="pill" [class.active]="activeCategory() === 'drink'" (click)="activeCategory.set('drink')">🥤 Bebidas</div>
        <div class="pill" [class.active]="activeCategory() === 'dessert'" (click)="activeCategory.set('dessert')">🍮 Sobremesas</div>
      </div>
    </div>

    <!-- FEATURED SCROLL -->
    <div class="products-section">
      <div class="client-section-header">
        <div class="section-label">🔥 Em Alta</div>
      </div>

      <div class="featured-scroll">
        <div class="featured-card" *ngFor="let p of featuredProducts()" (click)="openModal(p)">
          <div class="fc-badge" *ngIf="p.badge" [innerHTML]="p.badge"></div>
          <div class="fc-emoji">{{ p.emoji }}</div>
          <div class="fc-name">{{ p.name }}</div>
          <div class="fc-price">{{ data.formatPrice(p.price) }}</div>
          <div class="fc-time">{{ p.time }}</div>
          <button class="fc-add" (click)="quickAdd($event, p)">+</button>
        </div>
      </div>

      <!-- FULL MENU -->
      <div class="client-section-header" style="margin-top:20px">
        <div class="section-label">📋 Cardápio Completo</div>
      </div>

      <div class="products-grid">
        <ng-container *ngFor="let group of groupedProducts()">
          <div class="cat-divider"><span>{{ group.label }}</span></div>
          <div class="product-card" *ngFor="let p of group.items" (click)="openModal(p)">
            <div class="product-badge" *ngIf="p.badge" [innerHTML]="p.badge"></div>
            <div class="product-emoji">{{ p.emoji }}</div>
            <div class="product-info">
              <div class="product-name">{{ p.name }}</div>
              <div class="product-desc">{{ p.desc }}</div>
              <div class="product-stars" *ngIf="p.stars">
                {{ p.stars }} <span style="color:var(--muted);font-size:11px">({{ p.reviews }})</span>
              </div>
              <div class="product-footer">
                <span class="product-price">{{ data.formatPrice(p.price) }}</span>
                <span class="product-time">⏱ {{ p.time }}</span>
              </div>
            </div>
            <button class="add-btn" (click)="quickAdd($event, p)">+</button>
          </div>
        </ng-container>
      </div>
    </div>

    <!-- CART FAB -->
    <button class="cart-fab" routerLink="/checkout" *ngIf="cart.count() > 0">
      🛒 <span class="cart-count">{{ cart.count() }}</span>
      <span class="cart-total">{{ data.formatPrice(cart.total()) }}</span>
    </button>

    <!-- BOTTOM NAV -->
    <div class="client-bottom-nav">
      <button class="cbn-btn active"><div class="cbn-icon">🍽️</div><div class="cbn-label">Cardápio</div></button>
      <button class="cbn-btn cart-cbn" routerLink="/checkout" routerLinkActive="active">
        <div class="cbn-icon" style="position:relative">🛒
          <div class="cbn-badge" *ngIf="cart.count() > 0">{{ cart.count() }}</div>
        </div>
        <div class="cbn-label">Carrinho</div>
      </button>
      <button class="cbn-btn" routerLink="/tracking" routerLinkActive="active"><div class="cbn-icon">📍</div><div class="cbn-label">Pedido</div></button>
      <button class="cbn-btn" routerLink="/profile" routerLinkActive="active"><div class="cbn-icon">👤</div><div class="cbn-label">Perfil</div></button>
      <button class="cbn-btn" routerLink="/loyalty" routerLinkActive="active"><div class="cbn-icon">⭐</div><div class="cbn-label">Pontos</div></button>
    </div>

  </div>

  <!-- PRODUCT MODAL -->
  <app-product-modal [product]="selectedProduct()" (closed)="selectedProduct.set(null)"/>
  `,
  styles: [`
    .client-shell {  margin: 0 auto; position: relative; padding-top: 64px; padding-bottom: 80px; min-height: 100vh; }

    /* Hero */
    .client-hero { position: relative; height: 200px; overflow: hidden; background: linear-gradient(135deg, #1a0800 0%, #0d0000 50%, #0a0a0a 100%); }
    .client-hero::after { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at 30% 60%, rgba(255,69,0,.25) 0%, transparent 60%); }
    .hero-content { position: relative; z-index: 1; padding: 28px 20px; }
    .hero-greeting { font-size: 12px; color: var(--muted); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4px; }
    .hero-title { font-family: 'Bebas Neue', cursive; font-size: 48px; line-height: 1; letter-spacing: 2px; background: linear-gradient(135deg, #fff 40%, var(--accent2) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .hero-subtitle { font-size: 13px; color: var(--muted); margin-top: 6px; }
    .hero-badge { position: absolute; top: 24px; right: 20px; background: var(--accent); color: white; font-family: 'DM Mono', monospace; font-size: 11px; font-weight: 500; padding: 6px 12px; border-radius: 50px; box-shadow: 0 4px 20px rgba(255,69,0,.5); animation: pulse-badge 2s infinite; z-index: 1; }

    /* Points bar */
    .points-bar { margin: 0 16px; margin-top: -20px; position: relative; z-index: 2; background: var(--surface2); border: 1px solid var(--border); border-radius: var(--r2); padding: 14px 16px; display: flex; align-items: center; gap: 12px; }
    .points-icon { font-size: 24px; }
    .profile-card { margin: 0 16px 18px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--r2); padding: 16px; display:flex; align-items:center; justify-content:space-between; gap:16px; }
    .profile-main { display:flex; align-items:center; gap:14px; flex:1; }
    .profile-avatar { width:62px; height:62px; border-radius:18px; display:flex; align-items:center; justify-content:center; font-size:22px; font-weight:800; border:1px solid var(--border); }
    .profile-details { min-width:0; }
    .profile-name { font-size:15px; font-weight:700; }
    .profile-email { font-size:11px; color:var(--muted); margin-bottom:10px; }
    .profile-row { display:flex; align-items:center; justify-content:space-between; gap:12px; font-size:12px; color:var(--muted); margin-top:6px; }
    .profile-row strong { color: var(--text); font-weight:700; }
    .profile-edit-btn { flex-shrink:0; padding:10px 12px; border-radius:12px; border:none; background:var(--accent); color:white; cursor:pointer; font-size:12px; font-weight:700; }
    .points-info { flex: 1; }
    .points-label { font-size: 11px; color: var(--muted); margin-bottom: 2px; }
    .points-value { font-family: 'Bebas Neue', cursive; font-size: 22px; color: var(--gold); letter-spacing: 1px; }
    .points-tier { background: linear-gradient(135deg, var(--gold), #FF9800); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 11px; font-weight: 600; }

    /* Promos */
    .promo-strip { display: flex; gap: 10px; padding: 16px 16px 4px; overflow-x: auto; scrollbar-width: none; }
    .promo-strip::-webkit-scrollbar { display: none; }
    .promo-card { flex-shrink: 0; display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 12px; border: 1px solid; min-width: 180px; }
    .promo-fire { background: rgba(255,69,0,.08); border-color: rgba(255,69,0,.2); }
    .promo-pts  { background: rgba(255,184,0,.08); border-color: rgba(255,184,0,.2); }
    .promo-new  { background: rgba(0,200,83,.08);  border-color: rgba(0,200,83,.2); }
    .promo-emoji { font-size: 24px; }
    .promo-title { font-size: 12px; font-weight: 700; }
    .promo-sub { font-size: 11px; color: var(--muted); }

    /* Search */
    .client-search-wrap { padding: 12px 16px 4px; }
    .client-search { width: 100%; background: var(--surface); border: 1px solid var(--border); border-radius: 50px; padding: 12px 18px; color: var(--text); font-family: 'DM Sans', sans-serif; font-size: 14px; outline: none; transition: border-color .2s; }
    .client-search:focus { border-color: rgba(255,69,0,.5); }

    /* Categories */
    .categories-section { padding: 20px 16px 8px; }
    .section-label { font-size: 11px; color: var(--muted); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 12px; }
    .category-pills { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; scrollbar-width: none; }
    .category-pills::-webkit-scrollbar { display: none; }
    .pill { flex-shrink: 0; padding: 8px 16px; border-radius: 50px; font-size: 13px; font-weight: 500; border: 1px solid var(--border); background: var(--surface2); color: var(--muted); cursor: pointer; transition: all .2s; white-space: nowrap; }
    .pill.active, .pill:hover { background: var(--accent); border-color: var(--accent); color: white; box-shadow: 0 4px 16px rgba(255,69,0,.3); }

    /* Featured */
    .products-section { padding: 8px 16px 100px; }
    .client-section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
    .featured-scroll { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 8px; scrollbar-width: none; margin-bottom: 4px; }
    .featured-scroll::-webkit-scrollbar { display: none; }
    .featured-card { flex-shrink: 0; width: 130px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--r2); padding: 14px 12px 12px; display: flex; flex-direction: column; align-items: center; cursor: pointer; transition: all .2s; position: relative; overflow: hidden; }
    .featured-card:hover { border-color: rgba(255,69,0,.4); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,.3); }
    .fc-badge { position: absolute; top: 8px; left: 8px; background: var(--accent); color: white; font-size: 9px; font-weight: 800; padding: 2px 8px; border-radius: 50px; letter-spacing: .5px; }
    .fc-emoji { font-size: 36px; margin: 8px 0 6px; }
    .fc-name { font-size: 11px; font-weight: 600; text-align: center; line-height: 1.3; margin-bottom: 4px; }
    .fc-price { font-family: 'DM Mono', monospace; font-size: 12px; color: var(--accent2); margin-bottom: 2px; }
    .fc-time { font-size: 10px; color: var(--muted); margin-bottom: 8px; }
    .fc-add { width: 28px; height: 28px; border-radius: 50%; background: var(--accent); border: none; color: white; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all .2s; margin-top: auto; }
    .fc-add:hover { transform: scale(1.15); box-shadow: 0 4px 14px rgba(255,69,0,.5); }

    /* Products grid */
    .products-grid { display: flex; flex-direction: column; gap: 12px; }
    .cat-divider { display: flex; align-items: center; gap: 10px; padding: 16px 0 8px; margin-top: 4px; }
    .cat-divider span { font-size: 13px; font-weight: 700; color: var(--text); letter-spacing: .5px; }
    .cat-divider::after { content: ''; flex: 1; height: 1px; background: var(--border); }

    .product-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r2); padding: 14px; display: flex; gap: 14px; align-items: center; cursor: pointer; transition: all .25s; position: relative; overflow: hidden; }
    .product-card:hover { border-color: rgba(255,69,0,.3); transform: translateY(-1px); }
    .product-badge { position: absolute; top: 10px; right: 10px; background: var(--gold); color: #000; font-size: 9px; font-weight: 700; padding: 2px 8px; border-radius: 50px; letter-spacing: 1px; text-transform: uppercase; }
    .product-emoji { width: 64px; height: 64px; border-radius: 12px; background: var(--surface2); display: flex; align-items: center; justify-content: center; font-size: 32px; flex-shrink: 0; border: 1px solid var(--border); }
    .product-info { flex: 1; }
    .product-name { font-size: 15px; font-weight: 600; margin-bottom: 4px; }
    .product-desc { font-size: 12px; color: var(--muted); line-height: 1.4; margin-bottom: 8px; }
    .product-stars { font-size: 11px; color: var(--gold); margin-bottom: 6px; }
    .product-footer { display: flex; align-items: center; justify-content: space-between; }
    .product-price { font-family: 'DM Mono', monospace; font-size: 15px; font-weight: 500; color: var(--accent2); }
    .product-time { font-size: 11px; color: var(--muted); }
    .add-btn { width: 30px; height: 30px; border-radius: 50%; background: var(--accent); border: none; color: white; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all .2s; flex-shrink: 0; }
    .add-btn:hover { transform: scale(1.1); box-shadow: 0 4px 16px rgba(255,69,0,.5); }

    /* Cart FAB */
    .cart-fab { position: fixed; bottom: 72px; left: 50%; transform: translateX(-50%); background: var(--accent); color: white; border: none; border-radius: 50px; padding: 16px 28px; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 10px; box-shadow: 0 8px 32px rgba(255,69,0,.5); transition: all .25s; z-index: 50; white-space: nowrap; }
    .cart-fab:hover { transform: translateX(-50%) translateY(-2px); }
    .cart-count { background: white; color: var(--accent); border-radius: 50px; padding: 2px 8px; font-size: 12px; font-weight: 700; }
    .cart-total { font-family: 'DM Mono', monospace; }

    /* Bottom nav */
    .client-bottom-nav { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: 100%; max-width: 420px; background: rgba(10,10,10,.95); backdrop-filter: blur(20px); border-top: 1px solid var(--border); display: flex; padding: 8px 0; z-index: 90; }
    .cbn-btn { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 6px 4px; background: none; border: none; color: var(--muted); cursor: pointer; transition: all .2s; position: relative; }
    .cbn-btn.active { color: var(--accent); }
    .cbn-icon { font-size: 20px; }
    .cbn-label { font-size: 10px; font-weight: 600; letter-spacing: .3px; }
    .cbn-badge { position: absolute; top: 2px; right: calc(50% - 20px); background: var(--accent); color: white; font-size: 9px; font-weight: 800; width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
  `]
})
export class ClientMenuComponent {
  data  = inject(DataService);
  cart  = inject(CartService);
  toast = inject(ToastService);
  auth  = inject(AuthService);

  searchTerm = '';
  availableCash = signal(100);
  profileUser = computed(() => this.data.users().find(u => u.name === this.auth.userName()));
  activeCategory = signal('all');
  selectedProduct = signal<Product | null>(null);

  featuredProducts = computed(() =>
    this.data.products().filter(p => p.cat.includes('destaque')).slice(0, 5)
  );

  categoryGroups = [
    { id: 'burger',  label: '🍔 Burgers'  },
    { id: 'pizza',   label: '🍕 Pizzas'   },
    { id: 'bowl',    label: '🥗 Bowls'    },
    { id: 'tacos',   label: '🌮 Tacos'    },
    { id: 'pasta',   label: '🍝 Massas'   },
    { id: 'drink',   label: '🥤 Bebidas'  },
    { id: 'dessert', label: '🍮 Sobremesas'},
  ];

  groupedProducts = computed(() => {
    const cat = this.activeCategory();
    const term = this.searchTerm.toLowerCase().trim();
    const filtered = this.data.products().filter(p => {
      const matchCat = cat === 'all' || p.cat.includes(cat);
      const matchTerm = !term || p.name.toLowerCase().includes(term) || p.desc.toLowerCase().includes(term);
      return matchCat && matchTerm;
    });

    if (cat !== 'all' && cat !== 'destaque') {
      const grp = this.categoryGroups.find(g => g.id === cat);
      return [{ label: grp?.label ?? cat, items: filtered }];
    }
    return this.categoryGroups
      .map(g => ({ label: g.label, items: filtered.filter(p => p.cat.includes(g.id)) }))
      .filter(g => g.items.length > 0);
  });

  openModal(p: Product) { this.selectedProduct.set(p); }

  quickAdd(e: Event, p: Product) {
    e.stopPropagation();
    this.cart.add({ id: p.id, name: p.name, emoji: p.emoji, price: p.price });
    this.toast.show(`✅ ${p.name} adicionado!`, 'success');
  }
}
