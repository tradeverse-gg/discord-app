import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuctionSchema, AuctionSchemaName } from '#mongoose/schemas/auctions.schema';

import { MongoAuctionService } from './auction.service';

@Module({
	imports: [MongooseModule.forFeature([{ name: AuctionSchemaName, schema: AuctionSchema }], 'tradeverse')],
	exports: [
		MongoAuctionService,
		MongooseModule.forFeature([{ name: AuctionSchemaName, schema: AuctionSchema }], 'tradeverse'),
	],
	providers: [MongoAuctionService],
})
export class MongoAuctionModule {}
