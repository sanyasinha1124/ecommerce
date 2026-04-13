import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { ProductService } from '../../../core/services/product.service';
import { DefaultImageComponent } from '../../../shared/components/default-image/default-image.component';
import { Product, ProductType } from '../../../core/models/models';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, DefaultImageComponent],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
})
export class ProductListComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  taxonomy: ProductType[] = [];
  loading = false;
  filterOpen = false;
  currentPage = 1; totalPages = 1; total = 0; limit = 12;
  activeFilters: { label: string; key: string }[] = [];
  
  filterForm: FormGroup;
  private destroy$ = new Subject<void>();

  constructor(private productService: ProductService, private route: ActivatedRoute,
              private router: Router, private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      keyword: [''], typeId: [''], categoryId: [''], subCategoryId: [''],
      minPrice: [''], maxPrice: [''], inStockOnly: [false],sortBy: ['newest']
    });
  }

  ngOnInit(): void {
    this.productService.getTaxonomy().subscribe(t => this.taxonomy = t);
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(p => {
      this.filterForm.patchValue({
        keyword: p['keyword'] || '', typeId: p['typeId'] || '',
        categoryId: p['categoryId'] || '', subCategoryId: p['subCategoryId'] || '',
        minPrice: p['minPrice'] || '', maxPrice: p['maxPrice'] || '',
        inStockOnly: p['inStockOnly'] === 'true',
      }, { emitEvent: false });
      this.currentPage = p['page'] ? +p['page'] : 1;
      this.loadProducts();
    });
    this.filterForm.get('keyword')!.valueChanges.pipe(
      debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$)
    ).subscribe(() => this.applyFilters());
    // Listen for Price and Sort changes
this.filterForm.valueChanges.pipe(
  debounceTime(500), // Wait for user to stop typing prices
  distinctUntilChanged(),
  takeUntil(this.destroy$)
).subscribe(() => {
  this.applyFilters();
});
  }

  loadProducts(): void {
    this.loading = true;
    const q = this.buildQuery();
    const req = q.keyword ? this.productService.search(q) : this.productService.getProducts(q);
    req.subscribe({
      next: r => { this.products = r.products; this.total = r.pagination.total; this.totalPages = r.pagination.totalPages; this.loading = false; this.buildChips(); 
        console.log("Products: ", this.products);
      },
      error: () => { this.loading = false; },
    });
  }

  buildQuery() {
    const v = this.filterForm.value;
    return { keyword: v.keyword || undefined, typeId: v.typeId || undefined, categoryId: v.categoryId || undefined,
      subCategoryId: v.subCategoryId || undefined, minPrice: v.minPrice || undefined, maxPrice: v.maxPrice || undefined,
      inStockOnly: v.inStockOnly || undefined, page: this.currentPage, limit: this.limit };
  }

  applyFilters(): void {
    this.currentPage = 1;
    const v = this.filterForm.value;
    this.router.navigate([], { queryParams: {
      keyword: v.keyword || null, typeId: v.typeId || null, categoryId: v.categoryId || null,
      subCategoryId: v.subCategoryId || null, minPrice: v.minPrice || null, maxPrice: v.maxPrice || null,
      inStockOnly: v.inStockOnly || null, page: null,
    }, queryParamsHandling: 'merge' });
  }

  clearFilter(key: string): void { this.filterForm.patchValue({ [key]: key === 'inStockOnly' ? false : '' }); this.applyFilters(); }
  clearAll(): void { this.filterForm.reset({ keyword: '', typeId: '', categoryId: '', subCategoryId: '', minPrice: '', maxPrice: '', inStockOnly: false }); this.applyFilters(); }

  buildChips(): void {
    const v = this.filterForm.value; const f: { label: string; key: string }[] = [];
    if (v.keyword)       f.push({ label: `"${v.keyword}"`, key: 'keyword' });
    if (v.typeId)        f.push({ label: this.typeName(+v.typeId), key: 'typeId' });
    if (v.categoryId)    f.push({ label: this.catName(+v.categoryId), key: 'categoryId' });
    if (v.subCategoryId) f.push({ label: this.subName(+v.subCategoryId), key: 'subCategoryId' });
    if (v.minPrice)      f.push({ label: `Min ₹${v.minPrice}`, key: 'minPrice' });
    if (v.maxPrice)      f.push({ label: `Max ₹${v.maxPrice}`, key: 'maxPrice' });
    if (v.inStockOnly)   f.push({ label: 'In Stock Only', key: 'inStockOnly' });
    this.activeFilters = f;
  }

  typeName(id: number): string { return this.taxonomy.find(t => t.id === id)?.name || `Type ${id}`; }
  catName(id: number): string { for (const t of this.taxonomy) for (const c of t.categories || []) if (c.id === id) return c.name; return `Cat ${id}`; }
  subName(id: number): string { for (const t of this.taxonomy) for (const c of t.categories || []) for (const s of c.subCategories || []) if (s.id === id) return s.name; return `Sub ${id}`; }
  catsForType(tid: string): any[] { return this.taxonomy.find(t => t.id === +tid)?.categories || []; }
  subsForCat(cid: string): any[] { for (const t of this.taxonomy) for (const c of t.categories || []) if (c.id === +cid) return c.subCategories || []; return []; }

  goToPage(p: number): void { if (p < 1 || p > this.totalPages) return; this.currentPage = p; this.router.navigate([], { queryParams: { page: p }, queryParamsHandling: 'merge' }); window.scrollTo({ top: 0, behavior: 'smooth' }); }

  get pages(): number[] {
    const t = this.totalPages, c = this.currentPage;
    if (t <= 7) return Array.from({ length: t }, (_, i) => i + 1);
    if (c <= 4) return [1, 2, 3, 4, 5, -1, t];
    if (c >= t - 3) return [1, -1, t-4, t-3, t-2, t-1, t];
    return [1, -1, c-1, c, c+1, -1, t];
  }

  onTypeChange(e: Event): void { this.filterForm.patchValue({ categoryId: '', subCategoryId: '', typeId: (e.target as HTMLSelectElement).value }); this.applyFilters(); }
  onCatChange(e: Event): void { this.filterForm.patchValue({ subCategoryId: '', categoryId: (e.target as HTMLSelectElement).value }); this.applyFilters(); }
  onSubChange(e: Event): void { this.filterForm.patchValue({ subCategoryId: (e.target as HTMLSelectElement).value }); this.applyFilters(); }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
