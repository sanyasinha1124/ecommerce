import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent {
  form: FormGroup;
  loading = false; error = ''; success = '';
  email: string;

  constructor(private fb: FormBuilder, private authService: AuthService,
              private route: ActivatedRoute, private router: Router) {
    this.email = this.route.snapshot.queryParams['email'] || '';
    this.form = this.fb.group({
      code:        ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/(?=.*[A-Z])(?=.*[0-9])/)]],
    });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true; this.error = '';
    this.authService.resetPassword({ email: this.email, ...this.form.value }).subscribe({
      next: () => { this.loading = false; this.success = 'Password reset! Redirecting…'; setTimeout(() => this.router.navigate(['/login']), 1500); },
      error: err => { this.loading = false; this.error = err.error?.message || 'Reset failed.'; },
    });
  }
}
