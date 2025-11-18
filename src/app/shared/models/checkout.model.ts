export interface ICheckoutResponse {
  success: boolean;
  data: ICheckoutData;
  message: string;
}

export interface ICheckoutData {
  products: ICheckoutProduct[];
  total: number;
}

export interface ICheckoutProduct {
  id: number;
  user_id: number;
  qty: number;
  price: string;
  total: string;
  product_id: number;
  product_title: string;
  product_variation_id: number;
  variation_color: string;
  variation_size: string;
  created_at: Date;
  updated_at: Date;
}
