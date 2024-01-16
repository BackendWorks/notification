export interface DeleteNotificationResponse {
  status: boolean;
  message: string;
}

export interface NotificationGetManyResponse<T> {
  count: number;
  data: T[];
}

export interface NotificationSendResponse {
  acknowledged: boolean;
  status: string;
  transactionId: string;
}

export interface IAuthUser {
  id: string;
  role: string;
}
