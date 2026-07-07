import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrderService } from '../order.service';

@Component({
  selector: 'app-order-confirmation',
  templateUrl: './order-confirmation.component.html',
  styleUrls: ['./order-confirmation.component.css']
})
export class OrderConfirmationComponent implements OnInit {
  constructor(public orderService: OrderService, private router: Router) {}

  ngOnInit(): void {
    if (!this.orderService.placedOrder) {
      this.router.navigate(['/']);
    }
  }

  get order() { return this.orderService.placedOrder!; }
  get address() { return this.orderService.selectedAddress; }

  continueShopping(): void {
    this.orderService.resetCheckout();
    this.router.navigate(['/products']);
  }
}
