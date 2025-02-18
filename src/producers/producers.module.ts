import { Module } from '@nestjs/common';

import { DiscordProducerModule } from '#producers/discord/discord-producer.module';
import { CommonRabbitMQModule } from '#services/rabbitmq.module';

import { AuctionService } from './auction.service';

@Module({
	imports: [CommonRabbitMQModule.forRootAsync(), DiscordProducerModule],
	providers: [AuctionService],
	exports: [AuctionService, DiscordProducerModule],
})
export class ProducersModule {}
