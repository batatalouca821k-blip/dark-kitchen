import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login.component';
import { ClientMenuComponent } from './features/client/menu/client-menu.component';
import { CheckoutComponent } from './features/client/checkout/checkout.component';
import { TrackingComponent } from './features/client/tracking/tracking.component';
import { LoyaltyComponent } from './features/client/loyalty/loyalty.component';
import { ClientProfileComponent } from './features/client/profile/profile.component';
import { AdminShellComponent } from './features/admin/admin-shell.component';
import { AdminDashboardComponent } from './features/admin/dashboard/admin-dashboard.component';
import { AdminOrdersComponent } from './features/admin/orders/admin-orders.component';
import { AdminProductsComponent } from './features/admin/products/admin-products.component';
import { AdminStockComponent } from './features/admin/stock/admin-stock.component';
import { AdminUsersComponent } from './features/admin/users/admin-users.component';
import { AdminLoyaltyComponent } from './features/admin/loyalty-admin/admin-loyalty.component';
import { AdminMarketComponent } from './features/admin/market/admin-market.component';
import { AdminDeliveryComponent } from './features/admin/delivery/admin-delivery.component';
import { EntregadorComponent } from './features/entregador/entregador.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login',       component: LoginComponent },
  { path: 'entregador',  component: EntregadorComponent },
  { path: 'client',      component: ClientMenuComponent },
  { path: 'checkout',    component: CheckoutComponent },
  { path: 'tracking',    component: TrackingComponent },
  { path: 'loyalty',     component: LoyaltyComponent },
  { path: 'profile',     component: ClientProfileComponent },
  {
    path: 'admin',
    component: AdminShellComponent,
    children: [
      { path: '',          redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'orders',    component: AdminOrdersComponent },
      { path: 'products',  component: AdminProductsComponent },
      { path: 'stock',     component: AdminStockComponent },
      { path: 'users',     component: AdminUsersComponent },
      { path: 'delivery',  component: AdminDeliveryComponent },
      { path: 'loyalty',   component: AdminLoyaltyComponent },
      { path: 'market',    component: AdminMarketComponent },
    ]
  },
  { path: '**', redirectTo: 'login' }
];
