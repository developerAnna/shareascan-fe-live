import {Component, inject, signal, OnDestroy, OnInit} from '@angular/core';
import {AccountSidebarComponent} from '../../account-sidebar/account-sidebar.component';
import {Router, RouterLink} from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';
import {AccountService} from '../../../../../core/services/account.service';
import {
  HotItem,
  HotItemsResponse,
} from '../../../../../shared/models/account.model';
import {Subscription} from 'rxjs';
import {ProductService} from '../../../../../core/services/product.service';
import {
  IRecentlyDatum,
  IRecentlyResponse,
} from '../../../../../shared/models/product.model';
import {NgClass} from '@angular/common';
import {WishlistService} from '../../../../../core/services/wishlist.service';
import {
  IUserWishlistDatum,
  IUserWishlistResponse,
  IWishlistRemoveResponse,
  IWishlistResponse,
} from '../../../../../shared/models/wishlist.model';
import {ILoginData} from '../../../../../shared/models/auth.model';
import {AuthStore} from '../../../../../core/store/auth.store';
import {toObservable} from '@angular/core/rxjs-interop';
import {IError} from '../../../../../shared/models/error.model';
import {ToastService} from '../../../../../core/services/toast.service';
import {ErrorService} from '../../../../../core/services/error.service';
import {OrdersService} from '../../../../../core/services/orders.service';
import {
  IOrdersDatum,
  IOrdersResponse,
} from '../../../../../shared/models/orders.model';
import {SkelentonComponent} from '../../../../../shared/skelenton/skelenton.component';
import {IShopDatum} from '../../../../../shared/models/shop.model';

