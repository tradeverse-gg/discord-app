import { type DelayedNotificationArgs } from '#core/types/rmq';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class AuctionService {
	constructor(@Inject(AmqpConnection) private readonly connection: AmqpConnection) {}

	public sendDelayedMessage<T extends keyof DelayedNotificationArgs>(
		handlerToken: T,
		milliseconds: number,
		data: DelayedNotificationArgs[T],
	) {
		return this.connection.publish(
			'AUCTION_EXCHANGE',
			'delayed-message',
			JSON.stringify({ ...(typeof data === 'string' ? { message: data } : { data }), handlerToken }),
			{
				headers: {
					'x-delay': milliseconds,
					persistent: true,
				},
			},
		);
	}
}
