import {HttpClient} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {
  IContactPayload,
  IContactResponse,
} from '../../shared/models/contact.model';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  private http: HttpClient = inject(HttpClient);
  private baseUrl: string = environment.API_URL;

  public contactUs(payload: IContactPayload): Observable<IContactResponse> {
    return this.http.post<IContactResponse>(
      `${this.baseUrl}/api/contact-us`,
      payload
    );
  }
}
