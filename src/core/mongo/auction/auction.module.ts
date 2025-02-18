import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MongoAuctionService } from './auction.service';

import { AuctionSchema, AuctionSchemaName } from '#mongoose';

@Module({
	imports: [MongooseModule.forFeature([{ name: AuctionSchemaName, schema: AuctionSchema }], 'tradeverse')],
	exports: [
		MongoAuctionService,
		MongooseModule.forFeature([{ name: AuctionSchemaName, schema: AuctionSchema }], 'tradeverse'),
	],
	providers: [MongoAuctionService],
})
export class MongoAuctionModule {}
