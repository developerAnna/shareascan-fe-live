import {IShopDatum} from './shop.model';

export interface IWishlistResponse {
  success: boolean;
  data: IWishlistData;
  message: string;
}

export interface IWishlistData {
  user_id: string;
  product_id: string;
  updated_at: Date;
  created_at: Date;
  id: number;
}

export interface IUserWishlistResponse {
  success: boolean;
  data: IUserWishlistDatum[];
  message: string;
}

export interface IUserWishlistDatum {
  id: number;
  user_id: number;
  product_id: number;
  product_details: IShopDatum;
}

export interface IUserWishlistArtFile {
  url: string;
  name: string;
}

export interface IUserWishlistCategory {
  id: number;
  title: string;
  parent_id: number | null;
}

export interface IUserWishlistVariation {
  id: number;
  price: string;
  images: string[];
  size_name: string;
  color_name: string;
}

export interface IWishlistRemoveResponse {
  success: boolean;
  message: string;
}
