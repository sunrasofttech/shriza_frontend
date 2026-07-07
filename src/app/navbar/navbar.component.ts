import { Component, ElementRef, HostListener, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CartService } from '../cart.service';
import { NotificationService, UserNotification } from '../notification.service';
import { AuthService, AuthUser } from '../auth.service';
import { ProductService, ProductCategory } from '../product.service';

type NotifTag = 'Order' | 'Offer' | 'Promotion';

interface NavNotification {
  id: string;
  tag: NotifTag;
  title: string;
  date: string;
  desc: string;
  isRead: boolean;
}

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  isDropdownOpen = false;
  isMobileMenuOpen = false;
  isNotificationsOpen = false;
  isAccountMenuOpen = false;
  previewLoaded = false;

  // ── Live user from AuthService ────────────────────────────────────────────
  user: AuthUser | null = null;

  // ── Live categories from ProductService ───────────────────────────────────
  categories: ProductCategory[] = [];

  // ── Notifications ─────────────────────────────────────────────────────────
  notifications: NavNotification[] = [];
  notifLoading = false;

  // ── Search ────────────────────────────────────────────────────────────────
  searchKeyword = '';

  private destroy$ = new Subject<void>();

  constructor(
    private elementRef: ElementRef,
    private router: Router,
    public cartService: CartService,
    public notifService: NotificationService,
    public authService: AuthService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    // Track logged-in user reactively
    this.authService.user$.pipe(takeUntil(this.destroy$)).subscribe(u => {
      this.user = u;
    });

    // Fetch profile (silent — no error shown in navbar)
    this.authService.fetchMe().subscribe({ error: () => {} });

    // Fetch notification unread count
    this.notifService.fetchUnreadCount();

    // Fetch categories for the dropdown
    this.productService.getFilterMeta().subscribe({
      next: meta => { this.categories = meta.categories; },
      error: () => {}
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Getters ───────────────────────────────────────────────────────────────

  get unreadCount(): number { return this.notifService.unreadCount; }

  get userInitial(): string {
    const name = this.user?.name || '';
    return name.trim().charAt(0).toUpperCase() || '?';
  }

  get displayName(): string { return this.user?.name || 'My Account'; }
  get displayEmail(): string { return this.user?.email || ''; }
  get walletBalance(): number { return this.user?.walletBalance ?? 0; }

  // ── Search ────────────────────────────────────────────────────────────────

  onSearch(): void {
    const q = this.searchKeyword.trim();
    if (!q) return;
    this.router.navigate(['/products'], { queryParams: { q } });
    this.searchKeyword = '';
    this.closeAll();
  }

  // ── Panel toggles ─────────────────────────────────────────────────────────

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.isNotificationsOpen = false;
    this.isAccountMenuOpen = false;
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  toggleNotifications(event: Event): void {
    event.stopPropagation();
    this.isDropdownOpen = false;
    this.isAccountMenuOpen = false;
    this.isNotificationsOpen = !this.isNotificationsOpen;

    if (this.isNotificationsOpen && !this.previewLoaded) {
      this.loadPreview();
    }
  }

  toggleAccountMenu(event: Event): void {
    event.stopPropagation();
    this.isDropdownOpen = false;
    this.isNotificationsOpen = false;
    this.isAccountMenuOpen = !this.isAccountMenuOpen;
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeAll(): void {
    this.isDropdownOpen = false;
    this.isMobileMenuOpen = false;
    this.isNotificationsOpen = false;
    this.isAccountMenuOpen = false;
  }

  signOut(): void {
    this.authService.logout().subscribe({
      next: () => { this.closeAll(); this.router.navigate(['/']); },
      error: () => { this.closeAll(); this.router.navigate(['/']); }
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
      this.isNotificationsOpen = false;
      this.isAccountMenuOpen = false;
    }
  }

  private loadPreview(): void {
    this.notifLoading = true;
    this.notifService.list(1, 5).subscribe({
      next: page => {
        this.notifLoading = false;
        this.previewLoaded = true;
        this.notifications = page.notifications.map(n => this.mapToNav(n));
      },
      error: () => {
        this.notifLoading = false;
        this.previewLoaded = true;
      }
    });
  }

  private mapToNav(n: UserNotification): NavNotification {
    const type = (n.type || '').toLowerCase();
    let tag: NotifTag = 'Promotion';
    if (type.startsWith('order') || type === 'shipment' || type === 'delivery') tag = 'Order';
    else if (type.includes('offer') || type.includes('promo') || type.includes('coupon') || type.includes('discount') || type.includes('sale')) tag = 'Offer';
    return {
      id:     n.id,
      tag,
      title:  n.title,
      date:   new Date(n.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      desc:   n.message,
      isRead: n.isRead,
    };
  }
}
