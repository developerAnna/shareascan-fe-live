import {Component, signal, inject} from '@angular/core';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';
import {AuthenticationService} from '../../../../core/services/authentication.service';

interface IAccountLink {
  path?: string;
  translationKey: string;
  icon: string;
  action?: () => void;
}

@Component({
  selector: 'app-account-sidebar',
  imports: [RouterLink, TranslatePipe, RouterLinkActive],
  templateUrl: './account-sidebar.component.html',
  styleUrl: './account-sidebar.component.css',
})
export class AccountSidebarComponent {
  private authService = inject(AuthenticationService);
  public links = signal<IAccountLink[]>([
    {
      path: '/account/my-details',
      translationKey: 'account.my_detail',
      icon: 'fa-regular fa-user',
    },
    {
      path: '/account/post',
      translationKey: 'account.post',
      icon: 'fa-regular fa-pen-to-square',
    },
    {
      path: '/account/my-posts',
      translationKey: 'account.published_posts',
      icon: 'fa-regular fa-list',
    },
    {
      path: '/account/orders',
      translationKey: 'account.my_orders',
      icon: 'fa-regular fa-bag-shopping',
    },
    {
      path: '/account/settings',
      translationKey: 'account.account_settings',
      icon: 'fa-regular fa-gear',
    },
    {
      translationKey: 'account.logout',
      icon: 'fa-regular fa-arrow-right-from-bracket',
      action: () => this.logout(),
    },
  ]);

  logout() {
    this.authService.logout();
  }
}
