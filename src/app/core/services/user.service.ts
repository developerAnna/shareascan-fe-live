import {inject, Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {UserPayload, UserResponse} from '../../shared/models/account.model';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http: HttpClient = inject(HttpClient);
  private baseUrl: string = environment.API_URL;

  public updateUserInfo(
    id: number,
    payload: UserPayload
  ): Observable<UserResponse> {
    return this.http.post<UserResponse>(
      `${this.baseUrl}/api/update-user-details/${id}`,
      payload
    );
  }
  public getUserInfo(id: number): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.baseUrl}/api/user-detail/${id}`);
  }
}
