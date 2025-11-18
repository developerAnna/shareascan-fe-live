import {Component, signal} from '@angular/core';
import {AccountSidebarComponent} from '../../../account-sidebar/account-sidebar.component';
import {TranslatePipe} from '@ngx-translate/core';

import {RouterLink} from '@angular/router';
import {CheckboxModalComponent} from '../../../../../../shared/components/checkbox-modal/checkbox-modal.component';

@Component({
  selector: 'app-my-orders-details',
  imports: [
    AccountSidebarComponent,
    TranslatePipe,
    RouterLink,
    CheckboxModalComponent,
  ],
  templateUrl: './my-orders-details.component.html',
  styleUrl: './my-orders-details.component.css',
})
export class MyOrdersDetailsComponent {
  public isActive = signal(false);

  onStatusChange(newStatus: boolean) {
    this.isActive.set(newStatus);
  }
}
