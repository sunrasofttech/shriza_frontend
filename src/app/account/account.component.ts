import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { OrderService, OrderListItem } from '../order.service';
import { CartService } from '../cart.service';
import { NotificationService, UserNotification } from '../notification.service';
import { WishlistService, WishlistItem } from '../wishlist.service';
import { AuthService, AuthUser } from '../auth.service';
import { environment } from '../../environments/environment';

type AccountTab = 'profile' | 'orders' | 'addresses' | 'wallet' | 'wishlist' | 'reviews' | 'notifications' | 'settings';

interface WalletTransaction {
  title: string;
  date: string;
  txId: string;
  amount: number;
}

interface ProductReview {
  productName: string;
  rating: number;
  date: string;
  status: string;
  text: string;
}

interface NotificationPreference {
  label: string;
  enabled: boolean;
}

interface ManagedAddress {
  id: string;
  label: string;
  isDefault: boolean;
  name: string;
  line1: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
}

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit, OnDestroy {
  constructor(
    public order: OrderService,
    public cart: CartService,
    private route: ActivatedRoute,
    private router: Router,
    public notifService: NotificationService,
    public wishlistService: WishlistService,
    public authService: AuthService
  ) {}

  activeTab: AccountTab = 'profile';

  // ── Profile ──────────────────────────────────────────────────────────────────

  profileUser: AuthUser | null = null;
  private userSub!: Subscription;

  isEditingProfile = false;
  draftName = '';

  profileSaving = false;
  profileSaveError = '';
  profileSaveSuccess = false;

  avatarSaving = false;
  avatarError = '';
  avatarSuccess = false;

  get userInitial(): string {
    const name = this.profileUser?.name || '';
    return name.trim().charAt(0).toUpperCase() || '?';
  }

  resolveAvatarUrl(path: string | null | undefined): string | null {
    if (!path) return null;
    return path.startsWith('/') ? `${environment.imageUrl}${path}` : path;
  }

  ngOnInit(): void {
    if (this.route.snapshot.routeConfig?.path === 'wishlist') {
      this.activeTab = 'wishlist';
    }

    const tabParam = this.route.snapshot.queryParams['tab'] as AccountTab | undefined;
    if (tabParam && tabParam in this.tabLabels) {
      this.activeTab = tabParam;
      if (tabParam === 'notifications') this.loadNotifications();
      if (tabParam === 'orders')        this.loadOrders();
      if (tabParam === 'wishlist')      this.loadWishlist();
    }

    this.userSub = this.authService.user$.subscribe(u => { this.profileUser = u; });

    if (!this.profileUser) {
      this.authService.fetchProfile().subscribe({ error: () => {} });
    }
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
  }

  editProfile(): void {
    this.draftName = this.profileUser?.name || '';
    this.profileSaveError = '';
    this.profileSaveSuccess = false;
    this.isEditingProfile = true;
  }

  cancelEdit(): void {
    this.isEditingProfile = false;
    this.profileSaveError = '';
  }

  saveProfile(): void {
    const name = this.draftName.trim();
    if (!name) { this.profileSaveError = 'Name cannot be empty.'; return; }

    this.profileSaving = true;
    this.profileSaveError = '';
    this.profileSaveSuccess = false;

    this.authService.updateProfile(name).subscribe({
      next: () => {
        this.profileSaving = false;
        this.profileSaveSuccess = true;
        this.isEditingProfile = false;
        setTimeout(() => { this.profileSaveSuccess = false; }, 3000);
      },
      error: err => {
        this.profileSaving = false;
        this.profileSaveError = err?.error?.message || 'Could not save profile. Please try again.';
      }
    });
  }

  onAvatarChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      this.avatarError = 'Only JPG, PNG, or WebP images are allowed.';
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      this.avatarError = 'Image must be under 2 MB.';
      return;
    }

    this.avatarSaving = true;
    this.avatarError = '';
    this.avatarSuccess = false;

    this.authService.uploadAvatar(file).subscribe({
      next: () => {
        this.avatarSaving = false;
        this.avatarSuccess = true;
        setTimeout(() => { this.avatarSuccess = false; }, 3000);
        input.value = '';
      },
      error: err => {
        this.avatarSaving = false;
        this.avatarError = err?.error?.message || 'Could not upload avatar.';
        input.value = '';
      }
    });
  }

  doRemoveAvatar(): void {
    if (!this.profileUser?.avatarUrl) return;
    this.avatarSaving = true;
    this.avatarError = '';

    this.authService.removeAvatar().subscribe({
      next: () => { this.avatarSaving = false; },
      error: err => {
        this.avatarSaving = false;
        this.avatarError = err?.error?.message || 'Could not remove avatar.';
      }
    });
  }

  signOut(): void {
    this.authService.logout().subscribe({
      next: () => { this.router.navigate(['/']); },
      error: () => { this.router.navigate(['/']); }
    });
  }

  // ── Addresses ─────────────────────────────────────────────────────────────────

  addresses: ManagedAddress[] = [];

  addingAddress = false;
  editingAddressId: string | null = null;

  newAddress = {
    name: '',
    mobile: '',
    line1: '',
    city: '',
    state: '',
    zip: '',
    type: 'Home'
  };

  openAddAddress(): void {
    this.editingAddressId = null;
    this.newAddress = { name: '', mobile: '', line1: '', city: '', state: '', zip: '', type: 'Home' };
    this.addingAddress = true;
  }

  editAddress(address: ManagedAddress): void {
    this.editingAddressId = address.id;
    this.newAddress = {
      name: address.name,
      mobile: address.phone,
      line1: address.line1,
      city: address.city,
      state: address.state,
      zip: address.zip,
      type: address.label
    };
    this.addingAddress = true;
  }

  cancelAddressForm(): void {
    this.addingAddress = false;
    this.editingAddressId = null;
  }

  setNewAddressType(type: string): void {
    this.newAddress.type = type;
  }

  saveAddress(): void {
    if (this.editingAddressId) {
      const address = this.addresses.find((a) => a.id === this.editingAddressId);
      if (address) {
        address.label = this.newAddress.type;
        address.name = this.newAddress.name;
        address.line1 = this.newAddress.line1;
        address.city = this.newAddress.city;
        address.state = this.newAddress.state;
        address.zip = this.newAddress.zip;
        address.phone = this.newAddress.mobile;
      }
    } else {
      this.addresses.push({
        id: `addr-${this.addresses.length + 1}`,
        label: this.newAddress.type,
        isDefault: false,
        name: this.newAddress.name || '',
        line1: this.newAddress.line1,
        city: this.newAddress.city,
        state: this.newAddress.state,
        zip: this.newAddress.zip,
        phone: this.newAddress.mobile
      });
    }
    this.cancelAddressForm();
  }

  deleteAddress(id: string): void {
    this.addresses = this.addresses.filter((address) => address.id !== id);
  }

  // ── Wallet ────────────────────────────────────────────────────────────────────

  wallet = {
    cashbackEarned: 50,
    referralCode: 'SHRIZA99',
    referralBonus: 100
  };

  quickAddAmounts = [200, 500, 1000];
  addAmount: number | null = null;

  transactions: WalletTransaction[] = [
    {
      title: 'Welcome Bonus Credited',
      date: '2026-06-23',
      txId: 'tx-login-1782203116916',
      amount: 500
    }
  ];

  get walletBalance(): number { return this.profileUser?.walletBalance ?? 0; }

  quickAddFunds(amount: number): void { this.creditWallet(amount); }

  addFunds(): void {
    if (!this.addAmount || this.addAmount <= 0) return;
    this.creditWallet(this.addAmount);
    this.addAmount = null;
  }

  copyReferralCode(): void {
    navigator.clipboard?.writeText(this.wallet.referralCode);
  }

  private creditWallet(amount: number): void {
    this.transactions.unshift({
      title: 'Wallet Top-up',
      date: new Date().toISOString().slice(0, 10),
      txId: `tx-topup-${Date.now()}`,
      amount
    });
  }

  // ── Wishlist ──────────────────────────────────────────────────────────────────

  wishlistItems: WishlistItem[] = [];
  wishlistLoading = false;
  wishlistError = '';
  wishlistMoveLoading: string | null = null;

  loadWishlist(): void {
    this.wishlistLoading = true;
    this.wishlistError = '';
    this.wishlistService.list().subscribe({
      next: items => { this.wishlistLoading = false; this.wishlistItems = items; },
      error: err => {
        this.wishlistLoading = false;
        this.wishlistError = err?.error?.message || 'Could not load wishlist.';
      }
    });
  }

  moveToCart(item: WishlistItem): void {
    if (this.wishlistMoveLoading === item.productId) return;
    this.wishlistMoveLoading = item.productId;
    this.wishlistService.moveToCart(item.productId).subscribe({
      next: () => {
        this.wishlistMoveLoading = null;
        this.wishlistItems = this.wishlistItems.filter(i => i.productId !== item.productId);
        this.cart.fetchCart().subscribe();
      },
      error: () => { this.wishlistMoveLoading = null; }
    });
  }

  removeFromWishlist(productId: string): void {
    this.wishlistService.remove(productId).subscribe({
      next: () => { this.wishlistItems = this.wishlistItems.filter(i => i.productId !== productId); },
      error: () => {}
    });
  }

  // ── Reviews ───────────────────────────────────────────────────────────────────

  reviews: ProductReview[] = [
    {
      productName: 'Shwas-Swasthya Asthma Relief Powder',
      rating: 5,
      date: '2026-06-12',
      status: 'Approved',
      text: 'Extremely effective product. My morning breathing exercises feel much lighter after 2 weeks.'
    },
    {
      productName: 'Pure Steam-Distilled Kannauj Rose Water',
      rating: 4,
      date: '2026-06-20',
      status: 'Approved',
      text: 'Very refreshing mist. Smell is 100% natural, not synthetic. Reduces skin heat instantly.'
    }
  ];

  stars(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => (i < Math.round(rating) ? 1 : 0));
  }

  // ── Orders ────────────────────────────────────────────────────────────────────

  accountOrders: OrderListItem[] = [];
  ordersLoading = false;
  ordersError = '';

  loadOrders(): void {
    this.ordersLoading = true;
    this.ordersError = '';
    this.order.fetchOrders(1, 20).subscribe({
      next: r => { this.ordersLoading = false; this.accountOrders = r.orders; },
      error: err => {
        this.ordersLoading = false;
        this.ordersError = err?.error?.message || 'Could not load orders.';
      }
    });
  }

  orderDate(createdAt: string): string {
    const d = new Date(createdAt);
    return isNaN(d.getTime()) ? createdAt : d.toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  }

  orderStatusLabel(s: string): string {
    return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  // ── Notifications ─────────────────────────────────────────────────────────────

  notifications: UserNotification[] = [];
  notifLoading = false;
  notifError = '';
  notifMarkingAllRead = false;

  loadNotifications(): void {
    this.notifLoading = true;
    this.notifError = '';
    this.notifService.list(1, 50).subscribe({
      next: page => {
        this.notifLoading = false;
        this.notifications = page.notifications;
      },
      error: err => {
        this.notifLoading = false;
        this.notifError = err?.error?.message || 'Could not load notifications.';
      }
    });
  }

  notifIcon(type: string): 'bag' | 'tag' | 'bell' {
    const t = (type || '').toLowerCase();
    if (t.startsWith('order') || t === 'shipment' || t === 'delivery') return 'bag';
    if (t.includes('offer') || t.includes('promo') || t.includes('coupon') || t.includes('discount') || t.includes('sale')) return 'tag';
    return 'bell';
  }

  notifDate(createdAt: string): string {
    const d = new Date(createdAt);
    return isNaN(d.getTime()) ? createdAt : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  markAsRead(notification: UserNotification): void {
    if (notification.isRead) return;
    this.notifService.markRead(notification.id).subscribe({
      next: () => { notification.isRead = true; },
      error: () => {}
    });
  }

  markAllRead(): void {
    this.notifMarkingAllRead = true;
    this.notifService.markAllRead().subscribe({
      next: () => {
        this.notifMarkingAllRead = false;
        this.notifications.forEach(n => { n.isRead = true; });
      },
      error: () => { this.notifMarkingAllRead = false; }
    });
  }

  deleteNotification(notification: UserNotification): void {
    this.notifService.delete(notification.id).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(n => n.id !== notification.id);
        if (!notification.isRead) this.notifService.decrementCount();
      },
      error: () => {}
    });
  }

  // ── Settings ──────────────────────────────────────────────────────────────────

  passwordForm = { current: '', new: '', confirm: '' };
  showCurrentPassword = false;
  showNewPassword = false;

  notificationPrefs: NotificationPreference[] = [
    { label: 'Exclusive promotional offers', enabled: true },
    { label: 'Order shipping updates', enabled: true },
    { label: 'Wallet transaction notifications', enabled: true },
    { label: 'Weekly wellness email newsletters', enabled: false }
  ];

  toggleCurrentPasswordVisibility(): void { this.showCurrentPassword = !this.showCurrentPassword; }
  toggleNewPasswordVisibility(): void     { this.showNewPassword = !this.showNewPassword; }

  updatePassword(): void {
    this.passwordForm = { current: '', new: '', confirm: '' };
  }

  togglePreference(pref: NotificationPreference): void { pref.enabled = !pref.enabled; }
  attachDocument(): void {}

  // ── Tab ───────────────────────────────────────────────────────────────────────

  tabLabels: Record<AccountTab, string> = {
    profile: 'My Profile',
    orders: 'Order History',
    addresses: 'Manage Addresses',
    wallet: 'My Wallet',
    wishlist: 'My Wishlist',
    reviews: 'My Reviews',
    notifications: 'Notifications',
    settings: 'Settings & Security'
  };

  setTab(tab: AccountTab): void {
    this.activeTab = tab;
    if (tab === 'notifications') this.loadNotifications();
    if (tab === 'orders')        this.loadOrders();
    if (tab === 'wishlist')      this.loadWishlist();
  }
}
