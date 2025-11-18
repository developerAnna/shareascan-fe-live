import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from './home.component';
import {AboutUsComponent} from '../about-us/about-us.component';
import {DashboardComponent} from '../dashboard/dashboard.component';
import {ContactUsComponent} from '../contact-us/contact-us.component';
import {HowItWorksComponent} from '../how-it-works/how-it-works.component';
import {ShopComponent} from '../shop/shop.component';
import {ShoppingCartComponent} from '../shopping-cart/shopping-cart.component';
import {CheckoutComponent} from '../checkout/checkout.component';
import {MakePaymentComponent} from '../make-payment/make-payment.component';
import {OrderSuccessfullyComponent} from '../order-seccessfully/order-successfully.component';
import {ProductDetailsComponent} from '../product-details/product-details.component';
import {AuthenticationGuard} from '../../core/guards/authentication.guard';
import {PendingChangesGuard} from '../../core/guards/cart-sync.guard';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      {path: '', component: DashboardComponent, title: 'Home'},
      {
        path: 'about-us',
        component: AboutUsComponent,
        title: 'About Us',
      },
      {
        path: 'shop',
        component: ShopComponent,
        title: 'Shop',
      },
      {
        path: 'how-it-works',
        component: HowItWorksComponent,
        title: 'How it Works',
      },
      {
        path: 'contact-us',
        component: ContactUsComponent,
        title: 'Contact Us',
      },
      {
        path: 'shopping-cart',
        component: ShoppingCartComponent,
        title: 'Shopping Cart',
        canActivate: [AuthenticationGuard],
        canDeactivate: [PendingChangesGuard],
      },
      {
        path: 'checkout/:id',
        component: CheckoutComponent,
        title: 'Checkout',
        canActivate: [AuthenticationGuard],
      },
      {
        path: 'make-payment',
        component: MakePaymentComponent,
        title: 'Make Payment',
        canActivate: [AuthenticationGuard],
      },
      {
        path: 'order-successfully',
        component: OrderSuccessfullyComponent,
        title: 'Order Successfully',
        canActivate: [AuthenticationGuard],
      },
      {
        path: 'product/:id',
        component: ProductDetailsComponent,
        title: 'Product Details',
      },
      {
        path: 'account',
        loadChildren: () =>
          import('../my-account/account.module').then((m) => m.AccountModule),
        canActivate: [AuthenticationGuard],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeRoutingModule {}
