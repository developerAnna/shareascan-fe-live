export interface IShopResponse {
  success: boolean;
  data: IShopData;
  message: string;
}

export interface IShopData {
  categories: IShopDataCategory[];
  selected_category: string;
  products: IShopProduct;
  colorArr: string[];
  sizeArr: IShopSize[];
}

export interface IShopDataCategory {
  category_id: number;
  title: string;
}

export interface IShopProduct {
  current_page: number;
  data: IShopDatum[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: IShopLink[];
  next_page_url: null;
  path: string;
  per_page: number;
  prev_page_url: null;
  to: number;
  total: number;
}

export interface IShopDatum {
  id: number;
  title: string;
  status: number;
  thumbnail_url: string;
  sku: string;
  is_draft: number;
  img_url: string;
  variations: IShopVariation[];
  categories: IShopDatumCategory[];
  art_files: IShopArtFile[];
  max_price?: string;
  min_price?: string;
  isFavorite?: boolean;
}

export interface IShopArtFile {
  url: string;
  name: IShopName;
}

export enum IShopName {
  Back = 'Back',
  Flat = 'Flat',
  Front = 'Front',
  LeftChest = 'Left Chest',
}

export interface IShopDatumCategory {
  id: number;
  title: string;
  parent_id: number | null;
}

export interface IShopVariation {
  id: number;
  price: string;
  images: string[];
  size_name: IShopSize;
  color_name: string;
}

export enum IShopSize {
  L = 'L',
  M = 'M',
  OS = 'OS',
  OneSize = 'One Size',
  S = 'S',
  Size11Oz = '11oz',
  The11Oz = '11 oz',
  The1212 = '12″×12″',
  The1616 = '16″×16″',
  The18Oz = '18 oz',
  The25Oz = '25 oz',
  The2Xl = '2XL',
  The32Oz = '32 oz',
  The3Xl = '3XL',
  The4Xl = '4XL',
  The5Xl = '5XL',
  Xl = 'XL',
  Xs = 'XS',
}

export interface IShopLink {
  url: null | string;
  label: string;
  active: boolean;
}

export interface IShopProductPrice {
  success: boolean;
  data: IShopProductData;
  message: string;
}

export interface IShopProductData {
  max_price: string;
  min_price: string;
}
