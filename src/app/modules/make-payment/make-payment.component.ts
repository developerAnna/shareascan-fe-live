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
import {BreadcrumbComponent} from '../../shared/components/breadcrumb/breadcrumb.component';
import {TranslatePipe} from '@ngx-translate/core';
import {CommonModule, NgClass} from '@angular/common';
import {AuthStore} from '../../core/store/auth.store';
import {lastValueFrom, Subscription} from 'rxjs';
import {ILoginUser} from '../../shared/models/auth.model';
import {UserService} from '../../core/services/user.service';
import {UserPayload} from '../../shared/models/account.model';
import {ErrorService} from '../../core/services/error.service';
import {OrdersService} from '../../core/services/orders.service';
import {
  ICreateOrderResponse,
  IOrderPayload,
} from '../../shared/models/orders.model';
import {CartService} from '../../core/services/cart.service';
import {ICartItem, ICartResponse} from '../../shared/models/cart.model';
import {IError} from '../../shared/models/error.model';
import {PaymentService} from '../../core/services/payment.service';
import {IPayPalPaymentResponse} from '../../shared/models/payment.model';
import {ToastService} from '../../core/services/toast.service';
import {PaymentButtonComponent} from '../../shared/components/payment-button/payment-button.component';

@Component({
  selector: 'app-make-payment',
  imports: [
    BreadcrumbComponent,
    ReactiveFormsModule,
    NgClass,
    TranslatePipe,
    CommonModule,
    PaymentButtonComponent,
  ],
  templateUrl: './make-payment.component.html',
  styleUrl: './make-payment.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MakePaymentComponent implements OnDestroy {
  private authStore = inject(AuthStore);
  private subs = new Subscription();
  private userService = inject(UserService);
  private ordersService = inject(OrdersService);
  private errorService: ErrorService = inject(ErrorService);
  private paymentService = inject(PaymentService);
  private toastService = inject(ToastService);

  public headerColor = signal<string>('#6970FF');
  public breadcrumbColor = signal<string>('#FF8A90');
  private cartService = inject(CartService);

  public submitted = signal<boolean>(false);
  public isProcessing = signal<boolean>(false);
  public isLoading = signal<boolean>(false);
  public showPaymentForm = false;
  public cartItems = signal<ICartItem[]>([]);

  constructor() {
    this.getUserData();
    this.getCartData();
  }

  private getUserData(): void {
    const user = {
      ...this.authStore.getSession()?.user,
    };
    this.userService.getUserInfo(user.id!).subscribe({
      next: async ({data}): Promise<void> => {
        this.patchFormValues(data.user);
      },
      error: (err): void => {
        console.log(err);
      },
      complete: () => {
        this.isLoading.set(false);
      },
    });
  }

  public billingForm = new FormGroup({
    phoneNumber: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\d{10}$/),
    ]),
    address: new FormControl('', [Validators.required]),
    address2: new FormControl('', [Validators.required]),
    note: new FormControl('', [Validators.required]),
    city: new FormControl('', [Validators.required]),
    country: new FormControl('', [Validators.required]),
    region: new FormControl('', [Validators.required]),
    postalCode: new FormControl('', [Validators.required]),
  });

  public paymentForm = new FormGroup({
    paymentMethod: new FormControl(false, [Validators.required]),
    cardNumber: new FormControl('', [
      Validators.required,
      Validators.pattern(/^[0-9]{16}$/),
    ]),
    expirationMonth: new FormControl('', [
      Validators.required,
      Validators.pattern(/^(0[1-9]|1[0-2])$/),
      Validators.min(1),
      Validators.max(12),
    ]),
    expirationYear: new FormControl('', [
      Validators.required,
      Validators.pattern(/^[0-9]{4}$/),
      Validators.min(new Date().getFullYear()),
    ]),
    cvv: new FormControl('', [
      Validators.required,
      Validators.pattern(/^[0-9]{3,4}$/),
    ]),
  });

  private patchFormValues({user_details}: ILoginUser) {
    this.billingForm.patchValue({
      phoneNumber: this.getInitialFormValue(user_details?.phone_number),
      address: this.getInitialFormValue(user_details?.address_line_1),
      address2: this.getInitialFormValue(user_details?.address_line_2),
      city: this.getInitialFormValue(user_details?.city),
      country: this.getInitialFormValue(user_details?.country),
      region: this.getInitialFormValue(user_details?.state),
      postalCode: this.getInitialFormValue(user_details?.zipcode),
    });
  }

  getInitialFormValue(value?: string): string {
    return value || '';
  }

  private getCartData(): void {
    this.subs.add(
      this.cartService.viewCart().subscribe({
        next: (res: ICartResponse): void => {
          this.cartItems.set(res?.data?.car_items || []);
        },
        error: (err: IError): void => {
          this.errorService.showErrors(err);
        },
      })
    );
  }

  private createOrder(payload: IOrderPayload, paymentType: string): void {
    this.ordersService.createOrder(payload).subscribe({
      next: async (res: ICreateOrderResponse): Promise<void> => {
        if (res.data && res.data.length > 0) {
          if (paymentType === 'paypal') {
            await this.generatePayPallUrl(res.data[0].id);
          }
          if (paymentType === 'stripe') {
            await this.generateStripePayment(res.data[0].id);
          }
        } else {
          this.isProcessing.set(false);
        }
      },
      error: (err: IError): void => {
        this.errorService.showErrors(err);
        this.isProcessing.set(false);
      },
    });
  }

  onSubmit(paymentType: string): void {
    this.submitted.set(true);

    if (this.billingForm.invalid) {
      this.billingForm.markAllAsTouched();
      return;
    }

    this.isProcessing.set(true);

    const {
      phoneNumber,
      address,
      city,
      country,
      region,
      postalCode,
      address2,
      note,
    } = this.billingForm.value;

    const {id, first_name, last_name, email} = {
      ...this.authStore.getSession()?.user,
    };

    const userDetails = {
      phone_number: phoneNumber,
      address_line_1: address,
      address_line_2: address2,
      city,
      first_name,
      last_name,
      state: region,
      zipcode: postalCode,
    };

    const orderPayload = {
      ...userDetails,
      country_code: country,
      email,
      note,
    } as IOrderPayload;

    const userPayload = {
      ...userDetails,
      country,
    } as UserPayload;

    this.userService.updateUserInfo(id!, userPayload).subscribe({
      next: async ({data}): Promise<void> => {
        this.authStore.updateUserMethod(data?.user);
        localStorage.setItem('user', JSON.stringify(data?.user));
        this.createOrder(orderPayload, paymentType);
      },
      error: (err: IError): void => {
        this.errorService.showErrors(err);
        this.isProcessing.set(false);
      },
    });
  }

  get billingControls() {
    return this.billingForm.controls;
  }

  get paymentControls() {
    return this.paymentForm.controls;
  }

  private async generatePayPallUrl(orderId: number): Promise<void> {
    try {
      const payment$: IPayPalPaymentResponse = await lastValueFrom(
        this.paymentService.generatePayPalPaymentLink(`${orderId}`)
      );
      if (payment$) {
        if (payment$?.approval_url) {
          await this.removeCartItems();
          window.location.href = payment$.approval_url;
        }
      }
      this.isProcessing.set(false);
    } catch (err: any) {
      this.toastService.showToast(err?.error?.message || err?.message, 'error');
      this.isProcessing.set(false);
    }
  }

  private async generateStripePayment(orderId: number): Promise<void> {
    try {
      const payment$ = await lastValueFrom(
        this.paymentService.generateStripePayment(orderId)
      );
      if (payment$) {
        await this.removeCartItems();
      }
      this.isProcessing.set(false);
    } catch (err: any) {
      this.toastService.showToast(err?.error?.message || err?.message, 'error');
      this.isProcessing.set(false);
    }
  }

  private async removeCartItems(): Promise<void> {
    try {
      const removalPromises = this.cartItems().map(({id}) =>
        this.cartService.removeCardItem(id).toPromise()
      );

      await Promise.all(removalPromises);
    } catch (err: any) {
      this.errorService.showErrors(err);
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
