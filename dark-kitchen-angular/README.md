# 🔥 Dark Kitchen — Angular 17

Sistema completo de gestão para dark kitchens, com painel de cliente e admin.

## ✅ Correções aplicadas

- Adicionado `admin-shared.scss` ao `angular.json` (bug principal: classes `.admin-page-title` e `.admin-subtitle` não carregavam)
- Adicionadas classes `.admin-page-title` e `.admin-subtitle` ao `styles.scss`
- `ProductModalComponent`: `selectedExtras` convertido de `Set` para `signal<string[]>` (reatividade Angular 17)
- `AdminMarketComponent`: carrinho convertido de `Map` para `signal<Record>` + `cartCount`/`cartTotal` como `computed`
- `AdminOrdersComponent`: `pending`, `preparing`, `done` convertidos para `computed()`
- `AdminProductsComponent`, `AdminUsersComponent`, `AdminStockComponent`, `AdminMarketComponent`: `filtered` convertido para `computed()`, `search`/`catFilter` para `signal`, `[(ngModel)]` corrigido
- `AdminUsersComponent`: `[style.border-color]` → `[style.borderColor]` (camelCase)
- `LoyaltyComponent`: `filteredRewards` convertido para `computed()`

## 🚀 Como rodar

```bash
npm install
npm start
```

Abra [http://localhost:4200](http://localhost:4200)

## 🔑 Acesso demo

Use os botões de acesso rápido na tela de login:
- **👤 Cliente** — acessa o cardápio, carrinho, rastreamento e fidelidade
- **🔑 Admin** — acessa o painel completo com dashboard, pedidos, produtos, estoque, usuários, fidelidade e marketplace

## 📁 Estrutura

```
src/app/
├── core/
│   ├── models/        # Interfaces TypeScript
│   └── services/      # DataService, AuthService, CartService, ToastService
├── features/
│   ├── auth/          # Login
│   ├── client/        # Menu, Checkout, Tracking, Loyalty
│   └── admin/         # Dashboard, Orders, Products, Stock, Users, Loyalty, Market
└── shared/
    └── components/    # Toast, NavSwitcher
```

## 🛠 Stack

- Angular 17 (Standalone Components + Signals)
- SCSS com CSS Variables
- Sem dependências externas além do Angular
