import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';
import { ToastService } from '../../core/services/toast.service';
import { Order } from '../../core/models';

type EarningPeriod = 'today' | 'week' | 'month';

@Component({
  selector: 'app-entregador',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="app-shell">

    <!-- TOPBAR -->
    <div class="topbar">
      <div class="topbar-left">
        <div class="topbar-logo">🔥 DK</div>
        <span class="pill pill-orange" style="font-size:11px;font-weight:700;">🛵 ENTREGADOR</span>
        <span [class]="isOnline() ? 'pill pill-green' : 'pill pill-gray'">
          {{ isOnline() ? '● ONLINE' : '● OFFLINE' }}
        </span>
      </div>
      <div class="topbar-user">
        <div class="topbar-avatar">MS</div>
        <span class="topbar-name">Marcos Silva</span>
        <button class="btn-logout" title="Sair do usuário" (click)="auth.logout()">🔌 Sair</button>
      </div>
    </div>

    <!-- MAIN -->
    <div class="main-content">

      <!-- Online Toggle -->
      <div class="online-toggle-wrap">
        <div>
          <div class="online-toggle-label" [style.color]="isOnline() ? 'var(--green)' : ''">
            {{ isOnline() ? 'Você está ONLINE' : 'Você está OFFLINE' }}
          </div>
          <div class="online-toggle-sub">{{ isOnline() ? 'Recebendo pedidos' : 'Ative para receber pedidos' }}</div>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" [checked]="isOnline()" (change)="toggleOnline($event)">
          <span class="toggle-slider"></span>
        </label>
      </div>

      <!-- Tabs -->
      <div class="entregador-tabs">
        <button class="entregador-tab" *ngFor="let tab of tabs"
          [class.active]="activeTab() === tab.id"
          (click)="setTab(tab.id)">
          {{ tab.icon }} {{ tab.label }}
        </button>
      </div>

      <!-- ── TAB: DASHBOARD ── -->
      <div *ngIf="activeTab() === 'dashboard'">
        <div class="stats-row">
          <div class="stat-card">
            <div class="stat-icon">📦</div>
            <div class="stat-val" style="color:var(--accent)">8</div>
            <div class="stat-lbl">Entregas Hoje</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">💰</div>
            <div class="stat-val" style="color:var(--green)">R$96</div>
            <div class="stat-lbl">Ganhos Hoje</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">⭐</div>
            <div class="stat-val" style="color:var(--gold)">4.9</div>
            <div class="stat-lbl">Avaliação</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">⏱</div>
            <div class="stat-val">18min</div>
            <div class="stat-lbl">Tempo Médio</div>
          </div>
        </div>

        <div class="card" style="margin-bottom:16px">
          <div class="card-header">
            <div>
              <div class="card-title">Pedidos Disponíveis</div>
              <div class="card-sub">Aceite e inicie a entrega</div>
            </div>
            <span class="pill pill-green">● {{ pendingOrders().length }} disponíveis</span>
          </div>
          <div class="order-list">
            <div *ngIf="pendingOrders().length === 0" style="text-align:center;padding:30px;color:var(--muted)">
              Nenhum pedido disponível no momento
            </div>
            <div *ngFor="let o of pendingOrders()" class="order-card">
              <div class="order-token">{{ o.token }}</div>
              <div class="order-info">
                <div class="order-customer">{{ o.customer }}</div>
                <div class="order-address">📍 {{ o.items }}</div>
                <div class="order-items">{{ o.status === 'pending' ? o.eta : o.items }}</div>
              </div>
              <div class="order-right">
                <div class="order-value">R$ {{ (o.total/100).toFixed(2).replace('.',',') }}</div>
                <div class="order-eta">⏱ {{ o.eta }}</div>
                <div class="order-actions">
                  <button class="btn btn-success btn-sm" (click)="aceitarPedido(o)">✓ Aceitar</button>
                  <button class="btn btn-danger btn-sm" (click)="recusarPedido(o)">✗</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header"><div class="card-title">Histórico do Dia</div></div>
          <table class="deliveries-table">
            <thead><tr><th>Token</th><th>Cliente</th><th>Endereço</th><th>Valor</th><th>Status</th></tr></thead>
            <tbody>
              <tr>
                <td><span style="font-family:'Bebas Neue',cursive;color:var(--accent)">#A015</span></td>
                <td>Pedro Alves</td><td>Rua das Flores, 140</td>
                <td style="color:var(--green);font-family:'Bebas Neue',cursive;font-size:16px">R$12,00</td>
                <td><span class="pill pill-green">✓ Entregue</span></td>
              </tr>
              <tr>
                <td><span style="font-family:'Bebas Neue',cursive;color:var(--accent)">#A016</span></td>
                <td>Carla Nogueira</td><td>Av. Brasil, 890</td>
                <td style="color:var(--green);font-family:'Bebas Neue',cursive;font-size:16px">R$14,00</td>
                <td><span class="pill pill-green">✓ Entregue</span></td>
              </tr>
              <tr>
                <td><span style="font-family:'Bebas Neue',cursive;color:var(--accent)">#A017</span></td>
                <td>João Melo</td><td>Rua Palmeiras, 55</td>
                <td style="color:var(--green);font-family:'Bebas Neue',cursive;font-size:16px">R$11,00</td>
                <td><span class="pill pill-green">✓ Entregue</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ── TAB: PEDIDOS ── -->
      <div *ngIf="activeTab() === 'pedidos'">
        <div class="card">
          <div class="card-header">
            <div class="card-title">Novos Pedidos</div>
            <button class="btn btn-secondary btn-sm" (click)="toast.show('Atualizando...','default')">🔄 Atualizar</button>
          </div>
          <div class="order-list">
            <div *ngFor="let o of activeOrders()" class="order-card">
              <div class="order-token">{{ o.token }}</div>
              <div class="order-info">
                <div class="order-customer">{{ o.customer }}</div>
                <div class="order-address">📍 {{ o.items }}</div>
                <div class="order-items">{{ o.status === 'pending' ? o.eta : o.items }}</div>
              </div>
              <div class="order-right">
                <div class="order-value">R$ {{ (o.total/100).toFixed(2).replace('.',',') }}</div>
                <span [class]="'pill ' + (o.status==='pending'?'pill-orange':o.status==='preparing'?'pill-blue':'pill-green')">
                  {{ o.status==='pending'?'⏳ Aguardando':o.status==='preparing'?'🍳 Em Preparo':'✓ Pronto' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── TAB: ROTA ── -->
      <div *ngIf="activeTab() === 'rota'">
        <div *ngIf="!activeDelivery()" style="text-align:center;padding:60px 20px;color:var(--muted)">
          <div style="font-size:48px;margin-bottom:12px">🗺️</div>
          <p style="font-size:16px;font-weight:600;margin-bottom:6px">Nenhuma entrega ativa</p>
          <p style="font-size:13px">Aceite um pedido para ver a rota aqui</p>
        </div>
        <div *ngIf="activeDelivery()">
          <div class="card" style="margin-bottom:16px">
            <div class="card-header">
              <div>
                <div class="card-title">{{ activeDelivery()!.token }}</div>
                <div class="card-sub">{{ activeDelivery()!.customer }}</div>
              </div>
              <span class="pill pill-orange">Em Andamento</span>
            </div>
            <div class="map-placeholder">
              <div class="map-icon">📍</div>
              <p style="font-weight:700">Mapa em tempo real</p>
              <p style="font-size:12px">{{ activeDelivery()!.items }}</p>
            </div>
            <div class="route-steps">
              <div class="route-step done">
                <div class="step-dot" style="background:rgba(0,200,83,.1)">🏪</div>
                <div class="step-info">
                  <div class="step-title">Chegou ao restaurante</div>
                  <div class="step-sub">Dark Kitchen — Cozinha Central</div>
                </div>
                <div class="step-time">{{ activeDelivery()!.time }}</div>
              </div>
              <div class="route-step done">
                <div class="step-dot" style="background:rgba(0,200,83,.1)">📦</div>
                <div class="step-info">
                  <div class="step-title">Pedido coletado</div>
                  <div class="step-sub">{{ activeDelivery()!.items }}</div>
                </div>
                <div class="step-time">+4 min</div>
              </div>
              <div [class]="'route-step ' + (deliveryConfirmed() ? 'done' : 'active')">
                <div class="step-dot">🛵</div>
                <div class="step-info">
                  <div class="step-title">Em rota de entrega</div>
                  <div class="step-sub">Estimado: {{ activeDelivery()!.eta }}</div>
                </div>
                <div class="step-time">—</div>
              </div>
              <div [class]="'route-step ' + (deliveryConfirmed() ? 'done' : '')">
                <div class="step-dot">✅</div>
                <div class="step-info">
                  <div class="step-title">Entregue ao cliente</div>
                  <div class="step-sub">Confirmar ao chegar</div>
                </div>
                <div class="step-time">—</div>
              </div>
            </div>
          </div>
          <div style="display:flex;gap:10px">
            <button class="btn btn-blue" style="flex:1" (click)="toast.show('📞 Ligando para o cliente...','default')">📞 Ligar Cliente</button>
            <button class="btn btn-success" style="flex:1" (click)="confirmarEntrega()" [disabled]="deliveryConfirmed()">
              ✅ Confirmar Entrega
            </button>
          </div>
        </div>
      </div>

      <!-- ── TAB: GANHOS ── -->
      <div *ngIf="activeTab() === 'ganhos'">
        <div class="earnings-period">
          <button *ngFor="let p of periods"
            [class]="activePeriod() === p.id ? 'active' : ''"
            (click)="setPeriod(p.id)">{{ p.label }}</button>
        </div>
        <div class="earnings-grid">
          <div class="earnings-card">
            <div class="earnings-lbl">Ganhos</div>
            <div class="earnings-val">{{ currentPeriodData().total }}</div>
          </div>
          <div class="earnings-card">
            <div class="earnings-lbl">Entregas</div>
            <div class="earnings-val" style="color:var(--blue)">{{ currentPeriodData().count }}</div>
          </div>
          <div class="earnings-card">
            <div class="earnings-lbl">Por Entrega</div>
            <div class="earnings-val" style="color:var(--gold)">{{ currentPeriodData().avg }}</div>
          </div>
          <div class="earnings-card">
            <div class="earnings-lbl">Gorjetas</div>
            <div class="earnings-val" style="color:var(--green)">{{ currentPeriodData().tip }}</div>
          </div>
        </div>
        <div class="card">
          <div class="card-title" style="margin-bottom:14px">Últimas Entregas</div>
          <table class="deliveries-table">
            <thead><tr><th>Token</th><th>Valor</th><th>Gorjeta</th><th>Duração</th><th>Hora</th></tr></thead>
            <tbody>
              <tr>
                <td style="font-family:'DM Mono';color:var(--accent)">#A017</td>
                <td style="color:var(--green);font-weight:700">R$11,00</td>
                <td style="color:var(--gold)">R$3,00</td><td>14 min</td>
                <td style="color:var(--muted)">14:55</td>
              </tr>
              <tr>
                <td style="font-family:'DM Mono';color:var(--accent)">#A016</td>
                <td style="color:var(--green);font-weight:700">R$14,00</td>
                <td style="color:var(--gold)">—</td><td>17 min</td>
                <td style="color:var(--muted)">14:30</td>
              </tr>
              <tr>
                <td style="font-family:'DM Mono';color:var(--accent)">#A015</td>
                <td style="color:var(--green);font-weight:700">R$12,00</td>
                <td style="color:var(--gold)">R$5,00</td><td>12 min</td>
                <td style="color:var(--muted)">14:05</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ── TAB: PERFIL ── -->
      <div *ngIf="activeTab() === 'perfil'">
        <div class="profile-header card" style="margin-bottom:16px">
          <div class="profile-avatar-lg" style="position:relative">
            <img *ngIf="profilePhoto" [src]="profilePhoto" style="width:100%;height:100%;object-fit:cover;border-radius:50%" [alt]="profileName">
            <span *ngIf="!profilePhoto">MS</span>
            <button (click)="changePhoto()" style="position:absolute;bottom:0;right:0;background:var(--accent);border:none;border-radius:50%;width:28px;height:28px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px;color:white">📷</button>
          </div>
          <div style="flex:1">
            <div class="profile-name">{{ profileName }}</div>
            <div style="font-size:12px;color:var(--muted);font-family:'DM Mono',monospace">{{ profileEmail }}</div>
            <div style="display:flex;align-items:center;gap:8px;margin-top:6px">
              <span style="color:var(--gold)">★★★★★</span>
              <span style="font-weight:700">4.9</span>
              <span style="color:var(--muted);font-size:12px">(142 avaliações)</span>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;gap:8px;align-items:flex-end">
            <span class="pill pill-green">✓ Verificado</span>
            <button class="btn btn-secondary btn-sm" (click)="editingProfile.set(!editingProfile())">{{ editingProfile() ? '❌ Cancelar' : '✏︎ Editar' }}</button>
          </div>
        </div>

        <div class="card" style="margin-bottom:16px">
          <div class="card-title" style="margin-bottom:16px">Meu Veículo</div>
          <div class="vehicle-select">
            <button *ngFor="let v of vehicles"
              [class]="'vehicle-btn' + (selectedVehicle() === v.id ? ' active' : '')"
              (click)="selectVehicle(v.id)">
              <div class="v-icon">{{ v.icon }}</div>
              <div class="v-name">{{ v.name }}</div>
            </button>
          </div>
        </div>

        <div class="card" *ngIf="editingProfile()">
          <div class="card-title" style="margin-bottom:16px">Alterar Foto do Perfil</div>
          <div style="margin-bottom:12px">
            <label class="auth-label">URL da Foto</label>
            <input class="auth-input" [(ngModel)]="profilePhoto" placeholder="https://exemplo.com/foto.jpg">
            <div *ngIf="profilePhoto" style="margin-top:12px;border-radius:8px;overflow:hidden;max-height:120px">
              <img [src]="profilePhoto" style="width:100%;height:100%;object-fit:cover" alt="Preview">
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-title" style="margin-bottom:16px">Dados Pessoais</div>
          <div class="form-grid">
            <div class="form-row"><label>Nome Completo</label><input [(ngModel)]="profileName" [readonly]="!editingProfile()"></div>
            <div class="form-row"><label>Email</label><input [(ngModel)]="profileEmail" [readonly]="!editingProfile()"></div>
            <div class="form-row"><label>CPF</label><input [(ngModel)]="profileCPF" [readonly]="!editingProfile()" placeholder="000.000.000-00"></div>
            <div class="form-row"><label>Telefone</label><input [(ngModel)]="profilePhone" [readonly]="!editingProfile()"></div>
            <div class="form-row"><label>Placa do Veículo</label><input [(ngModel)]="vehiclePlate" [readonly]="!editingProfile()"></div>
          </div>
          <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px">
            <button *ngIf="editingProfile()" class="btn btn-secondary" (click)="editingProfile.set(false)">Cancelar</button>
            <button class="btn btn-primary" (click)="saveProfile()">{{ editingProfile() ? '💾 Salvar alterações' : '✅ Salvo' }}</button>
          </div>
        </div>

      </div>

    </div>
  </div>
  `,
  styles: [`
    .app-shell { min-height:100vh; display:flex; flex-direction:column; background:var(--bg); }

    .topbar {
      height: 60px; background: var(--surface); border-bottom: 1px solid var(--border);
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 20px; position: sticky; top: 0; z-index: 100;
    }
    .topbar-left { display:flex; align-items:center; gap:12px; }
    .topbar-user { display:flex; align-items:center; gap:10px; margin-left:auto; }
    .topbar-logo { font-family:'Bebas Neue',cursive; font-size:24px; letter-spacing:3px; color:var(--accent); }
    .topbar-avatar { width:34px; height:34px; border-radius:50%; background:linear-gradient(135deg,#FF9800,#FF4500); display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:700; }
    .topbar-name { font-size:13px; font-weight:600; }

    .main-content { flex:1; padding:24px; max-width:1200px; width:100%; margin:0 auto; }

    .online-toggle-wrap {
      display:flex; align-items:center; justify-content:space-between;
      background:var(--surface); border:1px solid var(--border); border-radius:14px;
      padding:16px 20px; margin-bottom:20px;
    }
    .online-toggle-label { font-size:15px; font-weight:700; }
    .online-toggle-sub { font-size:12px; color:var(--muted); margin-top:2px; }
    .toggle-switch { position:relative; display:inline-block; width:50px; height:26px; flex-shrink:0; }
    .toggle-switch input { opacity:0; width:0; height:0; }
    .toggle-slider {
      position:absolute; cursor:pointer; inset:0;
      background:var(--surface3); border-radius:26px; transition:.3s;
    }
    .toggle-slider:before {
      content:''; position:absolute; height:20px; width:20px; left:3px; bottom:3px;
      background:white; border-radius:50%; transition:.3s;
    }
    input:checked + .toggle-slider { background:var(--green); }
    input:checked + .toggle-slider:before { transform:translateX(24px); }

    .entregador-tabs {
      display:flex; gap:2px; background:var(--surface); border-radius:12px;
      padding:4px; margin-bottom:24px;
    }
    .entregador-tab {
      flex:1; padding:9px 12px; background:transparent; border:none; border-radius:9px;
      color:var(--muted); font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600;
      cursor:pointer; transition:all .2s; text-align:center;
    }
    .entregador-tab.active { background:var(--surface2); color:#FF9800; box-shadow:0 2px 8px rgba(0,0,0,.3); }
    .entregador-tab:hover:not(.active) { color:var(--text); }

    .stats-row { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:20px; }
    .stat-card { background:var(--surface); border:1px solid var(--border); border-radius:14px; padding:16px; text-align:center; }
    .stat-icon { font-size:26px; margin-bottom:8px; }
    .stat-val { font-family:'Bebas Neue',cursive; font-size:28px; letter-spacing:1px; }
    .stat-lbl { font-size:11px; color:var(--muted); margin-top:2px; }

    .order-list { display:flex; flex-direction:column; gap:12px; }
    .order-card {
      background:var(--surface2); border:1px solid var(--border); border-radius:12px;
      padding:16px 20px; display:flex; align-items:center; gap:16px;
      transition:border-color .2s;
    }
    .order-card:hover { border-color:var(--muted2); }
    .order-token { font-family:'Bebas Neue',cursive; font-size:22px; color:var(--accent); letter-spacing:1px; min-width:72px; }
    .order-info { flex:1; }
    .order-customer { font-weight:700; font-size:14px; margin-bottom:2px; }
    .order-address { font-size:12px; color:var(--muted); margin-bottom:4px; }
    .order-items { font-size:12px; color:var(--muted2); }
    .order-right { display:flex; flex-direction:column; align-items:flex-end; gap:8px; }
    .order-value { font-family:'Bebas Neue',cursive; font-size:20px; color:var(--green); }
    .order-actions { display:flex; gap:8px; }
    .order-eta { font-size:11px; color:var(--muted); font-family:'DM Mono',monospace; }

    .btn-logout {
      padding:6px 14px;
      background:transparent;
      border:1px solid var(--border);
      border-radius:var(--r);
      color:var(--muted);
      font-size:12px;
      font-weight:600;
      cursor:pointer;
      transition:all .2s;
    }
    .btn-logout:hover { border-color:var(--accent); color:var(--accent); }

    .pill { display:inline-flex; align-items:center; gap:4px; padding:3px 10px; border-radius:50px; font-size:11px; font-weight:700; }
    .pill-orange { background:rgba(255,69,0,.12); color:var(--accent); }
    .pill-green  { background:rgba(0,200,83,.12); color:var(--green); }
    .pill-gold   { background:rgba(255,184,0,.12); color:var(--gold); }
    .pill-blue   { background:rgba(33,150,243,.12); color:var(--blue); }
    .pill-gray   { background:rgba(102,102,102,.15); color:var(--muted); }

    .map-placeholder {
      background:var(--surface); border:1px solid var(--border); border-radius:var(--r2);
      height:300px; display:flex; flex-direction:column; align-items:center; justify-content:center;
      gap:12px; color:var(--muted); margin-bottom:20px;
    }
    .route-steps { display:flex; flex-direction:column; gap:12px; }
    .route-step { display:flex; gap:16px; padding-bottom:24px; position:relative; }
    .step-dot { width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:14px; flex-shrink:0; z-index:1; background:var(--surface); }
    .step-info { flex:1; }
    .step-title { font-weight:700; }
    .step-sub { font-size:12px; color:var(--muted); margin-top:4px; }
    .step-time { font-size:12px; color:var(--muted); }

    .earnings-period { display:flex; gap:8px; margin-bottom:20px; }
    .earnings-period button {
      flex:1; padding:9px; border-radius:var(--r); border:1px solid var(--border);
      background:var(--surface2); color:var(--muted); font-size:12px; font-weight:600; cursor:pointer; transition:all .2s;
    }
    .earnings-period button.active { background:var(--surface); border-color:var(--accent); color:var(--text); }
    .earnings-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:12px; margin-bottom:20px; }
    .earnings-card { background:var(--surface); border:1px solid var(--border); border-radius:14px; padding:16px; }
    .earnings-lbl { font-size:11px; color:var(--muted); margin-bottom:8px; text-transform:uppercase; letter-spacing:.5px; }
    .earnings-val { font-family:'Bebas Neue',cursive; font-size:26px; }

    .profile-header { display:flex; align-items:center; gap:20px; padding:24px; background:var(--surface); border:1px solid var(--border); border-radius:var(--r2); margin-bottom:20px; }
    .profile-avatar-lg { width:72px; height:72px; border-radius:50%; background:linear-gradient(135deg,#FF9800,#FF4500); display:flex; align-items:center; justify-content:center; font-size:28px; font-weight:700; flex-shrink:0; }
    .profile-name { font-size:20px; font-weight:700; }

    .vehicle-select { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-bottom:20px; }
    .vehicle-btn { display:flex; flex-direction:column; align-items:center; gap:8px; padding:16px; border-radius:14px; border:1px solid var(--border); background:var(--surface); color:var(--muted); cursor:pointer; transition:all .2s; }
    .vehicle-btn.active { border-color:var(--accent); color:var(--text); background:var(--surface2); }
    .v-icon { font-size:24px; }
    .v-name { font-weight:700; }

    .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
    .form-row { display:flex; flex-direction:column; gap:6px; }
    .form-row label { font-size:12px; color:var(--muted); font-weight:700; margin-bottom:6px; text-transform:uppercase; letter-spacing:.5px; }
    .form-row input { width:100%; padding:12px 14px; background:var(--surface); border:1px solid var(--border); border-radius:var(--r); color:var(--text); }\n    .form-row input:readonly { background:var(--surface2); color:var(--muted); cursor:default; }
    .auth-label { font-size:12px; color:var(--muted); font-weight:700; margin-bottom:6px; text-transform:uppercase; letter-spacing:.5px; display:block; }\n    .auth-input { width:100%; padding:12px 14px; background:var(--surface); border:1px solid var(--border); border-radius:var(--r); color:var(--text); font-family:'DM Sans',sans-serif; font-size:13px; }\n    .auth-input:focus { outline:none; border-color:var(--accent); }

    @media(max-width:900px) {
      .stats-row, .earnings-grid { grid-template-columns:repeat(2,1fr); }
      .form-grid { grid-template-columns:1fr; }
      .vehicle-select { grid-template-columns:1fr; }
    }
    @media(max-width:640px) {
      .topbar { padding:0 16px; }
      .main-content { padding:20px 16px; }
      .entregador-tabs { flex-direction: column; }
      .entregador-tab { width:100%; }
    }
  `]
})
export class EntregadorComponent {
  auth = inject(AuthService);
  data = inject(DataService);
  toast = inject(ToastService);

  activeTab = signal('dashboard');
  isOnline = signal(false);
  activePeriod = signal<EarningPeriod>('today');
  selectedVehicle = signal('bike');
  deliveryConfirmed = signal(false);
  editingProfile = signal(false);

  tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'pedidos', label: 'Pedidos', icon: '📦' },
    { id: 'rota', label: 'Rota Ativa', icon: '🗺️' },
    { id: 'ganhos', label: 'Ganhos', icon: '💰' },
    { id: 'perfil', label: 'Perfil', icon: '👤' }
  ];

  periods: { id: EarningPeriod; label: string }[] = [
    { id: 'today', label: 'Hoje' },
    { id: 'week', label: 'Semana' },
    { id: 'month', label: 'Mês' }
  ];

  vehicles = [
    { id: 'bike', icon: '🚲', name: 'Bicicleta' },
    { id: 'moto', icon: '🏍️', name: 'Moto' },
    { id: 'car', icon: '🚗', name: 'Carro' }
  ];

  profileName = 'Marcos Silva';
  profileEmail = 'marcos@entregador.com';
  profileCPF = '123.456.789-00';
  profilePhone = '(11) 98765-4321';
  vehiclePlate = 'ABC-1234';
  profilePhoto = '';

  fixedEarnings: Record<EarningPeriod, { total: string; count: number; avg: string; tip: string }> = {
    today: { total: 'R$96', count: 8, avg: 'R$12', tip: 'R$7' },
    week: { total: 'R$456', count: 34, avg: 'R$13', tip: 'R$32' },
    month: { total: 'R$1.980', count: 143, avg: 'R$13,84', tip: 'R$97' }
  };

  pendingOrders = computed(() => this.data.orders().filter(o => o.status === 'pending'));
  activeOrders = computed(() => this.data.orders().filter(o => o.status !== 'done'));
  activeDelivery = computed(() => this.data.orders().find(o => o.status === 'pending' || o.status === 'preparing') ?? null);
  currentPeriodData = computed(() => this.fixedEarnings[this.activePeriod()]);

  setTab(tab: string) { this.activeTab.set(tab); }
  toggleOnline(event: Event) { this.isOnline.set((event.target as HTMLInputElement).checked); }
  setPeriod(period: EarningPeriod) { this.activePeriod.set(period); }
  selectVehicle(id: string) { this.selectedVehicle.set(id); }
  aceitarPedido(o: Order) { this.toast.show('Pedido aceito!','success'); }
  recusarPedido(o: Order) { this.toast.show('Pedido recusado.','default'); }
  confirmarEntrega() { this.deliveryConfirmed.set(true); this.toast.show('Entrega confirmada!','success'); }
  
  saveProfile() {
    this.toast.show('✅ Perfil atualizado com sucesso!', 'success');
    this.editingProfile.set(false);
  }

  changePhoto() {
    const url = prompt('Digite a URL da foto:', this.profilePhoto);
    if (url !== null) {
      this.profilePhoto = url;
      this.toast.show(url ? '✅ Foto alterada!' : '📷 URL da foto removida');
    }
  }
}
