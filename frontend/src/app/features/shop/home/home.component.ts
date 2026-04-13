import { Component, OnInit, OnDestroy, HostListener, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { DefaultImageComponent } from '../../../shared/components/default-image/default-image.component';
import { Product, ProductType } from '../../../core/models/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, DefaultImageComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, OnDestroy {
  featured: Product[]    = [];
  newArrivals: Product[] = [];
  taxonomy: ProductType[] = [];
  searchTerm  = '';
  loading     = true;
  activeBanner = 0;
  searchFocused = false;
  searchSuggestions = [
    'Mechanical Keyboard', 'Office Chair', 'Standing Desk',
    'Watercolour Set', 'Notebook', 'Wireless Mouse',
  ];

  private bannerTimer: any;
  private countdownTimer: any;
  dealCountdown = { h: '05', m: '47', s: '30' };
  private totalSeconds = 5 * 3600 + 47 * 60 + 30;

  banners = [
    {
      label:    'New Season',
      headline: 'Elevate Your\nWorkspace',
      sub:      'Premium desks, chairs and accessories for the modern professional',
      cta:      'Shop Furniture',
      typeId:   2,
      accent:   '#1a1a2e',
      highlight:'#e94560',
    },
    {
      label:    'Tech Edition',
      headline: 'Power Every\nMoment',
      sub:      'Keyboards, mice and gadgets that keep you at peak performance',
      cta:      'Shop Electronics',
      typeId:   1,
      accent:   '#0f3460',
      highlight:'#533483',
    },
    {
      label:    'Back to School',
      headline: 'Learn Without\nLimits',
      sub:      'Notebooks, pens and art supplies for every creative mind',
      cta:      'Shop Stationery',
      typeId:   3,
      accent:   '#2d6a4f',
      highlight:'#52b788',
    },
  ];

  benefits = [
    { icon: '🚚', title: 'Free Delivery',    text: 'On all orders above ₹999 across India.' },
    { icon: '↩️', title: 'Easy Returns',     text: 'Return or exchange within 30 days, hassle-free.' },
    { icon: '🔒', title: 'Secure Payments',  text: '100% protected with SSL encryption.' },
    { icon: '⭐', title: 'Top Brands',       text: 'Curated from the world\'s most trusted labels.' },
    { icon: '🛡️', title: '100% Authentic',   text: 'Sourced directly from brands — always genuine.' },
    { icon: '🎧', title: '24/7 Support',     text: 'Dedicated help via chat, mail, or call anytime.' },
  ];

  testimonials = [
    { name: 'Priya S.',    location: 'Mumbai',    rating: 5, text: 'The standing desk transformed my home office. Build quality is exceptional and delivery was super fast!' },
    { name: 'Rahul M.',    location: 'Bangalore', rating: 5, text: 'Ordered the Keychron keyboard — it arrived perfectly packed. Typing on it is an absolute pleasure.' },
    { name: 'Ananya K.',   location: 'Delhi',     rating: 5, text: 'Lovely watercolour set for my daughter. The colours are vibrant and the price is unbeatable.' },
    { name: 'Vikram P.',   location: 'Chennai',   rating: 4, text: 'Great range of ergonomic chairs. The mesh office chair is worth every rupee for long work sessions.' },
  ];

  activeTestimonial = 0;
  private testimonialTimer: any;

  constructor(private productService: ProductService, private router: Router) {}

  ngOnInit(): void {
    this.productService.getProducts({ limit: 12 }).subscribe({
      next: r => {
        this.featured    = r.products.slice(0, 6);
        this.newArrivals = r.products.slice(6, 12);
        this.loading     = false;
      },
      error: () => { this.loading = false; },
    });

    this.productService.getTaxonomy().subscribe({ next: t => this.taxonomy = t });

    this.bannerTimer = setInterval(() => {
      this.activeBanner = (this.activeBanner + 1) % this.banners.length;
    }, 5000);

    this.countdownTimer = setInterval(() => {
      this.totalSeconds--;
      if (this.totalSeconds <= 0) this.totalSeconds = 6 * 3600;
      const h = Math.floor(this.totalSeconds / 3600);
      const m = Math.floor((this.totalSeconds % 3600) / 60);
      const s = this.totalSeconds % 60;
      this.dealCountdown = {
        h: h.toString().padStart(2, '0'),
        m: m.toString().padStart(2, '0'),
        s: s.toString().padStart(2, '0'),
      };
    }, 1000);

    this.testimonialTimer = setInterval(() => {
      this.activeTestimonial = (this.activeTestimonial + 1) % this.testimonials.length;
    }, 4000);
  }

  ngOnDestroy(): void {
    clearInterval(this.bannerTimer);
    clearInterval(this.countdownTimer);
    clearInterval(this.testimonialTimer);
  }

  search(): void {
    if (!this.searchTerm.trim()) return;
    this.router.navigate(['/products'], { queryParams: { keyword: this.searchTerm.trim() } });
  }

  searchSuggestion(term: string): void {
    this.searchTerm = term;
    this.search();
  }

  browse(type: 'type' | 'category' | 'sub', id: number): void {
    const map: Record<string, number> = {};
    if (type === 'type')     map['typeId']        = id;
    if (type === 'category') map['categoryId']    = id;
    if (type === 'sub')      map['subCategoryId'] = id;
    this.router.navigate(['/products'], { queryParams: map });
  }

  typeIcon(name: string): string {
    const m: Record<string, string> = {
      Electronics: '💻', Furniture: '🛋️', Stationery: '📚',
    };
    return m[name] ?? '🛍️';
  }

  typeGradient(name: string): string {
    const m: Record<string, string> = {
      Electronics: 'linear-gradient(135deg,#1a1a2e,#16213e)',
      Furniture:   'linear-gradient(135deg,#2d6a4f,#1b4332)',
      Stationery:  'linear-gradient(135deg,#0f3460,#533483)',
    };
    return m[name] ?? 'linear-gradient(135deg,#111,#333)';
  }

  stars(n: number): number[] { return Array(n).fill(0); }
}