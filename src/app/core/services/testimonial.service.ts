import {HttpClient} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs';
import {ITestimonialResponse} from '../../shared/models/testimonial';

@Injectable({
  providedIn: 'root',
})
export class TestimonialService {
  private http: HttpClient = inject(HttpClient);
  private baseUrl: string = environment.API_URL;

  public getTestimonials(): Observable<ITestimonialResponse> {
    return this.http.get<ITestimonialResponse>(
      `${this.baseUrl}/api/testimonials`
    );
  }
}
