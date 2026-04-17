import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { DefaultImageComponent } from '../../../shared/components/default-image/default-image.component';
import { Product, ProductType, Category, SubCategory } from '../../../core/models/models';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DefaultImageComponent, FormsModule],
  template: `
    <div class="admin-content">
      <div class="page-header">
        <div class="header-text">
          <h1>Product Management</h1>
          <p>{{ products.length }} items in your catalog</p>
        </div>
        <button class="btn-add" (click)="openCreate()">
          {{ showForm ? 'Close Form' : '+ Add New Product' }}
        </button>
      </div>

      <div class="alert success" *ngIf="success">{{ success }}</div>
      <div class="alert error" *ngIf="error">{{ error }}</div>

      <div class="form-wrapper" *ngIf="showForm" #formContainer>
        <div class="form-card">
          <div class="form-title">{{ editing ? 'Update Product' : 'Create New Entry' }}</div>
          <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="grid-form">
              <div class="field full">
                <label>Upload Image</label>
                <input type="file" (change)="onFileChange($event)" class="file-input">
              </div>

              <div class="field">
                <label>Product Name</label>
                <input type="text" formControlName="name" placeholder="e.g. Summer Dress">
              </div>

              <div class="field">
                <label>Price (₹)</label>
                <input type="number" formControlName="price">
              </div>

              <div class="field">
                <label>Type</label>
                <select [value]="selectedTypeId" (change)="onTypeChange($event)">
                  <option value="">Select Type</option>
                  <option *ngFor="let t of taxonomy" [value]="t.id">{{ t.name }}</option>
                </select>
              </div>

              <div class="field">
                <label>Category</label>
                <select [value]="selectedCategoryId" (change)="onCategoryChange($event)" [disabled]="!selectedTypeId">
                  <option value="">Select Category</option>
                  <option *ngFor="let c of catsForType" [value]="c.id">{{ c.name }}</option>
                </select>
              </div>

              <div class="field">
                <label>Sub-Category</label>
                <select formControlName="subCategoryId">
                  <option value="">Select Sub-Category</option>
                  <option *ngFor="let s of subsForCat" [value]="s.id">{{ s.name }}</option>
                </select>
              </div>

              <div class="field">
                <label>In Stock</label>
                <input type="number" formControlName="stock">
              </div>

              <div class="field full">
                <label>Description</label>
                <textarea formControlName="description" rows="3"></textarea>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="btn-cancel" (click)="showForm = false">Cancel</button>
              <button type="submit" class="btn-submit" [disabled]="saving">
                {{ saving ? 'Saving...' : 'Save Product' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div class="table-card">
        <table class="styled-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Category Path</th>
              <th>Price</th>
              <th>Stock</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody *ngIf="!loading">
            <tr *ngFor="let p of products">
              <td>
                <div class="item-cell">
                  <app-default-image [imagePath]="p.imagePath" class="thumb"></app-default-image>
                  <div class="item-meta">
                    <span class="name">{{ p.name }}</span>
                    <span class="id">#{{ p.id }}</span>
                  </div>
                </div>
              </td>
              <td>
                <span class="path-badge">{{ p.subCategory.category.name }}</span>
                <span class="path-arrow">›</span>
                <span class="path-sub">{{ p.subCategory.name }}</span>
              </td>
              <td class="price">₹{{ p.price | number }}</td>
              <td>
                <div class="stock-pill" [class.low]="p.stock < 10">{{ p.stock }} units</div>
              </td>
              <td>
                <div class="action-row">
                  <button class="edit-btn" (click)="openEdit(p)">Edit</button>
                  <button class="delete-btn" (click)="confirmDelete(p.id)">
                    {{ deleteConfirmId === p.id ? 'Sure?' : 'Delete' }}
                  </button>
                  <button *ngIf="deleteConfirmId === p.id" class="confirm-btn" (click)="deleteProduct(p.id)">Confirm</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div class="table-loading" *ngIf="loading">
          <div class="spinner"></div>
          <p>Syncing database...</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { 
      font-family: 'Segoe UI', sans-serif !important; 
      --pink: #ff3f6c;
      --charcoal: #282c3f;
      --grey: #94969f;
      --light-pink: #fff1f4;
    }

    .admin-content { animation: fadeIn 0.3s ease-out; }

    /* Header */
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
    h1 { color: var(--charcoal); font-size: 24px; font-weight: 700; margin: 0; }
    .header-text p { color: var(--grey); margin: 5px 0 0; font-size: 14px; }

    .btn-add { 
      background: var(--pink); color: white; border: none; padding: 12px 24px; 
      border-radius: 4px; font-weight: 700; cursor: pointer; text-transform: uppercase; font-size: 12px;
      transition: transform 0.2s;
    }
    .btn-add:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(255, 63, 108, 0.3); }

    /* Alerts */
    .alert { padding: 15px; border-radius: 4px; margin-bottom: 20px; font-weight: 600; font-size: 14px; text-align: center; }
    .success { background: #e7f9f3; color: #1d896c; border: 1px solid #c2eddf; }
    .error { background: var(--light-pink); color: var(--pink); border: 1px solid #ffdce3; }

    /* Form Card */
    .form-wrapper { margin-bottom: 40px; }
    .form-card { background: white; border-radius: 8px; border: 1px solid #eaeaec; padding: 25px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
    .form-title { font-size: 16px; font-weight: 700; color: var(--charcoal); border-bottom: 1px solid #f5f5f6; padding-bottom: 15px; margin-bottom: 20px; text-transform: uppercase; }

    .grid-form { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
    .full { grid-column: span 2; }
    
    .field label { display: block; font-size: 12px; font-weight: 700; color: var(--charcoal); margin-bottom: 8px; text-transform: uppercase; }
    .field input, .field select, .field textarea {
      width: 100%; border: 1px solid #d4d5d9; padding: 10px; border-radius: 4px; font-size: 14px; outline: none;
    }
    .field input:focus { border-color: var(--pink); }
    .field select:disabled { background: #f5f5f6; color: #b2b3b8; }

    .form-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 25px; }
    .btn-cancel { background: none; border: 1px solid #d4d5d9; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-weight: 600; }
    .btn-submit { background: var(--charcoal); color: white; border: none; padding: 10px 30px; border-radius: 4px; cursor: pointer; font-weight: 700; }

    /* Table Styling */
    .table-card { background: white; border-radius: 8px; border: 1px solid #eaeaec; overflow: hidden; }
    .styled-table { width: 100%; border-collapse: collapse; }
    .styled-table th { background: #f5f5f6; padding: 15px; text-align: left; font-size: 12px; text-transform: uppercase; color: var(--grey); border-bottom: 1px solid #eaeaec; }
    .styled-table td { padding: 15px; border-bottom: 1px solid #eaeaec; vertical-align: middle; }
    
    .item-cell { display: flex; align-items: center; gap: 15px; }
    .thumb { width: 45px; height: 55px; object-fit: cover; border-radius: 2px; }
    .name { display: block; font-weight: 700; color: var(--charcoal); font-size: 14px; }
    .id { font-size: 11px; color: var(--grey); }

    .path-badge { font-weight: 600; color: var(--charcoal); }
    .path-arrow { margin: 0 5px; color: var(--pink); font-weight: 900; }
    .path-sub { color: var(--grey); font-size: 13px; }

    .price { font-weight: 700; color: var(--charcoal); }
    .stock-pill { display: inline-block; padding: 4px 10px; border-radius: 20px; background: #f5f5f6; font-size: 11px; font-weight: 700; color: #1d896c; }
    .stock-pill.low { background: var(--light-pink); color: var(--pink); }

    .action-row { display: flex; gap: 8px; justify-content: flex-end; }
    .action-row button { border: 1px solid #d4d5d9; background: white; padding: 5px 12px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer; text-transform: uppercase; }
    .action-row .edit-btn:hover { border-color: var(--charcoal); background: var(--charcoal); color: white; }
    .action-row .delete-btn { color: var(--pink); border-color: #ffdce3; }
    .action-row .confirm-btn { background: var(--pink); color: white; border: none; }

    .spinner { width: 30px; height: 30px; border: 3px solid #f3f3f3; border-top: 3px solid var(--pink); border-radius: 50%; animation: spin 1s linear infinite; margin: 20px auto; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class AdminProductsComponent implements OnInit {
  @ViewChild('formContainer') formContainer!: ElementRef;
  
  products: Product[] = [];
  taxonomy: ProductType[] = [];
  loading = true;
  showForm = false;
  editing: Product | null = null;
  saving = false;
  error = '';
  success = '';
  selectedFile: File | null = null;
  deleteConfirmId: number | null = null;

  selectedTypeId = '';
  selectedCategoryId = '';

  form: FormGroup;

  constructor(private fb: FormBuilder, private adminService: AdminService) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      subCategoryId: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadProducts();
    this.adminService.getTaxonomy().subscribe({
      next: (t) => this.taxonomy = t,
      error: (err) => console.error('Taxonomy Error:', err)
    });
  }

  loadProducts(): void {
    this.loading = true;
    this.adminService.getProducts().subscribe({
      next: p => { this.products = p; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  openCreate(): void {
    if(this.showForm && !this.editing) {
      this.showForm = false;
      return;
    }
    this.editing = null;
    this.form.reset();
    this.selectedFile = null;
    this.selectedTypeId = '';
    this.selectedCategoryId = '';
    this.error = '';
    this.showForm = true;
    this.form.get('subCategoryId')?.disable();
    this.scrollToTop();
  }

  openEdit(p: Product): void {
    this.editing = p;
    const sub = p.subCategory;
    this.selectedTypeId = sub?.category?.type?.id ? String(sub.category.type.id) : '';
    this.selectedCategoryId = sub?.category?.id ? String(sub.category.id) : '';

    this.form.patchValue({
      name: p.name,
      description: p.description,
      price: p.price,
      stock: p.stock,
      subCategoryId: sub?.id ? String(sub.id) : '', 
    });
    
    if (this.selectedCategoryId) this.form.get('subCategoryId')?.enable();

    this.selectedFile = null;
    this.error = '';
    this.showForm = true;
    this.scrollToTop();
  }

  onTypeChange(e: Event): void {
    const value = (e.target as HTMLSelectElement).value;
    this.selectedTypeId = value;
    this.selectedCategoryId = '';
    this.form.get('subCategoryId')?.setValue('');
    this.form.get('subCategoryId')?.disable();
  }

  onCategoryChange(e: Event): void {
    const value = (e.target as HTMLSelectElement).value;
    this.selectedCategoryId = value;
    this.form.get('subCategoryId')?.setValue('');
    if (value) this.form.get('subCategoryId')?.enable();
  }

  onFileChange(e: Event): void {
    const element = e.target as HTMLInputElement;
    if (element.files?.length) this.selectedFile = element.files[0];
  }

  get catsForType(): Category[] {
    if (!this.selectedTypeId) return [];
    const type = this.taxonomy.find(t => String(t.id) === String(this.selectedTypeId));
    return type?.categories ?? [];
  }

  get subsForCat(): SubCategory[] {
    if (!this.selectedCategoryId) return [];
    for (const t of this.taxonomy) {
      const cat = t.categories?.find(c => String(c.id) === String(this.selectedCategoryId));
      if (cat) return cat.subCategories ?? [];
    }
    return [];
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.error = '';
    const fd = new FormData();

    Object.entries(this.form.getRawValue()).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        fd.append(key, String(value));
      }
    });

    if (this.selectedFile) fd.append('image', this.selectedFile);

    const request = this.editing
      ? this.adminService.updateProduct(this.editing.id, fd)
      : this.adminService.createProduct(fd);

    request.subscribe({
      next: () => {
        this.saving = false;
        this.showForm = false;
        this.success = this.editing ? 'Product Updated' : 'Product Created';
        this.loadProducts();
        setTimeout(() => (this.success = ''), 3000);
      },
      error: (err) => {
        this.saving = false;
        this.error = err.error?.message || 'Update Failed';
      },
    });
  }

  confirmDelete(id: number): void { this.deleteConfirmId = id; }

  deleteProduct(id: number): void {
    this.adminService.deleteProduct(id).subscribe({
      next: () => {
        this.deleteConfirmId = null;
        this.success = 'Product Removed';
        setTimeout(() => this.success = '', 3000);
        this.loadProducts();
      },
      error: () => { this.deleteConfirmId = null; },
    });
  }

  private scrollToTop(): void {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  }
}