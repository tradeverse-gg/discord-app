import { Delayed_Auction_Queue_Exchange, DelayedNotificationHandlers } from '#core/types/rmq';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuctionQueueConsumer {
	private readonly handlerMap:
		| Record<string, (args: { data?: any; handlerToken: string; message?: string }) => Promise<void>>
		| Record<string, undefined> = {};

	public constructor() {
		this.initializeHandlers();
	}

	@RabbitSubscribe({
		exchange: Delayed_Auction_Queue_Exchange,
		queue: Delayed_Auction_Queue_Exchange,
		routingKey: 'delayed-message',
		queueOptions: {
			arguments: {
				'x-delayed-type': 'direct',
			},
			bindQueueArguments: {
				'x-delayed-type': 'direct',
			},
		},
	})
	public async handleDelayedMessage(rawMessage: string) {
		try {
			const parsedMessage = JSON.parse(rawMessage) as { data?: any; handlerToken: string; message?: string };
			const { handlerToken, data } = parsedMessage;

			const handler = this.handlerMap[handlerToken];
			if (handler) await handler(data);
			else console.log(`No handler found for ${handlerToken}`);
		} catch (error) {
			console.error('AuctionQueueConsumer.handleDelayedMessage', error);
		}
	}

	private async handleAuction(data: any) {
		console.log('AuctionQueueConsumer.handleAuction', data);
	}

	private initializeHandlers() {
		this.handlerMap[DelayedNotificationHandlers.AUCTION_DELAYED_NOTIFICATION] = this.handleAuction.bind(this);
	}
}
