import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {
  IProductResponse,
  IQrCodeResponse,
  IRecentlyResponse,
  IRecentlyViewedResponse,
} from '../../shared/models/product.model';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http: HttpClient = inject(HttpClient);
  private baseUrl: string = environment.API_URL;

  public getProductById(id: string): Observable<IProductResponse> {
    return this.http.get<IProductResponse>(
      `${this.baseUrl}/api/product-detail/${id}`
    );
  }

  public getRecentlyViewedProducts(): Observable<IRecentlyResponse> {
    return this.http.get<IRecentlyResponse>(
      `${this.baseUrl}/api/recently-viewed`
    );
  }

  public storeRecentlyViewedProduct(
    productId: string,
    userId: string
  ): Observable<IRecentlyViewedResponse> {
    return this.http.post<IRecentlyViewedResponse>(
      `${this.baseUrl}/api/store-recently-viewed`,
      {
        user_id: userId,
        product_id: productId,
      }
    );
  }

  public getAllQrCodes(): Observable<IQrCodeResponse> {
    return this.http.get<IQrCodeResponse>(`${this.baseUrl}/api/qr-codes`);
  }
}
