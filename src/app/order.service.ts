import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../environments/environment';

// ── Checkout / Address ─────────────────────────────────────────────────────────

export interface UserAddress {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

export interface CheckoutPricing {
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  taxAmount: number;
  totalAmount: number;
  shippingFree: boolean;
}

export interface PlacedOrder {
  orderNumber: string;
  orderId: string;
  expectedDeliveryDate: string;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  requiresPaymentGateway: boolean;
  razorpayOrderId?: string;
  razorpayKeyId?: string;
}

export interface RetryPaymentData {
  orderNumber: string;
  razorpayOrderId: string;
  razorpayKeyId: string;
  totalAmount: number;
}

// ── Order List ─────────────────────────────────────────────────────────────────

export interface OrderListItem {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  deliveryOption: string;
  expectedDeliveryDate: string;
  pricing: { totalAmount: number };
  itemCount: number;
  firstItem: {
    productName: string;
    thumbnailUrl: string | null;
    variantSize: string | null;
    quantity: number;
  } | null;
  trackingNumber: string | null;
  createdAt: string;
}

// ── Order Detail ───────────────────────────────────────────────────────────────

export interface OrderItem {
  id: string;
  productId: string | null;
  productName: string;
  slug: string;
  variantSize: string | null;
  unitLabel: string | null;
  thumbnailUrl: string | null;
  sku: string | null;
  quantity: number;
  unitPrice: number;
  mrp: number;
  totalPrice: number;
}

export interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine1: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    label: string;
  };
  deliveryOption: string;
  expectedDeliveryDate: string;
  shippingPartnerName: string | null;
  awbNumber: string | null;
  trackingUrl: string | null;
  pricing: {
    subtotal: number;
    discountAmount: number;
    shippingFee: number;
    taxAmount: number;
    codFee: number;
    totalAmount: number;
  };
  coupon: { code: string; type: string; discountValue: number | null } | null;
  paidAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  items: OrderItem[];
}

// ── Tracking ───────────────────────────────────────────────────────────────────

export interface TrackingStep {
  key: string;
  label: string;
  description: string;
  completed: boolean;
  completedAt: string | null;
}

export interface TrackingData {
  orderNumber: string;
  currentStatus: string;
  deliveryProgress: {
    currentStep: string;
    steps: TrackingStep[];
  };
  shipmentInfo: {
    courierPartner: string;
    awbNumber: string | null;
    trackingUrl: string | null;
    estimatedDelivery: string | null;
    shippedAt: string | null;
    deliveredAt: string | null;
    deliveryAddress: {
      fullName: string;
      phone: string;
      addressLine1: string;
      city: string;
      state: string;
      pincode: string;
      country: string;
    };
  };
  activityLog: {
    status: string;
    label: string;
    description: string | null;
    timestamp: string;
  }[];
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly BASE      = `${environment.apiUrl}/api/user/orders`;
  private readonly ADDR_BASE = `${environment.apiUrl}/api/user/addresses`;
  private readonly OPTS      = { withCredentials: true };

  // Checkout state — persists across route navigation within the session
  selectedAddressId = '';
  selectedDelivery: 'standard' | 'express' = 'standard';
  selectedAddress: UserAddress | null = null;
  pricing: CheckoutPricing | null = null;
  placedOrder: PlacedOrder | null = null;

  constructor(private http: HttpClient) {}

  // ── Addresses ────────────────────────────────────────────────────────────────

  fetchAddresses(): Observable<UserAddress[]> {
    return this.http.get<any>(this.ADDR_BASE, this.OPTS).pipe(
      map(r => {
        const raw = Array.isArray(r.data) ? r.data : (r.data?.addresses ?? []);
        return raw.map((a: any) => this.mapAddress(a));
      })
    );
  }

  addAddress(data: {
    label: string; fullName: string; phone: string;
    addressLine1: string; city: string; state: string;
    pincode: string; country?: string; isDefault?: boolean;
  }): Observable<UserAddress> {
    return this.http.post<any>(this.ADDR_BASE, { ...data, country: data.country || 'India' }, this.OPTS).pipe(
      map(r => this.mapAddress(r.data?.address ?? r.data))
    );
  }

  private mapAddress(a: any): UserAddress {
    return {
      id: a.id, label: a.label, fullName: a.fullName, phone: a.phone,
      addressLine1: a.addressLine1, city: a.city, state: a.state,
      pincode: a.pincode, country: a.country, isDefault: Boolean(a.isDefault),
    };
  }

  // ── Checkout Summary ─────────────────────────────────────────────────────────

  fetchCheckoutSummary(delivery: 'standard' | 'express'): Observable<CheckoutPricing> {
    const params = new HttpParams().set('delivery', delivery);
    return this.http.get<any>(`${this.BASE}/checkout/summary`, { ...this.OPTS, params }).pipe(
      map(r => r.data.pricing as CheckoutPricing),
      tap(p => { this.pricing = p; })
    );
  }

