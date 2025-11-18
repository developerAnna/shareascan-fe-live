import {
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Subscription} from 'rxjs';
import {SubscribeEmailComponent} from '../../shared/components/subscribe-email/subscribe-email.component';
import {ProductService} from '../../core/services/product.service';
import {ErrorService} from '../../core/services/error.service';
import {IError} from '../../shared/models/error.model';
import {ProductDescriptionComponent} from '../../shared/components/product-description/product-description.component';
import {SpinnerComponent} from '../../shared/components/spinner/spinner.component';
import {ProductReviewsComponent} from '../../shared/components/product-reviews/product-reviews.component';
import {
  IProductResponse,
  IQrCodeDatum,
  IQrCodeResponse,
  ISelectedArtFiles,
} from '../../shared/models/product.model';
import {Fancybox} from '@fancyapps/ui';
import {ShopDatumStoreSignal} from '../../core/store/shop.store';
import {IShopDatum, IShopName} from '../../shared/models/shop.model';
import {CartService} from '../../core/services/cart.service';
import {
  AddToCardResponse,
  IArtFiles,
  ICartPayload,
} from '../../shared/models/cart.model';
import {IShopVariation} from '../../shared/models/shop.model';
import {AuthStore} from '../../core/store/auth.store';
import {QrCodeDatumStoreSignal} from '../../core/store/qr-code.store';
import {CustomizeProductModalComponent} from '../../shared/components/customize-product-modal/customize-product-modal.component';
import {ToastService} from '../../core/services/toast.service';

declare let $: any;

type SizeGroups = Record<
  string,
  {
    colors: string[];
    variations: IShopVariation[];
  }
>;

