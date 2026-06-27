import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  trustStrip = [
    'Lab tested & certified products',
    'Free shipping above ₹999',
    '7 days hassle-free return',
    '100% Secure encrypted payments'
  ];

  quickLinks = [
    { label: 'Asthma Care', link: '/category/asthma-care' },
    { label: 'Herbal Powders', link: '/category/herbal-care' },
    { label: 'Skin Care', link: '/category/skin-care' },
    { label: 'Hair Care', link: '/category/hair-care' },
    { label: 'Wellness Supplements', link: '/category/wellness' }
  ];

  companyLinks = [
    { label: 'Our Story', link: '/our-story' },
    { label: 'Contact Us', link: '/contact-us' },
    { label: 'My Profile', link: '/account' },
    { label: 'Order History', link: '/account' },
    { label: 'My Wallet', link: '/account' }
  ];

  currentYear = new Date().getFullYear();
}
