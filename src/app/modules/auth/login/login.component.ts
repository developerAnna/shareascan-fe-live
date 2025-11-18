import {Component, inject, OnDestroy, signal} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {TranslatePipe} from '@ngx-translate/core';
import {Subscription} from 'rxjs';
import {Router, RouterLink} from '@angular/router';
import {NgClass} from '@angular/common';
import {NavbarComponent} from '../../../shared/components/navbar/navbar.component';
import {BreadcrumbComponent} from '../../../shared/components/breadcrumb/breadcrumb.component';
import {AuthenticationService} from '../../../core/services/authentication.service';
import {IError} from '../../../shared/models/error.model';
import {ILoginPayload, ILoginResponse} from '../../../shared/models/auth.model';
import {ErrorService} from '../../../core/services/error.service';
import {AuthStore} from '../../../core/store/auth.store';

@Component({
  selector: 'app-login',
  imports: [
    NavbarComponent,
    BreadcrumbComponent,
    TranslatePipe,
    ReactiveFormsModule,
    NgClass,
    RouterLink,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnDestroy {
  private router: Router = inject(Router);
  private authService: AuthenticationService = inject(AuthenticationService);
  private errorService: ErrorService = inject(ErrorService);
  private authStore = inject(AuthStore);

  public loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
    remember: new FormControl(false),
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
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.submitted.set(false);
    this.isLoading.set(true);

    const payload: ILoginPayload = {
      email: this.loginForm.get('email')?.value?.trim(),
      password: this.loginForm.get('password')?.value,
    };

    this.subs.add(
      this.authService.login(payload).subscribe({
        next: (res: ILoginResponse): void => {
          if (res) {
            localStorage.setItem('token', res?.data?.token);
            localStorage.setItem('user', JSON.stringify(res?.data?.user));
            this.authStore.setSessionMethod(res?.data || null);
            this.router.navigate(['/']).then();
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
