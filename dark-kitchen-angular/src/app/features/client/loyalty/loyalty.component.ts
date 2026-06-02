import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService } from '../../../core/services/data.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-loyalty',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
  <div class="loyalty-shell">

    <!-- Hero -->
    <div class="loyalty-hero">
      <div class="loyalty-hero-glow"></div>
      <button class="loy-back" routerLink="/client">← Voltar</button>

      <div class="loyalty-tier-ring">
        <div class="ltr-inner">
          <div class="ltr-emoji">🥇</div>
          <div class="ltr-tier">OURO</div>
        </div>
      </div>

      <div class="loyalty-pts-big">{{ userPoints() | number:'1.0-0' }}</div>
      <div class="loyalty-pts-label">pontos disponíveis</div>

      <div class="loyalty-progress-wrap">
        <div class="loyalty-progress-label">
          <span>Ouro</span>
          <span>760 pts para Platina</span>
        </div>
        <div class="loyalty-progress-bg">
          <div class="loyalty-progress-fill" style="width:62%"></div>
        </div>
        <div class="loyalty-progress-sub">⭐ 2.000 pts = nível Platina</div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="loy-tabs">
      <button class="loy-tab" [class.active]="activeTab() === 'resgates'" (click)="activeTab.set('resgates')">🎁 Resgates</button>
      <button class="loy-tab" [class.active]="activeTab() === 'tiers'" (click)="activeTab.set('tiers')">🏆 Tiers</button>
      <button class="loy-tab" [class.active]="activeTab() === 'historico'" (click)="activeTab.set('historico')">📊 Histórico</button>
    </div>

    <!-- RESGATES -->
    <div class="loy-section" [class.active]="activeTab() === 'resgates'">
      <div class="loy-section-title">Recompensas disponíveis</div>

      <div class="redeem-cats">
        <div class="rc-pill" [class.active]="redeemCat() === 'todos'" (click)="redeemCat.set('todos')">🎁 Todos</div>
        <div class="rc-pill" [class.active]="redeemCat() === 'comida'" (click)="redeemCat.set('comida')">🍔 Comida</div>
        <div class="rc-pill" [class.active]="redeemCat() === 'desconto'" (click)="redeemCat.set('desconto')">🏷️ Descontos</div>
        <div class="rc-pill" [class.active]="redeemCat() === 'especial'" (click)="redeemCat.set('especial')">✨ Especiais</div>
      </div>

      <div class="redeem-grid">
        <ng-container *ngFor="let r of filteredRewards()">
          <div class="redeem-card" [class.featured-reward]="r.featured">
            <div class="rc-top">
              <div class="rc-emoji">{{ r.emoji }}</div>
              <div class="rc-pts-badge" [class.affordable]="userPoints() >= r.pts">{{ r.pts }} pts</div>
            </div>
            <div class="rc-name">{{ r.name }}</div>
            <div class="rc-desc">{{ r.desc }}</div>
            <div class="rc-valid" *ngIf="r.valid">✓ {{ r.valid }}</div>
            <button class="rc-redeem-btn"
                    [disabled]="userPoints() < r.pts"
                    (click)="redeem(r)">
              {{ userPoints() >= r.pts ? 'Resgatar' : '🔒 Insuficiente' }}
            </button>
          </div>
        </ng-container>
      </div>
    </div>

    <!-- TIERS -->
    <div class="loy-section" [class.active]="activeTab() === 'tiers'">
      <div class="loy-section-title">Programa de fidelidade</div>
      <div class="tier-cards">
        <div class="tier-card" *ngFor="let t of tiers" [class.active-tier]="t.active">
          <div class="tc-current-badge" *ngIf="t.active">✓ SEU TIER</div>
          <div class="tc-icon">{{ t.icon }}</div>
          <div class="tc-name">{{ t.name }}</div>
          <div class="tc-range">{{ t.range }}</div>
          <div class="tc-perks">
            <div class="tc-perk" *ngFor="let p of t.perks">✓ {{ p }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- HISTÓRICO -->
    <div class="loy-section" [class.active]="activeTab() === 'historico'">
      <div class="pts-balance-row">
        <div class="pts-bal-item"><div class="pts-bal-val" style="color:var(--green)">2.180</div><div class="pts-bal-label">Ganhos</div></div>
        <div class="pts-bal-divider"></div>
        <div class="pts-bal-item"><div class="pts-bal-val" style="color:var(--accent)">940</div><div class="pts-bal-label">Resgatados</div></div>
        <div class="pts-bal-divider"></div>
        <div class="pts-bal-item"><div class="pts-bal-val" style="color:var(--gold)">{{ userPoints() }}</div><div class="pts-bal-label">Disponíveis</div></div>
      </div>

      <div class="pts-history">
        <div class="ph-item" *ngFor="let h of history">
          <div class="ph-dot" [class]="h.type"></div>
          <div class="ph-info">
            <div class="ph-title">{{ h.title }}</div>
            <div class="ph-date">{{ h.date }}</div>
          </div>
          <div class="ph-pts" [style.color]="h.type === 'spent' ? '#f44336' : 'var(--green)'">
            {{ h.type === 'spent' ? '-' : '+' }}{{ h.pts }}
          </div>
        </div>
      </div>
    </div>

  </div>
  `,
  styles: [`
    .loyalty-shell { max-width: 480px; margin: 0 auto; padding-top: 64px; padding-bottom: 40px; }

    /* Hero */
    .loyalty-hero { position: relative; background: linear-gradient(160deg, #1a0800 0%, #0d0a00 40%, #080808 100%); padding: 20px 20px 32px; text-align: center; overflow: hidden; }
    .loyalty-hero-glow { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 0%, rgba(255,184,0,.2) 0%, transparent 65%); }
    .loy-back { position: absolute; top: 16px; left: 16px; background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1); border-radius: 50px; color: var(--muted); font-family: 'DM Sans', sans-serif; font-size: 12px; padding: 6px 14px; cursor: pointer; transition: all .2s; z-index: 1; }
    .loyalty-tier-ring { width: 80px; height: 80px; border-radius: 50%; background: conic-gradient(var(--gold) 0% 62%, var(--border) 62% 100%); display: flex; align-items: center; justify-content: center; margin: 20px auto 12px; position: relative; z-index: 1; }
    .ltr-inner { width: 64px; height: 64px; border-radius: 50%; background: #0d0a00; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; }
    .ltr-emoji { font-size: 24px; }
    .ltr-tier { font-size: 8px; font-weight: 800; letter-spacing: 1.5px; color: var(--gold); }
    .loyalty-pts-big { font-family: 'Bebas Neue', cursive; font-size: 64px; letter-spacing: 2px; color: var(--gold); text-shadow: 0 0 40px rgba(255,184,0,.4); line-height: 1; position: relative; z-index: 1; }
    .loyalty-pts-label { font-size: 13px; color: rgba(255,255,255,.5); margin-bottom: 20px; position: relative; z-index: 1; }
    .loyalty-progress-wrap { position: relative; z-index: 1; background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08); border-radius: 14px; padding: 14px; text-align: left; }
    .loyalty-progress-label { display: flex; justify-content: space-between; font-size: 11px; color: rgba(255,255,255,.5); margin-bottom: 8px; }
    .loyalty-progress-bg { height: 6px; background: rgba(255,255,255,.1); border-radius: 3px; overflow: hidden; margin-bottom: 6px; }
    .loyalty-progress-fill { height: 100%; background: linear-gradient(90deg, var(--gold), #FF9800); border-radius: 3px; }
    .loyalty-progress-sub { font-size: 11px; color: var(--gold); font-weight: 600; }

    /* Tabs */
    .loy-tabs { display: flex; padding: 16px 16px 0; gap: 6px; border-bottom: 1px solid var(--border); }
    .loy-tab { flex: 1; padding: 10px 8px; background: none; border: none; border-bottom: 2px solid transparent; color: var(--muted); font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; transition: all .2s; text-align: center; margin-bottom: -1px; }
    .loy-tab.active { color: var(--gold); border-bottom-color: var(--gold); }

    .loy-section { display: none; padding: 16px; }
    .loy-section.active { display: block; }
    .loy-section-title { font-size: 12px; color: var(--muted); letter-spacing: 1.5px; text-transform: uppercase; font-weight: 600; margin-bottom: 14px; }

    /* Redeems */
    .redeem-cats { display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none; margin-bottom: 16px; }
    .redeem-cats::-webkit-scrollbar { display: none; }
    .rc-pill { flex-shrink: 0; padding: 6px 14px; border-radius: 50px; border: 1px solid var(--border); background: var(--surface2); color: var(--muted); font-size: 12px; font-weight: 600; cursor: pointer; transition: all .2s; white-space: nowrap; }
    .rc-pill.active { background: rgba(255,184,0,.12); border-color: rgba(255,184,0,.3); color: var(--gold); }
    .redeem-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .redeem-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 14px; display: flex; flex-direction: column; gap: 6px; transition: all .2s; }
    .redeem-card:hover { border-color: rgba(255,184,0,.3); transform: translateY(-2px); }
    .featured-reward { background: linear-gradient(135deg, rgba(255,184,0,.06), rgba(255,69,0,.03)); border-color: rgba(255,184,0,.2); }
    .rc-top { display: flex; align-items: center; justify-content: space-between; }
    .rc-emoji { font-size: 26px; }
    .rc-pts-badge { font-family: 'DM Mono', monospace; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 50px; background: rgba(102,102,102,.15); color: var(--muted); }
    .rc-pts-badge.affordable { background: rgba(0,200,83,.12); color: var(--green); }
    .rc-name { font-size: 13px; font-weight: 700; line-height: 1.3; }
    .rc-desc { font-size: 11px; color: var(--muted); line-height: 1.4; flex: 1; }
    .rc-valid { font-size: 10px; color: rgba(0,200,83,.7); font-weight: 600; }
    .rc-redeem-btn { width: 100%; padding: 8px; border-radius: 10px; border: none; background: rgba(255,184,0,.15); color: var(--gold); font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 700; cursor: pointer; transition: all .2s; }
    .rc-redeem-btn:hover:not(:disabled) { background: var(--gold); color: #000; }
    .rc-redeem-btn:disabled { opacity: .4; cursor: not-allowed; }

    /* Tiers */
    .tier-cards { display: flex; flex-direction: column; gap: 12px; }
    .tier-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r2); padding: 16px; display: flex; align-items: flex-start; gap: 12px; position: relative; }
    .active-tier { border-color: rgba(255,184,0,.35); background: linear-gradient(135deg, rgba(255,184,0,.06), rgba(255,100,0,.03)); }
    .tc-current-badge { position: absolute; top: 10px; right: 10px; background: var(--gold); color: #000; font-size: 9px; font-weight: 800; padding: 2px 10px; border-radius: 50px; letter-spacing: .5px; }
    .tc-icon { font-size: 32px; flex-shrink: 0; }
    .tc-name { font-family: 'Bebas Neue', cursive; font-size: 20px; letter-spacing: 1px; }
    .tc-range { font-family: 'DM Mono', monospace; font-size: 11px; color: var(--muted); margin-bottom: 8px; }
    .tc-perks { display: flex; flex-direction: column; gap: 4px; }
    .tc-perk { font-size: 12px; color: var(--muted); }
    .active-tier .tc-perk { color: var(--text); }

    /* History */
    .pts-balance-row { display: flex; background: var(--surface); border: 1px solid var(--border); border-radius: 14px; overflow: hidden; margin-bottom: 20px; }
    .pts-bal-item { flex: 1; padding: 16px 12px; text-align: center; }
    .pts-bal-val { font-family: 'Bebas Neue', cursive; font-size: 28px; letter-spacing: 1px; line-height: 1; }
    .pts-bal-label { font-size: 11px; color: var(--muted); margin-top: 4px; }
    .pts-bal-divider { width: 1px; background: var(--border); }
    .pts-history { display: flex; flex-direction: column; }
    .ph-item { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--border); }
    .ph-item:last-child { border-bottom: none; }
    .ph-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .ph-dot.earned { background: var(--green); box-shadow: 0 0 8px rgba(0,200,83,.4); }
    .ph-dot.spent  { background: #f44336; box-shadow: 0 0 8px rgba(244,67,54,.4); }
    .ph-info { flex: 1; }
    .ph-title { font-size: 13px; font-weight: 500; }
    .ph-date  { font-size: 11px; color: var(--muted); margin-top: 2px; font-family: 'DM Mono', monospace; }
    .ph-pts   { font-family: 'DM Mono', monospace; font-size: 14px; font-weight: 700; flex-shrink: 0; }
  `]
})
export class LoyaltyComponent {
  data  = inject(DataService);
  toast = inject(ToastService);

  userPoints = signal(1240);
  activeTab   = signal('resgates');
  redeemCat   = signal('todos');

  filteredRewards = computed(() => {
    const cat = this.redeemCat();
    return this.data.rewards().filter(r => cat === 'todos' || r.cat === cat);
  });

  redeem(r: { name: string; pts: number }) {
    if (this.userPoints() < r.pts) {
      this.toast.show('❌ Pontos insuficientes!');
      return;
    }
    this.userPoints.update(v => v - r.pts);
    this.toast.show(`🎉 "${r.name}" resgatado!`, 'success');
  }

  tiers = [
    { icon: '🥉', name: 'BRONZE',  range: '0 – 499 pts',    active: false, perks: ['1 pt por R$ 1', 'Acesso ao cardápio completo'] },
    { icon: '🥈', name: 'PRATA',   range: '500 – 999 pts',   active: false, perks: ['1.5 pts por R$ 1', 'Frete grátis 1×/mês', 'Acesso a promoções exclusivas'] },
    { icon: '🥇', name: 'OURO',    range: '1.000 – 1.999 pts', active: true, perks: ['2 pts por R$ 1', 'Frete grátis 3×/mês', 'Desconto de aniversário 15%', 'Suporte prioritário'] },
    { icon: '💎', name: 'PLATINA', range: '2.000+ pts',       active: false, perks: ['3 pts por R$ 1', 'Frete grátis ilimitado', '20% OFF permanente', 'Brindes exclusivos', 'Atendimento VIP'] },
  ];

  history = [
    { type: 'earned', title: 'Smash Burger Duplo', date: '25/05/2026 · 14:32', pts: 40 },
    { type: 'earned', title: 'Bônus Primeiro Pedido do Mês', date: '25/05/2026 · 00:01', pts: 100 },
    { type: 'spent',  title: 'Resgate: Frete Grátis', date: '22/05/2026 · 19:45', pts: 200 },
    { type: 'earned', title: 'Pizza Margherita + Shake', date: '20/05/2026 · 20:10', pts: 69 },
    { type: 'earned', title: 'Bônus Aniversário 🎂', date: '15/05/2026', pts: 500 },
  ];
}
