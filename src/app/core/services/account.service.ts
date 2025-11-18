import {inject, Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {
  HotItemsResponse,
  OrdersResponse,
} from '../../shared/models/account.model';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private http: HttpClient = inject(HttpClient);
  private baseUrl: string = environment.API_URL;

  public hotItems(): Observable<HotItemsResponse> {
    return this.http.get<HotItemsResponse>(`${this.baseUrl}/api/hot-items`);
  }

  public getOrders(): Observable<OrdersResponse> {
    return this.http.get<OrdersResponse>(`${this.baseUrl}/api/get-orders`);
  }

  public getOrderDetail(id: number): Observable<OrdersResponse> {
    return this.http.get<OrdersResponse>(
      `${this.baseUrl}/api/order-detail/${id}`
    );
  }
}
