import { Injectable, signal } from '@angular/core';
import { Product, Order, RawMaterial, AppUser, DeliveryPerson, Reward, MarketProduct } from '../models';

@Injectable({ providedIn: 'root' })
export class DataService {

  /* ── PRODUCTS ── */
  products = signal<Product[]>([
    { id:1,  name:'Smash Burger Duplo',     desc:'2 patties, cheddar, molho especial, pickles',            emoji:'🍔', price:3990, time:'~15 min', cat:['burger','destaque'], badge:'⭐ DESTAQUE', stars:'★★★★★', reviews:284 },
    { id:2,  name:'Chicken Crispy',         desc:'Frango crocante, coleslaw, cheddar, jalapeño',           emoji:'🍗', price:3200, time:'~18 min', cat:['burger'], stars:'★★★★☆', reviews:156 },
    { id:3,  name:'BBQ Bacon Burger',       desc:'Blend costela, bacon, gouda, molho BBQ defumado',        emoji:'🥓', price:4490, time:'~16 min', cat:['burger'], badge:'🔥 NOVO', badgeStyle:'background:rgba(255,69,0,.15);color:var(--accent)', stars:'★★★★★', reviews:42 },
    { id:4,  name:'Veggie Smash',           desc:'Grão-de-bico e beterraba, queijo vegano, ervas',         emoji:'🥦', price:3490, time:'~14 min', cat:['burger'], badge:'🌱 VEGAN', badgeStyle:'background:rgba(139,195,74,.1);color:#8bc34a', stars:'★★★★☆', reviews:88 },
    { id:5,  name:'Smash Burger Triplo',    desc:'Três smash patties 120g, cheddar, bacon, molho especial',emoji:'🍔', price:4690, time:'~15 min', cat:['burger','destaque'], badge:'🔥 #1', stars:'★★★★★', reviews:320 },
    { id:6,  name:'Pizza Margherita',       desc:'Molho artesanal, búfala, manjericão, azeite EV',         emoji:'🍕', price:4500, time:'~20 min', cat:['pizza','destaque'], stars:'★★★★★', reviews:312 },
    { id:7,  name:'Pizza Calabresa Especial',desc:'Calabresa artesanal, cebola roxa, mussarela, azeitona', emoji:'🍕', price:5200, time:'~22 min', cat:['pizza','destaque'], badge:'⭐ TOP', stars:'★★★★★', reviews:198 },
    { id:8,  name:'Pizza 4 Queijos',        desc:'Mussarela, provolone, grana padano, gorgonzola',         emoji:'🍕', price:5500, time:'~20 min', cat:['pizza'], stars:'★★★★☆', reviews:145 },
    { id:9,  name:'Poke Bowl Salmão',       desc:'Salmão marinado, edamame, manga, abacate, arroz integral',emoji:'🥗', price:3990, time:'~10 min', cat:['bowl','destaque'], badge:'💚 SAUDÁVEL', badgeStyle:'background:rgba(0,200,83,.1);color:var(--green)', stars:'★★★★★', reviews:203 },
    { id:10, name:'Açaí Power Bowl',        desc:'Açaí 500ml, granola, banana, morango, mel',              emoji:'🫐', price:2890, time:'~5 min',  cat:['bowl'], stars:'★★★★☆', reviews:97 },
    { id:11, name:'Birria Tacos',           desc:'Carne desfiada, queijo oaxaca, cebola, coentro, consomê',emoji:'🌮', price:3800, time:'~20 min', cat:['tacos'], badge:'🆕 NOVO', badgeStyle:'background:rgba(0,200,83,.15);color:var(--green)', stars:'★★★★★', reviews:29 },
    { id:12, name:'Tacos Al Pastor',        desc:'Frango al pastor, abacaxi grelhado, coentro, cebola',    emoji:'🌮', price:3200, time:'~15 min', cat:['tacos'], stars:'★★★★☆', reviews:74 },
    { id:13, name:'Cacio e Pepe',           desc:'Espaguete al dente, pecorino romano, pimenta moída',     emoji:'🍝', price:4200, time:'~18 min', cat:['pasta'], badge:'⚡ CHEF', badgeStyle:'background:rgba(255,184,0,.2);color:var(--gold)', stars:'★★★★★', reviews:112 },
    { id:14, name:'Carbonara Clássica',     desc:'Guanciale, ovos, pecorino, pimenta preta',               emoji:'🍝', price:4400, time:'~20 min', cat:['pasta'], stars:'★★★★★', reviews:88 },
    { id:15, name:'Shake Pistache',         desc:'Shake cremoso de pistache, chantilly artesanal',          emoji:'🥤', price:2400, time:'~5 min',  cat:['drink'], badge:'🌿 NOVO', badgeStyle:'background:rgba(139,195,74,.2);color:#8bc34a', stars:'★★★★★', reviews:54 },
    { id:16, name:'Limonada Suíça',         desc:'Limão, leite condensado, sorvete, creme',                emoji:'🍋', price:1800, time:'~3 min',  cat:['drink'], stars:'★★★★☆', reviews:143 },
    { id:17, name:'Brownie Vulcão',         desc:'Brownie quentinho, sorvete baunilha, calda de chocolate', emoji:'🍫', price:2200, time:'~8 min',  cat:['dessert'], stars:'★★★★★', reviews:189 },
    { id:18, name:'Cheesecake de Frutas',   desc:'Base de biscoito, creme de queijo, frutas vermelhas',    emoji:'🍰', price:1900, time:'~2 min',  cat:['dessert'], stars:'★★★★☆', reviews:76 },
  ]);

