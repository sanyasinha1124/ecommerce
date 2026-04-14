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

  // ngOnInit(): void {
  //   this.loadProducts();
  //   this.adminService.getTaxonomy().subscribe(t => this.taxonomy = t);
  // }

  // Ensure taxonomy is actually populated
ngOnInit(): void {
  this.loadProducts();
  this.adminService.getTaxonomy().subscribe({
    next: (t) => {
      this.taxonomy = t;
      console.log('Taxonomy Loaded:', t); // Debug to see if data exists
    },
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


     this.editing = null;
  this.form.reset();
  this.selectedFile = null;
  this.selectedTypeId = '';
  this.selectedCategoryId = '';
  this.error = '';
  this.showForm = true;

  // ← ADD THIS: disable sub-category until category is picked
  this.form.get('subCategoryId')?.disable();
  }

 

 openEdit(p: Product): void {
  this.editing = p;
  const sub = p.subCategory;

  // Force everything to string so the HTML <select> recognizes the value
  this.selectedTypeId = sub?.category?.type?.id ? String(sub.category.type.id) : '';
  this.selectedCategoryId = sub?.category?.id ? String(sub.category.id) : '';

  this.form.patchValue({
    name: p.name,
    description: p.description,
    price: p.price,
    stock: p.stock,
    subCategoryId: sub?.id ? String(sub.id) : '', // Ensure this is a string
  });
  
 //enable subCategory because we have a valid category
  if (this.selectedCategoryId) {
    this.form.get('subCategoryId')?.enable();
  }

  this.selectedFile = null;
  this.error = '';
  this.showForm = true;
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
  this.selectedCategoryId = '';
  this.form.get('subCategoryId')?.setValue('');
  this.form.get('subCategoryId')?.markAsUntouched();

  // ← ADD THIS: disable subCategory until category is chosen
  this.form.get('subCategoryId')?.disable();
}

onCategoryChange(e: Event): void {
 const value = (e.target as HTMLSelectElement).value;
  this.selectedCategoryId = value;
  this.form.get('subCategoryId')?.setValue('');
  this.form.get('subCategoryId')?.markAsUntouched();

  // ← ADD THIS: re-enable subCategory now that category is chosen
  if (value) {
    this.form.get('subCategoryId')?.enable();
  }
  
}
// Add this inside the class (usually above or below the submit method)
onFileChange(e: Event): void {
  const element = e.target as HTMLInputElement;
  const files = element.files;
  
  if (files && files.length > 0) {
    this.selectedFile = files[0];
  }
}
 



// Update this getter to be more robust
get catsForType(): Category[] {
  if (!this.selectedTypeId) return [];
  // Find using a loose comparison (==) or String conversion
  const type = this.taxonomy.find(t => String(t.id) === String(this.selectedTypeId));
  return type?.categories ?? [];
}

get subsForCat(): SubCategory[] {
  if (!this.selectedCategoryId) return [];
  // Loop through types to find the category
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

  // ← CHANGE form.value to form.getRawValue()
  // disabled controls are excluded from .value but included in .getRawValue()
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
      this.saving    = false;
      this.showForm  = false;
      this.success   = this.editing ? 'Product updated!' : 'Product created!';
      this.loadProducts();
      setTimeout(() => (this.success = ''), 3000);
    },
    error: (err) => {
      this.saving = false;
      this.error  = err.error?.message || 'Save failed. Please try again.';
    },
  });
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
