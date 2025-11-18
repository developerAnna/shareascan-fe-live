import {Component, inject, OnDestroy, signal} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {Subscription} from 'rxjs';
import {Router, RouterLink} from '@angular/router';
import {NgClass} from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {BreadcrumbComponent} from '../../../shared/components/breadcrumb/breadcrumb.component';
import {NavbarComponent} from '../../../shared/components/navbar/navbar.component';
import {AuthenticationService} from '../../../core/services/authentication.service';
import {ErrorService} from '../../../core/services/error.service';
import {IError} from '../../../shared/models/error.model';
import {IPasswordResetResponse} from '../../../shared/models/auth.model';
import {ToastService} from '../../../core/services/toast.service';

@Component({
  selector: 'app-forgot-password',
  imports: [
    BreadcrumbComponent,
    NavbarComponent,
    TranslatePipe,
    ReactiveFormsModule,
    NgClass,
    RouterLink,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
})
export class ForgotPasswordComponent implements OnDestroy {
  private router: Router = inject(Router);
  private authService: AuthenticationService = inject(AuthenticationService);
  private errorService: ErrorService = inject(ErrorService);
  private toastService = inject(ToastService);

  public headerColor = signal<string>('#6970FF');
  public isLoading = signal<boolean>(false);
  public submitted = signal<boolean>(false);
  private subs = new Subscription();

  public forgotPasswordForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  constructor() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']).then();
    }
  }

  public onSubmit(): void {
    this.submitted.set(true);
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.submitted.set(false);
    this.isLoading.set(true);

    const payload: {email: string} = {
      email: this.forgotPasswordForm.get('email')?.value?.trim() || '',
    };

    this.subs.add(
      this.authService.forgotPassword(payload).subscribe({
        next: (res: IPasswordResetResponse): void => {
          if (res?.success) {
            this.toastService.showToast(res?.message, 'success');
            this.router.navigate(['/login']).then();
          }
        },
        error: (err: IError): void => {
          this.errorService.showErrors(err);
          this.isLoading.set(false);
        },
        complete: (): void => {
          this.submitted.set(false);
        },
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
