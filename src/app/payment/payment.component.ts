import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../cart.service';

type PaymentMethod = 'upi' | 'cards' | 'wallet' | 'banking' | 'cod';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent {
  constructor(public cart: CartService, private router: Router) {}

  selectedMethod: PaymentMethod = 'upi';

  upiApps = ['GPay', 'PhonePe', 'Paytm'];
  selectedUpiApp = '';
  customUpiId = '';

  banks = ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank'];
  selectedBank = '';

  card = { number: '', name: '', expiry: '', cvv: '' };

  walletBalance = 500;
  walletCashback = 50;

  get discountAmount(): number {
    return Math.round(this.cart.subtotal * 0.15);
  }

  get taxAmount(): number {
    return Math.round((this.cart.subtotal - this.discountAmount) * 0.05);
  }

  get total(): number {
    return this.cart.subtotal - this.discountAmount + this.taxAmount;
  }

  get walletShortfall(): number {
    return Math.max(0, this.total - this.walletBalance);
  }

  selectMethod(method: PaymentMethod): void {
    this.selectedMethod = method;
  }

  selectUpiApp(app: string): void {
    this.selectedUpiApp = app;
  }

  selectBank(bank: string): void {
    this.selectedBank = bank;
  }

  payAndComplete(): void {
    this.router.navigate(['/checkout/processing']);
  }
}
