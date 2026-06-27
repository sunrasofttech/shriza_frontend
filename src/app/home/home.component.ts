import { Component } from '@angular/core';

interface Product {
  badge: string;
  badgeTone: 'green' | 'pink';
  category: string;
  name: string;
  rating: number;
  reviews: number;
  price: number;
  oldPrice: number;
  image: string;
}

interface Offer {
  theme: 'green' | 'light' | 'orange';
  title: string;
  discount: string;
  desc: string;
  code: string;
}

interface Category {
  name: string;
  slug: string;
  count: number;
  image: string;
}

interface Testimonial {
  name: string;
  date: string;
  rating: number;
  verifiedFor: string;
  text: string;
  avatar: string;
  productImage: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  placeholder(seed: string, w = 480, h = 480): string {
    return `https://placehold.co/${w}x${h}/eef3ea/2f4f3f?text=${encodeURIComponent(seed)}`;
  }

  heroImage = this.placeholder('Shriza Naturals', 760, 640);

  offers: Offer[] = [
    { theme: 'green', title: 'Welcome Discount', discount: '15% OFF', desc: 'On your first purchase', code: 'FIRSTORDER' },
    { theme: 'light', title: 'Wellness Boost', discount: '20% OFF', desc: 'On Asthma & Herbal products', code: 'NATURAL20' },
    { theme: 'orange', title: 'Flat Discount', discount: '₹100 OFF', desc: 'On orders above ₹999', code: 'FLAT100' }
  ];

  trustBadges = [
    { title: '100% Natural', desc: 'Pure Organic Harvest' },
    { title: 'Lab Tested', desc: 'No Harmful Toxins' },
    { title: 'Fast Delivery', desc: 'Within 2-3 Business days' },
    { title: 'Secure Payment', desc: 'Fully Encrypted Transaction' },
    { title: 'Trusted by Thousands', desc: '25,000+ Happy Customers' }
  ];

  categories: Category[] = [
    { name: 'Asthma Care', slug: 'asthma-care', count: 36, image: this.placeholder('Asthma', 200, 200) },
    { name: 'Herbal Care', slug: 'herbal-care', count: 71, image: this.placeholder('Herbal', 200, 200) },
    { name: 'Skin Care', slug: 'skin-care', count: 71, image: this.placeholder('Skin', 200, 200) },
    { name: 'Hair Care', slug: 'hair-care', count: 56, image: this.placeholder('Hair', 200, 200) },
    { name: 'Wellness', slug: 'wellness', count: 50, image: this.placeholder('Wellness', 200, 200) }
  ];

  featuredProducts: Product[] = [
    { badge: '20% OFF', badgeTone: 'green', category: 'Asthma Care', name: 'Shriza Niwas-Swasthya Asthma Relief Powder', rating: 4.8, reviews: 128, price: 639, oldPrice: 799, image: this.placeholder('Asthma Relief Powder') },
    { badge: '15% OFF', badgeTone: 'green', category: 'Asthma Care', name: 'Broncho-Pure Herbal Inhalant Oil', rating: 4.7, reviews: 96, price: 297, oldPrice: 349, image: this.placeholder('Inhalant Oil') },
    { badge: '35% OFF', badgeTone: 'pink', category: 'Asthma Care', name: 'Lung-Detox Herbal Tea Infusion', rating: 4.7, reviews: 87, price: 449, oldPrice: 699, image: this.placeholder('Tea Infusion') },
    { badge: '15% OFF', badgeTone: 'green', category: 'Asthma Care', name: 'Niwas-Ananda Respiratory Syrup', rating: 4.5, reviews: 64, price: 266, oldPrice: 313, image: this.placeholder('Respiratory Syrup') },
    { badge: '25% OFF', badgeTone: 'green', category: 'Asthma Care', name: 'Tulsi-Curcumin Lung Shield Tablets', rating: 4.6, reviews: 142, price: 691, oldPrice: 920, image: this.placeholder('Lung Shield Tablets') },
    { badge: '15% OFF', badgeTone: 'green', category: 'Asthma Care', name: 'Vasaka Leaf Organic Extract Powder', rating: 4.6, reviews: 58, price: 351, oldPrice: 413, image: this.placeholder('Vasaka Extract') },
    { badge: '10% OFF', badgeTone: 'green', category: 'Asthma Care', name: 'Swsasta Revitalizing Breathing Tonic', rating: 4.3, reviews: 41, price: 405, oldPrice: 450, image: this.placeholder('Breathing Tonic') },
    { badge: '15% OFF', badgeTone: 'pink', category: 'Asthma Care', name: 'Allergy Shield Ayurvedic Nasal Drops', rating: 4.7, reviews: 73, price: 179, oldPrice: 210, image: this.placeholder('Nasal Drops') }
  ];

