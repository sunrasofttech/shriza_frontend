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

interface PendingGatewayOrder {
  orderNumber:     string;
  razorpayOrderId: string;
  razorpayKeyId:   string;
  totalAmount:     number;
}

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

  loading   = false;
  verifying = false;
  errorMsg  = '';

  // Holds order/Razorpay details between placeOrder() and successful payment.
  // When set, the pay button re-opens Razorpay instead of placing a new order.
  pendingGatewayOrder: PendingGatewayOrder | null = null;

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

  get pricing()         { return this.orderService.pricing; }
  get walletBalance()   { return this.auth.currentUser?.walletBalance ?? 0; }
  get walletShortfall() { return Math.max(0, (this.pricing?.totalAmount ?? 0) - this.walletBalance); }
  get needsGateway()    { return ['upi', 'cards', 'banking'].includes(this.selectedMethod); }

  get btnLabel(): string {
    if (this.verifying) return 'Verifying Payment…';
    if (this.loading)   return this.pendingGatewayOrder ? 'Opening Razorpay…' : 'Processing…';
    if (this.pendingGatewayOrder) return 'Complete Payment';
    return this.needsGateway ? 'Pay Securely via Razorpay' : 'Place Order';
  }

  selectMethod(m: FrontendMethod): void {
    this.selectedMethod = m;
    this.errorMsg       = '';
    // Different method selected — can't reuse the pending Razorpay order
    this.pendingGatewayOrder = null;
  }

  selectUpiApp(app: string): void { this.selectedUpiApp = app; }

  payAndComplete(): void {
    this.errorMsg = '';

    // Re-open Razorpay for the already-created order (dismissal / failure retry)
    if (this.pendingGatewayOrder) {
      this.openRazorpay(this.pendingGatewayOrder);
      return;
    }

    // Frontend validation
    if (this.selectedMethod === 'upi' && !this.upiId.trim()) {
      this.errorMsg = 'Please enter your UPI ID.';
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
      upiId:          this.selectedMethod === 'upi' ? this.upiId.trim() : undefined,
    }).subscribe({
      next: (placed) => {
        if (!placed.requiresPaymentGateway) {
          // COD or Wallet — order confirmed immediately
          this.loading = false;
          this.cart.fetchCart().subscribe();
          this.router.navigate(['/checkout/confirmation']);
        } else {
          const pending: PendingGatewayOrder = {
            orderNumber:     placed.orderNumber,
            razorpayOrderId: placed.razorpayOrderId!,
            razorpayKeyId:   placed.razorpayKeyId!,
            totalAmount:     placed.totalAmount,
          };
          this.pendingGatewayOrder = pending;
          this.openRazorpay(pending);
        }
      },
      error: (err) => {
        this.loading  = false;
        this.errorMsg = err?.error?.message || 'Order could not be placed. Please try again.';
      }
    });
  }

  private async openRazorpay(pending: PendingGatewayOrder): Promise<void> {
    this.loading  = true;
    this.errorMsg = '';

    const loaded = await this.loadRazorpayScript();
    if (!loaded) {
      this.loading  = false;
      this.errorMsg = 'Payment gateway could not be loaded. Please check your internet connection.';
      return;
    }

    const addr = this.orderService.selectedAddress;
    const user = this.auth.currentUser;

    const options: any = {
      key:         pending.razorpayKeyId,
      amount:      Math.round(pending.totalAmount * 100), // paise
      currency:    'INR',
      name:        'Shriza Naturals',
      description: `Order ${pending.orderNumber}`,
      image:       'assets/logos/logo3.png',
      order_id:    pending.razorpayOrderId,
      prefill: {
        name:    addr?.fullName || user?.name  || '',
        email:   user?.email                   || '',
        contact: addr?.phone   || user?.phone  || '',
      },
      theme: { color: '#0d7644' },
      handler: (response: any) => {
        // Razorpay calls this synchronously on successful payment capture
        this.verifyAndConfirm(response, pending.orderNumber);
      },
      modal: {
        ondismiss: () => {
          this.loading  = false;
          this.errorMsg = 'Payment was not completed. Click "Complete Payment" to try again.';
        }
      },
    };

    const rzp = new (window as any).Razorpay(options);

    // payment.failed fires when Razorpay's own gateway rejects the payment
    rzp.on('payment.failed', (response: any) => {
      this.loading  = false;
      this.errorMsg = (response?.error?.description || 'Payment failed.')
        + ' Click "Retry Payment" below to try again.';

      // Get a fresh Razorpay order for the same DB order so the next attempt works
      this.orderService.retryPayment(pending.orderNumber).subscribe({
        next: (data) => {
          this.pendingGatewayOrder = {
            orderNumber:     data.orderNumber,
            razorpayOrderId: data.razorpayOrderId,
            razorpayKeyId:   data.razorpayKeyId,
            totalAmount:     data.totalAmount,
          };
        },
        error: () => {
          this.pendingGatewayOrder = null;
          this.errorMsg += ` Order number: ${pending.orderNumber}. Please contact support if money was deducted.`;
        }
      });
    });

    rzp.open();
  }

  private verifyAndConfirm(response: any, orderNumber: string): void {
    this.verifying = true;
    this.orderService.verifyPayment({
      orderNumber,
      razorpayPaymentId: response.razorpay_payment_id,
      razorpayOrderId:   response.razorpay_order_id,
      razorpaySignature: response.razorpay_signature,
    }).subscribe({
      next: () => {
        this.verifying           = false;
        this.loading             = false;
        this.pendingGatewayOrder = null;
        this.cart.fetchCart().subscribe();
        this.router.navigate(['/checkout/confirmation']);
      },
      error: (err) => {
        this.verifying = false;
        this.loading   = false;
        // Webhook may have already confirmed — show order number so user can check
        this.errorMsg = (err?.error?.message || 'Verification failed.')
          + ` If money was deducted, contact support with order number: ${orderNumber}`;
      }
    });
  }

  private loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) { resolve(true); return; }
      const s     = document.createElement('script');
      s.src       = 'https://checkout.razorpay.com/v1/checkout.js';
      s.onload    = () => resolve(true);
      s.onerror   = () => resolve(false);
      document.body.appendChild(s);
    });
  }
}
