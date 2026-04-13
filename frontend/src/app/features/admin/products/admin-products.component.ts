import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { DefaultImageComponent } from '../../../shared/components/default-image/default-image.component';
import { Product, ProductType, Category, SubCategory } from '../../../core/models/models';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DefaultImageComponent,FormsModule],
  templateUrl: './admin-products.component.html',
  styleUrls: ['./admin-products.component.css'],
})
export class AdminProductsComponent implements OnInit {
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

  // Cascading dropdown state
  selectedTypeId = '';
  selectedCategoryId = '';

  form: FormGroup;

  constructor(private fb: FormBuilder, private adminService: AdminService) {
    this.form = this.fb.group({
      name:          ['', Validators.required],
      description:   ['', Validators.required],
      price:         ['', [Validators.required, Validators.min(0)]],
      stock:         ['', [Validators.required, Validators.min(0)]],
      subCategoryId: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadProducts();
    this.adminService.getTaxonomy().subscribe(t => this.taxonomy = t);
  }

  loadProducts(): void {
    this.loading = true;
    this.adminService.getProducts().subscribe({
      next: p => { this.products = p; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  openCreate(): void {
    this.editing = null;
    this.form.reset();
    this.selectedFile = null;
    this.selectedTypeId = '';
    this.selectedCategoryId = '';
    this.error = '';
    this.showForm = true;
  }

 

  openEdit(p: Product): void {
  this.editing = p;
  const sub = p.subCategory;

  // Convert to string to match the <select> value attribute behavior
  this.selectedTypeId = sub?.category?.type?.id ? String(sub.category.type.id) : '';
  this.selectedCategoryId = sub?.category?.id ? String(sub.category.id) : '';

  this.form.patchValue({
    name: p.name,
    description: p.description,
    price: p.price,
    stock: p.stock,
    subCategoryId: sub?.id ?? '', // Ensure this is also a string if the ID in HTML is a string
  });
  
  this.showForm = true;
}

  onFileChange(e: Event): void {
    const f = (e.target as HTMLInputElement).files;
    if (f?.length) this.selectedFile = f[0];
  }

  // onTypeChange(e: Event): void {
  //   this.selectedTypeId = (e.target as HTMLSelectElement).value;
  //   this.selectedCategoryId = '';
  //   this.form.patchValue({ subCategoryId: '' });
  // }

  // ... inside AdminProductsComponent ...

  onTypeChange(e: Event): void {
    const value = (e.target as HTMLSelectElement).value;
    this.selectedTypeId = value;
    this.selectedCategoryId = ''; // Reset category
    this.form.patchValue({ subCategoryId: '' }); // Reset form control
    this.form.get('subCategoryId')?.markAsUntouched();
  }

  onCategoryChange(e: Event): void {
    const value = (e.target as HTMLSelectElement).value;
    this.selectedCategoryId = value;
    this.form.patchValue({ subCategoryId: '' }); // Reset form control
    this.form.get('subCategoryId')?.markAsUntouched();
  }

  // Getters using == instead of === or explicit String conversion for safer matching
  get catsForType(): Category[] {
    if (!this.selectedTypeId) return [];
    const type = this.taxonomy.find(t => String(t.id) === this.selectedTypeId);
    return type?.categories ?? [];
  }

  get subsForCat(): SubCategory[] {
    if (!this.selectedCategoryId) return [];
    // Efficiently find subcategories
    for (const t of this.taxonomy) {
      const cat = t.categories?.find(c => String(c.id) === this.selectedCategoryId);
      if (cat) return cat.subCategories ?? [];
    }
    return [];
  }

submit(): void {
    if (this.form.invalid) {
      console.log('Missing fields:', this.getFormValidationErrors());
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.error = '';

    const fd = new FormData();
    // Append form values
    Object.entries(this.form.value).forEach(([key, value]) => {
      fd.append(key, String(value));
    });

    // Append file if selected
    if (this.selectedFile) {
      fd.append('image', this.selectedFile);
    }

    const request = this.editing
      ? this.adminService.updateProduct(this.editing.id, fd)
      : this.adminService.createProduct(fd);

    request.subscribe({
      next: () => {
        this.saving = false;
        this.showForm = false;
        this.success = this.editing ? 'Product updated!' : 'Product created!';
        this.loadProducts();
        setTimeout(() => (this.success = ''), 3000);
      },
      error: (err) => {
        this.saving = false;
        this.error = err.error?.message || 'Save failed. Please try again.';
      }
    });
  }
  // Helper to find exactly what is blocking your form
  private getFormValidationErrors() {
    const errors: any = {};
    Object.keys(this.form.controls).forEach(key => {
      const controlErrors = this.form.get(key)?.errors;
      if (controlErrors != null) errors[key] = controlErrors;
    });
    return errors;
  }

 

  confirmDelete(id: number): void { this.deleteConfirmId = id; }

  deleteProduct(id: number): void {
    this.adminService.deleteProduct(id).subscribe({
      next: () => {
        this.deleteConfirmId = null;
        this.success = 'Product deleted.';
        setTimeout(() => this.success = '', 3000);
        this.loadProducts();
      },
      error: () => { this.deleteConfirmId = null; },
    });
  }
}
