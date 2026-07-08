import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { CartService } from '../cart.service';
import { WishlistService } from '../wishlist.service';
import { AuthService } from '../auth.service';

// ── API response interfaces ──────────────────────────────────────────────────

interface HomeBanner {
  id: string;
  title: string;
  badgeText: string | null;
  description: string | null;
  imageUrl: string;
  thumbnailUrl: string | null;
  ctaText: string;
  ctaUrl: string;
  ctaSecondaryText: string | null;
  ctaSecondaryUrl: string | null;
}

interface HomeCoupon {
  id: string;
  code: string;
  title: string;
  type: string;
  discountLabel: string;
  discountValue: number | null;
  minOrderValue: number | null;
  description: string | null;
  cardBgColor: string | null;
  expiresAt: string | null;
}

interface HomeTrustBadge {
  icon: string;
  label: string;
  subLabel: string;
}

interface HomeCategory {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  productCount: number;
}

export interface HomeProduct {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  thumbnailUrl: string | null;
  unitLabel: string | null;
  pricing: { sellingPrice: number; mrp: number; discountPct: number };
  rating: { avg: number; count: number };
  stock: { inStock: boolean; quantity: number };
  badges: {
    isFeatured: boolean; isBestSeller: boolean;
    isNewArrival: boolean; isTrending: boolean;
    discountBadge: string | null;
  };
  isWishlisted: boolean;
}

interface WhyUsItem { step: number; title: string; body: string; }

// ── Static fallbacks ─────────────────────────────────────────────────────────

interface StaticOffer { theme: 'green' | 'light' | 'orange'; title: string; discount: string; desc: string; code: string; }

const STATIC_OFFERS: StaticOffer[] = [
  { theme: 'green',  title: 'Welcome Discount', discount: '15% OFF',   desc: 'On your first purchase',      code: 'FIRSTORDER' },
  { theme: 'light',  title: 'Wellness Boost',   discount: '20% OFF',   desc: 'On Asthma & Herbal products', code: 'NATURAL20'  },
  { theme: 'orange', title: 'Flat Discount',    discount: '₹100 OFF',  desc: 'On orders above ₹999',        code: 'FLAT100'    },
];

const STATIC_TRUST = [
  { icon: 'leaf',   label: '100% Natural',        subLabel: 'Pure Organic Harvest'       },
  { icon: 'flask',  label: 'Lab Tested',           subLabel: 'No Harmful Toxins'          },
  { icon: 'truck',  label: 'Fast Delivery',        subLabel: 'Within 2-3 Business days'   },
  { icon: 'shield', label: 'Secure Payment',       subLabel: 'Fully Encrypted Transaction' },
  { icon: 'users',  label: 'Trusted by Thousands', subLabel: '25,000+ Happy Customers'    },
];

const STATIC_WHY_US: WhyUsItem[] = [
  { step: 1, title: 'Vedic Bilona Process',    body: 'We preserve our Vedic roots using traditional methods followed for thousands of years, ensuring authenticity in every drop.' },
  { step: 2, title: 'Single-Origin Harvesting', body: 'Our ingredients are sourced directly from single locations — Himalayan valleys and coastal farms — ensuring traceability at the source.' },
  { step: 3, title: 'Glass-Only Packaging',    body: 'We never house our products in toxic plastics. We use recycled amber glass for preserving therapeutic properties.' },
];

// ── Testimonials — always static (not in API) ────────────────────────────────

