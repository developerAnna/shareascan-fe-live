import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {
  IAddReviewResponse,
  IReviewPayload,
  IReviewResponse,
} from '../../shared/models/review.model';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private http: HttpClient = inject(HttpClient);
  private baseUrl: string = environment.API_URL;

  public getProductReviews(id: string): Observable<IReviewResponse> {
    return this.http.get<IReviewResponse>(
      `${this.baseUrl}/api/get-reviews/${id}`
    );
  }

  public addReview(review: IReviewPayload): Observable<IAddReviewResponse> {
    return this.http.post<IAddReviewResponse>(
      `${this.baseUrl}/api/review`,
      review
    );
  }
}
