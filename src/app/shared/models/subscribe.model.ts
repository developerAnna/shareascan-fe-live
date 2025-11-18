export interface ISubscribeResponse {
  success: boolean;
  data: ISubscribeData;
  message: string;
}

export interface ISubscribeData {
  id: number;
  email: string;
  created_at: Date;
  updated_at: Date;
}
