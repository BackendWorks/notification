export interface INotificationPayload {
  content: string;
  type: keyof typeof NotificationType;
  payload?: any;
  userId: number;
}

export interface GetResponse<T> {
  count: number;
  data: T[];
}

export enum NotificationType {
  WELCOME_NOTIFICATION = 'welcome_notification',
}
