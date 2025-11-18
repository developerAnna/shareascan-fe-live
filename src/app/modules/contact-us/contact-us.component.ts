import {Component, inject, OnDestroy, signal} from '@angular/core';
import {BreadcrumbComponent} from '../../shared/components/breadcrumb/breadcrumb.component';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {Subscription} from 'rxjs';
import {ContactService} from '../../core/services/contact.service';
import {
  IContactPayload,
  IContactResponse,
} from '../../shared/models/contact.model';
import {NgClass} from '@angular/common';
import {ToastService} from '../../core/services/toast.service';

@Component({
  selector: 'app-contact-us',
  imports: [BreadcrumbComponent, TranslatePipe, ReactiveFormsModule, NgClass],
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.css',
})
export class ContactUsComponent implements OnDestroy {
  private contactService = inject(ContactService);
  private translate: TranslateService = inject(TranslateService);
  private toastService: ToastService = inject(ToastService);

  public headerColor = signal<string>('#6970FF');
  public breadcrumbColor = signal<string>('#FF8A90');
  public isSending = signal<boolean>(false);
  public submitted = signal<boolean>(false);
  private subs = new Subscription();

  public contactForm = new FormGroup({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    phoneNumber: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\d{10}$/),
    ]),
    email: new FormControl('', [Validators.required, Validators.email]),
    message: new FormControl('', [Validators.required]),
  });

  public onSubmit(): void {
    this.submitted.set(true);
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }
    this.submitted.set(false);
    this.isSending.set(true);

    const {firstName, lastName, phoneNumber, email, message} =
      this.contactForm.getRawValue();

    const payload: IContactPayload = {
      first_name: firstName,
      last_name: lastName,
      phone_number: `+1${phoneNumber}`,
      email,
      message,
    };

    this.subs.add(
      this.contactService.contactUs(payload).subscribe({
        next: async ({message}: IContactResponse): Promise<void> => {
          console.log(message);
          this.toastService.showToast(
            this.translate.instant('contact_us.message_sent'),
            'success'
          );
          this.contactForm.reset();
        },
        error: (err): void => {
          console.log(err);
        },
      })
    );

    this.isSending.set(false);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
