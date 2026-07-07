import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrderService } from '../order.service';

@Component({
  selector: 'app-checkout-processing',
  templateUrl: './checkout-processing.component.html',
  styleUrls: ['./checkout-processing.component.css']
})
export class CheckoutProcessingComponent implements OnInit, OnDestroy {
  constructor(private router: Router, private orderService: OrderService) {}

  private timer?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    if (!this.orderService.placedOrder) {
      this.router.navigate(['/cart']);
      return;
    }
    this.timer = setTimeout(() => {
      this.router.navigate(['/checkout/confirmation']);
    }, 2200);
  }

  ngOnDestroy(): void {
    if (this.timer) clearTimeout(this.timer);
  }
}
