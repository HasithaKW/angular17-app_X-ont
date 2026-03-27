// ============================================================
// auth.service.ts — SESSION-BASED (matches your Program.cs)
//
// Your .NET 8 backend uses:
//   builder.Services.AddSession()
//   builder.Services.AddSystemWebAdapters()
//   app.UseSession()
//   NO JWT / NO AuthController
//
// How it works:
//   Browser ↔ .NET: session cookie sent automatically with every request
//   Angular: all HTTP calls use { withCredentials: true }
//   Server: Session["Main_LoginUser"] / Session["Main_BusinessUnit"] on server
//   Angular: just needs to know if session is alive + who the user is
//
// REMOVED: localStorage token, JWT decode, Authorization header
// ADDED:   checkSession() on app init, withCredentials on all calls
// ============================================================

import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SessionUser {
  userName: string;
  businessUnit: string;
  userLevelGroup: string;
  powerUser: string;
}

export interface LoginRequest {
  userName: string;
  password: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private _user = signal<SessionUser | null>(null);

  readonly user         = this._user.asReadonly();
  readonly isLoggedIn   = computed(() => this._user() !== null);
  readonly userName     = computed(() => this._user()?.userName ?? '');
  readonly businessUnit = computed(() => this._user()?.businessUnit ?? '');

  constructor(private http: HttpClient, private router: Router) {
    // On app start, ask server if a session already exists (e.g. browser refresh)
    this.checkSession();
  }

  // Ask the server if there is an active session
  checkSession(): void {
    this.http
      .get<ApiResponse<SessionUser>>(
        `${environment.apiUrl}/auth/session`,
        { withCredentials: true }   // sends session cookie
      )
      .pipe(catchError(() => of({ success: false, data: undefined } as ApiResponse<SessionUser>)))
      .subscribe(res => {
        this._user.set(res.success && res.data ? res.data : null);
      });
  }

  // POST credentials → server creates session → returns user info
  login(req: LoginRequest): Observable<ApiResponse<SessionUser>> {
    return this.http
      .post<ApiResponse<SessionUser>>(
        `${environment.apiUrl}/auth/login`,
        req,
        { withCredentials: true }   // receives session cookie from server
      )
      .pipe(
        tap(res => {
          if (res.success && res.data) this._user.set(res.data);
        })
      );
  }

  // POST to clear server session
  logout(): void {
    this.http
      .post<void>(`${environment.apiUrl}/auth/logout`, {}, { withCredentials: true })
      .pipe(catchError(() => of(null)))
      .subscribe(() => {
        this._user.set(null);
        this.router.navigate(['/login']);
      });
  }
}
