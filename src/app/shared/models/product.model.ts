import {IShopDatum, IShopName} from './shop.model';

export interface IProductResponse {
  success: boolean;
  data: IProductData;
  message: string;
}

export interface IProductData {
  product: IShopDatum;
  variationArr: IProductVariationArr;
}

export interface IProductVariationArr {
  size_name: string[];
  color_name: string[];
}

export interface IRecentlyViewedResponse {
  success: boolean;
  message: string;
  data: IRecentlyViewedDatum[];
}

export interface IRecentlyViewedDatum {
  id: number;
  user_id: number;
  product_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface IRecentlyResponse {
  success: boolean;
  data: IRecentlyDatum[];
  message: string;
}

export interface IRecentlyDatum {
  id: number;
  product_id: number;
  price: IRecentlyPrice;
  product_title: string;
  product_images: IRecentlyProductImages;
  created_at: Date;
  updated_at: Date;
  isFavorite?: boolean;
}

export interface IRecentlyPrice {
  max_price: string;
  min_price: string;
}

export interface IRecentlyProductImages {
  image_url: string;
}

export interface IQrCodeResponse {
  success: boolean;
  data: IQrCodeDatum[];
  message: string;
}

export interface IQrCodeDatum {
  id: number;
  qr_content: null;
  qrcode_content_type: null;
  qr_image: string;
  qr_image_path: string;
  position: null;
  status: null;
  created_at: Date;
  updated_at: Date;
}

export interface ISelectedArtFiles {
  position: IShopName;
  qr: IQrCodeDatum;
}