  /* ── ORDERS ── */
  orders = signal<Order[]>([
    { id:1, token:'#A019', customer:'Lucas Ferreira',  items:'Smash Burger Duplo × 2, Coca-Cola',          total:9380, eta:'~12 min', time:'14:28', status:'pending'   },
    { id:2, token:'#A020', customer:'Mariana Costa',   items:'Pizza Margherita, Shake Pistache',            total:6900, eta:'~8 min',  time:'14:31', status:'pending'   },
    { id:3, token:'#A021', customer:'Rafael Souza',    items:'Birria Tacos × 3, Limonada Suíça',            total:12000, eta:'~5 min', time:'14:33', status:'preparing' },
    { id:4, token:'#A022', customer:'Ana Lima',        items:'Poke Bowl Salmão, Açaí Power Bowl',           total:6880, eta:'~2 min',  time:'14:35', status:'preparing' },
    { id:5, token:'#A018', customer:'Pedro Alves',     items:'Carbonara Clássica, Brownie Vulcão',           total:6600, eta:'✓ Pronto', time:'14:20', status:'done'  },
  ]);

  /* ── USERS ── */
  users = signal<AppUser[]>([
    { id:1, name:'Ana Lima',       email:'ana@email.com',    role:'client', status:'active',  pts:1240, orders:18, tier:'gold',   avatar:'AL', color:'#FF4500' },
    { id:2, name:'Pedro Alves',    email:'pedro@email.com',  role:'client', status:'active',  pts:380,  orders:5,  tier:'bronze', avatar:'PA', color:'#9C27B0' },
    { id:3, name:'Mariana Costa',  email:'mari@email.com',   role:'client', status:'active',  pts:2100, orders:34, tier:'gold',   avatar:'MC', color:'#2196F3' },
    { id:4, name:'Lucas Ferreira', email:'lucas@email.com',  role:'client', status:'blocked', pts:50,   orders:2,  tier:'bronze', avatar:'LF', color:'#E91E63' },
    { id:5, name:'Carlos Admin',   email:'admin@email.com',  role:'admin',  status:'active',  pts:0,    orders:0,  tier:'platinum',avatar:'CA', color:'#FF9800'},
  ]);

