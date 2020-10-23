export interface ISubscription {
    startDate: string;
    endDate: string;
    productId: string;
    transactionId: string;
    cancelled: boolean;
    trialPeriod: boolean;
}

export interface IPurchase<T> extends ISubscription {
    latestReceipt: T;
}

export interface ISubscriptionState {
    subscription: ISubscription;
    active: boolean;
}

export interface ISubscriptionValidationResponse {
    success: boolean;
    isCancelled: boolean;
    isExpired: boolean;
}

export interface IAndroidReceiptPayload {
    orderId: string;
    packageName: string;
    productId: string;
    purchaseTime: number;
    purchaseState: number;
    purchaseToken: string;
    autoRenewing: boolean;
    acknowledged: boolean;
}
