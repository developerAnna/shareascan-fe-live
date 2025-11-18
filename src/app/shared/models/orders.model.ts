export interface IOrdersResponse {
  data: IOrdersDatum[];
  message: string;
}

export interface IOrdersDatum {
  id: number;
  user_id: number;
  order_total: number;
  created_at: Date;
  updated_at: Date;
}

export interface IOrderPayload {
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  address_line_1: string;
  address_line_2: string;
  country_code: string;
  state: string;
  city: string;
  zipcode: string;
  note: string;
}

export interface ICreateOrderResponse {
  success: boolean;
  data: IOrderDatum[];
  message: string;
}

export interface IOrderDatum {
  id: number;
  user_id: number;
  order_total: number;
  order_items: IOrderItem[];
  shipping_address: IOrderShippingAddress;
  note: string;
  created_at: Date;
  updated_at: Date;
}

export interface IOrderItem {
  id: number;
  product_id: number;
  product_title: string;
  product_variation_id: number;
  variation_color: string;
  variation_size: string;
  qty: number;
  price: string;
}

export interface IOrderShippingAddress {
  id: number;
  order_id: number;
  address_type: number;
  first_name: string;
  last_name: string;
  email: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  phone: string;
  country_code: string;
  zip: string;
  created_at: Date;
  updated_at: Date;
}
