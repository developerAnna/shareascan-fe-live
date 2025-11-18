import {
  Component,
  inject,
  input,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import {Subscription} from 'rxjs';
import {TranslatePipe} from '@ngx-translate/core';
import {
  IAddReviewResponse,
  IReviewDatum,
  IReviewPayload,
  IReviewResponse,
} from '../../models/review.model';
import {ReviewService} from '../../../core/services/review.service';
import {IError} from '../../models/error.model';
import {FormsModule} from '@angular/forms';
import {ILoginData} from '../../models/auth.model';
import {toObservable} from '@angular/core/rxjs-interop';
import {AuthStore} from '../../../core/store/auth.store';
import {ErrorService} from '../../../core/services/error.service';
import {ToastService} from '../../../core/services/toast.service';
import {NgbRating} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-product-reviews',
  imports: [TranslatePipe, FormsModule, NgbRating],
  templateUrl: './product-reviews.component.html',
  styleUrl: './product-reviews.component.css',
})
export class ProductReviewsComponent implements OnInit, OnDestroy {
  private reviewService = inject(ReviewService);
  private authStore = inject(AuthStore);
  private errorService: ErrorService = inject(ErrorService);
  private toastService: ToastService = inject(ToastService);
  private subs = new Subscription();

  public productId = input<string>('');
  public reviews = signal<IReviewDatum[]>([]);
  public newReviewContent = signal<string>('');
  public userSession = signal<ILoginData | null>(null);
  public isLoading = signal<boolean>(false);
  public rating = 0;

  constructor() {
    const watchSession = toObservable(this.authStore.getSession);
    this.subs.add(
      watchSession.subscribe((session) => {
        this.userSession.set(session);
      })
    );
  }

  ngOnInit(): void {
    if (this.productId()) {
      this.getProductReviews();
    }
  }

  public addReview(): void {
    if (this.newReviewContent()?.trim()?.length <= 0) {
      return;
    }

    const payload: IReviewPayload = {
      product_id: Number(this.productId()),
      user_id: this.userSession()?.user.id,
      rating: this.rating,
      content: this.newReviewContent(),
      image: [],
    };

    this.isLoading.set(true);

    this.subs.add(
      this.reviewService.addReview(payload).subscribe({
        next: (res: IAddReviewResponse): void => {
          if (res?.success) {
            this.toastService.showToast(res.message, 'success');
            this.newReviewContent.set('');
            this.rating = 0;
            this.getProductReviews();
          }
        },
        error: (err: IError): void => {
          this.errorService.showErrors(err);
          this.isLoading.set(false);
        },
        complete: (): void => {
          this.isLoading.set(false);
        },
      })
    );
  }

  /*
   * Fetch all approved reviews for a given product
   */
  private getProductReviews(): void {
    this.subs.add(
      this.reviewService.getProductReviews(this.productId()).subscribe({
        next: (response: IReviewResponse): void => {
          if (response) {
            this.reviews.set(response?.data || []);
          }
        },
        error: (): void => {
          this.reviews.set([]);
        },
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
