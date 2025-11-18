import {Component, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {Subscription} from 'rxjs';
import {BreadcrumbComponent} from '../../shared/components/breadcrumb/breadcrumb.component';
import {CartService} from '../../core/services/cart.service';
import {ErrorService} from '../../core/services/error.service';
import {IError} from '../../shared/models/error.model';
import {
  ICardUpdatedPayload,
  ICartItem,
  ICartResponse,
  IUpdateResponse,
} from '../../shared/models/cart.model';
import {SpinnerComponent} from '../../shared/components/spinner/spinner.component';
import {Router} from '@angular/router';
import {ToastService} from '../../core/services/toast.service';

@Component({
  selector: 'app-shopping-cart',
  imports: [BreadcrumbComponent, TranslatePipe, SpinnerComponent],
  templateUrl: './shopping-cart.component.html',
  styleUrl: './shopping-cart.component.css',
})
export class ShoppingCartComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private cartService = inject(CartService);
  private errorService: ErrorService = inject(ErrorService);
  private toastService: ToastService = inject(ToastService);
  private subs = new Subscription();

  public headerColor = signal<string>('#6970FF');
  public breadcrumbColor = signal<string>('#FF8A90');
  public pageName = signal<string>('Add To Cart');
  public isLoading = signal<boolean>(false);
  public isRemovingItem = signal<boolean>(false);
  public isActionCart = signal<boolean>(false);
  public cartItems = signal<ICartItem[]>([]);

  public subtotal = signal<string>('');

  ngOnInit(): void {
    this.isLoading.set(true);
    this.getCartData();
  }

  public increment(cartItemId: number): void {
    const items: ICartItem[] = this.cartItems();
    items.forEach((item: ICartItem): void => {
      if (item.id === cartItemId) {
        item.qty = item.qty + 1;
        item.total = (item.qty * Number(item.price)).toFixed(2);
      }
    });
    this.cartItems.set(items);
    this.setSubtotal();
  }

  public decrement(cartItemId: number): void {
    const items: ICartItem[] = this.cartItems();
    items.forEach((item: ICartItem): void => {
      if (item.id === cartItemId) {
        item.qty = Math.max(1, item.qty - 1);
        item.total = (item.qty * Number(item.price)).toFixed(2);
      }
    });
    this.cartItems.set(items);
    this.setSubtotal();
  }

  public removeItem(cartItemId: number): void {
    this.isRemovingItem.set(true);
    this.subs.add(
      this.cartService.removeCardItem(cartItemId).subscribe({
        next: (): void => {
          const items: ICartItem[] = this.cartItems();
          this.cartItems.set(
            items.filter((item: ICartItem) => item.id !== cartItemId)
          );
          this.toastService.showToast(
            'Product removed from cart successfully',
            'success'
          );
          this.setSubtotal();
        },
        error: (): void => {
          this.toastService.showToast(
            'An error occurred while attempting to delete the product.',
            'error'
          );
          this.isRemovingItem.set(false);
        },
        complete: (): void => {
          this.isRemovingItem.set(false);
        },
      })
    );
  }

  public onUpdateCart(): Promise<boolean> {
    this.isActionCart.set(true);

    const payload: ICardUpdatedPayload = {
      cart_items: this.cartItems().map(
        (item: ICartItem): {cart_id: number; qty: number} => ({
          cart_id: item.id,
          qty: item.qty,
        })
      ),
    };

    return new Promise<boolean>((resolve) => {
      this.cartService.updateCart(payload).subscribe({
        next: (res: IUpdateResponse): void => {
          this.toastService.showToast(res?.message, 'success');
        },
        error: (err: IError): void => {
          this.errorService.showErrors(err);
          this.isActionCart.set(false);
          resolve(false);
        },
        complete: (): void => {
          this.isActionCart.set(false);
          resolve(true);
        },
      });
    });
  }

  public async onCheckout(): Promise<void> {
    const firstItem: ICartItem = this.cartItems()[0];
    if (firstItem) {
      this.router.navigate(['/checkout', firstItem.id]).then();
    }
  }

  public onContinueShopping(): void {
    this.router.navigate(['/shop']).then();
    window.scrollTo({top: 0, behavior: 'smooth'});
  }

  private getCartData(): void {
    this.subs.add(
      this.cartService.viewCart().subscribe({
        next: (res: ICartResponse): void => {
          this.cartItems.set(res?.data?.car_items || []);
          this.setSubtotal();
        },
        error: (err: IError): void => {
          this.errorService.showErrors(err);
          this.isLoading.set(false);
        },
        complete: (): void => {
          this.isLoading.set(false);
        },
      })
    );
  }

  private setSubtotal(): void {
    const subtotal = this.cartItems().reduce(
      (sum, item) => sum + Number(item.total),
      0
    );
    this.subtotal.set(subtotal.toFixed(2));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