@Component({
  selector: 'app-product-details',
  imports: [
    SubscribeEmailComponent,
    ProductDescriptionComponent,
    SpinnerComponent,
    ProductReviewsComponent,
    CustomizeProductModalComponent,
  ],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css',
})
export class ProductDetailsComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private authStore = inject(AuthStore);
  private qrCodeStore = inject(QrCodeDatumStoreSignal);
  private errorService: ErrorService = inject(ErrorService);
  private toastService = inject(ToastService);
  private shopDatumStore = inject(ShopDatumStoreSignal);
  private subs = new Subscription();

  public productId = signal<string>('');
  public product = signal<IShopDatum | null>(null);
  public artFilePositions = signal<IShopName[]>([]);
  public selectedArtFiles = signal<IArtFiles | null>(null);
  public productVariation = signal<IShopVariation | null>(null);
  public selectedSize = signal<string | null>(null);
  public selectedColor = signal<string | null>(null);
  public isLoading = signal<boolean>(false);
  public isAddingToCart = signal<boolean>(false);
  public counterValue = signal<number>(1);
  public qrCodes = signal<IQrCodeDatum[]>([]);

  @ViewChild(CustomizeProductModalComponent)
  private customizeModal!: CustomizeProductModalComponent;

  openModal() {
    this.customizeModal.openCustomizeModal();
  }

  ngOnInit(): void {
    this.productId.set(this.route.snapshot.paramMap.get('id') || '');
    if (this.productId()) {
      this.isLoading.set(true);
      this.getProductDetails(this.productId());
      this.storeRecentlyViewedProduct();
    }
    if (this.qrCodeStore.getQRCodeDatum()?.length) {
      this.qrCodes.set(this.qrCodeStore.getQRCodeDatum());
    } else {
      this.getAllQrCodes();
    }
  }

  private getProductDetails(id: string): void {
    const storedProduct = this.shopDatumStore.getShopDatumById(Number(id));

    const initialize = () => {
      this.selectFirstAvailableSizeAndColor();
      setTimeout(() => {
        this.initializeSlick();
      }, 50);
    };

    if (storedProduct) {
      this.product.set(storedProduct);
      this.getArtFilesPositions();
      initialize();
      this.isLoading.set(false);
    } else {
      this.subs.add(
        this.productService.getProductById(id).subscribe({
          next: ({data}: IProductResponse): void => {
            this.product.set(data?.product);
            this.getArtFilesPositions();
            initialize();
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
  }

  increment() {
    this.counterValue.update((v) => v + 1);
  }

  decrement() {
    this.counterValue.update((v) => Math.max(1, v - 1));
  }

  addVariantion(variation: IShopVariation) {
    this.productVariation.set(variation);
  }

  public getArtFilesPositions() {
    if (!this.product()) return;

    const artFiles = this.product()?.art_files.map(({name}) => name);
    this.artFilePositions.set(artFiles ?? []);
  }
  handleQrSelections(selections: ISelectedArtFiles[]) {
    const artFiles = selections.reduce<IArtFiles>((acc, {position, qr}) => {
      return {
        ...acc,
        [position]: qr.id,
      };
    }, {});

    this.selectedArtFiles.set(artFiles);
  }

  public addToCart() {
    const product = this.product();
    const variation = this.productVariation() as IShopVariation;
    this.isAddingToCart.set(true);
    const cartPayload = {
      product_id: product?.id,
      product_variation_id: variation.id,
      qty: this.counterValue(),
      price: Number(variation.price),
      user_id: this.authStore.getSession()?.user.id,
      art_files: this.selectedArtFiles()!,
    } as ICartPayload;

    this.subs.add(
      this.cartService.addToCart(cartPayload).subscribe({
        next: ({success, message}: AddToCardResponse): void => {
          if (success) this.toastService.showToast(message, 'success');
        },
        error: (err: IError): void => {
          this.errorService.showErrors(err);
          this.isAddingToCart.set(false);
        },
        complete: (): void => {
          this.isAddingToCart.set(false);
        },
      })
    );
  }

  selectFirstAvailableSizeAndColor() {
    const grouped = this.groupedVariations();

    if (!grouped[0] || !grouped[0]?.colors) return;

    const {colors, size_name, variations} = grouped[0];
    this.selectedSize.set(size_name);

    const [firstColor] = colors;
    this.selectedColor.set(firstColor);

    const variation = variations.find(
      ({color_name}) => color_name === firstColor
    );
    if (variation) this.productVariation.set(variation);
  }

  groupedVariations = computed(() => {
    const variations = this.product()?.variations || [];

    const grouped = variations.reduce<SizeGroups>((acc, variation) => {
      const {size_name, color_name, id} = variation;

      if (!acc[size_name]) {
        acc[size_name] = {variations: [], colors: []};
      }

      if (!acc[size_name].colors.includes(color_name)) {
        acc[size_name].colors.push(color_name);
      }
      if (!acc[size_name].variations.some((v) => v.id === id)) {
        acc[size_name].variations.push(variation);
      }

      return acc;
    }, {});

    return Object.entries(grouped).map(([size_name, data]) => ({
      size_name,
      ...data,
    }));
  });

  selectSize(size: string) {
    this.selectedSize.set(size);
    const colors = this.getColorsForSelectedSize();

    if (!colors.includes(this.selectedColor()!)) this.selectedColor.set(null);
    else this.setProductVariation(this.selectedColor()!);
  }

  selectColor(color: string) {
    this.selectedColor.set(color);
    this.setProductVariation(color);
  }

  setProductVariation(color: string) {
    const group = this.groupedVariations().find(
      ({size_name}) => size_name === this.selectedSize()
    );
    if (!group) return;

    const variation = group.variations.find(
      ({color_name}) => color_name === color
    );
    if (variation) this.productVariation.set(variation);
  }

  getColorsForSelectedSize() {
    const variation = this.groupedVariations().find(
      ({size_name}) => size_name === this.selectedSize()
    );

    return variation?.colors || [];
  }

  private initializeSlick(): void {
    const $sliderThumbnail = $('.slider-thumbnail');
    const $sliderNav = $('.slider-nav');

    if ($sliderThumbnail?.length && $sliderNav?.length) {
      $sliderThumbnail.slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        fade: true,
        asNavFor: '.slider-nav',
      });
      $sliderNav.slick({
        slidesToShow: 4,
        slidesToScroll: 1,
        vertical: true,
        asNavFor: '.slider-thumbnail',
        arrows: false,
        dots: false,
        focusOnSelect: true,
        verticalSwiping: true,
        responsive: [
          {
            breakpoint: 580,
            settings: {
              slidesToShow: 3,
            },
          },
          {
            breakpoint: 380,
            settings: {
              slidesToShow: 3,
            },
          },
        ],
      });

      Fancybox.bind('[data-fancybox="gallery"]', {});
    } else {
      console.error('Slick slider elements not found');
    }
  }

  /**
   * Stores the recently viewed product for the current user.
   */
  private storeRecentlyViewedProduct(): void {
    const productId = this.productId();
    const userId = this.authStore.getSession()?.user?.id?.toString() || '';

    if (productId && userId) {
      this.subs.add(
        this.productService
          .storeRecentlyViewedProduct(productId, userId)
          .subscribe()
      );
    }
  }

  private getAllQrCodes(): void {
    this.subs.add(
      this.productService.getAllQrCodes().subscribe({
        next: (res: IQrCodeResponse): void => {
          this.qrCodes.set(res.data || []);
          this.qrCodeStore.setQrCodeDatum(this.qrCodes());
        },
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
