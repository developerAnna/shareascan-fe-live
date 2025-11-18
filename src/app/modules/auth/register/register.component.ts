import {Component, inject, OnDestroy, signal} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {NgClass} from '@angular/common';
import {Subscription} from 'rxjs';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {NavbarComponent} from '../../../shared/components/navbar/navbar.component';
import {BreadcrumbComponent} from '../../../shared/components/breadcrumb/breadcrumb.component';
import {AuthenticationService} from '../../../core/services/authentication.service';
import {IRegisterPayload} from '../../../shared/models/auth.model';
import {ToastService} from '../../../core/services/toast.service';
import {IError} from '../../../shared/models/error.model';
import {ErrorService} from '../../../core/services/error.service';

@Component({
  selector: 'app-register',
  imports: [
    NavbarComponent,
    BreadcrumbComponent,
    TranslatePipe,
    ReactiveFormsModule,
    RouterLink,
    NgClass,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent implements OnDestroy {
  private router: Router = inject(Router);
  private translate: TranslateService = inject(TranslateService);
  private authService: AuthenticationService = inject(AuthenticationService);
  private toastService: ToastService = inject(ToastService);
  private errorService: ErrorService = inject(ErrorService);

  public registerForm = new FormGroup({
    first_name: new FormControl('', [Validators.required]),
    last_name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
    acceptTerms: new FormControl(false, [Validators.requiredTrue]),
  });

  public headerColor = signal<string>('#6970FF');
  public breadcrumbColor = signal<string>('#FF8A90');
  public isLoading = signal<boolean>(false);
  public submitted = signal<boolean>(false);
  private subs = new Subscription();

  constructor() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']).then();
    }
  }

  public onSubmit(): void {
    this.submitted.set(true);
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.submitted.set(false);
    this.isLoading.set(true);

    const payload: IRegisterPayload = {
      ...this.registerForm.getRawValue(),
      confirm_password: this.registerForm.get('password')?.value,
    };

    this.subs.add(
      this.authService.register(payload).subscribe({
        next: (): void => {
          this.isLoading.set(true);
          this.toastService.showToast(
            this.translate.instant('register.register_success'),
            'success'
          );
          this.router.navigate(['/login']).then();
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
