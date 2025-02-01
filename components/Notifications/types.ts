export type NotificationSeverity = "WARNING" | "ERROR" | "SUCCESS" | "INFO";
export type NotificationType = "STOCK_ALERT" | "SYSTEM" | "ORDER" | "PAYMENT";

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    severity: NotificationSeverity;
    read: boolean;
    readAt: string | null;
    readBy: string | null;
    createdAt: string;
    updatedAt: string;
} 