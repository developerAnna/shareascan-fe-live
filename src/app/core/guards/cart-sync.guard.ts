import {Injectable} from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanDeactivate,
  RouterStateSnapshot,
} from '@angular/router';
import {ShoppingCartComponent} from '../../modules/shopping-cart/shopping-cart.component';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PendingChangesGuard
  implements CanDeactivate<ShoppingCartComponent>
{
  canDeactivate(
    component: ShoppingCartComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot
  ): boolean | Observable<boolean> | Promise<boolean> {
    const isCheckoutRoute = nextState?.url.includes('/checkout');
    const haveItems = component.cartItems().length > 0;

    if (isCheckoutRoute) return component.onUpdateCart();

    if (haveItems) component.onUpdateCart();
    return true;
  }
}
