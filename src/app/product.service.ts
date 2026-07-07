import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../environments/environment';

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  thumbnailUrl: string | null;
  productCount: number;
}

export interface ProductSummary {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  shortDescription: string | null;
  unitLabel: string | null;
  thumbnailUrl: string | null;
  imageUrl: string | null;
  category: { id: string; name: string; slug: string };
  subcategory: { id: string; name: string; slug: string } | null;
  pricing: { sellingPrice: number; mrp: number; discountPercent: number | null };
  rating: { avg: number; count: number };
  stock: { quantity: number; isInStock: boolean };
  badges: { isFeatured: boolean; isTrending: boolean; isNewArrival: boolean; isBestSeller: boolean };
  tags: string[];
  isWishlisted: boolean;
}

export interface FilterMeta {
  categories: ProductCategory[];
  priceRange: { min: number; max: number };
  ratingOptions: Array<{ label: string; value: number }>;
  sortOptions: Array<{ label: string; value: string }>;
}

export interface ProductListFilters {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface ProductListResult {
  products: ProductSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ProductImage {
  id: string;
  imageUrl: string;
  thumbnailUrl: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductVariant {
  id: string;
  size: string | null;
  color: string | null;
  sku: string;
  mrp: number;
  sellingPrice: number;
  discountPercent: number | null;
  stockQuantity: number;
  isInStock: boolean;
}

export interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  brand: string | null;
  shortDescription: string | null;
  unitLabel: string | null;
  category: { id: string; name: string; slug: string };
  subcategory: { id: string; name: string; slug: string } | null;
  pricing: { sellingPrice: number; mrp: number; discountPercent: number | null; gstPercent: number | null };
  stock: { quantity: number; isInStock: boolean; isLowStock: boolean };
  images: ProductImage[];
  variants: ProductVariant[];
  tabs: { benefits: string | null; ingredients: string | null; howToUse: string | null; warnings: string | null };
  badges: { isFeatured: boolean; isTrending: boolean; isNewArrival: boolean; isBestSeller: boolean };
  tags: string[];
  isWishlisted: boolean;
}

export interface ProductDetailResult {
  product: ProductDetail;
  ratings: { avg: number; count: number; distribution: Record<string, number> };
  faqs: Array<{ id: string; question: string; answer: string }>;
  relatedProducts: ProductSummary[];
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly BASE = `${environment.apiUrl}/api/user/products`;

  constructor(private http: HttpClient) {}

  getFilterMeta(): Observable<FilterMeta> {
    return this.http.get<any>(`${this.BASE}/filters`).pipe(map(r => r.data));
  }

  listProducts(filters: ProductListFilters = {}): Observable<ProductListResult> {
    let params = new HttpParams();
    if (filters.q)                              params = params.set('q', filters.q);
    if (filters.category)                       params = params.set('category', filters.category);
    if (filters.minPrice != null && filters.minPrice > 0) params = params.set('minPrice', String(filters.minPrice));
    if (filters.maxPrice != null)               params = params.set('maxPrice', String(filters.maxPrice));
    if (filters.minRating != null && filters.minRating > 0) params = params.set('minRating', String(filters.minRating));
    if (filters.inStock)                        params = params.set('inStock', 'true');
    if (filters.sort)                           params = params.set('sort', filters.sort);
    if (filters.page)                           params = params.set('page', String(filters.page));
    if (filters.limit)                          params = params.set('limit', String(filters.limit));

    return this.http.get<any>(this.BASE, { params, withCredentials: true }).pipe(
      map(r => ({ products: r.data.products, pagination: r.data.pagination }))
    );
  }

  getProduct(slug: string): Observable<ProductDetailResult> {
    return this.http.get<any>(`${this.BASE}/${slug}`, { withCredentials: true }).pipe(
      map(r => r.data)
    );
  }

  resolveImageUrl(path: string | null | undefined): string | null {
    if (!path) return null;
    return path.startsWith('/') ? `${environment.imageUrl}${path}` : path;
  }
}
