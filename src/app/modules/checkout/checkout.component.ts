import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {BreadcrumbComponent} from '../../shared/components/breadcrumb/breadcrumb.component';

import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {CurrencyPipe, NgClass} from '@angular/common';
import {AuthStore} from '../../core/store/auth.store';
import {lastValueFrom, Subscription} from 'rxjs';
import {toObservable} from '@angular/core/rxjs-interop';
import {ILoginUser} from '../../shared/models/auth.model';
import {ActivatedRoute, Router} from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';
import {CheckoutService} from '../../core/services/checkout.service';
import {ICheckoutResponse} from '../../shared/models/checkout.model';
import {SpinnerComponent} from '../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-checkout',
  imports: [
    BreadcrumbComponent,
    ReactiveFormsModule,
    NgClass,
    TranslatePipe,
    SpinnerComponent,
    CurrencyPipe,
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private authStore = inject(AuthStore);
  private checkoutService = inject(CheckoutService);
  private router: Router = inject(Router);
  private subs = new Subscription();

  public headerColor = signal<string>('#6970FF');
  public breadcrumbColor = signal<string>('#FF8A90');

  public cartId = signal<string>('');
  public checkout = signal<ICheckoutResponse | null>(null);
  public submitted = signal<boolean>(false);
  public isLoading = signal<boolean>(false);
  public isSending = signal<boolean>(false);

  public checkoutForm = new FormGroup({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  constructor() {
    const watchSession = toObservable(this.authStore.getSession);
    this.subs.add(
      watchSession.subscribe((session) => {
        if (session?.user) {
          this.patchFormValues(session.user);
        }
      })
    );
  }

  async ngOnInit(): Promise<void> {
    this.cartId.set(this.route.snapshot.paramMap.get('id') || '');
    if (this.cartId()) {
      await this.onCheckout();
    }
  }

  private async onCheckout(): Promise<void> {
    this.isLoading.set(true);
    try {
      const checkout: ICheckoutResponse = await lastValueFrom(
        this.checkoutService.checkout(Number(this.cartId()))
      );
      this.checkout.set(checkout);
      this.isLoading.set(false);
    } catch {
      this.isLoading.set(false);
    }
  }

  private patchFormValues(user: ILoginUser) {
    this.checkoutForm.patchValue({
      firstName: user?.name || user?.first_name,
      lastName: user?.last_name,
      email: user?.email,
    });
  }

  public onSubmit(): void {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return this.submitted.set(true);
    }
    this.isSending.set(true);
    const {firstName, email, lastName} = this.checkoutForm.value;

    const payload = {
      ...this.authStore.getSession()?.user,
      first_name: firstName,
      last_name: lastName,
      email,
    } as ILoginUser;

    this.authStore.updateUserMethod(payload);
    localStorage.setItem('user', JSON.stringify(payload));
    this.isSending.set(false);
    this.router.navigate(['/make-payment']).then();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
