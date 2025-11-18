import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import {catchError, from, lastValueFrom, Observable, throwError} from 'rxjs';
import {inject} from '@angular/core';

import {environment} from '../../../environments/environment';
import {AuthenticationService} from '../services/authentication.service';

export const httpInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const skipIntercept: boolean = req.headers.get('skip') === 'true';

  if (skipIntercept) {
    req = req.clone({
      headers: req.headers.delete('skip'),
    });
    return next(req);
  }

  const authService = inject(AuthenticationService);
  return from(handle(req, next, authService.isAuthenticated()));
};

const getUrl = (request: HttpRequest<unknown>): string => {
  const fullUrl: string = request.url.replace(environment.API_URL, '');
  const url: string = fullUrl.replace(/^\//, '');
  return `${environment.API_URL}/${url}`;
};

/**
 * Handles the HTTP request by modifying the URL and optionally setting the authentication token.
 *
 * @param req - The original HTTP request.
 * @param next - The next handler function in the HTTP request chain.
 * @param setToken - A boolean indicating whether to set the authentication token in the request headers. Default is false.
 * @returns A promise that resolves to an observable of the HTTP event.
 */
const handle = async (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  setToken = false
) => {
  req = req.clone({
    url: getUrl(req),
  });

  if (setToken) {
    const authService = inject(AuthenticationService);
    const token = authService.getToken();
    req = req.clone({
      setHeaders: {
        'X-Access-Token': token,
      },
    });
  }

  try {
    return await lastValueFrom(
      next(req).pipe(
        catchError((error: HttpErrorResponse) => {
          return throwError((): HttpErrorResponse => error);
        })
      )
    );
  } catch (error) {
    throw error;
  }
};
