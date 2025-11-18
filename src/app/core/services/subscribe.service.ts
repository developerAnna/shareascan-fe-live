import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {ISubscribeResponse} from '../../shared/models/subscribe.model';

@Injectable({
  providedIn: 'root',
})
export class SubscribeService {
  private http: HttpClient = inject(HttpClient);
  private baseUrl: string = environment.API_URL;

  public subscribe(email: string): Observable<ISubscribeResponse> {
    return this.http.post<ISubscribeResponse>(`${this.baseUrl}/api/subscribe`, {
      email,
    });
  }
}
