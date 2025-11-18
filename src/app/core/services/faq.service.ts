import {HttpClient} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs';
import {IFAQResponse} from '../../shared/models/faq.model';

@Injectable({
  providedIn: 'root',
})
export class FaqService {
  private http: HttpClient = inject(HttpClient);
  private baseUrl: string = environment.API_URL;

  public faq(): Observable<IFAQResponse> {
    return this.http.get<IFAQResponse>(`${this.baseUrl}/api/faq`);
  }
}
