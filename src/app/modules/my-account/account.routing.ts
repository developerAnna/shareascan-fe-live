import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MyAccountComponent} from './my-account.component';
import {MyDetailsComponent} from './shared/sections/my-details/my-details.component';
import {MyOrdersComponent} from './shared/sections/my-orders/my-orders.component';
import {MyOrdersDetailsComponent} from './shared/sections/my-orders/my-orders-details/my-orders-details.component';
import {AccountSettingsComponent} from './shared/sections/account-settings/account-settings.component';
import {MyOrdersEditQrContentComponent} from './shared/sections/my-orders/my-orders-edit-qr-content/my-orders-edit-qr-content.component';
import {MyOrdersDisplayQrContentComponent} from './shared/sections/my-orders/my-orders-display-qr-content/my-orders-display-qr-content.component';
import {PostComponent} from './shared/sections/post/post.component';
// import {MyPostsComponent} from './shared/sections/my-posts/my-posts.component';

const routes: Routes = [
  {
    path: '',
    component: MyAccountComponent,
    children: [
      {path: '', redirectTo: 'my-details', pathMatch: 'full'},
      {path: 'my-details', component: MyDetailsComponent},
      {path: 'post', component: PostComponent},
      {
        path: 'my-posts', 
        loadComponent: () => import('./shared/sections/my-posts/my-posts.component').then(m => m.MyPostsComponent),
        pathMatch: 'full'
      },
      {
        path: 'orders',
        children: [
          {path: '', component: MyOrdersComponent},
          {path: 'order-detail/:id', component: MyOrdersDetailsComponent},
          {path: 'edit-content/:id', component: MyOrdersEditQrContentComponent},
          {
            path: 'active-content/:id',
            component: MyOrdersDisplayQrContentComponent,
          },
        ],
      },
      {path: 'settings', component: AccountSettingsComponent},
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountRoutingModule {}
