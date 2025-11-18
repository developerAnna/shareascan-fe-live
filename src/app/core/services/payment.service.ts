import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs';
import {
  IPayPalPaymentResponse,
  IStripePaymentResponse,
} from '../../shared/models/payment.model';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private http: HttpClient = inject(HttpClient);
  private baseUrl: string = environment.API_URL;

  public generatePayPalPaymentLink(
    orderId: string
  ): Observable<IPayPalPaymentResponse> {
    const payload = {
      order_id: orderId,
    };
    return this.http.post<IPayPalPaymentResponse>(
      `${this.baseUrl}/api/paypal-payment`,
      payload
    );
  }

  public generateStripePayment(
    orderId: number
  ): Observable<IStripePaymentResponse> {
    const payload = {
      order_id: orderId,
    };
    return this.http.post<IStripePaymentResponse>(
      `${this.baseUrl}/api/create-payment-intent`,
      payload
    );
  }
}
