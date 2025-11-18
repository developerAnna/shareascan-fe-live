import {Component, inject, OnDestroy, signal} from '@angular/core';
import {AccountSidebarComponent} from '../../account-sidebar/account-sidebar.component';
import {TranslatePipe} from '@ngx-translate/core';
import {AuthStore} from '../../../../../core/store/auth.store';
import {Subscription} from 'rxjs';

import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {ILoginUser} from '../../../../../shared/models/auth.model';
import {UserService} from '../../../../../core/services/user.service';
import {UserPayload} from '../../../../../shared/models/account.model';
import {NgClass} from '@angular/common';
import {ToastService} from '../../../../../core/services/toast.service';
import {ErrorService} from '../../../../../core/services/error.service';
import {SpinnerComponent} from '../../../../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-my-details',
  imports: [
    AccountSidebarComponent,
    TranslatePipe,
    ReactiveFormsModule,
    SpinnerComponent,
    NgClass,
  ],
  templateUrl: './my-details.component.html',
  styleUrl: './my-details.component.css',
})
export class MyDetailsComponent implements OnDestroy {
  private authStore = inject(AuthStore);
  private subs = new Subscription();
  private userService = inject(UserService);
  private toastService = inject(ToastService);
  private errorService: ErrorService = inject(ErrorService);

  public submitted = signal<boolean>(false);
  public isSending = signal<boolean>(false);
  public isLoading = signal<boolean>(true);

  public userForm = new FormGroup({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    phoneNumber: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\d{10}$/),
    ]),
    address1: new FormControl('', [Validators.required]),
    address2: new FormControl('', [Validators.required]),
    city: new FormControl('', [Validators.required]),
    country: new FormControl('', [Validators.required]),
    region: new FormControl('', [Validators.required]),
    postalCode: new FormControl('', [Validators.required]),
  });

  constructor() {
    this.getUserData();
  }

  private getUserData() {
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

  private patchFormValues({first_name, last_name, email, user_details}: ILoginUser) {
    this.userForm.patchValue({
      firstName: this.getInitialFormValue(first_name),
      lastName: this.getInitialFormValue(last_name),
      email: this.getInitialFormValue(email),
      phoneNumber: this.getInitialFormValue(user_details?.phone_number),
      address1: this.getInitialFormValue(user_details?.address_line_1),
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

  onSubmit(): void {
    this.submitted.set(true);

    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isSending.set(true);

    const {
      firstName,
      lastName,
      phoneNumber,
      address1,
      city,
      country,
      region,
      postalCode,
      address2,
    } = this.userForm.value;

    const {id} = {
      ...this.authStore.getSession()?.user,
    };

    const userDetails = {
      phone_number: phoneNumber,
      address_line_1: address1,
      address_line_2: address2,
      city,
      country,
      state: region,
      zipcode: postalCode,
    };

    const userPayload = {
      first_name: firstName,
      last_name: lastName,
      ...userDetails,
    } as UserPayload;

    this.userService.updateUserInfo(id!, userPayload).subscribe({
      next: async (res): Promise<void> => {
        this.authStore.updateUserMethod(res?.data?.user);
        localStorage.setItem('user', JSON.stringify(res?.data?.user));
        if (res?.success) {
          this.toastService.showToast(res?.message, 'success');
        }
      },
      error: (err): void => {
        this.errorService.showErrors(err);
      },
      complete: () => {
        this.isSending.set(false);
      },
    });
  }

  get userControls() {
    return this.userForm.controls;
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
