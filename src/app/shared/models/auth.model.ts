import {UserDetails} from './account.model';

export interface IRegisterPayload {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  password: string | null;
  confirm_password: string | null | undefined;
}

export interface IRegisterResponse {
  token: string;
  user: IRegisterUser;
}

export interface IRegisterUser {
  name: string;
  email: string;
  updated_at: Date;
  created_at: Date;
  id: number;
}

export interface ILoginPayload {
  email: string | null | undefined;
  password: string | null | undefined;
}

export interface ILoginResponse {
  success: boolean;
  data: ILoginData;
  message: string;
}

export interface ILoginData {
  token: string;
  user: ILoginUser;
}

export interface ILoginUser {
  id: number;
  email: string;
  email_verified_at: string;
  created_at: string;
  updated_at: string;
  provider: string | null;
  provider_id: string | null;
  user_details?: UserDetails;
  first_name?: string;
  name?: string;
  last_name?: string;
}

export interface IPasswordResetResponse {
  success: boolean;
  data: string;
  message: string;
}
export interface PasswordValidationErrors {
  old_password?: string[];
  new_password?: string[];
  password_confirmation?: string[];
  [key: string]: string[] | undefined;
}

export interface IPasswordChangePayload {
  old_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export interface IPasswordChangeResponse {
  errors?: PasswordValidationErrors;
  message: string;
}
