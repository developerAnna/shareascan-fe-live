import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  signal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {SubscribeService} from '../../../core/services/subscribe.service';
import {Subscription} from 'rxjs';
import {IError} from '../../models/error.model';
import {ErrorService} from '../../../core/services/error.service';
import {ISubscribeResponse} from '../../models/subscribe.model';
import {ToastService} from '../../../core/services/toast.service';
import {NgClass} from '@angular/common';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-subscribe-email',
  imports: [ReactiveFormsModule, NgClass, TranslatePipe],
  templateUrl: './subscribe-email.component.html',
  styleUrl: './subscribe-email.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubscribeEmailComponent implements OnDestroy {
  private subscribeService = inject(SubscribeService);
  private errorService: ErrorService = inject(ErrorService);
  private toastService: ToastService = inject(ToastService);
  private subs = new Subscription();

  public isLoading = signal<boolean>(false);

  public subscribeForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  public onSubmit(): void {
    if (this.subscribeForm.invalid) {
      this.subscribeForm.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    const email: string = this.subscribeForm.get('email')?.value?.trim() || '';
    this.subs.add(
      this.subscribeService.subscribe(email).subscribe({
        next: (res: ISubscribeResponse): void => {
          if (res.success) {
            this.subscribeForm.reset();
            this.toastService.showToast(res?.message, 'success');
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

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
