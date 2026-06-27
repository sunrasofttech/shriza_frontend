import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CartItem {
  id: string;
  name: string;
  size: string;
  price: number;
  image: string;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private itemsSubject = new BehaviorSubject<CartItem[]>([
    {
      id: 'p19',
      name: 'Tulsi-Curcumin Lung Shield Tablets',
      size: '60 Tablets',
      price: 491.18,
      image: 'https://placehold.co/160x160/eef3ea/2f4f3f?text=Lung+Shield',
      quantity: 2
    }
  ]);

  items$ = this.itemsSubject.asObservable();

  get items(): CartItem[] {
    return this.itemsSubject.value;
  }

  get count(): number {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  get subtotal(): number {
    return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  addItem(item: CartItem): void {
    const existing = this.items.find((cartItem) => cartItem.id === item.id);
    if (existing) {
      this.updateQuantity(item.id, existing.quantity + item.quantity);
      return;
    }
    this.itemsSubject.next([...this.items, item]);
  }

  updateQuantity(id: string, quantity: number): void {
    if (quantity < 1) {
      return;
    }
    this.itemsSubject.next(this.items.map((item) => (item.id === id ? { ...item, quantity } : item)));
  }

  removeItem(id: string): void {
    this.itemsSubject.next(this.items.filter((item) => item.id !== id));
  }

  clearCart(): void {
    this.itemsSubject.next([]);
  }
}
