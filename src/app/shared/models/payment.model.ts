export interface IPayPalPaymentResponse {
  status: boolean;
  approval_url: string;
}

export interface IStripePaymentResponse {
  ClientSecret: string;
}
