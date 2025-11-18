export interface IFAQResponse {
  success: boolean;
  data: IFAQ[];
  message: string;
}

export interface IFAQ {
  id: number;
  question: string;
  answer: string;
  status: number;
  created_at: Date;
  updated_at: Date;
}
