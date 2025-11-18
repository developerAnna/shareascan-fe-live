import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  signal,
  OnDestroy,
} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {SwiperDirective} from '../../directives/swiper.directive';
import {SwiperOptions} from 'swiper/types';
import SwiperCore from 'swiper';
import {Pagination} from 'swiper/modules';
import {TestimonialService} from '../../../core/services/testimonial.service';
import {Subscription} from 'rxjs';
import {ITestimonial, ITestimonialResponse} from '../../models/testimonial';

SwiperCore.use([Pagination]);

@Component({
  selector: 'app-feedback',
  imports: [TranslatePipe, SwiperDirective],
  templateUrl: './feedback.component.html',
  styleUrl: './feedback.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class FeedbackComponent implements OnDestroy {
  private testimonialService = inject(TestimonialService);
  public testimonials = signal<ITestimonial[]>([]);

  private subs = new Subscription();

  constructor() {
    this.getTestimonialsData();
  }

  public getTestimonialsData() {
    this.subs.add(
      this.testimonialService.getTestimonials().subscribe({
        next: async ({data}: ITestimonialResponse): Promise<void> => {
          this.testimonials.set(data);
        },
        error: (err): void => {
          console.log(err);
        },
      })
    );
  }

  // Swiper Settings
  public config: SwiperOptions = {
    modules: [Pagination],
    loop: true,
    centeredSlides: false,
    spaceBetween: 20,
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
      type: 'bullets',
    },
    navigation: false,
    breakpoints: {
      320: {
        slidesPerView: 1,
        spaceBetween: 10,
      },
      620: {
        slidesPerView: 1,
        spaceBetween: 15,
      },
      1024: {
        slidesPerView: 2,
        spaceBetween: 20,
      },
      1200: {
        slidesPerView: 4,
        spaceBetween: 25,
      },
    },
  };

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
