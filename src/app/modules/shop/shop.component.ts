import {Component, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {
  debounceTime,
  distinctUntilChanged,
  lastValueFrom,
  startWith,
  Subscription,
} from 'rxjs';
import {IShopDatum, IShopResponse} from '../../shared/models/shop.model';
import {ShopService} from '../../core/services/shop.service';
import {BreadcrumbComponent} from '../../shared/components/breadcrumb/breadcrumb.component';
import {IError} from '../../shared/models/error.model';
import {ErrorService} from '../../core/services/error.service';
import {SpinnerComponent} from '../../shared/components/spinner/spinner.component';
import {WishlistService} from '../../core/services/wishlist.service';
import {ILoginData} from '../../shared/models/auth.model';
import {toObservable} from '@angular/core/rxjs-interop';
import {CurrencyPipe, NgClass} from '@angular/common';
import {Router} from '@angular/router';
import {AuthStore} from '../../core/store/auth.store';
import {
  IUserWishlistDatum,
  IUserWishlistResponse,
  IWishlistRemoveResponse,
  IWishlistResponse,
} from '../../shared/models/wishlist.model';
import {ToastService} from '../../core/services/toast.service';
import {ShopDatumStoreSignal} from '../../core/store/shop.store';
import {FormControl, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-shop',
  imports: [
    BreadcrumbComponent,
    TranslatePipe,
    SpinnerComponent,
    NgClass,
    ReactiveFormsModule,
    CurrencyPipe,
  ],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.css',
})
export class ShopComponent implements OnInit, OnDestroy {
  private router: Router = inject(Router);
  private shopService: ShopService = inject(ShopService);
  private errorService: ErrorService = inject(ErrorService);
  private wishlistService: WishlistService = inject(WishlistService);
  private authStore = inject(AuthStore);
  private toastService: ToastService = inject(ToastService);
  private shopDatumStore = inject(ShopDatumStoreSignal);
  private subs = new Subscription();

  public headerColor = signal<string>('#7ad7d0');
  public breadcrumbColor = signal<string>('#FFDC62');
  public productData = signal<IShopResponse | null>(null);
  public productList = signal<IShopDatum[]>([]);
  public isLoading = signal<boolean>(false);
  public isLoadingMore = signal<boolean>(false);
  public userSession = signal<ILoginData | null>(null);
  public wishlistProducts = signal<IUserWishlistDatum[]>([]);
  public shopColors = signal<string[]>([]);
  public shopSizes = signal<string[]>([]);
  public addingWishlistProductId: number | null = null;

  // Filters
  public sortCategoryCtrl: FormControl = new FormControl<string>('new_arrival');
  public sortAlphabeticallyCtrl: FormControl = new FormControl<string>(
    'a_to_z'
  );
  public sortSizeCtrl: FormControl = new FormControl<string>('');
  public sortColorCtrl: FormControl = new FormControl<string>('');
  public searchCtrl: FormControl = new FormControl<string>('');

  // Pagination properties
  public currentPage = signal<number>(1);
  public totalPages = signal<number>(1);
  public perPage = signal<number>(16);

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
    this.subs.add(
      this.searchCtrl.valueChanges
        .pipe(startWith(''), debounceTime(500), distinctUntilChanged())
        .subscribe((): void => {
          this.getShopData(1, true);
        })
    );

    this.subs.add(
      this.sortCategoryCtrl.valueChanges.subscribe((): void => {
        if (this.sortCategoryCtrl.enabled) {
          this.getShopData(1, true);
        }
      })
    );

    this.subs.add(
      this.sortSizeCtrl.valueChanges.subscribe((): void => {
        if (this.sortSizeCtrl.enabled) {
          this.getShopData(1, true);
        }
      })
    );

    this.subs.add(
      this.sortColorCtrl.valueChanges.subscribe((): void => {
        if (this.sortColorCtrl.enabled) {
          this.getShopData(1, true);
        }
      })
    );

