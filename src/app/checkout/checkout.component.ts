import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../cart.service';
import { OrderService, UserAddress } from '../order.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  addresses: UserAddress[] = [];
  addrLoading = false;
  summaryLoading = false;
  continueError = '';   // shown near the "Continue to Payment" button
  addressError = '';    // shown inside the add-address form

  // Add address form
  addingAddress = false;
  savingAddress = false;
  newAddress = { label: 'Home', fullName: '', phone: '', addressLine1: '', city: '', state: '', pincode: '' };

  deliveryOptions = [
    { id: 'standard' as const, label: 'Standard Delivery', eta: '5-6 business days' },
    { id: 'express'  as const, label: 'Express Delivery',  eta: '2 business days'   },
  ];

  constructor(
    public cart: CartService,
    public orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAddresses();
    this.loadSummary(this.orderService.selectedDelivery);
  }

  get pricing() { return this.orderService.pricing; }
  get selectedAddressId() { return this.orderService.selectedAddressId; }
  get selectedDelivery() { return this.orderService.selectedDelivery; }

  // ── Addresses ──────────────────────────────────────────────────────────────

  private loadAddresses(): void {
    this.addrLoading = true;
    this.orderService.fetchAddresses().subscribe({
      next: (list) => {
        this.addresses = list;
        this.addrLoading = false;
        // Auto-select default address
        if (!this.orderService.selectedAddressId) {
          const def = list.find(a => a.isDefault) || list[0];
          if (def) this.selectAddress(def);
        }
      },
      error: () => { this.addrLoading = false; }
    });
  }

  selectAddress(addr: UserAddress): void {
    this.orderService.selectedAddressId = addr.id;
    this.orderService.selectedAddress = addr;
  }

  isSelected(addr: UserAddress): boolean {
    return this.orderService.selectedAddressId === addr.id;
  }

  // ── Add Address Form ───────────────────────────────────────────────────────

  toggleAddAddress(): void {
    this.addingAddress = !this.addingAddress;
    this.addressError = '';
    if (!this.addingAddress) {
      this.newAddress = { label: 'Home', fullName: '', phone: '', addressLine1: '', city: '', state: '', pincode: '' };
    }
  }

  setAddressLabel(label: string): void { this.newAddress.label = label; }

  saveAddress(): void {
    if (!this.newAddress.fullName || !this.newAddress.addressLine1 || !this.newAddress.city || !this.newAddress.pincode) {
      this.addressError = 'Please fill in all required fields (Name, Street Address, City, Pincode).';
      return;
    }
    this.savingAddress = true;
    this.addressError = '';
    this.orderService.addAddress(this.newAddress).subscribe({
      next: (addr) => {
        this.addresses.push(addr);
        this.selectAddress(addr);
        this.addingAddress = false;
        this.savingAddress = false;
        this.addressError = '';
        this.newAddress = { label: 'Home', fullName: '', phone: '', addressLine1: '', city: '', state: '', pincode: '' };
      },
      error: (err) => {
        // Surface field-level validation messages (e.g. "Street address must be 5–255 characters")
        const details: { field: string; message: string }[] = err?.error?.details || [];
        this.addressError = details.length
          ? details.map(d => d.message).join(' · ')
          : (err?.error?.message || 'Could not save address. Please try again.');
        this.savingAddress = false;
      }
    });
  }

  // ── Delivery ───────────────────────────────────────────────────────────────

  selectDelivery(id: 'standard' | 'express'): void {
    if (this.orderService.selectedDelivery === id) return;
    this.orderService.selectedDelivery = id;
    this.loadSummary(id);
  }

  private loadSummary(delivery: 'standard' | 'express'): void {
    this.summaryLoading = true;
    this.orderService.fetchCheckoutSummary(delivery).subscribe({
      next: () => { this.summaryLoading = false; },
      error: () => { this.summaryLoading = false; }
    });
  }

  // ── Navigate ───────────────────────────────────────────────────────────────

  continueToPayment(): void {
    if (!this.orderService.selectedAddressId) {
      this.continueError = 'Please select a delivery address.';
      return;
    }
    this.continueError = '';
    this.router.navigate(['/checkout/payment']);
  }
}
