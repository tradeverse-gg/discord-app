import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Inject, Injectable } from '@nestjs/common';

import { type DelayedNotificationArgs } from '#core/types/rmq';

@Injectable()
export class AuctionService {
	constructor(@Inject(AmqpConnection) private readonly connection: AmqpConnection) {}

	public sendDelayedMessage<T extends keyof DelayedNotificationArgs>(
		handlerToken: T,
		milliseconds: number,
		data: DelayedNotificationArgs[T],
	) {
		return this.connection.publish(
			'delayed_auction',
			'delayed-message',
			JSON.stringify({ ...(typeof data === 'string' ? { message: data } : { data }), handlerToken }),
			{ headers: { 'x-delay': milliseconds, persistent: true } },
		);
	}
}
