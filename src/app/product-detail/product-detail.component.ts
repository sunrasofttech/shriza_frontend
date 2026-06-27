import { Component } from '@angular/core';

interface RelatedProduct {
  badge: string;
  category: string;
  name: string;
  rating: number;
  reviews: number;
  price: number;
  oldPrice: number;
  size: string;
  image: string;
}

interface RatingBar {
  stars: number;
  percent: number;
}

interface Faq {
  question: string;
  answer: string;
  open: boolean;
}

type DetailTab = 'benefits' | 'ingredients' | 'usage';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent {
  placeholder(seed: string, w = 600, h = 600): string {
    return `https://placehold.co/${w}x${h}/eef3ea/2f4f3f?text=${encodeURIComponent(seed)}`;
  }

  category = 'Asthma Care';
  name = 'Shriza Shwas-Swasthya Asthma Relief Powder';
  rating = 4.8;
  reviews = 124;
  stockLeft = 50;
  price = 639;
  oldPrice = 799;
  discount = 20;
  quantity = 1;
  isWishlisted = false;

  description =
    'A premium Ayurvedic formulation of traditional herbs crafted to support respiratory health, clear lung congestion, and ease natural breathing. Ideal for chronic bronchial irritation and seasonal asthma relief.';

  sizes = ['100g', '250g', '500g'];
  selectedSize = '100g';

  images = [this.placeholder('Front', 240, 240), this.placeholder('Tea', 800, 800), this.placeholder('Tube', 240, 240)];
  activeImage = this.images[1];

  activeTab: DetailTab = 'benefits';

  benefits = [
    'Supports clear and easy respiratory pathways',
    'Helps reduce bronchial spasms and wheezing',
    'Strengthens lung tissues and immunity',
    '100% natural, preservative-free formulation'
  ];

  ingredients = ['Vasaka leaf extract', 'Tulsi (Holy Basil)', 'Liquorice root', 'Mulethi', 'Pippali fruit powder'];

  usage = [
    'Take half to one teaspoon with warm water, twice daily after meals.',
    'For best results, use consistently for 4-6 weeks.',
    'Shake well before each use and store in a cool, dry place.'
  ];

  faqs: Faq[] = [
    {
      question: 'Is this product safe for children?',
      answer: 'Yes, in smaller doses (half teaspoon) for children above 5 years, but consult an Ayurvedic practitioner first.',
      open: true
    },
    {
      question: 'How long does it take to show results?',
      answer: 'Most customers notice improved breathing and reduced congestion within 2-3 weeks of regular use.',
      open: false
    }
  ];

  ratingBreakdown: RatingBar[] = [
    { stars: 5, percent: 85 },
    { stars: 4, percent: 12 },
    { stars: 3, percent: 3 },
    { stars: 2, percent: 0 },
    { stars: 1, percent: 0 }
  ];

  relatedProducts: RelatedProduct[] = [
    { badge: '15% OFF', category: 'Asthma Care', name: 'Broncho-Pure Herbal Inhalant Oil', rating: 4.6, reviews: 82, price: 297, oldPrice: 349, size: '15ml size', image: this.placeholder('Inhalant Oil') },
    { badge: '10% OFF', category: 'Asthma Care', name: 'Lung-Detox Herbal Tea Infusion', rating: 4.7, reviews: 95, price: 449, oldPrice: 499, size: '20 Tea Bags size', image: this.placeholder('Tea Infusion') },
    { badge: '5% OFF', category: 'Asthma Care', name: 'Shwas-Ananda Respiratory Syrup', rating: 4.5, reviews: 64, price: 266, oldPrice: 280, size: '200ml size', image: this.placeholder('Respiratory Syrup') },
    { badge: '18% OFF', category: 'Asthma Care', name: 'Tulsi-Curcumin Lung Shield Tablets', rating: 4.9, reviews: 142, price: 491, oldPrice: 599, size: '60 Tablets size', image: this.placeholder('Lung Shield Tablets') }
  ];

  stars(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => (i < Math.round(rating) ? 1 : 0));
  }

  setActiveImage(image: string): void {
    this.activeImage = image;
  }

  setSize(size: string): void {
    this.selectedSize = size;
  }

  setTab(tab: DetailTab): void {
    this.activeTab = tab;
  }

  increment(): void {
    this.quantity++;
  }

  decrement(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  toggleWishlist(): void {
    this.isWishlisted = !this.isWishlisted;
  }

  toggleFaq(faq: Faq): void {
    faq.open = !faq.open;
  }
}
