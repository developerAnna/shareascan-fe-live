import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, catchError, map, of} from 'rxjs';
import {environment} from '../../../environments/environment';
import {
  ILoginPayload,
  ILoginResponse,
  IPasswordChangePayload,
  IPasswordChangeResponse,
  IPasswordResetResponse,
  IRegisterPayload,
  IRegisterResponse,
} from '../../shared/models/auth.model';
import {AuthStore} from '../store/auth.store';
import {Router} from '@angular/router';
import {ShopDatumStoreSignal} from '../store/shop.store';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private http: HttpClient = inject(HttpClient);
  private router = inject(Router);
  private authStore = inject(AuthStore);
  private shopStore = inject(ShopDatumStoreSignal);
  private baseUrl: string = environment.API_URL;

  public logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.authStore.resetSessionMethod();
    this.shopStore.setShopDatum([]);
    this.router.navigate(['/login']).then();
  }

  public isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  public validateToken(): Observable<boolean> {
    const token = this.getToken();
    if (!token) {
      return of(false);
    }

    return this.http.get(`${this.baseUrl}/api/user`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).pipe(
      map(() => true),
      catchError(() => {
        this.logout();
        return of(false);
      })
    );
  }

  public getToken(): string {
    return localStorage.getItem('token') || '';
  }

  public login(payload: ILoginPayload): Observable<ILoginResponse> {
    return this.http.post<ILoginResponse>(`${this.baseUrl}/api/login`, payload);
  }

  public register(payload: IRegisterPayload): Observable<IRegisterResponse> {
    return this.http.post<IRegisterResponse>(
      `${this.baseUrl}/api/register`,
      payload
    );
  }

  public closeSession(): Observable<{message: string}> {
    return this.http.post<{message: string}>(`${this.baseUrl}/api/logout`, {});
  }

  public forgotPassword(payload: {
    email: string;
  }): Observable<IPasswordResetResponse> {
    return this.http.post<IPasswordResetResponse>(
      `${this.baseUrl}/api/forgot-password`,
      payload
    );
  }
  public changePassword(
    payload: IPasswordChangePayload
  ): Observable<IPasswordChangeResponse> {
    return this.http.post<IPasswordChangeResponse>(
      `${this.baseUrl}/api/change-password`,
      payload
    );
  }
}
