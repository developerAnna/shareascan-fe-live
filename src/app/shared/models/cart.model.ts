export interface ICartResponse {
  success: boolean;
  data: ICartData;
  message: string;
}

export interface IRemoveItemResponse {
  message: string;
}

export interface IUpdateResponse {
  message: string;
}

export interface ICartData {
  car_items: ICartItem[];
  cart_sub_total: number;
}

export interface ICartItem {
  id: number;
  user_id: number;
  product_id: number;
  qty: number;
  price: string;
  total: string | number;
  product_variation_id: number;
  product_title: string;
  variation_color: string;
  variation_size: string;
  art_files: ICartArtFile[];
  product_images: ICartProductImages;
  created_at: Date;
  updated_at: Date;
}

export interface ICartArtFile {
  cart_id: number;
  qrcode_id: number;
  qrcode_image: string;
  qrcode_image_url: string;
  position: string;
}

export interface ICartProductImages {
  image_url: string;
  variation_images: string[];
}

export interface ICartPayload {
  user_id: number;
  product_id: number;
  product_variation_id: number;
  qty: number;
  price: number;
  art_files: IArtFiles;
}

export interface ICardUpdatedPayload {
  cart_items: ICartUpdateItem[];
}

export interface ICartUpdateItem {
  cart_id: number;
  qty: number;
}

export interface IArtFiles {
  Front?: number;
  Back?: number;
  Flat?: number;
  'Left Chest'?: number;
}

export interface AddToCardResponse {
  success: boolean;
  data: Data;
  message: string;
}

export interface Data {
  id: number;
  user_id: number;
  product_id: number;
  qty: number;
  price: number;
  product_variation_id: number;
  product_title: string;
  variation_color: string;
  variation_size: string;
  art_files: IArtFiles;
}
