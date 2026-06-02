import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../core/services/data.service';
import { ToastService } from '../../../core/services/toast.service';
import { Product } from '../../../core/models';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div>
    <div class="admin-page-title">PRODUTOS</div>
    <div class="admin-subtitle">Gerencie o cardápio</div>

    <div class="toolbar">
      <input class="search-input" [ngModel]="search()" (ngModelChange)="search.set($event)" placeholder="🔍 Buscar produto...">
      <button class="btn-primary" (click)="openNew()">+ Novo Produto</button>
    </div>

    <div class="products-table-wrap">
      <table class="products-table">
        <thead>
          <tr>
            <th>Produto</th>
            <th>Categoria</th>
            <th>Preço</th>
            <th>Tempo</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let p of filtered()">
            <td>
              <div class="pt-product-cell">
                <div style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;border-radius:8px;background:var(--surface2);font-size:22px;overflow:hidden">
                  <img *ngIf="p.imageUrl" [src]="p.imageUrl" style="width:100%;height:100%;object-fit:cover" [alt]="p.name">
                  <span *ngIf="!p.imageUrl" style="font-size:22px">{{ p.emoji }}</span>
                </div>
                <div>
                  <div class="pt-name">{{ p.name }}</div>
                  <div class="pt-desc">{{ p.desc }}</div>
                </div>
              </div>
            </td>
            <td><span class="pt-cat" *ngFor="let c of p.cat">{{ c }}</span></td>
            <td><span class="pt-price">{{ data.formatPrice(p.price) }}</span></td>
            <td><span class="pt-time">{{ p.time }}</span></td>
            <td>
              <div style="display:flex;gap:6px">
                <button class="icon-btn" (click)="edit(p)" title="Editar">✏️</button>
                <button class="icon-btn danger" (click)="remove(p)" title="Remover">🗑</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div class="confirm-overlay" [class.open]="editing()">
      <div class="confirm-modal" style="max-width:480px;text-align:left">
        <div class="modal-handle"></div>
        <div style="font-family:'Bebas Neue',cursive;font-size:22px;letter-spacing:1px;margin-bottom:18px">
          {{ editForm.id ? 'EDITAR PRODUTO' : 'NOVO PRODUTO' }}
        </div>
        <div style="display:flex;gap:10px;margin-bottom:12px">
          <div style="flex:1">
            <label class="auth-label">Emoji</label>
            <input class="auth-input" [(ngModel)]="editForm.emoji" style="font-size:22px">
          </div>
          <div style="flex:3">
            <label class="auth-label">Nome</label>
            <input class="auth-input" [(ngModel)]="editForm.name" placeholder="Nome do produto">
          </div>
        </div>
        <div style="margin-bottom:12px">
          <label class="auth-label">URL da Imagem (opcional)</label>
          <input class="auth-input" [(ngModel)]="editForm.imageUrl" placeholder="https://exemplo.com/imagem.jpg">
          <div *ngIf="editForm.imageUrl" style="margin-top:8px;border-radius:8px;overflow:hidden;max-height:100px">
            <img [src]="editForm.imageUrl" style="width:100%;height:100%;object-fit:cover" alt="Preview">
          </div>
        </div>
        <div style="margin-bottom:12px">
          <label class="auth-label">Descrição</label>
          <input class="auth-input" [(ngModel)]="editForm.desc" placeholder="Ingredientes, descrição...">
        </div>
        <div style="display:flex;gap:10px;margin-bottom:20px">
          <div style="flex:1">
            <label class="auth-label">Preço (R$)</label>
            <input class="auth-input" [(ngModel)]="editForm.priceStr" placeholder="39,90">
          </div>
          <div style="flex:1">
            <label class="auth-label">Tempo</label>
            <input class="auth-input" [(ngModel)]="editForm.time" placeholder="~15 min">
          </div>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn-secondary" style="flex:1" (click)="editing.set(false)">Cancelar</button>
          <button class="btn-primary" style="flex:1" (click)="save()">Salvar</button>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .toolbar { display:flex; gap:12px; margin-bottom:20px; }
    .products-table-wrap { background:var(--surface); border:1px solid var(--border); border-radius:var(--r2); overflow:hidden; }
    .products-table { width:100%; border-collapse:collapse; }
    .products-table th { padding:12px 16px; text-align:left; font-size:11px; color:var(--muted); letter-spacing:1.5px; text-transform:uppercase; background:var(--surface2); border-bottom:1px solid var(--border); }
    .products-table td { padding:12px 16px; border-bottom:1px solid var(--border); font-size:13px; vertical-align:middle; }
    .products-table tr:last-child td { border-bottom:none; }
    .products-table tr:hover td { background:rgba(255,255,255,.02); }
    .pt-product-cell { display:flex; align-items:center; gap:10px; }
    .pt-name { font-size:13px; font-weight:600; }
    .pt-desc { font-size:11px; color:var(--muted); margin-top:2px; max-width:240px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .pt-cat { background:var(--surface2); border:1px solid var(--border); border-radius:50px; padding:2px 8px; font-size:10px; color:var(--muted); margin-right:4px; }
    .pt-price { font-family:'DM Mono',monospace; color:var(--accent2); }
    .pt-time { color:var(--muted); }
  `]
})
export class AdminProductsComponent {
  data  = inject(DataService);
  toast = inject(ToastService);
  search  = signal('');
  editing = signal(false);
  editForm: any = {};

  filtered = computed(() => {
    const t = this.search().toLowerCase();
    return this.data.products().filter(p =>
      !t || p.name.toLowerCase().includes(t) || p.desc.toLowerCase().includes(t)
    );
  });

  openNew() {
    this.editForm = { id: null, emoji: '🍔', name: '', desc: '', imageUrl: '', priceStr: '', time: '~15 min', cat: ['burger'] };
    this.editing.set(true);
  }

  edit(p: Product) {
    this.editForm = { ...p, priceStr: (p.price / 100).toFixed(2).replace('.', ','), imageUrl: p.imageUrl || '' };
    this.editing.set(true);
  }

  save() {
    const price = Math.round(parseFloat(this.editForm.priceStr.replace(',', '.')) * 100) || 0;
    if (this.editForm.id) {
      this.data.products.update(list =>
        list.map(p => p.id === this.editForm.id ? { ...this.editForm, price, imageUrl: this.editForm.imageUrl || undefined } : p)
      );
      this.toast.show('✅ Produto atualizado!', 'success');
    } else {
      const newId = Math.max(...this.data.products().map(p => p.id)) + 1;
      this.data.products.update(list => [...list, { ...this.editForm, id: newId, price, imageUrl: this.editForm.imageUrl || undefined, cat: ['burger'] }]);
      this.toast.show('✅ Produto criado!', 'success');
    }
    this.editing.set(false);
  }

  remove(p: Product) {
    this.data.products.update(list => list.filter(x => x.id !== p.id));
    this.toast.show(`🗑 "${p.name}" removido!`);
  }
}
