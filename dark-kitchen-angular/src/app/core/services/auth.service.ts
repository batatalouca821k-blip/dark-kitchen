import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

export type AuthRole = 'client' | 'admin' | 'entregador' | null;

@Injectable({ providedIn: 'root' })
export class AuthService {
  role = signal<AuthRole>(null);
  userName = signal<string>('');

  constructor(private router: Router) {}

  loginAsClient(name = 'João Silva') {
    this.role.set('client');
    this.userName.set(name);
    this.router.navigate(['/client']);
  }

  loginAsAdmin() {
    this.role.set('admin');
    this.userName.set('Carlos Admin');
    this.router.navigate(['/admin']);
  }

  loginAsEntregador() {
    this.role.set('entregador');
    this.userName.set('Marcos Silva');
    this.router.navigate(['/entregador']);
  }

  logout() {
    this.role.set(null);
    this.userName.set('');
    this.router.navigate(['/login']);
  }

  get isLoggedIn() { return this.role() !== null; }
}
