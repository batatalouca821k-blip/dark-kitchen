import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

type LoginRole = 'entregador' | 'client' | 'admin';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div id="screen-login" class="screen active">
    <div class="login-card">
      <div class="login-header">
        <div class="login-logo">🔥 DARK KITCHEN</div>
        <div class="login-sub">Portal de Acesso</div>
      </div>

      <div class="role-tabs">
        <button type="button" *ngFor="let role of roles"
          class="role-tab"
          [class.active]="selectedRole() === role.id"
          [attr.data-role]="role.id"
          (click)="selectRole(role.id)">
          {{ role.label }}
        </button>
      </div>

      <div class="login-body">
        <div class="login-error" [class.visible]="loginError">{{ loginError }}</div>

        <div class="field" *ngIf="isRegister()">
          <label>Nome completo</label>
          <input [(ngModel)]="name" placeholder="Seu nome">
        </div>

        <div class="field">
          <label>Email</label>
          <input [(ngModel)]="email" type="email" placeholder="seu@email.com">
        </div>

        <div class="field pw-wrap">
          <label>Senha</label>
          <input [(ngModel)]="password" [type]="showPw() ? 'text' : 'password'" placeholder="••••••••">
          <button type="button" class="pw-eye" (click)="togglePw()" title="Mostrar senha">
            {{ showPw() ? '🙈' : '👁' }}
          </button>
        </div>

        <button type="button" class="btn-login" (click)="submit()">
          {{ isRegister() ? '✓ Criar conta' : '→ Entrar' }}
        </button>

        <div class="login-footer">
          <div class="login-footer-text">
            {{ isRegister() ? 'Já tem conta?' : 'Não tem conta?' }}
            <span class="auth-link" (click)="toggleRegister()">
              {{ isRegister() ? 'Fazer login' : 'Criar agora' }}
            </span>
          </div>

          <div class="demo-hint">
            <p>Credenciais de demo</p>
            <div class="demo-credentials">
              <div class="demo-cred" (click)="fillDemo('entregador@dk.com','entrega123','entregador')">🛵 <span>entregador&#64;dk.com</span> / entrega123</div>
              <div class="demo-cred" (click)="fillDemo('cliente@dk.com','cliente123','client')">👤 <span>cliente&#64;dk.com</span> / cliente123</div>
              <div class="demo-cred" (click)="fillDemo('admin@dk.com','admin123','admin')">🔑 <span>admin&#64;dk.com</span> / admin123</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
    #screen-login {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background: var(--bg);
    }

    .login-card {
      width: 100%;
      max-width: 440px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--r2);
      overflow: hidden;
      box-shadow: 0 24px 80px rgba(0, 0, 0, .2);
    }

    .login-header {
      padding: 32px 36px 24px;
      border-bottom: 1px solid var(--border);
      text-align: center;
    }

    .login-logo {
      font-family: 'Bebas Neue', cursive;
      font-size: 42px;
      letter-spacing: 4px;
      color: var(--accent);
      text-shadow: 0 0 30px rgba(255, 69, 0, .5);
    }

    .login-sub {
      font-size: 13px;
      color: var(--muted);
      margin-top: 4px;
    }

    .role-tabs {
      display: flex;
      gap: 0;
      padding: 20px 36px 0;
      background: var(--surface);
    }

    .role-tab {
      flex: 1;
      padding: 10px 8px;
      background: transparent;
      border: 1px solid var(--border);
      border-bottom: none;
      border-radius: 10px 10px 0 0;
      color: var(--muted);
      font-family: 'DM Sans', sans-serif;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all .2s;
      text-align: center;
      background: var(--surface);
    }

    .role-tab:not(:last-child) {
      border-right: none;
    }

    .role-tab.active {
      background: var(--surface2);
      color: var(--text);
      border-color: var(--border);
    }

    .role-tab[data-role="client"].active { color: var(--green); }
    .role-tab[data-role="entregador"].active { color: #FF9800; }
    .role-tab[data-role="admin"].active { color: var(--blue); }

    .login-body {
      padding: 24px 36px 32px;
      background: var(--surface2);
    }

    .login-error {
      display: none;
      background: rgba(244, 67, 54, .1);
      border: 1px solid rgba(244, 67, 54, .3);
      border-radius: var(--r);
      padding: 10px 14px;
      font-size: 13px;
      color: #f44336;
      margin-bottom: 14px;
      text-align: center;
    }

    .login-error.visible {
      display: block;
    }

    .field {
      margin-bottom: 16px;
    }

    .field label {
      display: block;
      font-size: 12px;
      font-weight: 600;
      color: var(--muted);
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: .5px;
    }

    .field input {
      width: 100%;
      padding: 12px 14px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--r);
      color: var(--text);
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      transition: border-color .2s;
    }

    .field input:focus {
      outline: none;
      border-color: var(--accent);
    }

    .field input::placeholder {
      color: var(--muted2);
    }

    .pw-wrap {
      position: relative;
    }

    .pw-wrap input {
      padding-right: 44px;
    }

    .pw-eye {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      cursor: pointer;
      font-size: 16px;
      opacity: .5;
      transition: opacity .2s;
      background: none;
      border: none;
      color: inherit;
    }

    .pw-eye:hover {
      opacity: 1;
    }

    .btn-login {
      width: 100%;
      padding: 14px;
      background: var(--accent);
      color: white;
      border: none;
      border-radius: var(--r);
      font-family: 'DM Sans', sans-serif;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(255, 69, 0, .4);
      transition: all .25s;
      margin-top: 8px;
    }

    .btn-login:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 28px rgba(255, 69, 0, .55);
    }

    .login-footer {
      margin-top: 24px;
    }

    .login-footer-text {
      text-align: center;
      font-size: 13px;
      color: var(--muted);
      margin-bottom: 16px;
    }

    .auth-link {
      color: var(--accent);
      cursor: pointer;
      font-weight: 600;
      margin-left: 4px;
    }

    .auth-link:hover {
      text-decoration: underline;
    }

    .demo-hint {
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid var(--border);
      text-align: center;
    }

    .demo-hint p {
      font-size: 11px;
      color: var(--muted);
      margin-bottom: 8px;
    }

    .demo-credentials {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .demo-cred {
      font-size: 11px;
      color: var(--muted2);
      font-family: 'DM Mono', monospace;
      padding: 8px 12px;
      background: var(--surface);
      border-radius: 8px;
      cursor: pointer;
      transition: color .2s;
    }

    .demo-cred:hover {
      color: var(--accent);
    }

    .demo-cred span {
      color: var(--muted);
    }

    @media(max-width:768px) {
      #screen-login {
        padding: 16px;
      }
      .login-card {
        max-width: 100%;
      }
      .role-tabs {
        padding: 16px 24px 0;
      }
      .login-body {
        padding: 20px 24px 28px;
      }
    }
  `]
})
export class LoginComponent {
  auth = inject(AuthService);

  isRegister = signal(false);
  showPw = signal(false);
  selectedRole = signal<LoginRole>('entregador');

  name = '';
  email = '';
  password = '';
  loginError = '';

  roles: { id: LoginRole; label: string }[] = [
    { id: 'entregador', label: '🛵 Entregador' },
    { id: 'client', label: '👤 Cliente' },
    { id: 'admin', label: '🔑 Admin' }
  ];

  submit() {
    this.loginError = '';
    const role = this.selectedRole();

    if (role === 'entregador') {
      this.auth.loginAsEntregador();
      return;
    }

    if (role === 'admin') {
      this.auth.loginAsAdmin();
      return;
    }

    if (!this.email || !this.password) {
      this.loginError = 'Preencha email e senha para continuar.';
      return;
    }

    this.auth.loginAsClient(this.email);
  }

  togglePw() {
    this.showPw.update(value => !value);
  }

  toggleRegister() {
    this.isRegister.update(value => !value);
  }

  selectRole(role: LoginRole) {
    this.selectedRole.set(role);
  }

  fillDemo(email: string, password: string, role: LoginRole) {
    this.email = email;
    this.password = password;
    this.selectedRole.set(role);
  }
}
