import { Injectable, signal } from '@angular/core';

export interface ToastState {
  message: string;
  type: 'default' | 'success';
  visible: boolean;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  state = signal<ToastState>({ message: '', type: 'default', visible: false });

  private _timer: any;

  show(message: string, type: 'default' | 'success' = 'default', duration = 2800) {
    clearTimeout(this._timer);
    this.state.set({ message, type, visible: true });
    this._timer = setTimeout(() => {
      this.state.update(s => ({ ...s, visible: false }));
    }, duration);
  }
}
