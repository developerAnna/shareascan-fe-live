import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs';
import {ICheckoutResponse} from '../../shared/models/checkout.model';

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {
  private http: HttpClient = inject(HttpClient);
  private baseUrl: string = environment.API_URL;

  public checkout(cartId: number): Observable<ICheckoutResponse> {
    const params = new HttpParams()
      .set('cart_id', cartId.toString())
      .set('payment_method', 'credit_card');

    return this.http.get<ICheckoutResponse>(`${this.baseUrl}/api/checkout`, {
      params,
    });
  }
}
