import {ILoginUser} from './auth.model';

export interface HotItemsResponse {
  data: HotItem[];
  message: string;
}

export interface OrdersResponse {
  data: Order[];
  message: string;
}

export interface UserResponse {
  success: boolean;
  data: {
    user: ILoginUser;
  };
  message: string;
}

export interface HotItem {
  id: number;
  product_id: number;
  price: Price;
  product_title: string;
  product_images: ProductImages;
  created_at: Date;
  updated_at: Date;
  isFavorite?: boolean;
}

export interface Price {
  max_price: string;
  min_price: string;
}

export interface ProductImages {
  image_url: string;
}

export interface Order {
  id: number;
  user_id: number;
  order_total: number;
  created_at: Date;
  updated_at: Date;
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  user_details: UserDetails;
}

export interface UserDetails {
  phone_number: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
}
export interface UserPayload {
  first_name: string;
  last_name: string;
  phone_number: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
}
