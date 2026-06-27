import { Component } from '@angular/core';

interface Product {
  id: string;
  badge: string;
  badgeTone: 'green' | 'orange';
  category: string;
  name: string;
  rating: number;
  reviews: number;
  price: number;
  oldPrice: number;
  size: string;
  inStock: boolean;
  image: string;
}

interface RatingOption {
  value: number;
  stars: number;
}

type ViewMode = 'grid' | 'list';
type SortOption = 'popularity' | 'price-asc' | 'price-desc' | 'rating';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent {
  placeholder(seed: string, w = 480, h = 480): string {
    return `https://placehold.co/${w}x${h}/eef3ea/2f4f3f?text=${encodeURIComponent(seed)}`;
  }

  totalCatalogCount = 52;

  categories = ['Asthma Care', 'Herbal Care', 'Skin Care', 'Hair Care', 'Wellness'];

  ratingOptions: RatingOption[] = [
    { value: 4.5, stars: 4 },
    { value: 4, stars: 4 },
    { value: 3, stars: 3 }
  ];

  sortOptions: { value: SortOption; label: string }[] = [
    { value: 'popularity', label: 'Most Popular' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Top Rated' }
  ];

  products: Product[] = [
    { id: 'p1', badge: '25% OFF', badgeTone: 'green', category: 'Wellness', name: 'Shriza Pure Himalayan Shilajit Resin', rating: 4.9, reviews: 412, price: 974, oldPrice: 1299, size: '15g size', inStock: true, image: this.placeholder('Shilajit Resin') },
    { id: 'p2', badge: '15% OFF', badgeTone: 'green', category: 'Skin Care', name: 'Pure Steam-Distilled Kannauj Rose Water', rating: 4.8, reviews: 410, price: 254, oldPrice: 299, size: '100ml size', inStock: true, image: this.placeholder('Rose Water') },
    { id: 'p3', badge: '15% OFF', badgeTone: 'green', category: 'Hair Care', name: 'Shriza Bhringraj & Amla Hair Growth Oil', rating: 4.8, reviews: 320, price: 424, oldPrice: 499, size: '100ml size', inStock: true, image: this.placeholder('Hair Growth Oil') },
    { id: 'p4', badge: '20% OFF', badgeTone: 'green', category: 'Herbal Care', name: 'Premium Organic Ashwagandha Root Powder', rating: 4.8, reviews: 310, price: 399, oldPrice: 499, size: '100g size', inStock: true, image: this.placeholder('Ashwagandha Root') },
    { id: 'p5', badge: '10% OFF', badgeTone: 'green', category: 'Skin Care', name: 'Shriza Aloe Vera & Vitamin E Soothing Gel', rating: 4.7, reviews: 290, price: 224, oldPrice: 249, size: '100g size', inStock: true, image: this.placeholder('Aloe Vera Gel') },
    { id: 'p6', badge: '5% OFF', badgeTone: 'green', category: 'Hair Care', name: 'Neem Wood Anti-Static Hair Comb', rating: 4.8, reviews: 250, price: 142, oldPrice: 149, size: 'Standard size', inStock: true, image: this.placeholder('Hair Comb') },
    { id: 'p7', badge: '20% OFF', badgeTone: 'green', category: 'Skin Care', name: 'Kumkumadi Radiance Face Elixir Oil', rating: 4.9, reviews: 340, price: 799, oldPrice: 999, size: '12ml size', inStock: true, image: this.placeholder('Face Elixir Oil') },
    { id: 'p8', badge: '15% OFF', badgeTone: 'green', category: 'Wellness', name: 'Kashmiri Kesar (Premium Grade A Saffron)', rating: 4.9, reviews: 270, price: 339, oldPrice: 399, size: '1g size', inStock: true, image: this.placeholder('Saffron') },
    { id: 'p9', badge: '10% OFF', badgeTone: 'green', category: 'Wellness', name: 'Organic Tulsi Holy Basil Drops', rating: 4.7, reviews: 210, price: 162, oldPrice: 180, size: '30ml size', inStock: true, image: this.placeholder('Tulsi Drops') },
    { id: 'p10', badge: '12% OFF', badgeTone: 'green', category: 'Hair Care', name: 'Red Onion & Black Seed Hair Vitalizer', rating: 4.6, reviews: 190, price: 439, oldPrice: 499, size: '100ml size', inStock: true, image: this.placeholder('Hair Vitalizer') },
    { id: 'p11', badge: '12% OFF', badgeTone: 'green', category: 'Herbal Care', name: 'Triphala Digestive Wellness Powder', rating: 4.7, reviews: 195, price: 246, oldPrice: 280, size: '100g size', inStock: true, image: this.placeholder('Triphala Powder') },
    { id: 'p12', badge: '15% OFF', badgeTone: 'orange', category: 'Wellness', name: 'Amrit Ras-Chyawanprash (Special Saffron)', rating: 4.8, reviews: 180, price: 509, oldPrice: 600, size: '500g size', inStock: true, image: this.placeholder('Chyawanprash') },
    { id: 'p13', badge: '12% OFF', badgeTone: 'green', category: 'Skin Care', name: 'Neem & Tea Tree Clarifying Face Wash', rating: 4.6, reviews: 180, price: 307, oldPrice: 349, size: '100ml size', inStock: true, image: this.placeholder('Face Wash') },
    { id: 'p14', badge: '15% OFF', badgeTone: 'green', category: 'Hair Care', name: 'Rosemary & Lavender Hair Growth Mist', rating: 4.9, reviews: 170, price: 297, oldPrice: 349, size: '100ml size', inStock: true, image: this.placeholder('Hair Growth Mist') },
    { id: 'p15', badge: '10% OFF', badgeTone: 'green', category: 'Herbal Care', name: 'Turmeric Haldi Golden Milk Blend', rating: 4.9, reviews: 165, price: 288, oldPrice: 320, size: '100g size', inStock: true, image: this.placeholder('Golden Milk Blend') },
    { id: 'p16', badge: '10% OFF', badgeTone: 'green', category: 'Wellness', name: 'Premium A2 Desi Cow Ghee', rating: 4.9, reviews: 160, price: 809, oldPrice: 899, size: '500ml size', inStock: true, image: this.placeholder('A2 Cow Ghee') },
    { id: 'p17', badge: '15% OFF', badgeTone: 'green', category: 'Herbal Care', name: 'Organic Neem Detoxifying Powder', rating: 4.5, reviews: 180, price: 254, oldPrice: 299, size: '100g size', inStock: false, image: this.placeholder('Neem Powder') },
    { id: 'p18', badge: '10% OFF', badgeTone: 'green', category: 'Skin Care', name: 'Pure Kashmiri Saffron Lip Butter', rating: 4.7, reviews: 144, price: 198, oldPrice: 220, size: '8g size', inStock: true, image: this.placeholder('Lip Butter') },
    { id: 'p19', badge: '18% OFF', badgeTone: 'green', category: 'Asthma Care', name: 'Tulsi-Curcumin Lung Shield Tablets', rating: 4.9, reviews: 142, price: 491, oldPrice: 599, size: '60 Tablets size', inStock: true, image: this.placeholder('Lung Shield Tablets') },
    { id: 'p20', badge: '10% OFF', badgeTone: 'green', category: 'Hair Care', name: 'Shikakai & Reetha Anti-Hairfall Shampoo', rating: 4.7, reviews: 145, price: 341, oldPrice: 379, size: '200ml size', inStock: true, image: this.placeholder('Anti-Hairfall Shampoo') },
    { id: 'p21', badge: '10% OFF', badgeTone: 'green', category: 'Skin Care', name: 'Saffron & Sandalwood Cleansing Ubtan', rating: 4.7, reviews: 130, price: 359, oldPrice: 399, size: '100g size', inStock: true, image: this.placeholder('Cleansing Ubtan') }
  ];

  keyword = '';
  selectedCategories: string[] = [];
  maxPrice = 1500;
  minRating = 0;
  inStockOnly = false;
  sortBy: SortOption = 'popularity';
  viewMode: ViewMode = 'grid';
  filtersOpen = false;

  readonly priceFloor = 100;
  readonly priceCeil = 1500;

  get filteredProducts(): Product[] {
    const keyword = this.keyword.trim().toLowerCase();

    const filtered = this.products.filter((product) => {
      const matchesKeyword = !keyword || product.name.toLowerCase().includes(keyword);
      const matchesCategory = this.selectedCategories.length === 0 || this.selectedCategories.includes(product.category);
      const matchesPrice = product.price <= this.maxPrice;
      const matchesRating = product.rating >= this.minRating;
      const matchesStock = !this.inStockOnly || product.inStock;
      return matchesKeyword && matchesCategory && matchesPrice && matchesRating && matchesStock;
    });

    return [...filtered].sort((a, b) => {
      switch (this.sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        default:
          return b.reviews - a.reviews;
      }
    });
  }

  stars(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => (i < Math.round(rating) ? 1 : 0));
  }

  toggleCategory(category: string): void {
    this.selectedCategories = this.selectedCategories.includes(category)
      ? this.selectedCategories.filter((c) => c !== category)
      : [...this.selectedCategories, category];
  }

  isCategorySelected(category: string): boolean {
    return this.selectedCategories.includes(category);
  }

  setMinRating(value: number): void {
    this.minRating = this.minRating === value ? 0 : value;
  }

  setView(mode: ViewMode): void {
    this.viewMode = mode;
  }

  setSort(value: string): void {
    this.sortBy = value as SortOption;
  }

  openFilters(): void {
    this.filtersOpen = true;
  }

  closeFilters(): void {
    this.filtersOpen = false;
  }

  clearFilters(): void {
    this.keyword = '';
    this.selectedCategories = [];
    this.maxPrice = this.priceCeil;
    this.minRating = 0;
    this.inStockOnly = false;
  }
}
