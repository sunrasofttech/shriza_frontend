import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../cart.service';
import { OrderService } from '../order.service';
import { AuthService } from '../auth.service';

type FrontendMethod = 'upi' | 'cards' | 'wallet' | 'banking' | 'cod';

const METHOD_MAP: Record<FrontendMethod, string> = {
  upi:     'upi',
  cards:   'card',
  wallet:  'wallet',
  banking: 'net_banking',
  cod:     'cod',
};

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
  selectedMethod: FrontendMethod = 'upi';

  upiApps = ['GPay', 'PhonePe', 'Paytm'];
  selectedUpiApp = '';
  upiId = '';

  banks = ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank'];
  selectedBank = '';

  card = { number: '', name: '', expiry: '', cvv: '' };

  loading = false;
  errorMsg = '';

  constructor(
    public cart: CartService,
    public orderService: OrderService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.orderService.selectedAddressId) {
      this.router.navigate(['/checkout']);
      return;
    }
    if (!this.orderService.pricing) {
      this.orderService.fetchCheckoutSummary(this.orderService.selectedDelivery).subscribe();
    }
  }

  get pricing() { return this.orderService.pricing; }

  get walletBalance(): number { return this.auth.currentUser?.walletBalance ?? 0; }

  get walletShortfall(): number {
    return Math.max(0, (this.pricing?.totalAmount ?? 0) - this.walletBalance);
  }

  selectMethod(m: FrontendMethod): void { this.selectedMethod = m; }
  selectUpiApp(app: string): void {
    this.selectedUpiApp = app;
    if (!this.upiId) this.upiId = '';
  }
  selectBank(bank: string): void { this.selectedBank = bank; }

  payAndComplete(): void {
    this.errorMsg = '';

    // Basic frontend validation
    if (this.selectedMethod === 'upi' && !this.upiId.trim()) {
      this.errorMsg = 'Please enter your UPI ID.';
      return;
    }
    if (this.selectedMethod === 'banking' && !this.selectedBank) {
      this.errorMsg = 'Please select a bank.';
      return;
    }
    if (this.selectedMethod === 'wallet' && this.walletShortfall > 0) {
      this.errorMsg = `Insufficient wallet balance. You need ₹${this.walletShortfall.toFixed(2)} more.`;
      return;
    }

    this.loading = true;
    this.orderService.placeOrder({
      addressId:      this.orderService.selectedAddressId,
      deliveryOption: this.orderService.selectedDelivery,
      paymentMethod:  METHOD_MAP[this.selectedMethod],
      upiId:          this.selectedMethod === 'upi'     ? this.upiId.trim()   : undefined,
      bankCode:       this.selectedMethod === 'banking' ? this.selectedBank   : undefined,
    }).subscribe({
      next: () => {
        this.loading = false;
        // Clear cart state locally (backend already cleared it)
        this.cart.fetchCart().subscribe();
        this.router.navigate(['/checkout/processing']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'Order could not be placed. Please try again.';
      }
    });
  }
}
