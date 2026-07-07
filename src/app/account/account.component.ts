import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrderService, OrderListItem } from '../order.service';
import { CartService } from '../cart.service';
import { NotificationService, UserNotification } from '../notification.service';
import { WishlistService, WishlistItem } from '../wishlist.service';

type AccountTab = 'profile' | 'orders' | 'addresses' | 'wallet' | 'wishlist' | 'reviews' | 'notifications' | 'settings';

interface ProfileFields {
  fullName: string;
  email: string;
  mobile: string;
}

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
export class AccountComponent implements OnInit {
  constructor(
    public order: OrderService,
    public cart: CartService,
    private route: ActivatedRoute,
    public notifService: NotificationService,
    public wishlistService: WishlistService
  ) {}

  activeTab: AccountTab = 'profile';

  ngOnInit(): void {
    if (this.route.snapshot.routeConfig?.path === 'wishlist') {
      this.activeTab = 'wishlist';
    }
  }
  isEditingProfile = false;

  account: ProfileFields & { initial: string; walletBalance: number } = {
    initial: '3',
    fullName: '34214124132',
    email: '34214124132@shriza.com',
    mobile: '34214124132',
    walletBalance: 500
  };

  draftProfile: ProfileFields = { fullName: '', email: '', mobile: '' };

  addresses: ManagedAddress[] = [
    {
      id: 'home',
      label: 'Home',
      isDefault: true,
      name: 'John Doe',
      line1: 'Flat 402, Green Meadows, Sector 15, Vashi',
      city: 'Navi Mumbai',
      state: 'Maharashtra',
      zip: '400703',
      phone: '9876543210'
    },
    {
      id: 'work',
      label: 'Work',
      isDefault: false,
      name: 'John Doe',
      line1: '9th Floor, Tech Hub, Mindspace IT Park',
      city: 'Hyderabad',
      state: 'Telangana',
      zip: '500081',
      phone: '9876543210'
    }
  ];

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

  wishlistItems: WishlistItem[] = [];
  wishlistLoading = false;
  wishlistError = '';
  wishlistMoveLoading: string | null = null;

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

  notifications: UserNotification[] = [];
  notifLoading = false;
  notifError = '';
  notifMarkingAllRead = false;

  passwordForm = {
    current: '',
    new: '',
    confirm: ''
  };

  showCurrentPassword = false;
  showNewPassword = false;

  notificationPrefs: NotificationPreference[] = [
    { label: 'Exclusive promotional offers', enabled: true },
    { label: 'Order shipping updates', enabled: true },
    { label: 'Wallet transaction notifications', enabled: true },
    { label: 'Weekly wellness email newsletters', enabled: false }
  ];

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

  // ── Orders ───────────────────────────────────────────────────────────────────

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

  setTab(tab: AccountTab): void {
    this.activeTab = tab;
    if (tab === 'notifications') this.loadNotifications();
    if (tab === 'orders')        this.loadOrders();
    if (tab === 'wishlist')      this.loadWishlist();
  }

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

  stars(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => (i < Math.round(rating) ? 1 : 0));
  }

  editProfile(): void {
    this.draftProfile = {
      fullName: this.account.fullName,
      email: this.account.email,
      mobile: this.account.mobile
    };
    this.isEditingProfile = true;
  }

  cancelEdit(): void {
    this.isEditingProfile = false;
  }

  saveProfile(): void {
    this.account.fullName = this.draftProfile.fullName;
    this.account.email = this.draftProfile.email;
    this.account.mobile = this.draftProfile.mobile;
    this.isEditingProfile = false;
  }

  signOut(): void {
    // auth sign-out integration pending
  }

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
        name: this.newAddress.name || 'John Doe',
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

  quickAddFunds(amount: number): void {
    this.creditWallet(amount);
  }

  addFunds(): void {
    if (!this.addAmount || this.addAmount <= 0) {
      return;
    }
    this.creditWallet(this.addAmount);
    this.addAmount = null;
  }

  copyReferralCode(): void {
    navigator.clipboard?.writeText(this.wallet.referralCode);
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
      next: () => {
        this.wishlistItems = this.wishlistItems.filter(i => i.productId !== productId);
      },
      error: () => {}
    });
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

  toggleCurrentPasswordVisibility(): void {
    this.showCurrentPassword = !this.showCurrentPassword;
  }

  toggleNewPasswordVisibility(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  updatePassword(): void {
    // auth API integration pending
    this.passwordForm = { current: '', new: '', confirm: '' };
  }

  togglePreference(pref: NotificationPreference): void {
    pref.enabled = !pref.enabled;
  }

  attachDocument(): void {
    // file upload API integration pending
  }

  private creditWallet(amount: number): void {
    this.account.walletBalance += amount;
    this.transactions.unshift({
      title: 'Wallet Top-up',
      date: new Date().toISOString().slice(0, 10),
      txId: `tx-topup-${Date.now()}`,
      amount
    });
  }
}
