import {
  Component,
  inject,
  input,
  viewChild,
  signal,
  computed,
  OnInit,
  output,
} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {IShopName} from '../../models/shop.model';
import {IQrCodeDatum, ISelectedArtFiles} from '../../models/product.model';
import {ToastService} from '../../../core/services/toast.service';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-customize-product-modal',
  imports: [TranslatePipe],
  templateUrl: './customize-product-modal.component.html',
  styleUrl: './customize-product-modal.component.css',
})
export class CustomizeProductModalComponent implements OnInit {
  private modalService = inject(NgbModal);

  public modalOptions = input({
    centered: true,
    size: 'xl',
  });

  private customizeModal = viewChild('customizeModal');
  private alertService = inject(ToastService);

  public artPositions = input<IShopName[]>([]);
  public qrCodes = input<IQrCodeDatum[]>([]);
  public handleQrSelections = output<ISelectedArtFiles[]>();

  public selectedPosition = signal<IShopName | null>(null);
  public selectedQr = signal<IQrCodeDatum | null>(null);
  public selectedQrs = signal<Map<IShopName, IQrCodeDatum>>(new Map());
  public currentPage = signal(1);
  public pageSize = 15;

  ngOnInit(): void {
    const [firstPosition] = this.artPositions();
    const [firstQRCode] = this.qrCodes();
    this.selectPosition(firstPosition);
    this.selectQr(firstQRCode);
  }

  paginatedQrs = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.qrCodes().slice(start, start + this.pageSize);
  });

  totalPages = computed(() => Math.ceil(this.qrCodes().length / this.pageSize));

  isSelectionComplete = computed(() => {
    return this.artPositions().every((position) =>
      this.selectedQrs().has(position)
    );
  });

  get selectionsArray(): ISelectedArtFiles[] {
    const selectedQrsArray = [...this.selectedQrs()];
    return selectedQrsArray.map(([position, qr]) => ({
      position,
      qr,
    }));
  }

  selectPosition(position: IShopName) {
    this.selectedPosition.set(position);

    if (this.selectedQrs().has(position)) {
      const qr = this.selectedQrs().get(position);
      this.selectedQr.set(qr!);
      return;
    }

    const [firstQRCode] = this.qrCodes();
    this.selectedQrs.update((prev) => new Map(prev).set(position, firstQRCode));
    this.selectedQr.set(firstQRCode);
  }

  selectQr(qr: IQrCodeDatum) {
    this.selectedQr.set(qr);
    const position = this.selectedPosition();

    if (position)
      this.selectedQrs.update((prev) => new Map(prev).set(position, qr));
  }

  resetSelections() {
    this.selectedQrs.set(new Map());
  }

  saveSelections() {
    if (!this.isSelectionComplete())
      return this.alertService.showToast(
        'To continue, you must select a QR code at each position',
        'warning'
      );
    this.modalService.dismissAll();
    this.handleQrSelections.emit(this.selectionsArray);
  }

  getPagesArray(): number[] {
    return Array(this.totalPages())
      .fill(0)
      .map((_, i) => i + 1);
  }

  openCustomizeModal() {
    this.modalService.open(this.customizeModal(), this.modalOptions());
  }
}
