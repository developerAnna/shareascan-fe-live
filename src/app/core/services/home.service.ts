import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {IHomeCategory} from '../../shared/models/home.model';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  private http: HttpClient = inject(HttpClient);
  private baseUrl: string = environment.API_URL;

  public getHomeCategories(): Observable<IHomeCategory> {
    return this.http.get<IHomeCategory>(
      `${this.baseUrl}/api/home-page-categories`
    );
  }
}
