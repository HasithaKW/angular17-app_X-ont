// ============================================================
// login.component.ts — Session-based login
//
// Posts username/password to /api/auth/login on your .NET 8 backend.
// The server validates credentials, creates a Session, sets
// Session["Main_LoginUser"] etc., and returns user info as JSON.
// The browser stores the session cookie automatically.
//
// ⚠️ You need to add an AuthController to your .NET 8 project.
//    See the SETUP NOTES below for the minimal controller needed.
// ============================================================

import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService, LoginRequest } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private auth   = inject(AuthService);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);

  credentials: LoginRequest = { userName: '', password: '' };
  isLoading = signal(false);
  errorMsg  = signal('');

  onSubmit(): void {
    if (!this.credentials.userName || !this.credentials.password) {
      this.errorMsg.set('Username and password are required.');
      return;
    }

    this.isLoading.set(true);
    this.errorMsg.set('');

    this.auth.login(this.credentials).subscribe({
      next: res => {
        this.isLoading.set(false);
        if (res.success) {
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] ?? '/list';
          this.router.navigateByUrl(returnUrl);
        } else {
          this.errorMsg.set(res.message ?? 'Login failed. Please check your credentials.');
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMsg.set('Login failed. Please check your credentials.');
      }
    });
  }
}
