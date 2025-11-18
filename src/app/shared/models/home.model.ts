export interface IHomeCategory {
  success: boolean;
  data: IHomeDatum[];
  message: string;
}

export interface IHomeDatum {
  id: number;
  title: string;
  description: string;
  image_name: string;
  image_path: string;
  created_at: Date;
  updated_at: Date;
}
