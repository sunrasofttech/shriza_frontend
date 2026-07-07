import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService, ProductSummary, ProductDetail, ProductImage, ProductVariant } from '../product.service';
import { CartService } from '../cart.service';
import { WishlistService } from '../wishlist.service';

interface RatingBar { stars: number; percent: number; }
interface Faq { id: string; question: string; answer: string; open: boolean; }
type DetailTab = 'benefits' | 'ingredients' | 'usage';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  loading = true;
  error = '';

  // Core product fields
  productId = '';
  category = '';
  name = '';
  brand: string | null = null;
  rating = 0;
  reviews = 0;
  stockLeft = 0;
  isInStock = true;
  isLowStock = false;
  price = 0;
  oldPrice = 0;
  discount: number | null = null;
  unitLabel: string | null = null;
  description = '';
  isWishlisted = false;

  // Images
  images: string[] = [];
  activeImage = '';

  // Variants
  variants: ProductVariant[] = [];
  selectedVariant: ProductVariant | null = null;

  // Sizes (derived from variants that have a size label)
  sizes: string[] = [];
  selectedSize = '';

  // Tab content
  activeTab: DetailTab = 'benefits';
  benefits: string[] = [];
  ingredients: string[] = [];
  usage: string[] = [];

  // FAQs
  faqs: Faq[] = [];

  // Ratings
  ratingBreakdown: RatingBar[] = [];

  // Related products
  relatedProducts: ProductSummary[] = [];

  // UI
  quantity = 1;
  cartLoading = false;
  cartMsg = '';
  private cartMsgTimer: any;
  wishlistLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private wishlistService: WishlistService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (!slug) { this.router.navigate(['/products']); return; }
      this.loadProduct(slug);
    });
  }

  private loadProduct(slug: string): void {
    this.loading = true;
    this.error = '';
    this.productService.getProduct(slug).subscribe({
      next: (result) => {
        this.mapProduct(result.product);
        this.mapRatings(result.ratings);
        this.faqs = result.faqs.map(f => ({ ...f, open: false }));
        if (this.faqs.length) this.faqs[0].open = true;
        this.relatedProducts = result.relatedProducts;
        this.loading = false;
      },
      error: () => {
        this.error = 'Product not found.';
        this.loading = false;
      }
    });
  }

  private mapProduct(p: ProductDetail): void {
    this.productId   = p.id;
    this.category    = p.category.name;
    this.name        = p.name;
    this.brand       = p.brand;
    this.description = p.shortDescription || '';
    this.price       = p.pricing.sellingPrice;
    this.oldPrice    = p.pricing.mrp;
    this.discount    = p.pricing.discountPercent;
    this.unitLabel   = p.unitLabel;
    this.stockLeft   = p.stock.quantity;
    this.isInStock   = p.stock.isInStock;
    this.isLowStock  = p.stock.isLowStock;
    this.isWishlisted = p.isWishlisted;

    // Images
    const sorted = [...p.images].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
    this.images = sorted.map(img => this.productService.resolveImageUrl(img.imageUrl || img.thumbnailUrl) || '');
    const primary = sorted.find(img => img.isPrimary);
    this.activeImage = this.productService.resolveImageUrl(
      primary ? (primary.imageUrl || primary.thumbnailUrl) : null
    ) || (this.images[0] || '');

    // Variants and sizes
    this.variants = p.variants;
    this.sizes = p.variants.filter(v => v.size).map(v => v.size as string);
    this.selectedSize = this.sizes[0] || '';
    this.selectedVariant = p.variants[0] || null;

    // Tab content — split newline-separated strings into arrays
    this.benefits    = this.splitLines(p.tabs.benefits);
    this.ingredients = this.splitLines(p.tabs.ingredients);
    this.usage       = this.splitLines(p.tabs.howToUse);
  }

  private mapRatings(ratings: { avg: number; count: number; distribution: Record<string, number> }): void {
    this.rating  = ratings.avg;
    this.reviews = ratings.count;
    this.ratingBreakdown = [5, 4, 3, 2, 1].map(star => ({
      stars: star,
      percent: ratings.distribution[String(star)] ?? 0
    }));
  }

  private splitLines(raw: string | null | undefined): string[] {
    if (!raw) return [];
    return raw.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  }

  // ── Actions ──────────────────────────────────────────────────────────────────

  setActiveImage(url: string): void { this.activeImage = url; }

  setSize(size: string): void {
    this.selectedSize = size;
    const match = this.variants.find(v => v.size === size);
    if (match) {
      this.selectedVariant = match;
      this.price    = match.sellingPrice;
      this.oldPrice = match.mrp;
      this.discount = match.discountPercent;
      this.stockLeft = match.stockQuantity;
      this.isInStock = match.isInStock;
    }
  }

  setTab(tab: DetailTab): void { this.activeTab = tab; }

  increment(): void { this.quantity++; }
  decrement(): void { if (this.quantity > 1) this.quantity--; }

  toggleWishlist(): void {
    if (this.wishlistLoading || !this.productId) return;
    this.wishlistLoading = true;
    this.wishlistService.toggle(this.productId).subscribe({
      next: r => { this.isWishlisted = r.wishlisted; this.wishlistLoading = false; },
      error: () => { this.wishlistLoading = false; }
    });
  }

  toggleFaq(faq: Faq): void { faq.open = !faq.open; }

  stars(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => (i < Math.round(rating) ? 1 : 0));
  }

  addToCart(): void {
    if (this.cartLoading || !this.isInStock) return;
    this.cartLoading = true;
    this.cartMsg = '';
    const variantId = this.selectedVariant?.id ?? null;
    this.cartService.addItem(this.productId, variantId, this.quantity).subscribe({
      next: () => {
        this.cartLoading = false;
        this.cartMsg = 'success';
        clearTimeout(this.cartMsgTimer);
        this.cartMsgTimer = setTimeout(() => { this.cartMsg = ''; }, 2500);
      },
      error: (err) => {
        this.cartLoading = false;
        this.cartMsg = 'error:' + (err?.error?.message || 'Could not add to cart.');
      }
    });
  }

  buyNow(): void {
    if (this.cartLoading || !this.isInStock) return;
    this.cartLoading = true;
    const variantId = this.selectedVariant?.id ?? null;
    this.cartService.addItem(this.productId, variantId, this.quantity).subscribe({
      next: () => { this.cartLoading = false; this.router.navigate(['/cart']); },
      error: () => { this.cartLoading = false; }
    });
  }

  addRelatedToCart(product: ProductSummary): void {
    this.cartService.addItem(product.id, null, 1).subscribe({ error: () => {} });
  }

  productImage(p: ProductSummary): string {
    const resolved = this.productService.resolveImageUrl(p.thumbnailUrl || p.imageUrl);
    return resolved || `https://placehold.co/480x480/eef3ea/2f4f3f?text=${encodeURIComponent(p.name)}`;
  }

  badgeText(p: ProductSummary): string | null {
    if (p.badges.isBestSeller)    return 'Best Seller';
    if (p.badges.isNewArrival)    return 'New Arrival';
    if (p.pricing.discountPercent) return `${p.pricing.discountPercent}% OFF`;
    if (p.badges.isTrending)      return 'Trending';
    return null;
  }
}