  deliveryPeople = signal<DeliveryPerson[]>([
    { id:1, name:'Marcos Silva',    email:'marcos@darkkitchen.com', status:'active', deliveries:32, vehicles:'Moto', avatar:'MS', color:'#FF9800' },
    { id:2, name:'Renata Alves',    email:'renata@darkkitchen.com', status:'active', deliveries:24, vehicles:'Bike', avatar:'RA', color:'#2196F3' },
    { id:3, name:'Gustavo Pereira', email:'gustavo@darkkitchen.com', status:'offline', deliveries:18, vehicles:'Carro', avatar:'GP', color:'#9C27B0' },
  ]);

  /* ── RAW MATERIALS ── */
  rawMaterials = signal<RawMaterial[]>([
    { id:1,  name:'Hambúrguer 180g',  cat:'carnes',      emoji:'🥩', qty:42,  min:10, unit:'un',  cost:8.50,  supplier:'Mercado' },
    { id:2,  name:'Frango Crispy',    cat:'carnes',      emoji:'🍗', qty:28,  min:8,  unit:'un',  cost:6.00,  supplier:'Frigorífico' },
    { id:3,  name:'Bacon Fatiado',    cat:'carnes',      emoji:'🥓', qty:3,   min:5,  unit:'kg',  cost:32.00, supplier:'Atacadão' },
    { id:4,  name:'Mussarela',        cat:'laticinios',  emoji:'🧀', qty:12,  min:4,  unit:'kg',  cost:28.00, supplier:'Laticínios SP' },
    { id:5,  name:'Cheddar Fatiado',  cat:'laticinios',  emoji:'🧀', qty:8,   min:3,  unit:'kg',  cost:35.00, supplier:'Laticínios SP' },
    { id:6,  name:'Alface',           cat:'vegetais',    emoji:'🥬', qty:1,   min:5,  unit:'kg',  cost:4.50,  supplier:'Hortifruti' },
    { id:7,  name:'Tomate',           cat:'vegetais',    emoji:'🍅', qty:6,   min:4,  unit:'kg',  cost:6.00,  supplier:'Hortifruti' },
    { id:8,  name:'Pão Brioche',      cat:'graos',       emoji:'🍞', qty:80,  min:20, unit:'un',  cost:1.20,  supplier:'Padaria' },
    { id:9,  name:'Molho Especial',   cat:'condimentos', emoji:'🧂', qty:5,   min:2,  unit:'L',   cost:12.00, supplier:'Distribuidor' },
    { id:10, name:'Coca-Cola 2L',     cat:'bebidas',     emoji:'🥤', qty:0,   min:12, unit:'un',  cost:5.50,  supplier:'Coca-Cola' },
    { id:11, name:'Água Mineral',     cat:'bebidas',     emoji:'💧', qty:36,  min:12, unit:'un',  cost:1.20,  supplier:'Distribuidor' },
    { id:12, name:'Embalagem Burger', cat:'embalagens',  emoji:'📦', qty:150, min:50, unit:'un',  cost:0.80,  supplier:'Fornecedor' },
  ]);

  /* ── REWARDS ── */
  rewards = signal<Reward[]>([
    { id:1, name:'Burger Grátis',       desc:'Smash Burger Duplo completo sem custo', emoji:'🍔', pts:500,  cat:'comida',    valid:'Válido por 30 dias', featured:true },
    { id:2, name:'Pizza Inteira',        desc:'Qualquer pizza do cardápio',            emoji:'🍕', pts:800,  cat:'comida',    valid:'Válido por 30 dias', featured:true },
    { id:3, name:'Frete Grátis',         desc:'Próximo pedido sem taxa de entrega',    emoji:'🛵', pts:200,  cat:'desconto',  valid:'Válido por 15 dias' },
    { id:4, name:'20% OFF',             desc:'Desconto no próximo pedido',            emoji:'🏷️', pts:300,  cat:'desconto',  valid:'Uso único' },
    { id:5, name:'Shake Grátis',        desc:'Qualquer shake do cardápio',            emoji:'🥤', pts:250,  cat:'comida' },
    { id:6, name:'Sobremesa Grátis',    desc:'Brownie ou Cheesecake à escolha',       emoji:'🍮', pts:350,  cat:'comida' },
    { id:7, name:'Kit Surpresa',        desc:'Box exclusiva com brindes Dark Kitchen',emoji:'🎁', pts:1000, cat:'especial',  valid:'Edição limitada', featured:true },
    { id:8, name:'Cashback R$10',       desc:'Crédito direto no próximo pedido',      emoji:'💸', pts:400,  cat:'desconto' },
  ]);