  bestSellers: Product[] = [
    { badge: '20% OFF', badgeTone: 'green', category: 'Asthma Care', name: 'Shriza Niwas-Swasthya Asthma Relief Powder', rating: 4.8, reviews: 128, price: 639, oldPrice: 799, image: this.placeholder('Asthma Relief Powder') },
    { badge: '25% OFF', badgeTone: 'green', category: 'Asthma Care', name: 'Tulsi-Curcumin Lung Shield Tablets', rating: 4.6, reviews: 142, price: 691, oldPrice: 920, image: this.placeholder('Lung Shield Tablets') },
    { badge: '20% OFF', badgeTone: 'pink', category: 'Herbal Care', name: 'Organic Neem Detoxifying Powder', rating: 4.6, reviews: 110, price: 254, oldPrice: 318, image: this.placeholder('Neem Powder') },
    { badge: '20% OFF', badgeTone: 'green', category: 'Wellness', name: 'Premium Organic Ashwagandha Root Powder', rating: 4.8, reviews: 165, price: 359, oldPrice: 449, image: this.placeholder('Ashwagandha Root') }
  ];

  newArrivals: Product[] = [
    { badge: '15% OFF', badgeTone: 'green', category: 'Asthma Care', name: 'Broncho-Pure Herbal Inhalant Oil', rating: 4.7, reviews: 96, price: 297, oldPrice: 349, image: this.placeholder('Inhalant Oil') },
    { badge: '20% OFF', badgeTone: 'green', category: 'Wellness', name: 'Premium Organic Ashwagandha Root Powder', rating: 4.8, reviews: 165, price: 359, oldPrice: 449, image: this.placeholder('Ashwagandha Root') },
    { badge: '15% OFF', badgeTone: 'green', category: 'Herbal Care', name: 'Moringa Superfood Immunity Powder', rating: 4.7, reviews: 89, price: 254, oldPrice: 299, image: this.placeholder('Moringa Powder') },
    { badge: '15% OFF', badgeTone: 'pink', category: 'Skin Care', name: 'Saffron & Sandalwood Cleansing Ubtan', rating: 4.7, reviews: 102, price: 359, oldPrice: 422, image: this.placeholder('Cleansing Ubtan') }
  ];

  whyUs = [
    {
      number: '01',
      title: 'Vedic Bhasma Process',
      desc: 'We process our herbs, oils, and ghee using traditional clay pot churning, not modern extraction or artificial heat.'
    },
    {
      number: '02',
      title: 'Single-Origin Harvesting',
      desc: 'Our roots are from Kerala, saffron from Kashmir. Sourced directly from high-altitude Himalayan farms using organic methods.'
    },
    {
      number: '03',
      title: 'Glass-Only Packaging',
      desc: 'We never house our products in toxic plastics. We utilize recycled amber glass for preserving therapeutic properties.'
    }
  ];

  testimonials: Testimonial[] = [
    {
      name: 'Rajesh Kumar',
      date: '2024-08-16',
      rating: 5,
      verifiedFor: 'Shriza Swasthya Asthma Powder',
      text: 'The Asthma Relief Powder has been a life-changer. My wheezing during seasons has dropped by 80%. I take it every morning now.',
      avatar: this.placeholder('RK', 80, 80),
      productImage: this.placeholder('Asthma Powder', 200, 200)
    },
    {
      name: 'Sneha Sharma',
      date: '2024-08-04',
      rating: 5,
      verifiedFor: 'Kumkumadi Face Elixir Oil',
      text: 'Kumkumadi oil is so luxurious! I noticed my dark spots lighten in 2 weeks and my face is glowing. Thank you!',
      avatar: this.placeholder('SS', 80, 80),
      productImage: this.placeholder('Face Elixir Oil', 200, 200)
    },
    {
      name: 'Amit Patel',
      date: '2024-07-22',
      rating: 5,
      verifiedFor: 'Mahanarayan Oil Sesame Base',
      text: 'Pure Mahanarayan oil. Excellent joint pain relief. I rub this oil daily, and my mobility recovered fast.',
      avatar: this.placeholder('AP', 80, 80),
      productImage: this.placeholder('Mahanarayan Oil', 200, 200)
    }
  ];

  galleryImages: string[] = Array.from({ length: 6 }, (_, i) => this.placeholder(`Lifestyle ${i + 1}`, 260, 260));

  productId(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  stars(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => (i < Math.round(rating) ? 1 : 0));
  }

  scrollToSection(targetId: string): void {
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
