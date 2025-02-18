import { Module } from '@nestjs/common';

import { AuctionMessageService } from './auctionMessage.service';

import { AuctionQueueConsumer } from '../../../core/abstract/consumer/rmq/auctionQueue.consumer';

import { MongoAuctionModule } from '#mongoose';
import { AuctionService } from '#producers/auction.service';
import { DiscordProducerModule } from '#producers/discord/discord-producer.module';

@Module({
	imports: [DiscordProducerModule, MongoAuctionModule],
	providers: [AuctionMessageService, AuctionQueueConsumer, AuctionService],
	exports: [AuctionMessageService, AuctionQueueConsumer],
})
export class AuctionModule {}
