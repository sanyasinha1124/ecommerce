import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-customers',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-wrapper">
      <div class="page-header">
        <div class="header-text">
          <h1>Customer Management</h1>
          <p class="subtitle">{{ customers.length }} Registered Users</p>
        </div>
      </div>

      <div class="alert success" *ngIf="success">{{ success }}</div>

      <div *ngIf="loading" class="loader-box">
        <div class="spinner"></div>
        <p>Fetching user records...</p>
      </div>

      <div *ngIf="!loading" class="table-card">
        <table class="styled-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Customer Details</th>
              <th>Joined Date</th>
              <th>Account Status</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of customers" [class.locked-row]="c.isLocked">
              <td class="mono">#{{ c.id }}</td>
              <td>
                <div class="user-cell">
                  <div class="avatar">{{ c.name.charAt(0) }}</div>
                  <div class="user-meta">
                    <span class="name">{{ c.name }}</span>
                    <span class="email">{{ c.email }}</span>
                  </div>
                </div>
              </td>
              <td class="date-cell">{{ c.createdAt | date:'longDate' }}</td>
              <td>
                <span class="status-badge" [class.locked]="c.isLocked">
                  {{ c.isLocked ? 'Suspended' : 'Active' }}
                </span>
              </td>
              <td class="text-right">
                <button 
                  class="btn-action" 
                  [class.unlock]="c.isLocked"
                  (click)="toggleLock(c.id)"
                  [disabled]="togglingId === c.id">
                  <span *ngIf="togglingId !== c.id">{{ c.isLocked ? 'Unlock User' : 'Lock User' }}</span>
                  <span *ngIf="togglingId === c.id">Updating...</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div *ngIf="customers.length === 0" class="empty-state">
          <div class="icon">👥</div>
          <h3>No customers found</h3>
          <p>User accounts will appear here once they register.</p>
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
      --border-color: #eaeaec;
      --success-green: #1d896c;
    }

    .admin-wrapper {
      padding: 2rem;
      background-color: #f5f5f6;
      min-height: 100vh;
    }

    /* Header */
    .page-header { margin-bottom: 30px; }
    h1 { font-size: 24px; font-weight: 700; color: var(--charcoal); margin: 0; }
    .subtitle { color: var(--grey); margin: 5px 0 0; font-size: 14px; }

    /* Table Container */
    .table-card {
      background: white;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.03);
    }

    .styled-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }

    .styled-table th {
      background: #f5f5f6;
      padding: 16px;
      color: var(--grey);
      font-weight: 700;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      border-bottom: 1px solid var(--border-color);
    }

    .styled-table td {
      padding: 16px;
      border-bottom: 1px solid var(--border-color);
      color: var(--charcoal);
      vertical-align: middle;
      font-size: 14px;
    }

    /* User Cell & Avatar */
    .user-cell { display: flex; align-items: center; gap: 12px; }
    .avatar {
      width: 36px; height: 36px; background: var(--charcoal); color: white;
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 14px; text-transform: uppercase;
    }
    .user-meta { display: flex; flex-direction: column; }
    .name { font-weight: 700; color: var(--charcoal); }
    .email { font-size: 12px; color: var(--grey); }

    .mono { font-family: monospace; font-weight: 600; color: var(--grey); }
    .date-cell { color: #535766; font-size: 13px; }
    .text-right { text-align: right; }

    /* Status Badges */
    .status-badge {
      background: #eefaf6; color: var(--success-green);
      padding: 4px 10px; border-radius: 4px; font-size: 11px;
      font-weight: 700; text-transform: uppercase; border: 1px solid #dcf3eb;
    }
    .status-badge.locked {
      background: var(--light-pink); color: var(--pink); border-color: #ffdce3;
    }

    /* Row State */
    .locked-row td { background-color: #fafafa; }

    /* Action Button */
    .btn-action {
      background: white; color: var(--charcoal); border: 1px solid #d4d5d9;
      padding: 6px 14px; border-radius: 4px; cursor: pointer;
      font-weight: 700; font-size: 11px; text-transform: uppercase; transition: all 0.2s;
    }
    .btn-action:hover { border-color: var(--charcoal); background: var(--charcoal); color: white; }
    .btn-action.unlock { color: var(--pink); border-color: #ffdce3; }
    .btn-action.unlock:hover { background: var(--pink); color: white; border-color: var(--pink); }
    .btn-action:disabled { opacity: 0.5; cursor: not-allowed; }

    /* Global Utils */
    .alert { 
      padding: 15px; border-radius: 4px; margin-bottom: 20px; 
      font-weight: 700; font-size: 13px; text-align: center;
      background: var(--charcoal); color: white; text-transform: uppercase;
    }
    .loader-box { padding: 5rem; text-align: center; color: var(--grey); }
    .spinner {
      width: 30px; height: 30px; border: 3px solid #f3f3f3; border-top: 3px solid var(--pink);
      border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 15px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .empty-state { padding: 5rem; text-align: center; color: var(--grey); }
    .empty-state .icon { font-size: 40px; margin-bottom: 15px; }
  `]
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