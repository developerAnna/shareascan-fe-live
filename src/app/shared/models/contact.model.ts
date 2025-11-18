export interface IContactResponse {
  message: string;
  errors?: Errors;
}

export interface Errors {
  first_name: string[];
  last_name: string[];
  email: string[];
  phone_number: string[];
  message: string[];
}

export interface IContactPayload {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone_number: string | null;
  message: string | null;
}
