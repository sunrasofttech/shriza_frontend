import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../environments/environment';

export interface WishlistItem {
  id: string;
  productId: string;
  productName: string;
  slug: string;
  category: string | null;
  thumbnailUrl: string | null;
  pricing: { sellingPrice: number; mrp: number; discountPct: number };
  inStock: boolean;
  addedAt: string;
}

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private base = `${environment.apiUrl}/api/user/wishlist`;
  private _ids = new BehaviorSubject<Set<string>>(new Set());
  readonly wishlistIds$ = this._ids.asObservable();

  constructor(private http: HttpClient) {}

  fetchWishlistedIds(): void {
    this.http.get<any>(this.base, { withCredentials: true }).subscribe({
      next: r => {
        const ids = new Set<string>(
          (r.data?.items || []).map((i: any) => i.productId as string)
        );
        this._ids.next(ids);
      },
      error: () => {}
    });
  }

  list(): Observable<WishlistItem[]> {
    return this.http.get<any>(this.base, { withCredentials: true }).pipe(
      map(r => (r.data?.items || []).map(this.mapItem))
    );
  }

  toggle(productId: string): Observable<{ wishlisted: boolean }> {
    return this.http
      .post<any>(`${this.base}/${productId}/toggle`, {}, { withCredentials: true })
      .pipe(
        tap(r => {
          const ids = new Set(this._ids.value);
          if (r.data?.wishlisted) ids.add(productId);
          else ids.delete(productId);
          this._ids.next(ids);
        }),
        map(r => ({ wishlisted: !!r.data?.wishlisted }))
      );
  }

  remove(productId: string): Observable<void> {
    return this.http
      .delete<any>(`${this.base}/${productId}`, { withCredentials: true })
      .pipe(
        tap(() => {
          const ids = new Set(this._ids.value);
          ids.delete(productId);
          this._ids.next(ids);
        }),
        map(() => undefined)
      );
  }

  moveToCart(productId: string): Observable<void> {
    return this.http
      .post<any>(`${this.base}/${productId}/move-to-cart`, {}, { withCredentials: true })
      .pipe(
        tap(() => {
          const ids = new Set(this._ids.value);
          ids.delete(productId);
          this._ids.next(ids);
        }),
        map(() => undefined)
      );
  }

  isWishlisted(productId: string): boolean {
    return this._ids.value.has(productId);
  }

  private mapItem(i: any): WishlistItem {
    const base = environment.imageUrl;
    const thumb = i.thumbnailUrl
      ? i.thumbnailUrl.startsWith('/') ? base + i.thumbnailUrl : i.thumbnailUrl
      : null;
    return {
      id: i.id,
      productId: i.productId,
      productName: i.productName,
      slug: i.slug,
      category: i.category ?? null,
      thumbnailUrl: thumb,
      pricing: {
        sellingPrice: i.pricing?.sellingPrice ?? 0,
        mrp: i.pricing?.mrp ?? 0,
        discountPct: i.pricing?.discountPct ?? 0,
      },
      inStock: !!i.inStock,
      addedAt: i.addedAt,
    };
  }
}
