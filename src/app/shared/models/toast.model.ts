export interface IToastInfo {
  body: string;
  type: 'success' | 'error' | 'warning';
  delay?: number;
  classname?: string;
}
