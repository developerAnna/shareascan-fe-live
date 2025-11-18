import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {CheckboxModalComponent} from '../../../../../../shared/components/checkbox-modal/checkbox-modal.component';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-my-orders-edit-qr-content',
  imports: [CheckboxModalComponent, TranslatePipe],
  templateUrl: './my-orders-edit-qr-content.component.html',
  styleUrl: './my-orders-edit-qr-content.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyOrdersEditQrContentComponent {
  public isActive = signal(false);

  onStatusChange(newStatus: boolean) {
    this.isActive.set(newStatus);
  }
}
