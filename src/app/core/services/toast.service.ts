import {Injectable} from '@angular/core';
import {IToastInfo} from '../../shared/models/toast.model';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toasts: IToastInfo[] = [];

  showToast(
    body: string,
    type: 'error' | 'success' | 'warning',
    delay?: number
  ): void {
    const classMap: Record<'error' | 'success' | 'warning', string> = {
      success: 'bg-success text-light',
      error: 'bg-danger text-light',
      warning: 'bg-warning text-dark',
    };

    const classname = classMap[type] || 'bg-info text-light';
    const toast: IToastInfo = {body, type, delay, classname};
    this.show(toast);
  }

  remove(toast: IToastInfo): void {
    this.toasts = this.toasts.filter((t: IToastInfo): boolean => t !== toast);
  }

  clear(): void {
    this.toasts.splice(0, this.toasts.length);
  }

  getToasts(): IToastInfo[] {
    return this.toasts;
  }

  private show(toast: IToastInfo): void {
    this.toasts.push(toast);
  }
}