    this.subs.add(
      this.sortAlphabeticallyCtrl.valueChanges.subscribe((): void => {
        if (this.sortAlphabeticallyCtrl.enabled) {
          this.getShopData(1, true);
        }
      })
    );
  }

  getShopData(page = 1, loadingMore = false): void {
    if (!loadingMore) {
      this.isLoading.set(true);
    } else {
      this.isLoadingMore.set(true);
    }
    this.disableControls();
    this.subs.add(
      this.shopService
        .getShopData(
          page,
          this.searchCtrl?.value?.trim() || '',
          this.sortCategoryCtrl.value,
          this.sortColorCtrl.value,
          this.sortSizeCtrl.value,
          this.sortAlphabeticallyCtrl.value
        )
        .subscribe({
          next: async (res: IShopResponse): Promise<void> => {
            this.productData.set(res);
            this.setShopDataStore();
            this.productList.set(res?.data?.products?.data || []);
            this.currentPage.set(res?.data?.products?.current_page || 1);
            this.totalPages.set(res?.data?.products?.last_page || 1);
            this.perPage.set(res?.data?.products?.per_page || 16);

            if (this.shopColors().length <= 0) {
              this.shopColors.set(res?.data?.colorArr || []);
            }

            if (this.shopSizes().length <= 0) {
              this.shopSizes.set(res?.data?.sizeArr || []);
            }

            const productList: IShopDatum[] = res?.data?.products?.data || [];
            const pricePromises = productList.map(
              async (product: IShopDatum) => {
                const storedProduct = this.shopDatumStore.getShopDatumById(
                  product.id
                );
                // Check if the product has min and max price in the store.
                // If not, fetch the price from the API
                if (
                  storedProduct &&
                  storedProduct.min_price &&
                  storedProduct.max_price
                ) {
                  product.min_price = storedProduct.min_price;
                  product.max_price = storedProduct.max_price;
                } else {
                  const price = await lastValueFrom(
                    this.shopService.getProductPrice(`${product.id}`)
                  );
                  product.max_price = price?.data?.max_price;
                  product.min_price = price?.data?.min_price;
                }
                return product;
              }
            );

            const products: IShopDatum[] = await Promise.all(pricePromises);
            this.productList.set(products);
            this.setFavoriteProduct();
            this.setShopDataStore();
            this.isLoading.set(false);
            this.isLoadingMore.set(false);
            this.disableControls();
            
            setTimeout(() => {
              const topSection = document.querySelector('section.p-lg-5');
              if (topSection) {
                topSection.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start',
                });
              }
            }, 150); // enough time for DOM rendering
          },

          
          error: (err: IError): void => {
            this.errorService.showErrors(err);
            this.isLoading.set(false);
            this.isLoadingMore.set(false);
            this.disableControls();
          },
        })
    );
  }

  setShopDataStore(): void {
    const previousData = this.shopDatumStore.getShopDatum() || [];
    const updatedData = [
      ...previousData,
      ...(this.productList() as Required<IShopDatum>[]),
    ];
    this.shopDatumStore.setShopDatum(updatedData);
  }

  getUserWishlist(): void {
    this.subs.add(
      this.wishlistService.getUserWishlist().subscribe({
        next: (res: IUserWishlistResponse): void => {
          this.wishlistProducts.set(res?.data || []);
          this.setFavoriteProduct();
        },
      })
    );
  }

  addToWishlist(productId: number, isFavorite: boolean | undefined): void {
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
            this.productList().forEach((product: IShopDatum): void => {
              if (product.id === productId) {
                product.isFavorite = true;
              }
            });
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

  removeWishlist(wishlistId: number, productId: number): void {
    this.addingWishlistProductId = productId;
    this.subs.add(
      this.wishlistService.removeFromWishlist(`${wishlistId}`).subscribe({
        next: (res: IWishlistRemoveResponse): void => {
          this.toastService.showToast(res?.message, 'success');
          this.productList().forEach((product: IShopDatum): void => {
            if (product.id === wishlistId) {
              product.isFavorite = false;
            }
          });
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

  addingWishlist(productId: number): boolean {
    return this.addingWishlistProductId === productId;
  }

  setFavoriteProduct(): void {
    if (this.productList()?.length > 0 && this.wishlistProducts().length > 0) {
      const wishlistProductIds = new Set(
        this.wishlistProducts().map(
          (item: IUserWishlistDatum): number => item.product_id
        )
      );
      this.productList().forEach((product: IShopDatum): void => {
        product.isFavorite = wishlistProductIds.has(product.id);
      });
    }
  }

  goToProductInfo(productId: number): void {
    this.router.navigate(['/product', productId]).then();
  }

  changePage(page: number): void {
    if (page > 0 && page <= this.totalPages() && page !== this.currentPage()) {
      this.getShopData(page, true);
    }
  }

  disableControls(): void {
    if (this.isLoadingMore()) {
      this.sortCategoryCtrl.disable({emitEvent: false});
      this.sortAlphabeticallyCtrl.disable({emitEvent: false});
      this.sortSizeCtrl.disable({emitEvent: false});
      this.sortColorCtrl.disable({emitEvent: false});
    } else {
      this.sortCategoryCtrl.enable({emitEvent: false});
      this.sortAlphabeticallyCtrl.enable({emitEvent: false});
      this.sortSizeCtrl.enable({emitEvent: false});
      this.sortColorCtrl.enable({emitEvent: false});
    }
  }

  onSelectCategory(category: string | number): void {
    if (this.isLoadingMore()) {
      return;
    }
    this.sortCategoryCtrl.setValue(`${category}`);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  protected readonly String = String;
}
