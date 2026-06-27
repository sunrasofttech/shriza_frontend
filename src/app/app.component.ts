import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CartService } from './cart.service';

const NO_CHROME_ROUTES = ['/login', '/signup', '/forgot-password', '/verify-otp', '/checkout/processing'];

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'shriza';
  showChrome = true;

  constructor(private router: Router, public cartService: CartService) {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.showChrome = !NO_CHROME_ROUTES.includes(this.router.url.split('?')[0]);
    });
  }
}
