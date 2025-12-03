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


colorHexMap: { [key: string]: string } = {
  "White": "#FFFFFF",
  "Black": "#000000",
  "Berry": "#b23b7b",
  "Red": "#D30022",
  "True royal": "#1747A6",
  "Silver": "#C4C4C4",
  "Pink": "#F7A3B8",
  "Orange": "#F97316",
  "Light Blue": "#94afbe",
  "Military green": "#4B5320",
  "Teal": "#007F80",
  "Yellow": "#FFD800",
  "Mustard": "#D6A30F",
  "Mauve": "#C39BA4",
  "LILAC": "#C8A2C8",
  "Leaf": "#7BA05B",
  "Kelly": "#17813E",
  "Asphalt": "#3F3E3E",
  "Army": "#545B36",
  "Aqua": "#0084ae",
  "Ash": "#D2D2D2",
  "Olive": "#808000",
  "Oxblood Black": "#3B1C1C",
  "Steel Blue": "#4e7181",
  "Turquoise": "#0398d0",
  "Canvas Red": "#C8102E",
  "Ocean blue": "#5ca2c6",
  "Charity Pink": "#E1498E",
  "Deep Teal": "#005070",
  "Evergreen": "#05472C",
  "Soft Pink": "#F2C4CF",
  "Dark Olive": "#4b4839",
  "Poppy": "#E43A19",
  "Brown": "#352e2c",
  "Forest": "#1B3E1F",
  "Natural": "#EFE6D6",
  "Navy": "#0A1A4A",
  "Storm": "#8F9CAA",
  "Baby Blue": "#B7DAF1",
  "Team Purple": "#582A81",
  "Dark Grey": "#4B4B4B",
  "Gold": "#C99400",
  "BURNT ORANGE": "#CC5500",
  "Autumn": "#A84222",
  "Tan": "#D2B48C",
  "Coral": "#f85745",
  "Rust": "#A0431E",
  "Vintage White": "#F7F3E7",
  "Maroon": "#630019",
  "Cardinal": "#A3082C",
  "Mint": "#98FF98",
  "Sunset": "#e28971",
  "Maize Yellow": "#F2C94C",
  "Soft Cream": "#F9E7C5",
  "Vintage Black": "#1C1C1C",
  "Vintage Denim": "#445C7A",
  "Neon pink": "#FF4EC4",
  "Purple": "#481e68",
  "Charcoal": "#545255",
  "Ice Blue": "#D5EAF4",
  "Light Heather Grey": "#CACACA",
  "Grey Frost": "#BBC3CE",
  "Royal Frost": "#2D4EC8",
  "Lime Shock": "#9DFF00",
  "Heathered Navy": "#3A4769",
  "Heathered Charcoal": "#414141",
  "Heathered Bright Turquoise": "#00ADD4",
  "Classic Red": "#BF0A30",
  "New Navy": "#001F5B",
  "Dusty Lavender": "#C4BDCA",
  "Dusty Peach": "#E2BD8C",
  "Heathered Purple": "#6A4C8C",
  "Heathered Red": "#9E2A2F",
  "Heathered Royal": "#5A2D82",
  "Heathered Brown": "#6F4F1A",
  "Heathered Kelly Green": "#4C9F70",
  "Light Turquoise": "#40E0D0",
  "True Pink": "#FF007F",
  "Deep Royal": "#1F3A56",
  "Light Pink": "#FFB6C1",
  "Royal": "#054692",
  "Heliconia": "#F05698",
  "Sapphire": "#1b94b5",
  "Dark heather": "#494949",
  "Irish green": "#019F55",
  "Indigo Blue": "#5b6b8c",
  "Dark chocolate": "#3C1414",
  "Forest Green": "#228B22",
  "Carolina blue": "#56A0D3",
  "Safety Pink": "#ff7fb1",
  "Cherry Red": "#D2042D",
  "Garnet": "#9E1B32",
  "Safety Green": "#d1f523",
  "Sport grey": "#D3D3D3",
  "Antique Cherry Red": "#9E2A2F",
  "Sand": "#C2B280",
  "Kelly Green": "#4C9F70",
  "Charcoal Heather": "#4A4A48",
  "Lavender": "#E6E6FA",
  "Alpine Green": "#3B6A36",
  "Peach": "#FFDAB9",
  "Classic Navy": "#000080",
  "Safety Orange": "#FF5E00",
  "Safety Yellow": "#FFCD00",
  "Grey Heather": "#A8A8A8",
  "Gunmetal Heather": "#2A3439",
  "Bone": "#E3D9B6",
  "Sandstone": "#D6C29F",
  "Royal Heather": "#6A3D9A",
  "Army Heather": "#4B5320",
  "Classic Navy Heather": "#1D2D7A",
  "Light Yellow": "#FFFFE0",
  "Cement": "#B4B7B4",
  "Dusty Pink": "#D5A6BD",
  "Dusty Sage": "#A8B89F",
  "Saddle": "#8B4513",
  "Storm Blue": "#5A6E7F",
    "Smoke": "#738276",
  "Blue Aqua": "#00B8D9",
  "Kelly Green Heather": "#4E9F50",
  "Dark Green": "#006400",
  "Deep Navy": "#000033",
  "Scarlet Red": "#FF2400",
  "Camo": "#78866B",
  "Graphite": "#474A51",
  "Faded Blue": "#7DA1C4",
  "Heather Grey": "#B7B7B7",
  "Heather Graphite": "#5A5A5A",
  "Heather Denim": "#3A5F7D",
  "One color": "#000000",
  "Royal blue": "#4169E1",
  "Dark grey heather": "#595959",
  "Heather forest": "#2F5233",
  "Heather columbia blue": "#6CA0DC",
  "Athletic Heather": "#C8C8C8",
  "Heather deep teal": "#2A6F73",
  "Heather dust": "#E5D5C3",
  "Heather midnight navy": "#1E2A47",
  "Plum": "#8E4585",
  "Heather mint": "#B6E3C6",
  "Heather orange": "#F99B4A",
  "Heather orchid": "#ba909a",
  "Heather prism dusty blue": "#84a89b",
  "Heather prism lilac": "#c393a3",
  "Heather prism ice blue": "#C7E7F3",
  "Heather prism mint": "#BEE5C8",
  "Heather prism peach": "#F4C7A1",
  "Heather raspberry": "#C6547A",
  "Heather true royal": "#3A4EB4",
  "Black Heather": "#3A3A3A",
  "Heather Military Green": "#5A6B4E",
  "Heather Red": "#C45050",
  "HEATHER AQUA": "#0a87af",
  "HEATHER KELLY": "#5BA86A",
  "HEATHER TEAM PURPLE": "#6E4FA1",
  "Deep Heather": "#7A7A7A",
  "Heather Navy": "#2C3E63",
  "Heather Brown": "#6B4F33",
  "Heather Green": "#4C7A4F",
  "Heather Cardinal": "#9F2E32",
  "Heather Maroon": "#7A2E3A",
  "Heather Mauve": "#C7A19C",
  "Heather Olive": "#7D8B57",
  "Solid Black Blend": "#1A1A1A",
  "Solid White Blend": "#F5F5F5",
  "Heather Peach": "#F3C6B8",
  "Heather Mustard": "#D1A74A",
  "Heather Blue": "#6A8EBB",
  "Heather Clay": "#C08A6A",
  "Heather Dusty Blue": "#8BAAC7",
  "Heather Grass Green": "#6FAF5F",
  "Heather Ice Blue": "#C8E7F0",
  "Heather Sea Green": "#14aea6",
  "Heather Slate": "#6C7A89",
  "Heather Stone": "#C7B8A4",
  "Heather Storm": "#7A7F85",
  "Heather Sunset": "#F4A980",
  "Heather Tan": "#D3B58A",
  "Heather Yellow Gold": "#E4C24A",
  "Heather Prism Sunset": "#F7BFA5",
  "Heather Autumn": "#A35C3D",
  "Heather Lapis": "#4A63A8",
  "Heather Prism Blue": "#A8C6E8",
  "Heather Prism Natural": "#E8E1D3",
  "Heather Yellow": "#F4E27A",
  "Heather Cool Grey": "#9DA3A8",
  "Heather Cement": "#BEBEB0",
  "Heather Charity Pink": "#d8789c",
  "Heather Sand Dune": "#CBB499",
  "Heather Canvas Red": "#C24A4A"
};


// Returns hex value based on name
getHex(color: string): string {
  return this.colorHexMap[color] ?? '#9c9c9c'; // fallback if color not found
}


  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
