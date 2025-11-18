import {Component, inject, input, output, viewChild} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-checkbox-modal',
  imports: [TranslatePipe],
  templateUrl: './checkbox-modal.component.html',
  styleUrl: './checkbox-modal.component.css',
})
export class CheckboxModalComponent {
  private modalService = inject(NgbModal);

  public isActive = input<boolean>(false);
  public modalOptions = input({
    centered: true,
    size: 'lg',
  });

  public statusChange = output<boolean>();

  private deactivationModal = viewChild('deactivationModal');
  private testQrModal = viewChild('qrCodeModal');

  onCheckboxChange(event: MouseEvent) {
    event.preventDefault();
    const {checked} = event.target as HTMLInputElement;

    if (checked) {
      this.statusChange.emit(!this.isActive());
      return;
    }

    this.modalService
      .open(this.deactivationModal(), this.modalOptions())
      .result.then((result) => {
        if (result) this.statusChange.emit(!this.isActive());
      });
  }
  openQrModal() {
    this.modalService.open(this.testQrModal(), this.modalOptions());
  }
}
