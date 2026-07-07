import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CartService, CartState, AvailableCoupon } from '../cart.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit, OnDestroy {
  cartState: CartState = this.cartService.state;
  availableCoupons: AvailableCoupon[] = [];

  loading = false;
  couponLoading = false;
  updatingItems = new Set<string>();

  errorMsg = '';
  couponError = '';
  couponSuccess = '';
  promoCode = '';

  private destroy$ = new Subject<void>();

  constructor(public cartService: CartService) {}

  ngOnInit(): void {
    this.cartService.state$.pipe(takeUntil(this.destroy$)).subscribe(s => {
      this.cartState = s;
    });

    this.loading = true;
    this.cartService.fetchCart().subscribe({
      next: () => {
        this.loading = false;
        this.loadAvailableCoupons();
      },
      error: () => { this.loading = false; }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadAvailableCoupons(): void {
    this.cartService.getAvailableCoupons().subscribe({
      next: (coupons) => { this.availableCoupons = coupons; },
      error: () => {}
    });
  }

  decrement(itemId: string, current: number): void {
    if (current <= 1 || this.updatingItems.has(itemId)) return;
    this.updatingItems.add(itemId);
    this.cartService.setItemQty(itemId, current - 1).subscribe({
      next: () => this.updatingItems.delete(itemId),
      error: () => this.updatingItems.delete(itemId)
    });
  }

  increment(itemId: string, current: number, stock: number): void {
    if (current >= stock || this.updatingItems.has(itemId)) return;
    this.updatingItems.add(itemId);
    this.cartService.setItemQty(itemId, current + 1).subscribe({
      next: () => this.updatingItems.delete(itemId),
      error: () => this.updatingItems.delete(itemId)
    });
  }

  removeItem(itemId: string): void {
    if (this.updatingItems.has(itemId)) return;
    this.updatingItems.add(itemId);
    this.cartService.removeItem(itemId).subscribe({
      next: () => { this.updatingItems.delete(itemId); this.loadAvailableCoupons(); },
      error: () => this.updatingItems.delete(itemId)
    });
  }

  clearCart(): void {
    if (!confirm('Clear all items from your cart?')) return;
    this.cartService.clearCart().subscribe({
      next: () => { this.availableCoupons = []; },
      error: () => {}
    });
  }

  applyCode(code: string): void {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed || this.couponLoading) return;
    this.couponError = '';
    this.couponSuccess = '';
    this.couponLoading = true;
    this.cartService.applyCoupon(trimmed).subscribe({
      next: (data) => {
        this.couponSuccess = `Coupon ${data.coupon.code} applied!`;
        this.promoCode = '';
        this.couponLoading = false;
      },
      error: (err) => {
        this.couponError = err?.error?.message || 'Invalid coupon code.';
        this.couponLoading = false;
      }
    });
  }

  removeAppliedCoupon(): void {
    this.couponError = '';
    this.couponSuccess = '';
    this.cartService.removeCoupon().subscribe({ error: () => {} });
  }

  isUpdating(itemId: string): boolean {
    return this.updatingItems.has(itemId);
  }

  itemImage(thumbnailUrl: string | null, name: string): string {
    return thumbnailUrl || `https://placehold.co/160x160/eef3ea/2f4f3f?text=${encodeURIComponent(name)}`;
  }
}
