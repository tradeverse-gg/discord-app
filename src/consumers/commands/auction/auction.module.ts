import { DiscordProducerModule } from '#producers/discord/discord-producer.module';
import { Module } from '@nestjs/common';
import { AuctionQueueConsumer } from '../../../core/abstract/consumer/rmq/auctionQueue.consumer';
import { AuctionMessageService } from './auctionMessage.service';
import { MongoAuctionModule } from '#mongoose/auction/auction.module';
import { AuctionService } from '#producers/auction.service';

@Module({
	imports: [DiscordProducerModule, MongoAuctionModule],
	providers: [AuctionQueueConsumer, AuctionMessageService, AuctionService],
	exports: [AuctionQueueConsumer, AuctionMessageService],
})
export class AuctionModule {}
