import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { OrderService, Order } from './order.service';

@Injectable({ providedIn: 'root' })
export class OrderApiService {
  private pollId: any = null;
  private baseUrl = ''; // configure base URL when starting

  constructor(private http: HttpClient, private orderService: OrderService) {}

  start(baseUrl = '', interval = 5000) {
    this.baseUrl = baseUrl || this.baseUrl;
    if (!this.baseUrl) { console.warn('OrderApiService: no baseUrl provided'); }
    this.stop();
    this.fetchOnce();
    this.pollId = setInterval(() => this.fetchOnce(), interval);
    this.orderService.useApi.set(true);
  }

  stop() {
    if (this.pollId) { clearInterval(this.pollId); this.pollId = null; }
    this.orderService.useApi.set(false);
  }

  fetchOnce() {
    const url = this.baseUrl ? `${this.baseUrl.replace(/\/$/, '')}/orders` : '/api/orders';
    this.http.get<Order[]>(url).subscribe({
      next: (orders) => {
        this.orderService.setOrders(orders || []);
      },
      error: (err) => console.warn('OrderApiService fetch error', err)
    });
  }
}
