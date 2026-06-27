import { Injectable } from '@angular/core';

export interface OrderItem {
  name: string;
  size: string;
  quantity: number;
  price: number;
  image: string;
}

export interface ShippingAddress {
  name: string;
  line1: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  orderNumber = 'SHZ-20260623-9573';
  orderDate = '2026-06-23';
  expectedDelivery = '2026-06-28';
  courier = 'Delhivery Logistics';
  paymentStatus = 'PAID';
  paymentMethod = 'UPI';
  deliverySpeed = 'Standard';

  items: OrderItem[] = [
    {
      name: 'Tulsi-Curcumin Lung Shield Tablets',
      size: '60 Tablets',
      quantity: 2,
      price: 491.18,
      image: 'https://placehold.co/160x160/eef3ea/2f4f3f?text=Lung+Shield'
    }
  ];

  shippingAddress: ShippingAddress = {
    name: 'John Doe',
    line1: 'Flat 402, Green Meadows, Sector 15, Vashi',
    city: 'Navi Mumbai',
    state: 'Maharashtra',
    zip: '400703',
    phone: '9876543210'
  };

  discountPercent = 15;

  get itemsSubtotal(): number {
    return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  get discount(): number {
    return (this.itemsSubtotal * this.discountPercent) / 100;
  }

  get tax(): number {
    return 42;
  }

  get totalAmount(): number {
    return this.itemsSubtotal - this.discount + this.tax;
  }
}
