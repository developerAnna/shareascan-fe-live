import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {
  IUserWishlistResponse, IWishlistRemoveResponse,
  IWishlistResponse,
} from '../../shared/models/wishlist.model';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  private http: HttpClient = inject(HttpClient);
  private baseUrl: string = environment.API_URL;

  public getUserWishlist(): Observable<IUserWishlistResponse> {
    return this.http.get<IUserWishlistResponse>(`${this.baseUrl}/api/wishlist`);
  }

  public addToWishlist(
    userId: string,
    productId: string
  ): Observable<IWishlistResponse> {
    return this.http.post<IWishlistResponse>(
      `${this.baseUrl}/api/add-to-wishlist`,
      {
        user_id: userId,
        product_id: productId,
      }
    );
  }

  public removeFromWishlist(
    productId: string
  ): Observable<IWishlistRemoveResponse> {
    return this.http.delete<IWishlistRemoveResponse>(
      `${this.baseUrl}/api/remove-wishlist-product/${productId}`
    );
  }
}
