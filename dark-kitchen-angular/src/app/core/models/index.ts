// ── PRODUCT ──
export interface Product {
  id: number;
  name: string;
  desc: string;
  emoji: string;
  imageUrl?: string;  // URL da imagem (substitui o emoji se fornecida)
  price: number;   // centavos
  time: string;    // "~15 min"
  cat: string[];   // ['burger','destaque']
  badge?: string;
  badgeStyle?: string;
  stars?: string;
  reviews?: number;
}

// ── CART ──
export interface CartItem {
  id: number;
  name: string;
  emoji: string;
  price: number;
  qty: number;
  addons?: string;
}

// ── ORDER ──
export type OrderStatus = 'pending' | 'preparing' | 'done';

export interface Order {
  id: number;
  token: string;
  customer: string;
  items: string;
  total: number;
  eta: string;
  time: string;
  status: OrderStatus;
}

// ── USER ──
export type UserRole   = 'client' | 'admin';
export type UserStatus = 'active' | 'blocked';
export type UserTier   = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface AppUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  pts: number;
  orders: number;
  tier: UserTier;
  avatar: string;
  color: string;
}

export interface DeliveryPerson {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'offline';
  deliveries: number;
  vehicles: string;
  avatar: string;
  color: string;
}

// ── RAW MATERIAL (Matéria-prima) ──
export type MPStatus = 'ok' | 'low' | 'critical';
export interface RawMaterial {
  id: number;
  name: string;
  cat: string;
  emoji: string;
  qty: number;
  min: number;
  unit: string;
  cost: number;
  supplier: string;
}

// ── TRACKING ──
export interface TrackingStep {
  icon: string;
  label: string;
  title: string;
  time: string;
  done: boolean;
}

// ── LOYALTY REWARD ──
export interface Reward {
  id: number;
  name: string;
  desc: string;
  emoji: string;
  pts: number;
  cat: string;
  valid?: string;
  featured?: boolean;
}

// ── MARKET PRODUCT ──
export interface MarketProduct {
  id: number;
  name: string;
  brand: string;
  emoji: string;
  price: number;
  unit: string;
  cat: string;
  tag?: 'offer' | 'low' | 'new';
}