@Component({
  selector: 'app-my-orders',
  imports: [
    AccountSidebarComponent,
    RouterLink,
    TranslatePipe,
    NgClass,
    SkelentonComponent,
  ],
  templateUrl: './my-orders.component.html',
  styleUrl: './my-orders.component.css',
})
export class MyOrdersComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private accountService = inject(AccountService);
  private productService = inject(ProductService);
  private wishlistService: WishlistService = inject(WishlistService);
  private authStore = inject(AuthStore);
  private toastService: ToastService = inject(ToastService);
  private errorService: ErrorService = inject(ErrorService);
  private ordersService = inject(OrdersService);
  private subs = new Subscription();

  public userSession = signal<ILoginData | null>(null);
  public hotItems = signal<HotItem[]>([]);
  public recentlyViewedProducts = signal<IRecentlyDatum[]>([]);
  public isLoadingHotItems = signal<boolean>(false);
  public isLoadingRecentlyViewedProducts = signal<boolean>(false);
  public wishlistProducts = signal<IUserWishlistDatum[]>([]);
  private orders = signal<IOrdersDatum[]>([]);
  public addingWishlistProductId: number | null = null;

  constructor() {
    const watchSession = toObservable(this.authStore.getSession);
    this.subs.add(
      watchSession.subscribe((session) => {
        this.userSession.set(session);
        this.getUserWishlist();
      })
    );
  }

  ngOnInit(): void {
    this.getOrders();
    this.getRecentlyViewedProducts();
    this.getHotItemsData();
  }

  public navigateToProduct(id: number): void {
    this.router.navigate(['/product', id]).then();
  }

  public addToWishlist(
    productId: number,
    isFavorite: boolean | undefined,
    type: string
  ): void {
    if (isFavorite) {
      const wishListId = this.wishlistProducts().find(
        (item) => item.product_id === productId
      )?.id;
      if (wishListId) {
        this.removeWishlist(wishListId, productId);
      }
      return;
    }

    this.addingWishlistProductId = productId;

    this.subs.add(
      this.wishlistService
        .addToWishlist(`${this.userSession()?.user?.id}`, `${productId}`)
        .subscribe({
          next: (res: IWishlistResponse): void => {
            this.toastService.showToast(res?.message, 'success');
            if (type === 'hotItem') {
              this.hotItems().forEach((item: HotItem): void => {
                if (item.product_id === productId) {
                  item.isFavorite = true;
                }
              });
            }

            if (type === 'recently') {
              this.recentlyViewedProducts().forEach(
                (item: IRecentlyDatum): void => {
                  if (item.product_id === productId) {
                    item.isFavorite = true;
                  }
                }
              );
            }
            this.getUserWishlist();
          },
          error: (err: IError): void => {
            this.errorService.showErrors(err);
            this.addingWishlistProductId = null;
          },
          complete: (): void => {
            this.addingWishlistProductId = null;
          },
        })
    );
  }

  public addingWishlist(productId: number): boolean {
    return this.addingWishlistProductId === productId;
  }

  removeWishlist(wishlistId: number, productId: number): void {
    this.addingWishlistProductId = productId;
    this.subs.add(
      this.wishlistService.removeFromWishlist(`${wishlistId}`).subscribe({
        next: (res: IWishlistRemoveResponse): void => {
          this.toastService.showToast(res?.message, 'success');
          this.hotItems().forEach((product: HotItem): void => {
            if (product.id === wishlistId) {
              product.isFavorite = false;
            }
          });
          this.recentlyViewedProducts().forEach(
            (product: IRecentlyDatum): void => {
              if (product.id === wishlistId) {
                product.isFavorite = false;
              }
            }
          );
          const newWishlistProducts = this.wishlistProducts().filter(
            (item: IUserWishlistDatum) => item.id !== wishlistId
          );
          this.wishlistProducts.set(newWishlistProducts);
          this.setFavoriteProduct();
        },
        error: (err: IError): void => {
          this.errorService.showErrors(err);
          this.addingWishlistProductId = null;
        },
        complete: (): void => {
          this.addingWishlistProductId = null;
        },
      })
    );
  }

  /**
   * Fetches the list of orders for the current user.
   */
  private getOrders(): void {
    this.subs.add(
      this.ordersService.getOrders().subscribe({
        next: (res: IOrdersResponse): void => {
          this.orders.set(res?.data || []);
        },
        error: (): void => {
          this.orders.set([]);
        },
      })
    );
  }

  private getUserWishlist(): void {
    this.subs.add(
      this.wishlistService.getUserWishlist().subscribe({
        next: (res: IUserWishlistResponse): void => {
          this.wishlistProducts.set(res?.data || []);
          this.setFavoriteProduct();
        },
      })
    );
  }

  private getHotItemsData(): void {
    this.isLoadingHotItems.set(true);
    this.subs.add(
      this.accountService.hotItems().subscribe({
        next: async ({data}: HotItemsResponse): Promise<void> => {
          this.hotItems.set(data);
          this.setFavoriteProduct();
        },
        error: (): void => {
          this.isLoadingHotItems.set(false);
        },
        complete: (): void => {
          this.isLoadingHotItems.set(false);
        },
      })
    );
  }

  private getRecentlyViewedProducts(): void {
    this.isLoadingRecentlyViewedProducts.set(true);
    this.subs.add(
      this.productService.getRecentlyViewedProducts().subscribe({
        next: async (res: IRecentlyResponse): Promise<void> => {
          if (res?.success) {
            this.recentlyViewedProducts.set(res.data || []);
            this.setFavoriteProduct();
          }
        },
        error: (): void => {
          this.isLoadingRecentlyViewedProducts.set(false);
        },
        complete: (): void => {
          this.isLoadingRecentlyViewedProducts.set(false);
        },
      })
    );
  }

  private setFavoriteProduct(): void {
    if (this.hotItems()?.length > 0 && this.wishlistProducts().length > 0) {
      const wishlistProductIds = new Set(
        this.wishlistProducts().map(
          (item: IUserWishlistDatum): number => item.product_id
        )
      );
      this.hotItems().forEach((product: HotItem): void => {
        product.isFavorite = wishlistProductIds.has(product.product_id);
      });
    }

    if (
      this.recentlyViewedProducts()?.length > 0 &&
      this.wishlistProducts().length > 0
    ) {
      const wishlistProductIds = new Set(
        this.wishlistProducts().map(
          (item: IUserWishlistDatum): number => item.product_id
        )
      );
      this.recentlyViewedProducts().forEach((product: IRecentlyDatum): void => {
        product.isFavorite = wishlistProductIds.has(product.product_id);
      });
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
