import { Component, ElementRef, HostListener } from '@angular/core';
import { CartService } from '../cart.service';

interface Category {
  name: string;
  slug: string;
}

interface NavNotification {
  tag: 'Order' | 'Offer' | 'Promotion';
  title: string;
  date: string;
  desc: string;
  read: boolean;
}

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  isDropdownOpen = false;
  isMobileMenuOpen = false;
  isNotificationsOpen = false;
  isAccountMenuOpen = false;

  account = {
    id: '34214124132',
    email: '34214124132@shriza.com',
    walletBalance: 500
  };

  categories: Category[] = [
    { name: 'Asthma Care', slug: 'asthma-care' },
    { name: 'Herbal Care', slug: 'herbal-care' },
    { name: 'Skin Care', slug: 'skin-care' },
    { name: 'Hair Care', slug: 'hair-care' },
    { name: 'Wellness', slug: 'wellness' }
  ];

  notifications: NavNotification[] = [
    {
      tag: 'Order',
      title: 'Order Placed Successfully',
      date: '2026-06-23',
      desc: "Your order SHZ-20260623-9573 has been successfully received. We will notify you once",
      read: true
    },
    {
      tag: 'Offer',
      title: 'Welcome to Shriza Naturals!',
      date: '2026-06-20',
      desc: 'Explore our range of premium Ayurvedic and wellness products. Use coupon FIRSTORDER for',
      read: false
    },
    {
      tag: 'Promotion',
      title: 'Referral Bonus Active',
      date: '2026-06-21',
      desc: 'Share your referral code SHRIZA99 with friends and get ₹100 when they place their first order!',
      read: false
    }
  ];

  get unreadCount(): number {
    return this.notifications.filter((notification) => !notification.read).length;
  }

  constructor(private elementRef: ElementRef, public cartService: CartService) {}

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
    this.closeAll();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
      this.isNotificationsOpen = false;
      this.isAccountMenuOpen = false;
    }
  }
}
