import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { ProductService, ProductSummary, FilterMeta } from '../product.service';
import { CartService } from '../cart.service';
import { WishlistService } from '../wishlist.service';
import { AuthService } from '../auth.service';

type ViewMode = 'grid' | 'list';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit, OnDestroy {
  // Filter meta loaded from API
  filterMeta: FilterMeta | null = null;
  priceFloor = 0;
  priceCeil = 2000;

  // Active filter state
  keyword = '';
  selectedCategory = '';
  minPrice = 0;
  maxPrice = 2000;
  minRating = 0;
  inStockOnly = false;
  sortBy = 'newest';

  // UI state
  viewMode: ViewMode = 'grid';
  filtersOpen = false;
  loading = false;
  metaLoading = true;

  // Results
  products: ProductSummary[] = [];
  pagination = { page: 1, limit: 12, total: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false };

  private destroy$ = new Subject<void>();
  private keywordChange$ = new Subject<string>();

  // Cart state per product card
  addingCartId: string | null = null;
  addedCartId: string | null = null;
  private addedTimer: any;

  // Wishlist state
  wishlistIds = new Set<string>();
  wishlistTogglingId: string | null = null;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    public wishlistService: WishlistService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Pre-fill keyword from query param (e.g. from navbar search)
    const q = this.route.snapshot.queryParamMap.get('q');
    if (q) this.keyword = q;

    const cat = this.route.snapshot.queryParamMap.get('category');
    if (cat) this.selectedCategory = cat;

    // Load wishlisted product IDs for heart button state
    this.wishlistService.wishlistIds$.pipe(takeUntil(this.destroy$)).subscribe(ids => {
      this.wishlistIds = ids;
    });
    this.wishlistService.fetchWishlistedIds();

    // Debounce keyword input so every keystroke doesn't fire a request
    this.keywordChange$.pipe(
      debounceTime(420),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => this.loadProducts(1));

    this.productService.getFilterMeta().subscribe({
      next: (meta) => {
        this.filterMeta = meta;
        this.priceFloor = Math.floor(meta.priceRange.min) || 0;
        this.priceCeil  = Math.ceil(meta.priceRange.max / 100) * 100 || 2000;
        this.maxPrice   = this.priceCeil;
        this.metaLoading = false;
        this.loadProducts(1);
      },
      error: () => {
        this.metaLoading = false;
        this.loadProducts(1);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProducts(page = 1): void {
    this.loading = true;
    this.productService.listProducts({
      q:         this.keyword.trim() || undefined,
      category:  this.selectedCategory || undefined,
      maxPrice:  this.maxPrice,
      minPrice:  this.minPrice > this.priceFloor ? this.minPrice : undefined,
      minRating: this.minRating > 0 ? this.minRating : undefined,
      inStock:   this.inStockOnly || undefined,
      sort:      this.sortBy,
      page,
      limit:     12
    }).subscribe({
      next: (result) => {
        this.products   = result.products;
        this.pagination = result.pagination;
        this.loading    = false;
        if (page > 1) window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: () => { this.loading = false; }
    });
  }

  // ── Filter helpers ──────────────────────────────────────────────────────────

  onKeywordChange(): void {
    this.keywordChange$.next(this.keyword);
  }

  toggleCategory(slug: string): void {
    this.selectedCategory = this.selectedCategory === slug ? '' : slug;
  }

  isCategorySelected(slug: string): boolean {
    return this.selectedCategory === slug;
  }

  setMinRating(value: number): void {
    this.minRating = this.minRating === value ? 0 : value;
  }

  applyFilters(): void {
    this.filtersOpen = false;
    this.loadProducts(1);
  }

  clearFilters(): void {
    this.keyword          = '';
    this.selectedCategory = '';
    this.maxPrice         = this.priceCeil;
    this.minPrice         = this.priceFloor;
    this.minRating        = 0;
    this.inStockOnly      = false;
    this.loadProducts(1);
  }

  setSort(value: string): void {
    this.sortBy = value;
    this.loadProducts(1);
  }

  // ── View / pagination ───────────────────────────────────────────────────────

  setView(mode: ViewMode): void { this.viewMode = mode; }

  openFilters(): void  { this.filtersOpen = true; }
  closeFilters(): void { this.filtersOpen = false; }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.pagination.totalPages) {
      this.loadProducts(page);
    }
  }

  getPageRange(): number[] {
    const { page, totalPages } = this.pagination;
    const start = Math.max(1, page - 2);
    const end   = Math.min(totalPages, page + 2);
    const range: number[] = [];
    for (let i = start; i <= end; i++) range.push(i);
    return range;
  }

  // ── Display helpers ─────────────────────────────────────────────────────────

  stars(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => (i < Math.round(rating) ? 1 : 0));
  }

  productImage(p: ProductSummary): string {
    const resolved = this.productService.resolveImageUrl(p.thumbnailUrl || p.imageUrl);
    return resolved || `https://placehold.co/480x480/eef3ea/2f4f3f?text=${encodeURIComponent(p.name)}`;
  }

  badgeText(p: ProductSummary): string | null {
    if (p.badges.isBestSeller) return 'Best Seller';
    if (p.badges.isNewArrival) return 'New Arrival';
    if (p.pricing.discountPercent) return `${p.pricing.discountPercent}% OFF`;
    if (p.badges.isTrending)   return 'Trending';
    if (p.badges.isFeatured)   return 'Featured' ;
    return null;
  }

  badgeTone(p: ProductSummary): 'green' | 'orange' {
    return (p.badges.isBestSeller || p.badges.isTrending) ? 'orange' : 'green';
  }

  // ── Cart ────────────────────────────────────────────────────────────────────

  addToCart(product: ProductSummary): void {
    if (!this.authService.isLoggedIn) { this.router.navigate(['/login']); return; }
    if (this.addingCartId === product.id) return;
    this.addingCartId = product.id;
    this.cartService.addItem(product.id, null, 1).subscribe({
      next: () => {
        this.addingCartId = null;
        this.addedCartId = product.id;
        clearTimeout(this.addedTimer);
        this.addedTimer = setTimeout(() => { this.addedCartId = null; }, 2000);
      },
      error: () => { this.addingCartId = null; }
    });
  }

  // ── Wishlist ────────────────────────────────────────────────────────────────

  toggleWishlist(product: ProductSummary): void {
    if (this.wishlistTogglingId === product.id) return;
    this.wishlistTogglingId = product.id;
    this.wishlistService.toggle(product.id).subscribe({
      next: () => { this.wishlistTogglingId = null; },
      error: () => { this.wishlistTogglingId = null; }
    });
  }

  buyNow(product: ProductSummary): void {
    if (!this.authService.isLoggedIn) { this.router.navigate(['/login']); return; }
    if (this.addingCartId === product.id) return;
    this.addingCartId = product.id;
    this.cartService.addItem(product.id, null, 1).subscribe({
      next: () => { this.addingCartId = null; this.router.navigate(['/cart']); },
      error: () => { this.addingCartId = null; }
    });
  }
}
