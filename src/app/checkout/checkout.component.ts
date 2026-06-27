import { Component } from '@angular/core';
import { CartService } from '../cart.service';

interface Address {
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

interface DeliveryOption {
  id: string;
  label: string;
  eta: string;
  price: number;
}

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent {
  constructor(public cart: CartService) {}

  addresses: Address[] = [
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

  selectedAddressId = 'home';
  addingAddress = false;

  newAddress = {
    name: '',
    mobile: '',
    line1: '',
    city: '',
    state: '',
    zip: '',
    type: 'Home'
  };

  deliveryOptions: DeliveryOption[] = [
    { id: 'standard', label: 'Standard Delivery', eta: '5-6 business days', price: 0 },
    { id: 'express', label: 'Express Delivery', eta: '2 business days', price: 150 }
  ];

  selectedDeliveryId = 'standard';

  get discountAmount(): number {
    return Math.round(this.cart.subtotal * 0.15);
  }

  get shippingCost(): number {
    return this.deliveryOptions.find((option) => option.id === this.selectedDeliveryId)?.price ?? 0;
  }

  get taxAmount(): number {
    return Math.round((this.cart.subtotal - this.discountAmount) * 0.05);
  }

  get total(): number {
    return this.cart.subtotal - this.discountAmount + this.taxAmount + this.shippingCost;
  }

  selectAddress(id: string): void {
    this.selectedAddressId = id;
  }

  toggleAddAddress(): void {
    this.addingAddress = !this.addingAddress;
  }

  setNewAddressType(type: string): void {
    this.newAddress.type = type;
  }

  saveAddress(): void {
    const id = `addr-${this.addresses.length + 1}`;
    this.addresses.push({
      id,
      label: this.newAddress.type,
      isDefault: false,
      name: this.newAddress.name || 'John Doe',
      line1: this.newAddress.line1,
      city: this.newAddress.city,
      state: this.newAddress.state,
      zip: this.newAddress.zip,
      phone: this.newAddress.mobile
    });
    this.selectedAddressId = id;
    this.addingAddress = false;
    this.newAddress = { name: '', mobile: '', line1: '', city: '', state: '', zip: '', type: 'Home' };
  }

  selectDelivery(id: string): void {
    this.selectedDeliveryId = id;
  }
}