interface Testimonial { name: string; date: string; rating: number; verifiedFor: string; text: string; avatar: string; productImage: string; }

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  private apiBase = `${environment.apiUrl}/api/public`;
  private destroy$ = new Subject<void>();

  loading = true;

  // ── Resolved API state ────────────────────────────────────────────────────
  heroBanners: HomeBanner[]   = [];
  coupons:     HomeCoupon[]   = [];
  trustBadges: HomeTrustBadge[] = STATIC_TRUST;
  categories:  HomeCategory[] = [];
  featuredProducts: HomeProduct[] = [];
  bestSellers:      HomeProduct[] = [];
  newArrivals:      HomeProduct[] = [];
  whyUsItems: WhyUsItem[] = STATIC_WHY_US;
  lifestyleImages: string[] = [];

  // ── Fallback offer theme cycling (green / light / orange) ────────────────
  private readonly COUPON_THEMES: Array<'green' | 'light' | 'orange'> = ['green', 'light', 'orange'];
  couponTheme(idx: number): 'green' | 'light' | 'orange' {
    return this.COUPON_THEMES[idx % 3];
  }

  // ── Wishlist ──────────────────────────────────────────────────────────────
  wishlistIds = new Set<string>();
  wishlistTogglingId: string | null = null;

  // ── Cart ──────────────────────────────────────────────────────────────────
  addingToCartId: string | null = null;
  addedToCartId:  string | null = null;
  private addedTimer: any;

  // ── Hero banner cycling ───────────────────────────────────────────────────
  heroBannerIndex = 0;
  get activeBanner(): HomeBanner | null { return this.heroBanners[this.heroBannerIndex] ?? null; }

  // ── Static testimonials ───────────────────────────────────────────────────
  readonly testimonials: Testimonial[] = [
    { name: 'Rajesh Kumar', date: '2024-08-16', rating: 5, verifiedFor: 'Shriza Swasthya Asthma Powder',
      text: 'The Asthma Relief Powder has been a life-changer. My wheezing during seasons has dropped by 80%. I take it every morning now.',
      avatar: this.ph('RK', 80, 80), productImage: this.ph('Asthma Powder', 200, 200) },
    { name: 'Sneha Sharma', date: '2024-08-04', rating: 5, verifiedFor: 'Kumkumadi Face Elixir Oil',
      text: 'Kumkumadi oil is so luxurious! I noticed my dark spots lighten in 2 weeks and my face is glowing. Thank you!',
      avatar: this.ph('SS', 80, 80), productImage: this.ph('Face Elixir Oil', 200, 200) },
    { name: 'Amit Patel', date: '2024-07-22', rating: 5, verifiedFor: 'Mahanarayan Oil Sesame Base',
      text: 'Pure Mahanarayan oil. Excellent joint pain relief. I rub this oil daily, and my mobility recovered fast.',
      avatar: this.ph('AP', 80, 80), productImage: this.ph('Mahanarayan Oil', 200, 200) },
  ];

  constructor(
    private http: HttpClient,
    private router: Router,
    public cartService: CartService,
    public wishlistService: WishlistService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Subscribe to wishlist IDs for heart button state
    this.wishlistService.wishlistIds$.pipe(takeUntil(this.destroy$)).subscribe(ids => {
      this.wishlistIds = ids;
    });
    this.wishlistService.fetchWishlistedIds();

    this.http.get<any>(`${this.apiBase}/home`, { withCredentials: true }).subscribe({
      next: r => { this.mapResponse(r.data); this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    clearTimeout(this.addedTimer);
  }

  private mapResponse(data: any): void {
    // ── Hero banners ────────────────────────────────────────────────────────
    if (data.heroBanners?.length) {
      this.heroBanners = data.heroBanners.map((b: any) => ({
        ...b,
        imageUrl: this.resolveUrl(b.imageUrl),
        thumbnailUrl: this.resolveUrl(b.thumbnailUrl),
      }));
    }

    // ── Coupons / offers ───────────────────────────────────────────────────
    if (data.coupons?.length) {
      this.coupons = data.coupons;
    }

    // ── Trust badges ───────────────────────────────────────────────────────
    if (data.trustBadges?.length) {
      this.trustBadges = data.trustBadges;
    }

    // ── Categories ─────────────────────────────────────────────────────────
    if (data.categories?.length) {
      this.categories = data.categories.map((c: any) => ({
        ...c,
        imageUrl:     this.resolveUrl(c.imageUrl),
        thumbnailUrl: this.resolveUrl(c.thumbnailUrl),
      }));
    }

    // ── Product sections ───────────────────────────────────────────────────
    if (data.featuredProducts?.products?.length) {
      this.featuredProducts = data.featuredProducts.products.map(this.mapProduct.bind(this));
    }
    if (data.bestSellers?.products?.length) {
      this.bestSellers = data.bestSellers.products.map(this.mapProduct.bind(this));
    }
    if (data.newArrivals?.products?.length) {
      this.newArrivals = data.newArrivals.products.map(this.mapProduct.bind(this));
    }

    // ── Why Us ─────────────────────────────────────────────────────────────
    if (data.whyUs?.length) {
      this.whyUsItems = data.whyUs;
    }

    // ── Lifestyle gallery ─────────────────────────────────────────────────
    if (data.lifestyleImages?.length) {
      this.lifestyleImages = data.lifestyleImages.map((u: string) => this.resolveUrl(u)).filter(Boolean) as string[];
    }
  }

  private mapProduct(p: any): HomeProduct {
    return {
      ...p,
      thumbnailUrl: this.resolveUrl(p.thumbnailUrl),
    };
  }

  private resolveUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    return url.startsWith('/') ? environment.imageUrl + url : url;
  }

  // ── Template helpers ──────────────────────────────────────────────────────

  ph(seed: string, w = 480, h = 480): string {
    return `https://placehold.co/${w}x${h}/eef3ea/2f4f3f?text=${encodeURIComponent(seed)}`;
  }

  productImage(p: HomeProduct): string {
    return p.thumbnailUrl || this.ph(p.name);
  }

  categoryImage(c: HomeCategory): string {
    return c.thumbnailUrl || c.imageUrl || this.ph(c.name, 200, 200);
  }

  badgeText(p: HomeProduct): string | null {
    if (p.badges.discountBadge) return p.badges.discountBadge;
    if (p.badges.isBestSeller)  return 'Best Seller';
    if (p.badges.isNewArrival)  return 'New Arrival';
    if (p.badges.isTrending)    return 'Trending';
    return null;
  }

  badgeTone(p: HomeProduct): 'green' | 'pink' {
    return (p.badges.isBestSeller || p.badges.isTrending) ? 'pink' : 'green';
  }

  whyNumber(step: number): string {
    return step.toString().padStart(2, '0');
  }

  stars(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => (i < Math.round(rating) ? 1 : 0));
  }

  gallerySlots(): string[] {
    if (this.lifestyleImages.length) return this.lifestyleImages;
    return Array.from({ length: 6 }, (_, i) => this.ph(`Lifestyle ${i + 1}`, 260, 260));
  }

  scrollToSection(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  heroBannerNav(dir: 1 | -1): void {
    const len = this.heroBanners.length;
    if (!len) return;
    this.heroBannerIndex = (this.heroBannerIndex + dir + len) % len;
  }

  // ── Cart actions ──────────────────────────────────────────────────────────

  addToCart(product: HomeProduct): void {
    if (!this.authService.isLoggedIn) { this.router.navigate(['/login']); return; }
    if (this.addingToCartId === product.id) return;
    this.addingToCartId = product.id;
    this.cartService.addItem(product.id, null, 1).subscribe({
      next: () => {
        this.addingToCartId = null;
        this.addedToCartId = product.id;
        clearTimeout(this.addedTimer);
        this.addedTimer = setTimeout(() => { this.addedToCartId = null; }, 2000);
      },
      error: () => { this.addingToCartId = null; }
    });
  }

  buyNow(product: HomeProduct): void {
    if (!this.authService.isLoggedIn) { this.router.navigate(['/login']); return; }
    if (this.addingToCartId === product.id || !product.stock.inStock) return;
    this.addingToCartId = product.id;
    this.cartService.addItem(product.id, null, 1).subscribe({
      next: () => { this.addingToCartId = null; this.router.navigate(['/cart']); },
      error: () => { this.addingToCartId = null; }
    });
  }

  // ── Wishlist actions ──────────────────────────────────────────────────────

  toggleWishlist(product: HomeProduct): void {
    if (this.wishlistTogglingId === product.id) return;
    this.wishlistTogglingId = product.id;
    this.wishlistService.toggle(product.id).subscribe({
      next: () => { this.wishlistTogglingId = null; },
      error: () => { this.wishlistTogglingId = null; }
    });
  }
}
