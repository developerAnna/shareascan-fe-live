import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {
  AddToCardResponse,
  ICartPayload,
  ICartResponse,
  IRemoveItemResponse,
  IUpdateResponse,
  ICardUpdatedPayload,
} from '../../shared/models/cart.model';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private http: HttpClient = inject(HttpClient);
  private baseUrl: string = environment.API_URL;

  public viewCart(): Observable<ICartResponse> {
    return this.http.get<ICartResponse>(`${this.baseUrl}/api/view-cart`);
  }

  public addToCart(cartPayload: ICartPayload): Observable<AddToCardResponse> {
    return this.http.post<AddToCardResponse>(
      `${this.baseUrl}/api/add-to-cart`,
      cartPayload
    );
  }

  public updateCart(
    cartUpdatePayload: ICardUpdatedPayload
  ): Observable<IUpdateResponse> {
    return this.http.post<IUpdateResponse>(
      `${this.baseUrl}/api/update-cart`,
      cartUpdatePayload
    );
  }

  public removeCardItem(id: number): Observable<IRemoveItemResponse> {
    return this.http.delete<IRemoveItemResponse>(
      `${this.baseUrl}/api/remove-cart-item/${id}`
    );
  }
}
