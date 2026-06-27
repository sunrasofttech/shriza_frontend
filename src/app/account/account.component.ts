import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from '../order.service';
import { CartService } from '../cart.service';

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

interface WishlistItem {
  id: string;
  category: string;
  name: string;
  price: number;
  oldPrice: number;
  size: string;
  image: string;
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

interface NotificationItem {
  icon: 'bag' | 'tag' | 'bell';
  title: string;
  date: string;
  desc: string;
  read: boolean;
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
  constructor(public order: OrderService, public cart: CartService, private route: ActivatedRoute) {}

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

  wishlistItems: WishlistItem[] = [
    {
      id: 'p2',
      category: 'Asthma Care',
      name: 'Broncho-Pure Herbal Inhalant Oil',
      price: 297,
      oldPrice: 349,
      size: '15ml size',
      image: 'https://placehold.co/160x160/eef3ea/2f4f3f?text=Inhalant+Oil'
    },
    {
      id: 'p3',
      category: 'Asthma Care',
      name: 'Lung-Detox Herbal Tea Infusion',
      price: 449,
      oldPrice: 499,
      size: '20 Tea Bags size',
      image: 'https://placehold.co/160x160/fbe7ea/7a3b46?text=Tea+Infusion'
    }
  ];

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

  notifications: NotificationItem[] = [
    {
      icon: 'bag',
      title: 'Order Placed Successfully',
      date: '2026-06-23',
      desc: "Your order SHZ-20260623-9573 has been successfully received. We will notify you once it's packed.",
      read: true
    },
    {
      icon: 'tag',
      title: 'Welcome to Shriza Naturals!',
      date: '2026-06-20',
      desc: 'Explore our range of premium Ayurvedic and wellness products. Use coupon FIRSTORDER for 15% off!',
      read: false
    },
    {
      icon: 'bell',
      title: 'Referral Bonus Active',
      date: '2026-06-21',
      desc: 'Share your referral code SHRIZA99 with friends and get ₹100 when they place their first order!',
      read: false
    }
  ];

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

  setTab(tab: AccountTab): void {
    this.activeTab = tab;
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
    this.cart.addItem({ id: item.id, name: item.name, size: item.size, price: item.price, image: item.image, quantity: 1 });
    this.removeFromWishlist(item.id);
  }

  removeFromWishlist(id: string): void {
    this.wishlistItems = this.wishlistItems.filter((item) => item.id !== id);
  }

  markAsRead(notification: NotificationItem): void {
    notification.read = true;
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