  /* ── MARKET PRODUCTS ── */
  marketProducts = signal<MarketProduct[]>([
    { id:1,  name:'Hambúrguer 180g',  brand:'Friboi',       emoji:'🥩', price:8.50,  unit:'un',  cat:'carnes',      tag:'offer' },
    { id:2,  name:'Frango Crispy',    brand:'Sadia',        emoji:'🍗', price:5.90,  unit:'un',  cat:'carnes' },
    { id:3,  name:'Bacon Fatiado',    brand:'Perdigão',     emoji:'🥓', price:31.00, unit:'kg',  cat:'carnes',      tag:'low' },
    { id:4,  name:'Mussarela',        brand:'Tirolez',      emoji:'🧀', price:27.50, unit:'kg',  cat:'laticinios' },
    { id:5,  name:'Cheddar Fatiado',  brand:'Président',    emoji:'🧀', price:34.00, unit:'kg',  cat:'laticinios',  tag:'offer' },
    { id:6,  name:'Alface Crespa',    brand:'Hortifruti',   emoji:'🥬', price:4.20,  unit:'kg',  cat:'vegetais',    tag:'new' },
    { id:7,  name:'Tomate Italiano',  brand:'Hortifruti',   emoji:'🍅', price:5.80,  unit:'kg',  cat:'vegetais' },
    { id:8,  name:'Pão Brioche',      brand:'Bimbo',        emoji:'🍞', price:1.10,  unit:'un',  cat:'graos' },
    { id:9,  name:'Coca-Cola 2L',     brand:'Coca-Cola',    emoji:'🥤', price:5.20,  unit:'un',  cat:'bebidas',     tag:'offer' },
    { id:10, name:'Água Mineral',     brand:'Crystal',      emoji:'💧', price:1.10,  unit:'un',  cat:'bebidas' },
    { id:11, name:'Embalagem Burger', brand:'PackPlus',     emoji:'📦', price:0.75,  unit:'un',  cat:'embalagens',  tag:'new' },
    { id:12, name:'Embalagem Pizza',  brand:'PackPlus',     emoji:'📦', price:1.40,  unit:'un',  cat:'embalagens' },
  ]);

  /* ── HELPERS ── */
  formatPrice(cents: number): string {
    return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;
  }

  formatPriceR(value: number): string {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  }

  mpStatus(item: RawMaterial): 'ok' | 'low' | 'critical' {
    if (item.qty === 0 || item.qty < item.min * 0.5) return 'critical';
    if (item.qty < item.min) return 'low';
    return 'ok';
  }

  mpPct(item: RawMaterial): number {
    return Math.min(100, Math.round((item.qty / (item.min * 3)) * 100));
  }

  addUser(user: AppUser) { this.users.update(l => [...l, user]); }
  updateUser(u: AppUser) { this.users.update(l => l.map(x => x.id === u.id ? u : x)); }
  deleteUser(id: number) { this.users.update(l => l.filter(x => x.id !== id)); }

  addDeliveryPerson(person: DeliveryPerson) { this.deliveryPeople.update(l => [...l, person]); }
  updateDeliveryPerson(person: DeliveryPerson) { this.deliveryPeople.update(l => l.map(x => x.id === person.id ? person : x)); }
  deleteDeliveryPerson(id: number) { this.deliveryPeople.update(l => l.filter(x => x.id !== id)); }

  updateMP(item: RawMaterial) { this.rawMaterials.update(l => l.map(x => x.id === item.id ? item : x)); }

  advanceOrder(id: number) {
    this.orders.update(list => list.map(o => {
      if (o.id !== id) return o;
      const next: Record<string, 'pending' | 'preparing' | 'done'> = { pending:'preparing', preparing:'done' };
      return { ...o, status: next[o.status] ?? o.status };
    }));
  }
}
