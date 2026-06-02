import { Injectable, signal, computed } from '@angular/core';
import { CartItem } from '../models';

@Injectable({ providedIn: 'root' })
export class CartService {
  items = signal<CartItem[]>([]);

  count  = computed(() => this.items().reduce((a, i) => a + i.qty, 0));
  total  = computed(() => this.items().reduce((a, i) => a + i.price * i.qty, 0));

  add(item: Omit<CartItem, 'qty'> & { qty?: number }) {
    this.items.update(list => {
      const found = list.find(i => i.id === item.id);
      if (found) {
        return list.map(i => i.id === item.id ? { ...i, qty: i.qty + (item.qty ?? 1) } : i);
      }
      return [...list, { ...item, qty: item.qty ?? 1 }];
    });
  }

  remove(id: number) {
    this.items.update(list => list.filter(i => i.id !== id));
  }

  changeQty(id: number, delta: number) {
    this.items.update(list =>
      list.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i)
    );
  }

  clear() { this.items.set([]); }
}
