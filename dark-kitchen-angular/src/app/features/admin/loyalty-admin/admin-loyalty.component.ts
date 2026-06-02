import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../core/services/data.service';
import { ToastService } from '../../../core/services/toast.service';
import { Reward } from '../../../core/models';

@Component({
  selector: 'app-admin-loyalty',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div>
    <div class="admin-page-title">FIDELIDADE</div>
    <div class="admin-subtitle">Gerencie recompensas e pontos</div>

    <!-- Stats -->
    <div class="loy-stats-grid">
      <div class="loy-stat-card">
        <div class="lsc-val" style="color:var(--gold)">28.400</div>
        <div class="lsc-label">Pontos emitidos</div>
      </div>
      <div class="loy-stat-card">
        <div class="lsc-val" style="color:var(--accent)">11.200</div>
        <div class="lsc-label">Pontos resgatados</div>
      </div>
      <div class="loy-stat-card">
        <div class="lsc-val" style="color:var(--green)">17.200</div>
        <div class="lsc-label">Pontos em circulação</div>
      </div>
      <div class="loy-stat-card">
        <div class="lsc-val">47</div>
        <div class="lsc-label">Resgates este mês</div>
      </div>
    </div>

    <!-- Tiers -->
    <div class="section-card">
      <div class="section-card-title">Distribuição de Tiers</div>
      <div class="tier-dist">
        <div class="td-row" *ngFor="let t of tierDist">
          <span class="td-icon">{{ t.icon }}</span>
          <span class="td-name">{{ t.name }}</span>
          <div class="td-bar-bg"><div class="td-bar" [style.width.%]="t.pct" [style.background]="t.color"></div></div>
          <span class="td-count">{{ t.count }} usuários</span>
        </div>
      </div>
    </div>

    <!-- Rewards management -->
    <div class="section-card">
      <div class="section-card-header">
        <div class="section-card-title">Recompensas</div>
        <button class="btn-primary" style="font-size:12px;padding:8px 14px" (click)="adding.set(true)">+ Nova</button>
      </div>
      <div class="rewards-table-wrap">
        <div class="reward-row" *ngFor="let r of data.rewards()">
          <span style="font-size:22px">{{ r.emoji }}</span>
          <div style="flex:1">
            <div style="font-size:13px;font-weight:600">{{ r.name }}</div>
            <div style="font-size:11px;color:var(--muted)">{{ r.desc }}</div>
          </div>
          <span class="rr-pts">{{ r.pts }} pts</span>
          <span class="status-pill active" style="font-size:10px">ativo</span>
          <div style="display:flex;gap:6px">
            <button class="icon-btn" (click)="editReward(r)">✏️</button>
            <button class="icon-btn danger" (click)="removeReward(r)">🗑</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit reward modal -->
    <div class="confirm-overlay" [class.open]="adding()">
      <div class="confirm-modal" style="max-width:400px;text-align:left">
        <div style="font-family:'Bebas Neue',cursive;font-size:22px;letter-spacing:1px;margin-bottom:18px">
          {{ editingReward()?.id ? 'EDITAR RECOMPENSA' : 'NOVA RECOMPENSA' }}
        </div>
        <div style="display:flex;gap:8px;margin-bottom:12px">
          <div style="flex:0 0 64px">
            <label class="auth-label">Emoji</label>
            <input class="auth-input" [(ngModel)]="rForm.emoji" style="font-size:20px">
          </div>
          <div style="flex:1">
            <label class="auth-label">Nome</label>
            <input class="auth-input" [(ngModel)]="rForm.name" placeholder="Nome da recompensa">
          </div>
        </div>
        <div style="margin-bottom:12px">
          <label class="auth-label">Descrição</label>
          <input class="auth-input" [(ngModel)]="rForm.desc" placeholder="Descrição breve">
        </div>
        <div style="display:flex;gap:8px;margin-bottom:20px">
          <div style="flex:1">
            <label class="auth-label">Pontos necessários</label>
            <input class="auth-input" type="number" [(ngModel)]="rForm.pts" placeholder="500">
          </div>
          <div style="flex:1">
            <label class="auth-label">Categoria</label>
            <select class="auth-input" [(ngModel)]="rForm.cat">
              <option value="comida">Comida</option>
              <option value="desconto">Desconto</option>
              <option value="especial">Especial</option>
            </select>
          </div>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn-secondary" style="flex:1" (click)="adding.set(false)">Cancelar</button>
          <button class="btn-primary" style="flex:1" (click)="saveReward()">Salvar</button>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .loy-stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:20px; }
    @media(max-width:700px){ .loy-stats-grid { grid-template-columns:repeat(2,1fr); } }
    .loy-stat-card { background:var(--surface); border:1px solid var(--border); border-radius:var(--r2); padding:16px; text-align:center; }
    .lsc-val { font-family:'Bebas Neue',cursive; font-size:32px; letter-spacing:1px; line-height:1; }
    .lsc-label { font-size:11px; color:var(--muted); margin-top:4px; }
    .section-card { background:var(--surface); border:1px solid var(--border); border-radius:var(--r2); padding:20px; margin-bottom:20px; }
    .section-card-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
    .section-card-title { font-size:13px; font-weight:600; margin-bottom:16px; }
    .section-card-header .section-card-title { margin-bottom:0; }
    .tier-dist { display:flex; flex-direction:column; gap:12px; }
    .td-row { display:flex; align-items:center; gap:10px; }
    .td-icon { font-size:18px; }
    .td-name { font-size:12px; font-weight:600; width:60px; flex-shrink:0; }
    .td-bar-bg { flex:1; height:6px; background:var(--border); border-radius:3px; overflow:hidden; }
    .td-bar { height:100%; border-radius:3px; transition:width .4s; }
    .td-count { font-size:11px; color:var(--muted); min-width:72px; text-align:right; }
    .rewards-table-wrap { display:flex; flex-direction:column; gap:8px; }
    .reward-row { display:flex; align-items:center; gap:12px; padding:10px 12px; background:var(--surface2); border:1px solid var(--border); border-radius:var(--r); }
    .rr-pts { font-family:'DM Mono',monospace; font-size:12px; color:var(--gold); min-width:60px; text-align:right; }
  `]
})
export class AdminLoyaltyComponent {
  data  = inject(DataService);
  toast = inject(ToastService);
  adding        = signal(false);
  editingReward = signal<Reward | null>(null);
  rForm: any = { emoji:'🎁', name:'', desc:'', pts:300, cat:'comida' };

  tierDist = [
    { icon:'💎', name:'PLATINA', count:2,  pct:4,  color:'#64c8ff' },
    { icon:'🥇', name:'OURO',    count:8,  pct:17, color:'var(--gold)' },
    { icon:'🥈', name:'PRATA',   count:12, pct:26, color:'#b0b0b0' },
    { icon:'🥉', name:'BRONZE',  count:25, pct:53, color:'#cd7f32' },
  ];

  editReward(r: Reward) {
    this.editingReward.set(r);
    this.rForm = { ...r };
    this.adding.set(true);
  }

  saveReward() {
    if (this.editingReward()?.id) {
      this.data.rewards.update(list => list.map(r => r.id === this.rForm.id ? { ...this.rForm } : r));
      this.toast.show('✅ Recompensa atualizada!', 'success');
    } else {
      const newId = Math.max(...this.data.rewards().map(r => r.id)) + 1;
      this.data.rewards.update(list => [...list, { ...this.rForm, id: newId }]);
      this.toast.show('✅ Recompensa criada!', 'success');
    }
    this.adding.set(false);
    this.editingReward.set(null);
  }

  removeReward(r: Reward) {
    this.data.rewards.update(list => list.filter(x => x.id !== r.id));
    this.toast.show(`🗑 "${r.name}" removida!`);
  }
}
