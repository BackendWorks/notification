export interface INotificationSuccessResponse {
  status: boolean;
  message: string;
}

export interface INotificationGetManyResponse<T> {
  count: number;
  data: T[];
}

export interface INotificationSendResponse {
  acknowledged: boolean;
  status: string;
  transactionId: string;
}

export interface IAuthUser {
  id: number;
  role: string;
  username: string;
  device_token: string;
}
