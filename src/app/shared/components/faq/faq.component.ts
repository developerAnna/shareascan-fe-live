import {Component, inject, OnDestroy, signal} from '@angular/core';
import {Subscription} from 'rxjs';
import {IFAQ, IFAQResponse} from '../../models/faq.model';
import {FaqService} from '../../../core/services/faq.service';

@Component({
  selector: 'app-faq',
  imports: [],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.css',
})
export class FaqComponent implements OnDestroy {
  private FaqService = inject(FaqService);
  private subs = new Subscription();
  public faqData = signal<IFAQ[]>([]);

  constructor() {
    this.getFaqData();
  }

  public getFaqData() {
    this.subs.add(
      this.FaqService.faq().subscribe({
        next: async ({data}: IFAQResponse): Promise<void> => {
          this.faqData.set(data);
        },
        error: (err): void => {
          console.log(err);
        },
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
