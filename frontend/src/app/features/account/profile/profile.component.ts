import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  form: FormGroup;
  loading = false; success = ''; error = '';

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.form = this.fb.group({
      name:  ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit(): void {
    const u = this.authService.currentUser;
    if (u) this.form.patchValue({ name: u.name, email: u.email });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true; this.error = '';
    this.authService.updateProfile(this.form.value).subscribe({
      next: () => { this.loading = false; this.success = 'Profile updated successfully!'; setTimeout(() => this.success = '', 3000); },
      error: err => { this.loading = false; this.error = err.error?.message || 'Update failed.'; },
    });
  }
}
