import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  error = '';
  sessionExpired: boolean;

  constructor(private fb: FormBuilder, private authService: AuthService,
              private router: Router, private route: ActivatedRoute) {
    this.form = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
    this.sessionExpired = this.route.snapshot.queryParams['reason'] === 'session_expired';
  }

  get email()    { return this.form.get('email')!; }
  get password() { return this.form.get('password')!; }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true; this.error = '';
    this.authService.login(this.form.value).subscribe({
      next: res => { this.loading = false; this.router.navigate([res.user.role === 'admin' ? '/admin' : '/']); },
      error: err => { this.loading = false; this.error = err.error?.message || 'Login failed.'; },
    });
  }
}
