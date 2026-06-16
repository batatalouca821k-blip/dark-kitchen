import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';

const STEPS = [
  { icon:'✓',  label:'Recebido',   title:'Pedido Recebido',    time:'14:32 · Confirmado pelo sistema'      },
  { icon:'✓',  label:'Confirmado', title:'Pedido Confirmado',   time:'14:33 · Admin aceitou seu pedido'     },
  { icon:'🔥', label:'Preparando', title:'Em Preparo',          time:'14:35 · Sua comida está sendo preparada' },
  { icon:'📦', label:'Pronto',     title:'Pronto para Entrega', time:'14:53 · Aguardando motoboy'           },
  { icon:'🛵', label:'Entregue',   title:'Entregue',            time:'15:05 · Aproveite sua refeição! 🎉'  },
];

@Component({
  selector: 'app-tracking',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
  <div class="tracking-shell">

    <button class="back-button" routerLink="/client">← Voltar ao cardápio</button>

    <!-- Token display -->
    <div class="token-display">
      <div class="token-label">NÚMERO DO PEDIDO</div>
      <div class="token-number">A024</div>
      <div class="eta-badge">⏱ {{ etaMins() > 0 ? etaMins() + ' min restantes' : '✓ Entregue!' }}</div>
    </div>

    <!-- Progress bar -->
    <div class="tr-progress-bar">
      <div class="tr-steps-row">
        <div class="tr-step-item" *ngFor="let s of steps; let i = index">
          <div class="tr-step-dot"
               [class.done]="i < trackingStep()"
               [class.active]="i === trackingStep()">
            {{ i < trackingStep() ? '✓' : s.icon }}
          </div>
          <div class="tr-step-line" *ngIf="i < steps.length - 1" [class.done]="i < trackingStep()"></div>
        </div>
      </div>
      <div class="tr-steps-labels">
        <span *ngFor="let s of steps">{{ s.label }}</span>
      </div>
    </div>

    <!-- Timeline -->
    <div class="timeline" id="order-timeline">
      <div class="timeline-step" *ngFor="let s of steps; let i = index; let last = last"
           [class.done]="i < trackingStep()"
           [class.active]="i === trackingStep()"
           [class.pending]="i > trackingStep()">
        <div class="timeline-left">
          <div class="timeline-dot">{{ i <= trackingStep() ? s.icon : '' }}</div>
          <div class="timeline-line" *ngIf="!last"></div>
        </div>
        <div class="timeline-content">
          <div class="timeline-title">{{ s.title }}</div>
          <div class="timeline-time">{{ i <= trackingStep() ? s.time : 'Aguardando...' }}</div>
        </div>
      </div>
    </div>

    <!-- Order summary -->
    <div class="order-mini-card">
      <div class="order-mini-item"><span class="omi-name">Smash Burger Duplo × 1</span><span class="omi-price">R$ 39,90</span></div>
      <div class="order-mini-item"><span class="omi-name">Shake Pistache × 1</span><span class="omi-price">R$ 24,00</span></div>
      <div class="order-mini-item" style="color:var(--text);font-weight:600"><span>Total</span><span class="omi-price" style="color:var(--accent2)">R$ 70,80</span></div>
    </div>

    <!-- Simulate advance (demo) -->
    <button class="advance-btn" (click)="advance()" *ngIf="trackingStep() < 4">
      ⚡ Avançar status (demo)
    </button>

    <button class="btn-primary" routerLink="/client" style="width:100%; margin-top:12px" *ngIf="trackingStep() >= 4">
      🍽️ Fazer novo pedido
    </button>

  </div>
  `,
  styles: [`
    .tracking-shell { max-width: 480px; margin: 0 auto; padding: 80px 16px 40px; }

    .token-display { text-align: center; padding: 32px 20px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--r2); margin-bottom: 16px; position: relative; overflow: hidden; }
    .token-display::before { content: ''; position: absolute; top: -40px; left: 50%; transform: translateX(-50%); width: 200px; height: 200px; background: radial-gradient(circle, rgba(255,69,0,.15), transparent 70%); }
    .token-label { font-size: 11px; color: var(--muted); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px; }
    .token-number { font-family: 'Bebas Neue', cursive; font-size: 72px; letter-spacing: 4px; color: var(--accent); text-shadow: 0 0 40px rgba(255,69,0,.5); line-height: 1; }
    .eta-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(255,184,0,.1); border: 1px solid rgba(255,184,0,.3); color: var(--gold); padding: 6px 16px; border-radius: 50px; font-size: 13px; font-weight: 600; margin-top: 12px; }

    /* Progress dots */
    .tr-progress-bar { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r2); padding: 16px; margin-bottom: 16px; }
    .tr-steps-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
    .tr-step-item { display: flex; align-items: center; flex: 1; }
    .tr-step-dot { width: 32px; height: 32px; border-radius: 50%; background: var(--surface2); border: 2px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; transition: all .3s; }
    .tr-step-dot.done   { background: var(--green); border-color: var(--green); }
    .tr-step-dot.active { background: var(--accent); border-color: var(--accent); animation: pulse-tiny 1.5s infinite; }
    .tr-step-line { flex: 1; height: 2px; background: var(--border); margin: 0 4px; transition: background .3s; }
    .tr-step-line.done { background: var(--green); }
    .tr-steps-labels { display: flex; justify-content: space-between; }
    .tr-steps-labels span { font-size: 9px; color: var(--muted); text-align: center; flex: 1; }

    /* Timeline */
    .timeline { display: flex; flex-direction: column; margin-bottom: 16px; }
    .timeline-step { display: flex; gap: 14px; position: relative; }
    .timeline-left { display: flex; flex-direction: column; align-items: center; width: 40px; flex-shrink: 0; }
    .timeline-dot { width: 36px; height: 36px; border-radius: 50%; background: var(--surface2); border: 2px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: 16px; }
    .timeline-step.done .timeline-dot   { background: var(--green); border-color: var(--green); box-shadow: 0 0 16px rgba(0,200,83,.4); }
    .timeline-step.active .timeline-dot { background: var(--accent); border-color: var(--accent); box-shadow: 0 0 20px rgba(255,69,0,.5); animation: pulse-dot 1.5s infinite; }
    .timeline-line { width: 2px; flex: 1; background: var(--border); margin: 4px 0; min-height: 24px; }
    .timeline-step.done .timeline-line   { background: var(--green); }
    .timeline-step.active .timeline-line { background: linear-gradient(to bottom, var(--accent), var(--border)); }
    .timeline-content { padding: 6px 0 24px; flex: 1; }
    .timeline-title { font-size: 14px; font-weight: 600; }
    .timeline-time  { font-size: 12px; color: var(--muted); margin-top: 2px; font-family: 'DM Mono', monospace; }
    .timeline-step.pending .timeline-title { color: var(--muted2); }
    .timeline-step.active  .timeline-title { color: var(--accent); }

    /* Order mini */
    .order-mini-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r2); padding: 16px; margin-bottom: 12px; }
    .order-mini-item { display: flex; justify-content: space-between; font-size: 13px; padding: 6px 0; border-bottom: 1px solid var(--border); }
    .order-mini-item:last-child { border-bottom: none; }
    .omi-name  { color: var(--muted); }
    .omi-price { font-family: 'DM Mono', monospace; color: var(--accent2); }

    .back-button { display: inline-flex; align-items: center; gap: 8px; margin-bottom: 16px; padding: 10px 14px; border: 1px solid var(--border); border-radius: 14px; background: var(--surface); color: var(--text); text-decoration: none; font-weight: 700; }
    .back-button:hover { border-color: var(--accent); color: var(--accent); }

    .advance-btn { width: 100%; padding: 12px; background: transparent; color: var(--muted); border: 1px dashed var(--border); border-radius: var(--r); font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; transition: all .2s; }
    .advance-btn:hover { border-color: var(--accent); color: var(--accent); }
  `]
})
export class TrackingComponent {
  steps = STEPS;
  trackingStep = signal(2);
  toast = inject(ToastService); // inject if needed

  etaMins = computed(() => Math.max(0, 23 - this.trackingStep() * 6));

  advance() {
    if (this.trackingStep() < 4) {
      this.trackingStep.update(v => v + 1);
    }
  }
}
