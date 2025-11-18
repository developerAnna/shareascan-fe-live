import {Component, inject, signal} from '@angular/core';
import {AccountSidebarComponent} from '../../account-sidebar/account-sidebar.component';
import {TranslatePipe} from '@ngx-translate/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import {NgClass} from '@angular/common';
import {AuthenticationService} from '../../../../../core/services/authentication.service';
import {ToastService} from '../../../../../core/services/toast.service';
import {ErrorService} from '../../../../../core/services/error.service';
import {IPasswordChangePayload} from '../../../../../shared/models/auth.model';

@Component({
  selector: 'app-account-settings',
  imports: [
    AccountSidebarComponent,
    TranslatePipe,
    ReactiveFormsModule,
    NgClass,
  ],
  templateUrl: './account-settings.component.html',
  styleUrl: './account-settings.component.css',
})
export class AccountSettingsComponent {
  private authService = inject(AuthenticationService);
  private toastService = inject(ToastService);
  private errorService: ErrorService = inject(ErrorService);

  public passwordForm = new FormGroup(
    {
      oldPassword: new FormControl('', [Validators.required]),
      newPassword: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        this.passwordStrengthValidator(),
      ]),
      passwordConfirmation: new FormControl('', [
        Validators.required,
        this.passwordMatchValidator(),
      ]),
    },
    {validators: this.passwordMatchValidator()}
  );

  public submitted = signal<boolean>(false);
  public isSending = signal<boolean>(false);

  private passwordMatchValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const newPasswordControl = group.get('newPassword');
      const confirmPasswordControl = group.get('passwordConfirmation');

      if (!newPasswordControl || !confirmPasswordControl) {
        return null;
      }

      const newPassword = newPasswordControl.value;
      const confirmPassword = confirmPasswordControl.value;

      if (newPassword !== confirmPassword) return {mismatch: true};

      return null;
    };
  }

  private passwordStrengthValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value: string = control.value;

      if (!value) {
        return null;
      }

      const hasUpperCase = /[A-Z]+/.test(value);
      const hasLowerCase = /[a-z]+/.test(value);
      const hasNumeric = /[0-9]+/.test(value);
      const hasSpecial = /[\W_]+/.test(value);

      const valid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecial;
      return !valid
        ? {
            weakPassword: true,
          }
        : null;
    };
  }

  get passwordControls() {
    return this.passwordForm.controls;
  }

  clearForm() {
    this.passwordForm.reset({
      oldPassword: '',
      newPassword: '',
      passwordConfirmation: '',
    });
  }

  onSubmit(): void {
    this.submitted.set(true);
    console.log(this.passwordForm);
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.isSending.set(true);

    const {oldPassword, newPassword, passwordConfirmation} =
      this.passwordForm.value;

    const payload = {
      new_password: newPassword,
      new_password_confirmation: passwordConfirmation,
      old_password: oldPassword,
    } as IPasswordChangePayload;

    this.authService.changePassword(payload).subscribe({
      next: async (res): Promise<void> => {
        this.toastService.showToast(res?.message, 'success');
        this.clearForm();
      },
      error: (err): void => {
        this.errorService.showErrors(err);
        this.isSending.set(false);
      },
      complete: () => {
        this.isSending.set(false);
      },
    });
  }
}
