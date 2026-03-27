// ============================================================
// credentials.interceptor.ts
//
// REPLACES: auth.interceptor.ts (which added JWT Bearer header)
//
// Session-based auth works via browser cookies. For cookies to be
// sent cross-origin (Angular dev server → .NET API), every request
// needs { withCredentials: true }.
//
// This interceptor adds withCredentials automatically to all /api
// requests so we don't have to add it manually in every service call.
//
// Your Program.cs already has:
//   .AllowCredentials()  ← required on backend for this to work
// ============================================================

import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  // Only add withCredentials for calls to our own API
  if (req.url.startsWith(environment.apiUrl) || req.url.startsWith('/api')) {
    return next(req.clone({ withCredentials: true }));
  }
  return next(req);
};
