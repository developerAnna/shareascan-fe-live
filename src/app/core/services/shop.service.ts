import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs';
import {IShopResponse, IShopProductPrice} from '../../shared/models/shop.model';

@Injectable({
  providedIn: 'root',
})
export class ShopService {
  private http: HttpClient = inject(HttpClient);
  private baseUrl: string = environment.API_URL;

  public getShopData(
    page = 1,
    search_product_title = '',
    category_type = '',
    color = '',
    size = '',
    sorting = ''
  ): Observable<IShopResponse> {
    const params = new URLSearchParams({page: page.toString()});

    const optionalParams = {
      search_product_title,
      category_type,
      color,
      size,
      sorting,
    };

    Object.entries(optionalParams).forEach(([key, value]) => {
      if (value) {
        params.append(key, value);
      }
    });

    return this.http.get<IShopResponse>(
      `${this.baseUrl}/api/shop-page-data?${params.toString()}`
    );
  }

  public getProductPrice(productId: string): Observable<IShopProductPrice> {
    return this.http.get<IShopProductPrice>(
      `${this.baseUrl}/api/product-price/${productId}`
    );
  }
}
