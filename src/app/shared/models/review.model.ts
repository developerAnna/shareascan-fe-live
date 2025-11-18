export interface IReviewResponse {
  status: string;
  message: string;
  data: IReviewDatum[];
}

export interface IReviewDatum {
  id: number;
  product_id: number;
  user_id: number;
  ratings: number;
  content: string;
  user_name: string;
  status: number;
  created_at: Date;
  updated_at: Date;
  images: IReviewImage[];
}

export interface IReviewImage {
  filename: string;
  file_path: string;
}

export interface IReviewPayload {
  product_id: number;
  user_id: number | undefined;
  rating: number;
  content: string;
  image: string[];
}

export interface IAddReviewResponse {
  success: boolean;
  data: IAddReviewDatum[];
  message: string;
}

export interface IAddReviewDatum {
  id: number;
  product_id: number;
  user_id: number;
  ratings: number;
  content: string;
  user_name: string;
  images: any[];
  created_at: Date;
  updated_at: Date;
}
