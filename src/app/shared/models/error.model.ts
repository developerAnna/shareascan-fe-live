export interface IError {
  error: IErrorInfo;
  message: string;
  name: string;
  ok: boolean;
  status: number;
  statusText: string;
  url: string;
}

export interface IErrorInfo {
  data: any;
  message: string;
  success: boolean;
}
