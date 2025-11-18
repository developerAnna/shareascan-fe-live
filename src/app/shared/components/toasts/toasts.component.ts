import {Component, inject} from '@angular/core';
import {NgbToast} from '@ng-bootstrap/ng-bootstrap';
import {ToastService} from '../../../core/services/toast.service';

@Component({
  selector: 'app-toasts',
  imports: [NgbToast],
  templateUrl: './toasts.component.html',
  styleUrl: './toasts.component.css',
})
export class ToastsComponent {
  public toastService = inject(ToastService);
}
