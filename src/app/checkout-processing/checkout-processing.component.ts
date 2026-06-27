import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-checkout-processing',
  templateUrl: './checkout-processing.component.html',
  styleUrls: ['./checkout-processing.component.css']
})
export class CheckoutProcessingComponent implements OnInit, OnDestroy {
  constructor(private router: Router) {}

  private timer?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this.timer = setTimeout(() => {
      this.router.navigate(['/checkout/confirmation']);
    }, 2200);
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }
}
