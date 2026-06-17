import { Injectable, signal } from '@angular/core';

export type OrderStatus = 'new' | 'preparing' | 'ready';

export interface Order {
  id: string;
  table?: string;
  items: { name: string; qty: number }[];
  status: OrderStatus;
  createdAt: number;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private _orders = signal<Order[]>([
    { id: 'o1', table: 'A1', items: [{ name: 'Hambúrguer', qty: 2 }], status: 'new', createdAt: Date.now() - 1000 * 60 },
    { id: 'o2', table: 'B2', items: [{ name: 'Pizza', qty: 1 }], status: 'preparing', createdAt: Date.now() - 1000 * 120 },
    { id: 'o3', table: 'C3', items: [{ name: 'Salada', qty: 1 }], status: 'ready', createdAt: Date.now() - 1000 * 300 },
  ]);

  // If true, orders are managed by remote API synchronization
  useApi = signal(false);

  get orders() { return this._orders; }

  addOrder(order: Omit<Order, 'createdAt'>) {
    const newOrder: Order = { ...order, createdAt: Date.now() };
    this._orders.update(list => [newOrder, ...list]);
  }

  setOrders(orders: Order[]) {
    this._orders.set(orders);
  }

  updateStatus(id: string, status: OrderStatus) {
    this._orders.update(list => list.map(o => o.id === id ? { ...o, status } : o));
  }

  removeOrder(id: string) {
    this._orders.update(list => list.filter(o => o.id !== id));
  }
}
