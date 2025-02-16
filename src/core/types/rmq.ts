export enum DelayedNotificationHandlers {
	AUCTION_DELAYED_NOTIFICATION = 'auction_delayed_notification',
}

export interface DelayedNotificationArgs {
	[DelayedNotificationHandlers.AUCTION_DELAYED_NOTIFICATION]: {
		auctionId: string;
		delay: number;
	};
}

export const Delayed_Auction_Queue_Exchange = 'AUCTION_EXCHANGE';
