export interface ITestimonialResponse {
  success: boolean;
  data: ITestimonial[];
  message: string;
}

export interface ITestimonial {
  id: number;
  name: string;
  testimonial: string;
  status: number;
  created_at: string;
  updated_at: string;
}
