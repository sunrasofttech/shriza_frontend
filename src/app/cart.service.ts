import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { environment } from '../environments/environment';

export interface CartItem {
  itemId: string;
  quantity: number;
  productId: string;
  productName: string;
  slug: string;
  unitLabel: string | null;
  thumbnailUrl: string | null;
  variantId: string | null;
  variantSize: string | null;
  sku: string | null;
  effectivePrice: number;
  effectiveMrp: number;
  stockAvailable: number;
  isAvailable: boolean;
  lineTotal: number;
}

export interface CartSummary {
  bagSubtotal: number;
  couponDiscount: number;
  couponCode: string | null;
  couponType: string | null;
  discountLabel: string;
  shippingFee: number;
  shippingLabel: string;
  estimatedTax: number;
  totalPayable: number;
}

export interface CartCoupon {
  id: string;
  code: string;
  type: string;
  discountValue: number;
}

export interface AvailableCoupon {
  id: string;
  code: string;
  type: string;
  discountValue: number;
  minOrderValue: number | null;
  description: string | null;
}

export interface CartState {
  cartId: string | null;
  items: CartItem[];
  coupon: CartCoupon | null;
  summary: CartSummary;
  itemCount: number;
}

function emptySummary(): CartSummary {
  return {
    bagSubtotal: 0, couponDiscount: 0, couponCode: null, couponType: null,
    discountLabel: 'Coupon Discount', shippingFee: 0, shippingLabel: 'FREE',
    estimatedTax: 0, totalPayable: 0,
  };
}

function emptyState(): CartState {
  return { cartId: null, items: [], coupon: null, summary: emptySummary(), itemCount: 0 };
}

function resolveUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  return path.startsWith('/') ? `${environment.imageUrl}${path}` : path;
}

function mapItem(raw: any): CartItem {
  return {
    itemId:         raw.itemId,
    quantity:       raw.quantity,
    productId:      raw.productId,
    productName:    raw.productName,
    slug:           raw.slug,
    unitLabel:      raw.unitLabel ?? null,
    thumbnailUrl:   resolveUrl(raw.thumbnailUrl),
    variantId:      raw.variantId ?? null,
    variantSize:    raw.variantSize ?? null,
    sku:            raw.sku ?? null,
    effectivePrice: raw.effective_price,
    effectiveMrp:   raw.effective_mrp,
    stockAvailable: raw.stockAvailable,
    isAvailable:    raw.isAvailable,
    lineTotal:      raw.lineTotal,
  };
}

function mapState(data: any): CartState {
  return {
    cartId:    data.cartId ?? null,
    items:     (data.items ?? []).map(mapItem),
    coupon:    data.coupon ?? null,
    summary:   data.summary ?? emptySummary(),
    itemCount: data.itemCount ?? 0,
  };
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly BASE = `${environment.apiUrl}/api/user/cart`;
  private readonly OPTS = { withCredentials: true };

  private _state = new BehaviorSubject<CartState>(emptyState());
  readonly state$ = this._state.asObservable();

  constructor(private http: HttpClient) {}

  get state(): CartState { return this._state.value; }
  get items(): CartItem[] { return this._state.value.items; }
  get count(): number { return this._state.value.itemCount; }
  get subtotal(): number { return this._state.value.summary.bagSubtotal; }

  fetchCart(): Observable<CartState> {
    return this.http.get<any>(this.BASE, this.OPTS).pipe(
      map(r => mapState(r.data)),
      tap(s => this._state.next(s))
    );
  }

  addItem(productId: string, variantId: string | null = null, quantity = 1): Observable<CartState> {
    return this.http.post<any>(`${this.BASE}/items`, { productId, variantId, quantity }, this.OPTS).pipe(
      map(r => mapState(r.data)),
      tap(s => this._state.next(s))
    );
  }

  setItemQty(itemId: string, quantity: number): Observable<CartState> {
    return this.http.patch<any>(`${this.BASE}/items/${itemId}`, { quantity }, this.OPTS).pipe(
      map(r => mapState({ ...this.state, ...r.data })),
      tap(s => this._state.next(s))
    );
  }

  removeItem(itemId: string): Observable<CartState> {
    return this.http.delete<any>(`${this.BASE}/items/${itemId}`, this.OPTS).pipe(
      map(r => mapState({ ...this.state, ...r.data })),
      tap(s => this._state.next(s))
    );
  }

  clearCart(): Observable<any> {
    return this.http.delete<any>(this.BASE, this.OPTS).pipe(
      tap(() => this._state.next(emptyState()))
    );
  }

  applyCoupon(code: string): Observable<{ coupon: CartCoupon; summary: CartSummary }> {
    return this.http.post<any>(`${this.BASE}/apply-coupon`, { code }, this.OPTS).pipe(
      map(r => r.data),
      tap(data => this._state.next({ ...this.state, coupon: data.coupon, summary: data.summary }))
    );
  }

  removeCoupon(): Observable<any> {
    return this.http.delete<any>(`${this.BASE}/coupon`, this.OPTS).pipe(
      map(r => r.data),
      tap(data => this._state.next({
        ...this.state,
        coupon: null,
        summary: data?.summary ?? { ...this.state.summary, couponDiscount: 0, couponCode: null }
      }))
    );
  }

  getAvailableCoupons(): Observable<AvailableCoupon[]> {
    return this.http.get<any>(`${this.BASE}/available-coupons`, this.OPTS).pipe(
      map(r => r.data.coupons as AvailableCoupon[])
    );
  }
}
