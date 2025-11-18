import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AccountRoutingModule} from './account.routing';
import {MyAccountComponent} from './my-account.component';
import {TranslatePipe} from '@ngx-translate/core';
import {RouterOutlet} from '@angular/router';
import {BreadcrumbComponent} from '../../shared/components/breadcrumb/breadcrumb.component';

@NgModule({
  declarations: [MyAccountComponent],
  imports: [
    CommonModule,
    TranslatePipe,
    RouterOutlet,
    BreadcrumbComponent,
    AccountRoutingModule,
  ],
  bootstrap: [MyAccountComponent],
})
export class AccountModule {}
