import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs';
import {
  ICreateOrderResponse,
  IOrderPayload,
  IOrdersResponse,
} from '../../shared/models/orders.model';

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  private http: HttpClient = inject(HttpClient);
  private baseUrl: string = environment.API_URL;

  public createOrder(payload: IOrderPayload): Observable<ICreateOrderResponse> {
    return this.http.post<ICreateOrderResponse>(
      `${this.baseUrl}/api/create-order`,
      payload
    );
  }

  public getOrders(): Observable<IOrdersResponse> {
    return this.http.get<IOrdersResponse>(`${this.baseUrl}/api/get-orders`);
  }
}
