import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../../core/services/data.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div>
    <div class="admin-page-title">DASHBOARD</div>
    <div class="admin-subtitle">Visão geral · hoje, {{ today }}</div>

    <!-- KPIs -->
    <div class="kpi-grid">
      <div class="kpi-card" *ngFor="let k of kpis()">
        <div class="kpi-label">{{ k.label }}</div>
        <div class="kpi-value" [style.color]="k.color">{{ k.value }}</div>
        <div class="kpi-delta">{{ k.delta }}</div>
        <div class="kpi-icon">{{ k.icon }}</div>
      </div>
    </div>

    <!-- Charts row -->
    <div class="db-charts-row">
      <!-- Revenue bar chart -->
      <div class="chart-section" style="flex:2">
        <div class="chart-header">
          <div class="chart-title">Faturamento</div>
          <div class="chart-header-right">
            <div class="chart-periods">
              <button class="db-period-btn" [class.active]="selectedPeriod() === '7d'" (click)="selectPeriod('7d')">7d</button>
              <button class="db-period-btn" [class.active]="selectedPeriod() === '30d'" (click)="selectPeriod('30d')">30d</button>
            </div>
            <button class="info-icon" [attr.data-tooltip]="revenueTooltip()">ℹ️</button>
          </div>
        </div>
        <div class="bar-chart">
          <div class="bar-wrap" *ngFor="let b of barData()">
            <div class="bar-val">{{ b.val }}</div>
            <div class="bar" [style.height.px]="b.h"></div>
            <div class="bar-label">{{ b.label }}</div>
          </div>
        </div>
      </div>

      <!-- Top products -->
      <div class="chart-section" style="flex:1">
        <div class="chart-header"><div class="chart-title">🏆 Top Produtos</div></div>
        <div class="db-ranking">
          <div class="db-rank-item" *ngFor="let p of topProducts; let i = index">
            <div class="db-rank-pos" [class.gold]="i===0" [class.silver]="i===1" [class.bronze]="i===2">{{ i+1 }}</div>
            <div class="db-rank-emoji">{{ p.emoji }}</div>
            <div class="db-rank-info">
              <div class="db-rank-name">{{ p.name }}</div>
              <div class="db-rank-bar-wrap"><div class="db-rank-bar" [style.width.%]="p.pct"></div></div>
            </div>
            <div class="db-rank-qty">{{ p.sold }}×</div>
            <div class="db-rank-rev">{{ p.rev }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stock alerts -->
    <div class="chart-section">
      <div class="chart-header">
        <div class="chart-title">⚠️ Alertas de Estoque</div>
      </div>
      <div class="db-stock-list">
        <div class="db-stock-item" [class.critical]="s.status === 'critical' || s.status === 'out'"
             *ngFor="let s of stockAlerts">
          <span class="db-si-emoji">{{ s.emoji }}</span>
          <span class="db-si-name">{{ s.name }}</span>
          <span class="db-si-qty" [style.color]="s.status === 'out' || s.status === 'critical' ? '#f44336' : 'var(--gold)'">{{ s.qty }} un.</span>
          <span class="status-pill" [class]="s.status === 'out' ? 'inactive' : 'active'" style="font-size:10px">{{ s.statusLabel }}</span>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
    .db-charts-row { display: flex; gap: 16px; margin-bottom: 20px; }
    @media(max-width:900px) { .db-charts-row { flex-direction: column; } }
    .chart-section { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r2); padding: 20px; margin-bottom: 20px; }
    .chart-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
    .chart-title { font-size: 13px; font-weight: 600; }
    .bar-chart { display: flex; align-items: flex-end; gap: 8px; height: 100px; }
    .bar-wrap { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; }
    .bar { width: 100%; background: var(--border); border-radius: 4px 4px 0 0; transition: all .5s ease; position: relative; overflow: hidden; }
    .bar::after { content: ''; position: absolute; inset: 0; background: linear-gradient(to top, var(--accent), var(--accent2)); border-radius: inherit; }
    .bar-label { font-size: 10px; color: var(--muted); }
    .bar-val { font-size: 10px; color: var(--muted); font-family: 'DM Mono', monospace; }
    .db-period-btn { padding: 4px 10px; border-radius: 50px; border: 1px solid var(--border); background: transparent; color: var(--muted); font-size: 11px; cursor: pointer; transition: all .2s; }
    .db-period-btn.active { background: var(--accent); border-color: var(--accent); color: white; }
    .chart-header-right { display:flex; align-items:center; gap:10px; }
    .info-icon {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 1px solid var(--border);
      background: var(--surface2);
      color: var(--muted);
      display:flex;
      align-items:center;
      justify-content:center;
      font-size: 14px;
      cursor: default;
      position: relative;
    }
    .info-icon:hover::after {
      content: attr(data-tooltip);
      position: absolute;
      right: 0;
      top: calc(100% + 10px);
      transform: translateX(50%);
      width: max-content;
      max-width: 200px;
      white-space: normal;
      padding: 10px 12px;
      border-radius: 14px;
      background: rgba(29, 30, 34, .95);
      color: white;
      font-size: 12px;
      line-height: 1.4;
      z-index: 10;
      box-shadow: 0 22px 40px rgba(0,0,0,.22);
    }
    .db-ranking { display: flex; flex-direction: column; gap: 10px; }
    .db-rank-item { display: flex; align-items: center; gap: 10px; }
    .db-rank-pos { font-family: 'Bebas Neue', cursive; font-size: 18px; width: 22px; text-align: center; flex-shrink: 0; color: var(--muted); }
    .db-rank-pos.gold { color: var(--gold); } .db-rank-pos.silver { color: #b0b0b0; } .db-rank-pos.bronze { color: #cd7f32; }
    .db-rank-emoji { font-size: 20px; flex-shrink: 0; }
    .db-rank-info { flex: 1; min-width: 0; }
    .db-rank-name { font-size: 12px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .db-rank-bar-wrap { height: 3px; background: var(--border); border-radius: 2px; margin-top: 4px; overflow: hidden; }
    .db-rank-bar { height: 100%; background: linear-gradient(90deg, var(--accent), var(--accent2)); border-radius: 2px; }
    .db-rank-qty { font-family: 'DM Mono', monospace; font-size: 11px; color: var(--muted); flex-shrink: 0; }
    .db-rank-rev { font-family: 'DM Mono', monospace; font-size: 12px; color: var(--accent2); flex-shrink: 0; min-width: 52px; text-align: right; }
    .db-stock-list { display: flex; flex-direction: column; gap: 8px; }
    .db-stock-item { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: var(--r); background: var(--surface2); border: 1px solid var(--border); cursor: pointer; transition: background .15s; }
    .db-stock-item.critical { border-color: rgba(244,67,54,.2); background: rgba(244,67,54,.05); }
    .db-si-emoji { font-size: 20px; }
    .db-si-name { flex: 1; font-size: 13px; font-weight: 500; }
    .db-si-qty { font-family: 'DM Mono', monospace; font-size: 12px; }
  `]
})
export class AdminDashboardComponent {
  data = inject(DataService);
  today = new Date().toLocaleDateString('pt-BR', { weekday:'long', day:'2-digit', month:'long' });

  kpis = computed(() => {
    const faturamento = this.selectedPeriod() === '30d'
      ? { value: 'R$9.9k', delta: '↑ 18% vs mês anterior', color: 'var(--green)' }
      : { value: 'R$1.847', delta: '↑ 12% vs ontem', color: 'var(--green)' };

    return [
      { label:'Pedidos Hoje',   value:'24',    delta:'↑ 8% vs ontem',  icon:'📦', color:'' },
      { label:'Faturamento',    value:faturamento.value, delta:faturamento.delta, icon:'💰', color:faturamento.color },
      { label:'Ticket Médio',   value:'R$76,95',delta:'↑ 3% vs ontem', icon:'🎯', color:'var(--accent2)' },
      { label:'Clientes Ativos',value:'18',    delta:'Agora online',    icon:'👥', color:'' },
      { label:'Em Preparo',     value:'4',     delta:'Média 14 min',    icon:'🔥', color:'var(--accent)' },
      { label:'Avaliação',      value:'4.8 ★', delta:'↑ 0.2 esta semana',icon:'⭐',color:'var(--gold)' },
    ];
  });

  selectedPeriod = signal<'7d' | '30d'>('7d');

  weeklyBarData = [
    { label:'Seg', val:'R$1.2k', h: 55 },
    { label:'Ter', val:'R$1.5k', h: 68 },
    { label:'Qua', val:'R$980',  h: 44 },
    { label:'Qui', val:'R$1.8k', h: 80 },
    { label:'Sex', val:'R$2.1k', h: 95 },
    { label:'Sáb', val:'R$2.4k', h: 100 },
    { label:'Dom', val:'R$1.9k', h: 85 },
  ];

  monthlyBarData = [
    { label:'W1', val:'R$7.8k', h: 68 },
    { label:'W2', val:'R$8.4k', h: 74 },
    { label:'W3', val:'R$9.1k', h: 80 },
    { label:'W4', val:'R$8.7k', h: 76 },
  ];

  barData = computed(() => this.selectedPeriod() === '30d' ? this.monthlyBarData : this.weeklyBarData);

  selectPeriod(period: '7d' | '30d') {
    this.selectedPeriod.set(period);
  }

  revenueTooltip = computed(() => {
    const total = this.selectedPeriod() === '30d'
      ? 'R$ 9.9k'
      : 'R$ 1.847';
    const label = this.selectedPeriod() === '30d' ? 'Último mês' : 'Última semana';
    return `${label} • Total de receita: ${total}`;
  });

  topProducts = [
    { emoji:'🍔', name:'Smash Burger Duplo',  sold:28, rev:'R$1.117', pct:100 },
    { emoji:'🍕', name:'Pizza Margherita',     sold:19, rev:'R$855',   pct:68  },
    { emoji:'🍗', name:'Chicken Crispy',       sold:15, rev:'R$480',   pct:54  },
    { emoji:'🥗', name:'Poke Bowl Salmão',     sold:9,  rev:'R$315',   pct:32  },
    { emoji:'🥤', name:'Shake Pistache',       sold:5,  rev:'R$120',   pct:18  },
  ];

  stockAlerts = [
    { emoji:'🥤', name:'Shake de Nutella',  qty:2, status:'critical', statusLabel:'🚨 Crítico' },
    { emoji:'🍮', name:'Brownie Vulcão',    qty:0, status:'out',      statusLabel:'✕ Zerado'  },
    { emoji:'🥗', name:'Poke Bowl Salmão', qty:8, status:'low',      statusLabel:'⚠ Baixo'   },
  ];
}
