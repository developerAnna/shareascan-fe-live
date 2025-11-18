import {CanActivateFn, Router, UrlTree} from '@angular/router';
import {inject} from '@angular/core';
import {AuthenticationService} from '../services/authentication.service';
import {Observable, map} from 'rxjs';

export const AuthenticationGuard: CanActivateFn = ():
  | boolean
  | UrlTree
  | Observable<boolean | UrlTree> => {
  const router: Router = inject(Router);
  const authService: AuthenticationService = inject(AuthenticationService);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']).then();
    return false;
  }

  return authService.validateToken().pipe(
    map((isValid) => {
      if (!isValid) {
        router.navigate(['/login']).then();
        return false;
      }
      return true;
    })
  );
};
