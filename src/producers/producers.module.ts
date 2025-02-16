import { Module } from '@nestjs/common';

import { DiscordProducerModule } from '#producers/discord/discord-producer.module';
import { CommonRabbitMQModule } from '#services/rabbitmq.module';
import { AuctionService } from './auction.service';

@Module({
	imports: [DiscordProducerModule, CommonRabbitMQModule.forRootAsync()],
	providers: [AuctionService],
	exports: [DiscordProducerModule, AuctionService],
})
export class ProducersModule {}