  // ── Place Order ──────────────────────────────────────────────────────────────

  placeOrder(payload: {
    addressId: string;
    deliveryOption: 'standard' | 'express';
    paymentMethod: string;
    upiId?: string;
    bankCode?: string;
    customerNotes?: string;
  }): Observable<PlacedOrder> {
    return this.http.post<any>(`${this.BASE}/checkout`, payload, this.OPTS).pipe(
      map(r => r.data as PlacedOrder),
      tap(order => { this.placedOrder = order; })
    );
  }

  // ── Verify Payment ───────────────────────────────────────────────────────────

  verifyPayment(payload: {
    orderNumber: string;
    razorpayPaymentId: string;
    razorpayOrderId: string;
    razorpaySignature: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.BASE}/checkout/verify-payment`, payload, this.OPTS).pipe(
      map(r => r.data)
    );
  }

  // ── Retry Payment (get fresh Razorpay order for existing pending order) ──────

  retryPayment(orderNumber: string): Observable<RetryPaymentData> {
    return this.http.post<any>(`${this.BASE}/${orderNumber}/retry-payment`, {}, this.OPTS).pipe(
      map(r => r.data as RetryPaymentData)
    );
  }

  // ── Order List ───────────────────────────────────────────────────────────────

  fetchOrders(page = 1, limit = 10): Observable<{ orders: OrderListItem[]; pagination: any }> {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get<any>(this.BASE, { ...this.OPTS, params }).pipe(
      map(r => ({
        orders:     (r.data.orders as any[]).map(this.mapListItem),
        pagination: r.data.pagination,
      }))
    );
  }

  // ── Order Detail ─────────────────────────────────────────────────────────────

  fetchOrderDetail(orderNumber: string): Observable<OrderDetail> {
    return this.http.get<any>(`${this.BASE}/${orderNumber}`, this.OPTS).pipe(
      map(r => {
        const o = r.data.order;
        const items: OrderItem[] = (r.data.items as any[]).map(i => ({
          id: i.id, productId: i.productId, productName: i.productName,
          slug: i.slug, variantSize: i.variantSize, unitLabel: i.unitLabel,
          thumbnailUrl: i.thumbnailUrl ? `${environment.imageUrl}${i.thumbnailUrl}` : null,
          sku: i.sku, quantity: i.quantity,
          unitPrice: i.unitPrice, mrp: i.mrp, totalPrice: i.totalPrice,
        }));
        return {
          id: o.id, orderNumber: o.orderNumber,
          status: o.status, paymentStatus: o.paymentStatus, paymentMethod: o.paymentMethod,
          shippingAddress: o.shippingAddress,
          deliveryOption: o.deliveryOption, expectedDeliveryDate: o.expectedDeliveryDate,
          shippingPartnerName: o.shippingPartnerName, awbNumber: o.awbNumber, trackingUrl: o.trackingUrl,
          pricing: o.pricing, coupon: o.coupon,
          paidAt: o.paidAt, shippedAt: o.shippedAt, deliveredAt: o.deliveredAt,
          createdAt: o.createdAt, items,
        } as OrderDetail;
      })
    );
  }

  // ── Order Tracking ───────────────────────────────────────────────────────────

  fetchOrderTracking(orderNumber: string): Observable<TrackingData> {
    return this.http.get<any>(`${this.BASE}/${orderNumber}/track`, this.OPTS).pipe(
      map(r => r.data as TrackingData)
    );
  }

  // ── Return Request ───────────────────────────────────────────────────────────

  requestReturn(orderNumber: string, payload: {
    reason: string;
    description?: string;
    returnType: 'refund' | 'exchange';
  }): Observable<any> {
    return this.http.post<any>(`${this.BASE}/${orderNumber}/return-request`, payload, this.OPTS).pipe(
      map(r => r.data)
    );
  }

  // ── Reset after confirmation ─────────────────────────────────────────────────

  resetCheckout(): void {
    this.selectedAddressId = '';
    this.selectedDelivery = 'standard';
    this.selectedAddress = null;
    this.pricing = null;
    this.placedOrder = null;
  }

  private mapListItem(o: any): OrderListItem {
    return {
      id: o.id, orderNumber: o.orderNumber, status: o.status,
      paymentStatus: o.paymentStatus, paymentMethod: o.paymentMethod,
      deliveryOption: o.deliveryOption, expectedDeliveryDate: o.expectedDeliveryDate,
      pricing: { totalAmount: o.pricing?.totalAmount ?? 0 },
      itemCount: o.itemCount ?? 0,
      firstItem: o.firstItem ? {
        productName: o.firstItem.productName,
        thumbnailUrl: o.firstItem.thumbnailUrl
          ? `${environment.imageUrl}${o.firstItem.thumbnailUrl}` : null,
        variantSize: o.firstItem.variantSize,
        quantity: o.firstItem.quantity,
      } : null,
      trackingNumber: o.trackingNumber,
      createdAt: o.createdAt,
    };
  }
}
