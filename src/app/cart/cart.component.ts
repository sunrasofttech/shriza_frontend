import { Component } from '@angular/core';
import { CartService } from '../cart.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent {
  constructor(public cart: CartService) {}

  promoCode = '';
  appliedCoupon: string | null = 'FIRSTORDER';
  discountPercent = 15;
  availableCoupons = ['FIRSTORDER', 'FLAT10', 'NATURAL20'];

  get subtotal(): number {
    return this.cart.subtotal;
  }

  get discountAmount(): number {
    return this.appliedCoupon ? Math.round(this.subtotal * (this.discountPercent / 100)) : 0;
  }

  get taxAmount(): number {
    return Math.round((this.subtotal - this.discountAmount) * 0.05);
  }

  get total(): number {
    return this.subtotal - this.discountAmount + this.taxAmount;
  }

  applyCode(code: string): void {
    if (!code) {
      return;
    }
    const percentByCode: Record<string, number> = {
      FIRSTORDER: 15,
      FLAT10: 10,
      NATURAL20: 20
    };
    this.appliedCoupon = code.toUpperCase();
    this.discountPercent = percentByCode[this.appliedCoupon] ?? 10;
    this.promoCode = '';
  }

  removeCoupon(): void {
    this.appliedCoupon = null;
    this.discountPercent = 0;
  }

  saveForLater(): void {
    // placeholder until wishlist/save-for-later API is wired up
  }
}
