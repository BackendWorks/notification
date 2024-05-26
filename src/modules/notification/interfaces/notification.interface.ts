export interface INotificationSendResponse {
  acknowledged: boolean;
  status: string;
  transactionId: string;
}

export interface IAuthUser {
  id: number;
  role: string;
  device_token: string;
}
