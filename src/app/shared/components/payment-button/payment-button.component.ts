import {Component, output, input} from '@angular/core';

@Component({
  selector: 'app-payment-button',
  imports: [],
  templateUrl: './payment-button.component.html',
  styleUrl: './payment-button.component.css',
})
export class PaymentButtonComponent {
  public paymentType = input<string>('');
  public btnText = input<string>('Pay Now');
  public disabled = input<boolean>(false);
  public payment = output<void>();

  public onHandlePayment(): void {
    this.payment.emit();
  }
}
