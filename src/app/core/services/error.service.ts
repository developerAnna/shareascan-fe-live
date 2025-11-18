import {inject, Injectable} from '@angular/core';
import {IError} from '../../shared/models/error.model';
import {ToastService} from './toast.service';

@Injectable({
  providedIn: 'root',
})
export class ErrorService {
  private toastService = inject(ToastService);

  public showErrors(err: IError): void {
    if (err?.error && err?.error?.data) {
      this.showErrorToasts(err?.error?.data || {});
    } else if (err?.error?.message) {
      this.toastService.showToast(err?.error?.message, 'error');
    }
  }

  private showErrorToasts(data: any): void {
    Object.keys(data).forEach((key: string): void => {
      const errors = data[key];
      if (Array.isArray(errors)) {
        errors.forEach((error: string): void => {
          this.toastService.showToast(error, 'error');
        });
      } else if (typeof errors === 'string') {
        this.toastService.showToast(errors, 'error');
      }
    });
  }
}
