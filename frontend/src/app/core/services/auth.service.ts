import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { User } from '../models/models';

//In Angular, a URL starting with a forward slash (like /api/...) is a relative path. This means Angular will try to call that endpoint on the same domain and port where the app is running—which is http://localhost:4200. Since your backend is actually running on http://localhost:3000, the Angular dev server looks for that route internally, can't find it, and returns a 404.
    // const API = 'http://localhost:3000/api/auth';
const API = '/api/auth';
@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  initAuth(): void {
    this.http.get<User>(`${API}/me`).subscribe({
      next: user => this.currentUserSubject.next(user),
      error: ()   => this.currentUserSubject.next(null),
    });
  }

  get currentUser(): User | null { return this.currentUserSubject.value; }
  get isLoggedIn(): boolean { return !!this.currentUserSubject.value; }
  get isAdmin(): boolean { return this.currentUserSubject.value?.role === 'admin'; }
  get isCustomer(): boolean { return this.currentUserSubject.value?.role === 'customer'; }

  register(data: { name: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${API}/register`, data);
  }

  login(data: { email: string; password: string }): Observable<{ user: User }> {
    return this.http.post<{ user: User }>(`${API}/login`, data).pipe(
      tap(res => this.currentUserSubject.next(res.user))
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${API}/logout`, {}).pipe(
      tap(() => this.clearLocalAuth())
    );
  }

  clearLocalAuth(): void { this.currentUserSubject.next(null); }

  forgotPassword(email: string): Observable<{ message: string; code: string }> {
    return this.http.post<{ message: string; code: string }>(`${API}/forgot-password`, { email });
  }

  resetPassword(data: { email: string; code: string; newPassword: string }): Observable<any> {
    return this.http.post(`${API}/reset-password`, data);
  }

  updateProfile(data: { name: string; email: string }): Observable<User> {
    return this.http.put<User>(`${API}/profile`, data).pipe(
      tap(user => this.currentUserSubject.next(user))
    );
  }

  changePassword(data: { currentPassword: string; newPassword: string }): Observable<any> {
    return this.http.put(`${API}/change-password`, data);
  }
}
