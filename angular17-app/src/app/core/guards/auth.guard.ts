// auth.guard.ts — Session-based guard
// Instead of checking a JWT token, we check if AuthService._user signal is set.
// AuthService.checkSession() runs on app init and populates _user from the server.
// If session expired server-side, the next API call returns 401 and we redirect.

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  // isLoggedIn() is true when _user signal is non-null (set by checkSession on init)
  if (auth.isLoggedIn()) return true;

  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
