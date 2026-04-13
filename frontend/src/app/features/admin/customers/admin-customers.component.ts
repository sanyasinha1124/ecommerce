import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-customers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-customers.component.html',
})
export class AdminCustomersComponent implements OnInit {
  customers: any[] = [];
  loading = true;
  togglingId: number | null = null;
  success = '';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.adminService.getCustomers().subscribe({
      next: c => { this.customers = c; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  toggleLock(id: number): void {
    this.togglingId = id;
    this.adminService.toggleLock(id).subscribe({
      next: res => {
        this.togglingId = null;
        this.success = res.message;
        setTimeout(() => this.success = '', 3000);
        const c = this.customers.find(x => x.id === id);
        if (c) c.isLocked = res.isLocked;
      },
      error: () => { this.togglingId = null; },
    });
  }
}
