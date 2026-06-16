import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
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
        <span class="pill pill-orange" style="font-size:12px;font-weight:700;">🛵 ENTREGADOR</span>
        <span [class]="isOnline() ? 'pill pill-green' : 'pill pill-gray'" style="font-size:12px;">
          {{ isOnline() ? '🟢 ONLINE' : '🔴 OFFLINE' }}
        </span>
      </div>
      <div class="topbar-user">
        <div class="topbar-avatar">MS</div>
        <span class="topbar-name">Marcos Silva</span>
        <button class="btn-logout" title="Sair do usuário" (click)="auth.logout()">🚪 Sair</button>
      </div>
    </div>

    <!-- MAIN -->
    <div class="main-content">

      <!-- Online Toggle -->
      <div class="online-toggle-wrap">
        <div>
          <div class="online-toggle-label" [style.color]="isOnline() ? 'var(--green)' : 'var(--text)'">
            {{ isOnline() ? '🟢 Você está ONLINE' : '🔴 Você está OFFLINE' }}
          </div>
          <div class="online-toggle-sub">{{ isOnline() ? '✓ Recebendo pedidos' : '⚠ Ative para receber pedidos' }}</div>
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
            <div class="stat-icon">⏱️</div>
            <div class="stat-val" style="color:var(--blue)">18min</div>
            <div class="stat-lbl">Tempo Médio</div>
          </div>
        </div>

        <div class="card" style="margin-bottom:24px">
          <div class="card-header">
            <div>
              <div class="card-title">📦 Pedidos Disponíveis</div>
              <div class="card-sub">Aceite e inicie a entrega</div>
            </div>
            <span class="pill pill-green">🔔 {{ pendingOrders().length }} disponíveis</span>
          </div>
          <div class="order-list">
            <div *ngIf="pendingOrders().length === 0" style="text-align:center;padding:48px 20px;color:var(--muted)">
              <div style="font-size:56px;margin-bottom:16px">📭</div>
              <p style="font-size:16px;font-weight:600;margin-bottom:8px">Nenhum pedido disponível</p>
              <p style="font-size:13px">Fique atento para novas oportunidades</p>
            </div>
            <div *ngFor="let o of pendingOrders()" class="order-card">
              <div class="order-token">{{ o.token }}</div>
              <div class="order-info">
                <div class="order-customer">👤 {{ o.customer }}</div>
                <div class="order-address">📍 {{ o.items }}</div>
                <div class="order-items">⏱ ETA: {{ o.eta }}</div>
              </div>
              <div class="order-right">
                <div class="order-value">R$ {{ (o.total/100).toFixed(2).replace('.',',') }}</div>
                <div class="order-eta">{{ o.status === 'pending' ? '🟠 Aguardando' : '🔵 Pronto' }}</div>
                <div class="order-actions">
                  <button class="btn btn-success btn-sm" (click)="aceitarPedido(o)">✓ Aceitar</button>
                  <button class="btn btn-danger btn-sm" (click)="recusarPedido(o)">✕ Recusar</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div class="card-title">📋 Histórico do Dia</div>
            <span class="pill pill-blue">3 concluídas</span>
          </div>
          <table class="deliveries-table">
            <thead><tr><th>Token</th><th>Cliente</th><th>Endereço</th><th>Valor</th><th>Status</th></tr></thead>
            <tbody>
              <tr>
                <td><span style="font-family:'Bebas Neue',cursive;color:var(--accent);font-weight:900">#A015</span></td>
                <td>Pedro Alves</td><td>Rua das Flores, 140</td>
                <td style="color:var(--green);font-family:'Bebas Neue',cursive;font-size:15px;font-weight:700">R$12,00</td>
                <td><span class="pill pill-green">✓ Entregue</span></td>
              </tr>
              <tr>
                <td><span style="font-family:'Bebas Neue',cursive;color:var(--accent);font-weight:900">#A016</span></td>
                <td>Carla Nogueira</td><td>Av. Brasil, 890</td>
                <td style="color:var(--green);font-family:'Bebas Neue',cursive;font-size:15px;font-weight:700">R$14,00</td>
                <td><span class="pill pill-green">✓ Entregue</span></td>
              </tr>
              <tr>
                <td><span style="font-family:'Bebas Neue',cursive;color:var(--accent);font-weight:900">#A017</span></td>
                <td>João Melo</td><td>Rua Palmeiras, 55</td>
                <td style="color:var(--green);font-family:'Bebas Neue',cursive;font-size:15px;font-weight:700">R$11,00</td>
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
            <div>
              <div class="card-title">📬 Novos Pedidos</div>
              <div class="card-sub">Pedidos em preparo ou prontos para entrega</div>
            </div>
            <button class="btn btn-secondary btn-sm" (click)="refreshOrders()">🔄 Atualizar</button>
          </div>
          <div class="order-list">
            <div *ngFor="let o of activeOrders()" class="order-card">
              <div class="order-token">{{ o.token }}</div>
              <div class="order-info">
                <div class="order-customer">👤 {{ o.customer }}</div>
                <div class="order-address">📍 {{ o.items }}</div>
                <div class="order-items">⏱ ETA: {{ o.eta }}</div>
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
              <ng-container *ngIf="mapSafeUrl(); else noMap">
                <iframe [src]="mapSafeUrl()" width="100%" height="100%" frameborder="0" style="border:0;border-radius:12px;" allowfullscreen></iframe>
              </ng-container>
              <ng-template #noMap>
                <div class="map-icon">📍</div>
                <p style="font-weight:700">Mapa indisponível</p>
                <p style="font-size:12px;color:var(--muted)">Endereço não disponível para esta entrega</p>
              </ng-template>
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
            <button class="btn btn-blue" style="flex:1" (click)="callCustomer()">📞 Ligar Cliente</button>
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
    /* ────── GLOBAL ────── */
    .app-shell { min-height:100vh; display:flex; flex-direction:column; background:var(--bg); font-family:'DM Sans',sans-serif; }

    /* ────── TOPBAR ────── */
    .topbar {
      height: 70px; background: var(--surface); border-bottom: 2px solid var(--border);
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 24px; position: sticky; top: 0; z-index: 100;
      box-shadow: 0 2px 16px rgba(0,0,0,0.1);
    }
    .topbar-left { display:flex; align-items:center; gap:16px; }
    .topbar-user { display:flex; align-items:center; gap:12px; margin-left:auto; }
    .topbar-logo { font-family:'Bebas Neue',cursive; font-size:26px; letter-spacing:3px; color:var(--accent); font-weight:900; }
    .topbar-avatar { 
      width:40px; height:40px; border-radius:50%; 
      background:linear-gradient(135deg,#FF9800,#FF4500); 
      display:flex; align-items:center; justify-content:center; 
      font-size:14px; font-weight:700; color:white;
      box-shadow: 0 2px 8px rgba(255,152,0,0.3);
    }
    .topbar-name { font-size:14px; font-weight:600; color:var(--text); }

    /* ────── MAIN CONTENT ────── */
    .main-content { 
      flex:1; padding:32px 24px; max-width:1400px; width:100%; margin:0 auto; 
    }

    /* ────── ONLINE TOGGLE ────── */
    .online-toggle-wrap {
      display:flex; align-items:center; justify-content:space-between;
      background:linear-gradient(135deg, var(--surface) 0%, var(--surface2) 100%);
      border:2px solid var(--border); border-radius:16px;
      padding:24px 28px; margin-bottom:28px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.08);
      transition:all .3s ease;
    }
    .online-toggle-wrap:hover {
      box-shadow: 0 6px 20px rgba(0,0,0,0.12);
      border-color:var(--accent);
    }
    .online-toggle-label { font-size:17px; font-weight:700; color:var(--text); }
    .online-toggle-sub { font-size:13px; color:var(--muted); margin-top:4px; }
    .toggle-switch { position:relative; display:inline-block; width:64px; height:34px; flex-shrink:0; }
    .toggle-switch input { opacity:0; width:0; height:0; }
    .toggle-slider {
      position:absolute; cursor:pointer; inset:0;
      background:var(--surface3); border-radius:30px; transition:all .4s ease;
      box-shadow: inset 0 2px 6px rgba(0,0,0,0.15);
    }
    .toggle-slider:before {
      content:''; position:absolute; height:28px; width:28px; left:3px; bottom:3px;
      background:white; border-radius:50%; transition:all .4s ease;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    }
    input:checked + .toggle-slider { background:var(--green); box-shadow: 0 6px 18px rgba(0,200,83,0.35); }
    input:checked + .toggle-slider:before { transform:translateX(30px); }

    /* ────── TABS ────── */
    .entregador-tabs {
      display:flex; gap:8px; background:var(--surface); border-radius:14px;
      padding:8px; margin-bottom:28px;
      overflow-x:auto;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
      border:1px solid var(--border);
    }
    .entregador-tab {
      flex:1; padding:13px 18px; background:transparent; border:none; border-radius:10px;
      color:var(--muted); font-family:'DM Sans',sans-serif; font-size:14px; font-weight:600;
      cursor:pointer; transition:all .3s cubic-bezier(0.34, 1.56, 0.64, 1); text-align:center; white-space:nowrap;
      border-bottom:3px solid transparent;
    }
    .entregador-tab.active { 
      background:linear-gradient(135deg, #FF9800 0%, #FF6F00 100%);
      color:white; 
      box-shadow: 0 4px 14px rgba(255,152,0,0.35);
      border-bottom-color: #FF9800;
      transform:scale(1.05);
    }
    .entregador-tab:hover:not(.active) { color:var(--text); background:rgba(255,152,0,0.06); }

    /* ────── STATS ROW ────── */
    .stats-row { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:28px; }
    .stat-card { 
      background:linear-gradient(135deg, var(--surface) 0%, var(--surface2) 100%);
      border:2px solid var(--border); border-radius:16px; padding:28px 24px; text-align:center;
      transition:all .35s cubic-bezier(0.34, 1.56, 0.64, 1);
      position:relative;
      overflow:hidden;
      cursor:pointer;
    }
    .stat-card:hover { 
      transform:translateY(-8px) scale(1.02);
      box-shadow: 0 12px 32px rgba(0,0,0,0.16);
      border-color:var(--accent);
      background:linear-gradient(135deg, rgba(255,152,0,0.05) 0%, var(--surface2) 100%);
    }
    .stat-card::before {
      content:''; position:absolute; top:-50%; right:-50%; width:200px; height:200px;
      background:radial-gradient(circle, rgba(255,152,0,0.08) 0%, transparent 70%);
      border-radius:50%;
      transition:all .4s ease;
    }
    .stat-card:hover::before {
      top:-30%; right:-30%;
    }
    .stat-icon { font-size:42px; margin-bottom:16px; position:relative; z-index:1; display:inline-block; }
    .stat-val { font-family:'Bebas Neue',cursive; font-size:36px; letter-spacing:2px; font-weight:900; position:relative; z-index:1; margin-bottom:8px; }
    .stat-lbl { font-size:12px; color:var(--muted); margin-top:8px; text-transform:uppercase; letter-spacing:0.7px; position:relative; z-index:1; font-weight:600; }

    /* ────── ORDER LIST ────── */
    .order-list { display:flex; flex-direction:column; gap:16px; }
    .order-card {
      background:linear-gradient(135deg, var(--surface2) 0%, rgba(255,152,0,0.02) 100%);
      border:2px solid var(--border); border-radius:14px;
      padding:22px 24px; display:flex; align-items:center; gap:20px;
      transition:all .3s cubic-bezier(0.34, 1.56, 0.64, 1);
      position:relative;
      overflow:hidden;
    }
    .order-card::before {
      content:''; position:absolute; left:0; top:0; width:4px; height:100%;
      background:var(--accent);
      transform:scaleY(0);
      transition:transform .35s ease;
    }
    .order-card:hover { 
      border-color:var(--accent);
      background:linear-gradient(135deg, var(--surface2) 0%, rgba(255,152,0,0.1) 100%);
      transform:translateX(6px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.1);
    }
    .order-card:hover::before { transform:scaleY(1); }
    .order-token { font-family:'Bebas Neue',cursive; font-size:28px; color:var(--accent); letter-spacing:2px; min-width:90px; font-weight:900; }
    .order-info { flex:1; }
    .order-customer { font-weight:700; font-size:16px; margin-bottom:6px; color:var(--text); }
    .order-address { font-size:13px; color:var(--muted); margin-bottom:6px; }
    .order-items { font-size:12px; color:var(--muted2); }
    .order-right { display:flex; flex-direction:column; align-items:flex-end; gap:10px; }
    .order-value { font-family:'Bebas Neue',cursive; font-size:22px; color:var(--green); font-weight:900; }
    .order-actions { display:flex; gap:8px; }
    .order-eta { font-size:12px; color:var(--muted); font-family:'DM Mono',monospace; }

    /* ────── BUTTONS ────── */
    .btn-logout {
      padding:10px 18px;
      background:transparent;
      border:2px solid var(--border);
      border-radius:10px;
      color:var(--muted);
      font-size:13px;
      font-weight:600;
      cursor:pointer;
      transition:all .3s cubic-bezier(0.34, 1.56, 0.64, 1);
      display:flex;
      align-items:center;
      gap:6px;
    }
    .btn-logout:hover { border-color:var(--accent); color:var(--accent); background:rgba(255,152,0,0.08); transform:translateY(-2px); }
    
    .btn { padding:12px 20px; border-radius:10px; border:none; font-weight:600; cursor:pointer; transition:all .3s ease; font-size:14px; }
    .btn-primary { background:linear-gradient(135deg,#FF9800,#FF6F00); color:white; }
    .btn-primary:hover { box-shadow: 0 6px 20px rgba(255,152,0,0.4); transform:translateY(-2px); }
    .btn-success { background:linear-gradient(135deg,#00c853,#00a040); color:white; }
    .btn-success:hover { box-shadow: 0 6px 20px rgba(0,200,83,0.4); transform:translateY(-2px); }
    .btn-danger { background:linear-gradient(135deg,#f44336,#d32f2f); color:white; }
    .btn-danger:hover { box-shadow: 0 6px 20px rgba(244,67,54,0.4); transform:translateY(-2px); }
    .btn-secondary { background:var(--surface2); color:var(--text); border:2px solid var(--border); }
    .btn-secondary:hover { background:var(--surface); border-color:var(--accent); color:var(--accent); }
    .btn-blue { background:linear-gradient(135deg,#2196F3,#1976D2); color:white; }
    .btn-blue:hover { box-shadow: 0 6px 20px rgba(33,150,243,0.4); transform:translateY(-2px); }
    .btn-sm { padding:8px 14px; font-size:12px; }
    .btn:disabled { opacity:0.5; cursor:not-allowed; transform:none; }

    /* ────── PILLS ────── */
    .pill { 
      display:inline-flex; align-items:center; gap:6px; padding:8px 14px; 
      border-radius:50px; font-size:12px; font-weight:700;
      letter-spacing:0.6px;
      transition:all .25s ease;
    }
    .pill:hover { transform:scale(1.05); }
    .pill-orange { background:rgba(255,152,0,0.15); color:var(--accent); border:1px solid rgba(255,152,0,0.3); }
    .pill-green  { background:rgba(0,200,83,0.15); color:var(--green); border:1px solid rgba(0,200,83,0.3); }
    .pill-gold   { background:rgba(255,184,0,0.15); color:var(--gold); border:1px solid rgba(255,184,0,0.3); }
    .pill-blue   { background:rgba(33,150,243,0.15); color:var(--blue); border:1px solid rgba(33,150,243,0.3); }
    .pill-gray   { background:rgba(102,102,102,0.15); color:var(--muted); border:1px solid rgba(102,102,102,0.3); }

    /* ────── MAP & ROUTE ────── */
    .map-placeholder {
      background:linear-gradient(135deg, var(--surface) 0%, var(--surface2) 100%);
      border:2px dashed var(--border); border-radius:16px;
      height:360px; display:flex; flex-direction:column; align-items:center; justify-content:center;
      gap:18px; color:var(--muted); margin-bottom:24px;
      position:relative;
      overflow:hidden;
      transition:all .3s ease;
    }
    .map-placeholder:hover {
      border-color:var(--accent);
      background:linear-gradient(135deg, rgba(255,152,0,0.02) 0%, var(--surface2) 100%);
    }
    .map-placeholder::before {
      content:''; position:absolute; inset:0;
      background:radial-gradient(circle at 50% 50%, rgba(255,152,0,0.08) 0%, transparent 70%);
    }
    .map-icon { font-size:56px; position:relative; z-index:1; animation:pulse 2.5s ease-in-out infinite; }
    @keyframes pulse { 0%, 100% { transform:scale(1); } 50% { transform:scale(1.12); } }

    .route-steps { display:flex; flex-direction:column; gap:20px; margin-bottom:24px; }
    .route-step { display:flex; gap:20px; padding-bottom:20px; position:relative; }
    .route-step:not(:last-child)::after {
      content:''; position:absolute; left:17px; top:40px; width:2px; height:calc(100% + 4px);
      background:var(--border);
      transition:all .3s ease;
    }
    .route-step.done::after { background:var(--green); box-shadow: 0 0 8px rgba(0,200,83,0.3); }
    .step-dot { 
      width:40px; height:40px; border-radius:50%; display:flex; align-items:center; 
      justify-content:center; font-size:18px; flex-shrink:0; z-index:2;
      background:var(--surface); border:2px solid var(--border);
      transition:all .35s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .route-step.done .step-dot { 
      background:var(--green); border-color:var(--green);
      box-shadow: 0 4px 14px rgba(0,200,83,0.35);
    }
    .route-step.active .step-dot {
      background:var(--accent); border-color:var(--accent);
      box-shadow: 0 4px 14px rgba(255,152,0,0.35);
      animation: pulse-active 2s ease-in-out infinite;
    }
    @keyframes pulse-active { 0%, 100% { box-shadow: 0 4px 14px rgba(255,152,0,0.35); } 50% { box-shadow: 0 8px 24px rgba(255,152,0,0.5); } }
    .step-info { flex:1; }
    .step-title { font-weight:700; font-size:16px; color:var(--text); }
    .step-sub { font-size:13px; color:var(--muted); margin-top:4px; }
    .step-time { font-size:12px; color:var(--muted); font-family:'DM Mono',monospace; font-weight:600; }

    /* ────── EARNINGS ────── */
    .earnings-period { display:flex; gap:10px; margin-bottom:24px; }
    .earnings-period button {
      flex:1; padding:13px 16px; border-radius:10px; border:2px solid var(--border);
      background:var(--surface2); color:var(--muted); font-size:13px; font-weight:600; 
      cursor:pointer; transition:all .3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .earnings-period button.active { 
      background:linear-gradient(135deg, #FF9800 0%, #FF6F00 100%);
      border-color:#FF9800; color:white;
      box-shadow: 0 6px 18px rgba(255,152,0,0.35);
      transform:scale(1.02);
    }
    .earnings-period button:hover:not(.active) { border-color:var(--accent); background:var(--surface); }
    .earnings-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:16px; margin-bottom:24px; }
    .earnings-card { 
      background:linear-gradient(135deg, var(--surface) 0%, var(--surface2) 100%);
      border:2px solid var(--border); border-radius:16px; padding:24px;
      transition:all .35s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .earnings-card:hover {
      transform:translateY(-4px) scale(1.02);
      border-color:var(--accent);
      box-shadow: 0 8px 24px rgba(255,152,0,0.18);
    }
    .earnings-lbl { font-size:11px; color:var(--muted); margin-bottom:12px; text-transform:uppercase; letter-spacing:0.7px; font-weight:700; }
    .earnings-val { font-family:'Bebas Neue',cursive; font-size:32px; font-weight:900; letter-spacing:1px; }

    /* ────── PROFILE ────── */
    .profile-header { 
      display:flex; align-items:center; gap:28px; padding:32px; 
      background:linear-gradient(135deg, var(--surface) 0%, var(--surface2) 100%);
      border:2px solid var(--border); border-radius:16px; margin-bottom:24px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.08);
      transition:all .3s ease;
    }
    .profile-header:hover {
      box-shadow: 0 8px 28px rgba(0,0,0,0.12);
      border-color:var(--accent);
    }
    .profile-avatar-lg { 
      width:90px; height:90px; border-radius:50%; 
      background:linear-gradient(135deg,#FF9800,#FF4500); 
      display:flex; align-items:center; justify-content:center; 
      font-size:36px; font-weight:700; flex-shrink:0;
      box-shadow: 0 6px 18px rgba(255,152,0,0.4);
      color:white;
      border:3px solid var(--surface2);
    }
    .profile-name { font-size:24px; font-weight:700; color:var(--text); }

    /* ────── VEHICLE SELECT ────── */
    .vehicle-select { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:24px; }
    .vehicle-btn { 
      display:flex; flex-direction:column; align-items:center; gap:12px; 
      padding:24px 18px; border-radius:14px; border:2px solid var(--border); 
      background:var(--surface); color:var(--muted); cursor:pointer; transition:all .35s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .vehicle-btn:hover {
      border-color:var(--accent);
      background:rgba(255,152,0,0.05);
      transform:translateY(-4px);
    }
    .vehicle-btn.active { 
      border-color:var(--accent); color:white; 
      background:linear-gradient(135deg,#FF9800,#FF6F00);
      box-shadow: 0 8px 24px rgba(255,152,0,0.35);
      transform:scale(1.04);
    }
    .v-icon { font-size:32px; }
    .v-name { font-weight:700; font-size:15px; }

    /* ────── FORMS ────── */
    .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:22px; }
    .form-row { display:flex; flex-direction:column; gap:10px; }
    .form-row label { font-size:12px; color:var(--muted); font-weight:700; text-transform:uppercase; letter-spacing:0.7px; }
    .form-row input { 
      width:100%; padding:14px 16px; background:var(--surface); border:2px solid var(--border); 
      border-radius:10px; color:var(--text); font-family:'DM Sans',sans-serif; font-size:14px;
      transition:all .3s ease;
    }
    .form-row input:focus { outline:none; border-color:var(--accent); background:var(--surface2); box-shadow: 0 0 0 4px rgba(255,152,0,0.12); }
    .form-row input:readonly { background:var(--surface2); color:var(--muted); cursor:default; }
    .auth-label { font-size:12px; color:var(--muted); font-weight:700; text-transform:uppercase; letter-spacing:0.7px; display:block; margin-bottom:10px; }
    .auth-input { 
      width:100%; padding:14px 16px; background:var(--surface); border:2px solid var(--border); 
      border-radius:10px; color:var(--text); font-family:'DM Sans',sans-serif; font-size:14px;
      transition:all .3s ease;
    }
    .auth-input:focus { outline:none; border-color:var(--accent); background:var(--surface2); box-shadow: 0 0 0 4px rgba(255,152,0,0.12); }

    /* ────── TABLES ────── */
    .deliveries-table {
      width:100%; border-collapse:collapse;
    }
    .deliveries-table thead {
      background:linear-gradient(135deg, var(--surface2) 0%, rgba(255,152,0,0.02) 100%);
      border-bottom:2px solid var(--border);
    }
    .deliveries-table th {
      padding:16px 18px; text-align:left; font-size:12px; font-weight:700;
      color:var(--muted); text-transform:uppercase; letter-spacing:0.7px;
    }
    .deliveries-table td {
      padding:18px; border-bottom:1px solid var(--border); font-size:14px; color:var(--text);
    }
    .deliveries-table tbody tr {
      transition:all .25s ease;
    }
    .deliveries-table tbody tr:hover {
      background:rgba(255,152,0,0.04);
      border-left:3px solid var(--accent);
      padding-left:15px;
    }

    /* ────── CARD ────── */
    .card {
      background:var(--surface); border:2px solid var(--border); border-radius:16px;
      padding:28px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
      transition:all .3s ease;
    }
    .card:hover {
      box-shadow: 0 4px 16px rgba(0,0,0,0.08);
      border-color:rgba(255,152,0,0.2);
    }
    .card-header {
      display:flex; align-items:center; justify-content:space-between;
      margin-bottom:24px;
    }
    .card-title { font-size:18px; font-weight:700; color:var(--text); }
    .card-sub { font-size:13px; color:var(--muted); margin-top:6px; }

    /* ────── RESPONSIVE ────── */
    @media(max-width:1024px) {
      .stats-row { grid-template-columns:repeat(2,1fr); }
      .form-grid { grid-template-columns:1fr; }
      .earnings-grid { grid-template-columns:1fr; }
      .vehicle-select { grid-template-columns:repeat(2,1fr); }
    }
    @media(max-width:768px) {
      .topbar { padding:0 16px; height:64px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
      .main-content { padding:28px 16px; }
      .entregador-tabs { flex-direction:column; gap:0; }
      .entregador-tab { width:100%; border-radius:0; padding:16px 18px; font-size:13px; }
      .entregador-tab.active { border-bottom-color: #FF9800; }
      .profile-header { flex-direction:column; text-align:center; gap:20px; }
      .stats-row { grid-template-columns:1fr; gap:14px; }
      .stat-card { padding:22px 20px; }
      .stat-icon { font-size:36px; }
      .stat-val { font-size:32px; }
      .order-card { flex-direction:column; align-items:flex-start; gap:16px; }
      .order-right { align-items:flex-start; width:100%; }
      .vehicle-select { grid-template-columns:repeat(2,1fr); gap:12px; }
      .earnings-grid { grid-template-columns:repeat(2,1fr); }
      .form-grid { grid-template-columns:1fr; gap:18px; }
    }
    @media(max-width:480px) {
      .topbar-name { display:none; }
      .topbar-logo { font-size:20px; letter-spacing:2px; }
      .topbar-avatar { width:36px; height:36px; font-size:13px; }
      .main-content { padding:20px 12px; }
      .online-toggle-wrap { padding:16px; flex-direction:column; align-items:flex-start; gap:14px; }
      .toggle-switch { width:56px; height:30px; }
      .toggle-slider:before { height:24px; width:24px; }
      input:checked + .toggle-slider:before { transform:translateX(26px); }
      .stats-row { grid-template-columns:1fr; gap:12px; }
      .stat-card { padding:18px 16px; margin-bottom:8px; }
      .stat-icon { font-size:32px; margin-bottom:12px; }
      .stat-val { font-size:28px; }
      .stat-lbl { font-size:11px; }
      .order-card { padding:16px; gap:12px; }
      .order-token { font-size:20px; min-width:70px; }
      .order-customer { font-size:14px; }
      .order-address { font-size:12px; }
      .order-items { font-size:11px; }
      .order-value { font-size:18px; }
      .vehicle-select { grid-template-columns:1fr; }
      .vehicle-btn { padding:20px 14px; }
      .v-icon { font-size:28px; }
      .v-name { font-size:13px; }
      .form-grid { grid-template-columns:1fr; }
      .form-row input { padding:12px 14px; font-size:13px; }
      .earnings-grid { grid-template-columns:1fr; gap:12px; }
      .earnings-card { padding:18px; }
      .earnings-val { font-size:26px; }
      .earnings-period button { padding:12px 14px; font-size:12px; }
      .entregador-tab { font-size:12px; padding:14px 16px; }
      .card { padding:20px; }
      .card-header { flex-direction:column; align-items:flex-start; gap:12px; margin-bottom:16px; }
      .card-title { font-size:16px; }
      .deliveries-table { font-size:11px; }
      .deliveries-table th, .deliveries-table td { padding:10px 8px; }
      .profile-avatar-lg { width:70px; height:70px; font-size:28px; }
      .pill { padding:6px 12px; font-size:11px; }
      .btn { padding:10px 16px; font-size:13px; }
      .btn-sm { padding:7px 12px; font-size:11px; }
      .map-placeholder { height:240px; gap:14px; }
      .map-icon { font-size:44px; }
      .route-steps { gap:16px; }
      .step-dot { width:32px; height:32px; font-size:14px; }
      .step-title { font-size:14px; }
      .step-sub { font-size:12px; }
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

  // Safe URL for embedded Google Maps (uses maps.google.com query to avoid API key)
  sanitizer = inject(DomSanitizer);
  mapSafeUrl = computed<SafeResourceUrl | null>(() => {
    const d = this.activeDelivery();
    if (!d) return null;
    const origin = encodeURIComponent('Dark Kitchen Cozinha Central');
    const dest = encodeURIComponent(d.items || d.customer || '');
    const url = `https://maps.google.com/maps?q=${origin}%20to%20${dest}&output=embed`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

  setTab(tab: string) { this.activeTab.set(tab); }
  toggleOnline(event: Event) { this.isOnline.set((event.target as HTMLInputElement).checked); }
  setPeriod(period: EarningPeriod) { this.activePeriod.set(period); }
  selectVehicle(id: string) { this.selectedVehicle.set(id); }
  
  aceitarPedido(o: Order) { 
    // Simular movimentação de pedido para ativo
    o.status = 'preparing';
    this.toast.show('✅ Pedido aceito! Aguarde o preparo.', 'success');
  }
  
  recusarPedido(o: Order) { 
    // Remove pedido da lista de disponíveis
    const orders = this.data.orders();
    const index = orders.findIndex(order => order.token === o.token);
    if (index > -1) {
      orders.splice(index, 1);
      this.data.orders.set([...orders]);
    }
    this.toast.show('❌ Pedido recusado com sucesso.', 'default');
  }
  
  confirmarEntrega() { 
    const delivery = this.activeDelivery();
    if (!delivery) return;
    
    this.deliveryConfirmed.set(true);
    
    // Move para histórico (simula conclusão)
    const orders = this.data.orders();
    const deliveryOrder = orders.find(o => o.token === delivery.token);
    if (deliveryOrder) {
      deliveryOrder.status = 'done';
      this.data.orders.set([...orders]);
    }
    
    this.toast.show('🎉 Entrega confirmada! Muito obrigado!', 'success');
    
    // Reset para próxima entrega
    setTimeout(() => {
      this.deliveryConfirmed.set(false);
      this.activeTab.set('dashboard');
    }, 2000);
  }
  
  refreshOrders() {
    this.toast.show('🔄 Atualizando lista de pedidos...', 'default');
    // Simula delay de atualização
    setTimeout(() => {
      this.toast.show('✅ Pedidos atualizados!', 'success');
    }, 800);
  }
  
  callCustomer() {
    const delivery = this.activeDelivery();
    if (!delivery) {
      this.toast.show('⚠️ Nenhuma entrega ativa', 'default');
      return;
    }
    
    // Simula chamada telefônica
    this.toast.show(`📞 Ligando para ${delivery.customer}...`, 'default');
    
    // Simula duração da chamada
    setTimeout(() => {
      this.toast.show('✅ Chamada finalizada', 'success');
    }, 3000);
  }
  
  saveProfile() {
    // Valida dados obrigatórios
    if (!this.profileName || !this.profileEmail || !this.profileCPF || !this.profilePhone) {
      this.toast.show('⚠️ Preencha todos os campos!', 'default');
      return;
    }
    
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
